"use client";

import { Bell, CalendarDays, CheckCheck, CircleAlert, HandHeart, LoaderCircle, PackageSearch } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { ApiResponse } from "@/types/api";
import type { NotificationData, NotificationItem } from "@/types/notifications";

const iconMap = {
  EXPIRY: PackageSearch,
  DONATION: HandHeart,
  MEAL_REMINDER: CalendarDays,
  ACCOUNT: CircleAlert,
};

function relativeTime(value: string) {
  const ms = Date.now() - new Date(value).getTime();
  const minutes = Math.max(0, Math.floor(ms / 60000));
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function NotificationsPageClient() {
  const router = useRouter();
  const [data, setData] = useState<NotificationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const response = await fetch("/api/notifications", { cache: "no-store", credentials: "include" });
      const result = (await response.json()) as ApiResponse<NotificationData>;
      if (!response.ok || !result.success || !result.data) throw new Error(result.message || "Unable to load notifications.");
      setData(result.data);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to load notifications.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  async function markRead(item?: NotificationItem, all = false) {
    await fetch("/api/notifications", {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(all ? { all: true } : { notificationId: item?.id }),
    });
    if (item?.href) router.push(item.href);
    await load();
  }

  return (
    <main className="mx-auto w-full max-w-[1200px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <section className="rounded-[28px] bg-[#052E24] px-6 py-7 text-white shadow-xl shadow-[#052E24]/10 sm:px-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-[0.16em] text-[#BEF264]"><Bell className="size-4" /> Stay informed</div>
            <h1 className="mt-3 text-3xl font-extrabold tracking-[-0.04em] sm:text-4xl">Notifications</h1>
            <p className="mt-3 max-w-xl text-sm font-medium leading-6 text-white/65">Expiry reminders, donation updates and meal planning alerts in one place.</p>
          </div>
          {data && data.unreadCount > 0 ? (
            <button onClick={() => void markRead(undefined, true)} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#BEF264] px-4 text-sm font-extrabold text-[#052E24] transition hover:bg-[#D8FF8D]"><CheckCheck className="size-4" /> Mark all read</button>
          ) : null}
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-[#DFE6DE] bg-white p-4 sm:p-6">
        {loading ? <div className="grid min-h-52 place-items-center text-[#6C7D75]"><LoaderCircle className="size-7 animate-spin" /></div> : error ? <div className="rounded-xl bg-red-50 p-4 text-sm font-bold text-red-700">{error}</div> : !data || data.items.length === 0 ? (
          <div className="grid min-h-64 place-items-center text-center"><div><span className="mx-auto grid size-14 place-items-center rounded-2xl bg-[#EFFBD4] text-[#285A2C]"><Bell className="size-6" /></span><h2 className="mt-4 text-xl font-extrabold text-[#10271F]">No new notifications</h2><p className="mt-2 max-w-md text-sm font-medium leading-6 text-[#6C7D75]">SavePlate will alert you when food is close to expiry, donation activity changes, or a planned meal reminder is due.</p></div></div>
        ) : (
          <div>
            <div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-extrabold text-[#10271F]">Recent alerts</h2><span className="rounded-full bg-[#EFFBD4] px-3 py-1 text-xs font-extrabold text-[#285A2C]">{data.unreadCount} unread</span></div>
            <div className="divide-y divide-[#EDF1EC]">
              {data.items.map((item) => {
                const Icon = iconMap[item.type];
                return <button key={item.id} onClick={() => void markRead(item)} className={`flex w-full gap-4 rounded-xl px-3 py-4 text-left transition hover:bg-[#F8FAF7] ${item.readAt ? "opacity-65" : "bg-[#FBFFF4]"}`}>
                  <span className="mt-0.5 grid size-10 shrink-0 place-items-center rounded-xl bg-[#EFFBD4] text-[#285A2C]"><Icon className="size-5" /></span>
                  <span className="min-w-0 flex-1"><span className="flex items-start justify-between gap-3"><span className="font-extrabold text-[#10271F]">{item.title}</span><span className="shrink-0 text-xs font-bold text-[#92A099]">{relativeTime(item.createdAt)}</span></span><span className="mt-1 block text-sm font-medium leading-6 text-[#6C7D75]">{item.message}</span>{item.href ? <span className="mt-2 block text-xs font-extrabold text-[#285A2C]">Open related item →</span> : null}</span>
                  {!item.readAt ? <span className="mt-2 size-2 shrink-0 rounded-full bg-[#75A928]" /> : null}
                </button>;
              })}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
