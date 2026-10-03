import Link from "next/link";

import { StatusSelect } from "./StatusSelect";
import { formatAppointmentTime } from "../utils/timezone";

type Appointment = {
  id: string;
  patientName: string;
  doctor: {
    id: string;
    name: string;
  };
  startsAt: string;
  endsAt: string;
  status: "scheduled" | "checked_in" | "completed" | "cancelled";
  reason: string;
  imagingStudy: {
    id: string;
    modality: string;
    description: string | null;
  } | null;
};

export function AppointmentList({
  appointments,
}: {
  appointments: Appointment[];
}) {
  if (appointments.length === 0) {
    return (
      <section>
        <h2>Appointments</h2>
        <p>No appointments match the selected filters.</p>
      </section>
    );
  }

  return (
    <section>
      <h2>Appointments</h2>

      <div>
        {appointments.map((appointment) => (
          <article key={appointment.id}>
            <header>
              <div>
                <strong>{formatAppointmentTime(appointment.startsAt)}</strong>

                {" – "}

                <span>{formatAppointmentTime(appointment.endsAt)}</span>
              </div>

              <StatusSelect
                appointmentId={appointment.id}
                status={appointment.status}
                patientName={appointment.patientName}
              />
            </header>

            <div>
              <h3>{appointment.patientName}</h3>

              <p>{appointment.doctor.name}</p>

              <p>{appointment.reason}</p>
            </div>

            {appointment.imagingStudy && (
              <Link href={`/appointments/${appointment.id}/scan`}>
                View scan
              </Link>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
