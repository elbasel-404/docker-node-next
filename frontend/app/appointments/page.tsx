import { AppointmentList } from "../components/AppointmentList";
import { AppointmentFilters } from "../components/AppointmentsFilter";
import { CreateAppointmentCard } from "../components/CreateAppointmentCard";
import { getAppointments } from "../server/lib/appointment";
import { getDoctors } from "../server/lib/doctor";

type PageProps = {
  searchParams: Promise<{
    date?: string;
    doctorId?: string;
    status?: string;
  }>;
};

function getToday() {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Cairo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  return formatter.format(new Date());
}

export default async function AppointmentsPage({ searchParams }: PageProps) {
  const params = await searchParams;

  const date = params.date ?? getToday();

  const doctorId = params.doctorId || undefined;

  const status =
    params.status === "scheduled" ||
    params.status === "checked_in" ||
    params.status === "completed" ||
    params.status === "cancelled"
      ? params.status
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
      <h1>Appointments</h1>

      <AppointmentFilters
        date={date}
        doctorId={doctorId}
        status={status}
        doctors={doctorsResponse.data}
      />

      <AppointmentList appointments={appointmentsResponse.data} />
      {/* <CreateAppointmentCard
        doctors={doctorsResponse.data}
        defaultDate={date}
      /> */}
    </main>
  );
}
