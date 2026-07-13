"use client";

import Link from "next/link";
import {
  ArrowRight,
  Check,
  ChevronRight,
  Clock3,
  HeartHandshake,
  ShoppingBasket,
  Sparkles,
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { HeroPreview } from "./hero-preview";

const trustPoints = [
  "Private by default",
  "Designed for every household",
  "Simple and easy to use",
];

const benefits = [
  {
    icon: Clock3,
    title: "Know what expires next",
    description:
      "A clear priority list for everything in your kitchen.",
  },
  {
    icon: ShoppingBasket,
    title: "Avoid unnecessary shopping",
    description:
      "Know what you already own before buying more.",
  },
  {
    icon: HeartHandshake,
    title: "Share useful surplus",
    description:
      "Give good food a meaningful next destination.",
  },
];

export function Hero() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="relative isolate overflow-hidden">
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_top_left,rgba(132,204,22,0.18),transparent_34%),radial-gradient(circle_at_90%_18%,rgba(16,185,129,0.15),transparent_30%)]" />

      <div className="absolute inset-0 -z-20 opacity-30 [background-image:linear-gradient(to_right,rgba(16,39,31,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(16,39,31,0.08)_1px,transparent_1px)] [background-size:64px_64px] [mask-image:linear-gradient(to_bottom,black,transparent_90%)]" />

      <motion.div
        aria-hidden="true"
        animate={
          reduceMotion
            ? undefined
            : {
                y: [0, -25, 0],
                x: [0, 12, 0],
              }
        }
        transition={{
          duration: 10,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
        className="absolute -left-24 top-32 -z-10 size-72 rounded-full bg-lime-300/25 blur-3xl"
      />

      <motion.div
        aria-hidden="true"
        animate={
          reduceMotion
            ? undefined
            : {
                y: [0, 22, 0],
                x: [0, -12, 0],
              }
        }
        transition={{
          duration: 12,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
        className="absolute -right-32 top-10 -z-10 size-96 rounded-full bg-emerald-300/20 blur-3xl"
      />

      <div className="mx-auto grid min-h-[calc(100svh-72px)] max-w-7xl items-center gap-16 px-5 py-16 sm:px-6 sm:py-20 lg:grid-cols-[0.92fr_1.08fr] lg:px-8 lg:py-24">
        <div className="relative z-10">
          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.6,
            }}
          >
            <Badge className="mb-7 rounded-full border border-emerald-900/10 bg-white/70 px-3.5 py-2 font-medium text-emerald-800 shadow-sm backdrop-blur hover:bg-white/70">
              <Sparkles className="mr-2 size-3.5 text-lime-600" />
              A smarter relationship with food
            </Badge>
          </motion.div>

          <motion.h1
            initial={{
              opacity: 0,
              y: 28,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.75,
              delay: 0.08,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="max-w-3xl text-balance text-[clamp(3.3rem,7vw,6.6rem)] font-semibold leading-[0.91] tracking-[-0.075em] text-emerald-950"
          >
            Buy less.
            <span className="block text-emerald-600">
              Waste less.
            </span>
            Share more.
          </motion.h1>

          <motion.p
            initial={{
              opacity: 0,
              y: 24,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.7,
              delay: 0.18,
            }}
            className="mt-8 max-w-xl text-pretty text-lg leading-8 text-emerald-950/65 sm:text-xl"
          >
            SavePlate turns household food into a clear,
            intelligent inventory—helping you use ingredients
            on time and share surplus food responsibly.
          </motion.p>

          <motion.div
            initial={{
              opacity: 0,
              y: 22,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.7,
              delay: 0.28,
            }}
            className="mt-9 flex flex-col gap-3 sm:flex-row"
          >
            <Link
  href="/register"
  className={cn(
    buttonVariants({
      size: "lg",
    }),
    "group h-14 rounded-full bg-emerald-950 px-7 text-base font-semibold text-white shadow-[0_18px_45px_-18px_rgba(6,78,59,0.75)] transition-all duration-300 hover:-translate-y-1 hover:bg-emerald-900 hover:shadow-[0_25px_55px_-20px_rgba(6,78,59,0.8)]",
  )}
>
  Start saving food

  <ArrowRight
    data-icon="inline-end"
    className="size-5 transition-transform duration-300 group-hover:translate-x-1"
  />
</Link>

            <Link
  href="#how-it-works"
  className={cn(
    buttonVariants({
      variant: "outline",
      size: "lg",
    }),
    "h-14 rounded-full border-emerald-950/10 bg-white/60 px-7 text-base font-semibold text-emerald-950 shadow-sm backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-emerald-950/20 hover:bg-white",
  )}
>
  See how it works

  <ChevronRight
    data-icon="inline-end"
    className="size-4"
  />
</Link>
          </motion.div>

          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.7,
              delay: 0.38,
            }}
            className="mt-9 flex flex-wrap gap-x-6 gap-y-3"
          >
            {trustPoints.map((point) => (
              <span
                key={point}
                className="flex items-center gap-2 text-sm font-medium text-emerald-950/60"
              >
                <span className="flex size-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                  <Check className="size-3" strokeWidth={3} />
                </span>

                {point}
              </span>
            ))}
          </motion.div>
        </div>

        <motion.div
          initial={{
            opacity: 0,
            x: 45,
            scale: 0.97,
          }}
          animate={{
            opacity: 1,
            x: 0,
            scale: 1,
          }}
          transition={{
            duration: 0.9,
            delay: 0.2,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          <HeroPreview />
        </motion.div>
      </div>

      <div className="border-y border-emerald-950/10 bg-white">
        <div className="mx-auto grid max-w-7xl divide-y divide-emerald-950/10 px-5 sm:px-6 md:grid-cols-3 md:divide-x md:divide-y-0 lg:px-8">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;

            return (
              <motion.div
                key={benefit.title}
                initial={{
                  opacity: 0,
                  y: 20,
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
                  duration: 0.6,
                  delay: index * 0.08,
                }}
                className="flex items-start gap-4 py-8 md:px-8 md:py-10 first:md:pl-0 last:md:pr-0"
              >
                <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                  <Icon className="size-5" />
                </span>

                <div>
                  <h2 className="font-bold tracking-tight text-emerald-950">
                    {benefit.title}
                  </h2>

                  <p className="mt-1 text-sm leading-6 text-emerald-950/55">
                    {benefit.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}