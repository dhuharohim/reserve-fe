import type {
  Category,
  Membership,
  Reservation,
  ReservationType,
  Slot,
  User,
} from "./types";
import demo from "@/data/demo.json";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

/**
 * Demo mode — set NEXT_PUBLIC_DEMO=1 (e.g. on Vercel) to serve the static
 * dataset in data/demo.json instead of a live API. Works in server + client
 * components alike (no HTTP, so SSR of relative URLs is a non-issue).
 */
const DEMO = process.env.NEXT_PUBLIC_DEMO === "1";

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
  if (DEMO) return demoRequest<T>(path, options);

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

/* --------------------------------------------------------------- demo mode */

const DB = demo as unknown as {
  categories: Category[];
  reservationTypes: ReservationType[];
  slots: Record<string, Slot[]>;
  membership: Membership;
  user: User;
  reservations: Reservation[];
};

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function findSlot(id: number): { slot: Slot; slug: string } | null {
  for (const [slug, arr] of Object.entries(DB.slots)) {
    const slot = arr.find((s) => s.id === id);
    if (slot) return { slot, slug };
  }
  return null;
}

function readLastReservation(): Reservation | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("demo_last_reservation");
    return raw ? (JSON.parse(raw) as Reservation) : null;
  } catch {
    return null;
  }
}

function fabricateReservation(body: {
  items?: { slot_id: number; quantity?: number }[];
  notes?: string;
  voucher_code?: string;
}): Reservation {
  const line = body.items?.[0];
  const found = line ? findSlot(line.slot_id) : null;
  const type = found ? DB.reservationTypes.find((t) => t.slug === found.slug) : undefined;
  const qty = line?.quantity ?? 1;
  const unit = found ? Number(found.slot.price) : 0;
  const subtotal = round2(unit * qty);
  const tax = round2(subtotal * (type?.tax_rate ?? 0));
  const service = round2(subtotal * (type?.service_charge_rate ?? 0));
  const grand = round2(subtotal + tax + service);
  const created = new Date().toISOString();
  const uuid = `demo-${Math.random().toString(36).slice(2, 10)}`;
  const prepay = type?.payment_mode === "prepaid" || type?.payment_mode === "deposit";

  const reservation: Reservation = {
    uuid,
    reservation_number: `RSV-DEMO-${uuid.slice(5, 9).toUpperCase()}`,
    status: "confirmed",
    source: "web",
    customer_name: DB.user.name,
    currency: "USD",
    subtotal: subtotal.toFixed(2),
    discount_total: "0.00",
    voucher_code: body.voucher_code ?? null,
    tax_total: tax.toFixed(2),
    service_charge_total: service.toFixed(2),
    grand_total: grand.toFixed(2),
    notes: body.notes ?? null,
    expires_at: null,
    confirmed_at: created,
    cancelled_at: null,
    created_at: created,
    reservation_type: type
      ? ({
          id: type.id,
          name: type.name,
          slug: type.slug,
          subtitle: type.subtitle,
          color: type.color,
          reservation_mode: type.reservation_mode,
          allow_reschedule: type.allow_reschedule,
          allow_cancellation: type.allow_cancellation,
          category: type.category,
        } as unknown as ReservationType)
      : undefined,
    items: [
      {
        id: 900000,
        description: type?.name ?? "Reservation",
        starts_at: found?.slot.starts_at ?? null,
        ends_at: found?.slot.ends_at ?? null,
        quantity: qty,
        unit_price: unit.toFixed(2),
        line_total: subtotal.toFixed(2),
        status: "active",
        slot: found?.slot,
      },
    ],
    payments: prepay
      ? [{ uuid: "pay-demo", type: "payment", method: "card", status: "succeeded", currency: "USD", amount: grand.toFixed(2), paid_at: created }]
      : [],
  };

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem("demo_last_reservation", JSON.stringify(reservation));
    } catch {
      // storage unavailable — the object still returns for the success screen
    }
  }

  return reservation;
}

