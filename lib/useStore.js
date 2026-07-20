"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// fetch wrapper that carries the access key (if the deploy is locked with
// MC_API_KEY) and prompts for it once on a 401.
export async function apiFetch(url, opts = {}) {
  const doFetch = () => {
    const key = typeof window !== "undefined" ? localStorage.getItem("mc_key") : null;
    return fetch(url, {
      ...opts,
      headers: { ...(opts.headers || {}), ...(key ? { "x-api-key": key } : {}) }
    });
  };
  let res = await doFetch();
  if (res.status === 401 && typeof window !== "undefined") {
    const entered = prompt("This Mission Control is locked. Enter your access key:");
    if (entered) {
      localStorage.setItem("mc_key", entered);
      document.cookie = `mc_key=${entered}; path=/; max-age=31536000; samesite=lax`;
      res = await doFetch();
    }
  }
  return res;
}

// Loads a named store from the API and gives back [state, update].
// update() applies the change locally and persists the whole store.
export function useStore(name) {
  const [state, setState] = useState(null);
  const stateRef = useRef(null);
  const saveTimer = useRef(null);

  useEffect(() => {
    let cancelled = false;
    apiFetch(`/api/state/${name}`)
      .then(async (r) => {
        if (!r.ok) throw new Error(String(r.status));
        return r.json();
      })
      .then((data) => {
        if (cancelled) return;
        stateRef.current = data;
        setState(data);
      })
      .catch((e) => {
        if (cancelled) return;
        setState({ __error: true, __status: Number(e.message) || 0 });
      });
    return () => { cancelled = true; };
  }, [name]);

  // update accepts either the next document, or a function of the CURRENT
  // document — use the function form after any await, so slow async work
  // (e.g. AI generation) can't clobber edits made while it was in flight.
  const update = useCallback(
    (next) => {
      const value = typeof next === "function" ? next(stateRef.current) : next;
      stateRef.current = value;
      setState(value);
      clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        apiFetch(`/api/state/${name}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(value)
        });
      }, 400);
    },
    [name]
  );

  return [state, update];
}

export function uid() {
  return Math.random().toString(36).slice(2, 10);
}

// Shared loading/locked screen. Pages render this while state is null or
// when loading failed (usually: access key missing or wrong on this device).
export function StoreStatus({ state }) {
  if (state?.__error && state.__status === 503) {
    return (
      <div className="card" style={{ maxWidth: 480, marginTop: 40 }}>
        <div className="card-title">⚠️ Storage temporarily unavailable</div>
        <p className="muted" style={{ marginTop: 10, lineHeight: 1.6 }}>
          The database didn&apos;t respond. Your data is safe — nothing was
          overwritten. Try again in a moment.
        </p>
        <button className="btn primary" style={{ marginTop: 14 }} onClick={() => location.reload()}>
          Retry
        </button>
      </div>
    );
  }
  if (state?.__error) {
    return (
      <div className="card" style={{ maxWidth: 480, marginTop: 40 }}>
        <div className="card-title">🔒 Locked</div>
        <p className="muted" style={{ marginTop: 10, lineHeight: 1.6 }}>
          Couldn&apos;t load your data — this device probably doesn&apos;t have the
          access key yet (or it was entered incorrectly).
        </p>
        <button
          className="btn primary"
          style={{ marginTop: 14 }}
          onClick={() => {
            localStorage.removeItem("mc_key");
            document.cookie = "mc_key=; path=/; max-age=0";
            location.reload();
          }}
        >
          Enter access key
        </button>
      </div>
    );
  }
  return <div className="muted">Loading…</div>;
}
