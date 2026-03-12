# Pasarguard Grup Değişikliği → Veritabanı Rol Senkronizasyonu Planı

## 🔍 Sorun Analizi

### Mevcut Durum
- **Veritabanı**: `User` modeli `role` alanı (TRIAL/PREMIUM)
- **Pasarguard Paneli**: Kullanıcılar `groups` alanı ile yönetiliyor (Trial/Premium)
- **Senkronizasyon**: Sadece **tek yönlü** (DB → Panel) çalışıyor
  - Ödeme yapıldığında: DB'de PREMIUM → Panel'de Premium grubu atanıyor
  - Kullanıcı silindiğinde: DB'den silinirse Panel'den de silinir

### Sorun
- **Pasarguard panelinde manuel grup değişikliği** yapıldığında (admin tarafından)
- **Veritabanındaki rol otomatik olarak güncellenmez**
- Sonuç: DB ve Panel arasında **veri tutarsızlığı** oluşur

### Örnek Senaryo
1. Kullanıcı Trial ile kaydolur → DB: TRIAL, Panel: Trial grubu
2. Admin Pasarguard'da kullanıcıyı Premium grubuna taşır
3. **Sorun**: DB hala TRIAL gösteriyor, Panel Premium gösteriyor
4. Kullanıcı panele giriş yaptığında, senkronizasyon eski DB verisini Panel'e geri yazabilir

---

## 🎯 Çözüm Mimarisi

### Seçenek 1: Polling (Basit, Güvenilir)
**Avantajlar:**
- Webhook kurulumuna gerek yok
- Mevcut `VpnSyncService.reconcileUser()` yapısını kullanır
- Pasarguard API'ye bağlı değil

**Dezavantajlar:**
- Gerçek zamanlı değil (gecikme olabilir)
- API çağrıları artar

**Implementasyon:**
- Her kullanıcı girişinde `reconcileUser()` çağrılır (zaten yapılıyor)
- Ek: Periyodik background job (cron) eklenebilir

### Seçenek 2: Webhook (Gerçek Zamanlı)
**Avantajlar:**
- Anında senkronizasyon
- Pasarguard'dan event alır

**Dezavantajlar:**
- Pasarguard webhook desteği gerekli
- Ek endpoint ve güvenlik gerekli

---

## ✅ Önerilen Çözüm: Hibrit Yaklaşım

### 1. **Mevcut Polling Mekanizmasını Güçlendir**
   - `VpnSyncService.reconcileUser()` zaten grup/rol senkronizasyonu yapıyor
   - **Sorun**: Sadece kullanıcı girişinde çalışıyor
   - **Çözüm**: Periyodik background job ekle

### 2. **Cron Job Ekle** (Her 5 dakikada bir)
   - Tüm aktif kullanıcıları kontrol et
   - Panel grubu ≠ DB rolü ise güncelle

### 3. **Webhook Endpoint Ekle** (İsteğe bağlı)
   - Pasarguard webhook desteği varsa, anında senkronizasyon
   - Fallback: Polling devam eder

---

## 📋 Implementasyon Adımları

### Adım 1: Cron Job Endpoint Oluştur
**Dosya**: `src/app/api/cron/sync-user-roles/route.ts`

```typescript
// POST /api/cron/sync-user-roles
// Tüm kullanıcıları kontrol et ve rol senkronizasyonu yap
// Güvenlik: CRON_SECRET header kontrolü
```

**İş Akışı:**
1. Veritabanındaki tüm kullanıcıları getir (vpnUserId ile)
2. Her kullanıcı için `VpnSyncService.reconcileUser()` çağır
3. Değişiklikleri logla

### Adım 2: Webhook Endpoint Oluştur (Opsiyonel)
**Dosya**: `src/app/api/webhooks/pasarguard/route.ts`

```typescript
// POST /api/webhooks/pasarguard
// Pasarguard'dan grup değişikliği event'i al
// Veritabanını güncelle
```

**Event Türleri:**
- `user.group_changed`: Kullanıcı grubu değişti
- `user.updated`: Kullanıcı güncellendi

### Adım 3: Mevcut Senkronizasyon Logicini Gözden Geçir
**Dosya**: `src/lib/vpn/sync.ts` (satır 32-83)

**Mevcut Logic:**
- ✅ Panel Premium, DB Trial → DB'yi Premium yap
- ✅ Panel Trial, DB Premium (eski) → DB'yi Trial yap
- ✅ Panel boş grup → DB'den push et

