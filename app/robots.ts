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

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/"],
        disallow: blockedPaths,
      },
      {
        userAgent: ["GPTBot", "Google-Extended", "CCBot"],
        allow: ["/"],
        disallow: blockedPaths,
      },
    ],
    host: siteUrl,
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}

