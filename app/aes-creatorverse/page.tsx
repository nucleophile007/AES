"use client";
import React from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Atom,
  BookOpen,
  Briefcase,
  Check,
  FlaskConical,
  GraduationCap,
  Headphones,
  Instagram,
  Megaphone,
  Mic,
  Newspaper,
  PenTool,
  Scale,
  Sparkles,
  Stethoscope,
  Users,
  Video,
  Youtube,
} from "lucide-react";
import Footer from "@/components/home/Footer";
import Link from "next/link";
import Chatbot from "@/components/home/Chatbot";
import Header from "@/components/home/Header";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
const launchTracks = [
  {
    icon: Atom,
    title: "Engineering and Sciences",
    tagline: "Build, test, publish.",
    accent: "from-cyan-400 via-sky-400 to-blue-500",
    glow: "shadow-cyan-500/20",
    points: [
      "Research assistantships ",
      "Robotics, AI and data-science projects",
      "Startup Shadowing",
      "Technical Workshops",
    ],
  },
  {
    icon: Stethoscope,
    title: "Pre-Med",
    tagline: "Clinical exposure, real hours.",
    accent: "from-emerald-400 via-teal-400 to-cyan-500",
    glow: "shadow-emerald-500/20",
    points: [
      "Hospital Shadowing",
      "Community Health Camps",
      "Biomedical Research",
      "Medical Case Writing",
    ],
  },
  {
    icon: Scale,
    title: "Law, Humanities and Business",
    tagline: "Argue, analyse, lead.",
    accent: "from-amber-400 via-orange-400 to-rose-500",
    glow: "shadow-amber-500/20",
    points: [
      "Business Consulting Projects",
      "Model UN & Policy Labs",
      "Moot Court & Legal Research",
      "Entrepreneurship Incubation",
    ],
  },
];

const packages = [
  {
    name: "SUMMER",
    timeline: "8 WEEK / 4 WEEK (June - Mid Aug)",
    duration: "8 week / 4 week",
    accent: "from-emerald-400 to-teal-500",
    image: "https://images.unsplash.com/photo-1511988617509-a57c8a288659?auto=format&fit=crop&w=1200&q=80",
    sessionDetails: [
      { label: "Mentor Sessions", value: "8 / 10" },
      { label: "Tech Writer Sessions", value: "1" },
      { label: "Director Sessions", value: "-" },
    ],
    features: [
      "Intensive full-time internship placement",
      "Track-specific skill bootcamp",
      "Capstone project and certificate",
    ],
  },
  {
    name: "FALL / SPRING",
    timeline: "5 month",
    duration: "5 month",
    featured: true,
    accent: "from-yellow-400 to-amber-500",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
    sessionDetails: [
      { label: "Mentor Sessions", value: "16" },
      { label: "Tech Writer Sessions", value: "2" },
      { label: "Director Sessions", value: "2" },
    ],
    features: [
      "Everything in the Summer package",
      "Semester-long part-time internship",
      "Portfolio and resume building",
      "Competition and conference participation",
      "Bi-weekly mentorship sessions",
    ],
  },
  {
    name: "LONG TERM",
    timeline: "10 month",
    duration: "10 month",
    accent: "from-violet-400 to-fuchsia-500",
    image: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1200&q=80",
    sessionDetails: [
      { label: "Mentor Sessions", value: "34" },
      { label: "Tech Writer Sessions", value: "3" },
      { label: "Director Sessions", value: "3" },
    ],
    features: [
      "Everything in the Fall / Spring package",
      "Multi-placement rotation across partners",
      "Leadership role and community project",
      "Recommendation letter pathway",
      "End-of-program showcase",
    ],
  },
];


const faqs = [
  {
    question: "What is the AES Creator Verse program?",
    answer:
      "AES Creator Verse combines the Launch Pad internship tracks with a Social Profile Program that builds Reading, Writing, Speech and Leadership through real projects.",
  },
  {
    question: "How do I choose a track?",
    answer:
      "We start with a profile mapping session covering your interests, academics and target majors, then place you in the track and internship partner that best matches your goals.",
  },
  {
    question: "What packages are available?",
    answer:
      "Summer (8 week or 4 week), Fall/Spring (5 months) and Long Term (10 months). Each package builds on the previous one in depth, placement time and mentorship.",
  },
  {
    question: "What is the Social Profile Program?",
    answer:
      "It builds your public presence across Reading, Writing, Speech and Leadership through roles such as blogging, podcasting, editing, tutoring and community campaigns.",
  },
  {
    question: "Can I join both programs?",
    answer:
      "Yes. Most students pair a Launch Pad track with the Social Profile Program so their internship work is visible through writing, speaking and community projects.",
  },
  {
    question: "What support do I receive?",
    answer:
      "Step-by-step coaching from subject-matter experts, digital media mentors and social skills experts, with scheduled reviews and progress tracking throughout the program.",
  },
];

