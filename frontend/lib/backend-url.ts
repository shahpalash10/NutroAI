/**
 * Resolve the FastAPI backend URL.
 * - Vercel production: BACKEND_INTERNAL_URL (service binding)
 * - Local dev: BACKEND_URL or localhost:8000
 */
export function getBackendUrl(): string {
  return (
    process.env.BACKEND_INTERNAL_URL ??
    process.env.BACKEND_URL ??
    "http://localhost:8000"
  );
}
