"use client";

import Link from "next/link";
import {
  AlertCircle,
  AlertTriangle,
  ArchiveRestore,
  CalendarClock,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Filter,
  HandHeart,
  LoaderCircle,
  Package,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  X,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { InventoryForm } from "@/components/inventory/inventory-form";
import type {
  ApiResponse,
  FoodItemStatus,
  InventoryItem,
  InventoryListData,
  InventoryPagination,
} from "@/types/inventory";

const EMPTY_PAGINATION: InventoryPagination =
  {
    page: 1,
    size: 12,
    totalItems: 0,
    totalPages: 0,
    hasNext: false,
    hasPrevious: false,
  };

type InventoryFilters = {
  category: string;
  status: string;
  expiry: string;
  sortBy: string;
  sortDirection: string;
};

const DEFAULT_FILTERS: InventoryFilters = {
  category: "",
  status: "",
  expiry: "",
  sortBy: "expiryDate",
  sortDirection: "asc",
};

function humanizeEnum(value: string) {
  return value
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase(),
    );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(
    "en-US",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    },
  ).format(
    new Date(`${value}T00:00:00`),
  );
}

function getStatusAppearance(
  item: InventoryItem,
) {
  if (
    item.status === "AVAILABLE" &&
    item.isExpired
  ) {
    return {
      label: "Expired",
      className:
        "bg-[#FEE2E2] text-[#B91C1C]",
    };
  }

  if (
    item.status === "AVAILABLE" &&
    item.isExpiringSoon
  ) {
    return {
      label: "Expiring soon",
      className:
        "bg-[#FFEDD5] text-[#C2410C]",
    };
  }

  const styles: Record<
    FoodItemStatus,
    {
      label: string;
      className: string;
    }
  > = {
    AVAILABLE: {
      label: "Available",
      className:
        "bg-[#DCFCE7] text-[#166534]",
    },
    USED: {
      label: "Used",
      className:
        "bg-[#DBEAFE] text-[#1D4ED8]",
    },
    DISCARDED: {
      label: "Discarded",
      className:
        "bg-[#F1F5F9] text-[#475569]",
    },
    RESERVED: {
      label: "Reserved",
      className:
        "bg-[#FEF3C7] text-[#92400E]",
    },
    DONATED: {
      label: "Donated",
      className:
        "bg-[#F3E8FF] text-[#7E22CE]",
    },
  };

  return styles[item.status];
}

