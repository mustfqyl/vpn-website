# Enterprise-Grade Pasarguard Senkronizasyon Mimarisi

## 🏢 Kurumsal Yaklaşım: Event-Driven Architecture

Bu dokümanda, **en doğru ve kurumsal çözüm** olan **Event-Driven Architecture** ile Pasarguard senkronizasyonu açıklanmaktadır.

---

## 📌 Temel Prensipler

### 1. **Single Source of Truth (SSOT)**
- **Veritabanı** = Sistem içindeki kayıt (source of truth)
- **Pasarguard Panel** = Operasyonel sistem (execution layer)
- Değişiklikler her zaman DB'den başlar veya webhook ile senkronize edilir

### 2. **Event-Driven Pattern**
- Pasarguard'dan gelen her event (grup değişikliği) bir message olarak işlenir
- Asynchronous processing ile sistem decoupled kalır
- Audit trail otomatik oluşturulur

### 3. **Idempotency**
- Aynı event birden fazla işlenirse, sonuç değişmez
- Event ID'si ile duplicate detection

### 4. **Eventual Consistency**
- DB ve Panel arasında kısa süreli tutarsızlık kabul edilir
- Webhook + Polling ile tutarlılık sağlanır

---

## 🏗️ Sistem Mimarisi

```
┌─────────────────────────────────────────────────────────────────┐
│                     PASARGUARD PANEL                            │
│                  (Admin Grup Değişikliği)                       │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ Webhook Event
                         │ (user.group_changed)
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│              WEBHOOK RECEIVER ENDPOINT                          │
│         POST /api/webhooks/pasarguard/events                    │
│                                                                 │
│  1. HMAC-SHA256 Signature Doğrulama                            │
│  2. Event Validation (Schema)                                  │
│  3. Idempotency Check (Event ID)                               │
│  4. Message Queue'ya Gönder                                    │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│              MESSAGE QUEUE (Redis/Bull)                         │
│                                                                 │
│  - Event Persistence                                           │
│  - Retry Logic                                                 │
│  - Dead Letter Queue                                           │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│           EVENT PROCESSOR (Background Job)                      │
│                                                                 │
│  1. Event'i Queue'dan Al                                       │
│  2. Kullanıcı Bilgisini Getir                                  │
│  3. Panel Grubu vs DB Rolü Karşılaştır                         │
│  4. Senkronizasyon Kurallarını Uygula                          │
│  5. DB'yi Güncelle                                             │
│  6. Audit Log Oluştur                                          │
│  7. Event'i Completed olarak İşaretle                          │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                   DATABASE (Prisma)                             │
│                                                                 │
│  - User.role Güncelleme                                        │
│  - Subscription Senkronizasyonu                                │
│  - Audit Log Kaydı                                             │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔧 Implementasyon Detayları

### 1. **Event Model & Types**

```typescript
// src/lib/events/types.ts

export enum EventType {
  USER_GROUP_CHANGED = 'user.group_changed',
  USER_UPDATED = 'user.updated',
  USER_DELETED = 'user.deleted',
  USER_CREATED = 'user.created'
}

export interface WebhookEvent {
  id: string;                    // Unique event ID (idempotency)
  type: EventType;
  timestamp: number;             // Unix timestamp
  source: 'pasarguard';
  data: {
    userId: string;              // Pasarguard username
    previousGroup?: string;
    newGroup?: string;
    [key: string]: any;
  };
  signature: string;             // HMAC-SHA256
}

export interface ProcessedEvent {
  eventId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  processedAt?: Date;
  error?: string;
  result?: {
    userUpdated: boolean;
    previousRole?: string;
    newRole?: string;
  };
}
```

### 2. **Webhook Receiver Endpoint**

```typescript
// src/app/api/webhooks/pasarguard/events/route.ts

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { eventQueue } from '@/lib/queue/event-queue';
import { WebhookEvent, EventType } from '@/lib/events/types';

const WEBHOOK_SECRET = process.env.PASARGUARD_WEBHOOK_SECRET || '';

