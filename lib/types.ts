export interface User {
  id: number;
  name: string;
  email: string;
  role: "admin" | "guest";
}

export interface CustomFieldOption {
  value: string;
  label: string;
}

export interface CustomField {
  key: string;
  label: string;
  type:
    | "text"
    | "number"
    | "textarea"
    | "select"
    | "multiselect"
    | "date"
    | "checkbox"
    | string;
  required: boolean;
  step: number;
  options: CustomFieldOption[];
}

export interface ReservationType {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  hero_image_url: string | null;
  reservation_mode: string;
  payment_mode: string;
  form_layout: "single" | "wizard";
  allow_reschedule: boolean;
  allow_cancellation: boolean;
  is_active: boolean;
  custom_fields: CustomField[];
}

export interface SlotResourceSummary {
  id: number;
  name: string;
  category: string;
}

export interface Slot {
  id: number;
  reservation_type_id?: number;
  starts_at: string;
  ends_at: string;
  capacity: number;
  remaining_capacity: number;
  is_fully_booked: boolean;
  price: string;
  status: string;
  resource?: SlotResourceSummary | null;
  reservation_type?: ReservationType;
}

export type ReservationStatus =
  | "draft"
  | "pending_payment"
  | "confirmed"
  | "checked_in"
  | "completed"
  | "cancelled"
  | "expired"
  | "no_show"
  | "refunded";

export interface ReservationItem {
  id: number;
  description: string;
  starts_at: string | null;
  ends_at: string | null;
  quantity: number;
  unit_price: string;
  line_total: string;
  status: string;
  slot?: Slot;
}

export interface Reservation {
  uuid: string;
  reservation_number: string;
  status: ReservationStatus;
  source: string;
  customer_name: string;
  currency: string;
  subtotal: string;
  discount_total: string;
  tax_total: string;
  service_charge_total: string;
  grand_total: string;
  notes: string | null;
  expires_at: string | null;
  confirmed_at: string | null;
  cancelled_at: string | null;
  created_at: string;
  reservation_type?: ReservationType;
  items?: ReservationItem[];
}

/** Statuses a guest can still cancel from the portal. */
export function isCancellable(status: string): boolean {
  return ["draft", "pending_payment", "confirmed"].includes(status);
}

/** Statuses that still hold a seat (upcoming work). */
export function isActiveStatus(status: string): boolean {
  return ["draft", "pending_payment", "confirmed", "checked_in"].includes(status);
}
