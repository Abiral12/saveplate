export type NotificationItem = {
  id: string;
  type: "EXPIRY" | "DONATION" | "MEAL_REMINDER" | "ACCOUNT";
  title: string;
  message: string;
  href: string | null;
  readAt: string | null;
  createdAt: string;
};

export type NotificationData = {
  unreadCount: number;
  items: NotificationItem[];
};
