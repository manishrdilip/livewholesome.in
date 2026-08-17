import type { MetadataRoute } from "next";

const STATIC_PAGES = ["", "about", "ingredients", "faq", "terms", "privacy", "shipping-delivery", "cancellation-refund"];
const CONTENT_PAGES = new Set(["about", "ingredients", "faq"]);

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return STATIC_PAGES.map((path) => ({
    url: `https://livewholesome.in/${path}`,
    lastModified: now,
    changeFrequency: path === "" ? "daily" : "monthly",
    priority: path === "" ? 1 : CONTENT_PAGES.has(path) ? 0.7 : 0.5,
  }));
}
