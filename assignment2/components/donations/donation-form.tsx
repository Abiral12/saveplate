"use client";

import {
  AlertCircle,
  CalendarDays,
  Check,
  LoaderCircle,
  MapPin,
  Package,
  StickyNote,
} from "lucide-react";
import {
  useEffect,
  useState,
} from "react";
import {
  useRouter,
} from "next/navigation";

import {
  formatDateOnly,
  humanizeEnum,
} from "@/components/donations/donation-shared";
import type {
  ApiResponse,
} from "@/types/api";
import type {
  DonationFoodItem,
  OwnDonationListing,
} from "@/types/donations";

const inputClassName =
  "h-12 w-full rounded-xl border border-[#D8E1D9] bg-white px-4 text-sm font-semibold text-[#10271F] outline-none transition placeholder:text-[#9AA69F] focus:border-[#0C8A63] focus:ring-4 focus:ring-[#0C8A63]/10 disabled:cursor-not-allowed disabled:bg-[#F5F7F4]";

export function DonationForm() {
  const router = useRouter();

  const [items, setItems] =
    useState<
      DonationFoodItem[] | null
    >(null);

  const [
    selectedFoodItemId,
    setSelectedFoodItemId,
  ] = useState("");

  const [
    pickupLocation,
    setPickupLocation,
  ] = useState("");

  const [
    availabilityDetails,
    setAvailabilityDetails,
  ] = useState("");

  const [notes, setNotes] =
    useState("");

  const [error, setError] =
    useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  useEffect(() => {
    const controller =
      new AbortController();

    void (async () => {
      try {
        const response =
          await fetch(
            "/api/donations/eligible-items",
            {
              credentials:
                "include",
              cache: "no-store",
              signal:
                controller.signal,
            },
          );

        const result =
          (await response.json()) as ApiResponse<
            DonationFoodItem[]
          >;

        if (
          !response.ok ||
          !result.success ||
          !result.data
        ) {
          throw new Error(
            result.message ||
              "Unable to load eligible food items.",
          );
        }

        if (
          controller.signal.aborted
        ) {
          return;
        }

        setItems(result.data);

        if (
          result.data.length > 0
        ) {
          setSelectedFoodItemId(
            result.data[0].id,
          );
        }
      } catch (loadError) {
        if (
          controller.signal.aborted
        ) {
          return;
        }

        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load eligible food items.",
        );
      }
    })();

    return () => {
      controller.abort();
    };
  }, []);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!selectedFoodItemId) {
      setError(
        "Please select a food item.",
      );
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch(
        "/api/donations",
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            foodItemId:
              selectedFoodItemId,
            pickupLocation:
              pickupLocation.trim(),
            availabilityDetails:
              availabilityDetails.trim(),
            notes:
              notes.trim() || null,
          }),
        },
      );

      const result =
        (await response.json()) as ApiResponse<OwnDonationListing>;

      if (
        !response.ok ||
        !result.success ||
        !result.data
      ) {
        throw new Error(
          result.message ||
            "Unable to create the donation listing.",
        );
      }

      router.push("/donations");
      router.refresh();
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Unable to create the donation listing.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (items === null && !error) {
    return (
      <div className="grid min-h-72 place-items-center">
        <div className="text-center">
          <LoaderCircle
            className="mx-auto size-8 animate-spin text-[#0C8A63]"
            aria-hidden={true}
          />

          <p className="mt-3 text-sm font-bold text-[#6C7D75]">
            Loading eligible items...
          </p>
        </div>
      </div>
    );
  }

  if (
    items !== null &&
    items.length === 0
  ) {
    return (
      <div className="rounded-2xl border border-dashed border-[#C9D8CA] bg-[#F7F9F4] px-6 py-12 text-center">
        <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-[#E6F7EC] text-[#065F46]">
          <Package
            className="size-8"
            aria-hidden={true}
          />
        </span>

        <h2 className="mt-5 text-xl font-extrabold text-[#10271F]">
          No eligible food items
        </h2>

        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#6C7D75]">
          Only available,
          non-expired inventory items
          can be listed for donation.
        </p>

        <button
          type="button"
          onClick={() =>
            router.push(
              "/inventory/new",
            )
          }
          className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-[#065F46] px-5 text-sm font-extrabold text-white transition hover:bg-[#054C39]"
        >
          Add inventory item
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      {error ? (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-2xl border border-[#FECACA] bg-[#FEF2F2] px-4 py-4 text-sm font-semibold text-[#B91C1C]"
        >
          <AlertCircle
            className="mt-0.5 size-5 shrink-0"
            aria-hidden={true}
          />

          <p>{error}</p>
        </div>
      ) : null}

      <div>
        <label
          htmlFor="foodItemId"
          className="mb-2 block text-sm font-extrabold text-[#24352E]"
        >
          Select food item
          <span className="ml-1 text-[#DC2626]">
            *
          </span>
        </label>

        <select
          id="foodItemId"
          required
          value={
            selectedFoodItemId
          }
          onChange={(event) =>
            setSelectedFoodItemId(
              event.target.value,
            )
          }
          disabled={isSubmitting}
          className={inputClassName}
        >
          {(items ?? []).map(
            (item) => (
              <option
                key={item.id}
                value={item.id}
              >
                {item.itemName} —{" "}
                {item.quantity}{" "}
                {humanizeEnum(
                  item.unit,
                )}{" "}
                — expires{" "}
                {formatDateOnly(
                  item.expiryDate,
                )}
              </option>
            ),
          )}
        </select>
      </div>

      <div>
        <label
          htmlFor="pickupLocation"
          className="mb-2 block text-sm font-extrabold text-[#24352E]"
        >
          Pickup location
          <span className="ml-1 text-[#DC2626]">
            *
          </span>
        </label>

        <div className="relative">
          <MapPin
            className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-[#849087]"
            aria-hidden={true}
          />

          <input
            id="pickupLocation"
            required
            minLength={3}
            maxLength={250}
            value={pickupLocation}
            onChange={(event) =>
              setPickupLocation(
                event.target.value,
              )
            }
            placeholder="For example: Mokpo city centre"
            disabled={isSubmitting}
            className={`${inputClassName} pl-12`}
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="availabilityDetails"
          className="mb-2 block text-sm font-extrabold text-[#24352E]"
        >
          Pickup availability
          <span className="ml-1 text-[#DC2626]">
            *
          </span>
        </label>

        <div className="relative">
          <CalendarDays
            className="pointer-events-none absolute left-4 top-4 size-5 text-[#849087]"
            aria-hidden={true}
          />

          <textarea
            id="availabilityDetails"
            required
            rows={4}
            minLength={3}
            maxLength={500}
            value={
              availabilityDetails
            }
            onChange={(event) =>
              setAvailabilityDetails(
                event.target.value,
              )
            }
            placeholder="For example: Available after 6 PM on weekdays"
            disabled={isSubmitting}
            className="w-full resize-none rounded-xl border border-[#D8E1D9] bg-white px-4 py-3 pl-12 text-sm font-semibold leading-6 text-[#10271F] outline-none transition placeholder:text-[#9AA69F] focus:border-[#0C8A63] focus:ring-4 focus:ring-[#0C8A63]/10"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="donationNotes"
          className="mb-2 block text-sm font-extrabold text-[#24352E]"
        >
          Additional notes
        </label>

        <div className="relative">
          <StickyNote
            className="pointer-events-none absolute left-4 top-4 size-5 text-[#849087]"
            aria-hidden={true}
          />

          <textarea
            id="donationNotes"
            rows={4}
            maxLength={1000}
            value={notes}
            onChange={(event) =>
              setNotes(
                event.target.value,
              )
            }
            placeholder="Add collection instructions or useful information..."
            disabled={isSubmitting}
            className="w-full resize-none rounded-xl border border-[#D8E1D9] bg-white px-4 py-3 pl-12 text-sm font-semibold leading-6 text-[#10271F] outline-none transition placeholder:text-[#9AA69F] focus:border-[#0C8A63] focus:ring-4 focus:ring-[#0C8A63]/10"
          />
        </div>
      </div>

      <div className="flex flex-col-reverse gap-3 border-t border-[#E2E8E2] pt-6 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={() =>
            router.push("/donations")
          }
          disabled={isSubmitting}
          className="inline-flex h-12 items-center justify-center rounded-xl border border-[#CFD9D1] px-5 text-sm font-extrabold text-[#46574F] transition hover:bg-[#F5F7F3] disabled:opacity-60"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#065F46] px-6 text-sm font-extrabold text-white shadow-lg shadow-[#065F46]/10 transition hover:bg-[#054C39] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? (
            <LoaderCircle
              className="size-5 animate-spin"
              aria-hidden={true}
            />
          ) : (
            <Check
              className="size-5"
              aria-hidden={true}
            />
          )}

          {isSubmitting
            ? "Publishing..."
            : "Publish donation"}
        </button>
      </div>
    </form>
  );
}