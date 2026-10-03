"use server";
import { doctorSchema } from "@repo/shared";

export const getDoctors = async () => {
  const backendUrl = process.env.BACKEND_URL;
  const doctorsRes = await fetch(`${backendUrl}/api/doctors`);
  const doctors = await doctorsRes.json();
  const data = doctors.data;
  const parsedDoctors = doctorSchema.array().parse(data);
  return parsedDoctors;
};