export default function AESCreatorversePage() {
  const [flippedCards, setFlippedCards] = React.useState<Record<string, boolean>>({});

  const toggleTrack = (title: string) => {
    setFlippedCards((previous) => ({
      ...previous,
      [title]: !previous[title],
    }));
  };

  return (
    <main className="min-h-screen theme-bg-dark flex flex-col">
      <Header />
      <section className="theme-bg-dark relative overflow-hidden py-16 lg:py-24">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-14 left-8 h-40 w-40 rounded-full bg-cyan-400/20 blur-3xl animate-float" />
          <div className="absolute right-10 top-20 h-36 w-36 rounded-full bg-amber-400/20 blur-3xl animate-float-reverse" />
          <div className="absolute bottom-6 left-1/3 h-28 w-28 rounded-full bg-fuchsia-400/20 blur-3xl animate-float" />
        </div>
        <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} className="text-center">
            <h1 className="bg-gradient-to-r from-yellow-300 via-amber-400 to-orange-500 bg-clip-text text-5xl font-black text-transparent sm:text-6xl lg:text-7xl">
              AES CREATORVERSE
            </h1>
            <h2 className="mt-2 text-3xl font-bold text-sky-300 sm:text-4xl lg:text-6xl">Creative Profile Building Program</h2>
            <p className="mx-auto mt-6 max-w-4xl text-base theme-text-muted sm:text-lg lg:text-4">
              A creative and interactive program to build your social and community profile by helping you drive campaigns,
              raise your voice through digital media, and host shows of your interest.
            </p>

            <blockquote className="mx-auto mt-10 max-w-2xl border-l-4 border-yellow-400 pl-4 text-l italic text-yellow-300 sm:text-4xl">
              &quot;Where ACHARYA leads, creativity flows beyond horizons&quot;
              <span className="mt-2 block text-sm text-yellow-300">- AES Motto</span>
            </blockquote>

            <div className="mt-10 flex flex-wrap justify-center">
              <Link href="/book-session">
                <Button className="bg-gradient-to-r from-yellow-400 to-amber-500 px-6 font-semibold text-[#1a2236] hover:from-yellow-300 hover:to-amber-400">
                  Book Free Session
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <section id="launch-tracks" className="relative overflow-hidden py-5 theme-bg-dark">

  {/* Background */}
  <div className="absolute inset-0">
    <div className="absolute -left-20 top-10 h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl" />
    <div className="absolute right-0 bottom-0 h-72 w-72 rounded-full bg-violet-500/10 blur-3xl" />
  </div>

  <div className="container relative mx-auto px-4">

    {/* Heading */}

    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      className="mb-20 text-center"
    >


      <h2 className="text-7xl font-black theme-text-light">
        AES Launch Pad
      </h2>

      <p className="mx-auto mt-5 max-w-3xl text-lg theme-text-muted">
        Choose the domain that matches your future aspirations.
        Every pathway combines internships, mentorship and real-world
        portfolio building.
      </p>

    </motion.div>


    <div className="grid gap-10 lg:grid-cols-3">
      {launchTracks.map((track) => {
        const Icon = track.icon;
        const isFlipped = Boolean(flippedCards[track.title]);

        return (
          <motion.div
            key={track.title}
            whileHover={{ y: -12 }}
            className="group relative perspective-1000"
          >
            <motion.div
              animate={{ rotateY: isFlipped ? 180 : 0 }}
              transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
              className="relative h-[820px] w-full transform-style-preserve-3d"
            >
              <div className="absolute inset-0 overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-br from-[#18233c] to-[#121926] p-10 backface-hidden">
                <div className={`absolute -right-16 -top-16 h-56 w-56 rounded-full ${track.glow} bg-gradient-to-br ${track.accent} blur-3xl transition-all duration-500 group-hover:scale-125`} />

                <motion.div
                  whileHover={{ rotate: track.title === "Engineering and Sciences" ? 8 : track.title === "Pre-Med" ? -8 : 8, scale: 1.08 }}
                  className={`relative mx-auto mb-8 flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br ${track.accent} shadow-[0_0_50px_rgba(34,211,238,.35)]`}
                >
                  <Icon className="h-14 w-14 text-white" />
                </motion.div>

                <h3 className="text-center text-3xl font-black text-white">
                  {track.title === "Engineering and Sciences" ? (
                    <>
                      Engineering &
                      <br />
                      Sciences
                    </>
                  ) : track.title === "Law, Humanities and Business" ? (
                    <>
                      Law, Humanities
                      <br />
                      & Business
                    </>
                  ) : (
                    track.title
                  )}
                </h3>

                <p className={`mt-3 text-center uppercase tracking-[0.35em] text-xs ${track.title === "Engineering and Sciences" ? "text-cyan-300" : track.title === "Pre-Med" ? "text-emerald-300" : "text-amber-300"}`}>
                  {track.tagline.toUpperCase()}
                </p>

                <div className="my-8 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

                <div className="space-y-4">
                  {track.points.slice(0, 4).map((point) => (
                    <div key={point} className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:bg-white/10">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${track.title === "Engineering and Sciences" ? "bg-cyan-500/20" : track.title === "Pre-Med" ? "bg-emerald-500/20" : "bg-amber-500/20"}`}>
                        {track.title === "Engineering and Sciences" ? "🔬" : track.title === "Pre-Med" ? "🏥" : "⚖️"}
                      </div>
                      <span className="text-slate-200">{point}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-8 flex items-center justify-between">
                  <div className="flex gap-2">
                    <span className={`rounded-full px-3 py-1 text-xs ${track.title === "Engineering and Sciences" ? "bg-cyan-500/15 text-cyan-300" : track.title === "Pre-Med" ? "bg-emerald-500/15 text-emerald-300" : "bg-amber-500/15 text-amber-300"}`}>
                      {track.title === "Engineering and Sciences" ? "Internship" : track.title === "Pre-Med" ? "Clinical" : "Leadership"}
                    </span>
                    <span className={`rounded-full px-3 py-1 text-xs ${track.title === "Engineering and Sciences" ? "bg-yellow-500/15 text-yellow-300" : track.title === "Pre-Med" ? "bg-cyan-500/15 text-cyan-300" : "bg-orange-500/15 text-orange-300"}`}>
                      {track.title === "Engineering and Sciences" ? "Mentor" : track.title === "Pre-Med" ? "Research" : "Strategy"}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleTrack(track.title)}
                    className={`font-semibold transition group-hover:translate-x-1 ${track.title === "Engineering and Sciences" ? "text-cyan-300" : track.title === "Pre-Med" ? "text-emerald-300" : "text-amber-300"}`}
                  >
                    Explore →
                  </button>
                </div>
              </div>

              <div className="absolute inset-0 rotate-y-180 overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-br from-[#18233c] to-[#121926] p-8 backface-hidden">
                <div className="flex h-full flex-col">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div className={`rounded-full bg-gradient-to-r ${track.accent} px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white`}>
                      {track.title}
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleTrack(track.title)}
                      className="text-sm font-semibold text-slate-200 transition hover:text-white"
                    >
                      ← Back
                    </button>
                  </div>

                  <p className="mb-5 text-sm uppercase tracking-[0.35em] text-slate-300">
                    {track.tagline}
                  </p>

                  <div className="space-y-3">
                    {track.points.map((point) => (
                      <div key={point} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
                        <span className="mt-0.5 h-2.5 w-2.5 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
                        <span className="text-sm text-slate-200">{point}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-auto pt-6">
                    <div className={`inline-flex rounded-full border border-white/10 bg-gradient-to-r ${track.accent} px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white`}>
                      Track Details
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        );
      })}
    </div>

  </div>

</section>
      {/* </div>
      </div>
      </section> */}

      <section className="relative overflow-hidden border-y border-white/10 bg-[#16233D] py-24">
  {/* Background */}
  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.08),transparent_40%),radial-gradient(circle_at_bottom_right,rgba(251,191,36,0.08),transparent_40%)]" />

  <div className="absolute left-0 top-0 h-full w-full opacity-30">
    <div className="absolute -left-20 top-16 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />
    <div className="absolute right-0 top-40 h-64 w-64 rounded-full bg-yellow-500/10 blur-3xl" />
    <div className="absolute bottom-10 left-1/3 h-56 w-56 rounded-full bg-fuchsia-500/10 blur-3xl" />
  </div>

  <div className="container relative z-10 mx-auto max-w-7xl px-6">

    {/* Heading */}
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="mb-20 text-center"
    >

       <h2 className="text-7xl font-black theme-text-light">
        Social Profile Program
      </h2>

      <p className="mx-auto max-w-3xl text-xl leading-8 text-slate-400">
        Choose your passion and explore exciting opportunities that help
        build your personal brand, portfolio and public profile.
      </p>
    </motion.div>

   {/* ================= READING ================= */}

        {/* ================= READING ================= */}

<motion.div
  initial={{ opacity: 0, y: 30 }}
  whileInView={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6 }}
  className="mb-24"
>
  <div className="text-center mb-12">
    <h3 className="text-3xl font-black tracking-tight text-cyan-200 sm:text-4xl lg:text-5xl">
      Reading
    </h3>

    <p className="mt-5 max-w-2xl mx-auto text-lg text-slate-400">
      Transform your passion for reading into creative opportunities through
      publishing, reviewing and digital storytelling.
    </p>
  </div>

  <div className="flex justify-center gap-6 overflow-x-auto pb-3 xl:overflow-visible">

    {[
     {
  title: "Reviewer",
  image: "https://images.unsplash.com/photo-1456324504439-367cee3b3c32?auto=format&fit=crop&w=900&q=80",
},
{
  title: "Content Writer",
  image: "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=900&q=80",
},
{
  title: "Book Blog",
  image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=900&q=80",
},
{
  title: "Podcast",
  image: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=900&q=80",
},
{
  title: "Interviews",
  image: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=900&q=80",
},
    ].map((item) => (
      <motion.div
        key={item.title}
        whileHover={{
          y: -10,
          scale: 1.08,
        }}
        transition={{ type: "spring", stiffness: 250 }}
        className="group w-[105px] lg:w-[115px] xl:w-[120px] cursor-pointer flex-shrink-0"
      >
        <div className="relative mx-auto h-28 w-28 overflow-hidden rounded-full border border-white/30 shadow-2xl transition-all duration-300 group-hover:shadow-cyan-400/40">
          <img
            src={item.image}
            alt={item.title}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-slate-950/30" />
        </div>

        <p className="mt-3 text-center text-xs lg:text-sm font-semibold leading-4 text-slate-100 transition-colors group-hover:text-cyan-300">
          {item.title}
        </p>
      </motion.div>
    ))}
  </div>
</motion.div>
    {/* ================= WRITING ================= */}

<motion.div
  initial={{ opacity: 0, y: 30 }}
  whileInView={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6 }}
  className="mb-24"
