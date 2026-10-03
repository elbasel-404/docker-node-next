import { fromZonedTime, formatInTimeZone } from "date-fns-tz";

export const CLINIC_TIMEZONE = process.env.CLINIC_TIMEZONE ?? "Africa/Cairo";

export function clinicDateTimeToIso(date: string, time: string) {
  return fromZonedTime(`${date}T${time}:00`, CLINIC_TIMEZONE).toISOString();
}

export function formatAppointmentTime(value: string) {
  return formatInTimeZone(value, CLINIC_TIMEZONE, "h:mm a");
}

export function formatAppointmentDate(value: string) {
  return formatInTimeZone(value, CLINIC_TIMEZONE, "MMM d, yyyy");
}
