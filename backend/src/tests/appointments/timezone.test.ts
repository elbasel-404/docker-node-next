import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { listAppointments } from "../../services/appointmentService";
import { createTestDoctor, cleanupTestDoctor } from "../helpers/database";
import { prisma } from "../../prisma/client.js";

describe("Timezone-aware appointment filtering", () => {
  let doctorId: string;

  beforeEach(async () => {
    const doctor = await createTestDoctor();
    doctorId = doctor.id;
  });

  afterEach(async () => {
    await cleanupTestDoctor(doctorId);
  });

  it("filters appointments by clinic-local calendar day (Cairo timezone)", async () => {
    // Create an appointment at 00:30 on Oct 2 in Cairo timezone.
    // Cairo is UTC+3 in October, so 00:30 Cairo = 21:30 UTC on Oct 1.
    await prisma.appointment.create({
      data: {
        patientName: "Night Appointment",
        doctorId,
        startsAt: new Date("2026-10-01T21:30:00.000Z"),
        endsAt: new Date("2026-10-01T22:00:00.000Z"),
        reason: "Night appointment",
      },
    });

    // Create an appointment at 10:00 on Oct 2 in Cairo timezone.
    // 10:00 Cairo = 07:00 UTC on Oct 2.
    await prisma.appointment.create({
      data: {
        patientName: "Morning Appointment",
        doctorId,
        startsAt: new Date("2026-10-02T07:00:00.000Z"),
        endsAt: new Date("2026-10-02T07:30:00.000Z"),
        reason: "Morning appointment",
      },
    });

    // Create an appointment at 23:30 on Oct 2 in Cairo timezone.
    // 23:30 Cairo = 20:30 UTC on Oct 2.
    await prisma.appointment.create({
      data: {
        patientName: "Late Appointment",
        doctorId,
        startsAt: new Date("2026-10-02T20:30:00.000Z"),
        endsAt: new Date("2026-10-02T21:00:00.000Z"),
        reason: "Late appointment",
      },
    });

    // Filter for appointments on Oct 2 in Cairo timezone
    const appointments = await listAppointments({
      date: "2026-10-02",
      doctorId,
    });

    // Should find all three appointments (they all fall within Oct 2 in Cairo)
    expect(appointments).toHaveLength(3);
    expect(appointments.map((a) => a.patientName).sort()).toEqual([
      "Late Appointment",
      "Morning Appointment",
      "Night Appointment",
    ]);
  });

  it("does not include appointments from previous or next calendar day", async () => {
    // Create an appointment at 23:59 on Oct 1 in Cairo timezone.
    // 23:59 Cairo on Oct 1 = 20:59 UTC on Oct 1.
    await prisma.appointment.create({
      data: {
        patientName: "Oct 1 Late",
        doctorId,
        startsAt: new Date("2026-10-01T20:59:00.000Z"),
        endsAt: new Date("2026-10-01T21:29:00.000Z"),
        reason: "Oct 1 appointment",
      },
    });

    // Create an appointment at 00:01 on Oct 3 in Cairo timezone.
    // 00:01 Cairo on Oct 3 = 21:01 UTC on Oct 2.
    await prisma.appointment.create({
      data: {
        patientName: "Oct 3 Early",
        doctorId,
        startsAt: new Date("2026-10-02T21:01:00.000Z"),
        endsAt: new Date("2026-10-02T21:31:00.000Z"),
        reason: "Oct 3 appointment",
      },
    });

    // Filter for appointments on Oct 2 in Cairo timezone
    const appointments = await listAppointments({
      date: "2026-10-02",
      doctorId,
    });

    // Should not find any appointments (both are on adjacent days in Cairo)
    expect(appointments).toHaveLength(0);
  });

  it("correctly handles DST boundaries", async () => {
    // Cairo doesn't observe DST, but this documents the behavior.
    // Just create a normal appointment in the middle of Oct 2.
    await prisma.appointment.create({
      data: {
        patientName: "Test Appointment",
        doctorId,
        startsAt: new Date("2026-10-02T10:00:00.000Z"),
        endsAt: new Date("2026-10-02T10:30:00.000Z"),
        reason: "Test",
      },
    });

    const appointments = await listAppointments({
      date: "2026-10-02",
      doctorId,
    });

    expect(appointments).toHaveLength(1);
    expect(appointments[0]?.patientName).toBe("Test Appointment");
  });
});