function getExpiryMessage(
  item: InventoryItem,
) {
  if (item.isExpired) {
    const daysExpired = Math.abs(
      item.daysUntilExpiry,
    );

    return `Expired ${daysExpired} ${
      daysExpired === 1 ? "day" : "days"
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

function StatCard({
  label,
  value,
  description,
  icon: Icon,
  iconClassName,
}: {
  label: string;
  value: number;
  description: string;
  icon: React.ComponentType<{
    className?: string;
    "aria-hidden"?: boolean;
  }>;
  iconClassName: string;
}) {
  return (
    <article className="rounded-2xl border border-[#DFE6DE] bg-white p-5 shadow-sm shadow-[#10271F]/[0.03]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-[#6C7D75]">
            {label}
          </p>

          <p className="mt-3 text-3xl font-extrabold tracking-[-0.05em] text-[#10271F]">
            {value}
          </p>
        </div>

        <span
          className={`grid size-11 place-items-center rounded-2xl ${iconClassName}`}
        >
          <Icon
            className="size-5"
            aria-hidden={true}
          />
        </span>
      </div>

      <p className="mt-4 text-xs font-semibold leading-5 text-[#829087]">
        {description}
      </p>
    </article>
  );
}

export function InventoryPageClient() {
  const [items, setItems] = useState<
    InventoryItem[]
  >([]);

  const [pagination, setPagination] =
    useState<InventoryPagination>(
      EMPTY_PAGINATION,
    );

  const [searchInput, setSearchInput] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [filters, setFilters] =
    useState<InventoryFilters>(
      DEFAULT_FILTERS,
    );

  const [page, setPage] = useState(1);

  const [loading, setLoading] =
    useState(true);

  const [actionLoadingId, setActionLoadingId] =
    useState<string | null>(null);

  const [error, setError] = useState<
    string | null
  >(null);

  const [notice, setNotice] = useState<
    string | null
  >(null);

  const [editingItem, setEditingItem] =
    useState<InventoryItem | null>(
      null,
    );

  const [deletingItem, setDeletingItem] =
    useState<InventoryItem | null>(
      null,
    );

  useEffect(() => {
    const timer = window.setTimeout(
      () => {
        setSearch(
          searchInput.trim(),
        );
        setPage(1);
      },
      350,
    );

    return () => {
      window.clearTimeout(timer);
    };
  }, [searchInput]);

const loadItems = useCallback(
  async (signal?: AbortSignal) => {
    // Move execution past the synchronous effect phase.
    await Promise.resolve();

    if (signal?.aborted) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const parameters = new URLSearchParams({
        page: String(page),
        size: "12",
        sortBy: filters.sortBy,
        sortDirection: filters.sortDirection,
      });

      if (search) {
        parameters.set("search", search);
      }

      if (filters.category) {
        parameters.set(
          "category",
          filters.category,
        );
      }

      if (filters.status) {
        parameters.set(
          "status",
          filters.status,
        );
      }

      if (filters.expiry) {
        parameters.set(
          "expiry",
          filters.expiry,
        );
      }

      const response = await fetch(
        `/api/inventory?${parameters.toString()}`,
        {
          credentials: "include",
          cache: "no-store",
          signal,
        },
      );

      const result =
        (await response.json()) as ApiResponse<InventoryListData>;

      if (
        !response.ok ||
        !result.success ||
        !result.data
      ) {
        throw new Error(
          result.message ||
            "Unable to retrieve inventory.",
        );
      }

      if (signal?.aborted) {
        return;
      }

      setItems(result.data.items);
      setPagination(
        result.data.pagination,
      );
    } catch (loadError) {
      if (
        signal?.aborted ||
        (loadError instanceof DOMException &&
          loadError.name === "AbortError")
      ) {
        return;
      }

      setError(
        loadError instanceof Error
          ? loadError.message
          : "Unable to retrieve inventory.",
      );
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  },
  [
    filters.category,
    filters.expiry,
    filters.sortBy,
    filters.sortDirection,
    filters.status,
    page,
    search,
  ],
);

useEffect(() => {
  const controller = new AbortController();

  queueMicrotask(() => {
    if (!controller.signal.aborted) {
      void loadItems(controller.signal);
    }
  });

  return () => {
    controller.abort();
  };
}, [loadItems]);

  const visibleSummary =
    useMemo(() => {
      return {
        available: items.filter(
          (item) =>
            item.status ===
              "AVAILABLE" &&
            !item.isExpired,
        ).length,

        expiringSoon: items.filter(
          (item) =>
            item.isExpiringSoon,
        ).length,

        used: items.filter(
          (item) =>
            item.status === "USED",
        ).length,
      };
    }, [items]);

  const hasActiveFilters =
    Boolean(search) ||
    Boolean(filters.category) ||
    Boolean(filters.status) ||
    Boolean(filters.expiry);

  function updateFilter(
    key: keyof InventoryFilters,
    value: string,
  ) {
    setFilters((current) => ({
      ...current,
      [key]: value,
    }));

    setPage(1);
  }

  function clearFilters() {
    setSearchInput("");
    setSearch("");
    setFilters(DEFAULT_FILTERS);
    setPage(1);
  }

  async function updateStatus(
    item: InventoryItem,
    status:
      | "AVAILABLE"
      | "USED"
      | "DISCARDED",
  ) {
    setActionLoadingId(item.id);
    setError(null);

    try {
      const response = await fetch(
        `/api/inventory/${item.id}`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            status,
          }),
        },
      );

      const result =
        (await response.json()) as ApiResponse<InventoryItem>;

      if (
        !response.ok ||
        !result.success
      ) {
        throw new Error(
          result.message ||
            "Unable to update the item.",
        );
      }

      setNotice(
        status === "USED"
          ? `${item.itemName} was marked as used.`
          : status === "DISCARDED"
            ? `${item.itemName} was marked as discarded.`
            : `${item.itemName} was restored.`,
      );

      await loadItems();
    } catch (statusError) {
      setError(
        statusError instanceof Error
          ? statusError.message
          : "Unable to update the item.",
      );
    } finally {
      setActionLoadingId(null);
    }
  }

  async function deleteItem() {
    if (!deletingItem) {
      return;
    }

    const item = deletingItem;

    setActionLoadingId(item.id);
    setError(null);

    try {
      const response = await fetch(
        `/api/inventory/${item.id}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );

      const result =
        (await response.json()) as ApiResponse<{
          id: string;
        }>;

      if (
        !response.ok ||
        !result.success
      ) {
        throw new Error(
          result.message ||
            "Unable to delete the item.",
        );
      }

      setDeletingItem(null);
      setNotice(
        `${item.itemName} was deleted.`,
      );

      if (
        items.length === 1 &&
        page > 1
      ) {
        setPage(
          (current) =>
            Math.max(1, current - 1),
        );
      } else {
        await loadItems();
      }
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Unable to delete the item.",
      );
    } finally {
      setActionLoadingId(null);
    }
  }

  return (
    <div className="mx-auto w-full max-w-[1500px] px-5 py-6 sm:px-7 sm:py-8 xl:px-10">
      <section className="relative overflow-hidden rounded-[28px] bg-[#052E24] px-6 py-8 text-white shadow-xl shadow-[#052E24]/10 sm:px-8 sm:py-10">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-20 -top-28 size-80 rounded-full bg-[#BEF264]/15 blur-3xl"
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-36 left-1/3 size-80 rounded-full bg-[#10B981]/15 blur-3xl"
        />

        <div className="relative z-10 flex flex-col justify-between gap-7 lg:flex-row lg:items-end">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.07] px-3.5 py-2 text-xs font-extrabold uppercase tracking-[0.14em] text-[#DFFFAF]">
              <Package
                className="size-4"
                aria-hidden={true}
              />
              Household inventory
            </div>

            <h1 className="mt-5 text-4xl font-extrabold leading-tight tracking-[-0.055em] sm:text-5xl">
              Manage your household food.
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-7 text-white/65 sm:text-lg">
              Record what you have,
              monitor expiry dates and
              make sure useful food is
              consumed before it goes to
              waste.
            </p>
          </div>

          <Link
            href="/inventory/new"
            className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#BEF264] px-5 text-sm font-extrabold text-[#052E24] shadow-lg shadow-black/10 transition hover:bg-[#D0FF82] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
          >
            <Plus
              className="size-5"
              aria-hidden={true}
            />
            Add food item
          </Link>
        </div>
      </section>

      <section
        aria-label="Inventory summary"
        className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        <StatCard
          label="Total items"
          value={
            pagination.totalItems
          }
          description="All items matching the current filters."
          icon={Package}
          iconClassName="bg-[#E8F8EE] text-[#087554]"
        />

        <StatCard
          label="Available"
          value={
            visibleSummary.available
          }
          description="Available items shown on this page."
          icon={CheckCircle2}
          iconClassName="bg-[#E7F3F0] text-[#065F46]"
        />

        <StatCard
          label="Expiring soon"
          value={
            visibleSummary.expiringSoon
          }
          description="Items expiring soon on this page."
          icon={Clock3}
          iconClassName="bg-[#FFF1E6] text-[#EA580C]"
        />

        <StatCard
          label="Used"
          value={visibleSummary.used}
          description="Items marked as used on this page."
          icon={ArchiveRestore}
          iconClassName="bg-[#E8EEFF] text-[#3158B7]"
        />
      </section>

      {notice ? (
        <div className="mt-6 flex items-start justify-between gap-4 rounded-2xl border border-[#BBE6CB] bg-[#EDFBF2] px-5 py-4 text-sm font-bold text-[#166534]">
          <div className="flex items-start gap-3">
            <CheckCircle2
              className="mt-0.5 size-5 shrink-0"
              aria-hidden={true}
            />
            <p>{notice}</p>
          </div>

          <button
            type="button"
            onClick={() =>
              setNotice(null)
            }
            className="rounded-lg p-1 hover:bg-white/70"
            aria-label="Dismiss notification"
          >
            <X
              className="size-4"
              aria-hidden={true}
            />
          </button>
        </div>
      ) : null}

      {error ? (
        <div
          role="alert"
          className="mt-6 flex items-start justify-between gap-4 rounded-2xl border border-[#FECACA] bg-[#FEF2F2] px-5 py-4 text-sm font-bold text-[#B91C1C]"
        >
          <div className="flex items-start gap-3">
            <AlertCircle
              className="mt-0.5 size-5 shrink-0"
              aria-hidden={true}
            />
            <p>{error}</p>
          </div>

          <button
            type="button"
            onClick={() =>
              void loadItems()
            }
            className="inline-flex shrink-0 items-center gap-2 rounded-lg px-2 py-1 hover:bg-white/70"
          >
            <RefreshCw
              className="size-4"
              aria-hidden={true}
            />
            Retry
          </button>
        </div>
      ) : null}

      <section className="mt-6 rounded-[24px] border border-[#DFE6DE] bg-white p-5 shadow-sm shadow-[#10271F]/[0.03] sm:p-6">
        <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#0C8A63]">
              Food records
            </p>

            <h2 className="mt-2 text-2xl font-extrabold tracking-[-0.04em] text-[#10271F]">
              Your inventory
            </h2>
          </div>

          <div className="relative w-full xl:max-w-md">
            <Search
              className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-[#849087]"
              aria-hidden={true}
            />

            <input
              type="search"
              value={searchInput}
              onChange={(event) =>
                setSearchInput(
                  event.target.value,
                )
              }
              placeholder="Search name, category or location..."
              className="h-12 w-full rounded-xl border border-[#D8E1D9] bg-[#F9FBF8] pl-12 pr-4 text-sm font-semibold text-[#10271F] outline-none transition placeholder:text-[#9AA69F] focus:border-[#0C8A63] focus:bg-white focus:ring-4 focus:ring-[#0C8A63]/10"
            />
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-[repeat(4,minmax(0,1fr))_auto]">
          <select
            value={filters.category}
            onChange={(event) =>
              updateFilter(
                "category",
                event.target.value,
              )
            }
            aria-label="Filter by category"
            className="h-11 rounded-xl border border-[#D8E1D9] bg-white px-3 text-sm font-bold text-[#46574F] outline-none focus:border-[#0C8A63]"
          >
            <option value="">
              All categories
            </option>
            <option value="DAIRY">
              Dairy
            </option>
            <option value="FRUIT">
              Fruit
            </option>
            <option value="VEGETABLE">
              Vegetable
            </option>
            <option value="MEAT">
              Meat
            </option>
            <option value="SEAFOOD">
              Seafood
            </option>
            <option value="GRAIN">
              Grain
            </option>
            <option value="BAKERY">
              Bakery
            </option>
            <option value="FROZEN">
              Frozen
            </option>
            <option value="CANNED">
              Canned
            </option>
            <option value="BEVERAGE">
              Beverage
            </option>
            <option value="SNACK">
              Snack
            </option>
            <option value="OTHER">
              Other
            </option>
          </select>

          <select
            value={filters.status}
            onChange={(event) =>
              updateFilter(
                "status",
                event.target.value,
              )
            }
            aria-label="Filter by status"
            className="h-11 rounded-xl border border-[#D8E1D9] bg-white px-3 text-sm font-bold text-[#46574F] outline-none focus:border-[#0C8A63]"
          >
            <option value="">
              All statuses
            </option>
            <option value="AVAILABLE">
              Available
            </option>
            <option value="USED">
              Used
            </option>
            <option value="DISCARDED">
              Discarded
            </option>
            <option value="RESERVED">
              Reserved
            </option>
            <option value="DONATED">
              Donated
            </option>
          </select>

          <select
            value={filters.expiry}
            onChange={(event) =>
              updateFilter(
                "expiry",
                event.target.value,
              )
            }
            aria-label="Filter by expiry"
            className="h-11 rounded-xl border border-[#D8E1D9] bg-white px-3 text-sm font-bold text-[#46574F] outline-none focus:border-[#0C8A63]"
          >
            <option value="">
              Any expiry
            </option>
            <option value="expired">
              Expired
            </option>
            <option value="soon">
              Expiring soon
            </option>
            <option value="future">
              More than 7 days
            </option>
          </select>

          <select
            value={`${filters.sortBy}:${filters.sortDirection}`}
            onChange={(event) => {
              const [
                sortBy,
                sortDirection,
              ] =
                event.target.value.split(
                  ":",
                );

              setFilters(
                (current) => ({
                  ...current,
                  sortBy,
                  sortDirection,
                }),
              );

              setPage(1);
            }}
            aria-label="Sort inventory"
            className="h-11 rounded-xl border border-[#D8E1D9] bg-white px-3 text-sm font-bold text-[#46574F] outline-none focus:border-[#0C8A63]"
          >
            <option value="expiryDate:asc">
              Expiry: earliest
            </option>
            <option value="expiryDate:desc">
              Expiry: latest
            </option>
            <option value="createdAt:desc">
              Recently added
            </option>
            <option value="createdAt:asc">
              Oldest added
            </option>
            <option value="itemName:asc">
              Name: A–Z
            </option>
            <option value="itemName:desc">
              Name: Z–A
            </option>
          </select>

          {hasActiveFilters ? (
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[#D8E1D9] px-4 text-sm font-extrabold text-[#536159] transition hover:bg-[#F5F7F3]"
            >
              <X
                className="size-4"
                aria-hidden={true}
              />
              Clear
            </button>
          ) : (
            <div className="hidden h-11 items-center justify-center gap-2 rounded-xl bg-[#F4F7F3] px-4 text-sm font-bold text-[#738179] xl:flex">
              <Filter
                className="size-4"
                aria-hidden={true}
              />
              Filters
            </div>
          )}
        </div>

        {loading ? (
          <div className="grid min-h-[420px] place-items-center">
            <div className="text-center">
              <LoaderCircle
                className="mx-auto size-8 animate-spin text-[#0C8A63]"
                aria-hidden={true}
              />

              <p className="mt-3 text-sm font-bold text-[#6C7D75]">
                Loading inventory...
              </p>
            </div>
          </div>
        ) : items.length === 0 ? (
          <div className="mt-6 flex min-h-[420px] flex-col items-center justify-center rounded-2xl border border-dashed border-[#C9D8CA] bg-[#F7F9F4] px-6 py-12 text-center">
            <span className="grid size-16 place-items-center rounded-2xl bg-[#E6F7EC] text-[#065F46]">
              <Package
                className="size-8"
                aria-hidden={true}
              />
            </span>

            <h3 className="mt-5 text-xl font-extrabold text-[#10271F]">
              {hasActiveFilters
                ? "No matching food items"
                : "Your inventory is empty"}
            </h3>

            <p className="mt-2 max-w-md text-sm leading-6 text-[#6C7D75]">
              {hasActiveFilters
                ? "Try changing or clearing your current filters."
                : "Add items from your pantry, refrigerator or freezer to begin monitoring expiry dates."}
            </p>

            {hasActiveFilters ? (
              <button
                type="button"
                onClick={clearFilters}
                className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[#CBD8CE] px-5 text-sm font-extrabold text-[#065F46] transition hover:bg-white"
              >
                <X
                  className="size-4"
                  aria-hidden={true}
                />
                Clear filters
              </button>
            ) : (
              <Link
                href="/inventory/new"
                className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#065F46] px-5 text-sm font-extrabold text-white transition hover:bg-[#054C39]"
              >
                <Plus
                  className="size-4"
                  aria-hidden={true}
                />
                Add your first item
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="mt-6 grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
              {items.map((item) => {
                const status =
                  getStatusAppearance(
                    item,
                  );

                const isActionLoading =
                  actionLoadingId ===
                  item.id;

                return (
                  <article
                    key={item.id}
                    className="group flex flex-col rounded-2xl border border-[#DFE6DE] bg-white p-5 shadow-sm shadow-[#10271F]/[0.03] transition hover:-translate-y-0.5 hover:border-[#C7D5C9] hover:shadow-lg hover:shadow-[#10271F]/[0.06]"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[#E8F8EE] text-[#087554]">
                        <Package
                          className="size-6"
                          aria-hidden={true}
                        />
                      </span>

                      <span
                        className={`rounded-full px-3 py-1.5 text-xs font-extrabold ${status.className}`}
                      >
                        {status.label}
                      </span>
                    </div>

                    <div className="mt-5">
                      <p className="text-xs font-extrabold uppercase tracking-[0.13em] text-[#0C8A63]">
                        {humanizeEnum(
                          item.category,
                        )}
                      </p>

                      <h3 className="mt-2 text-xl font-extrabold tracking-[-0.035em] text-[#10271F]">
                        {item.itemName}
                      </h3>

                      <p className="mt-2 text-sm font-bold text-[#627169]">
                        {item.quantity}{" "}
                        {humanizeEnum(
                          item.unit,
                        )}
                      </p>
                    </div>

                    <div className="mt-5 space-y-3 border-t border-[#E6EBE6] pt-4">
                      <div className="flex items-center gap-3 text-sm">
                        <CalendarClock
                          className={`size-4 shrink-0 ${
                            item.isExpired
                              ? "text-[#DC2626]"
                              : item.isExpiringSoon
                                ? "text-[#EA580C]"
                                : "text-[#738179]"
                          }`}
                          aria-hidden={true}
                        />

                        <div>
                          <p className="font-bold text-[#394A42]">
                            {formatDate(
                              item.expiryDate,
                            )}
                          </p>

                          {item.status ===
                          "AVAILABLE" ? (
                            <p
                              className={`mt-0.5 text-xs font-bold ${
                                item.isExpired
                                  ? "text-[#DC2626]"
                                  : item.isExpiringSoon
                                    ? "text-[#EA580C]"
                                    : "text-[#849087]"
                              }`}
                            >
                              {getExpiryMessage(
                                item,
                              )}
                            </p>
                          ) : null}
                        </div>
                      </div>

                      <p className="text-sm font-semibold text-[#68776F]">
                        Stored in:{" "}
                        <span className="font-extrabold text-[#394A42]">
                          {item.storageLocation ||
                            "Not specified"}
                        </span>
                      </p>
                    </div>

                    {item.notes ? (
                      <p className="mt-4 line-clamp-2 text-sm leading-6 text-[#738179]">
                        {item.notes}
                      </p>
                    ) : null}

                    <div className="mt-auto flex flex-wrap gap-2 pt-5">
                      {item.status ===
                      "AVAILABLE" ? (
                        <button
                          type="button"
                          disabled={
                            isActionLoading
                          }
                          onClick={() =>
                            void updateStatus(
                              item,
                              "USED",
                            )
                          }
                          className="inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-lg bg-[#E8F8EE] px-3 text-xs font-extrabold text-[#087554] transition hover:bg-[#D9F3E3] disabled:opacity-60"
                        >
                          {isActionLoading ? (
                            <LoaderCircle
                              className="size-4 animate-spin"
                              aria-hidden={
                                true
                              }
                            />
                          ) : (
                            <CheckCircle2
                              className="size-4"
                              aria-hidden={
                                true
                              }
                            />
                          )}
                          Mark used
                        </button>
                      ) : item.status ===
                          "USED" ||
                        item.status ===
                          "DISCARDED" ? (
                        <button
                          type="button"
                          disabled={
                            isActionLoading
                          }
                          onClick={() =>
                            void updateStatus(
                              item,
                              "AVAILABLE",
                            )
                          }
                          className="inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-lg bg-[#F1F5F2] px-3 text-xs font-extrabold text-[#526159] transition hover:bg-[#E7ECE8] disabled:opacity-60"
                        >
                          <ArchiveRestore
                            className="size-4"
                            aria-hidden={
                              true
                            }
                          />
                          Restore
                        </button>
                      ) : (
                        <span className="inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-lg bg-[#FFF7E6] px-3 text-xs font-extrabold text-[#9A6700]">
                          <HandHeart
                            className="size-4"
                            aria-hidden={
                              true
                            }
                          />
                          Donation controlled
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={() =>
                          setEditingItem(
                            item,
                          )
                        }
                        disabled={
                          item.status ===
                            "DONATED" ||
                          item.status ===
                            "RESERVED"
                        }
                        className="grid size-9 place-items-center rounded-lg border border-[#D7E0D8] text-[#526159] transition hover:bg-[#F5F7F3] disabled:cursor-not-allowed disabled:opacity-40"
                        aria-label={`Edit ${item.itemName}`}
                      >
                        <Pencil
                          className="size-4"
                          aria-hidden={true}
                        />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setDeletingItem(
                            item,
                          )
                        }
                        disabled={
                          item.status ===
                            "DONATED" ||
                          item.status ===
                            "RESERVED"
                        }
                        className="grid size-9 place-items-center rounded-lg border border-[#F3D0D0] text-[#DC2626] transition hover:bg-[#FEF2F2] disabled:cursor-not-allowed disabled:opacity-40"
                        aria-label={`Delete ${item.itemName}`}
                      >
                        <Trash2
                          className="size-4"
                          aria-hidden={true}
                        />
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>

            <div className="mt-6 flex flex-col items-center justify-between gap-4 border-t border-[#E5EAE5] pt-5 sm:flex-row">
              <p className="text-sm font-semibold text-[#728078]">
                Showing page{" "}
                <span className="font-extrabold text-[#10271F]">
                  {pagination.page}
                </span>{" "}
                of{" "}
                <span className="font-extrabold text-[#10271F]">
                  {Math.max(
                    pagination.totalPages,
                    1,
                  )}
                </span>
                {" · "}
                {pagination.totalItems}{" "}
                total items
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={
                    !pagination.hasPrevious ||
                    loading
                  }
                  onClick={() =>
                    setPage(
                      (current) =>
                        Math.max(
                          1,
                          current - 1,
                        ),
                    )
                  }
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-[#D7E0D8] px-4 text-sm font-extrabold text-[#526159] transition hover:bg-[#F5F7F3] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft
                    className="size-4"
                    aria-hidden={true}
                  />
                  Previous
                </button>

                <button
                  type="button"
                  disabled={
                    !pagination.hasNext ||
                    loading
                  }
                  onClick={() =>
                    setPage(
                      (current) =>
                        current + 1,
                    )
                  }
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-[#D7E0D8] px-4 text-sm font-extrabold text-[#526159] transition hover:bg-[#F5F7F3] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                  <ChevronRight
                    className="size-4"
                    aria-hidden={true}
                  />
                </button>
              </div>
            </div>
          </>
        )}
      </section>

      {editingItem ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-item-title"
          className="fixed inset-0 z-50 flex items-end justify-center bg-[#061F18]/60 p-0 backdrop-blur-sm sm:items-center sm:p-6"
        >
          <div className="max-h-[94vh] w-full max-w-3xl overflow-y-auto rounded-t-[28px] bg-white shadow-2xl sm:rounded-[28px]">
            <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-[#E2E8E2] bg-white px-6 py-5 sm:px-7">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.15em] text-[#0C8A63]">
                  Inventory
                </p>

                <h2
                  id="edit-item-title"
                  className="mt-1 text-2xl font-extrabold tracking-[-0.04em] text-[#10271F]"
                >
                  Edit food item
                </h2>
              </div>

              <button
                type="button"
                onClick={() =>
                  setEditingItem(null)
                }
                className="grid size-10 place-items-center rounded-xl border border-[#D8E1D9] text-[#526159] transition hover:bg-[#F5F7F3]"
                aria-label="Close edit form"
              >
                <X
                  className="size-5"
                  aria-hidden={true}
                />
              </button>
            </div>

            <div className="p-6 sm:p-7">
              <InventoryForm
                item={editingItem}
                onCancel={() =>
                  setEditingItem(null)
                }
                onSuccess={async (
                  updatedItem,
                ) => {
                  setEditingItem(null);
                  setNotice(
                    `${updatedItem.itemName} was updated successfully.`,
                  );
                  await loadItems();
                }}
              />
            </div>
          </div>
        </div>
      ) : null}

      {deletingItem ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-item-title"
          className="fixed inset-0 z-50 grid place-items-center bg-[#061F18]/60 p-5 backdrop-blur-sm"
        >
          <div className="w-full max-w-md rounded-[24px] bg-white p-6 shadow-2xl sm:p-7">
            <span className="grid size-12 place-items-center rounded-2xl bg-[#FEF2F2] text-[#DC2626]">
              <AlertTriangle
                className="size-6"
                aria-hidden={true}
              />
            </span>

            <h2
              id="delete-item-title"
              className="mt-5 text-2xl font-extrabold tracking-[-0.04em] text-[#10271F]"
            >
              Delete food item?
            </h2>

            <p className="mt-3 text-sm leading-6 text-[#6C7D75]">
              <span className="font-extrabold text-[#394A42]">
                {deletingItem.itemName}
              </span>{" "}
              will be permanently removed
              from your inventory. This
              action cannot be undone.
            </p>

            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={
                  actionLoadingId ===
                  deletingItem.id
                }
                onClick={() =>
                  setDeletingItem(null)
                }
                className="inline-flex h-11 items-center justify-center rounded-xl border border-[#D7E0D8] px-5 text-sm font-extrabold text-[#526159] transition hover:bg-[#F5F7F3] disabled:opacity-60"
              >
                Keep item
              </button>

              <button
                type="button"
                disabled={
                  actionLoadingId ===
                  deletingItem.id
                }
                onClick={() =>
                  void deleteItem()
                }
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#DC2626] px-5 text-sm font-extrabold text-white transition hover:bg-[#B91C1C] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {actionLoadingId ===
                deletingItem.id ? (
                  <LoaderCircle
                    className="size-4 animate-spin"
                    aria-hidden={true}
                  />
                ) : (
                  <Trash2
                    className="size-4"
                    aria-hidden={true}
                  />
                )}
                Delete item
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}