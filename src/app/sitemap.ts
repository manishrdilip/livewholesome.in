import type { MetadataRoute } from "next";

const STATIC_PAGES = [
  "",
  "terms",
  "privacy",
  "shipping-delivery",
  "cancellation-refund",
  "login",
  "signup",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return STATIC_PAGES.map((path) => ({
    url: `https://livewholesome.in/${path}`,
    lastModified: now,
    changeFrequency: path === "" ? "daily" : "monthly",
    priority: path === "" ? 1 : 0.5,
  }));
}
