import { fromZonedTime } from "date-fns-tz";
import { validateStartupEnv } from "../config/env.js";
import { AppointmentStatus } from "./generated/prisma/client";
import { prisma } from "./client";

const CLINIC_TIMEZONE = validateStartupEnv().CLINIC_TIMEZONE;

function getClinicDateKey(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: CLINIC_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

async function main() {
  console.log("🌱 Seeding database...");

  const doctors = await Promise.all([
    prisma.doctor.create({
      data: {
        name: "Dr. Sarah Ahmed",
      },
    }),
    prisma.doctor.create({
      data: {
        name: "Dr. John Smith",
      },
    }),
    prisma.doctor.create({
      data: {
        name: "Dr. Michael Brown",
      },
    }),
  ]);

  const [sarah, john, michael] = doctors;
  const seedDate = getClinicDateKey();

  const appointmentOne = await prisma.appointment.create({
    data: {
      patientName: "Patient One",
      doctorId: sarah.id,
      startsAt: fromZonedTime(`${seedDate}T09:00:00`, CLINIC_TIMEZONE),
      endsAt: fromZonedTime(`${seedDate}T09:30:00`, CLINIC_TIMEZONE),
      status: AppointmentStatus.scheduled,
      reason: "Routine follow-up",
    },
  });

  await prisma.appointment.create({
    data: {
      patientName: "Patient Two",
      doctorId: sarah.id,
      startsAt: fromZonedTime(`${seedDate}T10:00:00`, CLINIC_TIMEZONE),
      endsAt: fromZonedTime(`${seedDate}T10:30:00`, CLINIC_TIMEZONE),
      status: AppointmentStatus.checked_in,
      reason: "General consultation",
    },
  });

  await prisma.appointment.create({
    data: {
      patientName: "Patient Three",
      doctorId: john.id,
      startsAt: fromZonedTime(`${seedDate}T11:00:00`, CLINIC_TIMEZONE),
      endsAt: fromZonedTime(`${seedDate}T11:45:00`, CLINIC_TIMEZONE),
      status: AppointmentStatus.completed,
      reason: "Follow-up examination",
    },
  });

  await prisma.appointment.create({
    data: {
      patientName: "Patient Four",
      doctorId: michael.id,
      startsAt: fromZonedTime(`${seedDate}T13:00:00`, CLINIC_TIMEZONE),
      endsAt: fromZonedTime(`${seedDate}T13:30:00`, CLINIC_TIMEZONE),
      status: AppointmentStatus.cancelled,
      reason: "Imaging appointment",
    },
  });

  await prisma.imagingStudy.create({
    data: {
      appointmentId: appointmentOne.id,
      modality: "CT",
      description: "CT scan - single frame",
      dicomFilePath: "data/dicom/sample.dcm",
    },
  });

  console.log("✅ Seed completed");
  console.log(`Created ${doctors.length} doctors`);
  console.log("Created 4 appointments");
  console.log("Created 1 imaging study");
}

main()
  .catch((error) => {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
