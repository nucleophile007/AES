import type { MetadataRoute } from "next";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.example.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    "",
    "/about",
    "/satcoaching",
    "/academictutoring",
    "/collegeprep",
    "/mathcompetition",
    "/researchprogram",
    "/events",
    "/blog",
    "/aes-champions",
    "/aes-creatorverse",
    "/locations",
    "/book-session",
    "/contact",
  ];

  const now = new Date();

  return routes.map((route) => ({
    url: new URL(route, siteUrl).toString(),
    lastModified: now,
    changeFrequency: "weekly",
    priority: route === "" ? 1.0 : 0.7,
  }));
}
