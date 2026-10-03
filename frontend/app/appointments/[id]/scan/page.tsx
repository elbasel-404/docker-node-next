import { DicomViewer } from "@/app/components/DicomViewer";
import { getAppointment } from "@/app/server/appointment";
import { getImagingStudy } from "@/app/server/imaging-study";
import Link from "next/link";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ScanPage({ params }: Props) {
  const { id } = await params;

  const appointmentResponse = await getAppointment(id);

  const appointment = appointmentResponse.data;

  if (!appointment.imagingStudy) {
    notFound();
  }

  const imagingResponse = await getImagingStudy(appointment.imagingStudy.id);

  const study = imagingResponse.data;

  return (
    <main>
      <Link href="/appointments">← Back to appointments</Link>

      <header>
        <h1>View scan</h1>

        <dl>
          <div>
            <dt>Modality</dt>
            <dd>{study.modality}</dd>
          </div>

          <div>
            <dt>Description</dt>
            <dd>{study.description ?? "—"}</dd>
          </div>
        </dl>
      </header>

      <DicomViewer fileUrl={`/api/imaging-studies/${study.id}/file`} />
    </main>
  );
}
