import type { CreateAppointmentInput } from "@shared";
import { prisma } from "../prisma/prisma";
import { DoctorNotFoundError } from "../errors";

export async function createAppointment(input: CreateAppointmentInput) {
  const doctor = await prisma.doctor.findUnique({
    where: {
      id: input.doctorId,
    },
  });

  if (!doctor) {
    throw new DoctorNotFoundError();
  }

  const startsAt = new Date(input.startsAt);

  if (Number.isNaN(startsAt.getTime())) {
    throw new Error("Invalid appointment start time");
  }

  const endsAt = new Date(startsAt.getTime() + input.durationMinutes * 60_000);

  if (Number.isNaN(endsAt.getTime())) {
    throw new Error("Invalid appointment duration");
  }

  return prisma.appointment.create({
    data: {
      patientName: input.patientName,
      doctorId: input.doctorId,
      startsAt,
      endsAt,
      status: input.status,
      reason: input.reason,
    },
    include: {
      doctor: true,
    },
  });
}
