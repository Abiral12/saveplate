"use client";

import Link from "next/link";
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Clock3,
  HandHeart,
  LoaderCircle,
  MapPin,
  Package,
  Search,
  UserRound,
  X,
} from "lucide-react";
import {
  useEffect,
  useState,
} from "react";

import {
  StatusBadge,
  formatDateOnly,
  getExpiryText,
  humanizeEnum,
} from "@/components/donations/donation-shared";
import type {
  ApiResponse,
} from "@/types/api";
import type {
  BrowseDonationsData,
} from "@/types/donations";

const CATEGORY_OPTIONS = [
  "DAIRY",
  "FRUIT",
  "VEGETABLE",
  "MEAT",
  "SEAFOOD",
  "GRAIN",
  "BAKERY",
  "FROZEN",
  "CANNED",
  "BEVERAGE",
  "SNACK",
  "OTHER",
];

export function BrowseFoodPageClient() {
  const [data, setData] =
    useState<BrowseDonationsData | null>(
      null,
    );

  const [searchInput, setSearchInput] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [location, setLocation] =
    useState("");

  const [category, setCategory] =
    useState("");

  const [expiry, setExpiry] =
    useState("");

  const [page, setPage] =
    useState(1);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    const timeout =
      window.setTimeout(() => {
        setSearch(
          searchInput.trim(),
        );
        setPage(1);
      }, 350);

    return () =>
      window.clearTimeout(
        timeout,
      );
  }, [searchInput]);

  useEffect(() => {
    const controller =
      new AbortController();

    void (async () => {
      try {
        const parameters =
          new URLSearchParams({
            page: String(page),
            size: "12",
          });

        if (search) {
          parameters.set(
            "search",
            search,
          );
        }

        if (location) {
          parameters.set(
            "location",
            location,
          );
        }

        if (category) {
          parameters.set(
            "category",
            category,
          );
        }

        if (expiry) {
          parameters.set(
            "expiry",
            expiry,
          );
        }

        const response =
          await fetch(
            `/api/browse-food?${parameters.toString()}`,
            {
              credentials:
                "include",
              cache: "no-store",
              signal:
                controller.signal,
            },
          );

        const result =
          (await response.json()) as ApiResponse<BrowseDonationsData>;

        if (
          !response.ok ||
          !result.success ||
          !result.data
        ) {
          throw new Error(
            result.message ||
              "Unable to load available donations.",
          );
        }

        if (
          controller.signal.aborted
        ) {
          return;
        }

        setData(result.data);
        setError(null);
      } catch (loadError) {
        if (
          controller.signal.aborted
        ) {
          return;
        }

        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load available donations.",
        );
      }
    })();

    return () => {
      controller.abort();
    };
  }, [
    category,
    expiry,
    location,
    page,
    search,
  ]);

  function clearFilters() {
    setSearchInput("");
    setSearch("");
    setLocation("");
    setCategory("");
    setExpiry("");
    setPage(1);
  }

  const hasFilters =
    Boolean(search) ||
    Boolean(location) ||
    Boolean(category) ||
    Boolean(expiry);

  return (
    <div className="mx-auto w-full max-w-[1500px] px-5 py-6 sm:px-7 sm:py-8 xl:px-10">
      <section className="relative overflow-hidden rounded-[28px] bg-[#052E24] px-6 py-8 text-white sm:px-8 sm:py-10">
        <div className="pointer-events-none absolute -right-20 -top-28 size-80 rounded-full bg-[#BEF264]/15 blur-3xl" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.07] px-3.5 py-2 text-xs font-extrabold uppercase tracking-[0.14em] text-[#DFFFAF]">
            <HandHeart className="size-4" />
            Community food
          </div>

          <h1 className="mt-5 text-4xl font-extrabold tracking-[-0.055em] sm:text-5xl">
            Browse food shared by
            others.
          </h1>

          <p className="mt-4 max-w-2xl text-base leading-7 text-white/65 sm:text-lg">
            Find available food near
            you, review the pickup
            details and submit a
            request to the donor.
          </p>
        </div>
      </section>

      {error ? (
        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-[#FECACA] bg-[#FEF2F2] px-5 py-4 text-sm font-bold text-[#B91C1C]">
          <AlertCircle className="size-5 shrink-0" />
          <p>{error}</p>
        </div>
      ) : null}

      <section className="mt-6 rounded-[24px] border border-[#DFE6DE] bg-white p-5 sm:p-6">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(170px,0.6fr))_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-[#849087]" />

            <input
              type="search"
              value={searchInput}
              onChange={(event) =>
                setSearchInput(
                  event.target.value,
                )
              }
              placeholder="Search food..."
              className="h-12 w-full rounded-xl border border-[#D8E1D9] bg-[#F9FBF8] pl-12 pr-4 text-sm font-semibold outline-none focus:border-[#0C8A63]"
            />
          </div>

          <div className="relative">
            <MapPin className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#849087]" />

            <input
              value={location}
              onChange={(event) => {
                setLocation(
                  event.target.value,
                );
                setPage(1);
              }}
              placeholder="Pickup area"
              className="h-12 w-full rounded-xl border border-[#D8E1D9] pl-11 pr-3 text-sm font-semibold outline-none"
            />
          </div>

          <select
            value={category}
            onChange={(event) => {
              setCategory(
                event.target.value,
              );
              setPage(1);
            }}
            className="h-12 rounded-xl border border-[#D8E1D9] px-3 text-sm font-bold"
          >
            <option value="">
              All categories
            </option>

            {CATEGORY_OPTIONS.map(
              (option) => (
                <option
                  key={option}
                  value={option}
                >
                  {humanizeEnum(
                    option,
                  )}
                </option>
              ),
            )}
          </select>

          <select
            value={expiry}
            onChange={(event) => {
              setExpiry(
                event.target.value,
              );
              setPage(1);
            }}
            className="h-12 rounded-xl border border-[#D8E1D9] px-3 text-sm font-bold"
          >
            <option value="">
              Any expiry
            </option>
            <option value="soon">
              Within 7 days
            </option>
            <option value="later">
              More than 7 days
            </option>
          </select>

          {hasFilters ? (
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-[#D8E1D9] px-4 text-sm font-extrabold text-[#536159]"
            >
              <X className="size-4" />
              Clear
            </button>
          ) : null}
        </div>

        {data === null && !error ? (
          <div className="grid min-h-[430px] place-items-center">
            <LoaderCircle className="size-8 animate-spin text-[#0C8A63]" />
          </div>
        ) : data?.items.length ===
          0 ? (
          <div className="mt-6 flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-dashed border-[#C9D8CA] bg-[#F7F9F4] px-6 text-center">
            <HandHeart className="size-12 text-[#065F46]" />

            <h2 className="mt-5 text-xl font-extrabold">
              No available donations
            </h2>

            <p className="mt-2 max-w-md text-sm leading-6 text-[#6C7D75]">
              No listings currently
              match your search and
              filters.
            </p>
          </div>
        ) : (
          <div className="mt-6 grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
            {data?.items.map(
              (listing) => (
                <article
                  key={listing.id}
                  className="flex flex-col rounded-2xl border border-[#DFE6DE] p-5 transition hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <div className="flex items-start justify-between gap-4">
                    <span className="grid size-12 place-items-center rounded-2xl bg-[#E8F8EE] text-[#087554]">
                      <Package className="size-6" />
                    </span>

                    {listing.currentRequest ? (
                      <StatusBadge
                        status={
                          listing
                            .currentRequest
                            .status
                        }
                      />
                    ) : (
                      <StatusBadge
                        status={
                          listing.status
                        }
                      />
                    )}
                  </div>

                  <p className="mt-5 text-xs font-extrabold uppercase tracking-[0.14em] text-[#0C8A63]">
                    {humanizeEnum(
                      listing.foodItem
                        .category,
                    )}
                  </p>

                  <h2 className="mt-2 text-2xl font-extrabold tracking-[-0.04em]">
                    {
                      listing.foodItem
                        .itemName
                    }
                  </h2>

                  <p className="mt-2 text-sm font-bold text-[#627169]">
                    {
                      listing.foodItem
                        .quantity
                    }{" "}
                    {humanizeEnum(
                      listing.foodItem
                        .unit,
                    )}
                  </p>

                  <div className="mt-5 space-y-3 border-t border-[#E4E9E4] pt-4">
                    <div className="flex items-start gap-3">
                      <Clock3 className="mt-0.5 size-4 text-[#EA580C]" />

                      <div>
                        <p className="text-sm font-extrabold">
                          {formatDateOnly(
                            listing
                              .foodItem
                              .expiryDate,
                          )}
                        </p>

                        <p className="mt-1 text-xs font-bold text-[#EA580C]">
                          {getExpiryText(
                            listing.foodItem,
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <MapPin className="mt-0.5 size-4 text-[#3158B7]" />

                      <p className="text-sm font-semibold text-[#536159]">
                        {
                          listing.pickupLocation
                        }
                      </p>
                    </div>

                    <div className="flex items-start gap-3">
                      <UserRound className="mt-0.5 size-4 text-[#527417]" />

                      <p className="text-sm font-semibold text-[#536159]">
                        Shared by{" "}
                        <span className="font-extrabold">
                          {
                            listing.donor
                              .fullName
                          }
                        </span>
                      </p>
                    </div>
                  </div>

                  <p className="mt-4 line-clamp-2 text-sm leading-6 text-[#738179]">
                    {
                      listing.availabilityDetails
                    }
                  </p>

                  <Link
                    href={`/browse-food/${listing.id}`}
                    className="mt-5 inline-flex h-11 items-center justify-center rounded-xl bg-[#065F46] px-5 text-sm font-extrabold text-white transition hover:bg-[#054C39]"
                  >
                    {listing.currentRequest
                      ? "View request"
                      : "View details"}
                  </Link>
                </article>
              ),
            )}
          </div>
        )}

        {data &&
        data.pagination.totalPages >
          1 ? (
          <div className="mt-6 flex items-center justify-between border-t border-[#E5EAE5] pt-5">
            <p className="text-sm font-semibold text-[#728078]">
              Page{" "}
              {data.pagination.page} of{" "}
              {
                data.pagination
                  .totalPages
              }
            </p>

            <div className="flex gap-2">
              <button
                disabled={
                  !data.pagination
                    .hasPrevious
                }
                onClick={() =>
                  setPage((current) =>
                    Math.max(
                      1,
                      current - 1,
                    ),
                  )
                }
                className="grid size-10 place-items-center rounded-xl border disabled:opacity-40"
              >
                <ChevronLeft className="size-4" />
              </button>

              <button
                disabled={
                  !data.pagination
                    .hasNext
                }
                onClick={() =>
                  setPage(
                    (current) =>
                      current + 1,
                  )
                }
                className="grid size-10 place-items-center rounded-xl border disabled:opacity-40"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
}