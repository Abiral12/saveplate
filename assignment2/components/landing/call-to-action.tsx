"use client";

import Link from "next/link";
import {
  ArrowRight,
  Leaf,
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function CallToAction() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="px-5 py-20 sm:px-6 sm:py-28 lg:px-8">
      <motion.div
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
          amount: 0.25,
        }}
        transition={{
          duration: 0.75,
        }}
        className="relative mx-auto max-w-7xl overflow-hidden rounded-[2.5rem] bg-emerald-950 px-6 py-16 text-center text-white shadow-[0_35px_100px_-45px_rgba(6,78,59,0.8)] sm:px-12 sm:py-24"
      >
        <div className="absolute inset-0 opacity-25 [background-image:radial-gradient(rgba(217,249,157,0.6)_1px,transparent_1px)] [background-size:28px_28px] [mask-image:radial-gradient(circle_at_center,black,transparent_72%)]" />

        <motion.div
          aria-hidden="true"
          animate={
            reduceMotion
              ? undefined
              : {
                  scale: [1, 1.15, 1],
                  x: [0, 25, 0],
                }
          }
          transition={{
            duration: 12,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
          className="absolute -left-20 -top-20 size-72 rounded-full bg-lime-300/15 blur-3xl"
        />

        <motion.div
          aria-hidden="true"
          animate={
            reduceMotion
              ? undefined
              : {
                  scale: [1.1, 1, 1.1],
                  x: [0, -25, 0],
                }
          }
          transition={{
            duration: 14,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
          className="absolute -bottom-24 -right-20 size-80 rounded-full bg-emerald-300/15 blur-3xl"
        />

        <div className="relative mx-auto max-w-3xl">
          <motion.span
            initial={{
              rotate: -8,
              scale: 0.8,
            }}
            whileInView={{
              rotate: 0,
              scale: 1,
            }}
            viewport={{
              once: true,
            }}
            transition={{
              duration: 0.6,
            }}
            className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-lime-300 text-emerald-950 shadow-lg shadow-black/20"
          >
            <Leaf className="size-7" />
          </motion.span>

          <h2 className="mt-7 text-balance text-4xl font-semibold leading-tight tracking-[-0.06em] sm:text-5xl lg:text-6xl">
            Make your next meal begin with what you already
            have.
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg leading-8 text-white/60">
            Build a more organized kitchen, use food on time
            and make responsible sharing effortless.
          </p>

          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
  href="/register"
  className={cn(
    buttonVariants({
      size: "lg",
    }),
    "group h-14 rounded-full bg-lime-300 px-8 text-base font-bold text-emerald-950 shadow-lg shadow-black/15 transition-all duration-300 hover:-translate-y-1 hover:bg-lime-200",
  )}
>
  Get started with SavePlate

  <ArrowRight
    data-icon="inline-end"
    className="size-5 transition-transform duration-300 group-hover:translate-x-1"
  />
</Link>

            <Link
  href="/login"
  className={cn(
    buttonVariants({
      variant: "outline",
      size: "lg",
    }),
    "h-14 rounded-full border-white/15 bg-white/5 px-8 text-base font-semibold text-white transition-all duration-300 hover:-translate-y-1 hover:bg-white/10 hover:text-white",
  )}
>
  I already have an account
</Link>
          </div>
        </div>
      </motion.div>
    </section>
  );
}