"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Lock, Mail, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui";
import { SwarmMark } from "@/components/chat";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("maya@onboardloop.co");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const submit = () => {
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    setError("");
    setPending(true);
    setTimeout(() => router.push("/dashboard"), 600);
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1.05fr 1fr", minHeight: "100vh", background: "var(--lb-surface-card)" }}>
      <div data-theme="dark" style={{ position: "relative", overflow: "hidden", background: "var(--lb-grad-dark-agent)", padding: "48px 56px", display: "flex", flexDirection: "column", justifyContent: "space-between", color: "var(--lb-text-primary)" }}>
        <div style={{ fontFamily: "var(--lb-font-display)", fontSize: "var(--lb-fs-20)", letterSpacing: "-.02em" }}>
          Leadbase<b style={{ color: "var(--lb-accent-violet)" }}>Pro</b>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 26 }}>
          <SwarmMark size={128} spin />
          <h1 style={{ fontFamily: "var(--lb-font-display)", fontWeight: 700, fontSize: "clamp(2.2rem,3.4vw,3.1rem)", lineHeight: 1.05, letterSpacing: "-.03em", margin: 0, maxWidth: 460 }}>
            Build micro-businesses from your <span className="lb-gradient-text">interests</span>.
          </h1>
          <p style={{ color: "var(--lb-text-secondary)", fontSize: "var(--lb-fs-16)", lineHeight: 1.55, maxWidth: 440, margin: 0 }}>
            LeadbasePro turns your goals, research, activity, and saved ideas into buyer-lead opportunities — and ships them while you sleep.
          </p>
        </div>
        <div className="lb-kicker">Discover more. Close more.</div>
      </div>

      <div style={{ display: "grid", placeItems: "center", padding: 32 }}>
        <div style={{ width: "100%", maxWidth: 360, display: "flex", flexDirection: "column", gap: 20 }}>
          <div>
            <div className="lb-kicker">Private beta · 2026</div>
            <h2 style={{ fontFamily: "var(--lb-font-display)", fontWeight: 700, fontSize: "var(--lb-fs-30)", letterSpacing: "-.025em", margin: "8px 0 6px" }}>Welcome back</h2>
            <p style={{ color: "var(--lb-text-secondary)", fontSize: "var(--lb-fs-14)", margin: 0 }}>Log in to your operator workspace.</p>
          </div>

          <Button variant="secondary" full onClick={() => router.push("/dashboard")}>Continue with Google</Button>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ flex: 1, height: 1, background: "var(--lb-border-default)" }} />
            <span style={{ fontSize: "var(--lb-fs-12)", color: "var(--lb-text-tertiary)" }}>or</span>
            <div style={{ flex: 1, height: 1, background: "var(--lb-border-default)" }} />
          </div>

          <div className="lb-field">
            <label className="lb-field__label">Work email</label>
            <div className="lb-field__control"><Mail /><input type="email" value={email} placeholder="you@company.com" onChange={(e) => setEmail(e.target.value)} /></div>
          </div>
          <div className={`lb-field${error ? " lb-field--invalid" : ""}`}>
            <label className="lb-field__label">Password</label>
            <div className="lb-field__control"><Lock /><input type="password" value={password} placeholder="••••••••" onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") submit(); }} /></div>
            {error ? <div className="lb-field__error">{error}</div> : null}
          </div>

          <Button variant="gradient" full disabled={pending} onClick={submit} iconRight={pending ? undefined : "ArrowRight"}>
            {pending ? "Signing in…" : "Enter workspace"}
          </Button>

          <p style={{ fontSize: "var(--lb-fs-12)", color: "var(--lb-text-tertiary)", textAlign: "center", margin: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            <ShieldCheck style={{ width: ".9rem", height: ".9rem" }} /> Your domain, list, and content stay owned by you.
          </p>
        </div>
      </div>
    </div>
  );
}
