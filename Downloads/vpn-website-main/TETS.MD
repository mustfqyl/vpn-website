# GÖREV: Auth Code Üretim Algoritmasını Değiştir

## Proje
- Next.js App Router (`src/app`)
- PostgreSQL veritabanı
- Kullanıcılar VPN'e `XXXX-XXXX-XXXX-XXXX` formatında auth kodu ile giriş yapıyor

---

## Ne yapacaksın?

Projede auth code'un **üretildiği** yeri bul. Sadece oradaki üretim mantığını aşağıdaki `codeEngine.ts` ile değiştir.

**DB şemasına hiçbir şey ekleme.**
**Mevcut kayıt ve doğrulama mantığına dokunma.**
**Sadece üretim kısmını değiştir.**

---

## Eklenecek iki şey

### 1. `src/lib/codeEngine.ts`

```typescript
import { createHmac } from "crypto";
import fs from "fs";
import path from "path";

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const STATE_FILE = path.join(process.cwd(), "data", "state.json");

function readCounter(): number {
  try {
    if (!fs.existsSync(STATE_FILE)) return 1;
    return JSON.parse(fs.readFileSync(STATE_FILE, "utf8")).counter ?? 1;
  } catch { return 1; }
}

function saveCounter(counter: number): void {
  fs.mkdirSync(path.dirname(STATE_FILE), { recursive: true });
  fs.writeFileSync(STATE_FILE, JSON.stringify({ counter }, null, 2));
}

function counterToCode(counter: number): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET tanımlı değil.");

  const buf = Buffer.alloc(8);
  buf.writeBigUInt64BE(BigInt(counter));
  const hash = createHmac("sha256", secret).update(buf).digest();

  const chars: string[] = [];
  for (let i = 0; i < 16; i++) {
    const byteIndex = Math.floor((i * 5) / 8);
    const bitOffset = (i * 5) % 8;
    const window = ((hash[byteIndex] << 8) | (hash[byteIndex + 1] ?? 0)) >> (11 - bitOffset);
    chars.push(ALPHABET[window & 0x1f]);
  }

  return [
    chars.slice(0, 4).join(""),
    chars.slice(4, 8).join(""),
    chars.slice(8, 12).join(""),
    chars.slice(12, 16).join(""),
  ].join("-");
}

/**
 * Her çağrıda benzersiz, asla tekrar etmeyen bir kod üretir.
 */
export function issueCode(): string {
  const counter = readCounter();
  const code = counterToCode(counter);
  saveCounter(counter + 1);
  return code;
}
```

### 2. `.env.local` dosyasına ekle

```
AUTH_SECRET="buraya-en-az-32-karakter-guclu-rastgele-bir-anahtar-koy"
```

Anahtar üretmek için:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

`.gitignore`'a ekle:
```
data/
```

---

## Mevcut üretimi nasıl değiştirirsin?

Projede `Math.random()`, `crypto.randomBytes()`, `nanoid()` veya benzeri bir şeyle kod üretilen yeri bul. O satırı şununla değiştir:

```typescript
import { issueCode } from "@/lib/codeEngine";

const code = issueCode(); // eskiden ne varsa bununla değiştir
```

Sadece bu. Başka hiçbir şey değişmeyecek.

---

## Kesinlikle yapma

- DB'ye yeni kolon veya tablo ekleme
- Mevcut doğrulama mantığına dokunma
- `data/state.json`'a counter dışında bir şey yazma
- `AUTH_SECRET`'i kod içine yazma