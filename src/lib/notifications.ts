import "server-only";
import { createServiceClient } from "@/lib/supabase/server";

type NotificationChannel = "EMAIL" | "WHATSAPP";
type NotificationStatus = "QUEUED" | "SENT" | "FAILED";

export async function logNotification(entry: {
  orderId: string;
  channel: NotificationChannel;
  templateKey: string;
  recipient: string;
  status: NotificationStatus;
  providerMessageId?: string | null;
  errorMessage?: string | null;
}) {
  const supabase = createServiceClient();
  const { error } = await supabase.from("notifications").insert({
    order_id: entry.orderId,
    channel: entry.channel,
    template_key: entry.templateKey,
    recipient: entry.recipient,
    status: entry.status,
    provider_message_id: entry.providerMessageId ?? null,
    error_message: entry.errorMessage ?? null,
    sent_at: entry.status === "SENT" ? new Date().toISOString() : null,
  });
  if (error) console.error("Failed to write notification log", error.message);
}
