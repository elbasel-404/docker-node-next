import { expect, it } from "vitest";
import { createAppointment } from "../../services/appointmentService";

it("rejects an invalid doctor ID", async () => {
  await expect(
    createAppointment({
      patientName: "Patient",
      doctorId: "not-a-uuid",
      startsAt: "2026-10-02T09:00:00.000Z",
      durationMinutes: 30,
      reason: "Checkup",
    }),
  ).rejects.toThrow();
});
