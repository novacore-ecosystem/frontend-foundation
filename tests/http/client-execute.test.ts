import { describe, expect, it, vi } from "vitest";

const requestMock = vi.fn();

// `HttpClient` owns exactly one Axios instance per instance (see `client.ts`'s own doc comment)
// created via `axios.create(...)` — stub just the one method `execute()` actually calls.
vi.mock("axios", () => ({
  default: {
    create: () => ({ request: requestMock }),
    isCancel: () => false,
    isAxiosError: () => false,
  },
}));

import { endpoint } from "../../src/http/endpoint";
import { HttpMethods } from "../../src/http/types";
import { HttpClient } from "../../src/http/client";

describe("HttpClient.execute — ApiResponse envelope unwrapping", () => {
  it("unwraps envelope.data on success, per every backend service's ApiResponse<T> contract", async () => {
    requestMock.mockResolvedValueOnce({
      data: { success: true, message: "OK", messageCode: "001", data: { id: "1" } },
      status: 200,
      headers: {},
    });
    const client = new HttpClient({ baseUrl: "http://x" });
    const def = endpoint<void, { id: string }>({ method: HttpMethods.Get, path: "/things/1" });

    await expect(client.execute(def)).resolves.toEqual({ id: "1" });
  });

  it("throws HttpError when envelope.success is false, even on an HTTP 200 (ApiResponse's own documented case)", async () => {
    requestMock.mockResolvedValueOnce({
      data: { success: false, message: "Email is not confirmed.", messageCode: "704", data: null },
      status: 200,
      headers: {},
    });
    const client = new HttpClient({ baseUrl: "http://x" });
    const def = endpoint<void, void>({ method: HttpMethods.Post, path: "/auth/login" });

    await expect(client.execute(def)).rejects.toMatchObject({
      name: "HttpError",
      message: "Email is not confirmed.",
      code: "704",
    });
  });

  it("resolves undefined for a void-typed endpoint whose envelope carries no data", async () => {
    requestMock.mockResolvedValueOnce({
      data: { success: true, message: "OK", messageCode: "001", data: null },
      status: 200,
      headers: {},
    });
    const client = new HttpClient({ baseUrl: "http://x" });
    const def = endpoint<void, void>({ method: HttpMethods.Post, path: "/auth/logout" });

    await expect(client.execute(def)).resolves.toBeNull();
  });
});