>
  <div className="text-center mb-12">
    <h3 className="text-3xl font-black tracking-tight text-emerald-200 sm:text-4xl lg:text-5xl">
      Writing
    </h3>

    <p className="mt-5 text-slate-400 max-w-2xl mx-auto text-lg">
      Express your ideas through storytelling, publishing and digital content.
    </p>
  </div>

  <div className="flex justify-center gap-6 overflow-x-auto pb-3 xl:overflow-visible">

    {[
      {
  title: "Blog Writer",
  image: "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=900&q=80",
},
{
  title: "Book Author",
  image: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=900&q=80",
},
{
  title: "Freelance Writer",
  image: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=900&q=80",
},
{
  title: "Student Editor",
  image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80",
},
{
  title: "Local Magazine Editor",
  image: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=900&q=80",
},
{
  title: "Writing Tutor",
  image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=900&q=80",
},
    ].map((item) => (
      <motion.div
        key={item.title}
        whileHover={{
          y: -10,
          scale: 1.08,
        }}
        transition={{ type: "spring", stiffness: 250 }}
        className="group w-[105px] lg:w-[115px] xl:w-[120px] cursor-pointer flex-shrink-0"
      >
        <div className="relative mx-auto h-28 w-28 overflow-hidden rounded-full border border-white/30 shadow-2xl transition-all duration-300 group-hover:shadow-emerald-400/40">
          <img
            src={item.image}
            alt={item.title}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-slate-950/30" />
        </div>

        <p className="mt-3 text-center text-xs lg:text-sm font-semibold leading-4 text-slate-100 transition-colors group-hover:text-emerald-300">
          {item.title}
        </p>
      </motion.div>
    ))}
  </div>
