"use client";

import {
  type ComponentType,
  type ReactNode,
  useEffect,
  useState,
} from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  Bell,
  CalendarDays,
  ChevronRight,
  HandHeart,
  LayoutDashboard,
  LoaderCircle,
  LogOut,
  Menu,
  PackageSearch,
  PlusCircle,
  Settings2,
  X,
} from "lucide-react";

import { SavePlateLogo } from "@/components/auth/saveplate-logo";
import { cn } from "@/lib/utils";

type DashboardUser = {
  id: string;
  fullName: string;
  email: string;
};

type DashboardShellProps = {
  user: DashboardUser;
  children: ReactNode;
};

type NavigationItem = {
  label: string;
  href: string;
  icon: ComponentType<{
    className?: string;
    "aria-hidden"?: boolean;
  }>;
  comingSoon?: boolean;
};

const primaryNavigation: NavigationItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "My inventory",
    href: "/inventory",
    icon: PackageSearch,
  },
  {
    label: "Add food item",
    href: "/inventory/new",
    icon: PlusCircle,
  },
  {
    label: "Donations",
    href: "/donations",
    icon: HandHeart,
  },
  {
    label: "Privacy settings",
    href: "/settings/privacy",
    icon: Settings2,
  },
];

const futureNavigation: NavigationItem[] = [
  {
    label: "Meal planner",
    href: "/meal-planner",
    icon: CalendarDays,
    comingSoon: true,
  },
  {
    label: "Notifications",
    href: "/notifications",
    icon: Bell,
    comingSoon: true,
  },
  {
    label: "Food analytics",
    href: "/analytics",
    icon: BarChart3,
    comingSoon: true,
  },
];

function getInitials(fullName: string): string {
  const names = fullName.trim().split(/\s+/).filter(Boolean);

  if (names.length === 0) {
    return "SP";
  }

  return names
    .slice(0, 2)
    .map((name) => name.charAt(0).toUpperCase())
    .join("");
}

