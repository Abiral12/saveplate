"use client";

import {
  BellRing,
  ChevronRight,
  Clock3,
  HeartHandshake,
  Leaf,
  ShoppingBasket,
  Sparkles,
  Utensils,
  type LucideIcon,
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

import { Badge } from "@/components/ui/badge";

const foodItems = [
  {
    emoji: "🥬",
    name: "Baby spinach",
    detail: "Fridge · 250 g",
    expires: "Tomorrow",
    progress: 88,
  },
  {
    emoji: "🥛",
    name: "Fresh milk",
    detail: "Fridge · 1 litre",
    expires: "2 days",
    progress: 66,
  },
  {
    emoji: "🍓",
    name: "Strawberries",
    detail: "Fridge · 400 g",
    expires: "3 days",
    progress: 48,
  },
];

export function HeroPreview() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="relative mx-auto w-full max-w-[700px]">
      <motion.div
        animate={
          reduceMotion
            ? undefined
            : {
                y: [0, -7, 0],
              }
        }
        transition={{
          duration: 5.5,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
        className="relative"
      >
        <div className="absolute -inset-12 -z-10 rounded-[4rem] bg-gradient-to-br from-lime-300/30 via-emerald-300/20 to-transparent blur-3xl" />

        <div className="overflow-hidden rounded-[2rem] border border-white/80 bg-white/80 p-2 shadow-[0_50px_120px_-35px_rgba(6,78,59,0.38)] backdrop-blur-2xl sm:rounded-[2.5rem] sm:p-3">
          <div className="overflow-hidden rounded-[1.5rem] border border-emerald-950/10 bg-[#fbfcf8] sm:rounded-[2rem]">
            <PreviewHeader />

            <div className="grid gap-3 p-4 sm:grid-cols-3 sm:p-6">
              <DashboardMetric
                icon={ShoppingBasket}
                label="Active items"
                value="24"
                detail="3 added this week"
              />

              <DashboardMetric
                icon={Clock3}
                label="Expiring soon"
                value="4"
                detail="Needs attention"
                urgent
              />

              <DashboardMetric
                icon={Leaf}
                label="Food saved"
                value="12"
                detail="This month"
              />
            </div>

            <div className="grid gap-4 px-4 pb-4 sm:px-6 sm:pb-6 lg:grid-cols-[1.15fr_0.85fr]">
              <div className="rounded-2xl border border-emerald-950/10 bg-white p-4 shadow-sm sm:p-5">
                <div className="mb-5 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-emerald-950">
                      Expiring soon
                    </p>

                    <p className="mt-1 text-xs text-emerald-950/45">
                      Use these ingredients first
                    </p>
                  </div>

                  <Badge className="rounded-full bg-lime-100 text-lime-800 hover:bg-lime-100">
                    4 items
                  </Badge>
                </div>

                <div className="space-y-3">
                  {foodItems.map((item) => (
                    <FoodRow
                      key={item.name}
                      {...item}
                    />
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <div className="relative flex-1 overflow-hidden rounded-2xl bg-emerald-950 p-5 text-white shadow-lg">
                  <div className="absolute -right-8 -top-8 size-28 rounded-full bg-lime-400/20 blur-2xl" />

                  <div className="relative">
                    <span className="mb-8 flex size-10 items-center justify-center rounded-xl bg-lime-300 text-emerald-950">
                      <Utensils className="size-5" />
                    </span>

                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-lime-200">
                      Smart suggestion
                    </p>

                    <h3 className="mt-2 text-lg font-bold tracking-tight">
                      Creamy spinach pasta
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-white/65">
                      Uses three ingredients already available in
                      your kitchen.
                    </p>

                    <span className="mt-5 flex items-center gap-1 text-sm font-semibold text-lime-200">
                      View suggestion
                      <ChevronRight className="size-4" />
                    </span>
                  </div>
                </div>

                <div className="rounded-2xl border border-emerald-950/10 bg-white p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <span className="flex size-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                      <HeartHandshake className="size-5" />
                    </span>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-emerald-950">
                        Share surplus food
                      </p>

                      <p className="mt-0.5 text-xs text-emerald-950/45">
                        Create a donation listing
                      </p>
                    </div>

                    <ChevronRight className="ml-auto size-4 text-emerald-950/40" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{
          opacity: 0,
          x: 25,
          scale: 0.94,
        }}
        animate={{
          opacity: 1,
          x: 0,
          scale: 1,
        }}
        transition={{
          delay: 0.9,
          duration: 0.6,
        }}
        className="absolute -right-3 top-[18%] hidden rounded-2xl border border-white/80 bg-white/90 p-3 shadow-xl backdrop-blur-xl sm:block xl:-right-12"
      >
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-orange-100 text-orange-700">
            <BellRing className="size-5" />
          </span>

          <div>
            <p className="text-xs font-bold text-emerald-950">
              Expiry reminder
            </p>

            <p className="mt-0.5 text-[11px] text-emerald-950/50">
              Spinach expires tomorrow
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{
          opacity: 0,
          x: -25,
          scale: 0.94,
        }}
        animate={{
          opacity: 1,
          x: 0,
          scale: 1,
        }}
        transition={{
          delay: 1.1,
          duration: 0.6,
        }}
        className="absolute -bottom-5 -left-3 hidden rounded-2xl bg-emerald-950 p-3.5 text-white shadow-xl sm:block xl:-left-10"
      >
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-lime-300 text-emerald-950">
            <Leaf className="size-5" />
          </span>

          <div>
            <p className="text-xs font-bold">
              Food saved
            </p>

            <p className="mt-0.5 text-[11px] text-white/55">
              Tomatoes marked as used
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function PreviewHeader() {
  return (
    <div className="flex items-center justify-between border-b border-emerald-950/10 px-4 py-4 sm:px-6">
      <div>
        <p className="text-sm font-bold tracking-tight text-emerald-950">
          Kitchen overview
        </p>

        <p className="text-xs text-emerald-950/45">
          Monday, 14 July
        </p>
      </div>

      <div className="flex items-center gap-2">
        <span className="relative flex size-9 items-center justify-center rounded-full border border-emerald-950/10 bg-white text-emerald-950 shadow-sm">
          <BellRing className="size-4" />

          <span className="absolute right-1.5 top-1.5 size-2 rounded-full border-2 border-white bg-lime-500" />
        </span>

        <span className="flex size-9 items-center justify-center rounded-full bg-emerald-950 text-xs font-bold text-white">
          SP
        </span>
      </div>
    </div>
  );
}

function DashboardMetric({
  icon: Icon,
  label,
  value,
  detail,
  urgent = false,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  detail: string;
  urgent?: boolean;
}) {
  return (
    <div
      className={
        urgent
          ? "rounded-2xl border border-orange-100 bg-orange-50 p-4"
          : "rounded-2xl border border-emerald-950/10 bg-white p-4"
      }
    >
      <div className="flex items-center justify-between">
        <span
          className={
            urgent
              ? "flex size-8 items-center justify-center rounded-lg bg-orange-100 text-orange-700"
              : "flex size-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700"
          }
        >
          <Icon className="size-4" />
        </span>

        <Sparkles
          className={
            urgent
              ? "size-3.5 text-orange-400"
              : "size-3.5 text-lime-500"
          }
        />
      </div>

      <p className="mt-4 text-2xl font-bold tracking-tight text-emerald-950">
        {value}
      </p>

      <p className="mt-0.5 text-xs font-medium text-emerald-950/55">
        {label}
      </p>

      <p
        className={
          urgent
            ? "mt-2 text-[10px] font-semibold text-orange-600"
            : "mt-2 text-[10px] font-semibold text-emerald-600"
        }
      >
        {detail}
      </p>
    </div>
  );
}

function FoodRow({
  emoji,
  name,
  detail,
  expires,
  progress,
}: {
  emoji: string;
  name: string;
  detail: string;
  expires: string;
  progress: number;
}) {
  return (
    <div className="rounded-xl border border-emerald-950/[0.06] bg-[#fbfcf8] p-3">
      <div className="flex items-center gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white text-xl shadow-sm">
          {emoji}
        </span>

        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-bold text-emerald-950">
            {name}
          </p>

          <p className="mt-0.5 truncate text-[10px] text-emerald-950/45">
            {detail}
          </p>
        </div>

        <Badge className="rounded-full bg-orange-100 text-[9px] text-orange-700 hover:bg-orange-100">
          {expires}
        </Badge>
      </div>

      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-emerald-950/5">
        <motion.div
          initial={{
            width: 0,
          }}
          whileInView={{
            width: `${progress}%`,
          }}
          viewport={{
            once: true,
          }}
          transition={{
            duration: 0.8,
            delay: 0.3,
          }}
          className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-lime-400"
        />
      </div>
    </div>
  );
}