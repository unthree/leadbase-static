import { NextResponse } from "next/server";
import { chat } from "@/lib/ai";

export const dynamic = "force-dynamic";

const PROMPTS = {
  newsletter: {
    system:
      "You are a newsletter ghostwriter. Turn the provided source material (tweets, video titles/links, notes) into a single ready-to-send newsletter draft. Return the subject line on the first line, then a blank line, then the body in plain markdown. Keep the author's casual, direct voice.",
    agent: false
  },
  research: {
    system:
      "You are a YouTube video research assistant. Given a topic, return: 3 title options, a hook (first 15 seconds), a bullet outline, and 3 thumbnail concepts. Be concrete and specific.",
    agent: false
  },
  sponsors: {
    system:
      "You are a sponsorship prospecting agent. Given a channel/newsletter description, return a list of 8 realistic sponsor prospects: company, why they fit, and a one-line cold-open for the outreach email. Format as a markdown list.",
    agent: true
  }
};

export async function POST(req) {
  const { kind, input } = await req.json();
  const cfg = PROMPTS[kind];
  if (!cfg) {
    return NextResponse.json({ error: "unknown kind" }, { status: 400 });
  }
  const result = await chat({ system: cfg.system, user: input || "", agent: cfg.agent });
  return NextResponse.json(result);
}
