export type FoodItemStatus =
  | "AVAILABLE"
  | "USED"
  | "DISCARDED"
  | "RESERVED"
  | "DONATED";

export type InventoryItem = {
  id: string;
  itemName: string;
  quantity: number;
  unit: string;
  expiryDate: string;
  category: string;
  storageLocation: string | null;
  status: FoodItemStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  isExpired: boolean;
  isExpiringSoon: boolean;
  daysUntilExpiry: number;
};

export type InventoryPagination = {
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
};

export type InventoryListData = {
  items: InventoryItem[];
  pagination: InventoryPagination;
};

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data?: T;
  errors?: unknown;
};