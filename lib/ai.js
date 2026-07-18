// Thin client for any OpenAI-compatible chat completions API.
// Model ids are env-driven so this works with whatever your provider exposes
// (e.g. OPENAI_MODEL=gpt-5.6-sol, HERMES_MODEL=hermes-agent).

const BASE_URL = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";

export function aiConfigured() {
  return Boolean(process.env.OPENAI_API_KEY);
}

export async function chat({ system, user, agent = false }) {
  const model = agent
    ? process.env.HERMES_MODEL || "hermes-agent"
    : process.env.OPENAI_MODEL || "gpt-5.6-sol";

  if (!aiConfigured()) {
    return {
      ok: false,
      model,
      text:
        "AI is not configured yet. Set OPENAI_API_KEY (and optionally OPENAI_BASE_URL, OPENAI_MODEL, HERMES_MODEL) in .env.local, then restart the dev server."
    };
  }

  const res = await fetch(`${BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model,
      messages: [
        ...(system ? [{ role: "system", content: system }] : []),
        { role: "user", content: user }
      ]
    })
  });

  if (!res.ok) {
    const body = await res.text();
    return { ok: false, model, text: `AI request failed (${res.status}): ${body.slice(0, 500)}` };
  }

  const json = await res.json();
  return { ok: true, model, text: json.choices?.[0]?.message?.content ?? "" };
}
