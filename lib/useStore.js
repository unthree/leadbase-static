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
  const saveTimer = useRef(null);

  useEffect(() => {
    let cancelled = false;
    apiFetch(`/api/state/${name}`)
      .then((r) => r.json())
      .then((data) => !cancelled && setState(data));
    return () => { cancelled = true; };
  }, [name]);

  const update = useCallback(
    (next) => {
      setState(next);
      clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        apiFetch(`/api/state/${name}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(next)
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
