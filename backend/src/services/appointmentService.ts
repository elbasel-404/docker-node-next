import {
  type Appointment,
  type AppointmentListQuery,
  type CreateAppointmentInput,
  type UpdateAppointmentStatusInput,
} from "@repo/shared";

import { prisma } from "../prisma/client";
import { AppError } from "../errors/AppError";
import { Prisma } from "../prisma/generated/prisma/client";
import { isAppointmentConflict } from "../utils/errorCheck";
import { getClinicDayRange } from "../utils/timezone";

function toAppointmentDto(
  appointment: Prisma.AppointmentGetPayload<{
    include: {
      doctor: true;
      imagingStudy: {
        select: {
          id: true;
          appointmentId: true;
          modality: true;
          description: true;
        };
      };
    };
  }>,
): Appointment {
  return {
    id: appointment.id,
    patientName: appointment.patientName,
    doctor: {
      id: appointment.doctor.id,
      name: appointment.doctor.name,
    },
    startsAt: appointment.startsAt.toISOString(),
    endsAt: appointment.endsAt.toISOString(),
    status: appointment.status,
    reason: appointment.reason,
    imagingStudy: appointment.imagingStudy
      ? {
          id: appointment.imagingStudy.id,
          appointmentId: appointment.imagingStudy.appointmentId,
          modality: appointment.imagingStudy.modality,
          description: appointment.imagingStudy.description,
        }
      : null,
  };
}

export async function listAppointments(input: AppointmentListQuery) {
  const query = input;

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

  const appointments = await prisma.appointment.findMany({
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

  return appointments.map(toAppointmentDto);
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

  return toAppointmentDto(appointment);
}

export async function createAppointment(input: CreateAppointmentInput) {
  const startsAt = new Date(input.startsAt);
  const endsAt = new Date(startsAt.getTime() + input.durationMinutes * 60_000);

  const doctor = await prisma.doctor.findUnique({
    where: {
      id: input.doctorId,
    },
  });

  if (!doctor) {
    throw new AppError(404, "DOCTOR_NOT_FOUND", "Doctor not found.");
  }

  try {
    const appointment = await prisma.appointment.create({
      data: {
        patientName: input.patientName,
        doctorId: input.doctorId,
        startsAt,
        endsAt,
        reason: input.reason,
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

    return toAppointmentDto(appointment);
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
  try {
    const appointment = await prisma.appointment.update({
      where: {
        id: appointmentId,
      },
      data: {
        status: input.status,
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

    return toAppointmentDto(appointment);
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
