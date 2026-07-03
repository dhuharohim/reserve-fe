const timeFormat = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "UTC",
});

const dateFormat = new Intl.DateTimeFormat("en-GB", {
  weekday: "short",
  day: "2-digit",
  month: "short",
  timeZone: "UTC",
});

const monthFormat = new Intl.DateTimeFormat("en-GB", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

const moneyFormat = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export function formatTime(iso: string): string {
  return timeFormat.format(new Date(iso));
}

export function formatDate(iso: string): string {
  return dateFormat.format(new Date(iso));
}

export function formatMonth(date: Date): string {
  return monthFormat.format(date);
}

export function formatMoney(amount: string | number): string {
  return moneyFormat.format(Number(amount));
}

export const statusLabels: Record<string, string> = {
  draft: "Awaiting approval",
  pending_payment: "Awaiting payment",
  confirmed: "Confirmed",
  checked_in: "Checked in",
  completed: "Completed",
  cancelled: "Cancelled",
  expired: "Expired",
  no_show: "No show",
  refunded: "Refunded",
};
