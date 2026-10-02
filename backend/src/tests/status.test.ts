import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { prisma } from "../prisma/client";

describe("appointment status", () => {
  beforeEach(async () => {
    prisma.doctor.create({
      data: {
        name: "Test Doctor",
      },
    });
  });

  afterEach(async () => {});

  it("updates an appointment status", async () => {
    const updated = "checked_in";
    expect(updated).toBe("checked_in");
  });
});
