import { describe, expect, it } from "vitest";
import { FEEDBACK_THEMES, normalizeThemeOutput } from "./theme-extract";

describe("normalizeThemeOutput", () => {
  it("accepts a clean, exact-match theme key", () => {
    expect(normalizeThemeOutput("rude_staff", 2)).toBe("rude_staff");
  });

  it("trims whitespace and lowercases before matching", () => {
    expect(normalizeThemeOutput("  Long_Wait  \n", 2)).toBe("long_wait");
  });

  it("strips trailing punctuation the model might add", () => {
    expect(normalizeThemeOutput("great_value.", 5)).toBe("great_value");
  });

  it("falls back to other_complaint for low stars when the model goes off-list", () => {
    expect(normalizeThemeOutput("the staff seemed a bit short with me", 2)).toBe("other_complaint");
  });

  it("falls back to other_praise for high stars when the model goes off-list", () => {
    expect(normalizeThemeOutput("honestly just a great experience overall", 5)).toBe("other_praise");
  });

  it("every value in FEEDBACK_THEMES round-trips through normalization unchanged", () => {
    for (const theme of FEEDBACK_THEMES) {
      expect(normalizeThemeOutput(theme, 3)).toBe(theme);
    }
  });
});
