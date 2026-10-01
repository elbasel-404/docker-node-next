export class DoctorNotFoundError extends Error {
  constructor() {
    super("Doctor not found");
    this.name = "DoctorNotFoundError";
  }
}

export class AppointmentConflictError extends Error {
  constructor() {
    super("The doctor already has an appointment during this time.");
    this.name = "AppointmentConflictError";
  }
}
