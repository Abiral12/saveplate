"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  PackagePlus,
  ShieldCheck,
} from "lucide-react";

import { InventoryForm } from "@/components/inventory/inventory-form";

export default function AddInventoryItemPage() {
  const router = useRouter();

  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-6 sm:px-7 sm:py-8 xl:px-10">
      <Link
        href="/inventory"
        className="inline-flex items-center gap-2 text-sm font-extrabold text-[#065F46] hover:underline hover:underline-offset-4"
      >
        <ArrowLeft
          className="size-4"
          aria-hidden={true}
        />
        Back to inventory
      </Link>

      <section className="relative mt-5 overflow-hidden rounded-[28px] bg-[#052E24] px-6 py-8 text-white shadow-xl shadow-[#052E24]/10 sm:px-8 sm:py-10">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-20 -top-28 size-80 rounded-full bg-[#BEF264]/15 blur-3xl"
        />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.07] px-3.5 py-2 text-xs font-extrabold uppercase tracking-[0.14em] text-[#DFFFAF]">
            <PackagePlus
              className="size-4"
              aria-hidden={true}
            />
            Add inventory item
          </div>

          <h1 className="mt-5 text-4xl font-extrabold leading-tight tracking-[-0.055em] sm:text-5xl">
            Record a food item.
          </h1>

          <p className="mt-4 max-w-2xl text-base leading-7 text-white/65 sm:text-lg">
            Add the item’s quantity,
            category, storage location
            and expiry date so SavePlate
            can help you use it in time.
          </p>
        </div>
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
        <section className="rounded-[24px] border border-[#DFE6DE] bg-white p-6 shadow-sm shadow-[#10271F]/[0.03] sm:p-7">
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#0C8A63]">
            Item details
          </p>

          <h2 className="mt-2 text-2xl font-extrabold tracking-[-0.04em] text-[#10271F]">
            What food are you adding?
          </h2>

          <p className="mt-2 text-sm leading-6 text-[#6C7D75]">
            Fields marked with an
            asterisk are required.
          </p>

          <div className="mt-7">
            <InventoryForm
              onCancel={() =>
                router.push(
                  "/inventory",
                )
              }
              onSuccess={() => {
                router.push(
                  "/inventory",
                );
                router.refresh();
              }}
            />
          </div>
        </section>

        <aside className="space-y-5">
          <section className="rounded-[24px] border border-[#DFE6DE] bg-white p-6 shadow-sm shadow-[#10271F]/[0.03]">
            <span className="grid size-11 place-items-center rounded-2xl bg-[#E8F8EE] text-[#087554]">
              <ShieldCheck
                className="size-5"
                aria-hidden={true}
              />
            </span>

            <h2 className="mt-5 text-xl font-extrabold tracking-[-0.035em] text-[#10271F]">
              Private inventory
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#6C7D75]">
              Food added here is only
              visible to your household
              account. It will not appear
              publicly unless you later
              create a donation listing.
            </p>
          </section>

          <section className="rounded-[24px] bg-[#EAF5DF] p-6">
            <p className="text-xs font-extrabold uppercase tracking-[0.15em] text-[#527417]">
              Helpful tip
            </p>

            <h2 className="mt-3 text-lg font-extrabold text-[#243D19]">
              Use the actual expiry date
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#567047]">
              Accurate expiry dates help
              SavePlate show which foods
              should be consumed first.
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}