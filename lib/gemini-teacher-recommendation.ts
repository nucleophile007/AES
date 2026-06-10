interface ScoreSummaryLike {
  finalScore?: number;
  maxScore?: number;
  percentage?: number;
  correctCount?: number;
  partialCount?: number;
  wrongCount?: number;
  unansweredCount?: number;
}

interface SectionStatLike {
  sectionName?: string;
  questionCount?: number;
  correctCount?: number;
  score?: number;
  maxScore?: number;
  percentage?: number;
}

interface DifficultyStatLike {
  difficulty?: string;
  questionCount?: number;
  correctCount?: number;
  partialCount?: number;
  wrongCount?: number;
  unansweredCount?: number;
  score?: number;
  maxScore?: number;
  percentage?: number;
}

interface QuestionStatLike {
  questionNumber?: string | number;
  sectionId?: string;
  sectionName?: string;
  difficulty?: string;
  type?: string;
  marks?: number;
  negativeMarks?: number;
  partialMarkingEnabled?: boolean;
  correctAnswers?: string[];
  selectedAnswers?: string[];
  scoreAwarded?: number;
  status?: string;
  timeSpentMs?: number;
  visitCount?: number;
  firstViewedAt?: string | null;
  lastViewedAt?: string | null;
  lastAnsweredAt?: string | null;
}

interface TimingSummaryLike {
  timerMode?: string;
  recommendedMinutes?: number | null;
  chosenMinutes?: number | null;
  elapsedMs?: number;
  trackedQuestionTimeMs?: number;
  averageTimePerQuestionMs?: number;
  averageTimePerAnsweredQuestionMs?: number;
}

interface GenerateTeacherRecommendationInput {
  studentName: string;
  assignmentTitle: string;
  testTitle: string;
  scoreSummary: ScoreSummaryLike;
  sectionStats: SectionStatLike[];
  difficultyStats: DifficultyStatLike[];
  questionStats?: QuestionStatLike[];
  timingSummary?: TimingSummaryLike;
}

const normalizeText = (value: unknown) => (typeof value === "string" ? value.trim() : "");

const buildFallbackRecommendation = (input: GenerateTeacherRecommendationInput) => {
  const percentage = Math.round(Number(input.scoreSummary.percentage) || 0);
  const weakestSection = [...input.sectionStats].sort((a, b) => (Number(a.percentage) || 0) - (Number(b.percentage) || 0))[0];
  const strongestSection = [...input.sectionStats].sort((a, b) => (Number(b.percentage) || 0) - (Number(a.percentage) || 0))[0];
  const slowMisses = (input.questionStats || [])
    .filter((question) => String(question.status || "") !== "correct")
    .sort((a, b) => (Number(b.timeSpentMs) || 0) - (Number(a.timeSpentMs) || 0))
    .slice(0, 2)
    .map((question) => question.sectionName)
    .filter(Boolean);
  const focus = weakestSection?.sectionName || "the lowest-scoring topic";
  const strength = strongestSection?.sectionName || "the strongest topic";
  const timingFocus = slowMisses.length > 0
    ? ` Pair this with error review on questions where time investment did not translate into accuracy, especially around ${Array.from(new Set(slowMisses)).join(" and ")}.`
    : "";

  if (percentage >= 80) {
    return `${input.studentName} is performing strongly overall, especially in ${strength}. Continue with advanced mixed sets and timed challenge problems while using short reviews in ${focus} to prevent avoidable errors.${timingFocus}`;
  }

  if (percentage >= 60) {
    return `${input.studentName} shows a solid base with clear room to improve consistency. Prioritize guided practice in ${focus}, then follow with mixed review sets that connect this area back to ${strength}.${timingFocus}`;
  }

  return `${input.studentName} should begin with structured concept review in ${focus} before moving into timed practice. Use small daily drills, mentor-led error review, and one mixed checkpoint assessment after the next revision cycle.${timingFocus}`;
};

const buildQuestionEvidence = (questions: QuestionStatLike[] = []) => {
  return questions.map((question) => ({
    questionNumber: question.questionNumber,
    topic: question.sectionName,
    sectionId: question.sectionId,
    difficulty: question.difficulty,
    questionType: question.type,
    marks: question.marks,
    negativeMarks: question.negativeMarks,
    partialMarkingEnabled: question.partialMarkingEnabled,
    status: question.status,
    scoreAwarded: question.scoreAwarded,
    correctAnswers: question.correctAnswers,
    selectedAnswers: question.selectedAnswers,
    timeSpentSeconds: Math.round((Number(question.timeSpentMs) || 0) / 1000),
    visitCount: Number(question.visitCount) || 0,
    answered: Array.isArray(question.selectedAnswers) && question.selectedAnswers.length > 0,
  }));
};

const parseGeminiText = (text: string) => {
  const cleaned = text.trim().replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```$/i, "");
  try {
    const parsed = JSON.parse(cleaned) as Record<string, unknown>;
    return normalizeText(parsed.teacherRecommendation);
  } catch {
    return normalizeText(cleaned);
  }
};

export async function generateGeminiTeacherRecommendation(
  input: GenerateTeacherRecommendationInput
): Promise<string> {
  const apiKey =
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_GEMINI_API_KEY ||
    process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
    "";

  const fallback = buildFallbackRecommendation(input);
  if (!apiKey) return fallback;

  const model = process.env.GEMINI_MODEL || "gemini-1.5-flash";
  const payload = {
    contents: [
      {
        role: "user",
        parts: [
          {
            text: [
              "You are writing the Teacher's Recommendation section for an academic MCQ diagnostic report.",
              "Return only JSON with key teacherRecommendation.",
              "The value must be 2 concise paragraphs, 5-8 sentences total, no markdown and no bullet points.",
              "Use all evidence: overall score, section/topic performance, difficulty performance, per-question outcome, selected-vs-correct answer behavior, visit count, and time spent per question.",
              "Infer patterns such as concept gaps, careless errors, overthinking, rushing, weak difficulty band, topic priority, elimination strategy, time management, and practice sequence.",
              "Do not explicitly mention raw percentages, exact scores, exact question numbers, exact seconds, JSON, tables, or that you analyzed data.",
              "Write as a mentor recommendation: specific, practical, polished, and editable before sharing with parents/students.",
              "Include a clear next 1-2 week action plan with review sequence, drill type, and checkpoint assessment.",
              `Student: ${input.studentName}`,
              `Assignment: ${input.assignmentTitle}`,
              `Test: ${input.testTitle}`,
              `Score summary: ${JSON.stringify(input.scoreSummary)}`,
              `Section stats: ${JSON.stringify(input.sectionStats)}`,
              `Difficulty stats: ${JSON.stringify(input.difficultyStats)}`,
              `Timing summary: ${JSON.stringify(input.timingSummary || {})}`,
              `Per-question evidence: ${JSON.stringify(buildQuestionEvidence(input.questionStats))}`,
            ].join("\n"),
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.35,
      maxOutputTokens: 900,
      responseMimeType: "application/json",
    },
  };

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) return fallback;

    const data = (await response.json()) as {
      candidates?: Array<{
        content?: { parts?: Array<{ text?: string }> };
      }>;
    };

    const text = data.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("\n") || "";
    return parseGeminiText(text) || fallback;
  } catch {
    return fallback;
  }
}
