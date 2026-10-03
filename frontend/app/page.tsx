export default async function Home() {
  const backendUrl = process.env.BACKEND_URL;
  // const doctorsRes = await fetch(`${backendUrl}/doctors`);
  // const doctors = await doctorsRes.json();
  return (
    <div>
      <button type="button">do</button>
      {backendUrl}
      {/* {doctors.map((doctor: any) => (
        <div key={doctor.id}>
          <h2>{doctor.name}</h2>
          <p>{doctor.specialty}</p>
        </div>
      ))} */}
    </div>
  );
}
