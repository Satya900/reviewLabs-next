import { describe, expect, it } from "vitest";
import { groupThemes } from "./themes";
import type { FeedbackTheme } from "./ai/theme-extract";

describe("groupThemes", () => {
  it("counts occurrences and sorts by frequency, most frequent first", () => {
    const themes: FeedbackTheme[] = ["rude_staff", "long_wait", "rude_staff", "rude_staff", "long_wait"];
    expect(groupThemes(themes)).toEqual([
      { theme: "rude_staff", count: 3 },
      { theme: "long_wait", count: 2 },
    ]);
  });

  it("returns an empty array for no themes", () => {
    expect(groupThemes([])).toEqual([]);
  });

  it("includes a theme with count 1 when it only appears once", () => {
    expect(groupThemes(["great_value"])).toEqual([{ theme: "great_value", count: 1 }]);
  });
});
