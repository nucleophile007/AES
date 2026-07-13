/* eslint-disable @next/next/no-img-element */
import React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { McqReportPresentation, toBulletList } from "@/lib/mcq-report-presentation";
import { Check, X } from "lucide-react";

interface ScoreSummary {
  finalScore?: number;
  rawScore?: number;
  percentage?: number;
  maxScore?: number;
  correctCount?: number;
  partialCount?: number;
  wrongCount?: number;
  answeredCount?: number;
  unansweredCount?: number;
}

interface SectionStat {
  sectionId?: string;
  sectionName?: string;
  questionCount?: number;
  correctCount?: number;
  wrongCount?: number;
  score?: number;
  maxScore?: number;
  percentage?: number;
}

interface DifficultyStat {
  difficulty?: string;
  questionCount?: number;
  correctCount?: number;
  wrongCount?: number;
  score?: number;
  maxScore?: number;
  percentage?: number;
}

interface QuestionStat {
  questionNumber?: string | number;
  sectionName?: string;
  difficulty?: string;
  correctAnswers?: string[];
  selectedAnswers?: string[];
  scoreAwarded?: number;
  status?: string;
  topic?: string;
  subTopic?: string;
}

interface PremiumMcqReportProps {
  report: {
    assessmentType?: string;
    scoreSummary?: ScoreSummary;
    sectionStats?: SectionStat[];
    difficultyStats?: DifficultyStat[];
    questionStats?: QuestionStat[];
    generatedAt?: string;
  };
  presentation: McqReportPresentation;
  studentName: string;
  assignmentTitle: string;
  testTitle: string;
  attemptsLabel?: string;
  consideredAttemptLabel?: string;
  className?: string;
  showModeBadge?: boolean;
  onUpdatePresentation?: (patch: Partial<McqReportPresentation>) => void;
}

const pct = (value: number | undefined) => Math.max(0, Math.min(100, Number(value) || 0));
const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);
const masteryWord = (value: number) => (value >= 80 ? "Excellent" : value >= 60 ? "Proficient" : value >= 40 ? "Developing" : "Critical");

const diffTheme = (difficulty: string | undefined) => {
  switch (difficulty) {
    case "easy":
      return { fill: "var(--green)", track: "var(--green-soft)", text: "var(--green)" };
    case "hard":
      return { fill: "var(--violet)", track: "var(--violet-soft)", text: "var(--violet)" };
    default:
      return { fill: "var(--amber)", track: "var(--amber-soft)", text: "var(--amber)" };
  }
};

function PageFrame({
  children,
  presentation,
  studentName,
  testTitle,
  pageNumber,
  totalPages,
}: {
  children: React.ReactNode;
  presentation: McqReportPresentation;
  studentName: string;
  testTitle: string;
  pageNumber: number;
  totalPages: number;
}) {
  return (
    <div className="report-paper relative mx-auto bg-white shadow-[0_8px_30px_rgba(15,23,42,0.08)] ring-1 ring-slate-200 print:break-after-page print:shadow-none print:ring-0" style={{ width: "min(880px, 100%)", padding: "44px 56px 56px", marginBottom: 24 }}>
      <div className="watermark">
        <img src="/acharya-logo.png" alt="" className="w-[420px]" />
      </div>

      <header className="page-header relative z-10">
        <div className="flex items-center gap-3">
          <img src="/acharya-logo.png" alt="logo" className="h-12 w-12 object-contain" />
          <div className="leading-tight">
            <div className="serif-display font-bold text-[1rem] text-[var(--ink)]">AES Math Competition</div>
            <div className="text-[0.88rem] text-[var(--ink)]">
              Student: <span className="font-bold">{studentName}</span>
            </div>
          </div>
        </div>
        <div className="text-right leading-tight">
          <div className="serif-display font-bold text-[1rem] text-[var(--ink)]">{testTitle}</div>
          <div className="text-[0.88rem] text-[var(--ink)]">{presentation.reportType}</div>
        </div>
      </header>

      <div className="relative z-10">{children}</div>

      <footer className="relative z-10 mt-10 pt-3 text-center text-[0.85rem] italic text-[var(--muted-ink)]">
        Page {pageNumber} of {totalPages}
      </footer>
    </div>
  );
}

