"use client";

import type { Doctor } from "@repo/shared";
import { useState } from "react";
import { toast } from "sonner";
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

  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

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
        toast.error(result.message);
        return;
      }

      toast.success("Appointment created successfully.");

      setPatientName("");
      setReason("");
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="appointment-form-card card">
      <div className="form-header">
        <div>
          <p className="eyebrow">Appointments</p>
          <h2 className="form-title">Create appointment</h2>
          <p className="form-description">
            Schedule a new patient appointment with a doctor.
          </p>
        </div>

        <div className="form-icon" aria-hidden="true">
          +
        </div>
      </div>

      <form className="appointment-form" onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="field field-full">
            <label htmlFor="patientName">Patient name</label>
            <input
              className="input"
              id="patientName"
              value={patientName}
              onChange={(event) => setPatientName(event.target.value)}
              placeholder="Enter patient name"
              autoComplete="name"
              required
            />
          </div>

          <div className="field">
            <label htmlFor="doctorId">Doctor</label>

            <select
              className="select"
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

          <div className="field">
            <label htmlFor="duration">Duration</label>

            <div className="input-with-suffix">
              <input
                className="input"
                id="duration"
                type="number"
                min="5"
                max="480"
                step="5"
                value={durationMinutes}
                onChange={(event) => setDurationMinutes(event.target.value)}
                required
              />
              <span>min</span>
            </div>
          </div>

          <div className="field">
            <label htmlFor="appointmentDate">Date</label>

            <input
              className="input"
              id="appointmentDate"
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              required
            />
          </div>

          <div className="field">
            <label htmlFor="appointmentTime">Start time</label>

            <input
              className="input"
              id="appointmentTime"
              type="time"
              value={time}
              onChange={(event) => setTime(event.target.value)}
              required
            />
          </div>

          <div className="field field-full">
            <label htmlFor="reason">Reason for visit</label>

            <textarea
              className="input textarea"
              id="reason"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="Briefly describe the reason for the appointment..."
              rows={4}
              required
            />
          </div>
        </div>

        <div className="form-actions">
          <p className="required-hint">
            <span>*</span> Required fields
          </p>

          <button
            className="btn btn-primary submit-btn"
            type="submit"
            disabled={pending || doctors.length === 0}
          >
            {pending ? (
              <>
                <span className="button-spinner" aria-hidden="true" />
                Creating...
              </>
            ) : (
              <>
                <span aria-hidden="true">+</span>
                Create appointment
              </>
            )}
          </button>
        </div>
      </form>
    </section>
  );
}
