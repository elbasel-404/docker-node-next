import { expect, it } from "vitest";
import { createAppointment } from "../../services/appointmentService";

it("rejects an invalid start date", async () => {
  await expect(
    createAppointment({
      patientName: "Patient",
      doctorId: "00000000-0000-0000-0000-000000000000",
      startsAt: "not-a-date",
      durationMinutes: 30,
      reason: "Checkup",
    }),
  ).rejects.toThrow();
});
