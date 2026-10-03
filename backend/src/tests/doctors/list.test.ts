import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { prisma } from "../../prisma/client";
import { createTestDoctor, cleanupTestDoctor } from "../helpers/database";
import { listDoctors } from "../../services/doctorsService";

describe("listDoctors", () => {
  const doctorIds: string[] = [];

  afterEach(async () => {
    for (const doctorId of doctorIds) {
      await cleanupTestDoctor(doctorId);
    }

    doctorIds.length = 0;
  });

  it("returns doctors ordered by name", async () => {
    const zed = await createTestDoctor("Dr. Zed");
    const adam = await createTestDoctor("Dr. Adam");

    doctorIds.push(zed.id, adam.id);

    const doctors = await listDoctors();

    const names = doctors
      .filter((doctor) => doctorIds.includes(doctor.id))
      .map((doctor) => doctor.name);

    expect(names).toEqual(["Dr. Adam", "Dr. Zed"]);
  });

  it("returns only safe doctor fields", async () => {
    const doctor = await createTestDoctor("Dr. Test");
    doctorIds.push(doctor.id);

    const doctors = await listDoctors();

    const result = doctors.find((item) => item.id === doctor.id);

    expect(result).toEqual({
      id: doctor.id,
      name: "Dr. Test",
    });
  });
});
