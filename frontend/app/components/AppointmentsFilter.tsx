"use client";

import { useRouter, useSearchParams } from "next/navigation";

type Props = {
  date: string;
  doctorId?: string;
  status?: string;
  doctors: Array<{
    id: string;
    name: string;
  }>;
};

export function AppointmentFilters({ date, doctorId, status, doctors }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    router.push(`/appointments?${params.toString()}`);
  }

  return (
    <section>
      <label>
        Date
        <input
          type="date"
          value={date}
          onChange={(event) => updateFilter("date", event.target.value)}
        />
      </label>

      <label>
        Doctor
        <select
          value={doctorId ?? ""}
          onChange={(event) => updateFilter("doctorId", event.target.value)}
        >
          <option value="">All doctors</option>

          {doctors.map((doctor) => (
            <option key={doctor.id} value={doctor.id}>
              {doctor.name}
            </option>
          ))}
        </select>
      </label>

      <label>
        Status
        <select
          value={status ?? ""}
          onChange={(event) => updateFilter("status", event.target.value)}
        >
          <option value="">All statuses</option>
          <option value="scheduled">Scheduled</option>
          <option value="checked_in">Checked in</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </label>
    </section>
  );
}
