import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { CartProvider } from "@/components/CartProvider";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://livewholesome.in"),
  title: "Wholesome Purna — Sprouted Multigrain Health Mix | LiveWholesome.in",
  description:
    "A sprouted multigrain health mix crafted from 20 ancient ingredients. Soaked, germinated, sun-dried, roasted, and stone-ground.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    title: "Wholesome Purna — Sprouted Multigrain Health Mix",
    description:
      "A sprouted multigrain health mix crafted from 20 ancient ingredients. Soaked, germinated, sun-dried, roasted, and stone-ground.",
    url: "https://livewholesome.in",
    siteName: "LiveWholesome.in",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-cream text-ink">
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
