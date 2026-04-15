import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/seo";

const siteUrl = getSiteUrl();

const blockedPaths = [
  "/admin",
  "/teacher-dashboard",
  "/student-dashboard",
  "/parent-dashboard",
  "/debug",
  "/auth/",
  "/reset-password",
  "/api/",
];

const allowedApiPaths = [
  "/api/testimonials/before-after",
  "/api/testimonials/parent-testimonials",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", ...allowedApiPaths],
        disallow: blockedPaths,
      },
      {
        userAgent: ["GPTBot", "Google-Extended", "CCBot"],
        allow: ["/", ...allowedApiPaths],
        disallow: blockedPaths,
      },
    ],
    host: siteUrl,
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}

