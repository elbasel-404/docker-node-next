import { fromZonedTime } from "date-fns-tz";
import { validateStartupEnv } from "../config/env.js";
import { AppError } from "../errors/AppError.js";

const CLINIC_TIMEZONE = validateStartupEnv().CLINIC_TIMEZONE;

export function getClinicTimezone(): string {
  return CLINIC_TIMEZONE;
}

/**
 * Get the start and end boundaries of a clinic-local calendar day.
 *
 * For example, `getClinicDayRange("2026-10-02")` returns:
 * - start: 2026-10-02 00:00:00 in CLINIC_TIMEZONE (as a UTC instant)
 * - end: 2026-10-03 00:00:00 in CLINIC_TIMEZONE (as a UTC instant)
 *
 * This is used to filter appointments for a specific calendar day
 * as observed in the clinic timezone, not UTC.
 */
export function getClinicDayRange(date: string): {
  start: Date;
  end: Date;
} {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new AppError(400, "INVALID_DATE", "Date must use YYYY-MM-DD format.");
  }

  // Convert clinic-local midnight to a UTC instant
  const start = fromZonedTime(`${date}T00:00:00`, getClinicTimezone());

  if (Number.isNaN(start.getTime())) {
    throw new AppError(400, "INVALID_DATE", "Invalid date.");
  }

  // Calculate the next calendar day in the clinic timezone
  const parts = date.split("-");
  const year = parseInt(parts[0]!, 10);
  const month = parseInt(parts[1]!, 10);
  const day = parseInt(parts[2]!, 10);

  const nextLocalDay = new Date(Date.UTC(year, month - 1, day + 1));

  const nextDateString = [
    nextLocalDay.getUTCFullYear(),
    String(nextLocalDay.getUTCMonth() + 1).padStart(2, "0"),
    String(nextLocalDay.getUTCDate()).padStart(2, "0"),
  ].join("-");

  const end = fromZonedTime(`${nextDateString}T00:00:00`, getClinicTimezone());

  return { start, end };
}
