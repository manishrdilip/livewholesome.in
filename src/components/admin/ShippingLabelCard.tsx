export type ShippingLabelData = {
  orderNumber: string;
  businessName: string;
  shipFromAddress: string | null;
  customerName: string;
  customerPhone: string;
  addressLine: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  qrDataUrl: string;
};

export function ShippingLabelCard({ data }: { data: ShippingLabelData }) {
  return (
    <div className="rounded-2xl border-2 border-ink p-6 print:border-black">
      <div className="text-xs font-semibold uppercase tracking-widest text-ink/50">From</div>
      <div className="mt-1 text-sm">
        <div className="font-medium">{data.businessName}</div>
        <div className="whitespace-pre-line text-ink/70">
          {data.shipFromAddress || "Set a ship-from address in Admin → Settings"}
        </div>
      </div>

      <div className="my-5 border-t-2 border-dashed border-ink/20" />

      <div className="text-xs font-semibold uppercase tracking-widest text-ink/50">To</div>
      <div className="mt-1 text-lg font-bold">{data.customerName}</div>
      <div className="text-base text-ink/80">
        {data.addressLine}
        <br />
        {data.city}, {data.state} — {data.pincode}
        <br />
        {data.country}
      </div>
      <div className="mt-1 text-sm text-ink/60">{data.customerPhone}</div>

      <div className="mt-5 flex items-center justify-between border-t border-ink/10 pt-4">
        <div className="text-sm">
          <div className="text-ink/50">Order</div>
          <div className="font-semibold">{data.orderNumber}</div>
        </div>
        <div className="text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={data.qrDataUrl} alt="Scan for exact delivery location" width={100} height={100} />
          <div className="mt-1 text-[10px] text-ink/50">Scan for exact location</div>
        </div>
      </div>
    </div>
  );
}
