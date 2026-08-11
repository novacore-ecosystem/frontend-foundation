import { describe, expect, it } from "vitest";
import { isErrorResponse, isSuccessResponse, type ApiResponse } from "../../src/api";

describe("ApiResponse contract", () => {
  it("represents a success response with a generic payload", () => {
    const response: ApiResponse<{ id: string }> = {
      success: true,
      message: "Request success",
      messageCode: "001",
      data: { id: "abc" },
    };
    expect(isSuccessResponse(response)).toBe(true);
    if (isSuccessResponse(response)) {
      expect(response.data?.id).toBe("abc");
    }
  });

  it("represents a success response with no payload (Ok()/NoContent())", () => {
    const response: ApiResponse<never> = {
      success: true,
      message: "No content",
      messageCode: "007",
    };
    expect(isSuccessResponse(response)).toBe(true);
    expect(response.data).toBeUndefined();
  });

  it("represents an error response", () => {
    const response: ApiResponse = {
      success: false,
      message: "User not found",
      messageCode: "700",
      data: null,
      details: null,
    };
    expect(isErrorResponse(response)).toBe(true);
    expect(isSuccessResponse(response)).toBe(false);
  });

  it("does not require a status/timestamp/traceId field — the envelope only carries success/message/messageCode/data/details", () => {
    const response: ApiResponse<number> = { success: true, message: "ok", data: 42 };
    expect(Object.keys(response).sort()).toEqual(["data", "message", "success"]);
  });
});
