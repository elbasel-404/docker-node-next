import { NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL;

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;

  const response = await fetch(
    `${BACKEND_URL}/api/imaging-studies/${id}/file`,
    {
      cache: "no-store",
    },
  );

  if (!response.ok) {
    return new NextResponse("Unable to retrieve DICOM file.", {
      status: response.status,
    });
  }

  return new NextResponse(response.body, {
    status: 200,
    headers: {
      "Content-Type":
        response.headers.get("content-type") ?? "application/dicom",
      "Cache-Control": "private, no-store",
    },
  });
}
