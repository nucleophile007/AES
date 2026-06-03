export interface GapAnalysisInput {
  studentName: string;
  assignmentTitle: string;
  testTitle: string;
  scoreSummary: Record<string, unknown>;
  sectionStats: Array<Record<string, unknown>>;
  difficultyStats: Array<Record<string, unknown>>;
}

export interface GapAnalysisResult {
  conceptualGaps: string;
  recommendations: string;
  nextAction: string;
}

const normalizeText = (value: unknown) => (typeof value === "string" ? value.trim() : "");

const buildFallback = (input: GapAnalysisInput): GapAnalysisResult => {
  const percentage = Math.round(Number(input.scoreSummary?.percentage) || 0);
  const weakSections = input.sectionStats
    .filter((section) => Number(section.percentage) < 60)
    .map((section) => normalizeText(section.sectionName) || "target topic")
    .slice(0, 3);
  const focus = weakSections.length > 0 ? weakSections.join(", ") : "mixed application and error review";

  return {
    conceptualGaps: `The main gaps appear in ${focus}, with overall mastery at ${percentage}%. The student needs stronger transfer from familiar examples to mixed problem formats.`,
    recommendations: `Use targeted review on ${focus}, followed by short mixed drills that require the student to explain the method before solving.`,
    nextAction: "Complete one guided correction session, one focused practice set, and one timed mixed review before the next assessment.",
  };
};

const parseGeminiJson = (text: string): Partial<GapAnalysisResult> => {
  const cleaned = text.trim().replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```$/i, "");
  try {
    const parsed = JSON.parse(cleaned) as Record<string, unknown>;
    return {
      conceptualGaps: normalizeText(parsed.conceptualGaps),
      recommendations: normalizeText(parsed.recommendations),
      nextAction: normalizeText(parsed.nextAction),
    };
  } catch {
    return {};
  }
};

export async function generateGeminiGapAnalysis(input: GapAnalysisInput): Promise<GapAnalysisResult> {
  const fallback = buildFallback(input);
  const apiKey =
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_GEMINI_API_KEY ||
    process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
    "";

  if (!apiKey) return fallback;

  const model = process.env.GEMINI_MODEL || "gemini-1.5-flash";
  const payload = {
    contents: [
      {
        role: "user",
        parts: [
          {
            text: [
              "You are writing the Gap Analysis and Next Steps section for an academic MCQ diagnostic report.",
              "Return only JSON with keys conceptualGaps, recommendations, nextAction.",
              "Each value must be one concise, parent-friendly sentence. No markdown and no bullet points.",
              "Use specific performance evidence from the score, topic, and difficulty data.",
              `Student: ${input.studentName}`,
              `Assignment: ${input.assignmentTitle}`,
              `Test: ${input.testTitle}`,
              `Score summary: ${JSON.stringify(input.scoreSummary)}`,
              `Topic stats: ${JSON.stringify(input.sectionStats)}`,
              `Difficulty stats: ${JSON.stringify(input.difficultyStats)}`,
            ].join("\n"),
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.35,
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

    if (!response.ok) return fallback;

    const data = (await response.json()) as {
      candidates?: Array<{
        content?: { parts?: Array<{ text?: string }> };
      }>;
    };
    const text = data.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("\n") || "";
    const parsed = parseGeminiJson(text);

    return {
      conceptualGaps: parsed.conceptualGaps || fallback.conceptualGaps,
      recommendations: parsed.recommendations || fallback.recommendations,
      nextAction: parsed.nextAction || fallback.nextAction,
    };
  } catch {
    return fallback;
  }
}
