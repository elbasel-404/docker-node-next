import { describe, beforeEach, afterEach, it, expect } from "vitest";
import { prisma } from "../../prisma/client";
import { listAppointments } from "../../services/appointmentService";
import { createTestDoctor, cleanupTestDoctor } from "../helpers/database";

describe("listAppointments", () => {
  let doctorId: string;

  beforeEach(async () => {
    const doctor = await createTestDoctor();
    doctorId = doctor.id;
  });

  afterEach(async () => {
    await cleanupTestDoctor(doctorId);
  });

  it("filters appointments by date", async () => {
    await prisma.appointment.create({
      data: {
        patientName: "Today",
        doctorId,
        startsAt: new Date("2026-10-02T09:00:00.000Z"),
        endsAt: new Date("2026-10-02T09:30:00.000Z"),
        reason: "Today",
      },
    });

    await prisma.appointment.create({
      data: {
        patientName: "Tomorrow",
        doctorId,
        startsAt: new Date("2026-10-03T09:00:00.000Z"),
        endsAt: new Date("2026-10-03T09:30:00.000Z"),
        reason: "Tomorrow",
      },
    });

    const appointments = await listAppointments({
      date: "2026-10-02",
    });

    expect(appointments).toHaveLength(1);
    expect(appointments[0]?.patientName).toBe("Today");
  });
});