export default function PremiumMcqReport({
  report,
  presentation,
  studentName,
  assignmentTitle,
  testTitle,
  attemptsLabel,
  consideredAttemptLabel,
  className,
  showModeBadge = false,
  onUpdatePresentation,
}: PremiumMcqReportProps) {
  const summary = report.scoreSummary || {};
  const sectionStats = report.sectionStats || [];
  const difficultyStats = report.difficultyStats || [];
  const questionStats = report.questionStats || [];

  const overallPct = pct(summary.percentage);
  const overallMastery = masteryWord(overallPct);
  const strengths = toBulletList(presentation.strengths);
  const weaknesses = toBulletList(presentation.weaknesses);
  const narrativeTitle = presentation.sectionTitleNarrative === "AI Performance Narrative" ? "Performance Narrative" : presentation.sectionTitleNarrative;
  const showGapAnalysis = report.assessmentType === "simple-assignment";
  const totalPages = showGapAnalysis ? 4 : 3;

  const excellent = sectionStats.filter((section) => pct(section.percentage) >= 75);
  const developing = sectionStats.filter((section) => pct(section.percentage) >= 50 && pct(section.percentage) < 75);
  const critical = sectionStats.filter((section) => pct(section.percentage) < 50);

  return (
    <div className={cn("w-full", className)}>
      <PageFrame presentation={presentation} studentName={studentName} testTitle={testTitle} pageNumber={1} totalPages={totalPages}>
        <div className="text-center mt-8 mb-10">
          <h1 className="serif-display text-[2.6rem] leading-tight text-[var(--ink)]">{presentation.reportTitle}</h1>
          <p className="serif-display italic text-[1.05rem] text-[var(--ink)] mt-2">{presentation.reportType}</p>
          {showModeBadge && (
            <div className="mt-3">
              <Badge className={cn("border", presentation.mode === "confirmed" ? "border-emerald-200 bg-emerald-100 text-emerald-800" : "border-amber-200 bg-amber-100 text-amber-800") }>
                {presentation.mode === "confirmed" ? "Confirmed" : "Draft"}
              </Badge>
            </div>
          )}
        </div>

        <h2 className="section-heading serif-display">1. Overall Score Summary</h2>
        <div className="grid grid-cols-1 gap-6 mb-10 md:grid-cols-4">
          <div className="summary-box">
            <div className="summary-box-header">Raw Score</div>
            <div className="summary-box-body">
              <div className="serif-display num text-[2rem] font-bold text-[var(--ink)] leading-none">
                {summary.finalScore ?? 0} <span className="text-[var(--muted-ink)] font-normal">/ {summary.maxScore ?? 0}</span>
              </div>
              <div className="mt-3 text-[0.9rem] text-[var(--muted-ink)]">{summary.wrongCount ?? 0} Errors</div>
            </div>
          </div>
          <div className="summary-box">
            <div className="summary-box-header">Accuracy</div>
            <div className="summary-box-body">
              <div className="serif-display num text-[2rem] font-bold text-[var(--ink)] leading-none">{overallPct}%</div>
              <div className="mt-3 text-[0.9rem] text-[var(--muted-ink)]">
                {summary.correctCount ?? 0} of {summary.answeredCount ?? summary.maxScore ?? 0} correct
              </div>
            </div>
          </div>
          <div className="summary-box">
            <div className="summary-box-header">Mastery Level</div>
            <div className="summary-box-body">
              <div className="serif-display text-[1.7rem] font-bold leading-none" style={{ color: overallPct >= 75 ? "var(--green)" : overallPct >= 50 ? "var(--amber)" : "var(--rose)" }}>
                {overallMastery}
              </div>
              <div className="mt-3 text-[0.9rem] italic text-[var(--muted-ink)]">
                {overallPct >= 75 ? "≥ 75% overall accuracy" : overallPct >= 60 ? "≥ 60% overall accuracy" : "< 60% overall accuracy"}
              </div>
            </div>
          </div>
          <div className="summary-box">
            <div className="summary-box-header">Errors / Unanswered</div>
            <div className="summary-box-body">
              <div className="serif-display num text-[2rem] font-bold text-[var(--ink)] leading-none">
                {summary.wrongCount ?? 0} <span className="text-[20px] text-[var(--muted-ink)]">/ {summary.unansweredCount ?? 0}</span>
              </div>
              <div className="mt-3 text-[0.9rem] text-[var(--muted-ink)]">Incorrect / Unattempted</div>
            </div>
          </div>
        </div>

        <h2 className="section-heading serif-display">2. {narrativeTitle}</h2>
        <div className="mt-2 border border-slate-300 bg-white">
          <div className="p-4">
            <p className="text-[15px] leading-7 text-slate-700">{presentation.aiNarrative}</p>
            <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <div className="border-b border-emerald-300 pb-2">
                  <h3 className="font-serif text-[18px] text-emerald-700">Strengths</h3>
                </div>
                <ul className="mt-3 space-y-2">
                  {strengths.map((line, index) => (
                    <li key={`strength-${index}`} className="border border-emerald-200 px-3 py-2 text-sm leading-relaxed text-slate-700">• {line}</li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="border-b border-rose-300 pb-2">
                  <h3 className="font-serif text-[18px] text-rose-700">Weaknesses</h3>
                </div>
                <ul className="mt-3 space-y-2">
                  {weaknesses.map((line, index) => (
                    <li key={`weakness-${index}`} className="border border-rose-200 px-3 py-2 text-sm leading-relaxed text-slate-700">• {line}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="mt-5 border-l-[4px] border-[#22386B] bg-slate-50 px-4 py-3">
              <p className="text-sm leading-relaxed text-slate-700">
                <span className="font-semibold text-slate-900">Interpretation:</span> {presentation.interpretationText}
              </p>
            </div>
          </div>
        </div>

        <h2 className="section-heading serif-display mt-8">3. Topic Proficiency Map</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {[
            { label: "EXCELLENT", items: excellent, textClass: "text-emerald-900" },
            { label: "DEVELOPING", items: developing, textClass: "text-amber-900" },
            { label: "CRITICAL", items: critical, textClass: "text-rose-900" },
          ].map((column, index) => (
            <div key={column.label} className={cn("proficiency-cell", index > 0 && "border-l-0")}>
              <div className="proficiency-head">{column.label}</div>
              <div className="p-3 min-h-[180px]">
                {column.items.length === 0 ? (
                  <div className="text-center italic text-[var(--muted-ink)] text-[0.9rem] py-6">—</div>
                ) : (
                  column.items.map((section, itemIndex) => {
                    const percentage = pct(section.percentage);
                    return (
                      <div key={section.sectionId || itemIndex} className={cn("text-center", itemIndex > 0 && "mt-4 pt-4 border-t border-slate-200")}>
                        <div className="serif-display font-bold text-[1rem] text-[var(--ink)]">{section.sectionName || `Section ${itemIndex + 1}`}</div>
                        <div className="text-[0.9rem] text-[var(--muted-ink)] mt-1 leading-snug">
                              {presentation.aiTopicInsights && presentation.aiTopicInsights[section.sectionId || `section-${itemIndex + 1}`]
                                ? presentation.aiTopicInsights[section.sectionId || `section-${itemIndex + 1}`]
                                : percentage >= 80
                                ? "Strong conceptual understanding and high execution consistency."
                                : percentage >= 50
                                ? "Developing understanding with room for stronger application."
                                : "Major conceptual struggles detected requiring focused revision."}
                        </div>
                        <div className="mt-3">
                          <span className={cn("inline-flex rounded border px-2 py-1 text-[11px] font-medium", column.textClass)}>
                            {presentation.masteryLabels[section.sectionId || `section-${itemIndex + 1}`] || "Developing"}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          ))}
        </div>

        <h2 className="section-heading serif-display mt-8">4. Difficulty Analysis Breakdown</h2>
        <div className="space-y-5">
          {difficultyStats.map((difficulty, index) => {
            const percentage = pct(difficulty.percentage);
            const theme = diffTheme(difficulty.difficulty);
            const relatedQuestions = questionStats.filter((question) => question.difficulty === difficulty.difficulty);
            const correctQuestions = relatedQuestions.filter((question) => question.status === "correct").map((question) => question.questionNumber ?? "").filter(Boolean);
            const incorrectQuestions = relatedQuestions.filter((question) => question.status === "incorrect" || question.status === "partial").map((question) => question.questionNumber ?? "").filter(Boolean);

            return (
              <div key={index} className="grid grid-cols-[110px_1fr_70px] items-center gap-4">
                <div className="serif-display text-[1.05rem] text-[var(--ink)]">{capitalize(difficulty.difficulty || "Medium")}</div>
                <div>
                  <div className="diff-track" style={{ background: theme.track }}>
                    <div className="diff-fill num" style={{ width: `${Math.max(percentage, 8)}%`, background: theme.fill }}>
                      {difficulty.correctCount ?? 0} / {difficulty.questionCount ?? 0} correct
                    </div>
                  </div>
                  <div className="text-[0.82rem] mt-1 flex flex-wrap gap-x-3 leading-snug">
                    {correctQuestions.length > 0 && <span style={{ color: "var(--green)" }}>Correct: {correctQuestions.map((q) => `Q${q}`).join(", ")}</span>}
                    <span className="text-[var(--muted-ink)]">—</span>
                    {incorrectQuestions.length > 0 && <span style={{ color: "var(--rose)" }}>Incorrect: {incorrectQuestions.map((q) => `Q${q}`).join(", ")}</span>}
                  </div>
                </div>
                <div className="serif-display num text-right font-bold text-[1rem]" style={{ color: theme.text }}>
                  {percentage}%
                </div>
              </div>
            );
          })}
        </div>

        <h2 className="section-heading serif-display mt-8">5. Mastery by Difficulty Level (Gap Analysis)</h2>
        <div className="grid gap-6 md:grid-cols-3 mt-6">
          {([
            { key: "easy" as const, label: "Easy Tier", color: "rgb(46, 158, 92)", bg: "rgba(46, 158, 92, 0.08)", border: "rgba(46, 158, 92, 0.35)" },
            { key: "medium" as const, label: "Medium Tier", color: "rgb(219, 148, 38)", bg: "rgba(219, 148, 38, 0.08)", border: "rgba(219, 148, 38, 0.35)" },
            { key: "hard" as const, label: "Hard Tier", color: "rgb(124, 74, 189)", bg: "rgba(124, 74, 189, 0.08)", border: "rgba(124, 74, 189, 0.35)" },
          ]).map((tier) => {
            const stat = difficultyStats.find((item) => String(item.difficulty || "").toLowerCase() === tier.key);
            const percentage = pct(stat?.percentage);
            const aiValue = presentation.aiDifficultyReviews?.[tier.key] || "";
            const mentorValue = presentation.difficultyReviews?.[tier.key] || "";

            return (
              <div key={tier.key} className="rounded-2xl border p-6 flex flex-col" style={{ backgroundColor: tier.bg, borderColor: tier.border }}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: tier.color }}>
                    {tier.label}
                  </span>
                  <span className="text-3xl font-extrabold" style={{ color: tier.color }}>
                    {percentage}%
                  </span>
                </div>

                {/* <div className="mb-3 inline-flex w-fit rounded-full border px-2 py-1 text-[11px] font-medium" style={{ color: tier.color, borderColor: tier.border }}>
                  Gemini AI Review
                </div> */}

                <p className="text-sm leading-relaxed text-slate-700 whitespace-pre-wrap">{aiValue || "AI review will appear here after generation."}</p>

                {/* <div className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Mentor Edit</div>
                {onUpdatePresentation ? (
                  <textarea
                    className="mt-2 w-full min-h-[110px] rounded-md border border-slate-300 p-3 text-sm"
                    value={mentorValue}
                    onChange={(e) =>
                      onUpdatePresentation({
                        difficultyReviews: {
                          ...(presentation.difficultyReviews || { easy: "", medium: "", hard: "" }),
                          [tier.key]: e.target.value,
                        },
                      })
                    }
                  />
                ) : (
                  <p className="mt-2 text-sm leading-relaxed text-slate-700 whitespace-pre-wrap">{mentorValue || "Mentor review will appear here."}</p>
                )} */}
              </div>
            );
          })}
        </div>
      </PageFrame>

      <PageFrame presentation={presentation} studentName={studentName} testTitle={testTitle} pageNumber={2} totalPages={totalPages}>
        <h2 className="section-heading serif-display mt-2">6. Teacher&apos;s Recommendation</h2>
        <div className="mt-6 border border-slate-300 bg-white p-6">
          <p className="text-[15px] leading-8 text-slate-700 whitespace-pre-wrap">
            {presentation.teacherRecommendation || "Teacher recommendation will appear here after generation."}
          </p>
        </div>
      </PageFrame>

      {showGapAnalysis && (
        <PageFrame presentation={presentation} studentName={studentName} testTitle={testTitle} pageNumber={3} totalPages={totalPages}>
          <h2 className="section-heading serif-display mt-2">7. Gap Analysis and Next Steps</h2>
          <div className="mt-6 grid gap-5">
            {[
              {
                title: "Conceptual Gaps",
                value: presentation.conceptualGaps,
                accent: "rgb(220, 38, 38)",
                bg: "rgba(220, 38, 38, 0.06)",
                border: "rgba(220, 38, 38, 0.28)",
              },
              {
                title: "Recommendations",
                value: presentation.recommendations,
                accent: "rgb(37, 99, 235)",
                bg: "rgba(37, 99, 235, 0.06)",
                border: "rgba(37, 99, 235, 0.28)",
              },
              {
                title: "Next Action",
                value: presentation.nextAction,
                accent: "rgb(5, 150, 105)",
                bg: "rgba(5, 150, 105, 0.06)",
                border: "rgba(5, 150, 105, 0.28)",
              },
            ].map((item, index) => (
              <div
                key={item.title}
                className="rounded-2xl border p-6"
                style={{ backgroundColor: item.bg, borderColor: item.border }}
              >
                <div className="mb-3 flex items-center gap-3">
                  <span
                    className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white"
                    style={{ backgroundColor: item.accent }}
                  >
                    {index + 1}
                  </span>
                  <h3 className="serif-display text-[1.2rem] font-bold text-[var(--ink)]">{item.title}</h3>
                </div>
                <p className="text-[15px] leading-7 text-slate-700 whitespace-pre-wrap">{item.value}</p>
              </div>
            ))}
          </div>
        </PageFrame>
      )}

      <PageFrame presentation={presentation} studentName={studentName} testTitle={testTitle} pageNumber={showGapAnalysis ? 4 : 3} totalPages={totalPages}>
        <h2 className="section-heading serif-display mt-2">Detailed Item Analysis</h2>
        <table className="item-table serif-display">
          <thead>
            <tr>
              <th className="w-[60px]">Q#</th>
              <th>Topic</th>
              <th>Sub-Topic Focus</th>
              <th className="w-[110px]">Difficulty</th>
              <th className="w-[70px] text-center">Key</th>
              <th className="w-[90px] text-center">Student</th>
              <th className="w-[80px] text-center">Status</th>
            </tr>
          </thead>
          <tbody>
            {questionStats.map((question, index) => {
              const isCorrect = question.status === "correct";
              const isPartial = question.status === "partial";
              return (
                <tr key={index}>
                  <td className="num">{question.questionNumber ?? index + 1}</td>
                  <td>{question.topic || "-"}</td>
                  <td>{question.subTopic || "-"}</td>
                  <td>{capitalize(question.difficulty || "medium")}</td>
                  <td className="text-center font-bold num">{(question.correctAnswers || []).join(", ") || "-"}</td>
                  <td className="text-center num">{(question.selectedAnswers || []).join(", ") || "-"}</td>
                  <td className="text-center">
                    {isCorrect ? (
                      <Check className="inline-block" size={18} strokeWidth={3} style={{ color: "var(--green)" }} />
                    ) : isPartial ? (
                      <span className="font-bold" style={{ color: "var(--amber)" }}>~</span>
                    ) : (
                      <X className="inline-block" size={18} strokeWidth={3} style={{ color: "var(--rose)" }} />
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </PageFrame>
    </div>
  );
}
