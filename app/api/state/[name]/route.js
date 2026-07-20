import { NextResponse } from "next/server";
import { readStore, writeStore, StorageError } from "@/lib/store";
import { DEFAULTS, STORE_NAMES } from "@/lib/defaults";
import { isValidStore } from "@/lib/validate";

export const dynamic = "force-dynamic";

export async function GET(_req, { params }) {
  const { name } = await params;
  if (!STORE_NAMES.includes(name)) {
    return NextResponse.json({ error: "unknown store" }, { status: 404 });
  }
  let value;
  try {
    value = await readStore(name, DEFAULTS[name]);
  } catch {
    // Backend down ≠ empty store. Serving defaults here would let the next
    // autosave overwrite the real document.
    return NextResponse.json({ error: "storage backend unavailable" }, { status: 503 });
  }
  // Self-heal: if a bad write ever slipped in, serve defaults instead of
  // letting a malformed document crash every client.
  return NextResponse.json(isValidStore(name, value) ? value : DEFAULTS[name]);
}

export async function PUT(req, { params }) {
  const { name } = await params;
  if (!STORE_NAMES.includes(name)) {
    return NextResponse.json({ error: "unknown store" }, { status: 404 });
  }
  let value;
  try {
    value = await req.json();
  } catch {
    return NextResponse.json({ error: "body must be JSON" }, { status: 400 });
  }
  if (!isValidStore(name, value)) {
    return NextResponse.json(
      {
        error:
          "invalid document shape — GET the store first, modify the returned JSON, and PUT the ENTIRE document back (never a partial object)"
      },
      { status: 400 }
    );
  }
  try {
    await writeStore(name, value);
  } catch (err) {
    console.error(`PUT /api/state/${name} failed:`, err);
    if (err instanceof StorageError) {
      return NextResponse.json(
        { error: err.message, hint: err.hint },
        { status: 503 }
      );
    }
    return NextResponse.json(
      { error: `write failed: ${err.message}` },
      { status: 500 }
    );
  }
  return NextResponse.json({ ok: true });
}
