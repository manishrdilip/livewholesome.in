import { NextResponse, type NextRequest } from "next/server";
import JSZip from "jszip";
import { createServiceClient } from "@/lib/supabase/server";
import { generateInvoice } from "@/lib/invoice/generate";

// Auth is enforced by proxy.ts (matcher includes /api/admin/:path*) — this
// route only runs for a verified admin session.
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const orderNumbers: string[] = Array.isArray(body?.orderNumbers) ? body.orderNumbers : [];
  if (!orderNumbers.length) {
    return NextResponse.json({ error: "No orders selected" }, { status: 400 });
  }

  const supabase = createServiceClient();
  const zip = new JSZip();

  for (const orderNumber of orderNumbers) {
    const { data: order } = await supabase
      .from("orders")
      .select("id")
      .eq("order_number", orderNumber)
      .single();
    if (!order) continue;

    const { data: existing } = await supabase
      .from("invoices")
      .select("storage_path, invoice_type")
      .eq("order_id", order.id)
      .order("issued_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    let storagePath = existing?.storage_path;
    if (!storagePath) {
      const generated = await generateInvoice(orderNumber, "PROFORMA").catch((err) => {
        console.error(`Bulk invoice generation failed for ${orderNumber}`, err);
        return null;
      });
      storagePath = generated?.storagePath;
    }
    if (!storagePath) continue;

    const { data: pdfBlob } = await supabase.storage.from("invoices").download(storagePath);
    if (!pdfBlob) continue;

    zip.file(`${orderNumber}.pdf`, await pdfBlob.arrayBuffer());
  }

  const zipBuffer = await zip.generateAsync({ type: "blob" });
  return new NextResponse(zipBuffer, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="invoices-${Date.now()}.zip"`,
    },
  });
}
