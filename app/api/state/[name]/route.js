import { NextResponse } from "next/server";
import { readStore, writeStore } from "@/lib/store";
import { DEFAULTS, STORE_NAMES } from "@/lib/defaults";

export const dynamic = "force-dynamic";

export async function GET(_req, { params }) {
  const { name } = await params;
  if (!STORE_NAMES.includes(name)) {
    return NextResponse.json({ error: "unknown store" }, { status: 404 });
  }
  const value = await readStore(name, DEFAULTS[name]);
  return NextResponse.json(value);
}

export async function PUT(req, { params }) {
  const { name } = await params;
  if (!STORE_NAMES.includes(name)) {
    return NextResponse.json({ error: "unknown store" }, { status: 404 });
  }
  const value = await req.json();
  await writeStore(name, value);
  return NextResponse.json({ ok: true });
}
