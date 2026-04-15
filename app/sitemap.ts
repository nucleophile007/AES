import type { MetadataRoute } from "next";
import { buildAbsoluteUrl } from "@/lib/seo";

type StaticRoute = {
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
};

const staticRoutes: StaticRoute[] = [
  { path: "", changeFrequency: "daily", priority: 1.0 },
  { path: "/about", changeFrequency: "monthly", priority: 0.8 },
  { path: "/academictutoring", changeFrequency: "weekly", priority: 0.9 },
  { path: "/collegeprep", changeFrequency: "weekly", priority: 0.9 },
  { path: "/research", changeFrequency: "weekly", priority: 0.8 },
  { path: "/events", changeFrequency: "weekly", priority: 0.8 },
  { path: "/blog", changeFrequency: "weekly", priority: 0.8 },
  { path: "/blog/aes-blogs", changeFrequency: "weekly", priority: 0.75 },
  {
    path: "/blog/student-spotlights",
    changeFrequency: "weekly",
    priority: 0.75,
  },
  { path: "/aes-champions", changeFrequency: "monthly", priority: 0.75 },
  { path: "/aes-creatorverse", changeFrequency: "monthly", priority: 0.75 },
  { path: "/aes-explorers", changeFrequency: "monthly", priority: 0.75 },
  { path: "/testimonials", changeFrequency: "monthly", priority: 0.75 },
  { path: "/book-session", changeFrequency: "daily", priority: 0.95 },
  { path: "/contact", changeFrequency: "monthly", priority: 0.8 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return staticRoutes.map((route) => ({
    url: buildAbsoluteUrl(route.path),
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