</motion.div>

  {/* ================= SPEECH ================= */}

<motion.div
  initial={{ opacity: 0, y: 30 }}
  whileInView={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6 }}
  className="mb-24"
>
  <div className="text-center mb-12">
    <h3 className="text-3xl font-black tracking-tight text-fuchsia-200 sm:text-4xl lg:text-5xl">
      Speaking
    </h3>

    <p className="mt-5 text-slate-400 max-w-2xl mx-auto text-lg">
      Develop confidence, communication and public speaking through impactful opportunities.
    </p>
  </div>

  <div className="flex justify-center gap-6 overflow-x-auto pb-3 xl:overflow-visible">

    {[
      {
  title: "Debate Team",
  image: "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=900&q=80",
},
{
  title: "Council Spokesperson",
  image: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=900&q=80",
},
{
  title: "Podcast Host",
  image: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=900&q=80",
},
{
  title: "YouTube Host",
  image: "https://images.unsplash.com/photo-1586899028174-e7098604235b?auto=format&fit=crop&w=900&q=80",
},
{
  title: "TED Speaker",
  image: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=900&q=80",
},
{
  title: "Event Emcee",
  image: "https://images.unsplash.com/photo-1505236858219-8359eb29e329?auto=format&fit=crop&w=900&q=80",
},
    ].map((item) => (
      <motion.div
        key={item.title}
        whileHover={{
          y: -10,
          scale: 1.08,
        }}
        transition={{ type: "spring", stiffness: 250 }}
        className="group w-[105px] lg:w-[115px] xl:w-[120px] cursor-pointer flex-shrink-0"
      >
        <div className="relative mx-auto h-28 w-28 overflow-hidden rounded-full border border-white/30 shadow-2xl transition-all duration-300 group-hover:shadow-fuchsia-400/40">
          <img
            src={item.image}
            alt={item.title}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-500/10 via-transparent to-slate-950/30" />
        </div>

        <p className="mt-3 text-center text-xs lg:text-sm font-semibold leading-4 text-slate-100 transition-colors group-hover:text-fuchsia-300">
          {item.title}
        </p>
      </motion.div>
    ))}
  </div>
