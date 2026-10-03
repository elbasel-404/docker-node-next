"use client";

import { AppointmentStatus } from "@repo/shared";
import { useState } from "react";
import { updateAppointmentStatusAction } from "../server/actions/updateStatusAction";

type Props = {
  appointmentId: string;
  status: AppointmentStatus;
};

export function StatusSelect({ appointmentId, status }: Props) {
  const [pending, setPending] = useState(false);

  const [error, setError] = useState<string | null>(null);

  async function handleChange(nextStatus: AppointmentStatus) {
    setPending(true);
    setError(null);

    try {
      const result = await updateAppointmentStatusAction(appointmentId, {
        status: nextStatus,
      });

      if (!result.success) {
        setError(result.message);
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <div>
      <select
        value={status}
        disabled={pending}
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
    </div>
  );
}
