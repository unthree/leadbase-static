import { promises as fs } from "fs";
import path from "path";

// Storage backend:
// - Local (your Mac): plain JSON files in data/ — readable, git-trackable.
// - Vercel/hosted: set UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN
//   (free via Vercel Marketplace → Upstash Redis) and data persists in the
//   cloud instead, since serverless filesystems are wiped between deploys.

const DATA_DIR = path.join(process.cwd(), "data");

const KV_URL = process.env.UPSTASH_REDIS_REST_URL;
const KV_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
const useKV = Boolean(KV_URL && KV_TOKEN);

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
  await fetch(`${KV_URL}/set/mc:${name}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${KV_TOKEN}` },
    body: JSON.stringify(value)
  });
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
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(
    path.join(DATA_DIR, `${name}.json`),
    JSON.stringify(value, null, 2)
  );
}
