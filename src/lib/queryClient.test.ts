import { describe, expect, it } from "vitest";
import { ApiError } from "./apiError";
import { shouldRetry } from "./queryClient";

const error = (status: number) => new ApiError("Failed", status, "");

describe("shouldRetry", () => {
  it.each([0, 429, 500, 503])("retries status %i twice", (status) => {
    expect(shouldRetry(0, error(status))).toBe(true);
    expect(shouldRetry(1, error(status))).toBe(true);
    expect(shouldRetry(2, error(status))).toBe(false);
  });

  it.each([400, 401, 403, 404, 406, 409])(
    "does not retry status %i",
    (status) => {
      expect(shouldRetry(0, error(status))).toBe(false);
    },
  );
});
