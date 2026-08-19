import { z } from "zod";
import { NextResponse } from "next/server";
import { handleApiError } from "@/lib/api/api";
import { requireApiUser } from "@/lib/auth/require-api-user";
import { getNotificationsService, markNotificationReadService } from "@/modules/notifications/notification.service";

const markReadSchema = z.object({
  notificationId: z.string().uuid().optional(),
  all: z.boolean().optional().default(false),
}).refine((value) => value.all || Boolean(value.notificationId), { message: "notificationId is required unless all is true." });

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await requireApiUser();
    const data = await getNotificationsService(user.id);
    return NextResponse.json({ success: true, message: "Notifications retrieved successfully.", data }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await requireApiUser();
    const input = markReadSchema.parse(await request.json());
    await markNotificationReadService(user.id, input.notificationId, input.all);
    return NextResponse.json({ success: true, message: input.all ? "All notifications marked as read." : "Notification marked as read." });
  } catch (error) {
    return handleApiError(error);
  }
}
