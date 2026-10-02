import { fromZonedTime } from "date-fns-tz";

export const CLINIC_TIMEZONE =
  process.env.NEXT_PUBLIC_CLINIC_TIMEZONE ?? "Africa/Cairo";

export function clinicDateTimeToIso(date: string, time: string): string {
  return fromZonedTime(`${date}T${time}:00`, CLINIC_TIMEZONE).toISOString();
}

export function formatAppointmentTime(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: CLINIC_TIMEZONE,
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export function formatAppointmentDate(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: CLINIC_TIMEZONE,
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}
