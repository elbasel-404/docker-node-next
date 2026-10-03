import { AppointmentStatus } from "./generated/prisma/client";
import { prisma } from "./client";

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

  const appointmentOne = await prisma.appointment.create({
    data: {
      patientName: "Patient One",
      doctorId: sarah.id,
      startsAt: new Date("2026-10-02T09:00:00+03:00"),
      endsAt: new Date("2026-10-02T09:30:00+03:00"),
      status: AppointmentStatus.scheduled,
      reason: "Routine follow-up",
    },
  });

  await prisma.appointment.create({
    data: {
      patientName: "Patient Two",
      doctorId: sarah.id,
      startsAt: new Date("2026-10-02T10:00:00+03:00"),
      endsAt: new Date("2026-10-02T10:30:00+03:00"),
      status: AppointmentStatus.checked_in,
      reason: "General consultation",
    },
  });

  await prisma.appointment.create({
    data: {
      patientName: "Patient Three",
      doctorId: john.id,
      startsAt: new Date("2026-10-02T11:00:00+03:00"),
      endsAt: new Date("2026-10-02T11:45:00+03:00"),
      status: AppointmentStatus.completed,
      reason: "Follow-up examination",
    },
  });

  await prisma.appointment.create({
    data: {
      patientName: "Patient Four",
      doctorId: michael.id,
      startsAt: new Date("2026-10-02T13:00:00+03:00"),
      endsAt: new Date("2026-10-02T13:30:00+03:00"),
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
