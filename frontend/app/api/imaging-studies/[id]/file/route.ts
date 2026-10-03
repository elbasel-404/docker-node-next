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

  const headers = new Headers();

  headers.set(
    "Content-Type",
    response.headers.get("content-type") ?? "application/dicom",
  );

  const contentLength = response.headers.get("content-length");

  if (contentLength) {
    headers.set("Content-Length", contentLength);
  }

  headers.set("Cache-Control", "private, no-store");

  return new NextResponse(response.body, {
    status: 200,
    headers,
  });
}
