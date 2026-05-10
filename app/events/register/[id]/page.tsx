import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer";
import Chatbot from "@/components/home/Chatbot";
import Link from "next/link";
import { notFound } from "next/navigation";
import RegistrationCloseButton from "@/components/events/RegistrationCloseButton";
import type { Metadata } from "next";
import { ArrowRight, CalendarDays, CheckCircle2, Clock3, MapPin, Sparkles, Trophy } from "lucide-react";

type EventFormConfig = {
  title: string;
  viewUrl: string;
  summary: string;
  eyebrow: string;
  image: string;
  dateLabel: string;
  timeLabel: string;
  locationLabel: string;
  ctaLabel: string;
  highlights: string[];
};

type ChampionsLevel = {
  level: string;
  grades: string;
  focus: string;
  goals: string;
  contests: string;
};

const CHAMPIONS_VALUE_PROPS = [
  {
    title: "Beyond school curricula",
    description: "A novel math program that builds competition fundamentals and advanced thinking.",
  },
  {
    title: "Skill-based mentorship",
    description: "Students receive customized guidance based on their current level and goals.",
  },
  {
    title: "Flexible support",
    description: "Designed for a diversity of experience levels, schedules, and learning styles.",
  },
  {
    title: "3000+ practice problems",
    description: "A deep practice bank for drills, worksheets, and contest-style preparation.",
  },
];

const CHAMPIONS_LEVELS: ChampionsLevel[] = [
  {
    level: "Level 1",
    grades: "Grades 5-8",
    focus: "Intermediate middle school concepts",
    goals: "Achievement Roll in AMC 8, Top 5% nationwide in AMC 8",
    contests: "AMC 8, MOEMS, MathCounts",
  },
  {
    level: "Level 2",
    grades: "Grades 6-8",
    focus: "Advanced middle school and introductory high school concepts",
    goals: "Top 1% nationwide in AMC 8, Achievement Roll in AMC 10 & AMC 12",
    contests: "AMC 8, AMC 10, AMC 12",
  },
  {
    level: "Level 3",
    grades: "Grades 7-11",
    focus: "Advanced middle school and introductory high school concepts",
    goals: "Top 5% nationwide in AMC 10 & AMC 12, AIME qualification and 4+ in AIME",
    contests: "AMC 10, AMC 12",
  },
  {
    level: "Level 4",
    grades: "Grades 7-11",
    focus: "AMC 10/12 challenge problems and intermediate AIME problems",
    goals: "Distinguished Honor Roll (Top 2.5%) in AMC 10 & AMC 12, 7+ in AIME",
    contests: "AMC 10, AMC 12, AIME Beginner",
  },
  {
    level: "Level 5",
    grades: "Grades 8-11",
    focus: "Advanced AIME problem solving and deeper olympiad concepts",
    goals: "Qualify for USAJMO/USAMO",
    contests: "AMC 10, AMC 12, AIME",
  },
];

const CHAMPIONS_SESSION_PLAN = [
  {
    title: "Weekly sessions",
    text: "Summer: two 60-minute weekly sessions. Semester & year-long: one 90-minute weekly session.",
  },
  {
    title: "Practice work",
    text: "1 to 2 hours per week of practice worksheets and contest-style work.",
  },
  {
    title: "Flexible timeline",
    text: "Summer: 10 weeks starting the June 1st week. Long term: 4, 6, or 12 months starting the August 1st week.",
  },
  {
    title: "Fees",
    text: "Summer: $750. Semester & year-long: starting at $300 per month.",
  },
];

