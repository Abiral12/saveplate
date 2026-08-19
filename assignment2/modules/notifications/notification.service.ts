import "server-only";

import { DonationRequestStatus, FoodItemStatus } from "@/app/generated/prisma/client";
import { ApiError } from "@/lib/api/api";
import { prisma } from "@/lib/db/prisma";

function startOfTodayUtc() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

function addDays(date: Date, days: number) {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

async function createOnce(userId: string, sourceKey: string, data: { type: "EXPIRY" | "DONATION" | "MEAL_REMINDER" | "ACCOUNT"; title: string; message: string; href?: string | null }) {
  await prisma.notification.upsert({
    where: { userId_sourceKey: { userId, sourceKey } },
    create: { userId, sourceKey, ...data },
    update: {},
  });
}

export async function syncNotificationsService(userId: string) {
  const settings = await prisma.privacySetting.findUnique({ where: { userId } });
  const today = startOfTodayUtc();
  const now = new Date();

  if (settings?.expiryAlertsEnabled !== false) {
    const expiring = await prisma.foodItem.findMany({
      where: { userId, status: FoodItemStatus.AVAILABLE, expiryDate: { gte: today, lte: addDays(today, 3) } },
      select: { id: true, itemName: true, expiryDate: true },
    });
    for (const item of expiring) {
      const days = Math.ceil((item.expiryDate.getTime() - today.getTime()) / 86_400_000);
      await createOnce(userId, `expiry:${item.id}:${item.expiryDate.toISOString().slice(0, 10)}`, {
        type: "EXPIRY",
        title: days === 0 ? `${item.itemName} expires today` : `${item.itemName} expires soon`,
        message: days === 0 ? "Use this item today or consider moving it to donation." : `${item.itemName} expires in ${days} day${days === 1 ? "" : "s"}. Plan a meal or donate it before it goes to waste.`,
        href: "/inventory",
      });
    }
  }

  if (settings?.donationAlertsEnabled !== false) {
    const listings = await prisma.donationListing.findMany({
      where: { donorId: userId },
      select: { id: true, createdAt: true, status: true, foodItem: { select: { itemName: true } } },
      orderBy: { createdAt: "desc" }, take: 30,
    });
    for (const listing of listings) {
      await createOnce(userId, `donation:posted:${listing.id}`, {
        type: "DONATION", title: "Donation posted", message: `${listing.foodItem.itemName} is now listed for donation.`, href: "/donations",
      });
    }

    const donorClaims = await prisma.donationRequest.findMany({
      where: { listing: { donorId: userId }, status: { in: [DonationRequestStatus.ACCEPTED, DonationRequestStatus.CLAIMED] } },
      select: { id: true, status: true, requester: { select: { fullName: true } }, listing: { select: { foodItem: { select: { itemName: true } } } } },
      take: 30,
    });
    for (const request of donorClaims) {
      await createOnce(userId, `donation:${request.status.toLowerCase()}:${request.id}`, {
        type: "DONATION", title: request.status === DonationRequestStatus.CLAIMED ? "Donation collected" : "Donation request accepted", message: `${request.requester.fullName} ${request.status === DonationRequestStatus.CLAIMED ? "collected" : "will collect"} ${request.listing.foodItem.itemName}.`, href: "/donations",
      });
    }

    const requesterUpdates = await prisma.donationRequest.findMany({
      where: { requesterId: userId, status: { in: [DonationRequestStatus.ACCEPTED, DonationRequestStatus.REJECTED, DonationRequestStatus.CLAIMED] } },
      select: { id: true, status: true, listing: { select: { pickupLocation: true, foodItem: { select: { itemName: true } } } } },
      take: 30,
    });
    for (const request of requesterUpdates) {
      const accepted = request.status === DonationRequestStatus.ACCEPTED;
      await createOnce(userId, `request:${request.status.toLowerCase()}:${request.id}`, {
        type: "DONATION",
        title: request.status === DonationRequestStatus.REJECTED ? "Donation request update" : request.status === DonationRequestStatus.CLAIMED ? "Pickup confirmed" : "Donation request accepted",
        message: accepted ? `Your request for ${request.listing.foodItem.itemName} was accepted. Pickup: ${request.listing.pickupLocation}.` : request.status === DonationRequestStatus.CLAIMED ? `Your pickup for ${request.listing.foodItem.itemName} is complete.` : `Your request for ${request.listing.foodItem.itemName} was not accepted this time.`,
        href: "/requests",
      });
    }
  }

  const dueMeals = await prisma.plannedMeal.findMany({
    where: { mealPlan: { userId, status: "CONFIRMED" }, reminderAt: { not: null, lte: now } },
    select: { id: true, title: true, mealDate: true, mealType: true, reminderAt: true },
    take: 50,
  });
  for (const meal of dueMeals) {
    await createOnce(userId, `meal:${meal.id}:${meal.reminderAt!.toISOString()}`, {
      type: "MEAL_REMINDER", title: `Meal reminder: ${meal.title}`, message: `${meal.title} is planned for ${meal.mealType.toLowerCase()} on ${meal.mealDate.toISOString().slice(0, 10)}.`, href: "/meal-planner",
    });
  }
}

export async function getNotificationsService(userId: string) {
  await syncNotificationsService(userId);
  const [items, unreadCount] = await prisma.$transaction([
    prisma.notification.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 100 }),
    prisma.notification.count({ where: { userId, readAt: null } }),
  ]);
  return {
    unreadCount,
    items: items.map((item) => ({ ...item, readAt: item.readAt?.toISOString() ?? null, createdAt: item.createdAt.toISOString() })),
  };
}

export async function markNotificationReadService(userId: string, notificationId?: string, all = false) {
  if (all) {
    await prisma.notification.updateMany({ where: { userId, readAt: null }, data: { readAt: new Date() } });
    return;
  }
  if (!notificationId) throw new ApiError(400, "notificationId is required.");
  const result = await prisma.notification.updateMany({ where: { id: notificationId, userId }, data: { readAt: new Date() } });
  if (result.count === 0) throw new ApiError(404, "Notification was not found.");
}
