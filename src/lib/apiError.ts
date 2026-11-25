/** A failed Supabase request, with what the app needs to explain it. */
export class ApiError extends Error {
  /** HTTP status; 0 when the request never reached the server. */
  readonly status: number;
  /** Postgres or PostgREST error code, such as "23514" or "PGRST116". */
  readonly code: string;

  constructor(message: string, status: number, code: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

/** Returns the data of a Supabase response, or throws its error. */
export function unwrap<T>(response: {
  data: T | null;
  error: { message: string; code: string } | null;
  status: number;
}): NonNullable<T> {
  const { data, error, status } = response;
  if (error) throw new ApiError(error.message, status, error.code);
  return data as NonNullable<T>;
}
