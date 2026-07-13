import Link from "next/link";
import {
  Leaf,
} from "lucide-react";

const productLinks = [
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
  {
    label: "Create account",
    href: "/register",
  },
];

const accountLinks = [
  {
    label: "Log in",
    href: "/login",
  },
  {
    label: "Register",
    href: "/register",
  },
  {
    label: "Privacy",
    href: "/privacy",
  },
  {
    label: "Terms",
    href: "/terms",
  },
];

export function Footer() {
  return (
    <footer className="border-t border-emerald-950/10 bg-white">
      <div className="mx-auto max-w-7xl px-5 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-[1.4fr_0.8fr_0.8fr]">
          <div>
            <Link
              href="/"
              className="group inline-flex items-center gap-3"
            >
              <span className="flex size-10 items-center justify-center rounded-xl bg-emerald-950 text-lime-300 transition-transform duration-300 group-hover:rotate-3">
                <Leaf className="size-5" />
              </span>

              <span className="text-xl font-extrabold tracking-[-0.045em] text-emerald-950">
                Save
                <span className="text-emerald-600">
                  Plate
                </span>
              </span>
            </Link>

            <p className="mt-4 max-w-sm text-sm leading-6 text-emerald-950/55">
              Helping households organize food, act before
              expiry and share surplus responsibly.
            </p>
          </div>

          <FooterLinks
            title="Product"
            links={productLinks}
          />

          <FooterLinks
            title="Account"
            links={accountLinks}
          />
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-emerald-950/10 pt-7 text-xs text-emerald-950/40 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} SavePlate. All rights
            reserved.
          </p>

          <p className="flex items-center gap-1.5">
            Designed to make every plate count
            <Leaf className="size-3.5 text-emerald-600" />
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterLinks({
  title,
  links,
}: {
  title: string;
  links: Array<{
    label: string;
    href: string;
  }>;
}) {
  return (
    <div>
      <p className="text-sm font-bold text-emerald-950">
        {title}
      </p>

      <div className="mt-4 grid gap-3 text-sm text-emerald-950/55">
        {links.map((link) => (
          <Link
            key={`${link.label}-${link.href}`}
            href={link.href}
            className="w-fit transition-colors duration-200 hover:text-emerald-700"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}