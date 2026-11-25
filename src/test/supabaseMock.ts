/** What a Supabase request resolves to. */
export interface MockResponse {
  data: unknown;
  error: { message: string; code: string } | null;
  status: number;
}

/** One request: its table and the builder calls made on it, in order. */
export interface MockRequest {
  table: string;
  calls: [method: string, ...args: unknown[]][];
}

export const ok = (data: unknown): MockResponse => ({
  data,
  error: null,
  status: 200,
});

export const fail = (status: number, code: string): MockResponse => ({
  data: null,
  error: { message: `Failed with ${code}`, code },
  status,
});

/**
 * A stand-in for the Supabase client. It records every request and answers it
 * with whatever `respond` returns for it.
 */
export function mockSupabase(respond: (request: MockRequest) => MockResponse) {
  const requests: MockRequest[] = [];

  const client = {
    from(table: string) {
      const request: MockRequest = { table, calls: [] };
      requests.push(request);

      const builder: object = new Proxy(
        {},
        {
          get(_target, method: string) {
            // Awaiting the builder sends the request.
            if (method === "then") {
              return (resolve: (response: MockResponse) => unknown) =>
                Promise.resolve(respond(request)).then(resolve);
            }
            return (...args: unknown[]) => {
              request.calls.push([method, ...args]);
              return builder;
            };
          },
        },
      );
      return builder;
    },
  };

  return { client, requests };
}

/** The request's first builder call of that name, if it made one. */
export function callTo(request: MockRequest, method: string) {
  return request.calls.find(([name]) => name === method);
}
