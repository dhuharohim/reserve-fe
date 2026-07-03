import type { Reservation, ReservationType, Slot, User } from "./types";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

const TOKEN_KEY = "reserveflow_token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null): void {
  if (token === null) {
    localStorage.removeItem(TOKEN_KEY);
  } else {
    localStorage.setItem(TOKEN_KEY, token);
  }
}

export class ApiError extends Error {
  status: number;

  errors: Record<string, string[]>;

  constructor(
    status: number,
    message: string,
    errors: Record<string, string[]> = {},
  ) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

async function request<T>(
  path: string,
  options: { method?: string; body?: unknown } = {},
): Promise<T> {
  const token = getToken();

  const response = await fetch(`${API_URL}${path}`, {
    method: options.method ?? "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new ApiError(
      response.status,
      payload.message ?? "Something went wrong. Try again.",
      payload.errors ?? {},
    );
  }

  return payload as T;
}

function buildQuery(params: Record<string, string | number | undefined>): string {
  const entries = Object.entries(params).filter(
    ([, value]) => value !== undefined && value !== "",
  ) as [string, string][];

  const qs = new URLSearchParams(entries).toString();
  return qs ? `?${qs}` : "";
}

// Catalog (public)

export async function getReservationTypes(): Promise<ReservationType[]> {
  const { data } = await request<{ data: ReservationType[] }>("/reservation-types");
  return data;
}

export async function getReservationType(slug: string): Promise<ReservationType> {
  const { data } = await request<{ data: ReservationType }>(
    `/reservation-types/${slug}`,
  );
  return data;
}

export async function getSlots(params: {
  reservation_type?: string;
  from?: string;
  to?: string;
  per_page?: number;
} = {}): Promise<Slot[]> {
  const { data } = await request<{ data: Slot[] }>(`/slots${buildQuery(params)}`);
  return data;
}

export async function getSlot(id: number | string): Promise<Slot> {
  const { data } = await request<{ data: Slot }>(`/slots/${id}`);
  return data;
}

// Auth

export async function apiRegister(payload: {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}): Promise<{ user: User; token: string }> {
  return request("/auth/register", { method: "POST", body: payload });
}

export async function apiLogin(payload: {
  email: string;
  password: string;
}): Promise<{ user: User; token: string }> {
  return request("/auth/login", { method: "POST", body: payload });
}

export async function apiMe(): Promise<User> {
  const { user } = await request<{ user: User }>("/auth/me");
  return user;
}

export async function apiLogout(): Promise<void> {
  await request("/auth/logout", { method: "POST" });
}

// Reservations (authenticated)

export async function getReservations(): Promise<Reservation[]> {
  const { data } = await request<{ data: Reservation[] }>("/reservations");
  return data;
}

export interface CreateReservationPayload {
  items: { slot_id: number; quantity?: number; service_id?: number | null }[];
  answers?: Record<string, unknown>;
  notes?: string;
}

export async function createReservation(
  payload: CreateReservationPayload,
): Promise<{ reservation: Reservation; checkoutUrl: string | null }> {
  const response = await request<{ data: Reservation; checkout_url: string | null }>(
    "/reservations",
    { method: "POST", body: payload },
  );
  return { reservation: response.data, checkoutUrl: response.checkout_url };
}

export async function cancelReservation(uuid: string): Promise<Reservation> {
  const { data } = await request<{ data: Reservation }>(
    `/reservations/${uuid}/cancel`,
    { method: "POST" },
  );
  return data;
}
