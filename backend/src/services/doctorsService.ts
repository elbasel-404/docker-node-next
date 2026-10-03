// src/services/doctorService.ts

import { prisma } from "../prisma/client";

export async function listDoctors() {
  return prisma.doctor.findMany({
    orderBy: {
      name: "asc",
    },
    select: {
      id: true,
      name: true,
    },
  });
}
