import { getDoctors } from "./server/getDoctors";

export default async function Home() {
  const doctors = await getDoctors();
  return (
    <div>
      {doctors.map((doctor: any) => (
        <div key={doctor.id}>
          <h2>{doctor.name}</h2>
          <p>{doctor.specialty}</p>
        </div>
      ))}
    </div>
  );
}
