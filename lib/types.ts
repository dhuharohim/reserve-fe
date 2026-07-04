export interface User {
  id: number;
  name: string;
  email: string;
  role: "admin" | "guest";
  tier?: string;
  points?: number;
}

export interface CategorySummary {
  key: string;
  label: string;
  icon: string | null;
  color: string | null;
}

export interface InfoRow {
  icon: string;
  label: string;
  value: string;
}

export interface Facility {
  icon: string;
  label: string;
}

export interface TypeLocation {
  address: string;
  lat: number;
  lng: number;
}

export interface Review {
  author_name: string;
  initial: string;
  rating: string;
  body: string;
  when: string;
}

export interface Category {
  key: string;
  label: string;
  tagline: string | null;
  headline: string | null;
  blurb: string | null;
  hero_image_url: string | null;
  icon: string | null;
  color: string | null;
  types_count?: number;
  types?: ReservationType[];
}

export interface Voucher {
  code: string;
  label: string;
  description: string | null;
  discount_type?: string;
  discount_value?: string;
  icon: string | null;
  color: string | null;
  expires_at: string | null;
}

export interface Membership {
  name: string;
  email: string;
  points: number;
  member_since: string | null;
  tier: string;
  discount_percent: number;
  perks: string[];
  next_tier: string | null;
  points_to_next: number;
  progress_percent: number;
  vouchers: Voucher[];
}

export interface CustomFieldOption {
  value: string;
  label: string;
}

export interface SearchFilter {
  key: string;
  label: string;
  /** UI component the frontend renders: location_picker, date_range, guest_picker… */
  component: string;
  /** Optional data source: resources, services, google_places, countries… */
  source: string | null;
  placeholder: string | null;
  settings: Record<string, unknown>;
  is_required: boolean;
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

export interface PricingRule {
  label: string;
  adjustment: string;
  amount: string;
  days: number[] | null;
  time_start: string | null;
  time_end: string | null;
  date_start: string | null;
  date_end: string | null;
  min_party: number | null;
  max_party: number | null;
  priority: number;
}

export interface ReservationType {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  tagline: string | null;
  about: string | null;
  subtitle: string | null;
  icon: string | null;
  color: string | null;
  hero_image_url: string | null;
  gallery: string[];
  reservation_mode: string;
  payment_mode: string;
  form_layout: "single" | "wizard";
  allow_reschedule: boolean;
  allow_cancellation: boolean;
  is_active: boolean;
  price_caption: string | null;
  price_display: string | null;
  tax_rate: number;
  service_charge_rate: number;
  rating: string | null;
  reviews_count: number;
  highlights: string[];
  facilities: Facility[];
  terms: string[];
  location: TypeLocation | null;
  info: InfoRow[];
  category?: CategorySummary;
  reviews?: Review[];
  search_filters: SearchFilter[];
  pricing_rules?: PricingRule[];
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
  base_price?: string;
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

export interface Payment {
  uuid: string;
  type: string;
  method: string;
  status: string;
  currency: string;
  amount: string;
  paid_at: string | null;
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
  voucher_code?: string | null;
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
  payments?: Payment[];
}

/** Statuses a guest can still cancel from the portal. */
export function isCancellable(status: string): boolean {
  return ["draft", "pending_payment", "confirmed"].includes(status);
}

/** Statuses that still hold a seat (upcoming work). */
export function isActiveStatus(status: string): boolean {
  return ["draft", "pending_payment", "confirmed", "checked_in"].includes(status);
}
