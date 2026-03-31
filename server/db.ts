import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.resolve(__dirname, "../data/db.json");

function ensureDir() {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

export function loadDb(): Record<string, any[]> {
  ensureDir();
  if (!fs.existsSync(DB_PATH)) return {};
  try {
    return JSON.parse(fs.readFileSync(DB_PATH, "utf-8"));
  } catch {
    return {};
  }
}

export function saveDb(data: Record<string, any[]>): void {
  ensureDir();
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf-8");
}

export function genId(): string {
  return crypto.randomUUID();
}
