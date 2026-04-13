import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer";
import Chatbot from "@/components/home/Chatbot";
import Link from "next/link";
import { notFound } from "next/navigation";
import RegistrationCloseButton from "@/components/events/RegistrationCloseButton";

const EVENT_FORMS: Record<string, { title: string; viewUrl: string }> = {
  "math-league": {
    title: "Greater Sacramento Math League Registration",
    viewUrl:
      "https://docs.google.com/forms/d/1vHd3DXMFCh_-qa-JefYo6uXDolD-Qyzz_SsbD1gTvw4/viewform?edit_requested=true",
  },
  "ap-bridge": {
    title: "AP Bridge Summer Program Registration",
    viewUrl:
      "https://docs.google.com/forms/d/e/1FAIpQLSfnTmN-Y088mfyx9L7WSGBX-S-i9TxPsYXFNHhkc4634HvaYg/viewform",
  },
  "aes-explorers": {
    title: "AES Explorers Summer Camp Registration",
    viewUrl:
      "https://docs.google.com/forms/d/e/1FAIpQLScADaWPXsKAeOw6Ryve0OuRyh1INZDxHV5XG91j5CGwlxMfNg/viewform",
  },
};

function toEmbedUrl(viewUrl: string) {
  return `${viewUrl}${viewUrl.includes("?") ? "&" : "?"}embedded=true`;
}

export default async function EventRegistrationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const eventConfig = EVENT_FORMS[id];

  if (!eventConfig) {
    notFound();
  }

  const embedUrl = toEmbedUrl(eventConfig.viewUrl);

  return (
    <main className="min-h-screen theme-bg-dark flex flex-col">
      <Header />

      <section className="mx-auto w-full max-w-7xl px-4 pb-10 pt-24 md:px-8">
        <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <h1 className="text-2xl font-semibold text-white md:text-3xl">{eventConfig.title}</h1>
          <div className="flex items-center gap-2">
            <Link
              href={eventConfig.viewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-lg border border-slate-400/40 bg-slate-800/60 px-4 py-2 text-sm font-medium text-slate-100 transition hover:bg-slate-700/70"
            >
              Open Form In New Tab
            </Link>
            <RegistrationCloseButton />
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-700/70 bg-slate-900/70 shadow-2xl">
          <iframe
            src={embedUrl}
            title={eventConfig.title}
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

      <Footer />
      <Chatbot />
    </main>
  );
}
