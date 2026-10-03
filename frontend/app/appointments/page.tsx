import {
  AppointmentFilters,
  AppointmentList,
  CreateAppointmentCard,
} from "../components";
import { getAppointments } from "../server/appointment";
import { getDoctors } from "../server/doctor";

type PageProps = {
  searchParams: Promise<{
    date?: string;
    doctorId?: string;
    status?: string;
  }>;
};

const VALID_STATUSES = [
  "scheduled",
  "checked_in",
  "completed",
  "cancelled",
] as const;

function getTodayInClinicTimezone() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Cairo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export default async function AppointmentsPage({ searchParams }: PageProps) {
  const params = await searchParams;

  const date = params.date ?? getTodayInClinicTimezone();

  const doctorId = params.doctorId || undefined;

  const status = VALID_STATUSES.includes(params.status as never)
    ? (params.status as (typeof VALID_STATUSES)[number] | undefined)
    : undefined;

  const [appointmentsResponse, doctorsResponse] = await Promise.all([
    getAppointments({
      date,
      doctorId,
      status,
    }),

    getDoctors(),
  ]);

  return (
    <main>
      <header>
        <h1>Appointments</h1>
        <p>Manage today's clinic schedule.</p>
      </header>

      <AppointmentFilters
        date={date}
        doctorId={doctorId}
        status={status}
        doctors={doctorsResponse.data}
      />

      {/* <CreateAppointmentCard
        doctors={doctorsResponse.data}
        defaultDate={date}
      /> */}

      <AppointmentList appointments={appointmentsResponse.data} />
    </main>
  );
}
