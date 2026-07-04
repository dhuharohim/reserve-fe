import type { Metadata } from "next";
import { ReservationLedger } from "@/components/reservation-ledger";

export const metadata: Metadata = { title: "History" };

export default function HistoryPage() {
  return (
    <ReservationLedger
      mode="history"
      eyebrow="Your reservations"
      title="History."
      emptyTitle="No past reservations"
      emptyDescription="Completed, cancelled, and expired reservations are kept here for your records."
    />
  );
}
