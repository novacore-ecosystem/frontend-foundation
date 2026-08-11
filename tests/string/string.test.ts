import { describe, expect, it } from "vitest";
import {
  camelCase,
  capitalize,
  isBlank,
  isNullOrEmpty,
  kebabCase,
  normalizeString,
  pascalCase,
  slugify,
  snakeCase,
  toStringSafe,
  truncate,
} from "../../src/string";

describe("isNullOrEmpty", () => {
  it("returns true for null/undefined/empty", () => {
    expect(isNullOrEmpty(null)).toBe(true);
    expect(isNullOrEmpty(undefined)).toBe(true);
    expect(isNullOrEmpty("")).toBe(true);
  });
  it("returns false for non-empty strings", () => {
    expect(isNullOrEmpty("a")).toBe(false);
    expect(isNullOrEmpty(" ")).toBe(false);
  });
});

describe("isBlank", () => {
  it("treats whitespace-only strings as blank", () => {
    expect(isBlank("   ")).toBe(true);
    expect(isBlank("\t\n")).toBe(true);
  });
  it("treats null/undefined/empty as blank", () => {
    expect(isBlank(null)).toBe(true);
    expect(isBlank(undefined)).toBe(true);
    expect(isBlank("")).toBe(true);
  });
  it("returns false for non-blank strings", () => {
    expect(isBlank("hi")).toBe(false);
  });
});

describe("toStringSafe", () => {
  it("handles null/undefined", () => {
    expect(toStringSafe(null)).toBe("");
    expect(toStringSafe(undefined)).toBe("");
  });
  it("handles primitives", () => {
    expect(toStringSafe(42)).toBe("42");
    expect(toStringSafe(true)).toBe("true");
  });
  it("does not throw on objects without toString issues", () => {
    expect(toStringSafe({ a: 1 })).toBe("[object Object]");
  });
});

describe("normalizeString", () => {
  it("trims and collapses whitespace", () => {
    expect(normalizeString("  hello   world  ")).toBe("hello world");
  });
  it("handles null/undefined", () => {
    expect(normalizeString(null)).toBe("");
    expect(normalizeString(undefined)).toBe("");
  });
});

describe("capitalize", () => {
  it("capitalizes the first code point only", () => {
    expect(capitalize("hello")).toBe("Hello");
    expect(capitalize("hello World")).toBe("Hello World");
  });
  it("handles empty input", () => {
    expect(capitalize("")).toBe("");
    expect(capitalize(null)).toBe("");
  });
  it("handles unicode astral characters without corrupting them", () => {
    expect(capitalize("😀hello")).toBe("😀hello");
  });
});

describe("case conversions", () => {
  it("converts to camelCase", () => {
    expect(camelCase("hello world")).toBe("helloWorld");
    expect(camelCase("Hello-World_test")).toBe("helloWorldTest");
    expect(camelCase("XMLHttpRequest")).toBe("xmlHttpRequest");
  });
  it("converts to PascalCase", () => {
    expect(pascalCase("hello world")).toBe("HelloWorld");
    expect(pascalCase("hello-world")).toBe("HelloWorld");
  });
  it("converts to kebab-case", () => {
    expect(kebabCase("Hello World")).toBe("hello-world");
    expect(kebabCase("helloWorld")).toBe("hello-world");
  });
  it("converts to snake_case", () => {
    expect(snakeCase("Hello World")).toBe("hello_world");
    expect(snakeCase("helloWorld")).toBe("hello_world");
  });
  it("handles empty input for all case conversions", () => {
    expect(camelCase("")).toBe("");
    expect(pascalCase(null)).toBe("");
    expect(kebabCase(undefined)).toBe("");
    expect(snakeCase("")).toBe("");
  });
});

describe("truncate", () => {
  it("does not modify strings shorter than maxLength", () => {
    expect(truncate("hello", 10)).toBe("hello");
  });
  it("truncates and appends the default suffix", () => {
    expect(truncate("hello world", 8)).toBe("hello w…");
  });
  it("supports a custom suffix", () => {
    expect(truncate("hello world", 8, { suffix: "..." })).toBe("hello...");
  });
  it("handles maxLength of 0 and empty input", () => {
    expect(truncate("hello", 0)).toBe("");
    expect(truncate("", 5)).toBe("");
    expect(truncate(null, 5)).toBe("");
  });
  it("does not split surrogate pairs (emoji)", () => {
    const result = truncate("😀😀😀😀😀", 3);
    expect(Array.from(result).length).toBeLessThanOrEqual(3);
    expect(result.includes("�")).toBe(false);
  });
});

describe("slugify", () => {
  it("produces a lowercase, hyphenated slug", () => {
    expect(slugify("Hello World")).toBe("hello-world");
  });
  it("strips diacritics", () => {
    expect(slugify("Café Münchën")).toBe("cafe-munchen");
  });
  it("collapses non-alphanumeric runs and trims separators", () => {
    expect(slugify("  --Hello!!  World--  ")).toBe("hello-world");
  });
  it("supports a custom separator", () => {
    expect(slugify("Hello World", { separator: "_" })).toBe("hello_world");
  });
  it("handles empty input", () => {
    expect(slugify("")).toBe("");
    expect(slugify(null)).toBe("");
  });
});
