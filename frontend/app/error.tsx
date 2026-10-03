"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main>
      <h1>Unable to load appointments</h1>

      <p>Something went wrong while loading the appointment schedule.</p>

      <button onClick={() => reset()}>Try again</button>
    </main>
  );
}
