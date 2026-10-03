import { DicomViewer } from "@/app/components/DicomViewer";
import { ApiRequestError } from "@/app/server/ApiRequestError";
import { getAppointment } from "@/app/server/appointment";
import { getImagingStudy } from "@/app/server/imaging-study";
import Link from "next/link";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

async function orNotFound<T>(promise: Promise<T>): Promise<T> {
  try {
    return await promise;
  } catch (error) {
    if (error instanceof ApiRequestError && error.status === 404) {
      notFound();
    }

    throw error;
  }
}

export default async function ScanPage({ params }: Props) {
  const { id } = await params;

  const appointmentResponse = await orNotFound(getAppointment(id));
  const appointment = appointmentResponse.data;

  if (!appointment.imagingStudy) {
    notFound();
  }

  const imagingResponse = await orNotFound(
    getImagingStudy(appointment.imagingStudy.id),
  );
  const study = imagingResponse.data;

  return (
    <main className="page">
      <Link className="back-link" href="/appointments">
        ← Back to appointments
      </Link>

      <h1 className="page-title">Scan for {appointment.patientName}</h1>

      <DicomViewer
        fileUrl={`/api/imaging-studies/${study.id}/file`}
        modality={study.modality}
        description={study.description ?? null}
      />
    </main>
  );
}
