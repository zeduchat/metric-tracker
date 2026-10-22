"use client";

import { useCallback, useEffect, useState } from "react";
import type { SearchResponse, SearchResult } from "@/lib/schemas/search";
import { requestJson } from "@/lib/request-json";
import { useDebouncedValue } from "./useDebouncedValue";

type SearchState = { query: string; data: SearchResponse | null };
type SearchStatus = "idle" | "loading" | "success" | "error";

export function useGlobalSearch(query: string, open: boolean) {
  const debouncedQuery = useDebouncedValue(query, 250).trim();
  const [state, setState] = useState<SearchState>({ query: "", data: null });
  const [error, setError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const currentQuery = query.trim();
  const validQuery = currentQuery.length >= 2 && currentQuery.length <= 100;
  const querySettled = currentQuery === debouncedQuery;

  useEffect(() => {
    if (!open || !validQuery || !querySettled) {
      setState({ query: "", data: null });
      setError(null);
      return;
    }

    const controller = new AbortController();
    setState({ query: debouncedQuery, data: null });
    setError(null);

    const url = `/api/search?q=${encodeURIComponent(debouncedQuery)}`;
    void requestJson<SearchResponse>(url, { signal: controller.signal })
      .then((data) => {
        if (!controller.signal.aborted) setState({ query: debouncedQuery, data });
      })
      .catch((caught: unknown) => {
        if (controller.signal.aborted) return;
        if (caught instanceof Error && caught.name === "AbortError") return;
        setError(caught instanceof Error ? caught : new Error("Search failed."));
      });

    return () => controller.abort();
  }, [currentQuery, debouncedQuery, open, querySettled, retryCount, validQuery]);

  const retry = useCallback(() => setRetryCount((count) => count + 1), []);

  const status: SearchStatus = !open || !validQuery
    ? "idle"
    : !querySettled || state.query !== debouncedQuery || (!state.data && !error)
      ? "loading"
      : error
        ? "error"
        : "success";
  const results: SearchResult[] =
    status === "success" && state.query === debouncedQuery
      ? state.data?.results ?? []
      : [];

  return { status, results, retry, error, query: debouncedQuery };
}
