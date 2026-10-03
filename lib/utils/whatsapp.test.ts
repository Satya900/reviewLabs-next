import { describe, expect, it } from "vitest";
import { buildWaMeLink, toWaMeDigits } from "./whatsapp";

describe("toWaMeDigits", () => {
  it("prepends 91 to a bare 10-digit number", () => {
    expect(toWaMeDigits("9876543210")).toBe("919876543210");
  });

  it("strips spaces before normalizing", () => {
    expect(toWaMeDigits("98765 43210")).toBe("919876543210");
  });

  it("drops a leading 0 and prepends 91", () => {
    expect(toWaMeDigits("09876543210")).toBe("919876543210");
  });

  it("leaves an already-prefixed international number alone", () => {
    expect(toWaMeDigits("+919876543210")).toBe("919876543210");
  });

  it("strips non-digit punctuation like dashes and parens", () => {
    expect(toWaMeDigits("(987) 654-3210")).toBe("919876543210");
  });
});

describe("buildWaMeLink", () => {
  it("builds a wa.me URL with the normalized number and encoded message", () => {
    const link = buildWaMeLink("9876543210", "Hi there! Got a minute?");
    expect(link).toBe("https://wa.me/919876543210?text=Hi%20there!%20Got%20a%20minute%3F");
  });

  it("URL-encodes special characters in the message", () => {
    const link = buildWaMeLink("9876543210", "100% worth it & more");
    expect(link).toContain(encodeURIComponent("100% worth it & more"));
  });
});
