"use client";

import { AppointmentStatus } from "@repo/shared";
import { useState, useTransition } from "react";
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
    <div>
      <label
        htmlFor={`status-${appointmentId}`}
        aria-label={`Status for ${patientName}`}
      >
        Status for {patientName}
      </label>

      <select
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

      {error && <span role="alert">{error}</span>}
      {success && <span role="status">{success}</span>}
    </div>
  );
}
