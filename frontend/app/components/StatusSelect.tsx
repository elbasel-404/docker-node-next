"use client";

import { useState } from "react";
import { updateAppointmentStatusAction } from "../server/updateStatusAction";

type Props = {
  appointmentId: string;
  status: "scheduled" | "checked_in" | "completed" | "cancelled";
};

export function StatusSelect({ appointmentId, status }: Props) {
  const [pending, setPending] = useState(false);

  const [error, setError] = useState<string | null>(null);

  async function changeStatus(nextStatus: Props["status"]) {
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
          changeStatus(event.target.value as Props["status"])
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