**Gerekli Değişiklik:**
- Grup karşılaştırması case-insensitive (zaten yapılıyor)
- Timestamp kontrolü (5 dakika) → ödeme koruması

---

## 🔧 Teknik Detaylar

### Senkronizasyon Kuralları (Mevcut + Yeni)

| Panel Grubu | DB Rolü | Durum | Aksiyon |
|-------------|---------|-------|--------|
| Premium | TRIAL | Panel upgrade | DB → PREMIUM |
| Trial | PREMIUM | DB yeni (< 5 dk) | Panel → Premium |
| Trial | PREMIUM | DB eski (> 5 dk) | DB → TRIAL |
| (boş) | PREMIUM | Eksik grup | Panel → Premium |
| (boş) | TRIAL | Eksik grup | Panel → Trial |

### Cron Job Zamanlaması
- **Interval**: Her 5 dakika
- **Timeout**: 30 saniye
- **Retry**: Başarısız olursa sonraki çalışmada tekrar

### Webhook Güvenliği
- HMAC-SHA256 signature doğrulama
- IP whitelist (Pasarguard server IP'si)
- Rate limiting

---

## 📊 Veri Akışı Diyagramı

```
┌─────────────────────────────────────────────────────────────┐
│                    Kullanıcı Girişi                         │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
        ┌────────────────────────────┐
        │ VpnSyncService.reconcileUser()
        │ (Mevcut - Her girişte)
        └────────────┬───────────────┘
                     │
        ┌────────────▼───────────────┐
        │ Panel Grubu vs DB Rolü     │
        │ Karşılaştır                │
        └────────────┬───────────────┘
                     │
        ┌────────────▼───────────────┐
        │ Uyuşmazlık Var mı?         │
        └────┬──────────────┬────────┘
             │ EVET         │ HAYIR
             ▼              ▼
        Güncelle      Devam et
        
┌─────────────────────────────────────────────────────────────┐
│              Cron Job (Her 5 dakika)                        │
│         /api/cron/sync-user-roles                          │
└────────────────────┬────────────────────────────────────────┘
                     │
        ┌────────────▼───────────────┐
        │ Tüm Kullanıcıları Getir    │
        └────────────┬───────────────┘
                     │
        ┌────────────▼───────────────┐
        │ Her Kullanıcı için         │
        │ reconcileUser() Çağır       │
        └────────────┬───────────────┘
                     │
        ┌────────────▼───────────────┐
        │ Değişiklikleri Logla       │
        └────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│         Webhook (Pasarguard Event)                          │
│      /api/webhooks/pasarguard                              │
└────────────────────┬────────────────────────────────────────┘
                     │
        ┌────────────▼───────────────┐
        │ Event Doğrula (HMAC)       │
        └────────────┬───────────────┘
                     │
        ┌────────────▼───────────────┐
        │ Kullanıcı Grubu Değişti mi?│
        └────┬──────────────┬────────┘
             │ EVET         │ HAYIR
             ▼              ▼
        DB Güncelle    Yoksay
```

---

## 🚀 Implementasyon Sırası

1. **Cron Job Endpoint** (Basit, Hemen Etkili)
   - `src/app/api/cron/sync-user-roles/route.ts` oluştur
   - Mevcut `reconcileUser()` kullan
   - Hosting'de cron job ayarla

2. **Webhook Endpoint** (Opsiyonel, Gerçek Zamanlı)
   - `src/app/api/webhooks/pasarguard/route.ts` oluştur
   - Pasarguard webhook konfigürasyonu yap

3. **Test & Monitoring**
   - Logları kontrol et
   - Senkronizasyon başarısını doğrula

---

## 🔐 Güvenlik Notları

- ✅ Cron endpoint'i `CRON_SECRET` ile korunmalı
- ✅ Webhook HMAC signature doğrulaması gerekli
- ✅ Rate limiting eklenebilir
- ✅ Loglama detaylı olmalı (audit trail)

---

## 📝 Özet

**Sorun**: Pasarguard'da manuel grup değişikliği → DB rol güncellenmez

**Çözüm**: 
1. Cron job ile periyodik senkronizasyon (5 dakika)
2. Webhook ile gerçek zamanlı senkronizasyon (opsiyonel)
3. Mevcut `reconcileUser()` logic'i kullan

**Fayda**:
- ✅ DB ve Panel senkronize kalır
- ✅ Admin manuel değişiklikleri otomatik yansıtılır
- ✅ Veri tutarsızlığı ortadan kalkar
