"use client";

import { useRouter, useSearchParams } from "next/navigation";

import type { AppointmentStatus } from "@repo/shared";

type Doctor = {
  id: string;
  name: string;
};

type Props = {
  date: string;
  doctorId?: string;
  status?: AppointmentStatus;
  doctors: Doctor[];
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
      <h2>Filters</h2>

      <div>
        <label htmlFor="filter-date">Date</label>

        <input
          id="filter-date"
          type="date"
          value={date}
          onChange={(event) => updateFilter("date", event.target.value)}
        />
      </div>

      <div>
        <label htmlFor="filter-doctor">Doctor</label>

        <select
          id="filter-doctor"
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
      </div>

      <div>
        <label htmlFor="filter-status">Status</label>

        <select
          id="filter-status"
          value={status ?? ""}
          onChange={(event) => updateFilter("status", event.target.value)}
        >
          <option value="">All statuses</option>

          <option value="scheduled">Scheduled</option>

          <option value="checked_in">Checked in</option>

          <option value="completed">Completed</option>

          <option value="cancelled">Cancelled</option>
        </select>
        <button
          onClick={() => {
            updateFilter("date", "");
            updateFilter("doctorId", "");
            updateFilter("status", "");
            router.push("/appointments");
          }}
        >
          clear filters
        </button>
      </div>
    </section>
  );
}