export async function POST(request: NextRequest) {
  try {
    // 1. HMAC Signature Doğrulama
    const signature = request.headers.get('x-pasarguard-signature');
    if (!signature) {
      logger.warn('Webhook request missing signature');
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 401 }
      );
    }

    const body = await request.text();
    const expectedSignature = crypto
      .createHmac('sha256', WEBHOOK_SECRET)
      .update(body)
      .digest('hex');

    if (signature !== expectedSignature) {
      logger.warn({ signature, expectedSignature }, 'Invalid webhook signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    // 2. Event Parsing & Validation
    const event: WebhookEvent = JSON.parse(body);

    if (!event.id || !event.type || !event.data) {
      logger.warn({ event }, 'Invalid event structure');
      return NextResponse.json(
        { error: 'Invalid event structure' },
        { status: 400 }
      );
    }

    // 3. Idempotency Check
    const existingEvent = await prisma.webhookEvent.findUnique({
      where: { eventId: event.id }
    });

    if (existingEvent) {
      logger.info({ eventId: event.id }, 'Duplicate event received, returning cached response');
      return NextResponse.json(
        { success: true, cached: true, eventId: event.id },
        { status: 200 }
      );
    }

    // 4. Event'i Database'e Kaydet
    const savedEvent = await prisma.webhookEvent.create({
      data: {
        eventId: event.id,
        type: event.type,
        source: event.source,
        payload: event.data,
        status: 'pending',
        receivedAt: new Date(event.timestamp * 1000)
      }
    });

    // 5. Event'i Queue'ya Gönder
    await eventQueue.add(
      'process-webhook-event',
      {
        eventId: event.id,
        type: event.type,
        data: event.data
      },
      {
        jobId: event.id,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000
        },
        removeOnComplete: false
      }
    );

    logger.info(
      { eventId: event.id, type: event.type, userId: event.data.userId },
      'Webhook event received and queued'
    );

    return NextResponse.json(
      { success: true, eventId: event.id },
      { status: 202 }
    );

  } catch (error) {
    logger.error({ error }, 'Webhook processing failed');
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### 3. **Event Queue Setup**

```typescript
// src/lib/queue/event-queue.ts

import Queue from 'bull';
import Redis from 'ioredis';
import { logger } from '@/lib/logger';
import { EventProcessor } from './event-processor';

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD
});

export const eventQueue = new Queue('webhook-events', {
  redis,
  defaultJobOptions: {
    removeOnComplete: {
      age: 3600 // 1 saat sonra completed jobs'ı sil
    },
    removeOnFail: false // Failed jobs'ı debug için tut
  }
});

// Event Processor'ı Başlat
eventQueue.process('process-webhook-event', 5, async (job) => {
  const { eventId, type, data } = job.data;
  
  logger.info(
    { eventId, type, jobId: job.id },
    'Processing webhook event'
  );

  try {
    const result = await EventProcessor.process(type, data);
    
    logger.info(
      { eventId, result },
      'Event processed successfully'
    );

    return result;
  } catch (error) {
    logger.error(
      { eventId, error, attempt: job.attemptsMade },
      'Event processing failed'
    );
    throw error;
  }
});

// Event Listeners
eventQueue.on('completed', (job) => {
  logger.info({ jobId: job.id }, 'Job completed');
});

eventQueue.on('failed', (job, err) => {
  logger.error(
    { jobId: job.id, error: err.message, attempts: job.attemptsMade },
    'Job failed after retries'
  );
});

eventQueue.on('error', (error) => {
  logger.error({ error }, 'Queue error');
});
```

### 4. **Event Processor**

```typescript
// src/lib/queue/event-processor.ts

import { prisma } from '@/lib/prisma';
import { vpnProvider } from '@/lib/vpn/factory';
import { logger } from '@/lib/logger';
import { EventType } from '@/lib/events/types';

export class EventProcessor {
  static async process(type: EventType, data: any) {
    switch (type) {
      case EventType.USER_GROUP_CHANGED:
        return await this.handleUserGroupChanged(data);
      case EventType.USER_UPDATED:
        return await this.handleUserUpdated(data);
      case EventType.USER_DELETED:
        return await this.handleUserDeleted(data);
      default:
        logger.warn({ type }, 'Unknown event type');
        return { processed: false };
    }
  }

  private static async handleUserGroupChanged(data: any) {
    const { userId: vpnUserId, newGroup, previousGroup } = data;

    logger.info(
      { vpnUserId, previousGroup, newGroup },
      'Processing user group change'
    );

    try {
      // 1. Pasarguard'dan Kullanıcı Bilgisini Getir
      const pgUser = await vpnProvider.getUser(vpnUserId);
      if (!pgUser) {
        logger.warn({ vpnUserId }, 'User not found in panel');
        return { processed: false, error: 'User not found in panel' };
      }

      // 2. Veritabanında Kullanıcıyı Bul
      const dbUser = await prisma.user.findUnique({
        where: { vpnUserId }
      });

      if (!dbUser) {
        logger.warn({ vpnUserId }, 'User not found in database');
        return { processed: false, error: 'User not found in database' };
      }

      // 3. Senkronizasyon Kurallarını Uygula
      const panelGroup = (pgUser.group || '').trim().toLowerCase();
      const currentDbRole = (dbUser as any).role;
      const newDbRole = this.mapGroupToRole(panelGroup);

      if (currentDbRole === newDbRole) {
        logger.info(
          { vpnUserId, role: currentDbRole },
          'Roles already in sync'
        );
        return {
          processed: true,
          synced: false,
          reason: 'Already in sync'
        };
      }

      // 4. Veritabanını Güncelle
      const updatedUser = await prisma.user.update({
        where: { id: dbUser.id },
        data: {
          role: newDbRole,
          updatedAt: new Date()
        }
      });

      // 5. Audit Log Oluştur
      await this.createAuditLog({
        userId: dbUser.id,
        action: 'ROLE_SYNC_FROM_PANEL',
        previousValue: currentDbRole,
        newValue: newDbRole,
        source: 'webhook',
        metadata: {
          panelGroup,
          vpnUserId
        }
      });

      logger.info(
        { vpnUserId, previousRole: currentDbRole, newRole: newDbRole },
        'User role updated from panel'
      );

      return {
        processed: true,
        synced: true,
        userUpdated: true,
        previousRole: currentDbRole,
        newRole: newDbRole
      };

    } catch (error) {
      logger.error(
        { vpnUserId, error },
        'Failed to process user group change'
      );
      throw error;
    }
  }

  private static async handleUserUpdated(data: any) {
    // Benzer logic
    return { processed: true };
  }

  private static async handleUserDeleted(data: any) {
    // Benzer logic
    return { processed: true };
  }

  private static mapGroupToRole(group: string): 'TRIAL' | 'PREMIUM' {
    const normalizedGroup = group.toLowerCase();
    return normalizedGroup === 'premium' ? 'PREMIUM' : 'TRIAL';
  }

  private static async createAuditLog(data: {
    userId: string;
    action: string;
    previousValue: string;
    newValue: string;
    source: string;
    metadata?: any;
  }) {
    try {
      await prisma.auditLog.create({
        data: {
          userId: data.userId,
          action: data.action,
          previousValue: data.previousValue,
          newValue: data.newValue,
          source: data.source,
          metadata: data.metadata,
          createdAt: new Date()
        }
      });
    } catch (error) {
      logger.error({ error }, 'Failed to create audit log');
    }
  }
}
```

### 5. **Database Schema Güncellemeleri**

```prisma
// prisma/schema.prisma

model WebhookEvent {
  id        String   @id @default(uuid())
  eventId   String   @unique  // Pasarguard event ID
  type      String   // EventType enum
  source    String   // 'pasarguard'
  payload   Json
  status    String   @default("pending") // pending, processing, completed, failed
  error     String?
  receivedAt DateTime
  processedAt DateTime?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([status, createdAt])
  @@index([eventId])
  @@map("webhook_events")
}

model AuditLog {
  id            String   @id @default(uuid())
  userId        String
  action        String   // ROLE_SYNC_FROM_PANEL, ROLE_SYNC_FROM_DB, etc.
  previousValue String?
  newValue      String?
  source        String   // 'webhook', 'cron', 'manual', etc.
  metadata      Json?
  createdAt     DateTime @default(now())

  @@index([userId, createdAt])
  @@index([action, createdAt])
  @@map("audit_logs")
}
```

---

## 🔐 Güvenlik Mimarisi

### 1. **Webhook Signature Doğrulama**
```
HMAC-SHA256(body, PASARGUARD_WEBHOOK_SECRET) = x-pasarguard-signature
```

### 2. **Idempotency**
- Event ID'si ile duplicate detection
- Database'de `WebhookEvent.eventId` unique constraint

### 3. **Rate Limiting**
```typescript
// Middleware
import { Ratelimit } from '@upstash/ratelimit';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(100, '1 m'),
  analytics: true,
  prefix: 'webhook:pasarguard'
});
```

### 4. **IP Whitelist (Opsiyonel)**
```typescript
const PASARGUARD_IPS = process.env.PASARGUARD_IPS?.split(',') || [];

if (PASARGUARD_IPS.length > 0) {
  const clientIp = request.headers.get('x-forwarded-for') || '';
  if (!PASARGUARD_IPS.includes(clientIp)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
}
```

---

## 📊 Senkronizasyon Kuralları

| Panel Grubu | DB Rolü | Durum | Aksiyon |
|-------------|---------|-------|--------|
| Premium | TRIAL | Panel upgrade | DB → PREMIUM |
| Trial | PREMIUM | Panel downgrade | DB → TRIAL |
| (boş) | PREMIUM | Eksik grup | Panel → Premium (push) |
| (boş) | TRIAL | Eksik grup | Panel → Trial (push) |

---

## 🔄 Fallback Mekanizması: Cron Job

Webhook başarısız olursa, periyodik senkronizasyon devreye girer:

```typescript
// src/app/api/cron/sync-user-roles/route.ts

export async function POST(request: NextRequest) {
  const secret = request.headers.get('authorization');
  if (secret !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const users = await prisma.user.findMany({
    where: { vpnUserId: { not: null } }
  });

  let syncedCount = 0;
  for (const user of users) {
    const pgUser = await vpnProvider.getUser((user as any).vpnUserId);
    if (pgUser) {
      const panelGroup = (pgUser.group || '').toLowerCase();
      const dbRole = (user as any).role;
      const newRole = panelGroup === 'premium' ? 'PREMIUM' : 'TRIAL';

      if (dbRole !== newRole) {
        await prisma.user.update({
          where: { id: user.id },
          data: { role: newRole }
        });
        syncedCount++;
      }
    }
  }

  return NextResponse.json({
    success: true,
    syncedCount,
    totalUsers: users.length
  });
}
```

---

## 📈 Monitoring & Observability

### 1. **Metrics**
- Webhook events received/processed
- Event processing latency
- Failed events count
- Sync success rate

### 2. **Logging**
- Structured logging (JSON)
- Event ID tracking
- Audit trail

### 3. **Alerting**
- Failed events > 5 in 1 hour
- Processing latency > 5 seconds
- Queue size > 1000

---

## 🚀 Deployment Checklist

- [ ] Redis instance kurulumu
- [ ] Environment variables ayarlanması
  - `PASARGUARD_WEBHOOK_SECRET`
  - `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`
  - `CRON_SECRET`
- [ ] Database migrations (WebhookEvent, AuditLog)
- [ ] Webhook endpoint test
- [ ] Pasarguard webhook konfigürasyonu
- [ ] Cron job scheduling
- [ ] Monitoring & alerting setup
- [ ] Load testing

---

## 📝 Özet

**En Kurumsal Çözüm: Event-Driven Architecture**

✅ **Avantajlar:**
- Gerçek zamanlı senkronizasyon
- Asynchronous processing (non-blocking)
- Idempotent (duplicate-safe)
- Audit trail otomatik
- Scalable (queue-based)
- Fallback mekanizması (cron)
- Enterprise-grade monitoring

✅ **Best Practices:**
- HMAC signature doğrulama
- Idempotency key
- Retry logic
- Dead letter queue
- Structured logging
- Event sourcing

✅ **Reliability:**
- 99.9% uptime hedefi
- Automatic retries
- Fallback polling
- Comprehensive error handling
