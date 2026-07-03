import type { Metadata } from "next";
import { ReservationLedger } from "@/components/reservation-ledger";

export const metadata: Metadata = { title: "Upcoming" };

export default function UpcomingPage() {
  return (
    <ReservationLedger
      mode="upcoming"
      title="Upcoming."
      emptyTitle="Nothing coming up"
      emptyDescription="When you reserve a seat it appears here, with its status and payment window."
    />
  );
}
