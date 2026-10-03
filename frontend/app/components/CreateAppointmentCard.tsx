import { AppointmentForm } from "./AppointmentForm";

type Doctor = {
  id: string;
  name: string;
};

type Props = {
  doctors: Doctor[];
  defaultDate: string;
};

export function CreateAppointmentCard({ doctors, defaultDate }: Props) {
  return (
    <section>
      <h2>New appointment</h2>

      <AppointmentForm doctors={doctors} defaultDate={defaultDate} />
    </section>
  );
}
