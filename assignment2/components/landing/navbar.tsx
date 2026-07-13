import Link from "next/link";
import {
  ArrowRight,
  ChevronRight,
  Leaf,
  Menu,
} from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const navigation = [
  {
    label: "Features",
    href: "#features",
  },
  {
    label: "How it works",
    href: "#how-it-works",
  },
  {
    label: "Why SavePlate",
    href: "#why-saveplate",
  },
];

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-emerald-950/[0.06] bg-[#f7f8f3]/85 backdrop-blur-xl">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 sm:px-6 lg:px-8">
        <Link
          href="/"
          aria-label="SavePlate home"
          className="group flex items-center gap-3"
        >
          <span className="relative flex size-10 items-center justify-center rounded-xl bg-emerald-950 text-lime-300 shadow-lg shadow-emerald-950/15 transition-transform duration-300 group-hover:rotate-3">
            <Leaf className="size-5" />

            <span className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full border-2 border-[#f7f8f3] bg-lime-400" />
          </span>

          <span className="flex items-baseline">
            <span className="text-xl font-extrabold tracking-[-0.045em] text-emerald-950">
              Save
            </span>

            <span className="text-xl font-extrabold tracking-[-0.045em] text-emerald-600">
              Plate
            </span>
          </span>
        </Link>

        <nav
          aria-label="Main navigation"
          className="hidden items-center gap-1 lg:flex"
        >
          {navigation.map((item) => (
            <Link
  key={item.href}
  href={item.href}
  className={cn(
    buttonVariants({
      variant: "ghost",
      size: "sm",
    }),
    "rounded-full px-4 text-sm font-medium text-emerald-950/65 hover:bg-emerald-950/5 hover:text-emerald-950",
  )}
>
  {item.label}
</Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <Link
  href="/login"
  className={cn(
    buttonVariants({
      variant: "ghost",
    }),
    "rounded-full text-emerald-950",
  )}
>
  Log in
</Link>

          <Link
  href="/register"
  className={cn(
    buttonVariants(),
    "h-11 rounded-full bg-emerald-950 px-5 text-white shadow-lg shadow-emerald-950/15 transition-all duration-300 hover:-translate-y-0.5 hover:bg-emerald-900",
  )}
>
  Get started

  <ArrowRight
    data-icon="inline-end"
    className="size-4"
  />
</Link>
        </div>

        <Sheet>
          <SheetTrigger
  aria-label="Open navigation menu"
  className={cn(
    buttonVariants({
      variant: "outline",
      size: "icon",
    }),
    "rounded-full border-emerald-950/10 bg-white/70 lg:hidden",
  )}
>
  <Menu className="size-5" />
</SheetTrigger>

          <SheetContent
            side="right"
            className="w-full border-l border-emerald-950/10 bg-[#f7f8f3] px-6 sm:max-w-sm"
          >
            <SheetHeader className="px-0">
              <SheetTitle className="sr-only">
                SavePlate navigation
              </SheetTitle>

              <Link
                href="/"
                className="flex items-center gap-3 py-3"
              >
                <span className="flex size-10 items-center justify-center rounded-xl bg-emerald-950 text-lime-300">
                  <Leaf className="size-5" />
                </span>

                <span className="text-xl font-extrabold text-emerald-950">
                  Save
                  <span className="text-emerald-600">
                    Plate
                  </span>
                </span>
              </Link>
            </SheetHeader>

            <nav className="mt-8 flex flex-col">
  {navigation.map((item) => (
    <SheetClose
      key={item.href}
      render={<Link href={item.href} />}
      className="flex items-center justify-between border-b border-emerald-950/10 py-5 text-left text-lg font-semibold text-emerald-950 transition-colors hover:text-emerald-700"
    >
      {item.label}

      <ChevronRight className="size-5 text-emerald-600" />
    </SheetClose>
  ))}
</nav>

<div className="mt-8 grid gap-3">
  <SheetClose
    render={<Link href="/login" />}
    className={cn(
      buttonVariants({
        variant: "outline",
        size: "default",
      }),
      "h-12 w-full rounded-full border-emerald-950/15 bg-transparent text-emerald-950 hover:bg-emerald-950/5",
    )}
  >
    Log in
  </SheetClose>

  <SheetClose
    render={<Link href="/register" />}
    className={cn(
      buttonVariants({
        variant: "default",
        size: "default",
      }),
      "group h-12 w-full rounded-full bg-emerald-950 text-white hover:bg-emerald-900",
    )}
  >
    Create account

    <ArrowRight
      data-icon="inline-end"
      className="size-4 transition-transform duration-300 group-hover:translate-x-1"
    />
  </SheetClose>
</div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}