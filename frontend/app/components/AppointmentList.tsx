import { type Appointment } from "@repo/shared";
import Link from "next/link";

import { StatusSelect } from "./StatusSelect";
import { formatAppointmentTime } from "../utils/timezone";

export function AppointmentList({
  appointments,
}: {
  appointments: Appointment[];
}) {
  if (appointments.length === 0) {
    return (
      <section className="card empty">
        <strong>No appointments found</strong>
        Try another date or clear the filters.
      </section>
    );
  }

  return (
    <section aria-label="Appointments">
      <ul className="appt-list">
        {appointments.map((appointment) => (
          <li key={appointment.id}>
            <article className="appt" data-status={appointment.status}>
              <div className="appt-time">
                {formatAppointmentTime(appointment.startsAt)}
                {" - "}
                <span>{formatAppointmentTime(appointment.endsAt)}</span>
              </div>

              <div>
                <h3 className="appt-patient">{appointment.patientName}</h3>
                <p className="appt-meta">{appointment.doctor.name}</p>
                <p className="appt-meta">{appointment.reason}</p>
              </div>

              <div className="appt-footer">
                <StatusSelect
                  appointmentId={appointment.id}
                  status={appointment.status}
                  patientName={appointment.patientName}
                />

                {appointment.imagingStudy && (
                  <Link
                    className="btn btn-primary"
                    href={`/appointments/${appointment.id}/scan`}
                  >
                    View scan
                  </Link>
                )}
              </div>
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}
