export function isAppointmentConflictError(error: unknown): boolean {
  if (!error || typeof error !== "object") {
    return false;
  }

  const candidate = error as {
    code?: unknown;
    message?: unknown;
    meta?: {
      constraint?: unknown;
    };
  };

  const message =
    typeof candidate.message === "string" ? candidate.message : "";

  const constraint =
    typeof candidate.meta?.constraint === "string"
      ? candidate.meta.constraint
      : "";

  return (
    (candidate.code === "P2004" &&
      constraint === "appointment_doctor_no_overlap") ||
    message.includes("appointment_doctor_no_overlap") ||
    message.includes("23P01")
  );
}
