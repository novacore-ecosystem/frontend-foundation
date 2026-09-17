import { describe, expect, it } from "vitest";
import { BootstrapEndpoints } from "../../src/bootstrap";
import { HttpMethods } from "../../src/http";

describe("BootstrapEndpoints", () => {
  it("declares get as GET /bootstrap", () => {
    expect(BootstrapEndpoints.get.method).toBe(HttpMethods.Get);
    expect(BootstrapEndpoints.get.path).toBe("/bootstrap");
  });
});
