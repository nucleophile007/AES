export type ReportMode = "draft" | "confirmed";

export interface McqReportSectionStat {
  sectionId?: string;
  sectionName?: string;
  percentage?: number;
}

export interface McqReportPresentation {
  version: number;
  mode: ReportMode;
  instituteName: string;
  reportTitle: string;
  reportType: string;
  sectionTitleNarrative: string;
  sectionTitleMastery: string;
  sectionTitleDifficulty: string;
  aiNarrative: string;
  strengths: string;
  weaknesses: string;
  conceptualGaps: string;
  interpretationText: string;
  recommendations: string;
  nextAction: string;
  mentorComments: string;
  topicInsights: string;
  aiTopicInsights?: Record<string, string>;
  difficultyReviews: {
    easy: string;
    medium: string;
    hard: string;
  };
  aiDifficultyReviews?: {
    easy?: string;
    medium?: string;
    hard?: string;
  };
  masteryLabels: Record<string, string>;
  updatedAt: string;
  confirmedAt: string | null;
  confirmedByTeacherId: number | null;
}

interface CreateDefaultPresentationOptions {
  studentName?: string;
  assignmentTitle?: string;
  testTitle?: string;
  sectionStats?: McqReportSectionStat[];
}

const DEFAULT_INSTITUTE_NAME = "AES Elite Coaching";

const toText = (value: unknown, fallback = "") => {
  if (typeof value !== "string") return fallback;
  return value.trim();
};

const toMode = (value: unknown): ReportMode => {
  return value === "confirmed" ? "confirmed" : "draft";
};

const normalizeMasteryLabels = (
  value: unknown,
  sectionStats: McqReportSectionStat[]
): Record<string, string> => {
  const source = value && typeof value === "object" ? (value as Record<string, unknown>) : {};
  const next: Record<string, string> = {};

  sectionStats.forEach((section, index) => {
    const id = section.sectionId || `section-${index + 1}`;
    const percentage = Number(section.percentage) || 0;
    const defaultTier = percentage >= 80 ? "Advanced" : percentage >= 60 ? "Developing" : "Needs Support";
    const label = toText(source[id], defaultTier);
    next[id] = label || defaultTier;
  });

  return next;
};

export const createDefaultReportPresentation = (
  options: CreateDefaultPresentationOptions
): McqReportPresentation => {
  const now = new Date().toISOString();
  const studentName = toText(options.studentName, "Student");
  const assignmentTitle = toText(options.assignmentTitle, "Assessment");
  const testTitle = toText(options.testTitle, "MCQ Diagnostic");
  const sectionStats = Array.isArray(options.sectionStats) ? options.sectionStats : [];

  return {
    version: 1,
    mode: "draft",
    instituteName: DEFAULT_INSTITUTE_NAME,
    reportTitle: "Premium AI Diagnostic Report",
    reportType: `${testTitle} Performance Analysis`,
    sectionTitleNarrative: "Performance Narrative",
    sectionTitleMastery: "Topic Mastery Experience",
    sectionTitleDifficulty: "Difficulty Intelligence",
    aiNarrative: `${studentName} completed ${assignmentTitle}. This narrative should be refined by the mentor before student release.`,
    difficultyReviews: {
      easy: `Easy Tier (83% Mastery): Solid grasp of core operations. Only one error (Q18), likely due\nto a minor oversight in factor listing.`,
      medium: `Medium Tier (50% Mastery): Primary Growth Area. Significant point loss in digit\npatterns and digit sums.`,
      hard: `Hard Tier (62.5% Mastery): Exceptional Performance. High success rate on complex\nLCM and Factor Counting problems indicates strong conceptual depth`,
    },
    aiDifficultyReviews: {
      easy: `Easy Tier (83% Mastery): Student shows reliable execution on foundational operations; the lone error (Q18) appears to be a small oversight in factor listing. Recommend a short factor-listing drill.`,
      medium: `Medium Tier (50% Mastery): This is the primary growth area. Many errors stem from pattern recognition and digit-sum shortcuts—targeted practice on digit manipulation is advised.`,
      hard: `Hard Tier (62.5% Mastery): Strong conceptual depth on LCM and factor counting. Continue exposure to variant problem styles to consolidate transferability.`,
    },
    strengths: "Accurate recall in familiar topics\nSteady attempt completion",
    weaknesses: "Inconsistent performance in higher-difficulty questions\nMissed opportunities in multi-correct items",
    conceptualGaps: "Needs reinforcement in conceptual transfer and elimination strategy.",
    interpretationText: "Current performance indicates potential for rapid improvement with focused revision cycles.",
    recommendations: "Use a targeted practice plan with alternating concept and mixed-difficulty drills.",
    nextAction: "Complete two guided revision sessions and one timed mixed-paper within 7 days.",
    mentorComments: "Mentor to personalize recommendations before confirmation.",
    topicInsights: "Prioritize weak sections first, then consolidate medium-confidence areas.",
    masteryLabels: normalizeMasteryLabels({}, sectionStats),
    updatedAt: now,
    confirmedAt: null,
    confirmedByTeacherId: null,
  };
};