</motion.div>

   {/* ================= LEADERSHIP ================= */}

<motion.div
  initial={{ opacity: 0, y: 30 }}
  whileInView={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6 }}
>
  <div className="text-center mb-12">
    <h3 className="text-3xl font-black tracking-tight text-orange-200 sm:text-4xl lg:text-5xl">
      Leadership
    </h3>

    <p className="mt-5 text-slate-400 max-w-2xl mx-auto text-lg">
      Inspire teams, lead initiatives and create meaningful impact within your community.
    </p>
  </div>

  <div className="flex justify-center gap-6 overflow-x-auto pb-3 xl:overflow-visible">

    {[
      {
  title: "Community Drives",
  image: "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?auto=format&fit=crop&w=900&q=80",
},
{
  title: "Campaign Organizer",
  image: "https://images.unsplash.com/photo-1531058020387-3be344556be6?auto=format&fit=crop&w=900&q=80",
},
{
  title: "Workshop Facilitator",
  image: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=900&q=80",
},
{
  title: "Fundraiser Lead",
  image: "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?auto=format&fit=crop&w=900&q=80",
},
{
  title: "Student Council",
  image: "https://images.unsplash.com/photo-1529390079861-591de354faf5?auto=format&fit=crop&w=900&q=80",
},
{
  title: "Volunteer Coordinator",
  image: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=900&q=80",
},
    ].map((item) => (
      <motion.div
        key={item.title}
        whileHover={{
          y: -10,
          scale: 1.08,
        }}
        transition={{ type: "spring", stiffness: 250 }}
        className="group w-[105px] lg:w-[115px] xl:w-[120px] cursor-pointer flex-shrink-0"
      >
        <div className="relative mx-auto h-28 w-28 overflow-hidden rounded-full border border-white/30 shadow-2xl transition-all duration-300 group-hover:shadow-orange-400/40">
          <img
            src={item.image}
            alt={item.title}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-slate-950/30" />
        </div>

        <p className="mt-3 text-center text-xs lg:text-sm font-semibold leading-4 text-slate-100 transition-colors group-hover:text-orange-300">
          {item.title}
        </p>
      </motion.div>
    ))}
  </div>
