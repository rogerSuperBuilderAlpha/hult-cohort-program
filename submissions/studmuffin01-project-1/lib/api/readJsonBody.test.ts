import { describe, expect, it } from "vitest";
import {
  readJsonBody,
  RequestBodyTooLargeError,
} from "@/lib/api/readJsonBody";

describe("readJsonBody", () => {
  it("rejects oversized Content-Length", async () => {
    const request = new Request("http://localhost/api", {
      method: "PUT",
      headers: { "content-length": "2000000" },
      body: "{}",
    });

    await expect(readJsonBody(request, 1_000_000)).rejects.toBeInstanceOf(
      RequestBodyTooLargeError
    );
  });

  it("parses valid JSON under limit", async () => {
    const request = new Request("http://localhost/api", {
      method: "PUT",
      body: JSON.stringify({ ok: true }),
    });

    await expect(readJsonBody(request, 1_000)).resolves.toEqual({ ok: true });
  });
});