export const normalizeReportPresentation = (
  value: unknown,
  fallback: McqReportPresentation,
  sectionStats: McqReportSectionStat[] = []
): McqReportPresentation => {
  const source = value && typeof value === "object" ? (value as Record<string, unknown>) : {};

  return {
    version: 1,
    mode: toMode(source.mode ?? fallback.mode),
    instituteName: toText(source.instituteName, fallback.instituteName),
    reportTitle: toText(source.reportTitle, fallback.reportTitle),
    reportType: toText(source.reportType, fallback.reportType),
    sectionTitleNarrative: toText(source.sectionTitleNarrative, fallback.sectionTitleNarrative),
    sectionTitleMastery: toText(source.sectionTitleMastery, fallback.sectionTitleMastery),
    sectionTitleDifficulty: toText(source.sectionTitleDifficulty, fallback.sectionTitleDifficulty),
    aiNarrative: toText(source.aiNarrative, fallback.aiNarrative),
    strengths: toText(source.strengths, fallback.strengths),
    weaknesses: toText(source.weaknesses, fallback.weaknesses),
    conceptualGaps: toText(source.conceptualGaps, fallback.conceptualGaps),
    interpretationText: toText(source.interpretationText, fallback.interpretationText),
    recommendations: toText(source.recommendations, fallback.recommendations),
    nextAction: toText(source.nextAction, fallback.nextAction),
    mentorComments: toText(source.mentorComments, fallback.mentorComments),
    topicInsights: toText(source.topicInsights, fallback.topicInsights),
    difficultyReviews: {
      easy: toText((source as any).difficultyReviews?.easy, fallback.difficultyReviews.easy),
      medium: toText((source as any).difficultyReviews?.medium, fallback.difficultyReviews.medium),
      hard: toText((source as any).difficultyReviews?.hard, fallback.difficultyReviews.hard),
    },
    aiDifficultyReviews: {
      easy: toText((source as any).aiDifficultyReviews?.easy, (fallback as any).aiDifficultyReviews?.easy || ""),
      medium: toText((source as any).aiDifficultyReviews?.medium, (fallback as any).aiDifficultyReviews?.medium || ""),
      hard: toText((source as any).aiDifficultyReviews?.hard, (fallback as any).aiDifficultyReviews?.hard || ""),
    },
    aiTopicInsights: (source as any).aiTopicInsights && typeof (source as any).aiTopicInsights === 'object'
      ? (source as any).aiTopicInsights as Record<string, string>
      : (fallback as any).aiTopicInsights || {},
    masteryLabels: normalizeMasteryLabels(source.masteryLabels ?? fallback.masteryLabels, sectionStats),
    updatedAt: toText(source.updatedAt, fallback.updatedAt) || new Date().toISOString(),
    confirmedAt: toText(source.confirmedAt, fallback.confirmedAt || "") || null,
    confirmedByTeacherId: Number.isFinite(Number(source.confirmedByTeacherId))
      ? Number(source.confirmedByTeacherId)
      : fallback.confirmedByTeacherId,
  };
};

export const toBulletList = (value: string): string[] => {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
};
