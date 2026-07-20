import { promises as fs } from "fs";
import path from "path";

// Storage backend:
// - Local (your Mac): plain JSON files in data/ — readable, git-trackable.
// - Vercel/hosted: set UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN
//   (free via Vercel Marketplace → Upstash Redis) and data persists in the
//   cloud instead, since serverless filesystems are wiped between deploys.

const DATA_DIR = path.join(process.cwd(), "data");

// Vercel's Upstash integration injects KV_REST_API_*; Upstash's own docs use
// UPSTASH_REDIS_REST_*. Accept either.
const KV_URL =
  process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const KV_TOKEN =
  process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
const useKV = Boolean(KV_URL && KV_TOKEN);

// Thrown when a write cannot be persisted. `hint` tells the operator how to
// fix the deployment; the API surfaces it instead of an opaque 500.
export class StorageError extends Error {
  constructor(message, hint) {
    super(message);
    this.name = "StorageError";
    this.hint = hint;
  }
}

async function kvGet(name) {
  const res = await fetch(`${KV_URL}/get/mc:${name}`, {
    headers: { Authorization: `Bearer ${KV_TOKEN}` },
    cache: "no-store"
  });
  if (!res.ok) return null;
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
  } catch (err) {
    throw new StorageError(
      `could not reach Redis: ${err.message}`,
      "Check UPSTASH_REDIS_REST_URL — the database may be unreachable or deleted. Recreate it from the Vercel project's Storage tab, then redeploy."
    );
  }
  if (!res.ok) {
    const detail = (await res.text().catch(() => "")).slice(0, 200);
    throw new StorageError(
      `Redis write failed with status ${res.status}${detail ? `: ${detail}` : ""}`,
      "Check UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN in the Vercel project's environment variables, then redeploy."
    );
  }
}

export async function readStore(name, fallback) {
  if (useKV) {
    try {
      const value = await kvGet(name);
      return value ?? fallback;
    } catch {
      return fallback;
    }
  }
  try {
    const raw = await fs.readFile(path.join(DATA_DIR, `${name}.json`), "utf8");
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export async function writeStore(name, value) {
  if (useKV) {
    await kvSet(name, value);
    return;
  }
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(
      path.join(DATA_DIR, `${name}.json`),
      JSON.stringify(value, null, 2)
    );
  } catch (err) {
    // On Vercel the filesystem is read-only, so landing here means the
    // Upstash env vars are missing and nothing can persist.
    if (process.env.VERCEL) {
      throw new StorageError(
        "no persistent storage configured — the serverless filesystem is read-only",
        "In the Vercel project, open Storage → Create Database → Upstash Redis (free tier), then redeploy; the app switches to Redis automatically."
      );
    }
    throw err;
  }
}
