import "server-only";

import { type ApiErrorResponse, ApiRequestError } from "./ApiRequestError";

const BACKEND_URL = process.env.BACKEND_URL;

export async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${BACKEND_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (!response.ok) {
    const body = (await response
      .json()
      .catch(() => null)) as ApiErrorResponse | null;

    throw new ApiRequestError(
      response.status,
      body?.error.code ?? "UNKNOWN_ERROR",
      body?.error.message ?? "Request failed.",
      body?.error.details,
    );
  }

  return response.json() as Promise<T>;
}
