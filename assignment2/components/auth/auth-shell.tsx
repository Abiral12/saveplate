"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import {
  ArrowDownRight,
  BellRing,
  Check,
  Clock3,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { SavePlateLogo } from "@/components/auth/saveplate-logo";

type AuthShellProps = {
  children: ReactNode;
  mode: "login" | "register" | "verify";
};

const authPageCopy = {
  login: {
    badge: "A calmer way to manage household food",
    heading: "Welcome back to a less wasteful kitchen.",
    description:
      "Know what you have, use it in time, and share what your household cannot use.",
  },

  register: {
    badge: "Create your private household space",
    heading: "Start saving food from your first shelf.",
    description:
      "Build an organised household inventory and make better decisions before food goes to waste.",
  },

  verify: {
    badge: "One final security step",
    heading: "Confirm that this email belongs to you.",
    description:
      "Enter the six-digit code we sent to activate your private SavePlate household account.",
  },
} as const;

const benefits = [
  {
    icon: Clock3,
    title: "Use food in time",
    description: "Keep expiry dates visible before good food is forgotten.",
  },
  {
    icon: ShieldCheck,
    title: "Private by default",
    description:
      "Your household inventory stays protected and under your control.",
  },
  {
    icon: BellRing,
    title: "Waste less, effortlessly",
    description:
      "Turn surplus food into a responsible donation when needed.",
  },
];

export function AuthShell({ children, mode }: AuthShellProps) {
  const shouldReduceMotion = useReducedMotion();
  const pageCopy = authPageCopy[mode];

  return (
    <main className="min-h-screen bg-[#F7F8F3] text-[#10271F]">
      <div className="grid min-h-screen lg:grid-cols-[minmax(0,1.04fr)_minmax(520px,0.96fr)]">
        <section className="relative hidden overflow-hidden bg-[#052E24] px-10 py-10 text-white lg:flex lg:flex-col xl:px-16 xl:py-12">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -left-28 top-24 size-96 rounded-full bg-[#10B981]/15 blur-3xl"
          />

          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-36 -right-24 size-[34rem] rounded-full bg-[#BEF264]/10 blur-3xl"
          />

          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
              backgroundSize: "28px 28px",
            }}
          />

          <div className="relative z-10">
            <SavePlateLogo inverted />
          </div>

          <div className="relative z-10 my-auto max-w-2xl py-14">
            <motion.div
              initial={
                shouldReduceMotion
                  ? false
                  : {
                      opacity: 0,
                      y: 18,
                    }
              }
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.5,
                ease: "easeOut",
              }}
            >
              <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.07] px-4 py-2 text-sm font-semibold text-[#DFFFB4] backdrop-blur">
                <Sparkles className="size-4" aria-hidden="true" />
A calmer way to manage household food
              </div>

              <h1 className="max-w-xl text-5xl font-extrabold leading-[1.02] tracking-[-0.055em] xl:text-6xl">
  {pageCopy.heading}
</h1>

              <p className="mt-6 max-w-xl text-lg leading-8 text-white/70">
  {pageCopy.description}
</p>
            </motion.div>

            <motion.div
              className="mt-10 grid gap-3"
              initial={shouldReduceMotion ? false : "hidden"}
              animate="visible"
              variants={{
                hidden: {},
                visible: {
                  transition: {
                    staggerChildren: 0.09,
                    delayChildren: 0.15,
                  },
                },
              }}
            >
              {benefits.map(({ icon: Icon, title, description }) => (
                <motion.div
                  key={title}
                  variants={{
                    hidden: {
                      opacity: 0,
                      x: -14,
                    },
                    visible: {
                      opacity: 1,
                      x: 0,
                    },
                  }}
                  transition={{
                    duration: 0.35,
                    ease: "easeOut",
                  }}
                  className="flex max-w-xl items-start gap-4 rounded-2xl border border-white/10 bg-white/[0.055] p-4 backdrop-blur-sm"
                >
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#BEF264] text-[#052E24]">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>

                  <span>
                    <span className="block font-bold text-white">{title}</span>

                    <span className="mt-1 block text-sm leading-6 text-white/65">
                      {description}
                    </span>
                  </span>
                </motion.div>
              ))}
            </motion.div>
          </div>

          <div className="relative z-10 flex items-end justify-between gap-8 border-t border-white/10 pt-7">
            <p className="max-w-sm text-sm leading-6 text-white/50">
              Household information remains private unless you deliberately
              publish a donation listing.
            </p>

            <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4 shadow-2xl shadow-black/20 backdrop-blur-sm">
              <div className="flex items-center justify-between gap-10 text-xs font-semibold uppercase tracking-[0.16em] text-white/50">
                <span>Today&apos;s focus</span>

                <ArrowDownRight
                  className="size-4 text-[#BEF264]"
                  aria-hidden="true"
                />
              </div>

              <div className="mt-3 flex items-center gap-3">
                <span className="grid size-9 place-items-center rounded-full bg-[#BEF264] text-[#052E24]">
                  <Check className="size-4" aria-hidden="true" />
                </span>

                <div>
                  <p className="font-bold text-white">Use spinach first</p>
                  <p className="text-xs text-white/50">Expires in 2 days</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="relative flex min-h-screen items-center justify-center px-5 py-8 sm:px-8 lg:px-12 xl:px-20">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute right-0 top-0 size-72 rounded-full bg-[#BEF264]/20 blur-3xl lg:hidden"
          />

          <motion.div
            className="relative z-10 w-full max-w-[540px]"
            initial={
              shouldReduceMotion
                ? false
                : {
                    opacity: 0,
                    y: 16,
                  }
            }
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.45,
              ease: "easeOut",
              delay: 0.08,
            }}
          >
            <div className="mb-10 lg:hidden">
              <SavePlateLogo />
            </div>

            {children}
          </motion.div>
        </section>
      </div>
    </main>
  );
}