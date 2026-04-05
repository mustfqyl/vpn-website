import { createHmac } from "crypto";
import { prisma } from './prisma';
import { logger } from './logger';

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const DB_COUNTER_KEY = 'auth-code-counter';

async function getAndIncrementCounter(): Promise<bigint> {
  try {
    // Atomic read-and-modify using PostgreSQL raw CTE/query
    const result: any[] = await prisma.$queryRaw`
      INSERT INTO app_state (key, value)
      VALUES (${DB_COUNTER_KEY}, '2')
      ON CONFLICT (key) DO UPDATE 
      SET value = (CAST(app_state.value AS BIGINT) + 1)::text
      RETURNING value
    `;
    
    if (result && result.length > 0) {
      // The returning value is the UPGRADED value, representing the NEXT counter. 
      // We subtract 1 to get the CURRENT counter that we should use for this code.
      return BigInt(result[0].value) - 1n;
    }
    return 1n;
  } catch (error) {
    logger.error({ error }, 'Database atomic increment error for auth-code-counter');
    
    // Non-atomic fallback for safety
    try {
      const state = await prisma.appState.findUnique({ where: { key: DB_COUNTER_KEY } });
      if (state) {
        const val = BigInt(state.value);
        await prisma.appState.update({ where: { key: DB_COUNTER_KEY }, data: { value: (val + 1n).toString() } });
        return val;
      }
      await prisma.appState.create({ data: { key: DB_COUNTER_KEY, value: '2' } });
      return 1n;
    } catch (fallbackError) {
      return 1n;
    }
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
  const counter = await getAndIncrementCounter();
  return counterToCode(counter);
}