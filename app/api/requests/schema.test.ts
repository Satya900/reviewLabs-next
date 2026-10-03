import { describe, expect, it } from "vitest";
import { payloadSchema } from "./route";

const validEmailPayload = {
  outletId: "691e1ae3-f922-4cce-9114-399015da3a2e",
  channel: "email" as const,
  customerName: "Aditi",
  customerContact: "aditi@example.com",
};

describe("requests payloadSchema", () => {
  it("accepts a valid email request", () => {
    expect(payloadSchema.safeParse(validEmailPayload).success).toBe(true);
  });

  it("accepts a valid whatsapp request with a phone number (no @ required)", () => {
    const result = payloadSchema.safeParse({
      ...validEmailPayload,
      channel: "whatsapp",
      customerContact: "9876543210",
    });
    expect(result.success).toBe(true);
  });

  it("rejects an email channel whose contact has no @", () => {
    const result = payloadSchema.safeParse({ ...validEmailPayload, customerContact: "9876543210" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.customerContact).toBeDefined();
    }
  });

  it("rejects an unrecognized channel", () => {
    expect(payloadSchema.safeParse({ ...validEmailPayload, channel: "sms" }).success).toBe(false);
  });

  it("rejects an empty customer name", () => {
    expect(payloadSchema.safeParse({ ...validEmailPayload, customerName: "  " }).success).toBe(false);
  });

  it("rejects an empty customer contact", () => {
    expect(payloadSchema.safeParse({ ...validEmailPayload, customerContact: "" }).success).toBe(false);
  });

  it("rejects a missing outletId", () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { outletId, ...rest } = validEmailPayload;
    expect(payloadSchema.safeParse(rest).success).toBe(false);
  });

  it("trims whitespace from customerName and customerContact", () => {
    const result = payloadSchema.safeParse({
      ...validEmailPayload,
      customerName: "  Aditi  ",
      customerContact: "  aditi@example.com  ",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.customerName).toBe("Aditi");
      expect(result.data.customerContact).toBe("aditi@example.com");
    }
  });
});
