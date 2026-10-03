import { describe, expect, it } from "vitest";
import { starWordToStars } from "./google";

describe("starWordToStars", () => {
  it("maps each Google star-rating word to its numeric value", () => {
    expect(starWordToStars("ONE")).toBe(1);
    expect(starWordToStars("TWO")).toBe(2);
    expect(starWordToStars("THREE")).toBe(3);
    expect(starWordToStars("FOUR")).toBe(4);
    expect(starWordToStars("FIVE")).toBe(5);
  });

  it("returns 0 for an unrecognized or missing rating word", () => {
    expect(starWordToStars("STAR_RATING_UNSPECIFIED")).toBe(0);
    expect(starWordToStars("")).toBe(0);
  });
});
