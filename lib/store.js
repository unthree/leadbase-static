import { promises as fs } from "fs";
import path from "path";

// Storage backend:
// - Local (your Mac): plain JSON files in data/ — readable, git-trackable.
// - Vercel/hosted: Upstash Redis via REST when the integration env vars are
//   present, since serverless filesystems are wiped between deploys.
//
// A backend ERROR must never be mistaken for "no data yet": serving defaults
// during an outage would let the client's next autosave overwrite the real
// document. kvGet/kvSet throw on backend failure; readStore only falls back
// when the key genuinely doesn't exist.

const DATA_DIR = path.join(process.cwd(), "data");

// Thrown for any storage-backend failure so API routes can answer 503 (retry
// later) instead of a generic 500 — and never fake success.
export class StorageError extends Error {
  constructor(message, hint) {
    super(message);
    this.name = "StorageError";
    this.hint = hint;
  }
}

// Vercel's Upstash integration injects KV_REST_API_*; Upstash's own docs use
// UPSTASH_REDIS_REST_*. Accept either.
const KV_URL =
  process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const KV_TOKEN =
  process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
const useKV = Boolean(KV_URL && KV_TOKEN);

const KV_HINT = "check the Upstash database connection in the Vercel project's Storage tab";

async function kvGet(name) {
  let res;
  try {
    res = await fetch(`${KV_URL}/get/mc:${name}`, {
      headers: { Authorization: `Bearer ${KV_TOKEN}` },
      cache: "no-store"
    });
  } catch (e) {
    throw new StorageError(`storage read failed: ${e?.message || "network error"}`, KV_HINT);
  }
  if (!res.ok) throw new StorageError(`storage read failed (${res.status})`, KV_HINT);
  const json = await res.json();
  return json.result ? JSON.parse(json.result) : null;
}

async function kvSet(name, value) {
  let res;
  try {
    res = await fetch(`${KV_URL}/set/mc:${name}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${KV_TOKEN}` },
      body: JSON.stringify(value)
    });
  } catch (e) {
    throw new StorageError(`storage write failed: ${e?.message || "network error"}`, KV_HINT);
  }
  if (!res.ok) throw new StorageError(`storage write failed (${res.status})`, KV_HINT);
}

export async function readStore(name, fallback) {
  if (useKV) {
    const value = await kvGet(name); // throws on backend error
    return value ?? fallback; // null = key absent = genuinely no data yet
  }
  try {
    const raw = await fs.readFile(path.join(DATA_DIR, `${name}.json`), "utf8");
    return JSON.parse(raw);
  } catch (e) {
    if (e?.code === "ENOENT") return fallback;
    throw new StorageError(
      `storage read failed: ${e?.message || "unreadable file"}`,
      `inspect data/${name}.json — it may be corrupted`
    );
  }
}

export async function writeStore(name, value) {
  if (useKV) {
    await kvSet(name, value); // throws on backend error
    return;
  }
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(
    path.join(DATA_DIR, `${name}.json`),
    JSON.stringify(value, null, 2)
  );
}
