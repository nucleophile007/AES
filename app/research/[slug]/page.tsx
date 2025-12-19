import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer";
import Chatbot from "@/components/home/Chatbot";
import Link from "next/link";

export default async function ResearchPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const title = slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

  return (
    <main className="min-h-screen theme-bg-dark flex flex-col">
      <Header />

      <section className="theme-bg-medium py-10 sm:py-12 border-b border-yellow-400/10 pt-20 sm:pt-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav aria-label="Breadcrumb" className="mb-4">
            <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm theme-text-muted">
              <li>
                <Link href="/blog" className="hover:underline hover:text-yellow-400 transition-colors">
                  Acharya Blog
                </Link>
              </li>
              <li className="opacity-60">/</li>
              <li>
                <Link href="/research" className="hover:underline hover:text-yellow-400 transition-colors">
                  Research Showcase
                </Link>
              </li>
              <li className="opacity-60">/</li>
              <li className="text-yellow-400 font-semibold">
                {title}
              </li>
            </ol>
          </nav>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-yellow-400 tracking-tight drop-shadow-sm">
            {title}
          </h1>
          <p className="mt-4 theme-text-muted max-w-3xl">
            This detail page is a placeholder for now. When you add real research posts, this route can render the full article content.
          </p>
        </div>
      </section>

      <section className="theme-bg-dark py-10 sm:py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border-2 border-slate-700/50 bg-gradient-to-br from-slate-800 via-slate-800/95 to-slate-900 p-6 sm:p-8 shadow-2xl">
            <div className="theme-text-light font-semibold mb-2">Coming soon</div>
            <div className="theme-text-muted">
              Want me to wire this to real content (DB / CMS / markdown files)?
            </div>
            <div className="mt-6">
              <Link href="/research" className="text-yellow-400 font-semibold hover:underline">
                ← Back to category
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <Chatbot />
    </main>
  );
}
