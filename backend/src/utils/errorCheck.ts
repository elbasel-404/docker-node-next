import { Prisma } from "../prisma/generated/prisma/client";

export function isAppointmentConflict(error: unknown): boolean {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError)) {
    return false;
  }

  return (
    error.code === "P2010" && error.message.includes("appointment_no_overlap")
  );
}
