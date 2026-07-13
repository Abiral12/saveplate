"use client";

import {
  BellRing,
  CalendarDays,
  HeartHandshake,
  Refrigerator,
  Search,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { motion } from "motion/react";

import {
  Card,
  CardContent,
} from "@/components/ui/card";

type FeatureType =
  | "inventory"
  | "expiry"
  | "donation"
  | "privacy";

const features: Array<{
  title: string;
  description: string;
  icon: LucideIcon;
  type: FeatureType;
  className: string;
}> = [
  {
    title: "A clear view of everything you have",
    description:
      "Organize food across your fridge, freezer and pantry while tracking quantities, categories and expiry dates.",
    icon: Refrigerator,
    type: "inventory",
    className: "md:col-span-2",
  },
  {
    title: "Act before food expires",
    description:
      "SavePlate brings urgent ingredients to your attention while there is still enough time to use or share them.",
    icon: BellRing,
    type: "expiry",
    className: "md:col-span-1",
  },
  {
    title: "Share good food responsibly",
    description:
      "Convert unused inventory into a donation listing with clear pickup and availability details.",
    icon: HeartHandshake,
    type: "donation",
    className: "md:col-span-1",
  },
  {
    title: "Privacy that you control",
    description:
      "Your household inventory remains private. You choose exactly what appears in a donation listing.",
    icon: ShieldCheck,
    type: "privacy",
    className: "md:col-span-2",
  },
];

export function Features() {
  return (
    <section
      id="features"
      className="scroll-mt-24 py-24 sm:py-32"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <motion.div
          initial={{
            opacity: 0,
            y: 24,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
            amount: 0.3,
          }}
          transition={{
            duration: 0.7,
          }}
          className="mx-auto max-w-3xl text-center"
        >
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-emerald-600">
            Everything in one place
          </p>

          <h2 className="mt-4 text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.06em] text-emerald-950 sm:text-5xl lg:text-6xl">
            Your kitchen, finally working with you.
          </h2>

          <p className="mt-5 text-pretty text-lg leading-8 text-emerald-950/60">
            SavePlate combines food inventory, expiry awareness
            and responsible sharing into one beautifully simple
            experience.
          </p>
        </motion.div>

        <div className="mt-14 grid gap-4 md:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <motion.div
                key={feature.title}
                initial={{
                  opacity: 0,
                  y: 30,
                }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                }}
                viewport={{
                  once: true,
                  amount: 0.2,
                }}
                transition={{
                  duration: 0.65,
                  delay: index * 0.08,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className={feature.className}
              >
                <Card className="group h-full overflow-hidden rounded-[2rem] border-emerald-950/10 bg-white py-0 shadow-[0_18px_60px_-40px_rgba(6,78,59,0.4)] transition-all duration-500 hover:-translate-y-1.5 hover:border-emerald-950/20 hover:shadow-[0_28px_80px_-38px_rgba(6,78,59,0.45)]">
                  <CardContent className="flex h-full flex-col p-0">
                    <div className="p-6 sm:p-8">
                      <span className="flex size-12 items-center justify-center rounded-2xl bg-emerald-950 text-lime-200 transition-transform duration-500 group-hover:rotate-3 group-hover:scale-105">
                        <Icon className="size-5" />
                      </span>

                      <h3 className="mt-6 text-2xl font-semibold tracking-[-0.04em] text-emerald-950">
                        {feature.title}
                      </h3>

                      <p className="mt-3 max-w-xl leading-7 text-emerald-950/60">
                        {feature.description}
                      </p>
                    </div>

                    <div className="mt-auto px-4 pb-4 sm:px-5 sm:pb-5">
                      <FeaturePreview type={feature.type} />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function FeaturePreview({
  type,
}: {
  type: FeatureType;
}) {
  if (type === "inventory") {
    return <InventoryPreview />;
  }

  if (type === "expiry") {
    return <ExpiryPreview />;
  }

  if (type === "donation") {
    return <DonationPreview />;
  }

  return <PrivacyPreview />;
}

function InventoryPreview() {
  const inventory = [
    {
      emoji: "🥑",
      name: "Avocado",
      expiry: "2 days",
    },
    {
      emoji: "🍅",
      name: "Tomatoes",
      expiry: "4 days",
    },
    {
      emoji: "🍞",
      name: "Bread",
      expiry: "5 days",
    },
  ];

  return (
    <div className="relative overflow-hidden rounded-[1.5rem] bg-[#edf4e8] p-4">
      <div className="absolute -right-12 -top-12 size-32 rounded-full bg-lime-300/60 blur-2xl" />

      <div className="relative rounded-2xl border border-white/80 bg-white/85 p-4 shadow-sm backdrop-blur">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold text-emerald-950">
            Your inventory
          </p>

          <span className="flex size-7 items-center justify-center rounded-lg bg-emerald-950 text-white">
            <Search className="size-3.5" />
          </span>
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          {inventory.map((item) => (
            <div
              key={item.name}
              className="rounded-xl border border-emerald-950/[0.06] bg-[#fbfcf8] p-3"
            >
              <span className="text-xl">
                {item.emoji}
              </span>

              <p className="mt-2 truncate text-[11px] font-bold text-emerald-950">
                {item.name}
              </p>

              <p className="mt-0.5 text-[9px] text-emerald-950/40">
                {item.expiry}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ExpiryPreview() {
  return (
    <div className="rounded-[1.5rem] bg-orange-50 p-4">
      <div className="rounded-2xl border border-orange-100 bg-white p-4 shadow-sm">
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-700">
            <BellRing className="size-5" />
          </span>

          <div>
            <p className="text-xs font-bold text-emerald-950">
              Spinach expires tomorrow
            </p>

            <p className="mt-1 text-[10px] leading-4 text-emerald-950/45">
              Use it in a meal or create a donation listing.
            </p>
          </div>
        </div>

        <div className="mt-4 h-2 overflow-hidden rounded-full bg-orange-100">
          <motion.div
            initial={{
              width: 0,
            }}
            whileInView={{
              width: "84%",
            }}
            viewport={{
              once: true,
            }}
            transition={{
              duration: 0.8,
              delay: 0.3,
            }}
            className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-300"
          />
        </div>
      </div>
    </div>
  );
}

function DonationPreview() {
  return (
    <div className="rounded-[1.5rem] bg-emerald-50 p-4">
      <div className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="flex size-12 items-center justify-center rounded-xl bg-lime-100 text-2xl">
            🍎
          </span>

          <div>
            <p className="text-xs font-bold text-emerald-950">
              Fresh apples
            </p>

            <p className="mt-1 text-[10px] text-emerald-950/45">
              6 pieces · Available today
            </p>
          </div>
        </div>

        <div className="mt-4 flex items-center rounded-xl bg-emerald-950 px-3 py-2.5 text-white">
          <HeartHandshake className="size-4" />

          <span className="ml-2 text-[10px] font-semibold">
            Ready to share
          </span>
        </div>
      </div>
    </div>
  );
}

function PrivacyPreview() {
  return (
    <div className="relative overflow-hidden rounded-[1.5rem] bg-[#edf4e8] p-4">
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          {
            icon: ShieldCheck,
            title: "Private",
            description: "Inventory",
          },
          {
            icon: CalendarDays,
            title: "Controlled",
            description: "Visibility",
          },
          {
            icon: Refrigerator,
            title: "Protected",
            description: "Household",
          },
        ].map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.title}
              className="rounded-xl border border-white/80 bg-white/85 p-4 shadow-sm backdrop-blur"
            >
              <Icon className="size-5 text-emerald-700" />

              <p className="mt-3 text-[11px] font-bold text-emerald-950">
                {item.title}
              </p>

              <p className="mt-0.5 text-[9px] text-emerald-950/45">
                {item.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}