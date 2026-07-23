"use client";

import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  HandHeart,
  LoaderCircle,
  MapPin,
  Send,
  UserRound,
  XCircle,
} from "lucide-react";
import {
  useEffect,
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
  BrowseDonationListing,
} from "@/types/donations";

export function DonationDetailClient({
  listingId,
}: {
  listingId: string;
}) {
  const [listing, setListing] =
    useState<BrowseDonationListing | null>(
      null,
    );

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState<string | null>(null);

  const [notice, setNotice] =
    useState<string | null>(null);

  const [actionLoading, setActionLoading] =
    useState(false);

  const [refreshKey, setRefreshKey] =
    useState(0);

  useEffect(() => {
    const controller =
      new AbortController();

    void (async () => {
      try {
        const response =
          await fetch(
            `/api/browse-food/${listingId}`,
            {
              credentials:
                "include",
              cache: "no-store",
              signal:
                controller.signal,
            },
          );

        const result =
          (await response.json()) as ApiResponse<BrowseDonationListing>;

        if (
          !response.ok ||
          !result.success ||
          !result.data
        ) {
          throw new Error(
            result.message ||
              "Unable to load donation details.",
          );
        }

        if (
          controller.signal.aborted
        ) {
          return;
        }

        setListing(result.data);
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
            : "Unable to load donation details.",
        );
      }
    })();

    return () => {
      controller.abort();
    };
  }, [listingId, refreshKey]);

  async function submitRequest(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setActionLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/donations/${listingId}/requests`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            message:
              message.trim() ||
              null,
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
            "Unable to submit the request.",
        );
      }

      setMessage("");
      setNotice(
        "Your food request was submitted.",
      );
      setRefreshKey(
        (current) =>
          current + 1,
      );
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to submit the request.",
      );
    } finally {
      setActionLoading(false);
    }
  }

  async function cancelRequest() {
    const request =
      listing?.currentRequest;

    if (!request) {
      return;
    }

    setActionLoading(true);

    try {
      const response = await fetch(
        `/api/donation-requests/${request.id}`,
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
            "Unable to cancel the request.",
        );
      }

      setNotice(
        "Your request was cancelled.",
      );

      setRefreshKey(
        (current) =>
          current + 1,
      );
    } catch (cancelError) {
      setError(
        cancelError instanceof Error
          ? cancelError.message
          : "Unable to cancel the request.",
      );
    } finally {
      setActionLoading(false);
    }
  }

  if (!listing && !error) {
    return (
      <div className="grid min-h-[70vh] place-items-center">
        <LoaderCircle className="size-8 animate-spin text-[#0C8A63]" />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-12">
        <div className="rounded-2xl border border-[#FECACA] bg-[#FEF2F2] p-6 text-[#B91C1C]">
          <AlertCircle className="size-7" />
          <h1 className="mt-4 text-xl font-extrabold">
            Donation unavailable
          </h1>
          <p className="mt-2 text-sm">
            {error}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-6 sm:px-7 sm:py-8">
      <Link
        href="/browse-food"
        className="inline-flex items-center gap-2 text-sm font-extrabold text-[#065F46]"
      >
        <ArrowLeft className="size-4" />
        Back to Browse Food
      </Link>

      {notice ? (
        <div className="mt-5 rounded-2xl border border-[#BBE6CB] bg-[#EDFBF2] px-5 py-4 text-sm font-bold text-[#166534]">
          {notice}
        </div>
      ) : null}

      {error ? (
        <div className="mt-5 rounded-2xl border border-[#FECACA] bg-[#FEF2F2] px-5 py-4 text-sm font-bold text-[#B91C1C]">
          {error}
        </div>
      ) : null}

      <div className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <section className="rounded-[24px] border border-[#DFE6DE] bg-white p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <span className="grid size-16 place-items-center rounded-2xl bg-[#E8F8EE] text-[#087554]">
              <HandHeart className="size-8" />
            </span>

            <StatusBadge
              status={
                listing.currentRequest
                  ?.status ??
                listing.status
              }
            />
          </div>

          <p className="mt-6 text-xs font-extrabold uppercase tracking-[0.15em] text-[#0C8A63]">
            {
              listing.foodItem
                .category
            }
          </p>

          <h1 className="mt-2 text-4xl font-extrabold tracking-[-0.055em]">
            {
              listing.foodItem
                .itemName
            }
          </h1>

          <p className="mt-3 text-sm text-[#718078]">
            Listing created{" "}
            {formatDate(
              listing.createdAt,
            )}
          </p>

          <div className="mt-7">
            <FoodDetails
              item={listing.foodItem}
            />
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-[#E0E7E0] p-5">
              <MapPin className="size-5 text-[#3158B7]" />

              <p className="mt-4 text-xs font-extrabold uppercase tracking-wide text-[#7B8981]">
                Pickup location
              </p>

              <p className="mt-2 font-extrabold">
                {
                  listing.pickupLocation
                }
              </p>
            </div>

            <div className="rounded-2xl border border-[#E0E7E0] p-5">
              <UserRound className="size-5 text-[#527417]" />

              <p className="mt-4 text-xs font-extrabold uppercase tracking-wide text-[#7B8981]">
                Donor
              </p>

              <p className="mt-2 font-extrabold">
                {
                  listing.donor
                    .fullName
                }
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-2xl bg-[#F7F9F6] p-5">
            <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#0C8A63]">
              Availability
            </p>

            <p className="mt-2 text-sm leading-6 text-[#536159]">
              {
                listing.availabilityDetails
              }
            </p>
          </div>

          {listing.notes ? (
            <div className="mt-5 rounded-2xl bg-[#FFF7ED] p-5">
              <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#C2410C]">
                Donor notes
              </p>

              <p className="mt-2 text-sm leading-6 text-[#7C4A1F]">
                {listing.notes}
              </p>
            </div>
          ) : null}
        </section>

        <aside className="rounded-[24px] border border-[#DFE6DE] bg-white p-6">
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#0C8A63]">
            Food request
          </p>

          {!listing.currentRequest ? (
            <>
              <h2 className="mt-2 text-2xl font-extrabold tracking-[-0.04em]">
                Request this food
              </h2>

              <p className="mt-2 text-sm leading-6 text-[#6C7D75]">
                Send a brief message
                explaining when you can
                collect the item.
              </p>

              <form
                onSubmit={submitRequest}
                className="mt-6"
              >
                <textarea
                  rows={6}
                  maxLength={500}
                  value={message}
                  onChange={(event) =>
                    setMessage(
                      event.target.value,
                    )
                  }
                  placeholder="For example: I can collect tomorrow after 6 PM."
                  className="w-full resize-none rounded-xl border border-[#D8E1D9] p-4 text-sm font-semibold leading-6 outline-none focus:border-[#0C8A63]"
                />

                <button
                  type="submit"
                  disabled={
                    actionLoading
                  }
                  className="mt-4 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#065F46] px-5 text-sm font-extrabold text-white disabled:opacity-60"
                >
                  {actionLoading ? (
                    <LoaderCircle className="size-5 animate-spin" />
                  ) : (
                    <Send className="size-5" />
                  )}
                  Submit request
                </button>
              </form>
            </>
          ) : (
            <>
              <h2 className="mt-2 text-2xl font-extrabold tracking-[-0.04em]">
                Request submitted
              </h2>

              <div className="mt-5">
                <StatusBadge
                  status={
                    listing
                      .currentRequest
                      .status
                  }
                />
              </div>

              {listing.currentRequest
                .message ? (
                <p className="mt-5 rounded-xl bg-[#F7F9F6] p-4 text-sm leading-6 text-[#536159]">
                  {
                    listing
                      .currentRequest
                      .message
                  }
                </p>
              ) : null}

              {listing.currentRequest
                .status ===
              "PENDING" ? (
                <button
                  type="button"
                  disabled={
                    actionLoading
                  }
                  onClick={() =>
                    void cancelRequest()
                  }
                  className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#F2CCCC] text-sm font-extrabold text-[#DC2626]"
                >
                  <XCircle className="size-4" />
                  Cancel request
                </button>
              ) : null}

              <Link
                href="/requests"
                className="mt-3 inline-flex h-11 w-full items-center justify-center rounded-xl border border-[#D7E0D8] text-sm font-extrabold text-[#065F46]"
              >
                View My Requests
              </Link>
            </>
          )}
        </aside>
      </div>
    </div>
  );
}