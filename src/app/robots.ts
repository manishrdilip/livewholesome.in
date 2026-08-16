import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/api",
          "/account",
          "/checkout",
          "/order/confirmed",
          "/login",
          "/signup",
        ],
      },
    ],
    sitemap: "https://livewholesome.in/sitemap.xml",
  };
}
