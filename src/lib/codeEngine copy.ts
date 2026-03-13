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
  if (!secret) throw new Error("AUTH_SECRET not found");

  const buf = Buffer.alloc(8);
  buf.writeBigUInt64BE(BigInt(counter));
  const hash = createHmac("sha512", secret).update(buf).digest();

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

export function issueCode(): string {
  const counter = readCounter();
  const code = counterToCode(counter);
  saveCounter(counter + 1);
  return code;
}