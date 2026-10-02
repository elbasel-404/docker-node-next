import { fromZonedTime, toZonedTime } from "date-fns-tz";

const CLINIC_TIMEZONE = "Africa/Cairo";

/**
 * Get the configured clinic timezone.
 */
export function getClinicTimezone(): string {
  return CLINIC_TIMEZONE;
}

/**
 * Format an appointment time (hour:minute) in the clinic timezone.
 *
 * Example: "2026-10-02T10:30:00+03:00" → "10:30"
 */
export function formatAppointmentTime(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: CLINIC_TIMEZONE,
    hour: "numeric",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(value));
}

/**
 * Format an appointment date (short form) in the clinic timezone.
 *
 * Example: "2026-10-02T10:30:00+03:00" → "Oct 2, 2026"
 */
export function formatAppointmentDate(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: CLINIC_TIMEZONE,
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

/**
 * Format an appointment date and time together in the clinic timezone.
 *
 * Example: "2026-10-02T10:30:00+03:00" → "Oct 2, 2026 10:30"
 */
export function formatAppointmentDateTime(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: CLINIC_TIMEZONE,
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(value));
}

/**
 * Convert a clinic-local date and time to an ISO-8601 string with offset.
 *
 * This takes separate date and time inputs as would come from an HTML form
 * and converts them to a single ISO timestamp with the clinic timezone offset.
 *
 * Example: clinicDateTimeToIso("2026-10-02", "10:30") → "2026-10-02T10:30:00+03:00"
 */
export function clinicDateTimeToIso(
  date: string,
  time: string,
): string {
  // Combine date and time, then interpret them in the clinic timezone
  const instant = fromZonedTime(
    `${date}T${time}:00`,
    CLINIC_TIMEZONE,
  );

  if (Number.isNaN(instant.getTime())) {
    throw new Error("Invalid date or time");
  }

  return instant.toISOString();
}

/**
 * Get the clinic-local date (YYYY-MM-DD) from an ISO timestamp.
 *
 * Example: "2026-10-02T10:30:00+03:00" → "2026-10-02"
 */
export function getClinicLocalDate(value: string): string {
  const zonedDate = toZonedTime(new Date(value), CLINIC_TIMEZONE);

  const year = zonedDate.getUTCFullYear();
  const month = String(zonedDate.getUTCMonth() + 1).padStart(2, "0");
  const day = String(zonedDate.getUTCDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

/**
 * Get the clinic-local time (HH:mm) from an ISO timestamp.
 *
 * Example: "2026-10-02T10:30:00+03:00" → "10:30"
 */
export function getClinicLocalTime(value: string): string {
  const zonedDate = toZonedTime(new Date(value), CLINIC_TIMEZONE);

  const hours = String(zonedDate.getUTCHours()).padStart(2, "0");
  const minutes = String(zonedDate.getUTCMinutes()).padStart(2, "0");

  return `${hours}:${minutes}`;
}
