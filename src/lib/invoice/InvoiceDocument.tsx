import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import { LogoMark } from "./LogoMark";
import { amountInWords } from "./numberToWords";
import { gstStateCode } from "./gstStateCodes";

const COLORS = {
  emerald: "#0C4A34",
  emeraldDeep: "#072A1E",
  gold: "#C9A227",
  cream: "#F7F3E8",
  creamZebra: "#FBF8F0",
  ink: "#16211C",
  inkMuted: "#5B6B62",
  border: "#E4DDC9",
  unpaidRed: "#9A3B2E",
};

const MM = 2.834645669;

export type InvoiceLineItem = {
  productName: string;
  hsnCode: string | null;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  taxableValue: number;
  gstRate: number;
  taxAmount: number;
};

export type InvoiceData = {
  invoiceNumber: string;
  invoiceType: "PROFORMA" | "TAX_INVOICE" | "BILL_OF_SUPPLY";
  invoiceDate: string;
  orderNumber: string;
  orderDate: string;
  paymentStatus: "UNPAID" | "PAID" | "REFUNDED";
  customer: { name: string; email: string; phone: string };
  address: {
    line1: string;
    line2?: string | null;
    landmark?: string | null;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  items: InvoiceLineItem[];
  discount: number;
  shippingFee: number;
  taxableTotal: number;
  cgst: number;
  sgst: number;
  igst: number;
  grandTotal: number;
  taxSplit: "CGST_SGST" | "IGST" | "NONE";
  settings: {
    businessName: string;
    registeredAddress: string | null;
    gstin: string | null;
    fssaiLicense: string | null;
    supportPhone: string | null;
    supportEmail: string | null;
    gstRegistered: boolean;
  };
};

const TITLES: Record<InvoiceData["invoiceType"], string> = {
  PROFORMA: "PROFORMA INVOICE",
  TAX_INVOICE: "TAX INVOICE",
  BILL_OF_SUPPLY: "BILL OF SUPPLY",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function money(n: number): string {
  return `Rs. ${n.toFixed(2)}`;
}

const styles = StyleSheet.create({
  page: {
    fontFamily: "Inter",
    fontSize: 9,
    color: COLORS.ink,
  },
  header: {
    backgroundColor: COLORS.emerald,
    minHeight: 35 * MM,
    paddingHorizontal: 20 * MM,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  headerBrand: {
    fontFamily: "Playfair Display",
    fontWeight: 900,
    fontSize: 20,
    color: COLORS.cream,
  },
  headerTagline: {
    fontSize: 7,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    color: COLORS.gold,
    marginTop: 2,
  },
  headerRight: {
    alignItems: "flex-end",
    maxWidth: 220,
  },
  headerRightLine: {
    fontSize: 7.5,
    color: COLORS.cream,
    textAlign: "right",
    marginTop: 1.5,
    opacity: 0.9,
  },
  body: {
    paddingHorizontal: 20 * MM,
    paddingTop: 18,
    paddingBottom: 20 * MM,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: 10,
    marginBottom: 14,
  },
  docTitle: {
    fontFamily: "Playfair Display",
    fontWeight: 700,
    fontSize: 14,
    letterSpacing: 2,
    color: COLORS.emerald,
  },
  metaRight: {
    alignItems: "flex-end",
  },
  metaLine: {
    fontSize: 8,
    marginTop: 2,
    color: COLORS.inkMuted,
  },
  metaLineStrong: {
    fontSize: 8.5,
    marginTop: 2,
    fontWeight: 700,
    color: COLORS.ink,
  },
  panelsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  panel: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 3,
    padding: 10,
  },
  panelLabel: {
    fontSize: 7.5,
    letterSpacing: 1,
    textTransform: "uppercase",
    color: COLORS.gold,
    fontWeight: 700,
    marginBottom: 5,
  },
  panelText: {
    fontSize: 9,
    lineHeight: 1.5,
    color: COLORS.ink,
  },
  table: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 3,
    overflow: "hidden",
  },
  tableHeaderRow: {
    flexDirection: "row",
    backgroundColor: COLORS.emerald,
  },
  tableRow: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  tableRowZebra: {
    backgroundColor: COLORS.creamZebra,
  },
  th: {
    fontSize: 7.5,
    fontWeight: 700,
    color: COLORS.cream,
    paddingVertical: 6,
    paddingHorizontal: 6,
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  td: {
    fontSize: 8.5,
    paddingVertical: 6,
    paddingHorizontal: 6,
    color: COLORS.ink,
  },
  colIdx: { width: "5%" },
  colDesc: { width: "27%" },
  colHsn: { width: "10%" },
  colQty: { width: "8%", textAlign: "right" },
  colRate: { width: "12%", textAlign: "right" },
  colTaxable: { width: "13%", textAlign: "right" },
  colGstPct: { width: "8%", textAlign: "right" },
  colTaxAmt: { width: "12%", textAlign: "right" },
  colTotal: { width: "13%", textAlign: "right" },
  totalsBlock: {
    marginTop: 16,
    alignSelf: "flex-end",
    width: 240,
  },
  totalsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  totalsLabel: {
    fontSize: 9,
    color: COLORS.inkMuted,
  },
  totalsValue: {
    fontSize: 9,
    color: COLORS.ink,
  },
  grandRule: {
    borderTopWidth: 1.5,
    borderTopColor: COLORS.gold,
    marginTop: 8,
    paddingTop: 6,
  },
  grandLabel: {
    fontFamily: "Playfair Display",
    fontWeight: 700,
    fontSize: 12,
    color: COLORS.emerald,
  },
  grandValue: {
    fontFamily: "Playfair Display",
    fontWeight: 700,
    fontSize: 12,
    color: COLORS.emerald,
  },
  wordsBlock: {
    marginTop: 18,
  },
  wordsLabel: {
    fontSize: 7.5,
    letterSpacing: 1,
    textTransform: "uppercase",
    color: COLORS.gold,
    fontWeight: 700,
    marginBottom: 3,
  },
  wordsText: {
    fontSize: 9,
    fontFamily: "Playfair Display",
    color: COLORS.ink,
  },
  footer: {
    marginTop: 28,
    borderTopWidth: 0.75,
    borderTopColor: COLORS.gold,
    paddingTop: 10,
    alignItems: "center",
  },
  stamp: {
    borderWidth: 1.5,
    borderRadius: 3,
    paddingVertical: 3,
    paddingHorizontal: 14,
    marginBottom: 10,
  },
  stampText: {
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: 2,
  },
  footerNote: {
    fontSize: 7.5,
    color: COLORS.inkMuted,
    textAlign: "center",
    marginTop: 2,
  },
  footerSite: {
    fontSize: 8,
    color: COLORS.gold,
    marginTop: 8,
    fontWeight: 700,
    letterSpacing: 1,
  },
  gstNotice: {
    fontSize: 7.5,
    color: COLORS.inkMuted,
    fontFamily: "Playfair Display",
    marginTop: 6,
  },
});

export function InvoiceDocument({ data }: { data: InvoiceData }) {
  const { settings } = data;
  const placeOfSupplyCode = gstStateCode(data.address.state);

  return (
    <Document title={`${data.invoiceNumber} — ${data.orderNumber}`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <LogoMark size={44} />
            <View>
              <Text style={styles.headerBrand}>WHOLESOME</Text>
              <Text style={styles.headerTagline}>Complete. Whole. Full.</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <Text style={[styles.headerRightLine, { fontWeight: 700 }]}>
              {settings.businessName}
            </Text>
            {settings.registeredAddress && (
              <Text style={styles.headerRightLine}>{settings.registeredAddress}</Text>
            )}
            {settings.gstRegistered && settings.gstin && (
              <Text style={styles.headerRightLine}>GSTIN: {settings.gstin}</Text>
            )}
            {settings.fssaiLicense && (
              <Text style={styles.headerRightLine}>FSSAI: {settings.fssaiLicense}</Text>
            )}
            {settings.supportPhone && (
              <Text style={styles.headerRightLine}>{settings.supportPhone}</Text>
            )}
            {settings.supportEmail && (
              <Text style={styles.headerRightLine}>{settings.supportEmail}</Text>
            )}
            <Text style={styles.headerRightLine}>livewholesome.in</Text>
          </View>
        </View>

        <View style={styles.body}>
          <View style={styles.titleRow}>
            <Text style={styles.docTitle}>{TITLES[data.invoiceType]}</Text>
            <View style={styles.metaRight}>
              <Text style={styles.metaLineStrong}>Invoice No: {data.invoiceNumber}</Text>
              <Text style={styles.metaLine}>Invoice Date: {formatDate(data.invoiceDate)}</Text>
              <Text style={styles.metaLine}>Order No: {data.orderNumber}</Text>
              <Text style={styles.metaLine}>Order Date: {formatDate(data.orderDate)}</Text>
            </View>
          </View>

          {data.invoiceType === "PROFORMA" && (
            <Text style={[styles.gstNotice, { marginBottom: 10, marginTop: -8 }]}>
              This is not a tax invoice.
            </Text>
          )}

          <View style={styles.panelsRow}>
            <View style={styles.panel}>
              <Text style={styles.panelLabel}>Billed &amp; Shipped To</Text>
              <Text style={styles.panelText}>{data.customer.name}</Text>
              <Text style={styles.panelText}>
                {data.address.line1}
                {data.address.line2 ? `, ${data.address.line2}` : ""}
                {data.address.landmark ? `, ${data.address.landmark}` : ""}
              </Text>
              <Text style={styles.panelText}>
                {data.address.city}, {data.address.state} — {data.address.pincode}
              </Text>
              <Text style={styles.panelText}>{data.address.country}</Text>
              <Text style={styles.panelText}>{data.customer.phone}</Text>
              <Text style={styles.panelText}>{data.customer.email}</Text>
            </View>
            <View style={styles.panel}>
              <Text style={styles.panelLabel}>Place of Supply</Text>
              <Text style={styles.panelText}>{data.address.state}</Text>
              <Text style={styles.panelText}>GST State Code: {placeOfSupplyCode}</Text>
              {!settings.gstRegistered && (
                <Text
                  style={[
                    styles.panelText,
                    { marginTop: 8, fontFamily: "Playfair Display" },
                  ]}
                >
                  Not registered under GST.
                </Text>
              )}
            </View>
          </View>

          <View style={styles.table}>
            <View style={styles.tableHeaderRow}>
              <Text style={[styles.th, styles.colIdx]}>#</Text>
              <Text style={[styles.th, styles.colDesc]}>Description</Text>
              <Text style={[styles.th, styles.colHsn]}>HSN</Text>
              <Text style={[styles.th, styles.colQty]}>Qty</Text>
              <Text style={[styles.th, styles.colRate]}>Rate</Text>
              <Text style={[styles.th, styles.colTaxable]}>Taxable Value</Text>
              <Text style={[styles.th, styles.colGstPct]}>GST%</Text>
              <Text style={[styles.th, styles.colTaxAmt]}>Tax Amt</Text>
              <Text style={[styles.th, styles.colTotal]}>Total</Text>
            </View>
            {data.items.map((item, i) => (
              <View
                key={i}
                style={[styles.tableRow, ...(i % 2 === 1 ? [styles.tableRowZebra] : [])]}
              >
                <Text style={[styles.td, styles.colIdx]}>{i + 1}</Text>
                <Text style={[styles.td, styles.colDesc]}>{item.productName}</Text>
                <Text style={[styles.td, styles.colHsn]}>{item.hsnCode ?? "—"}</Text>
                <Text style={[styles.td, styles.colQty]}>{item.quantity}</Text>
                <Text style={[styles.td, styles.colRate]}>{money(item.unitPrice)}</Text>
                <Text style={[styles.td, styles.colTaxable]}>{money(item.taxableValue)}</Text>
                <Text style={[styles.td, styles.colGstPct]}>
                  {item.gstRate > 0 ? `${item.gstRate}%` : "—"}
                </Text>
                <Text style={[styles.td, styles.colTaxAmt]}>{money(item.taxAmount)}</Text>
                <Text style={[styles.td, styles.colTotal]}>{money(item.lineTotal)}</Text>
              </View>
            ))}
          </View>

          <View style={styles.totalsBlock}>
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Subtotal</Text>
              <Text style={styles.totalsValue}>{money(data.taxableTotal)}</Text>
            </View>
            {data.discount > 0 && (
              <View style={styles.totalsRow}>
                <Text style={styles.totalsLabel}>Discount</Text>
                <Text style={styles.totalsValue}>-{money(data.discount)}</Text>
              </View>
            )}
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Shipping</Text>
              <Text style={styles.totalsValue}>
                {data.shippingFee > 0 ? money(data.shippingFee) : "FREE"}
              </Text>
            </View>
            {data.taxSplit === "CGST_SGST" && (
              <>
                <View style={styles.totalsRow}>
                  <Text style={styles.totalsLabel}>CGST</Text>
                  <Text style={styles.totalsValue}>{money(data.cgst)}</Text>
                </View>
                <View style={styles.totalsRow}>
                  <Text style={styles.totalsLabel}>SGST</Text>
                  <Text style={styles.totalsValue}>{money(data.sgst)}</Text>
                </View>
              </>
            )}
            {data.taxSplit === "IGST" && (
              <View style={styles.totalsRow}>
                <Text style={styles.totalsLabel}>IGST</Text>
                <Text style={styles.totalsValue}>{money(data.igst)}</Text>
              </View>
            )}
            <View style={[styles.totalsRow, styles.grandRule]}>
              <Text style={styles.grandLabel}>Grand Total</Text>
              <Text style={styles.grandValue}>{money(data.grandTotal)}</Text>
            </View>
          </View>

          <View style={styles.wordsBlock}>
            <Text style={styles.wordsLabel}>Amount in Words</Text>
            <Text style={styles.wordsText}>{amountInWords(data.grandTotal)}</Text>
          </View>

          <View style={styles.footer}>
            <View
              style={[
                styles.stamp,
                {
                  borderColor: data.paymentStatus === "PAID" ? COLORS.emerald : COLORS.unpaidRed,
                },
              ]}
            >
              <Text
                style={[
                  styles.stampText,
                  { color: data.paymentStatus === "PAID" ? COLORS.emerald : COLORS.unpaidRed },
                ]}
              >
                {data.paymentStatus}
              </Text>
            </View>
            <Text style={styles.footerNote}>
              This is a computer-generated invoice and does not require a signature.
            </Text>
            <Text style={styles.footerNote}>
              Digital invoice — no paper copy is enclosed with your parcel.
            </Text>
            <Text style={styles.footerSite}>livewholesome.in</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