const EVENT_FORMS: Record<string, EventFormConfig> = {
  "math-league": {
    title: "Greater Sacramento Math League Registration",
    viewUrl:
      "https://docs.google.com/forms/d/1vHd3DXMFCh_-qa-JefYo6uXDolD-Qyzz_SsbD1gTvw4/viewform?edit_requested=true",
    summary:
      "A high-energy regional math competition where students solve challenging problems, compete with peers, and earn medals and certificates.",
    eyebrow: "Math Competition",
    image: "/program-image/greater-sacramento-math-league.png",
    dateLabel: "Apr 25, 2026",
    timeLabel: "10:00 AM - 1:00 PM",
    locationLabel: "Chinmaya Mission, Sacramento",
    ctaLabel: "Register for Math League",
    highlights: ["Competition-style problem solving", "Awards and certificates", "Grades 6-12"],
  },
  "ap-bridge": {
    title: "AP Bridge Summer Program Registration",
    viewUrl:
      "https://docs.google.com/forms/d/e/1FAIpQLSfnTmN-Y088mfyx9L7WSGBX-S-i9TxPsYXFNHhkc4634HvaYg/viewform",
    summary:
      "Bridge into AP success with guided prep, concept strengthening, and structured summer sessions designed for steady progress.",
    eyebrow: "Summer Program",
    image: "/program-image/ap-bridge-summer-program.png",
    dateLabel: "June 8 - July 31, 2026",
    timeLabel: "Online",
    locationLabel: "Live virtual sessions",
    ctaLabel: "Register for AP Bridge",
    highlights: ["AP-focused guidance", "Live virtual instruction", "Structured summer timeline"],
  },
  "aes-explorers": {
    title: "AES Explorers Summer Camp Registration",
    viewUrl:
      "https://docs.google.com/forms/d/e/1FAIpQLScADaWPXsKAeOw6Ryve0OuRyh1INZDxHV5XG91j5CGwlxMfNg/viewform",
    summary:
      "A research-focused summer camp where students explore real questions with mentor guidance across multiple tracks.",
    eyebrow: "Research Camp",
    image: "/program-image/aes-explorers-summer-camp.png",
    dateLabel: "June 1 - August 7, 2026",
    timeLabel: "Online",
    locationLabel: "Live virtual sessions",
    ctaLabel: "Register for AES Explorers",
    highlights: ["Mentor-led research", "Hands-on exploration", "Multiple academic tracks"],
  },
  "aes-champions": {
    title: "AES Champions Math Competition Prep Registration",
    viewUrl:
      "https://docs.google.com/forms/d/1yM9aV0zpWIdIqmzvx9G4inGvtvFx6jh3VRfkbGcTP4M/viewform",
    summary:
      "A focused math competition program that goes beyond school curricula, builds strong problem-solving habits, and prepares students for AMC, AIME, and olympiad-style contests.",
    eyebrow: "Competition Prep",
    image: "/program-image/banner-champions.png",
    dateLabel: "Starts June 8, 2026",
    timeLabel: "Weekly live sessions",
    locationLabel: "Online",
    ctaLabel: "Join AES Champions",
    highlights: ["Customized mentorship", "3000+ practice problems", "Flexible level placement", "Placement test required"],
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const eventConfig = EVENT_FORMS[id];

  if (!eventConfig) {
    return {
      title: "Event Registration | ACHARYA Educational Services",
      description: "Register for ACHARYA Educational Services events and programs.",
      alternates: { canonical: "./" },
      robots: { index: false, follow: false },
    };
  }

  return {
    title: eventConfig.title,
    description: eventConfig.summary,
    alternates: {
      canonical: "./",
    },
    robots: { index: false, follow: false },
    openGraph: {
      title: eventConfig.title,
      description: eventConfig.summary,
      type: "website",
      url: "./",
    },
    twitter: {
      title: eventConfig.title,
      description: eventConfig.summary,
      card: "summary_large_image",
    },
  };
}

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

      <section className="relative overflow-hidden pt-24 md:pt-28">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(250,204,21,0.12),transparent_30%),radial-gradient(circle_at_top_right,rgba(168,85,247,0.16),transparent_32%),linear-gradient(180deg,#0f1730_0%,#13203f_48%,#0b1224_100%)]" />
        <div className="relative mx-auto w-full max-w-7xl px-4 pb-12 md:px-8 space-y-10">
          <div className="mx-auto max-w-4xl text-center text-white">
            <div className="inline-flex items-center gap-2 rounded-full border border-yellow-300/20 bg-yellow-300/10 px-4 py-2 text-sm uppercase tracking-[0.22em] text-yellow-200">
              <Sparkles className="h-4 w-4" />
              {eventConfig.eyebrow}
            </div>
            <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
              {eventConfig.title.replace(" Registration", "")}
            </h1>
            <p className="mx-auto mt-4 max-w-3xl text-lg leading-8 text-slate-200 sm:text-xl">
              {eventConfig.summary}
            </p>
          </div>

          <div id="registration-form" className="mx-auto w-full max-w-6xl overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/75 shadow-2xl shadow-black/40 backdrop-blur-xl">
            <div className="flex flex-col gap-3 border-b border-white/10 bg-white/5 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-yellow-300 mb-2">Official Registration</p>
                <h2 className="text-2xl font-semibold text-white">Complete the form below</h2>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href={eventConfig.viewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-lg border border-slate-400/40 bg-slate-800/60 px-4 py-2 text-sm font-medium text-slate-100 transition hover:bg-slate-700/70"
                >
                  Open In New Tab
                </Link>
                <RegistrationCloseButton />
              </div>
            </div>

            <div className="bg-slate-900/70 p-3">
              <iframe
                src={embedUrl}
                title={eventConfig.title}
                width="100%"
                  height="1200"
                frameBorder="0"
                marginHeight={0}
                marginWidth={0}
                  className="block h-[1200px] w-full border-0 lg:h-[calc(100vh-7rem)] lg:min-h-[1200px]"
              >
                Loading...
              </iframe>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1fr_1fr] lg:items-start">
            <section className="rounded-[2rem] border border-white/10 bg-slate-950/60 p-6 shadow-2xl shadow-black/40 backdrop-blur-xl">
              <ul className="space-y-3 text-sm leading-6 text-slate-100">
                <li>Math beyond school curricula with competition fundamentals</li>
                <li>Problem solving, cooperative competition, and STEM integration</li>
                <li>Customized mentorship based on skill level</li>
                <li>Flexible support for mixed skill levels and experience</li>
                <li>3000+ practice problems and worksheet work</li>
              </ul>
            </section>

            <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-xl">
              <ul className="space-y-3 text-sm leading-6 text-slate-200">
                <li>Weekly: Summer 2 x 60 minutes, Semester/Year 1 x 90 minutes</li>
                <li>Practice: 1-2 hours per week</li>
                <li>Timeline: Summer 10 weeks from the June 1st week</li>
                <li>Fees: Summer $750, semester/year-long starting at $300 per month</li>
                <li>Timing: PST and shared by June 1 after registration</li>
              </ul>
            </section>
          </div>

          <section className="rounded-[2rem] border border-white/10 bg-slate-950/40 p-5 shadow-lg">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
              {CHAMPIONS_LEVELS.map((level) => (
                <div key={level.level} className="rounded-[1.25rem] border border-white/10 bg-slate-900/50 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-yellow-300">{level.level}</p>
                  <p className="mt-2 text-sm font-semibold text-white">{level.grades}</p>
                  <p className="mt-2 text-xs leading-5 text-slate-300">{level.focus}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-lg backdrop-blur-xl">
            <ul className="grid gap-3 text-sm leading-6 text-slate-100 sm:grid-cols-2 lg:grid-cols-3">
              <li className="rounded-2xl border border-white/10 bg-slate-950/45 p-4">Level goals align to AMC 8, AMC 10, AMC 12, and AIME milestones</li>
              <li className="rounded-2xl border border-white/10 bg-slate-950/45 p-4">All students take a placement test after registration</li>
              <li className="rounded-2xl border border-white/10 bg-slate-950/45 p-4">Placement test date is communicated after sign-up</li>
            </ul>
          </section>
        </div>
      </section>

      <Footer />
      <Chatbot />
    </main>
  );
}
