"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { TASK_FILTER_KEYS, type TaskFilterKey, type TaskFilters } from "@/lib/tasks";

export function useDebouncedValue<T>(value: T, delayMs = 300): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(t);
  }, [value, delayMs]);
  return debounced;
}

/**
 * Filter state kept in the URL (so views are shareable and survive reloads).
 * Other query params on the page (e.g. ?tab=tasks) are preserved.
 * Search is debounced before it reaches the URL / API.
 */
export function useTaskFilters(defaultView: string = "board") {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const fromUrl = useMemo(() => {
    const f: TaskFilters = {};
    TASK_FILTER_KEYS.forEach((k) => {
      const v = searchParams?.get(k);
      if (v) f[k] = v;
    });
    return f;
  }, [searchParams]);

  const [searchInput, setSearchInput] = useState(fromUrl.search ?? "");
  const debouncedSearch = useDebouncedValue(searchInput, 300);

  const writeUrl = useCallback(
    (next: TaskFilters) => {
      const params = new URLSearchParams(searchParams?.toString() ?? "");
      TASK_FILTER_KEYS.forEach((k) => {
        const v = next[k];
        if (v && v !== "ALL" && !(k === "view" && v === defaultView)) params.set(k, v);
        else params.delete(k);
      });
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [router, pathname, searchParams, defaultView]
  );

  // Push debounced search into the URL.
  useEffect(() => {
    if ((fromUrl.search ?? "") !== debouncedSearch) writeUrl({ ...fromUrl, search: debouncedSearch });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  // Keep the input in sync when the URL changes externally (saved filter, back button).
  const lastUrlSearch = useRef(fromUrl.search ?? "");
  useEffect(() => {
    const s = fromUrl.search ?? "";
    if (s !== lastUrlSearch.current) {
      lastUrlSearch.current = s;
      setSearchInput(s);
    }
  }, [fromUrl.search]);

  const setFilter = useCallback(
    (key: TaskFilterKey, value: string) => writeUrl({ ...fromUrl, [key]: value }),
    [fromUrl, writeUrl]
  );
  const setFilters = useCallback((patch: TaskFilters) => writeUrl({ ...fromUrl, ...patch }), [fromUrl, writeUrl]);
  const resetFilters = useCallback(() => {
    setSearchInput("");
    writeUrl({ view: fromUrl.view });
  }, [fromUrl.view, writeUrl]);
  const applyQuery = useCallback(
    (query: string) => {
      const p = new URLSearchParams(query);
      const next: TaskFilters = { view: p.get("view") ?? fromUrl.view };
      TASK_FILTER_KEYS.forEach((k) => {
        const v = p.get(k);
        if (v) next[k] = v;
      });
      setSearchInput(next.search ?? "");
      writeUrl(next);
    },
    [fromUrl.view, writeUrl]
  );

  /** Query string for the API (excludes the view). */
  const apiQuery = useMemo(() => {
    const p = new URLSearchParams();
    TASK_FILTER_KEYS.forEach((k) => {
      if (k === "view") return;
      const v = fromUrl[k];
      if (v && v !== "ALL") p.set(k, v);
    });
    return p.toString();
  }, [fromUrl]);

  const hasActiveFilters = TASK_FILTER_KEYS.some((k) => k !== "view" && fromUrl[k] && fromUrl[k] !== "ALL");

  return {
    filters: fromUrl,
    view: fromUrl.view ?? defaultView,
    searchInput,
    setSearchInput,
    setFilter,
    setFilters,
    resetFilters,
    applyQuery,
    apiQuery,
    hasActiveFilters,
  };
}

/**
 * Subscribes to this user's task channel and calls `onEvent` (debounced) when
 * anything on their board changes. No-op if Pusher isn't configured.
 */
export function useTaskRealtime(
  role: "teacher" | "student",
  ownerId: number | null | undefined,
  onEvent: (event: { type: string; studentTaskId?: number; taskId?: number }) => void
) {
  const handlerRef = useRef(onEvent);
  handlerRef.current = onEvent;

  useEffect(() => {
    if (!ownerId || !process.env.NEXT_PUBLIC_PUSHER_KEY) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let pending: { type: string; studentTaskId?: number; taskId?: number } | null = null;
    let unsubscribe: (() => void) | undefined;

    import("@/lib/pusher-client")
      .then(({ getPusherClient }) => {
        if (cancelled) return;
        const pusher = getPusherClient();
        const channelName = `private-tasks-${role}-${ownerId}`;
        const channel = pusher.subscribe(channelName);
        const listener = (event: { type: string; studentTaskId?: number; taskId?: number }) => {
          pending = event;
          clearTimeout(timer);
          timer = setTimeout(() => pending && handlerRef.current(pending), 400);
        };
        channel.bind("task-event", listener);
        unsubscribe = () => {
          channel.unbind("task-event", listener);
          pusher.unsubscribe(channelName);
        };
      })
      .catch((err) => console.warn("Task realtime unavailable:", err));

    return () => {
      cancelled = true;
      clearTimeout(timer);
      unsubscribe?.();
    };
  }, [role, ownerId]);
}
