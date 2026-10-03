"use client";

import { type Doctor } from "@repo/shared";
import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

import type { AppointmentStatus } from "@repo/shared";

type Props = {
  date: string;
  doctorId?: string;
  status?: AppointmentStatus;
  doctors: Doctor[];
};

export function AppointmentFilters({ date, doctorId, status, doctors }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    startTransition(() => {
      router.push(`/appointments?${params.toString()}`);
    });
  }

  function clearFilters() {
    const params = new URLSearchParams();

    startTransition(() => {
      router.push(`/appointments?${params.toString()}`);
    });
  }

  return (
    <section className="card" aria-label="Filter appointments">
      <div className="filters" aria-busy={isPending}>
        <div className="field">
          <label htmlFor="filter-date">Date</label>
          <input
            id="filter-date"
            type="date"
            value={date}
            onChange={(event) => updateFilter("date", event.target.value)}
          />
        </div>

        <div className="field">
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

        <div className="field">
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
        </div>

        <button type="button" className="btn" onClick={clearFilters}>
          Clear filters
        </button>
      </div>
    </section>
  );
}
