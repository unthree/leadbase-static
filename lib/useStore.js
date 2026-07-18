"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// Loads a named store from the API and gives back [state, update].
// update() applies the change locally and persists the whole store.
export function useStore(name) {
  const [state, setState] = useState(null);
  const saveTimer = useRef(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/state/${name}`)
      .then((r) => r.json())
      .then((data) => !cancelled && setState(data));
    return () => { cancelled = true; };
  }, [name]);

  const update = useCallback(
    (next) => {
      setState(next);
      clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        fetch(`/api/state/${name}`, {
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
