import { describe, expect, it } from "vitest";
import { slugify } from "./slug";

describe("slugify", () => {
  it("lowercases and hyphenates spaces", () => {
    expect(slugify("Smile Studio Dental")).toBe("smile-studio-dental");
  });

  it("strips punctuation", () => {
    expect(slugify("Dr. Rao's Clinic!")).toBe("dr-raos-clinic");
  });

  it("collapses repeated whitespace and hyphens", () => {
    expect(slugify("Too   Many    Spaces")).toBe("too-many-spaces");
    expect(slugify("already--hyphenated")).toBe("already-hyphenated");
  });

  it("trims leading and trailing hyphens", () => {
    expect(slugify("  -Leading and trailing-  ")).toBe("leading-and-trailing");
  });

  it("handles an already-clean slug unchanged", () => {
    expect(slugify("smile-studio-indiranagar")).toBe("smile-studio-indiranagar");
  });

  it("returns an empty string for input that's all punctuation", () => {
    expect(slugify("!!!")).toBe("");
  });
});