/** Serve data/demo.json in the same envelope shapes the live API returns. */
async function demoRequest<T>(path: string, options: { method?: string; body?: unknown }): Promise<T> {
  const method = (options.method ?? "GET").toUpperCase();
  const [rawPath, query = ""] = path.split("?");
  const seg = rawPath.split("/").filter(Boolean);
  const qs = new URLSearchParams(query);
  const body = (options.body ?? {}) as {
    items?: { slot_id: number; quantity?: number }[];
    slot_id?: number;
    notes?: string;
    voucher_code?: string;
  };
  const ok = <R>(data: R) => Promise.resolve(data as unknown as T);

  if (seg[0] === "categories") {
    if (seg.length === 1) return ok({ data: DB.categories });
    const cat = DB.categories.find((c) => c.key === seg[1]);
    if (!cat) throw new ApiError(404, "Category not found.");
    return ok({ data: { ...cat, types: DB.reservationTypes.filter((t) => t.category?.key === seg[1]) } });
  }

  if (seg[0] === "reservation-types") {
    if (seg.length === 1) {
      const category = qs.get("category");
      const list = category ? DB.reservationTypes.filter((t) => t.category?.key === category) : DB.reservationTypes;
      return ok({ data: list });
    }
    const type = DB.reservationTypes.find((t) => t.slug === seg[1]);
    if (!type) throw new ApiError(404, "Not found.");
    return ok({ data: type });
  }

  if (seg[0] === "slots") {
    if (seg.length === 2) {
      const found = findSlot(Number(seg[1]));
      if (!found) throw new ApiError(404, "Not found.");
      return ok({ data: found.slot });
    }
    const rt = qs.get("reservation_type");
    return ok({ data: rt ? DB.slots[rt] ?? [] : Object.values(DB.slots).flat() });
  }

  if (seg[0] === "me" && seg[1] === "membership") return ok({ data: DB.membership });

  if (seg[0] === "auth") {
    if (seg[1] === "me") return ok({ user: DB.user });
    if (seg[1] === "login" || seg[1] === "register") return ok({ user: DB.user, token: "demo-token" });
    if (seg[1] === "logout") return ok(undefined);
  }

  if (seg[0] === "reservations") {
    if (method === "POST" && seg.length === 1) {
      return ok({ data: fabricateReservation(body), checkout_url: null });
    }
    if (seg.length === 1) {
      const list = [...DB.reservations];
      const last = readLastReservation();
      if (last && !list.some((r) => r.uuid === last.uuid)) list.unshift(last);
      return ok({ data: list });
    }
    const uuid = seg[1];
    const action = seg[2];
    const match = DB.reservations.find((r) => r.uuid === uuid) ?? readLastReservation();
    const base: Reservation = match?.uuid === uuid ? match : { ...DB.reservations[0], uuid, reservation_number: "RSV-DEMO" };

    if (action === "cancel") return ok({ data: { ...base, status: "cancelled", cancelled_at: new Date().toISOString() } });
    if (action === "reschedule") {
      const found = body.slot_id ? findSlot(Number(body.slot_id)) : null;
      const items = (base.items ?? []).map((it, i) =>
        i === 0 && found ? { ...it, starts_at: found.slot.starts_at, ends_at: found.slot.ends_at, slot: found.slot } : it,
      );
      return ok({ data: { ...base, items } });
    }
    if (action === "review") return ok({ data: { ok: true } });
    return ok({ data: base });
  }

  throw new ApiError(404, `No demo handler for ${method} ${rawPath}`);
}

function buildQuery(params: Record<string, string | number | undefined>): string {
  const entries = Object.entries(params).filter(
    ([, value]) => value !== undefined && value !== "",
  ) as [string, string][];

  const qs = new URLSearchParams(entries).toString();
  return qs ? `?${qs}` : "";
}

// Catalog (public)

export async function getCategories(): Promise<Category[]> {
  const { data } = await request<{ data: Category[] }>("/categories");
  return data;
}

export async function getCategory(key: string): Promise<Category> {
  const { data } = await request<{ data: Category }>(`/categories/${key}`);
  return data;
}

export async function getReservationTypes(
  params: { category?: string } = {},
): Promise<ReservationType[]> {
  const query = params.category ? `?category=${params.category}` : "";
  const { data } = await request<{ data: ReservationType[] }>(
    `/reservation-types${query}`,
  );
  return data;
}

export async function getMembership(): Promise<Membership> {
  const { data } = await request<{ data: Membership }>("/me/membership");
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

export async function getReservation(uuid: string): Promise<Reservation> {
  const { data } = await request<{ data: Reservation }>(`/reservations/${uuid}`);
  return data;
}

export async function getReservations(): Promise<Reservation[]> {
  const { data } = await request<{ data: Reservation[] }>("/reservations");
  return data;
}

export interface CreateReservationPayload {
  items: { slot_id: number; quantity?: number; service_id?: number | null }[];
  answers?: Record<string, unknown>;
  notes?: string;
  voucher_code?: string;
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

export async function rescheduleReservation(
  uuid: string,
  slotId: number,
): Promise<Reservation> {
  const { data } = await request<{ data: Reservation }>(
    `/reservations/${uuid}/reschedule`,
    { method: "POST", body: { slot_id: slotId } },
  );
  return data;
}

export async function submitReview(
  uuid: string,
  rating: number,
  body: string,
): Promise<void> {
  await request(`/reservations/${uuid}/review`, {
    method: "POST",
    body: { rating, body },
  });
}
