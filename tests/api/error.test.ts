import { describe, expect, it } from "vitest";
import { isErrorResponse, MessageCode, type ApiResponse, type ValidationFieldError } from "../../src/api";

describe("MessageCode contract", () => {
  it("exposes known success and error codes as their exact backend string values", () => {
    expect(MessageCode.Success).toBe("001");
    expect(MessageCode.ValidationFailed).toBe("100");
    expect(MessageCode.NotFound).toBe("201");
    expect(MessageCode.Unauthorized).toBe("304");
    expect(MessageCode.UserNotFound).toBe("700");
    expect(MessageCode.CouponDisabled).toBe("1000");
  });

  it("supports type-safe switch-style handling of a response's messageCode", () => {
    const response: ApiResponse = { success: false, message: "User not found", messageCode: MessageCode.UserNotFound };

    function describe(code: string | null | undefined): string {
      switch (code) {
        case MessageCode.UserNotFound:
          return "user-not-found";
        case MessageCode.ValidationFailed:
          return "validation-failed";
        default:
          return "unknown";
      }
    }

    expect(describe(response.messageCode)).toBe("user-not-found");
  });

  it("has no duplicate string codes across the whole map", () => {
    const codes = Object.values(MessageCode);
    expect(new Set(codes).size).toBe(codes.length);
  });
});

describe("ValidationFieldError contract", () => {
  it("mirrors the backend's PropertyName/ErrorMessage shape", () => {
    const error: ValidationFieldError = { propertyName: "Email", errorMessage: "'Email' is not valid" };
    expect(error.propertyName).toBe("Email");
    expect(error.errorMessage).toBe("'Email' is not valid");
  });
});

describe("HTTP status vs business error code separation", () => {
  it("keeps messageCode independent of any HTTP-status-like field on the envelope", () => {
    const response: ApiResponse = {
      success: false,
      message: "Resource conflict",
      messageCode: MessageCode.Conflict,
    };
    expect(isErrorResponse(response)).toBe(true);
    expect(response.messageCode).toBe("202");
    expect("status" in response).toBe(false);
    expect("httpStatus" in response).toBe(false);
  });
});
