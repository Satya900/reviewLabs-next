import { describe, expect, it } from "vitest";
import { payloadSchema } from "./route";

const validPayload = {
  outletSlug: "smile-studio-indiranagar",
  ratingId: null,
  stars: 5,
  choseChannel: "google" as const,
};

describe("feedback payloadSchema", () => {
  it("accepts a minimal valid submission", () => {
    expect(payloadSchema.safeParse(validPayload).success).toBe(true);
  });

  it("accepts an optional requestId, including the demo-mode placeholder", () => {
    expect(payloadSchema.safeParse({ ...validPayload, requestId: "demo-request" }).success).toBe(true);
    expect(
      payloadSchema.safeParse({ ...validPayload, requestId: "11111111-1111-1111-1111-111111111111" })
        .success
    ).toBe(true);
    expect(payloadSchema.safeParse({ ...validPayload, requestId: null }).success).toBe(true);
  });

  it("rejects a star rating outside 1-5", () => {
    expect(payloadSchema.safeParse({ ...validPayload, stars: 0 }).success).toBe(false);
    expect(payloadSchema.safeParse({ ...validPayload, stars: 6 }).success).toBe(false);
  });

  it("rejects a non-integer star rating", () => {
    expect(payloadSchema.safeParse({ ...validPayload, stars: 3.5 }).success).toBe(false);
  });

  it("rejects an unrecognized choseChannel", () => {
    expect(payloadSchema.safeParse({ ...validPayload, choseChannel: "sms" }).success).toBe(false);
  });

  it("rejects a missing outletSlug", () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { outletSlug, ...rest } = validPayload;
    expect(payloadSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects an empty outletSlug", () => {
    expect(payloadSchema.safeParse({ ...validPayload, outletSlug: "" }).success).toBe(false);
  });

  it("accepts private-feedback answers as a string map", () => {
    const result = payloadSchema.safeParse({
      ...validPayload,
      choseChannel: "private",
      answers: { what_went_wrong: "Waited 40 minutes", what_would_fix_it: "Faster check-in" },
    });
    expect(result.success).toBe(true);
  });

  it("rejects a publicComment over 500 characters", () => {
    const result = payloadSchema.safeParse({ ...validPayload, publicComment: "a".repeat(501) });
    expect(result.success).toBe(false);
  });
});
