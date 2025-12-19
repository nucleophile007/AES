import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer";
import Chatbot from "@/components/home/Chatbot";
import { Calendar, Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const PAGE_SIZE = 6;

const researchPosts = [
  {
    title: "Cancer Detection & Targeted Therapy",
    slug: "cancer-detection-targeted-therapy",
    excerpt:
      "A student-led deep dive into convolutional neural networks for early detection of diseases from medical imaging datasets.",
    category: "HOW TO",
    date: "2025-02-10",
    readTime: "6 minute read",
    image: "/hwa1.png",
    status: "Featured",
  },
  {
    title: "Detecting Anomalies in Smart Device Behavior Using ML",
    slug: "detecting-anomalies-in-smart-device-behavior-using-ml",
    excerpt:
      "Modeling strategic behavior with classic game theory frameworks and simulations to understand real-world competitive environments.",
    category: "HOW TO",
    date: "2025-02-10",
    readTime: "8 minute read",
    image: "/hwa2.png",
    status: "New",
  },
  {
    title: "Photodynamic(PDT) & Photothermal(PTT) Therapies with Nanoparticles",
    slug: "photodynamic-pdt-photothermal-ptt-therapies-with-nanoparticles",
    excerpt:
      "Comparing classical statistical forecasting with modern ML approaches for climate-related time series prediction.",
    category: "HOW TO",
    date: "2024-08-23",
    readTime: "3 minute read",
    image: "/hwa3.png",
    status: "",
  },
  {
    title: "A Parametric Study of Human Balance with Delays using Delay Differential Equations",
    slug: "a-parametric-study-of-human-balance-with-delays-using-delay-differential-equations",
    excerpt:
      "A practical framework to find a compelling topic, narrow your question, and design a project you can actually finish.",
    category: "HOW TO",
    date: "2024-07-18",
    readTime: "7 minute read",
    image: "/hero.png",
    status: "",
  },
  {
    title: "Nanotechnology and Smart Drug Delivery From prevention to treatment to regeneration",
    slug: "nanotechnology-and-smart-drug-delivery-from-prevention-to-treatment-to-regeneration",
    excerpt:
      "From choosing a venue to formatting, revisions, and submissions—what the publication process looks like in practice.",
    category: "HOW TO",
    date: "2024-05-02",
    readTime: "5 minute read",
    image: "/image.png",
    status: "",
  },
  {
    title: "Evaluating Predictive Models for Heart Disease: A Comparative Study of Feature Selection and Neural Architectures",
    slug: "evaluating-predictive-models-for-heart-disease-a-comparative-study-of-feature-selection-and-neural-architectures",
    excerpt:
      "A curated set of journals and publishing options with tips to pick the right fit based on your project type.",
    category: "HOW TO",
    date: "2024-04-10",
    readTime: "4 minute read",
    image: "/learning-journey-cartoon.png",
    status: "",
  },
  {
    title: "Development of antibiotics: Fight Against Bacterial Resistance",
    slug: "development-of-antibiotics-fight-against-bacterial-resistance",
    excerpt: "",
    category: "HOW TO",
    date: "2024-03-22",
    readTime: "6 minute read",
    image: "/program-image/acharyaes-research-hero.jpg",
    status: "",
  },
  {
    title: "Early detection of Diabetes Using Logistic Regression: An Analytical Approach",
    slug: "early-detection-of-diabetes-using-logistic-regression-an-analytical-approach",
    excerpt: "",
    category: "HOW TO",
    date: "2024-02-08",
    readTime: "5 minute read",
    image: "/program-image/acharyaes-academic-hero.jpg",
    status: "",
  },
];

function formatDate(isoDate: string) {
  try {
    return new Date(isoDate).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return isoDate;
  }
}

export default async function ResearchShowcasePage({
  searchParams,
}: {
  searchParams?: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const rawPage = Number(params?.page ?? "1");
  const requestedPage = Number.isFinite(rawPage) ? Math.trunc(rawPage) : 1;
  const totalPages = Math.max(1, Math.ceil(researchPosts.length / PAGE_SIZE));
  const page = Math.min(Math.max(1, requestedPage), totalPages);
  const startIndex = (page - 1) * PAGE_SIZE;
  const visiblePosts = researchPosts.slice(startIndex, startIndex + PAGE_SIZE);

  return (
    <main className="min-h-screen theme-bg-dark flex flex-col">
      <Header />

      {/* Hero (Polygence-style) */}
      <section className="relative overflow-hidden theme-bg-medium border-b border-yellow-400/10 pt-20 sm:pt-24">
        <div className="absolute inset-0 pointer-events-none">
          <svg
            className="absolute inset-0 h-full w-full text-yellow-400/15"
            viewBox="0 0 1200 420"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <defs>
              <pattern id="contour" width="180" height="180" patternUnits="userSpaceOnUse">
                <path
                  d="M0 90 C 45 60, 90 60, 180 90"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path
                  d="M0 120 C 45 90, 90 90, 180 120"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  opacity="0.7"
                />
                <path
                  d="M0 60 C 45 30, 90 30, 180 60"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  opacity="0.5"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#contour)" />
          </svg>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-14 lg:py-16 relative">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-10">
            <div className="max-w-3xl">
              <nav aria-label="Breadcrumb" className="mb-4">
                <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm theme-text-muted">
                  <li>
                    <Link href="/blog" className="hover:underline hover:text-yellow-400 transition-colors">
                      Acharya Blog
                    </Link>
                  </li>
                  <li className="opacity-60">/</li>
                  <li className="text-yellow-400 font-semibold">
                    Research Showcase
                  </li>
                </ol>
              </nav>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-yellow-400 tracking-tight leading-tight drop-shadow-sm">
                How to Conduct and
                <br className="hidden sm:block" />
                Showcase Research
              </h1>

              <p className="mt-4 text-lg sm:text-xl theme-text-muted max-w-2xl">
                Learn from our staff and mentors about some of the best practices to conduct and showcase research for high school students!
              </p>
            </div>

            {/* Right-side illustration */}
            <div className="relative w-full lg:w-[360px] flex justify-center lg:justify-end">
              <div className="relative">
                <div className="absolute -inset-6 rounded-full bg-yellow-400/5 blur-2xl" />
                <div className="relative">
                  <Search className="h-48 w-48 sm:h-56 sm:w-56 text-yellow-400" strokeWidth={2.75} />
                  <div className="absolute top-[46px] left-[70px] sm:top-[54px] sm:left-[86px] h-20 w-20 rounded-full bg-slate-900/70 border-4 border-yellow-400 flex items-center justify-center shadow-2xl">
                    <div className="h-10 w-10 rounded-full bg-slate-200/80" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Card grid (Polygence-style) */}
      <section className="theme-bg-dark py-10 sm:py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {visiblePosts.map((post) => (
              <Link
                key={post.slug}
                href={`/research/${post.slug}`}
                className="group rounded-3xl bg-gradient-to-br from-slate-800 via-slate-800/95 to-slate-900 border-2 border-slate-700/50 shadow-2xl hover:border-yellow-400/30 transition-colors overflow-hidden"
              >
                <div className="p-5">
                  <div className="rounded-2xl overflow-hidden bg-slate-900/40">
                    <Image
                      src={post.image || "/placeholder.svg"}
                      alt={post.title}
                      width={1200}
                      height={800}
                      className="w-full h-56 object-cover"
                      priority={false}
                    />
                  </div>

                  <div className="mt-5 flex items-center justify-between">
                    <div className="text-[11px] font-semibold tracking-widest text-yellow-400">
                      {post.category}
                    </div>
                    <div className="text-xs theme-text-muted">{post.readTime}</div>
                  </div>

                  <h2 className="mt-3 text-lg font-semibold theme-text-light leading-snug group-hover:underline underline-offset-4">
                    {post.title}
                  </h2>

                  <div className="mt-6 flex items-center gap-2 text-xs theme-text-muted">
                    <Calendar className="h-4 w-4 text-yellow-400/80" />
                    {formatDate(post.date)}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination (for future growth) */}
          {totalPages > 1 ? (
            <nav aria-label="Pagination" className="mt-12 flex items-center justify-center gap-6">
              {page > 1 ? (
                <Link
                  href={`/research?page=${page - 1}`}
                  className="px-4 py-2 rounded-xl border border-yellow-400/20 bg-slate-900/40 theme-text-light hover:border-yellow-400/40 transition-colors"
                >
                  Previous
                </Link>
              ) : (
                <span className="px-4 py-2 rounded-xl border border-slate-700/50 bg-slate-900/20 theme-text-muted cursor-not-allowed">
                  Previous
                </span>
              )}

              <div className="text-sm theme-text-muted">
                Page <span className="text-yellow-400 font-semibold">{page}</span> of{" "}
                <span className="text-yellow-400 font-semibold">{totalPages}</span>
              </div>

              {page < totalPages ? (
                <Link
                  href={`/research?page=${page + 1}`}
                  className="px-4 py-2 rounded-xl border border-yellow-400/20 bg-slate-900/40 theme-text-light hover:border-yellow-400/40 transition-colors"
                >
                  Next
                </Link>
              ) : (
                <span className="px-4 py-2 rounded-xl border border-slate-700/50 bg-slate-900/20 theme-text-muted cursor-not-allowed">
                  Next
                </span>
              )}
            </nav>
          ) : null}
        </div>
      </section>

      <Footer />
      <Chatbot />
    </main>
  );
}
