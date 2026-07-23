"use client";

import {
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  HandHeart,
  LoaderCircle,
  MapPin,
  Search,
  XCircle,
} from "lucide-react";
import {
  useEffect,
  useState,
} from "react";

import {
  StatusBadge,
  formatDate,
  humanizeEnum,
} from "@/components/donations/donation-shared";
import type {
  ApiResponse,
} from "@/types/api";
import type {
  MyDonationRequestsData,
} from "@/types/donations";

export function MyRequestsPageClient() {
  const [data, setData] =
    useState<MyDonationRequestsData | null>(
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

  const [actionId, setActionId] =
    useState<string | null>(null);

  const [error, setError] =
    useState<string | null>(null);

  const [notice, setNotice] =
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
            `/api/donation-requests?${parameters.toString()}`,
            {
              credentials:
                "include",
              cache: "no-store",
              signal:
                controller.signal,
            },
          );

        const result =
          (await response.json()) as ApiResponse<MyDonationRequestsData>;

        if (
          !response.ok ||
          !result.success ||
          !result.data
        ) {
          throw new Error(
            result.message ||
              "Unable to load your requests.",
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
            : "Unable to load your requests.",
        );
      }
    })();

    return () => {
      controller.abort();
    };
  }, [
    page,
    refreshKey,
    search,
    status,
  ]);

  async function performAction(
    requestId: string,
    action:
      | "CLAIM"
      | "CANCEL",
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
        action === "CLAIM"
          ? `${itemName} was marked as claimed.`
          : `Your request for ${itemName} was cancelled.`,
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

  return (
    <div className="mx-auto w-full max-w-[1500px] px-5 py-6 sm:px-7 sm:py-8 xl:px-10">
      <section className="rounded-[28px] bg-[#052E24] px-6 py-8 text-white sm:px-8 sm:py-10">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.07] px-3.5 py-2 text-xs font-extrabold uppercase tracking-[0.14em] text-[#DFFFAF]">
          <HandHeart className="size-4" />
          My food requests
        </div>

        <h1 className="mt-5 text-4xl font-extrabold tracking-[-0.055em] sm:text-5xl">
          Track requested food.
        </h1>

        <p className="mt-4 max-w-2xl text-base leading-7 text-white/65 sm:text-lg">
          Review pending,
          accepted, rejected and
          claimed donation requests.
        </p>
      </section>

      {notice ? (
        <div className="mt-6 rounded-2xl border border-[#BBE6CB] bg-[#EDFBF2] px-5 py-4 text-sm font-bold text-[#166534]">
          {notice}
        </div>
      ) : null}

      {error ? (
        <div className="mt-6 flex gap-3 rounded-2xl border border-[#FECACA] bg-[#FEF2F2] px-5 py-4 text-sm font-bold text-[#B91C1C]">
          <AlertCircle className="size-5" />
          {error}
        </div>
      ) : null}

      <section className="mt-6 rounded-[24px] border border-[#DFE6DE] bg-white p-5 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row">
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
              className="h-12 w-full rounded-xl border border-[#D8E1D9] pl-12 pr-4 text-sm font-semibold outline-none"
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
            className="h-12 rounded-xl border border-[#D8E1D9] px-4 text-sm font-bold"
          >
            <option value="">
              All statuses
            </option>
            <option value="PENDING">
              Pending
            </option>
            <option value="ACCEPTED">
              Accepted
            </option>
            <option value="REJECTED">
              Rejected
            </option>
            <option value="CLAIMED">
              Claimed
            </option>
            <option value="CANCELLED">
              Cancelled
            </option>
          </select>
        </div>

        {data === null && !error ? (
          <div className="grid min-h-[420px] place-items-center">
            <LoaderCircle className="size-8 animate-spin text-[#0C8A63]" />
          </div>
        ) : data?.items.length ===
          0 ? (
          <div className="mt-6 grid min-h-[380px] place-items-center rounded-2xl border border-dashed border-[#C9D8CA] bg-[#F7F9F4] text-center">
            <div>
              <HandHeart className="mx-auto size-12 text-[#065F46]" />

              <h2 className="mt-4 text-xl font-extrabold">
                No food requests
              </h2>
            </div>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {data?.items.map(
              (request) => (
                <article
                  key={request.id}
                  className="rounded-2xl border border-[#DFE6DE] p-5 sm:p-6"
                >
                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                    <div>
                      <StatusBadge
                        status={
                          request.status
                        }
                      />

                      <h2 className="mt-4 text-2xl font-extrabold tracking-[-0.04em]">
                        {
                          request.listing
                            .foodItem
                            .itemName
                        }
                      </h2>

                      <p className="mt-2 text-sm font-bold text-[#627169]">
                        {
                          request.listing
                            .foodItem
                            .quantity
                        }{" "}
                        {humanizeEnum(
                          request.listing
                            .foodItem.unit,
                        )}
                      </p>
                    </div>

                    <p className="text-xs font-bold text-[#7A887F]">
                      Requested{" "}
                      {formatDate(
                        request.createdAt,
                      )}
                    </p>
                  </div>

                  <div className="mt-5 grid gap-3 md:grid-cols-3">
                    <div className="rounded-xl bg-[#F7F9F6] p-4">
                      <MapPin className="size-4 text-[#3158B7]" />
                      <p className="mt-2 text-sm font-extrabold">
                        {
                          request.listing
                            .pickupLocation
                        }
                      </p>
                    </div>

                    <div className="rounded-xl bg-[#F7F9F6] p-4">
                      <Clock3 className="size-4 text-[#EA580C]" />
                      <p className="mt-2 text-sm font-extrabold">
                        {
                          request.listing
                            .availabilityDetails
                        }
                      </p>
                    </div>

                    <div className="rounded-xl bg-[#F7F9F6] p-4">
                      <HandHeart className="size-4 text-[#527417]" />
                      <p className="mt-2 text-sm font-extrabold">
                        {
                          request.listing
                            .donor.fullName
                        }
                      </p>
                    </div>
                  </div>

                  {request.message ? (
                    <p className="mt-4 rounded-xl border border-[#E0E7E0] p-4 text-sm leading-6 text-[#536159]">
                      {request.message}
                    </p>
                  ) : null}

                  {request.status ===
                  "ACCEPTED" ? (
                    <button
                      type="button"
                      disabled={
                        actionId ===
                        request.id
                      }
                      onClick={() =>
                        void performAction(
                          request.id,
                          "CLAIM",
                          request.listing
                            .foodItem
                            .itemName,
                        )
                      }
                      className="mt-5 inline-flex h-11 items-center gap-2 rounded-xl bg-[#065F46] px-5 text-sm font-extrabold text-white disabled:opacity-50"
                    >
                      {actionId ===
                      request.id ? (
                        <LoaderCircle className="size-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="size-4" />
                      )}
                      Mark as claimed
                    </button>
                  ) : null}

                  {request.status ===
                  "PENDING" ? (
                    <button
                      type="button"
                      disabled={
                        actionId ===
                        request.id
                      }
                      onClick={() =>
                        void performAction(
                          request.id,
                          "CANCEL",
                          request.listing
                            .foodItem
                            .itemName,
                        )
                      }
                      className="mt-5 inline-flex h-11 items-center gap-2 rounded-xl border border-[#F2CCCC] px-5 text-sm font-extrabold text-[#DC2626] disabled:opacity-50"
                    >
                      <XCircle className="size-4" />
                      Cancel request
                    </button>
                  ) : null}
                </article>
              ),
            )}
          </div>
        )}

        {data &&
        data.pagination.totalPages >
          1 ? (
          <div className="mt-6 flex justify-end gap-2 border-t pt-5">
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
        ) : null}
      </section>
    </div>
  );
}