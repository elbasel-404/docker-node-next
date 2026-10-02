import { randomUUID } from "node:crypto";
import { prisma } from "../../prisma/client";

export async function createTestDoctor() {
  return prisma.doctor.create({
    data: {
      id: randomUUID(),
      name: "Test Doctor",
    },
  });
}

export async function cleanupTestDoctor(doctorId: string) {
  await prisma.appointment.deleteMany({
    where: { doctorId },
  });

  await prisma.doctor.delete({
    where: { id: doctorId },
  });
}
