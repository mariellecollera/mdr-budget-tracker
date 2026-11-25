import { QueryClient } from "@tanstack/react-query";
import { ApiError } from "./apiError";

const MAX_RETRIES = 2;

/**
 * Retries network and server failures twice, with TanStack Query's backoff. A
 * 4xx answer would be the same the next time, except for rate limits (429).
 */
export function shouldRetry(failureCount: number, error: unknown): boolean {
  if (
    error instanceof ApiError &&
    error.status >= 400 &&
    error.status < 500 &&
    error.status !== 429
  ) {
    return false;
  }
  return failureCount < MAX_RETRIES;
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: shouldRetry,
      staleTime: 30_000,
    },
  },
});
