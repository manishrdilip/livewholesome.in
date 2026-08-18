import { NextResponse, type NextRequest } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

// Auth is enforced by proxy.ts (matcher includes /api/admin/:path*) — this
// route only runs for a verified admin session.
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const orderNumbers: string[] = Array.isArray(body?.orderNumbers) ? body.orderNumbers : [];
  if (!orderNumbers.length) {
    return NextResponse.json({ error: "No orders selected" }, { status: 400 });
  }

  const supabase = createServiceClient();

  const { data: orders } = await supabase
    .from("orders")
    .select("id")
    .in("order_number", orderNumbers);
  const orderIds = (orders ?? []).map((o) => o.id);
  if (!orderIds.length) {
    return NextResponse.json({ error: "No matching orders found" }, { status: 404 });
  }

  // order_items, order_events, invoices, notifications, and shipments all
  // reference orders with "on delete cascade" — deleting the order rows
  // cleans those up automatically. Invoice PDFs in storage don't cascade,
  // so remove those first.
  const { data: invoices } = await supabase
    .from("invoices")
    .select("storage_path")
    .in("order_id", orderIds)
    .not("storage_path", "is", null);
  const paths = (invoices ?? [])
    .map((i) => i.storage_path)
    .filter((p): p is string => !!p);
  if (paths.length) {
    await supabase.storage.from("invoices").remove(paths);
  }

  const { error } = await supabase.from("orders").delete().in("id", orderIds);
  if (error) {
    console.error("bulk-delete-orders failed", error.message);
    return NextResponse.json({ error: "Couldn't delete orders" }, { status: 500 });
  }

  return NextResponse.json({ success: true, deleted: orderIds.length });
}
