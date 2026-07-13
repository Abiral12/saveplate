"use client";

import {
  BellRing,
  HeartHandshake,
  PackageCheck,
  Utensils,
  type LucideIcon,
} from "lucide-react";
import { motion } from "motion/react";

const steps: Array<{
  number: string;
  title: string;
  description: string;
  icon: LucideIcon;
}> = [
  {
    number: "01",
    title: "Add your food",
    description:
      "Record the item, quantity, storage location and expiry date.",
    icon: PackageCheck,
  },
  {
    number: "02",
    title: "Know what needs attention",
    description:
      "SavePlate highlights ingredients approaching expiry.",
    icon: BellRing,
  },
  {
    number: "03",
    title: "Use it intelligently",
    description:
      "Mark food as used or include it in an upcoming meal.",
    icon: Utensils,
  },
  {
    number: "04",
    title: "Share the surplus",
    description:
      "Create a donation listing when food will not be used in time.",
    icon: HeartHandshake,
  },
];

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="relative scroll-mt-20 overflow-hidden bg-emerald-950 py-24 text-white sm:py-32"
    >
      <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(rgba(217,249,157,0.55)_1px,transparent_1px)] [background-size:26px_26px] [mask-image:linear-gradient(to_bottom,black,transparent)]" />

      <div className="absolute left-1/2 top-0 size-[680px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-lime-300/10 blur-[120px]" />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
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
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-lime-300">
            Designed to feel effortless
          </p>

          <h2 className="mt-4 text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.06em] text-white sm:text-5xl lg:text-6xl">
            Four simple steps. One less thing to worry about.
          </h2>

          <p className="mt-5 text-pretty text-lg leading-8 text-white/60">
            SavePlate turns an ordinary household routine into a
            more organized, economical and sustainable habit.
          </p>
        </motion.div>

        <div className="relative mt-16 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          <div className="absolute left-[12%] right-[12%] top-10 hidden border-t border-dashed border-lime-200/20 lg:block" />

          {steps.map((step, index) => {
            const Icon = step.icon;

            return (
              <motion.article
                key={step.number}
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
                  duration: 0.65,
                  delay: index * 0.1,
                }}
                whileHover={{
                  y: -8,
                }}
                className="group relative rounded-[1.75rem] border border-white/10 bg-white/[0.06] p-6 backdrop-blur transition-colors duration-500 hover:border-lime-200/25 hover:bg-white/[0.09]"
              >
                <div className="relative z-10 flex items-center justify-between">
                  <span className="flex size-14 items-center justify-center rounded-2xl bg-lime-300 text-emerald-950 shadow-lg shadow-lime-950/20 transition-transform duration-500 group-hover:rotate-3 group-hover:scale-110">
                    <Icon className="size-6" />
                  </span>

                  <span className="text-sm font-bold tracking-[0.2em] text-lime-200/55">
                    {step.number}
                  </span>
                </div>

                <h3 className="mt-10 text-xl font-bold tracking-tight">
                  {step.title}
                </h3>

                <p className="mt-3 text-sm leading-7 text-white/55">
                  {step.description}
                </p>
              </motion.article>
            );
          })}
        </div>

        <motion.div
          id="why-saveplate"
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
            duration: 0.7,
          }}
          className="mt-16 grid gap-4 rounded-[2rem] border border-white/10 bg-white/[0.05] p-5 backdrop-blur sm:grid-cols-3 sm:p-7"
        >
          {[
            {
              value: "Less waste",
              text: "Use food while it is still fresh and useful.",
            },
            {
              value: "Better planning",
              text: "Shop with a clear understanding of what you own.",
            },
            {
              value: "More sharing",
              text: "Make surplus food available to people nearby.",
            },
          ].map((item) => (
            <div
              key={item.value}
              className="rounded-2xl border border-white/10 bg-emerald-950/40 p-5"
            >
              <p className="text-lg font-bold text-lime-300">
                {item.value}
              </p>

              <p className="mt-2 text-sm leading-6 text-white/55">
                {item.text}
              </p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}