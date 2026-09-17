import Header from "../../../components/home/Header";
import Footer from "../../../components/home/Footer";
import Chatbot from "../../../components/home/Chatbot";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import RegistrationCloseButton from "../../../../components/events/RegistrationCloseButton";
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

const SHARED_REGISTRATION_FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLScADaWPXsKAeOw6Ryve0OuRyh1INZDxHV5XG91j5CGwlxMfNg/viewform";

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
  "fall-enrollments": {
    title: "Fall 2026 Enrollments Registration",
    viewUrl: SHARED_REGISTRATION_FORM_URL,
    summary:
      "Tutoring for all grades and districts with personalized lesson plans, in-person and online classes, homework support, and AP/test prep.",
    eyebrow: "Fall Enrollment",
    image: "/events/AES_Fall_2026_Flyer_1_FREE_TRIAL(1).png",
    dateLabel: "Fall 2026",
    timeLabel: "In-person and online classes",
    locationLabel: "All grades, all districts",
    ctaLabel: "Register for Fall Enrollment",
    highlights: ["Math", "Physics", "Biology", "Chemistry", "English", "Personalized lesson plans", "Homework support", "Worksheets, quizzes & practice", "AP & test prep", "Free trial class"],
  },
  "college-prep": {
    title: "UACHIEVE College Prep Registration",
    viewUrl: SHARED_REGISTRATION_FORM_URL,
    summary:
      "College application support with college list building, essay guidance, extracurricular counseling, major selection, deadline tracking, and optional research program add-on.",
    eyebrow: "College Prep",
    image: "/events/AES_College_Prep%20(1)%20(1).png",
    dateLabel: "Year-round support",
    timeLabel: "In-person and virtual sessions",
    locationLabel: "College application support",
    ctaLabel: "Register for College Prep",
    highlights: ["Building a potential list of colleges", "Tuning application essays", "Counseling through extracurricular activities", "Funding options, major selection, and deadline tracking", "Optional research program add-on"],
  },
  "math-league": {
    title: "Greater Sacramento Math League Registration",
    viewUrl:
      SHARED_REGISTRATION_FORM_URL,
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
    viewUrl: SHARED_REGISTRATION_FORM_URL,
    summary:
      "8-week intensive course with expert mentors, small group settings, and take-home exam support.",
    eyebrow: "Summer Program",
    image: "/program-image/ap-bridge-summer-program.png",
    dateLabel: "June 5 - July 31",
    timeLabel: "Frequency: 3 hrs/week",
    locationLabel: "Deadline: May 25",
    ctaLabel: "Register for AP Bridge",
    highlights: [
      "Courses: AP Pre-Calc",
      "Courses: AP Calc AB/BC",
      "Courses: AP Physics 1/C",
      "Courses: AP Biology",
      "Courses: AP Chemistry",
      "Total of 25 sessions",
      "Fees: $25/hr",
      "Small group settings",
      "Take-home exam support",
      "Expert mentors",
    ],
  },
  "aes-explorers": {
    title: "AES Explorers Research Program Registration",
    viewUrl: SHARED_REGISTRATION_FORM_URL,
    summary:
      "A unique college-level research opportunity for middle and high school students with mentor guidance from university faculty, researchers, PhD experts, and industry mentors.",
    eyebrow: "Research Opportunity",
    image: "/events/AES_Explorers_Research.png",
    dateLabel: "10 / 16 / 32 week options",
    timeLabel: "All sessions are online",
    locationLabel: "Package fees starting from $100/week",
    ctaLabel: "Register for AES Explorers",
    highlights: [
      "Engineering domain",
      "Pre-Med domain",
      "Law & Humanities domain",
      "Business domain",
      "Mentor guidance from university faculty, researchers, and PhD experts",
      "Opportunity to publish in journals and research competitions",
    ],
  },
  "aes-champions": {
    title: "AES Champions Math Competition Prep Registration",
    viewUrl: SHARED_REGISTRATION_FORM_URL,
    summary:
      "Are you looking to give your child a math edge beyond the classroom? Competition prep for elementary through high school contests with cohort-based learning and online sessions.",
    eyebrow: "Competition Prep",
    image: "/program-image/math-new-event.png",
    dateLabel: "New batches from June 8, 2026",
    timeLabel: "Weekly 2 classes (60 min sessions)",
    locationLabel: "Online",
    ctaLabel: "Join AES Champions",
    highlights: [
      "Elementary: NLMC",
      "Elementary: MOEMS",
      "Middle & High school: AMC 8 (Grades 5-8)",
      "Middle & High school: AMC 10 (Grades 9 & 10)",
      "Cohort-based learning",
      "Limited students per batch",
      "1500+ practice tests",
      "Up to 10 mock tests (live & take-home)",
      "All sessions are online",
      "Fees: starts from $35/hr",
    ],
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

      <section className="relative overflow-hidden pt-20 sm:pt-24 md:pt-28">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(250,204,21,0.12),transparent_30%),radial-gradient(circle_at_top_right,rgba(168,85,247,0.16),transparent_32%),linear-gradient(180deg,#0f1730_0%,#13203f_48%,#0b1224_100%)]" />
        <div className="relative mx-auto w-full max-w-7xl space-y-10 px-4 pb-12 sm:px-6 md:px-8">
          {id !== "aes-champions" && id !== "ap-bridge" && id !== "aes-explorers" && id !== "fall-enrollments" && id !== "college-prep" && (
            <div className="mx-auto max-w-4xl text-center text-white">
              <div className="inline-flex items-center gap-2 rounded-full border border-yellow-300/20 bg-yellow-300/10 px-4 py-2 text-sm uppercase tracking-[0.22em] text-yellow-200">
                <Sparkles className="h-4 w-4" />
                {eventConfig.eyebrow}
              </div>
              <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl md:text-5xl lg:text-6xl">
                {eventConfig.title.replace(" Registration", "")}
              </h1>
              <p className="mx-auto mt-4 max-w-3xl text-base leading-7 text-slate-200 sm:text-lg sm:leading-8">
                {eventConfig.summary}
              </p>
            </div>
          )}

          <div className="mx-auto w-full max-w-6xl">
            <div className="mb-4 overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/70 shadow-xl shadow-black/30 sm:mb-6">
              <div className="grid gap-5 p-4 sm:gap-6 sm:p-5 lg:grid-cols-[1.15fr_1fr] lg:items-center">
                <div className="relative h-56 w-full overflow-hidden rounded-[1.5rem] border border-white/10 bg-slate-950/40 sm:h-64 lg:h-[24rem]">
                  <Image
                    src={eventConfig.image}
                    alt={`${eventConfig.title} cover`}
                    fill
                    className="object-contain"
                    sizes="(min-width: 1024px) 560px, (min-width: 640px) 70vw, 100vw"
                  />
                </div>
                <div className="text-slate-100">
                  <p className="text-xs uppercase tracking-[0.2em] text-yellow-300">{eventConfig.eyebrow}</p>
                  <h2 className="mt-3 text-xl font-semibold text-white sm:text-2xl">
                    {eventConfig.title.replace(" Registration", "")}
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-slate-200 sm:text-base sm:leading-7">
                    {eventConfig.summary}
                  </p>
                  <div className="mt-4 space-y-2 text-sm text-slate-300">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 text-yellow-300" />
                      <span>{eventConfig.dateLabel}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock3 className="h-4 w-4 text-yellow-300" />
                      <span>{eventConfig.timeLabel}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-yellow-300" />
                      <span>{eventConfig.locationLabel}</span>
                    </div>
                  </div>
                  <ul className="mt-4 grid gap-2 text-xs text-slate-200 sm:grid-cols-2 sm:text-sm">
                    {eventConfig.highlights.map((highlight) => (
                      <li key={highlight} className="flex items-start gap-2 rounded-lg border border-white/10 bg-slate-900/50 px-3 py-2">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 text-yellow-300" />
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div id="registration-form" className="w-full overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/75 shadow-2xl shadow-black/40 backdrop-blur-xl">
              <div className="flex flex-col gap-3 border-b border-white/10 bg-white/5 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                <div>
                  <p className="mb-2 text-xs uppercase tracking-[0.2em] text-yellow-300 sm:text-sm">Official Registration</p>
                  <h2 className="text-xl font-semibold text-white sm:text-2xl">Complete the form below</h2>
                </div>
                <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
                  <Link
                    href={eventConfig.viewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex w-full items-center justify-center rounded-lg border border-slate-400/40 bg-slate-800/60 px-4 py-2 text-sm font-medium text-slate-100 transition hover:bg-slate-700/70 sm:w-auto"
                  >
                    Open In New Tab
                  </Link>
                  <RegistrationCloseButton />
                </div>
              </div>

              <div className="bg-slate-900/70 p-3 sm:p-4">
                <iframe
                  src={embedUrl}
                  title={eventConfig.title}
                  width="100%"
                  height="1200"
                  frameBorder="0"
                  marginHeight={0}
                  marginWidth={0}
                  className="block h-[70vh] min-h-[650px] w-full border-0 sm:h-[80vh] sm:min-h-[800px] lg:h-[calc(100vh-7rem)] lg:min-h-[1200px]"
                >
                  Loading...
                </iframe>
              </div>
            </div>
          </div>

        </div>
      </section>

      <Footer />
      <Chatbot />
    </main>
  );
}
