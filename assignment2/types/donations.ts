import type { Pagination } from "@/types/api";

export type DonationListingStatus =
  | "AVAILABLE"
  | "RESERVED"
  | "COMPLETED"
  | "CANCELLED"
  | "EXPIRED";

export type DonationRequestStatus =
  | "PENDING"
  | "ACCEPTED"
  | "REJECTED"
  | "CLAIMED"
  | "CANCELLED";

export type DonationFoodItem = {
  id: string;
  itemName: string;
  quantity: number;
  unit: string;
  category: string;
  expiryDate: string;
  storageLocation: string | null;
  status: string;
  notes: string | null;
  isExpired: boolean;
  isExpiringSoon: boolean;
  daysUntilExpiry: number;
};

export type IncomingDonationRequest = {
  id: string;
  message: string | null;
  status: DonationRequestStatus;
  respondedAt: string | null;
  claimedAt: string | null;
  cancelledAt: string | null;
  createdAt: string;
  updatedAt: string;

  requester: {
    id: string;
    fullName: string;
  };
};

export type OwnDonationListing = {
  id: string;
  pickupLocation: string;
  availabilityDetails: string;
  notes: string | null;
  status: DonationListingStatus;
  storedStatus: DonationListingStatus;
  cancelledAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  foodItem: DonationFoodItem;
  requests: IncomingDonationRequest[];
};

export type OwnDonationsData = {
  items: OwnDonationListing[];
  pagination: Pagination;
};

export type CurrentDonationRequest = {
  id: string;
  status: DonationRequestStatus;
  message: string | null;
  createdAt: string;
};

export type BrowseDonationListing = {
  id: string;
  pickupLocation: string;
  availabilityDetails: string;
  notes: string | null;
  status: DonationListingStatus;
  createdAt: string;
  updatedAt: string;

  donor: {
    id: string;
    fullName: string;
  };

  foodItem: DonationFoodItem;
  requestCount: number;
  currentRequest: CurrentDonationRequest | null;
};

export type BrowseDonationsData = {
  items: BrowseDonationListing[];
  pagination: Pagination;
};

export type MyDonationRequest = {
  id: string;
  message: string | null;
  status: DonationRequestStatus;
  respondedAt: string | null;
  claimedAt: string | null;
  cancelledAt: string | null;
  createdAt: string;
  updatedAt: string;

  listing: {
    id: string;
    status: DonationListingStatus;
    pickupLocation: string;
    availabilityDetails: string;
    notes: string | null;
    createdAt: string;

    donor: {
      id: string;
      fullName: string;
    };

    foodItem: DonationFoodItem;
  };
};

export type MyDonationRequestsData = {
  items: MyDonationRequest[];
  pagination: Pagination;
};