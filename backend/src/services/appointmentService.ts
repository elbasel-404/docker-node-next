import {
  appointmentListQuerySchema,
  createAppointmentSchema,
  updateAppointmentStatusSchema,
  type AppointmentListQuery,
  type CreateAppointmentInput,
  type UpdateAppointmentStatusInput,
} from "@repo/shared";

import { prisma } from "../prisma/client.js";
import { AppError } from "../errors/AppError.js";
import { isAppointmentConflict } from "../utils/errorCheck.js";
import type { Prisma } from "../prisma/generated/prisma/client.js";

function getDayRange(date: string) {
  // API dates are interpreted as UTC calendar dates.
  const start = new Date(`${date}T00:00:00.000Z`);

  if (Number.isNaN(start.getTime())) {
    throw new AppError(400, "INVALID_DATE", "Invalid date.");
  }

  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);

  return {
    start,
    end,
  };
}

export async function listAppointments(input: AppointmentListQuery) {
  const query = appointmentListQuerySchema.parse(input);

  const where: Prisma.AppointmentWhereInput = {};

  if (query.doctorId) {
    where.doctorId = query.doctorId;
  }

  if (query.status) {
    where.status = query.status;
  }

  if (query.date) {
    const { start, end } = getDayRange(query.date);

    where.startsAt = {
      gte: start,
      lt: end,
    };
  }

  return prisma.appointment.findMany({
    where,
    include: {
      doctor: true,
      imagingStudy: {
        select: {
          id: true,
          appointmentId: true,
          modality: true,
          description: true,
        },
      },
    },
    orderBy: {
      startsAt: "asc",
    },
  });
}

export async function createAppointment(input: CreateAppointmentInput) {
  const data = createAppointmentSchema.parse(input);

  const startsAt = new Date(data.startsAt);

  if (Number.isNaN(startsAt.getTime())) {
    throw new AppError(
      400,
      "INVALID_START_TIME",
      "Invalid appointment start time.",
    );
  }

  const endsAt = new Date(startsAt.getTime() + data.durationMinutes * 60_000);

  if (endsAt <= startsAt) {
    throw new AppError(
      400,
      "INVALID_DURATION",
      "Appointment duration must be positive.",
    );
  }

  const doctor = await prisma.doctor.findUnique({
    where: {
      id: data.doctorId,
    },
  });

  if (!doctor) {
    throw new AppError(404, "DOCTOR_NOT_FOUND", "Doctor not found.");
  }

  try {
    return await prisma.appointment.create({
      data: {
        patientName: data.patientName,
        doctorId: data.doctorId,
        startsAt,
        endsAt,
        reason: data.reason,
      },
      include: {
        doctor: true,
      },
    });
  } catch (error) {
    if (isAppointmentConflict(error)) {
      throw new AppError(
        409,
        "APPOINTMENT_CONFLICT",
        "The doctor already has an appointment during this time.",
      );
    }

    throw error;
  }
}

export async function updateAppointmentStatus(
  appointmentId: string,
  input: UpdateAppointmentStatusInput,
) {
  const data = updateAppointmentStatusSchema.parse(input);

  try {
    return await prisma.appointment.update({
      where: {
        id: appointmentId,
      },
      data: {
        status: data.status,
      },
      include: {
        doctor: true,
        imagingStudy: {
          select: {
            id: true,
            appointmentId: true,
            modality: true,
            description: true,
          },
        },
      },
    });
  } catch (error) {
    // Prisma's not-found error is deliberately converted
    // into our public API error shape.
    if (
      error instanceof Error &&
      error.message.includes("No record was found for an update")
    ) {
      throw new AppError(
        404,
        "APPOINTMENT_NOT_FOUND",
        "Appointment not found.",
      );
    }

    throw error;
  }
}