function isNavigationItemActive(
  pathname: string,
  href: string,
): boolean {
  if (href === "/dashboard") {
    return pathname === "/dashboard";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

type SidebarContentProps = {
  user: DashboardUser;
  pathname: string;
  isLoggingOut: boolean;
  logoutError: string | null;
  onNavigate?: () => void;
  onLogout: () => Promise<void>;
};

function SidebarContent({
  user,
  pathname,
  isLoggingOut,
  logoutError,
  onNavigate,
  onLogout,
}: SidebarContentProps) {
  return (
    <div className="flex h-full flex-col bg-[#052E24] text-white">
      <div className="border-b border-white/10 px-6 py-6">
        <SavePlateLogo inverted />
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6">
        <p className="px-3 text-[11px] font-extrabold uppercase tracking-[0.18em] text-white/40">
          Household
        </p>

        <nav className="mt-3 space-y-1" aria-label="Main navigation">
          {primaryNavigation.map((item) => {
            const Icon = item.icon;
            const active = isNavigationItemActive(
              pathname,
              item.href,
            );

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  "group flex items-center gap-3 rounded-xl px-3 py-3",
                  "text-sm font-bold transition",
                  "focus-visible:outline-none focus-visible:ring-2",
                  "focus-visible:ring-[#BEF264]/60",
                  active
                    ? "bg-[#BEF264] text-[#052E24]"
                    : "text-white/70 hover:bg-white/[0.07] hover:text-white",
                )}
              >
                <Icon className="size-5" aria-hidden={true} />

                <span className="flex-1">{item.label}</span>

                {active ? (
                  <ChevronRight
                    className="size-4"
                    aria-hidden={true}
                  />
                ) : null}
              </Link>
            );
          })}
        </nav>

        <div className="my-6 h-px bg-white/10" />

        <p className="px-3 text-[11px] font-extrabold uppercase tracking-[0.18em] text-white/40">
          Iteration 2
        </p>

        <nav
          className="mt-3 space-y-1"
          aria-label="Future navigation"
        >
          {futureNavigation.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.href}
                className="flex cursor-not-allowed items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold text-white/35"
              >
                <Icon className="size-5" aria-hidden={true} />

                <span className="flex-1">{item.label}</span>

                <span className="rounded-full border border-white/10 bg-white/[0.06] px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider">
                  Soon
                </span>
              </div>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-white/10 p-4">
        <div className="rounded-2xl bg-white/[0.06] p-3">
          <div className="flex items-center gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#BEF264] text-sm font-extrabold text-[#052E24]">
              {getInitials(user.fullName)}
            </span>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-extrabold text-white">
                {user.fullName}
              </p>

              <p className="truncate text-xs text-white/45">
                {user.email}
              </p>
            </div>
          </div>

          {logoutError ? (
            <p
              role="alert"
              className="mt-3 text-xs font-semibold leading-5 text-orange-200"
            >
              {logoutError}
            </p>
          ) : null}

          <button
            type="button"
            onClick={() => void onLogout()}
            disabled={isLoggingOut}
            className={cn(
              "mt-3 flex h-10 w-full items-center justify-center gap-2",
              "rounded-xl border border-white/10",
              "text-sm font-bold text-white/70 transition",
              "hover:bg-white/[0.07] hover:text-white",
              "focus-visible:outline-none focus-visible:ring-2",
              "focus-visible:ring-[#BEF264]/60",
              "disabled:cursor-not-allowed disabled:opacity-50",
            )}
          >
            {isLoggingOut ? (
              <>
                <LoaderCircle
                  className="size-4 animate-spin"
                  aria-hidden={true}
                />
                Logging out...
              </>
            ) : (
              <>
                <LogOut className="size-4" aria-hidden={true} />
                Log out
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export function DashboardShell({
  user,
  children,
}: DashboardShellProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(
    null,
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileMenuOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMobileMenuOpen(false);
      }
    }

    window.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [mobileMenuOpen]);

  async function handleLogout() {
    setIsLoggingOut(true);
    setLogoutError(null);

    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Logout request failed.");
      }

      router.replace("/login?loggedOut=true");
      router.refresh();
    } catch {
      setLogoutError(
        "Logout could not be completed. Please try again.",
      );
      setIsLoggingOut(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F7F8F3] text-[#10271F] lg:grid lg:grid-cols-[280px_minmax(0,1fr)]">
      <aside className="sticky top-0 hidden h-screen lg:block">
        <SidebarContent
          user={user}
          pathname={pathname}
          isLoggingOut={isLoggingOut}
          logoutError={logoutError}
          onLogout={handleLogout}
        />
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-[#DCE5DC] bg-[#F7F8F3]/90 px-5 backdrop-blur-xl lg:hidden">
          <SavePlateLogo />

          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open dashboard navigation"
            aria-expanded={mobileMenuOpen}
            className="grid size-10 place-items-center rounded-xl border border-[#D8E1D8] bg-white text-[#065F46] shadow-sm"
          >
            <Menu className="size-5" aria-hidden={true} />
          </button>
        </header>

        {mobileMenuOpen ? (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button
              type="button"
              className="absolute inset-0 bg-[#052E24]/55 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close dashboard navigation"
            />

            <aside className="absolute inset-y-0 left-0 w-[min(88vw,320px)] shadow-2xl">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close dashboard navigation"
                className="absolute right-4 top-5 z-10 grid size-9 place-items-center rounded-xl bg-white/10 text-white"
              >
                <X className="size-5" aria-hidden={true} />
              </button>

              <SidebarContent
                user={user}
                pathname={pathname}
                isLoggingOut={isLoggingOut}
                logoutError={logoutError}
                onNavigate={() => setMobileMenuOpen(false)}
                onLogout={handleLogout}
              />
            </aside>
          </div>
        ) : null}

        <main className="min-h-screen">{children}</main>
      </div>
    </div>
  );
}