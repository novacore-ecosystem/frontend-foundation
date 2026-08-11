import { describe, expect, it } from "vitest";
import { interpolate } from "../../src/i18n";

describe("interpolate", () => {
  it("returns the template unchanged when no values are given", () => {
    expect(interpolate("Hello, {{name}}")).toBe("Hello, {{name}}");
  });

  it("substitutes numeric values", () => {
    expect(interpolate("You have {{count}} items", { count: 3 })).toBe("You have 3 items");
  });

  it("substitutes multiple placeholders", () => {
    expect(interpolate("{{greeting}}, {{name}}!", { greeting: "Hi", name: "Tan" })).toBe("Hi, Tan!");
  });

  it("tolerates whitespace inside delimiters", () => {
    expect(interpolate("Hi {{ name }}", { name: "Tan" })).toBe("Hi Tan");
  });
});
