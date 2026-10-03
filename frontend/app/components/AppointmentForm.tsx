"use client";

import type { Doctor } from "@repo/shared";
import { useState } from "react";
import { createAppointmentAction } from "../server/actions/createAppointmentAction";
import { clinicDateTimeToIso } from "../utils/timezone";

type Props = {
  doctors: Doctor[];
  defaultDate: string;
};

export function AppointmentForm({ doctors, defaultDate }: Props) {
  const [patientName, setPatientName] = useState("");
  const [doctorId, setDoctorId] = useState(doctors[0]?.id ?? "");
  const [date, setDate] = useState(defaultDate);
  const [time, setTime] = useState("09:00");
  const [durationMinutes, setDurationMinutes] = useState("30");
  const [reason, setReason] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError(null);
    setSuccess(null);
    setPending(true);

    try {
      const result = await createAppointmentAction({
        patientName,
        doctorId,
        startsAt: clinicDateTimeToIso(date, time),
        durationMinutes: Number(durationMinutes),
        reason,
      });

      if (!result.success) {
        setError(result.message);
        return;
      }

      setSuccess("Appointment created successfully.");

      setPatientName("");
      setReason("");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="patientName">Patient name</label>

        <input
          id="patientName"
          value={patientName}
          onChange={(event) => setPatientName(event.target.value)}
          required
        />
      </div>

      <div>
        <label htmlFor="doctorId">Doctor</label>

        <select
          id="doctorId"
          value={doctorId}
          onChange={(event) => setDoctorId(event.target.value)}
          required
        >
          <option value="" disabled>
            Select a doctor
          </option>

          {doctors.map((doctor) => (
            <option key={doctor.id} value={doctor.id}>
              {doctor.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="appointmentDate">Date</label>

        <input
          id="appointmentDate"
          type="date"
          value={date}
          onChange={(event) => setDate(event.target.value)}
          required
        />
      </div>

      <div>
        <label htmlFor="appointmentTime">Start time</label>

        <input
          id="appointmentTime"
          type="time"
          value={time}
          onChange={(event) => setTime(event.target.value)}
          required
        />
      </div>

      <div>
        <label htmlFor="duration">Duration (minutes)</label>

        <input
          id="duration"
          type="number"
          min="5"
          max="480"
          step="5"
          value={durationMinutes}
          onChange={(event) => setDurationMinutes(event.target.value)}
          required
        />
      </div>

      <div>
        <label htmlFor="reason">Reason</label>

        <textarea
          id="reason"
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          required
        />
      </div>

      {error && <p role="alert">{error}</p>}

      {success && <p role="status">{success}</p>}

      <button type="submit" disabled={pending || doctors.length === 0}>
        {pending ? "Creating..." : "Create appointment"}
      </button>
    </form>
  );
}
