"use client";

import { AppointmentStatus } from "@repo/shared";
import { useEffect, useState, useTransition } from "react";
import { updateAppointmentStatusAction } from "../server/actions/updateStatusAction";

type Props = {
  appointmentId: string;
  status: AppointmentStatus;
  patientName: string;
};

export function StatusSelect({ appointmentId, status, patientName }: Props) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!success) return;

    const timer = setTimeout(() => setSuccess(null), 3000);

    return () => clearTimeout(timer);
  }, [success]);

  async function handleChange(nextStatus: AppointmentStatus) {
    setError(null);
    setSuccess(null);

    startTransition(async () => {
      const result = await updateAppointmentStatusAction(appointmentId, {
        status: nextStatus,
      });

      if (!result.success) {
        setError(result.message);
        return;
      }

      setSuccess("Status updated");
    });
  }

  return (
    <div className="status">
      <label className="sr-only" htmlFor={`status-${appointmentId}`}>
        Status for {patientName}
      </label>

      <div className="status-control" data-status={status}>
        <select
          className="select"
          id={`status-${appointmentId}`}
          value={status}
          disabled={isPending}
          onChange={(event) =>
            handleChange(event.target.value as AppointmentStatus)
          }
        >
          <option value="scheduled">Scheduled</option>
          <option value="checked_in">Checked in</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="status-msg">
        {isPending && <span className="muted">Saving…</span>}
        {error && (
          <span className="error" role="alert">
            {error}
          </span>
        )}
        {success && (
          <span className="ok" role="status">
            {success}
          </span>
        )}
      </div>
    </div>
  );
}
