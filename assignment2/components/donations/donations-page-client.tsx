"use client";

import Link from "next/link";
import {
  AlertCircle,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  HandHeart,
  LoaderCircle,
  Package,
  Plus,
  Search,
  Trash2,
  UserRound,
  X,
  XCircle,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  FoodDetails,
  StatusBadge,
  formatDate,
} from "@/components/donations/donation-shared";
import type {
  ApiResponse,
} from "@/types/api";
import type {
  OwnDonationListing,
  OwnDonationsData,
} from "@/types/donations";

export function DonationsPageClient() {
  const [data, setData] =
    useState<OwnDonationsData | null>(
      null,
    );

  const [searchInput, setSearchInput] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [status, setStatus] =
    useState("");

  const [page, setPage] =
    useState(1);

  const [refreshKey, setRefreshKey] =
    useState(0);

  const [loadedKey, setLoadedKey] =
    useState("");

  const [error, setError] =
    useState<string | null>(null);

  const [notice, setNotice] =
    useState<string | null>(null);

  const [actionId, setActionId] =
    useState<string | null>(null);

  useEffect(() => {
    const timeout =
      window.setTimeout(() => {
        setSearch(
          searchInput.trim(),
        );
        setPage(1);
      }, 350);

    return () => {
      window.clearTimeout(
        timeout,
      );
    };
  }, [searchInput]);

  const queryKey = JSON.stringify({
    search,
    status,
    page,
    refreshKey,
  });

  useEffect(() => {
    const controller =
      new AbortController();

    void (async () => {
      try {
        const parameters =
          new URLSearchParams({
            page: String(page),
            size: "10",
          });

        if (search) {
          parameters.set(
            "search",
            search,
          );
        }

        if (status) {
          parameters.set(
            "status",
            status,
          );
        }

        const response =
          await fetch(
            `/api/donations?${parameters.toString()}`,
            {
              credentials:
                "include",
              cache: "no-store",
              signal:
                controller.signal,
            },
          );

        const result =
          (await response.json()) as ApiResponse<OwnDonationsData>;

        if (
          !response.ok ||
          !result.success ||
          !result.data
        ) {
          throw new Error(
            result.message ||
              "Unable to load donations.",
          );
        }

        if (
          controller.signal.aborted
        ) {
          return;
        }

        setData(result.data);
        setLoadedKey(queryKey);
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
            : "Unable to load donations.",
        );
      }
    })();

    return () => {
      controller.abort();
    };
  }, [
    page,
    queryKey,
    search,
    status,
  ]);

  const summary = useMemo(() => {
    const items =
      data?.items ?? [];

    return {
      active: items.filter(
        (item) =>
          item.status ===
            "AVAILABLE" ||
          item.status ===
            "RESERVED",
      ).length,

      pendingRequests:
        items.reduce(
          (total, listing) =>
            total +
            listing.requests.filter(
              (request) =>
                request.status ===
                "PENDING",
            ).length,
          0,
        ),

      completed: items.filter(
        (item) =>
          item.status ===
          "COMPLETED",
      ).length,
    };
  }, [data]);

  async function runRequestAction(
    requestId: string,
    action: "ACCEPT" | "REJECT",
    itemName: string,
  ) {
    setActionId(requestId);
    setError(null);

    try {
      const response = await fetch(
        `/api/donation-requests/${requestId}`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            action,
          }),
        },
      );

      const result =
        (await response.json()) as ApiResponse<unknown>;

      if (
        !response.ok ||
        !result.success
      ) {
        throw new Error(
          result.message ||
            "Unable to update the request.",
        );
      }

      setNotice(
        action === "ACCEPT"
          ? `Request for ${itemName} was accepted.`
          : `Request for ${itemName} was rejected.`,
      );

      setRefreshKey(
        (current) =>
          current + 1,
      );
    } catch (actionError) {
      setError(
        actionError instanceof Error
          ? actionError.message
          : "Unable to update the request.",
      );
    } finally {
      setActionId(null);
    }
  }

  async function cancelListing(
    listing: OwnDonationListing,
  ) {
    const confirmed =
      window.confirm(
        `Cancel the donation listing for ${listing.foodItem.itemName}?`,
      );

    if (!confirmed) {
      return;
    }

    setActionId(listing.id);
    setError(null);

    try {
      const response = await fetch(
        `/api/donations/${listing.id}`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            action: "CANCEL",
          }),
        },
      );

      const result =
        (await response.json()) as ApiResponse<unknown>;

      if (
        !response.ok ||
        !result.success
      ) {
        throw new Error(
          result.message ||
            "Unable to cancel the listing.",
        );
      }

      setNotice(
        `${listing.foodItem.itemName} was removed from donations.`,
      );

      setRefreshKey(
        (current) =>
          current + 1,
      );
    } catch (cancelError) {
      setError(
        cancelError instanceof Error
          ? cancelError.message
          : "Unable to cancel the listing.",
      );
    } finally {
      setActionId(null);
    }
  }

  const isInitialLoading =
    data === null && !error;

  const isRefreshing =
    data !== null &&
    loadedKey !== queryKey;

  return (
    <div className="mx-auto w-full max-w-[1500px] px-5 py-6 sm:px-7 sm:py-8 xl:px-10">
      <section className="relative overflow-hidden rounded-[28px] bg-[#052E24] px-6 py-8 text-white shadow-xl shadow-[#052E24]/10 sm:px-8 sm:py-10">
        <div className="pointer-events-none absolute -right-20 -top-28 size-80 rounded-full bg-[#BEF264]/15 blur-3xl" />

        <div className="relative z-10 flex flex-col justify-between gap-7 lg:flex-row lg:items-end">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.07] px-3.5 py-2 text-xs font-extrabold uppercase tracking-[0.14em] text-[#DFFFAF]">
              <HandHeart
                className="size-4"
                aria-hidden={true}
              />
              Donation management
            </div>

            <h1 className="mt-5 text-4xl font-extrabold leading-tight tracking-[-0.055em] sm:text-5xl">
              Share useful food with
              your community.
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-7 text-white/65 sm:text-lg">
              Publish food from your
              inventory and manage the
              requests submitted by
              other SavePlate users.
            </p>
          </div>

          <Link
            href="/donations/new"
            className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#BEF264] px-5 text-sm font-extrabold text-[#052E24] transition hover:bg-[#D0FF82]"
          >
            <Plus
              className="size-5"
              aria-hidden={true}
            />
            Donate food
          </Link>
        </div>
      </section>

      <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Total listings"
          value={
            data?.pagination
              .totalItems ?? 0
          }
          description="All donation listings matching your filters."
          icon={Package}
          iconClassName="bg-[#E8F8EE] text-[#087554]"
        />

        <SummaryCard
          label="Active shown"
          value={summary.active}
          description="Available or reserved listings on this page."
          icon={HandHeart}
          iconClassName="bg-[#EEF7D9] text-[#527417]"
        />

        <SummaryCard
          label="Pending requests"
          value={
            summary.pendingRequests
          }
          description="Requests currently awaiting your decision."
          icon={Clock3}
          iconClassName="bg-[#FFF1E6] text-[#EA580C]"
        />

        <SummaryCard
          label="Completed shown"
          value={summary.completed}
          description="Completed donations visible on this page."
          icon={Check}
          iconClassName="bg-[#E8EEFF] text-[#3158B7]"
        />
      </section>

      {notice ? (
        <div className="mt-6 flex items-start justify-between gap-4 rounded-2xl border border-[#BBE6CB] bg-[#EDFBF2] px-5 py-4 text-sm font-bold text-[#166534]">
          <p>{notice}</p>

          <button
            type="button"
            onClick={() =>
              setNotice(null)
            }
          >
            <X className="size-4" />
          </button>
        </div>
      ) : null}

      {error ? (
        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-[#FECACA] bg-[#FEF2F2] px-5 py-4 text-sm font-bold text-[#B91C1C]">
          <AlertCircle className="size-5 shrink-0" />
          <p>{error}</p>
        </div>
      ) : null}

      <section className="mt-6 rounded-[24px] border border-[#DFE6DE] bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#0C8A63]">
              My donations
            </p>

            <h2 className="mt-2 text-2xl font-extrabold tracking-[-0.04em]">
              Donation listings
            </h2>
          </div>

          <div className="flex w-full flex-col gap-3 sm:flex-row xl:max-w-2xl">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-[#849087]" />

              <input
                type="search"
                value={searchInput}
                onChange={(event) =>
                  setSearchInput(
                    event.target.value,
                  )
                }
                placeholder="Search food or pickup location..."
                className="h-12 w-full rounded-xl border border-[#D8E1D9] bg-[#F9FBF8] pl-12 pr-4 text-sm font-semibold outline-none focus:border-[#0C8A63]"
              />
            </div>

            <select
              value={status}
              onChange={(event) => {
                setStatus(
                  event.target.value,
                );
                setPage(1);
              }}
              className="h-12 rounded-xl border border-[#D8E1D9] bg-white px-4 text-sm font-bold text-[#46574F]"
            >
              <option value="">
                All statuses
              </option>
              <option value="AVAILABLE">
                Available
              </option>
              <option value="RESERVED">
                Reserved
              </option>
              <option value="COMPLETED">
                Completed
              </option>
              <option value="CANCELLED">
                Cancelled
              </option>
              <option value="EXPIRED">
                Expired
              </option>
            </select>
          </div>
        </div>

        {isRefreshing ? (
          <p className="mt-4 text-xs font-bold text-[#0C8A63]">
            Updating results...
          </p>
        ) : null}

        {isInitialLoading ? (
          <div className="grid min-h-[420px] place-items-center">
            <LoaderCircle className="size-8 animate-spin text-[#0C8A63]" />
          </div>
        ) : data?.items.length ===
          0 ? (
          <div className="mt-6 flex min-h-[380px] flex-col items-center justify-center rounded-2xl border border-dashed border-[#C9D8CA] bg-[#F7F9F4] px-6 text-center">
            <HandHeart className="size-12 text-[#065F46]" />

            <h3 className="mt-5 text-xl font-extrabold">
              No donation listings
            </h3>

            <p className="mt-2 max-w-md text-sm leading-6 text-[#6C7D75]">
              Publish an eligible
              inventory item to begin
              sharing food.
            </p>

            <Link
              href="/donations/new"
              className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-[#065F46] px-5 text-sm font-extrabold text-white"
            >
              <Plus className="size-4" />
              Donate food
            </Link>
          </div>
        ) : (
          <div className="mt-6 space-y-5">
            {data?.items.map(
              (listing) => {
                const pendingRequests =
                  listing.requests.filter(
                    (request) =>
                      request.status ===
                      "PENDING",
                  );

                return (
                  <article
                    key={listing.id}
                    className="rounded-2xl border border-[#DFE6DE] p-5 sm:p-6"
                  >
                    <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                      <div>
                        <div className="flex flex-wrap items-center gap-3">
                          <StatusBadge
                            status={
                              listing.status
                            }
                          />

                          <span className="text-xs font-bold text-[#7B8981]">
                            Created{" "}
                            {formatDate(
                              listing.createdAt,
                            )}
                          </span>
                        </div>

                        <h3 className="mt-4 text-2xl font-extrabold tracking-[-0.04em]">
                          {
                            listing
                              .foodItem
                              .itemName
                          }
                        </h3>

                        <p className="mt-2 text-sm font-semibold text-[#6C7D75]">
                          Pickup:{" "}
                          <span className="font-extrabold text-[#394A42]">
                            {
                              listing.pickupLocation
                            }
                          </span>
                        </p>
                      </div>

                      {listing.status ===
                      "AVAILABLE" ? (
                        <button
                          type="button"
                          disabled={
                            actionId ===
                            listing.id
                          }
                          onClick={() =>
                            void cancelListing(
                              listing,
                            )
                          }
                          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-[#F2CCCC] px-4 text-sm font-extrabold text-[#DC2626] hover:bg-[#FEF2F2] disabled:opacity-50"
                        >
                          {actionId ===
                          listing.id ? (
                            <LoaderCircle className="size-4 animate-spin" />
                          ) : (
                            <Trash2 className="size-4" />
                          )}
                          Cancel listing
                        </button>
                      ) : null}
                    </div>

                    <div className="mt-5">
                      <FoodDetails
                        item={
                          listing.foodItem
                        }
                      />
                    </div>

                    <div className="mt-5 rounded-2xl bg-[#F7F9F6] p-4">
                      <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#0C8A63]">
                        Pickup availability
                      </p>

                      <p className="mt-2 text-sm leading-6 text-[#536159]">
                        {
                          listing.availabilityDetails
                        }
                      </p>
                    </div>

                    <div className="mt-6 border-t border-[#E3E8E3] pt-5">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-extrabold">
                            Incoming requests
                          </p>

                          <p className="mt-1 text-xs text-[#7A887F]">
                            {
                              pendingRequests.length
                            }{" "}
                            pending
                          </p>
                        </div>
                      </div>

                      {listing.requests
                        .length === 0 ? (
                        <div className="mt-4 rounded-xl border border-dashed border-[#D4DED5] px-4 py-6 text-center text-sm font-semibold text-[#7A887F]">
                          No requests have
                          been submitted.
                        </div>
                      ) : (
                        <div className="mt-4 space-y-3">
                          {listing.requests.map(
                            (request) => (
                              <div
                                key={
                                  request.id
                                }
                                className="rounded-xl border border-[#E0E7E0] p-4"
                              >
                                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                                  <div className="flex items-start gap-3">
                                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#E8F8EE] text-[#087554]">
                                      <UserRound className="size-5" />
                                    </span>

                                    <div>
                                      <p className="font-extrabold">
                                        {
                                          request
                                            .requester
                                            .fullName
                                        }
                                      </p>

                                      <p className="mt-1 text-xs text-[#7A887F]">
                                        Requested{" "}
                                        {formatDate(
                                          request.createdAt,
                                        )}
                                      </p>
                                    </div>
                                  </div>

                                  <StatusBadge
                                    status={
                                      request.status
                                    }
                                  />
                                </div>

                                {request.message ? (
                                  <p className="mt-3 rounded-lg bg-[#F7F9F6] px-3 py-2 text-sm leading-6 text-[#536159]">
                                    {
                                      request.message
                                    }
                                  </p>
                                ) : null}

                                {request.status ===
                                "PENDING" ? (
                                  <div className="mt-4 flex flex-wrap gap-2">
                                    <button
                                      type="button"
                                      disabled={
                                        actionId ===
                                        request.id
                                      }
                                      onClick={() =>
                                        void runRequestAction(
                                          request.id,
                                          "ACCEPT",
                                          listing
                                            .foodItem
                                            .itemName,
                                        )
                                      }
                                      className="inline-flex h-9 items-center gap-2 rounded-lg bg-[#065F46] px-4 text-xs font-extrabold text-white disabled:opacity-50"
                                    >
                                      <Check className="size-4" />
                                      Accept
                                    </button>

                                    <button
                                      type="button"
                                      disabled={
                                        actionId ===
                                        request.id
                                      }
                                      onClick={() =>
                                        void runRequestAction(
                                          request.id,
                                          "REJECT",
                                          listing
                                            .foodItem
                                            .itemName,
                                        )
                                      }
                                      className="inline-flex h-9 items-center gap-2 rounded-lg border border-[#F2CCCC] px-4 text-xs font-extrabold text-[#DC2626] disabled:opacity-50"
                                    >
                                      <XCircle className="size-4" />
                                      Reject
                                    </button>
                                  </div>
                                ) : null}
                              </div>
                            ),
                          )}
                        </div>
                      )}
                    </div>
                  </article>
                );
              },
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
                type="button"
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
                className="grid size-10 place-items-center rounded-xl border border-[#D7E0D8] disabled:opacity-40"
              >
                <ChevronLeft className="size-4" />
              </button>

              <button
                type="button"
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
                className="grid size-10 place-items-center rounded-xl border border-[#D7E0D8] disabled:opacity-40"
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

function SummaryCard({
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
  }>;
  iconClassName: string;
}) {
  return (
    <article className="rounded-2xl border border-[#DFE6DE] bg-white p-5 shadow-sm">
      <div className="flex justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-[#6C7D75]">
            {label}
          </p>

          <p className="mt-3 text-3xl font-extrabold tracking-[-0.05em]">
            {value}
          </p>
        </div>

        <span
          className={`grid size-11 place-items-center rounded-2xl ${iconClassName}`}
        >
          <Icon className="size-5" />
        </span>
      </div>

      <p className="mt-4 text-xs font-semibold leading-5 text-[#829087]">
        {description}
      </p>
    </article>
  );
}