</motion.div>

  </div>
</section>



    <section id="launch-tracks" className="relative overflow-hidden py-5 theme-bg-dark">
  {/* Background Effects */}
  <div className="absolute inset-0 overflow-hidden">
    <div className="absolute -left-32 top-20 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />
    <div className="absolute right-0 bottom-0 h-96 w-96 rounded-full bg-amber-500/10 blur-3xl" />

    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.04),transparent_60%)]" />
  </div>

  <div className="container relative mx-auto px-4">

    {/* Heading */}

    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="mx-auto mb-20 max-w-3xl text-center"
    >


      <h2 className="text-7xl font-black theme-text-light">

        Program Packages

      </h2>

      <p className="mt-6 text-lg leading-8 text-slate-400">

        Whether you`&apos;`re looking for a quick summer experience,
        a semester-long journey, or a comprehensive long-term
        program, choose the package that best fits your goals.

      </p>

    </motion.div>


    {/* Cards */}

    <div className="grid gap-10 lg:grid-cols-3">

      <motion.div
  whileHover={{
    y: -10,
    scale: 1.02,
  }}
  transition={{ type: "spring", stiffness: 220 }}
>
  <Card className="group overflow-hidden rounded-[28px] border border-amber-400/20 bg-gradient-to-b from-[#192540] to-[#111827] shadow-2xl transition-all duration-500 hover:border-amber-300/40 hover:shadow-amber-400/20">

    {/* Image */}

    <div className="relative h-44 overflow-hidden">

      <img
        src="/aes-creatorverse/summer.png"
        className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-[#111827] via-[#111827]/20 to-transparent" />

      <div className="absolute left-6 top-6 rounded-full bg-amber-400 px-4 py-1 text-xs font-bold text-slate-900">

        SUMMER

      </div>

    </div>

    <CardContent className="p-7">

      {/* Duration */}

      <div className="flex items-end gap-3">

        <span className="text-6xl font-black text-white">

          8

        </span>

        <div>

          <p className="text-xl font-bold text-white">

            Weeks

          </p>

          <p className="text-sm text-slate-400">

            Intensive Program

          </p>

        </div>

      </div>

      {/* Divider */}

      <div className="my-6 h-px bg-gradient-to-r from-transparent via-amber-400/40 to-transparent" />

      {/* Timeline */}

      <div className="space-y-5">

        <div className="flex gap-4">

          <div className="flex flex-col items-center">

            <div className="h-3 w-3 rounded-full bg-cyan-400" />

            <div className="h-10 w-[2px] bg-white/10" />

          </div>

          <div>

            <p className="font-semibold text-white">

              Mentor Sessions

            </p>

            <p className="text-sm text-slate-400">

              8 live sessions

            </p>

          </div>

        </div>

        <div className="flex gap-4">

          <div className="flex flex-col items-center">

            <div className="h-3 w-3 rounded-full bg-violet-400" />

            <div className="h-10 w-[2px] bg-white/10" />

          </div>

          <div>

            <p className="font-semibold text-white">

              Internship

            </p>

            <p className="text-sm text-slate-400">

              Industry exposure

            </p>

          </div>

        </div>

        <div className="flex gap-4">

          <div className="flex flex-col items-center">

            <div className="h-3 w-3 rounded-full bg-orange-400" />

            <div className="h-10 w-[2px] bg-white/10" />

          </div>

          <div>

            <p className="font-semibold text-white">

              Portfolio

            </p>

            <p className="text-sm text-slate-400">

              Real-world projects

            </p>

          </div>

        </div>

        <div className="flex gap-4">

          <div className="flex flex-col items-center">

            <div className="h-3 w-3 rounded-full bg-emerald-400" />

          </div>

          <div>

            <p className="font-semibold text-white">

              Certificate

            </p>

            <p className="text-sm text-slate-400">

              Completion credential

            </p>

          </div>

        </div>

      </div>

      {/* Bottom */}

      <div className="mt-8">

        <Button className="w-full rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 py-6 text-base font-bold text-slate-900 hover:opacity-90">

          Apply 

        </Button>

      </div>

    </CardContent>

  </Card>

</motion.div>


      <motion.div
  whileHover={{ y: -10, scale: 1.02 }}
  transition={{ type: "spring", stiffness: 220 }}
>
  <Card className="group relative overflow-hidden rounded-[28px] border-2 border-cyan-400 bg-gradient-to-b from-[#192540] to-[#111827] shadow-[0_0_35px_rgba(34,211,238,.15)]">

    {/* Popular Badge */}

    <div className="absolute right-5 top-5 rounded-full bg-cyan-400 px-4 py-1 text-xs font-bold text-slate-900">

      ⭐ MOST POPULAR

    </div>

    <div className="relative h-44 overflow-hidden">

      <img
        src="/aes-creatorverse/fall.png"
        className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-[#111827] to-transparent"/>

    </div>

    <CardContent className="p-7">

      <div className="flex items-end gap-3">

        <span className="text-6xl font-black text-white">

          5

        </span>

        <div>

          <p className="text-xl font-bold text-white">

            Months

          </p>

          <p className="text-sm text-cyan-300">

            Semester Program

          </p>

        </div>

      </div>

      <div className="my-6 h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent"/>
      <div className="space-y-5">

  <div className="flex gap-4">

    <div className="flex flex-col items-center">
      <div className="h-3 w-3 rounded-full bg-cyan-400" />
      <div className="h-10 w-[2px] bg-white/10" />
    </div>

    <div>
      <p className="font-semibold text-white">
        Mentor Sessions
      </p>
      <p className="text-sm text-slate-400">
        16 expert sessions
      </p>
    </div>

  </div>

  <div className="flex gap-4">

    <div className="flex flex-col items-center">
      <div className="h-3 w-3 rounded-full bg-violet-400" />
      <div className="h-10 w-[2px] bg-white/10" />
    </div>

    <div>
      <p className="font-semibold text-white">
        Industry Internship
      </p>
      <p className="text-sm text-slate-400">
        Practical workplace exposure
      </p>
    </div>

  </div>

  <div className="flex gap-4">

    <div className="flex flex-col items-center">
      <div className="h-3 w-3 rounded-full bg-orange-400" />
      <div className="h-10 w-[2px] bg-white/10" />
    </div>

    <div>
      <p className="font-semibold text-white">
        Portfolio Development
      </p>
      <p className="text-sm text-slate-400">
        Build real project portfolio
      </p>
    </div>

  </div>

  <div className="flex gap-4">

    <div className="flex flex-col items-center">
      <div className="h-3 w-3 rounded-full bg-emerald-400" />
    </div>

    <div>
      <p className="font-semibold text-white">
        Career Guidance
      </p>
      <p className="text-sm text-slate-400">
        Resume & interview preparation
      </p>
    </div>

  </div>

</div>

      <Button className="mt-8 w-full rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 py-6 text-base font-bold text-slate-900">

        Apply

      </Button>

    </CardContent>

  </Card>
</motion.div>


      <motion.div
whileHover={{y:-10,scale:1.02}}
transition={{type:"spring",stiffness:220}}
>

<Card className="group overflow-hidden rounded-[28px] border border-violet-400/30 bg-gradient-to-b from-[#192540] to-[#111827]">

<div className="relative h-44 overflow-hidden">

<img
src="/aes-creatorverse/3.png"
className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
/>

<div className="absolute inset-0 bg-gradient-to-t from-[#111827] to-transparent"/>

<div className="absolute left-5 top-5 rounded-full bg-violet-500 px-4 py-1 text-xs font-bold">

PREMIUM

</div>

</div>

<CardContent className="p-7">

<div className="flex items-end gap-3">

<span className="text-6xl font-black text-white">

10

</span>

<div>

<p className="text-xl font-bold text-white">

Months

</p>

<p className="text-sm text-violet-300">

Complete Journey

</p>

</div>

</div>

<div className="my-6 h-px bg-gradient-to-r from-transparent via-violet-400/40 to-transparent"/>

<div className="space-y-5">

  <div className="flex gap-4">

    <div className="flex flex-col items-center">
      <div className="h-3 w-3 rounded-full bg-violet-400" />
      <div className="h-10 w-[2px] bg-white/10" />
    </div>

    <div>
      <p className="font-semibold text-white">
        Mentor Sessions
      </p>
      <p className="text-sm text-slate-400">
        34 expert sessions
      </p>
    </div>

  </div>

  <div className="flex gap-4">

    <div className="flex flex-col items-center">
      <div className="h-3 w-3 rounded-full bg-cyan-400" />
      <div className="h-10 w-[2px] bg-white/10" />
    </div>

    <div>
      <p className="font-semibold text-white">
        Long Internship
      </p>
      <p className="text-sm text-slate-400">
        Extended industry experience
      </p>
    </div>

  </div>

  <div className="flex gap-4">

    <div className="flex flex-col items-center">
      <div className="h-3 w-3 rounded-full bg-orange-400" />
      <div className="h-10 w-[2px] bg-white/10" />
    </div>

    <div>
      <p className="font-semibold text-white">
        Research Project
      </p>
      <p className="text-sm text-slate-400">
        Publishable capstone work
      </p>
    </div>

  </div>

  <div className="flex gap-4">

    <div className="flex flex-col items-center">
      <div className="h-3 w-3 rounded-full bg-emerald-400" />
    </div>

    <div>
      <p className="font-semibold text-white">
        Placement Assistance
      </p>
      <p className="text-sm text-slate-400">
        Career & placement support
      </p>
    </div>

  </div>

</div>

<Button className="mt-8 w-full rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 py-6 text-base font-bold">

Apply

</Button>

</CardContent>

</Card>

</motion.div>

    </div>

  </div>

</section>
      <section className="py-20 theme-bg-dark">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold theme-text-light mb-6">Frequently Asked Questions</h2>
            <p className="text-xl theme-text-muted max-w-3xl mx-auto">Answers about AES Creator Verse, tracks and social profile options.</p>
          </motion.div>
          <div className="max-w-2xl mx-auto">
            <Accordion type="single" collapsible>
              <div className="space-y-6">
                {faqs.map((faq, i) => (
                  <AccordionItem key={i} value={`faq-${i}`} className="border-none">
                    <div>
                      <AccordionTrigger className="flex items-center gap-4 rounded-full border border-yellow-400/20 bg-[#1a2236]/90 px-6 py-4 text-lg font-bold text-yellow-400 backdrop-blur-sm transition-all hover:bg-yellow-400/10 hover:no-underline">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-400 font-bold text-[#1a2236]">Q</div>
                        <span className="text-left">{faq.question}</span>
                      </AccordionTrigger>
                      <AccordionContent className="relative px-0 pb-4 pt-0">
                        <div className="relative ml-10 mt-2 rounded-2xl border border-yellow-400/20 bg-[#1a2236]/90 p-6 text-base font-medium theme-text-light shadow-lg backdrop-blur-sm">
                          <div className="absolute -left-4 top-6 h-0 w-0 border-b-8 border-r-8 border-t-8 border-b-transparent border-r-[#1a2236] border-t-transparent" />
                          {faq.answer}
                        </div>
                      </AccordionContent>
                    </div>
                  </AccordionItem>
                ))}
              </div>
            </Accordion>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16 lg:py-20 theme-bg-dark relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 h-32 w-32 rounded-full bg-yellow-400 opacity-5 animate-float" />
          <div className="absolute bottom-20 right-20 h-24 w-24 rounded-full bg-cyan-400 opacity-5 animate-float-reverse" />
          <div className="absolute left-1/3 top-1/2 h-20 w-20 rounded-full bg-fuchsia-400 opacity-5 animate-float" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 via-transparent to-cyan-500/10" />

        <div className="container mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto theme-text-light space-y-6 sm:space-y-8"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold theme-text-light leading-tight">
              Ready to launch your profile?
            </h2>
            <p className="text-base sm:text-lg lg:text-xl theme-text-muted px-4 leading-relaxed max-w-3xl mx-auto">
              Join AES Creator Verse to turn interests into internships, publications and leadership outcomes.
            </p>

            <div className="flex justify-center gap-3 pt-4 flex-wrap">
              <Link href="/book-session">
                <Button className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-[#1a2236] hover:from-yellow-300 hover:to-yellow-400 px-6 shadow-lg font-bold">
                  Schedule Consultation
                </Button>
              </Link>
              <Link href="#launch-tracks">
                <Button variant="outline" className="border-cyan-300/40 bg-transparent text-cyan-200 hover:bg-cyan-300/10">
                  Back to Tracks
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
      <Footer />
      <Chatbot />
    </main>
  );
}