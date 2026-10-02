import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { prisma } from "../../prisma/client";
import { createAppointment } from "../../services/appointmentService";
import { createTestDoctor, cleanupTestDoctor } from "../helpers/database";

describe("concurrent appointment creation", () => {
  let docterId: string;

  beforeEach(async () => {
    const doctor = await createTestDoctor();
    docterId = doctor.id;
  });

  afterEach(async () => {
    await cleanupTestDoctor(docterId);
  });

  it("allows only one conflicting request to succeed", async () => {
    const baseInput = {
      doctorId: docterId,
      startsAt: "2026-10-02T14:00:00.000Z",
      durationMinutes: 30,
      reason: "Concurrent appointment",
    };

    const results = await Promise.allSettled([
      createAppointment({
        ...baseInput,
        patientName: "Patient A",
      }),

      createAppointment({
        ...baseInput,
        patientName: "Patient B",
      }),
    ]);

    const successful = results.filter(
      (result) => result.status === "fulfilled",
    );

    const failed = results.filter((result) => result.status === "rejected");

    expect(successful).toHaveLength(1);
    expect(failed).toHaveLength(1);

    const rejected = failed[0];

    expect(rejected).toBeDefined();

    if (rejected?.status === "rejected") {
      expect(rejected.reason).toMatchObject({
        statusCode: 409,
        code: "APPOINTMENT_CONFLICT",
      });
    }

    const appointments = await prisma.appointment.findMany({
      where: {
        doctorId: docterId,
      },
    });

    expect(appointments).toHaveLength(1);
  });
});
