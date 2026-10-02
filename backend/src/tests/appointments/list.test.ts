import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { prisma } from "../../prisma/client";
import {
  createAppointment,
  listAppointments,
} from "../../services/appointmentService";
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
    await createAppointment({
      patientName: "Today",
      doctorId: doctorId,
      startsAt: "2026-10-02T09:00:00.000Z",
      durationMinutes: 30,
      reason: "Today",
    });

    await createAppointment({
      patientName: "Tomorrow",
      doctorId: doctorId,
      startsAt: "2026-10-03T09:00:00.000Z",
      durationMinutes: 30,
      reason: "Tomorrow",
    });

    const appointments = await listAppointments({
      date: "2026-10-02",
      doctorId: doctorId,
    });

    expect(appointments).toHaveLength(1);
    expect(appointments[0]?.patientName).toBe("Today");
  });

  it("combines date and status filters", async () => {
    const first = await createAppointment({
      patientName: "Checked In",
      doctorId: doctorId,
      startsAt: "2026-10-02T09:00:00.000Z",
      durationMinutes: 30,
      reason: "First",
    });

    await createAppointment({
      patientName: "Scheduled",
      doctorId: doctorId,
      startsAt: "2026-10-02T10:00:00.000Z",
      durationMinutes: 30,
      reason: "Second",
    });

    await prisma.appointment.update({
      where: {
        id: first.id,
      },
      data: {
        status: "checked_in",
      },
    });

    const appointments = await listAppointments({
      date: "2026-10-02",
      doctorId: doctorId,
      status: "checked_in",
    });

    expect(appointments).toHaveLength(1);
    expect(appointments[0]?.patientName).toBe("Checked In");
  });
});
