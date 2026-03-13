import { createHmac } from "crypto";
import { prisma } from './prisma';
import { logger } from './logger';

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const DB_COUNTER_KEY = 'auth-code-counter';

async function readCounter(): Promise<bigint> {
  // 1. Try Database (Primary source)
  try {
    const state = await prisma.appState.findUnique({
      where: { key: DB_COUNTER_KEY }
    });
    if (state) return BigInt(state.value);
    return 1n;
  } catch (error) {
    logger.error({ error }, 'Database read error for auth-code-counter');
    return 1n;
  }
}

async function saveCounter(counter: bigint): Promise<void> {
  // Save to Database (Single source of truth)
  try {
    await prisma.appState.upsert({
      where: { key: DB_COUNTER_KEY },
      update: { value: counter.toString() },
      create: { key: DB_COUNTER_KEY, value: counter.toString() }
    });
  } catch (error) {
    logger.error({ error }, 'Database save error for auth-code-counter');
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