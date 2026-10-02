import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { prisma } from "../../prisma/client";
import { createAppointment } from "../../services/appointmentService";
import { createTestDoctor, cleanupTestDoctor } from "../helpers/database";

describe("appointment overlap protection", () => {
  let doctorId: string;

  beforeEach(async () => {
    const doctor = await createTestDoctor();
    doctorId = doctor.id;
  });

  afterEach(async () => {
    await cleanupTestDoctor(doctorId);
  });

  it("rejects overlapping appointments", async () => {
    await createAppointment({
      patientName: "Patient One",
      doctorId: doctorId,
      startsAt: "2026-10-02T10:00:00.000Z",
      durationMinutes: 60,
      reason: "First appointment",
    });

    await expect(
      createAppointment({
        patientName: "Patient Two",
        doctorId: doctorId,
        startsAt: "2026-10-02T10:30:00.000Z",
        durationMinutes: 30,
        reason: "Overlapping appointment",
      }),
    ).rejects.toMatchObject({
      statusCode: 409,
      code: "APPOINTMENT_CONFLICT",
    });
  });

  it("allows adjacent appointments", async () => {
    await createAppointment({
      patientName: "Patient One",
      doctorId: doctorId,
      startsAt: "2026-10-02T10:00:00.000Z",
      durationMinutes: 30,
      reason: "First appointment",
    });

    const second = await createAppointment({
      patientName: "Patient Two",
      doctorId: doctorId,
      startsAt: "2026-10-02T10:30:00.000Z",
      durationMinutes: 30,
      reason: "Adjacent appointment",
    });

    expect(second).toBeDefined();
  });

  it("allows overlap with a cancelled appointment", async () => {
    const existing = await createAppointment({
      patientName: "Patient One",
      doctorId: doctorId,
      startsAt: "2026-10-02T10:00:00.000Z",
      durationMinutes: 60,
      reason: "Cancelled appointment",
    });

    await prisma.appointment.update({
      where: {
        id: existing.id,
      },
      data: {
        status: "cancelled",
      },
    });

    const replacement = await createAppointment({
      patientName: "Patient Two",
      doctorId: doctorId,
      startsAt: "2026-10-02T10:30:00.000Z",
      durationMinutes: 30,
      reason: "Replacement appointment",
    });

    expect(replacement).toBeDefined();
  });
});
