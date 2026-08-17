import { getToken, removeToken } from "@/lib/auth/token-storage";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// Mirrors the GlobalExceptionHandler error shape (CLAUDE.md §4.4).
interface ApiErrorBody {
  status: number;
  error: string;
  message: string;
  path: string;
  details?: string[];
}

export class ApiError extends Error {
  status: number;
  details?: string[];

  constructor(message: string, status: number, details?: string[]) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  const isFormData = init.body instanceof FormData;
  if (!isFormData && init.body) {
    headers.set("Content-Type", "application/json");
  }

  const token = getToken();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(`${API_BASE_URL}${path}`, { ...init, headers });

  if (res.status === 401) {
    removeToken();
    if (typeof window !== "undefined") {
      // Hard navigation (not router.push): forces AuthContext to re-init from
      // cleared storage. This is a plain module, not a component, so hooks
      // like useRouter() aren't available here anyway.
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.href = "/login";
    }
    throw new ApiError("Session expired", 401);
  }

  if (!res.ok) {
    const body: ApiErrorBody = await res.json();
    throw new ApiError(body.message, body.status, body.details);
  }

  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}
