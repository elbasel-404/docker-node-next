import { NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL;

type Params = {
  params: Promise<{
    id: string;
  }>;
};

async function forwardFileRequest(
  request: Request,
  { params }: Params,
  method: "GET" | "HEAD",
) {
  const { id } = await params;

  try {
    const response = await fetch(
      `${BACKEND_URL}/api/imaging-studies/${encodeURIComponent(id)}/file`,
      {
        cache: "no-store",
        method,
      },
    );

    if (!response.ok) {
      return new NextResponse(
        method === "GET" ? "Unable to retrieve DICOM file." : null,
        {
          status: response.status,
        },
      );
    }

    if (method === "HEAD") {
      return new NextResponse(null, {
        status: 200,
        headers: {
          "Content-Type":
            response.headers.get("content-type") ?? "application/dicom",
          "Cache-Control": "private, no-store",
        },
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
  } catch {
    return new NextResponse(null, {
      status: 502,
    });
  }
}

export async function GET(request: Request, context: Params) {
  return forwardFileRequest(request, context, "GET");
}

export async function HEAD(request: Request, context: Params) {
  return forwardFileRequest(request, context, "HEAD");
}
