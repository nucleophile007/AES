type ServiceLink = {
  name: string;
  path: string;
};

export const siteName = "ACHARYA Educational Services";

export const defaultDescription =
  "ACHARYA Educational Services (AES) offers academic tutoring, SAT coaching, math competition training, research programs, and college prep support for students across the USA.";

export const defaultOgImage = "/hero.png";

export const coreServices: ServiceLink[] = [
  { name: "Academic Tutoring", path: "/academictutoring" },
  { name: "SAT Coaching", path: "/satcoaching" },
  { name: "Math Competition Training", path: "/mathcompetition" },
  { name: "Student Research Programs", path: "/researchprogram" },
  { name: "College Preparation", path: "/collegeprep" },
];

function normalizeUrl(value: string): string {
  const withProtocol = /^https?:\/\//i.test(value) ? value : `https://${value}`;
  const parsed = new URL(withProtocol);

  const isLocalHost =
    parsed.hostname === "localhost" ||
    parsed.hostname === "127.0.0.1" ||
    parsed.hostname === "::1";

  if (!isLocalHost) {
    parsed.protocol = "https:";
  }

  // Canonicalize apex to www for this production domain to avoid sitemap redirects.
  if (parsed.hostname === "acharyaes.com") {
    parsed.hostname = "www.acharyaes.com";
  }

  const normalized = parsed.toString();
  return normalized.replace(/\/$/, "");
}

export function getSiteUrl(): string {
  const configuredUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    process.env.VERCEL_URL;

  if (configuredUrl) {
    return normalizeUrl(configuredUrl);
  }

  throw new Error(
    "Missing site URL configuration. Set NEXT_PUBLIC_SITE_URL or NEXT_PUBLIC_BASE_URL."
  );
}

export function buildAbsoluteUrl(path = "/"): string {
  const base = getSiteUrl();
  return new URL(path, `${base}/`).toString();
}
