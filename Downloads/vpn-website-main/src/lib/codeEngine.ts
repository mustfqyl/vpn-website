import { createHmac } from "crypto";
import fs from "fs";
import path from "path";

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const STATE_FILE = path.join(process.cwd(), "data", "state.json");

function readCounter(): bigint {
  try {
    if (!fs.existsSync(STATE_FILE)) return 1n;
    return BigInt(JSON.parse(fs.readFileSync(STATE_FILE, "utf8")).counter ?? "1");
  } catch { return 1n; }
}

function saveCounter(counter: bigint): void {
  fs.mkdirSync(path.dirname(STATE_FILE), { recursive: true });
  fs.writeFileSync(STATE_FILE, JSON.stringify({ counter: counter.toString() }, null, 2));
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

export function issueCode(): string {
  const counter = readCounter();
  const code = counterToCode(counter);
  saveCounter(counter + 1n);
  return code;
}