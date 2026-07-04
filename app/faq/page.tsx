import type { Metadata } from "next";
import { Accordion } from "@/components/ui/accordion";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Answers to the common questions about reserving with Réserve.",
};

const FAQ = [
  {
    id: "pay",
    title: "Do I pay when I book?",
    content:
      "Only where the experience requires it. Many reservations settle on site through the venue's till; prepaid ones complete on a secure checkout page.",
  },
  {
    id: "cancel",
    title: "Can I cancel or reschedule?",
    content:
      "Most experiences allow free cancellation before your visit — the exact policy shows on each venue and in your profile. Where a deposit was taken, the venue's terms apply.",
  },
  {
    id: "perks",
    title: "How do member perks work?",
    content:
      "Your tier discount applies automatically at checkout, and vouchers can be added on the payment step. Points accrue on completed reservations and move you up tiers.",
  },
  {
    id: "checkin",
    title: "How does check-in work?",
    content:
      "Every reservation carries a QR code in your profile. Show it at the venue — staff scan it to check you in, which opens your bill at their till.",
  },
  {
    id: "prices",
    title: "Why do prices change by date and time?",
    content:
      "Venues set their own pricing — weekends, peak hours and busy seasons can carry a different rate. The price you see on a time slot is the price you pay.",
  },
  {
    id: "secure",
    title: "Is my payment secure?",
    content:
      "Card details are entered only on the gateway's encrypted page (Stripe or Xendit) — never seen or stored by Réserve.",
  },
];

export default function FaqPage() {
  return (
    <div className="rz mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <div className="rz-mono mb-3 text-[10.5px] uppercase tracking-[0.2em] text-accent-deep">
        Support
      </div>
      <h1 className="rz-serif mb-3 text-5xl font-semibold leading-none">Good to know</h1>
      <p className="mb-9 max-w-xl text-[15px] leading-relaxed text-muted">
        The questions we hear most. Still stuck? Reach the concierge from your profile.
      </p>
      <Accordion items={FAQ} defaultOpen="pay" />
    </div>
  );
}
