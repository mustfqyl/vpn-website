import { createHmac } from "crypto";
import fs from "fs";
import path from "path";
import { Redis } from '@upstash/redis';

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

// Use /tmp for Vercel's read-only environment fallback
const isVercel = process.env.VERCEL === '1';
const STATE_DIR = isVercel ? "/tmp" : path.join(process.cwd(), "data");
const STATE_FILE = path.join(STATE_DIR, "state.json");

// Initialize Redis if credentials are available
const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;
const redis = redisUrl && redisToken ? new Redis({ url: redisUrl, token: redisToken }) : null;
const REDIS_KEY = 'auth-code-counter';

async function readCounter(): Promise<bigint> {
  // 1. Try Redis first (Primary for production)
  if (redis) {
    try {
      const val = await redis.get<string>(REDIS_KEY);
      if (val) return BigInt(val);
    } catch (error) {
      console.error('Redis read error:', error);
    }
  }

  // 2. Fallback to File system
  try {
    if (!fs.existsSync(STATE_FILE)) return 1n;
    return BigInt(JSON.parse(fs.readFileSync(STATE_FILE, "utf8")).counter ?? "1");
  } catch { return 1n; }
}

async function saveCounter(counter: bigint): Promise<void> {
  // 1. Save to Redis (Primary for production)
  if (redis) {
    try {
      await redis.set(REDIS_KEY, counter.toString());
      return;
    } catch (error) {
      console.error('Redis save error:', error);
    }
  }

  // 2. Fallback to File system (only works if directory is writable)
  try {
    if (!fs.existsSync(STATE_DIR)) {
      fs.mkdirSync(STATE_DIR, { recursive: true });
    }
    fs.writeFileSync(STATE_FILE, JSON.stringify({ counter: counter.toString() }, null, 2));
  } catch (error) {
    console.error('File system save error:', error);
  }
}

function counterToCode(counter: bigint): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET not found.");

  const buf = Buffer.alloc(16);
  buf.writeBigUInt64BE(counter >> 64n, 0); 
  buf.writeBigUInt64BE(counter & 0xFFFFFFFFFFFFFFFFn, 8);

  const hash = createHmac("sha512", secret).update(buf).digest();

  const chars: string[] = [];
  for (let i = 0; i < 12; i++) {
    const byteIndex = Math.floor((i * 5) / 8);
    const bitOffset = (i * 5) % 8;
    const window = ((hash[byteIndex] << 8) | (hash[byteIndex + 1] ?? 0)) >> (11 - bitOffset);
    chars.push(ALPHABET[window & 0x1f]);
  }

  return [
    chars.slice(0, 4).join(""),
    chars.slice(4, 8).join(""),
    chars.slice(8, 12).join(""),
  ].join("-");
}

export function isValidFormat(code: string): boolean {
  return /^[A-Z2-9]{4}-[A-Z2-9]{4}-[A-Z2-9]{4}$/.test(code.toUpperCase());
}

export async function issueCode(): Promise<string> {
  const counter = await readCounter();
  const code = counterToCode(counter);
  await saveCounter(counter + 1n);
  return code;
}