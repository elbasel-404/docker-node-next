"use client";

import { AppointmentStatus } from "@repo/shared";
import { useTransition } from "react";
import { toast } from "sonner";
import { updateAppointmentStatusAction } from "../server/actions/updateStatusAction";

type Props = {
  appointmentId: string;
  status: AppointmentStatus;
  patientName: string;
};

export function StatusSelect({ appointmentId, status, patientName }: Props) {
  const [isPending, startTransition] = useTransition();

  async function handleChange(nextStatus: AppointmentStatus) {
    startTransition(async () => {
      const result = await updateAppointmentStatusAction(appointmentId, {
        status: nextStatus,
      });

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success("Status updated");
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
    </div>
  );
}
