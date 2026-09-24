/**
 * useApiCache — fetch with instant cache from sessionStorage.
 *
 * First render: show cached data immediately (0ms), then re-fetch silently in
 * the background and update the UI if the data changed.
 *
 * Also warms up the serverless function on app start via a silent ping.
 */
import { useState, useEffect, useCallback, useRef } from "react";

const CACHE_PREFIX = "galeria_api_";
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

interface CacheEntry<T> {
  data: T;
  ts: number;
}

function readCache<T>(key: string): T | null {
  try {
    const raw = sessionStorage.getItem(CACHE_PREFIX + key);
    if (!raw) return null;
    const entry: CacheEntry<T> = JSON.parse(raw);
    if (Date.now() - entry.ts > CACHE_TTL_MS) {
      sessionStorage.removeItem(CACHE_PREFIX + key);
      return null;
    }
    return entry.data;
  } catch {
    return null;
  }
}

function writeCache<T>(key: string, data: T) {
  try {
    const entry: CacheEntry<T> = { data, ts: Date.now() };
    sessionStorage.setItem(CACHE_PREFIX + key, JSON.stringify(entry));
  } catch {
    // sessionStorage full — ignore
  }
}

export function invalidateCache(key: string) {
  try {
    sessionStorage.removeItem(CACHE_PREFIX + key);
  } catch {}
}

export function invalidateAllCache() {
  try {
    Object.keys(sessionStorage)
      .filter((k) => k.startsWith(CACHE_PREFIX))
      .forEach((k) => sessionStorage.removeItem(k));
  } catch {}
}

/**
 * Hook to fetch /api/<endpoint> with cache-first strategy.
 *
 * @param endpoint  e.g. "/packages"  (must start with /)
 * @param enabled   set false to skip fetching (e.g. when not on that page yet)
 */
export function useApiCache<T = any>(
  endpoint: string,
  enabled = true
): { data: T | null; loading: boolean; refetch: () => void } {
  const cacheKey = endpoint;
  const cached = readCache<T>(cacheKey);

  const [data, setData] = useState<T | null>(cached);
  const [loading, setLoading] = useState<boolean>(cached === null);
  const isMounted = useRef(true);

  const fetchData = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true);
      try {
        const res = await fetch(`/api${endpoint}`);
        const json = await res.json();
        if (!isMounted.current) return;
        if (json?.success !== false) {
          const result: T = json.data ?? json;
          setData(result);
          writeCache(cacheKey, result);
        }
      } catch {
        // network error — keep showing cached data
      } finally {
        if (isMounted.current) setLoading(false);
      }
    },
    [endpoint, cacheKey]
  );

  useEffect(() => {
    isMounted.current = true;
    if (!enabled) return;
    // If we had cached data, do a silent background refresh
    fetchData(cached !== null);
    return () => {
      isMounted.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint, enabled]);

  return { data, loading, refetch: () => fetchData(false) };
}

/** Warm up the Vercel serverless function in the background */
export function warmupApi() {
  try {
    fetch("/api/ping", { method: "GET" }).catch(() => {});
  } catch {}
}
