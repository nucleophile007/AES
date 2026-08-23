import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function ProgramPackages() {
  return (
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
            Choose the package that best fits your goals, whether you are looking for a quick summer experience, a semester-long journey, or a comprehensive long-term program.
          </p>
        </motion.div>

        {/* Cards */}
        <div className="grid gap-10 lg:grid-cols-3 max-w-7xl mx-auto">
          
          {/* Summer */}
          <motion.div
            whileHover={{ y: -10, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 220 }}
          >
            <Card className="group relative overflow-hidden rounded-[28px] border border-amber-400/20 bg-gradient-to-b from-[#192540] to-[#111827] shadow-2xl transition-all duration-500 hover:border-amber-300/40 hover:shadow-amber-400/20">
              <div className="relative h-44 overflow-hidden">
                <img
                  src="/aes-creatorverse/summer.png"
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
                  alt="Summer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#111827] via-[#111827]/20 to-transparent" />
                <div className="absolute right-5 top-5 rounded-full bg-amber-400 px-4 py-1 text-xs font-bold text-slate-900">
                  SUMMER
                </div>
              </div>

              <CardContent className="p-7">
                <div className="flex flex-col gap-1">
                  <span className="text-4xl font-black text-white">
                    Summer
                  </span>
                  <p className="text-sm text-amber-300 font-medium">
                    Intensive Program
                  </p>
                </div>

                <div className="my-6 h-px bg-gradient-to-r from-transparent via-amber-400/40 to-transparent" />

                <div className="space-y-5">
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="h-3 w-3 rounded-full bg-amber-400" />
                      <div className="h-10 w-[2px] bg-white/10" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">Duration</p>
                      <p className="text-sm text-slate-400">8 Weeks</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="h-3 w-3 rounded-full bg-violet-400" />
                      <div className="h-10 w-[2px] bg-white/10" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">Preparatory Sessions</p>
                      <p className="text-sm text-slate-400">Skill building & foundation</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="h-3 w-3 rounded-full bg-orange-400" />
                      <div className="h-10 w-[2px] bg-white/10" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">Executive Stage</p>
                      <p className="text-sm text-slate-400">Project execution</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="h-3 w-3 rounded-full bg-emerald-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">Deliverables</p>
                      <p className="text-sm text-slate-400">Certificate, Recommendation, or Letter of Experience</p>
                    </div>
                  </div>
                </div>

                <Button className="mt-8 w-full rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 py-6 text-base font-bold text-slate-900">
                  Apply
                </Button>
              </CardContent>
            </Card>
          </motion.div>


          {/* Semester */}
          <motion.div
            whileHover={{ y: -10, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 220 }}
          >
            <Card className="group relative overflow-hidden rounded-[28px] border-2 border-cyan-400 bg-gradient-to-b from-[#192540] to-[#111827] shadow-[0_0_35px_rgba(34,211,238,.15)]">
              <div className="relative h-44 overflow-hidden">
                <img
                  src="/aes-creatorverse/fall.png"
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
                  alt="Semester"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#111827] to-transparent" />
                <div className="absolute right-5 top-5 rounded-full bg-cyan-400 px-4 py-1 text-xs font-bold text-slate-900">
                  MOST POPULAR
                </div>
              </div>

              <CardContent className="p-7">
                <div className="flex flex-col gap-1">
                  <span className="text-4xl font-black text-white">
                    Semester
                  </span>
                  <p className="text-sm text-cyan-300 font-medium">
                    Comprehensive Program
                  </p>
                </div>

                <div className="my-6 h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />

                <div className="space-y-5">
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="h-3 w-3 rounded-full bg-cyan-400" />
                      <div className="h-10 w-[2px] bg-white/10" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">Duration</p>
                      <p className="text-sm text-slate-400">5 Months</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="h-3 w-3 rounded-full bg-violet-400" />
                      <div className="h-10 w-[2px] bg-white/10" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">Preparatory Sessions</p>
                      <p className="text-sm text-slate-400">Skill building & foundation</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="h-3 w-3 rounded-full bg-orange-400" />
                      <div className="h-10 w-[2px] bg-white/10" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">Executive Stage</p>
                      <p className="text-sm text-slate-400">Advanced project execution</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="h-3 w-3 rounded-full bg-emerald-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">Deliverables</p>
                      <p className="text-sm text-slate-400">Certificate, Recommendation, or Letter of Experience</p>
                    </div>
                  </div>
                </div>

                <Button className="mt-8 w-full rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 py-6 text-base font-bold text-slate-900">
                  Apply
                </Button>
              </CardContent>
            </Card>
          </motion.div>


          {/* Long Year */}
          <motion.div
            whileHover={{ y: -10, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 220 }}
          >
            <Card className="group overflow-hidden rounded-[28px] border border-violet-400/30 bg-gradient-to-b from-[#192540] to-[#111827]">
              <div className="relative h-44 overflow-hidden">
                <img
                  src="/aes-creatorverse/3.png"
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
                  alt="Long Year"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#111827] to-transparent" />
                <div className="absolute right-5 top-5 rounded-full bg-violet-500 px-4 py-1 text-xs font-bold text-white">
                  PREMIUM
                </div>
              </div>

              <CardContent className="p-7">
                <div className="flex flex-col gap-1">
                  <span className="text-4xl font-black text-white">
                    Long Year
                  </span>
                  <p className="text-sm text-violet-300 font-medium">
                    Complete Immersive Journey
                  </p>
                </div>

                <div className="my-6 h-px bg-gradient-to-r from-transparent via-violet-400/40 to-transparent" />

                <div className="space-y-5">
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="h-3 w-3 rounded-full bg-violet-400" />
                      <div className="h-10 w-[2px] bg-white/10" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">Duration</p>
                      <p className="text-sm text-slate-400">10 Months</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="h-3 w-3 rounded-full bg-cyan-400" />
                      <div className="h-10 w-[2px] bg-white/10" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">Preparatory Sessions</p>
                      <p className="text-sm text-slate-400">Deep-dive foundation building</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="h-3 w-3 rounded-full bg-orange-400" />
                      <div className="h-10 w-[2px] bg-white/10" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">Executive Stage</p>
                      <p className="text-sm text-slate-400">Leadership & advanced execution</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="h-3 w-3 rounded-full bg-emerald-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">Deliverables</p>
                      <p className="text-sm text-slate-400">Certificate, Recommendation, or Letter of Experience</p>
                    </div>
                  </div>
                </div>

                <Button className="mt-8 w-full rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 py-6 text-base font-bold text-white">
                  Apply
                </Button>
              </CardContent>
            </Card>
          </motion.div>
          
        </div>
      </div>
    </section>
  );
}
