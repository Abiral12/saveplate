import type {
  Metadata,
} from "next";
import Link from "next/link";
import {
  ArrowLeft,
  HandHeart,
  ShieldCheck,
} from "lucide-react";

import {
  DonationForm,
} from "@/components/donations/donation-form";

export const metadata: Metadata = {
  title: "Donate Food",
};

export default function NewDonationPage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-6 sm:px-7 sm:py-8">
      <Link
        href="/donations"
        className="inline-flex items-center gap-2 text-sm font-extrabold text-[#065F46]"
      >
        <ArrowLeft className="size-4" />
        Back to donations
      </Link>

      <section className="mt-5 rounded-[28px] bg-[#052E24] px-6 py-8 text-white sm:px-8 sm:py-10">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.07] px-3.5 py-2 text-xs font-extrabold uppercase tracking-[0.14em] text-[#DFFFAF]">
          <HandHeart className="size-4" />
          Create donation
        </div>

        <h1 className="mt-5 text-4xl font-extrabold tracking-[-0.055em] sm:text-5xl">
          Share an inventory item.
        </h1>

        <p className="mt-4 max-w-2xl text-base leading-7 text-white/65">
          Select eligible food and
          provide clear pickup
          instructions for the person
          requesting it.
        </p>
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
        <section className="rounded-[24px] border border-[#DFE6DE] bg-white p-6 sm:p-7">
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#0C8A63]">
            Donation details
          </p>

          <h2 className="mt-2 text-2xl font-extrabold tracking-[-0.04em]">
            What are you sharing?
          </h2>

          <div className="mt-7">
            <DonationForm />
          </div>
        </section>

        <aside className="rounded-[24px] border border-[#DFE6DE] bg-white p-6">
          <ShieldCheck className="size-6 text-[#087554]" />

          <h2 className="mt-5 text-xl font-extrabold">
            Safe sharing
          </h2>

          <p className="mt-2 text-sm leading-6 text-[#6C7D75]">
            Your inventory remains
            private. Only the food and
            pickup information entered
            for this donation will be
            displayed.
          </p>
        </aside>
      </div>
    </div>
  );
}