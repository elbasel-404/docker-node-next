import { Prisma } from "../prisma/generated/prisma/client";

export function isAppointmentConflict(error: unknown): boolean {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError)) {
    return false;
  }

  if (error.code !== "P2039") {
    return false;
  }

  const driverError = error.meta?.driverAdapterError;

  if (!driverError || typeof driverError !== "object") {
    return false;
  }

  const message =
    "message" in driverError && typeof driverError.message === "string"
      ? driverError.message
      : "";

  return (
    message.includes("appointment_no_overlap") || message.includes("23P01")
  );
}
