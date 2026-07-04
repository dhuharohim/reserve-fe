import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "The terms that govern reserving through Réserve.",
};

const SECTIONS = [
  {
    n: "01",
    title: "About these terms",
    body: "Réserve is a concierge that connects you with independent venues and providers. By reserving through Réserve you agree to these terms and to the individual policies each venue sets for its experiences.",
  },
  {
    n: "02",
    title: "Reservations",
    body: "A reservation is confirmed once you complete the booking flow and receive a confirmation. Some experiences confirm instantly; others require the venue's approval or a deposit. Availability, times and prices are set by each venue and may change until the moment you confirm.",
  },
  {
    n: "03",
    title: "Pricing",
    body: "The price shown on a time slot is the price you pay for that slot, including any weekend, peak-time or seasonal rate the venue applies. Taxes and service charges, where applicable, are shown before you confirm.",
  },
  {
    n: "04",
    title: "Payments",
    body: "Payments are processed on the encrypted checkout of our payment partners (Stripe or Xendit). Réserve never stores your card details. Pay-on-site reservations are settled directly with the venue at their till.",
  },
  {
    n: "05",
    title: "Cancellations & refunds",
    body: "Each experience states its cancellation window. Free cancellation, where offered, is honoured up to the stated time. Deposits and prepayments are refunded according to the venue's policy; refunds return to your original payment method.",
  },
  {
    n: "06",
    title: "Membership & perks",
    body: "Tier discounts and vouchers apply automatically at checkout where eligible. Points accrue on completed reservations and are not exchangeable for cash. Réserve may adjust tiers, perks and points from time to time.",
  },
  {
    n: "07",
    title: "Your responsibilities",
    body: "Please arrive on time and present your check-in QR code. You are responsible for the accuracy of the details you provide and for complying with each venue's house rules.",
  },
  {
    n: "08",
    title: "Liability",
    body: "The experience itself is delivered by the venue, and the venue is responsible for it. Réserve facilitates the reservation and payment. To the extent permitted by law, Réserve is not liable for the conduct or quality of any venue.",
  },
  {
    n: "09",
    title: "Privacy",
    body: "We process the personal data needed to make and manage your reservations, and share only what a venue needs to honour them. See your profile to review or remove your information.",
  },
  {
    n: "10",
    title: "Changes",
    body: "We may update these terms as the service evolves. Material changes will be reflected here with a new effective date; continued use means you accept the updated terms.",
  },
];

export default function TermsPage() {
  return (
    <div className="rz mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <div className="rz-mono mb-3 text-[10.5px] uppercase tracking-[0.2em] text-accent-deep">
        Legal
      </div>
      <h1 className="rz-serif mb-3 text-5xl font-semibold leading-none">
        Terms &amp; Conditions
      </h1>
      <p className="mb-10 max-w-xl text-[15px] leading-relaxed text-muted">
        The short version: reserve fairly, venues set their own policies, and your payment stays
        secure. The full version follows.
      </p>

      <div className="flex flex-col divide-y divide-line border-y border-line">
        {SECTIONS.map((section) => (
          <section key={section.n} className="grid grid-cols-1 gap-2 py-6 sm:grid-cols-[3rem_1fr] sm:gap-6">
            <span className="rz-mono text-[13px] text-accent-deep">{section.n}</span>
            <div>
              <h2 className="rz-serif mb-1.5 text-2xl font-semibold">{section.title}</h2>
              <p className="text-[14.5px] leading-relaxed text-muted">{section.body}</p>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
