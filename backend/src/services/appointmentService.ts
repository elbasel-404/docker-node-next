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
import { Prisma } from "../prisma/generated/prisma/client.js";
import { isAppointmentConflict } from "../utils/errorCheck.js";
import { getClinicDayRange } from "../utils/timezone.js";

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
    const { start, end } = getClinicDayRange(query.date);

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

export async function getAppointment(appointmentId: string) {
  const appointment = await prisma.appointment.findUnique({
    where: {
      id: appointmentId,
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

  if (!appointment) {
    throw new AppError(404, "APPOINTMENT_NOT_FOUND", "Appointment not found.");
  }

  return appointment;
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
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        throw new AppError(
          404,
          "APPOINTMENT_NOT_FOUND",
          "Appointment not found.",
        );
      }
    }

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
