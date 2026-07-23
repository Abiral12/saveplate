import {
  CalendarDays,
  MapPin,
  Package,
  Warehouse,
} from "lucide-react";

import type {
  DonationFoodItem,
  DonationListingStatus,
  DonationRequestStatus,
} from "@/types/donations";

export function humanizeEnum(
  value: string,
): string {
  return value
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase(),
    );
}

export function formatDate(
  value: string,
): string {
  return new Intl.DateTimeFormat(
    "en-US",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    },
  ).format(new Date(value));
}

export function formatDateOnly(
  value: string,
): string {
  return formatDate(
    `${value}T00:00:00`,
  );
}

export function getExpiryText(
  item: DonationFoodItem,
): string {
  if (item.isExpired) {
    const days =
      Math.abs(
        item.daysUntilExpiry,
      );

    return `Expired ${days} ${
      days === 1 ? "day" : "days"
    } ago`;
  }

  if (item.daysUntilExpiry === 0) {
    return "Expires today";
  }

  if (item.daysUntilExpiry === 1) {
    return "Expires tomorrow";
  }

  return `Expires in ${item.daysUntilExpiry} days`;
}

type Status =
  | DonationListingStatus
  | DonationRequestStatus;

const STATUS_STYLES: Record<
  Status,
  string
> = {
  AVAILABLE:
    "bg-[#DCFCE7] text-[#166534]",
  RESERVED:
    "bg-[#FEF3C7] text-[#92400E]",
  COMPLETED:
    "bg-[#DBEAFE] text-[#1D4ED8]",
  CANCELLED:
    "bg-[#F1F5F9] text-[#475569]",
  EXPIRED:
    "bg-[#FEE2E2] text-[#B91C1C]",

  PENDING:
    "bg-[#FFF7ED] text-[#C2410C]",
  ACCEPTED:
    "bg-[#DCFCE7] text-[#166534]",
  REJECTED:
    "bg-[#FEE2E2] text-[#B91C1C]",
  CLAIMED:
    "bg-[#EDE9FE] text-[#6D28D9]",
};

export function StatusBadge({
  status,
}: {
  status: Status;
}) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1.5 text-xs font-extrabold ${STATUS_STYLES[status]}`}
    >
      {humanizeEnum(status)}
    </span>
  );
}

export function FoodDetails({
  item,
}: {
  item: DonationFoodItem;
}) {
  return (
    <div className="grid gap-3 text-sm sm:grid-cols-2">
      <div className="flex items-start gap-3 rounded-xl bg-[#F7F9F6] p-3.5">
        <Package
          className="mt-0.5 size-4 shrink-0 text-[#087554]"
          aria-hidden={true}
        />

        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-[#839087]">
            Quantity
          </p>

          <p className="mt-1 font-extrabold text-[#26372F]">
            {item.quantity}{" "}
            {humanizeEnum(item.unit)}
          </p>
        </div>
      </div>

      <div className="flex items-start gap-3 rounded-xl bg-[#F7F9F6] p-3.5">
        <CalendarDays
          className="mt-0.5 size-4 shrink-0 text-[#EA580C]"
          aria-hidden={true}
        />

        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-[#839087]">
            Expiry
          </p>

          <p className="mt-1 font-extrabold text-[#26372F]">
            {formatDateOnly(
              item.expiryDate,
            )}
          </p>

          <p
            className={`mt-1 text-xs font-bold ${
              item.isExpiringSoon
                ? "text-[#EA580C]"
                : "text-[#7A887F]"
            }`}
          >
            {getExpiryText(item)}
          </p>
        </div>
      </div>

      <div className="flex items-start gap-3 rounded-xl bg-[#F7F9F6] p-3.5">
        <Warehouse
          className="mt-0.5 size-4 shrink-0 text-[#527417]"
          aria-hidden={true}
        />

        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-[#839087]">
            Stored in
          </p>

          <p className="mt-1 font-extrabold text-[#26372F]">
            {item.storageLocation ||
              "Not specified"}
          </p>
        </div>
      </div>

      <div className="flex items-start gap-3 rounded-xl bg-[#F7F9F6] p-3.5">
        <MapPin
          className="mt-0.5 size-4 shrink-0 text-[#3158B7]"
          aria-hidden={true}
        />

        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-[#839087]">
            Category
          </p>

          <p className="mt-1 font-extrabold text-[#26372F]">
            {humanizeEnum(
              item.category,
            )}
          </p>
        </div>
      </div>
    </div>
  );
}