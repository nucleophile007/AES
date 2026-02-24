import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer";
import Chatbot from "@/components/home/Chatbot";
import { Calendar } from "lucide-react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

const PAGE_SIZE = 8;

function formatDate(isoDate: Date) {
  return new Date(isoDate).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default async function ResearchShowcasePage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const rawPage = Number(params?.page ?? "1");
  const requestedPage = Number.isFinite(rawPage) ? Math.trunc(rawPage) : 1;

  const allResearch = await prisma.research.findMany({
    orderBy: { createdAt: "desc" },
  });

  const totalPages = Math.max(1, Math.ceil(allResearch.length / PAGE_SIZE));
  const page = Math.min(Math.max(1, requestedPage), totalPages);
  const startIndex = (page - 1) * PAGE_SIZE;
  const visibleResearch = allResearch.slice(
    startIndex,
    startIndex + PAGE_SIZE
  );

  return (
    <main className="min-h-screen theme-bg-dark flex flex-col">
      <Header />

      {/* Hero */}
      {/* <section className="pt-24 pb-14 border-b border-yellow-400/10 theme-bg-medium">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-yellow-400">
            Research Showcase
          </h1>
          <p className="mt-4 text-lg theme-text-muted max-w-2xl">
            Explore student-led research projects across medicine,
            engineering, machine learning, and emerging technologies.
          </p>
        </div>
      </section> */}
      {/* Hero (Polygence-style, no search) */}
<section className="relative overflow-hidden theme-bg-medium border-b border-yellow-400/10 pt-20 sm:pt-24">
  <div className="absolute inset-0 pointer-events-none">
    <svg
      className="absolute inset-0 h-full w-full text-yellow-400/15"
      viewBox="0 0 1200 420"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <pattern
          id="contour"
          width="180"
          height="180"
          patternUnits="userSpaceOnUse"
        >
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
    <div className="flex items-center justify-between gap-10">
      <div className="max-w-3xl">
        <nav aria-label="Breadcrumb" className="mb-4">
          <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm theme-text-muted">
            <li>
              <Link
                href="/blog"
                className="hover:underline hover:text-yellow-400 transition-colors"
              >
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
          Acharya Research Showcase
        </h1>

        <p className="mt-4 text-lg sm:text-xl theme-text-muted max-w-2xl">
          Learn from our staff and mentors about some of the best
          practices to conduct and showcase research for high school
          students!
        </p>
      </div>
    </div>
  </div>
</section>


      {/* Bullet List */}
      <section className="py-12 flex-1">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

          {visibleResearch.length === 0 ? (
            <p className="text-center theme-text-muted">
              No research projects found.
            </p>
          ) : (
            <ul className="space-y-8">
              {visibleResearch.map((research, index) => (
                <li key={research.id} className="group relative pl-8">

                  {/* Bullet Circle */}
                  <span className="absolute left-0 top-2 h-3 w-3 rounded-full bg-yellow-400 group-hover:scale-110 transition-transform" />

                  <Link
                    href={`/research/${research.slug}`}
                    className="block"
                  >
                    <h2 className="text-xl sm:text-2xl font-semibold theme-text-light group-hover:text-yellow-400 transition-colors">
                      {research.title}
                    </h2>

                    {research.description && (
                      <p className="mt-2 theme-text-muted max-w-3xl">
                        {research.description}
                      </p>
                    )}

                    {/* <div className="mt-3 flex items-center gap-2 text-sm theme-text-muted">
                      <Calendar className="h-4 w-4 text-yellow-400/80" />
                      {formatDate(research.createdAt)}
                    </div> */}
                    {research.author && (
                      <p className="mt-3 text-sm theme-text-muted">
                        By{" "}
                        <span className="text-yellow-400 font-medium">
                          {research.author}
                        </span>
                      </p>
                    )}
                  </Link>

                  {/* Divider Line */}
                  {index !== visibleResearch.length - 1 && (
                    <div className="mt-8 border-t border-slate-700/50" />
                  )}
                </li>
              ))}
            </ul>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-16 flex items-center justify-center gap-6">
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
                Page{" "}
                <span className="text-yellow-400 font-semibold">
                  {page}
                </span>{" "}
                of{" "}
                <span className="text-yellow-400 font-semibold">
                  {totalPages}
                </span>
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
            </div>
          )}
        </div>
      </section>

      <Footer />
      <Chatbot />
    </main>
  );
}