export type DifficultyTier = "easy" | "medium" | "hard";

export interface DifficultyStatsLike {
  difficulty?: DifficultyTier | string;
  questionCount?: number;
  correctCount?: number;
  wrongCount?: number;
  partialCount?: number;
  score?: number;
  maxScore?: number;
  percentage?: number;
}

export interface DifficultyReviewResult {
  easy: string;
  medium: string;
  hard: string;
}

interface GenerateDifficultyReviewsInput {
  studentName: string;
  assignmentTitle: string;
  testTitle: string;
  difficultyStats: DifficultyStatsLike[];
}

const normalizeText = (value: unknown) => (typeof value === "string" ? value.trim() : "");

const getTierStat = (difficultyStats: DifficultyStatsLike[], tier: DifficultyTier) => {
  const stat = difficultyStats.find((item) => String(item.difficulty || "").toLowerCase() === tier);
  return {
    questionCount: Number(stat?.questionCount) || 0,
    correctCount: Number(stat?.correctCount) || 0,
    wrongCount: Number(stat?.wrongCount) || 0,
    partialCount: Number(stat?.partialCount) || 0,
    score: Number(stat?.score) || 0,
    maxScore: Number(stat?.maxScore) || 0,
    percentage: Number(stat?.percentage) || 0,
  };
};

const buildFallbackReview = (tier: DifficultyTier, stat: ReturnType<typeof getTierStat>) => {
  const tierLabel = tier === "easy" ? "Easy Tier" : tier === "medium" ? "Medium Tier" : "Hard Tier";
  const mastery = Math.round(stat.percentage || 0);

  if (tier === "easy") {
    return `${tierLabel} (${mastery}% Mastery): strong foundational control with ${stat.correctCount}/${stat.questionCount} correct. Focus on eliminating small slip-ups in routine questions.`;
  }
  if (tier === "medium") {
    return `${tierLabel} (${mastery}% Mastery): the clearest growth area, with ${stat.correctCount}/${stat.questionCount} correct. Build consistency through repeated mixed-practice on multi-step reasoning.`;
  }
  return `${tierLabel} (${mastery}% Mastery): advanced reasoning is promising, with ${stat.correctCount}/${stat.questionCount} correct. Keep stretching with harder variants to lock in transfer skills.`;
};

const fallbackReviews = (input: GenerateDifficultyReviewsInput): DifficultyReviewResult => ({
  easy: buildFallbackReview("easy", getTierStat(input.difficultyStats, "easy")),
  medium: buildFallbackReview("medium", getTierStat(input.difficultyStats, "medium")),
  hard: buildFallbackReview("hard", getTierStat(input.difficultyStats, "hard")),
});

const parseGeminiJson = (text: string): Partial<DifficultyReviewResult> => {
  const cleaned = text.trim().replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```$/i, "");
  try {
    const parsed = JSON.parse(cleaned) as Record<string, unknown>;
    return {
      easy: normalizeText(parsed.easy),
      medium: normalizeText(parsed.medium),
      hard: normalizeText(parsed.hard),
    };
  } catch {
    return {};
  }
};

export async function generateGeminiDifficultyReviews(
  input: GenerateDifficultyReviewsInput
): Promise<DifficultyReviewResult> {
  const apiKey =
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_GEMINI_API_KEY ||
    process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
    "";

  if (!apiKey) {
    return fallbackReviews(input);
  }

  const model = process.env.GEMINI_MODEL || "gemini-1.5-flash";
  const payload = {
    contents: [
      {
        role: "user",
        parts: [
          {
            text: [
              `You are writing short academic review notes for an MCQ report.`,
              `Return only JSON with keys easy, medium, hard.`,
              `Each value must be 1-2 concise sentences, no bullet points, no markdown.`,
              `Use this context:`,
              `Student: ${input.studentName}`,
              `Assignment: ${input.assignmentTitle}`,
              `Test: ${input.testTitle}`,
              `Easy stats: ${JSON.stringify(getTierStat(input.difficultyStats, "easy"))}`,
              `Medium stats: ${JSON.stringify(getTierStat(input.difficultyStats, "medium"))}`,
              `Hard stats: ${JSON.stringify(getTierStat(input.difficultyStats, "hard"))}`,
            ].join("\n"),
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.4,
      maxOutputTokens: 512,
      responseMimeType: "application/json",
    },
  };

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      return fallbackReviews(input);
    }

    const data = (await response.json()) as {
      candidates?: Array<{
        content?: {
          parts?: Array<{ text?: string }>;
        };
      }>;
    };

    const text = data.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("\n") || "";
    const parsed = parseGeminiJson(text);

    return {
      easy: parsed.easy || fallbackReviews(input).easy,
      medium: parsed.medium || fallbackReviews(input).medium,
      hard: parsed.hard || fallbackReviews(input).hard,
    };
  } catch {
    return fallbackReviews(input);
  }
}
