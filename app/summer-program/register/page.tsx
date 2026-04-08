import Header from "@/components/home/Header";
import Link from "next/link";

const GOOGLE_FORM_VIEW_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSfnTmN-Y088mfyx9L7WSGBX-S-i9TxPsYXFNHhkc4634HvaYg/viewform";
const GOOGLE_FORM_EMBED_URL = `${GOOGLE_FORM_VIEW_URL}?embedded=true`;

export default function SummerProgramRegisterPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <Header />

      <section className="mx-auto max-w-7xl px-4 pb-10 pt-24 md:px-8">
        <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <h1 className="text-2xl font-semibold text-white md:text-3xl">Summer Program Registration</h1>
          <Link
            href={GOOGLE_FORM_VIEW_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-lg border border-slate-400/40 bg-slate-800/60 px-4 py-2 text-sm font-medium text-slate-100 transition hover:bg-slate-700/70"
          >
            Open Form In New Tab
          </Link>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-700/70 bg-slate-900/70 shadow-2xl">
          <iframe
            src={GOOGLE_FORM_EMBED_URL}
            title="Summer Program Registration Form"
            width="100%"
            height="920"
            frameBorder="0"
            marginHeight={0}
            marginWidth={0}
            className="block w-full border-0"
          >
            Loading...
          </iframe>
        </div>
      </section>
    </main>
  );
}
