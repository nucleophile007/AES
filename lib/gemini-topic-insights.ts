export interface SectionLike {
  sectionId?: string;
  sectionName?: string;
  percentage?: number;
  questionCount?: number;
  correctCount?: number;
}

export type TopicInsightsResult = Record<string, string>;

interface GenerateTopicInsightsInput {
  studentName: string;
  assignmentTitle: string;
  testTitle: string;
  sections: SectionLike[];
}

const normalizeText = (v: unknown) => (typeof v === "string" ? v.trim() : "");

const buildFallback = (section: SectionLike) => {
  const pct = Math.round(Number(section.percentage) || 0);
  const name = section.sectionName || "Topic";
  if (pct >= 80) return `${name}: strong mastery (${pct}%). Continue mixed practice to maintain transfer.`;
  if (pct >= 60) return `${name}: developing mastery (${pct}%). Focus on varied application to build consistency.`;
  if (pct >= 40) return `${name}: partial understanding (${pct}%). Reinforce core concepts with scaffolded problems.`;
  return `${name}: critical gaps (${pct}%). Prioritize targeted revision on foundational ideas.`;
};

const parseGeminiJson = (text: string): TopicInsightsResult => {
  const cleaned = text.trim().replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```$/i, "");
  try {
    const parsed = JSON.parse(cleaned) as Record<string, unknown>;
    const out: TopicInsightsResult = {};
    for (const k of Object.keys(parsed)) {
      out[k] = normalizeText(parsed[k]);
    }
    return out;
  } catch {
    return {};
  }
};

export async function generateGeminiTopicInsights(input: GenerateTopicInsightsInput): Promise<TopicInsightsResult> {
  const apiKey =
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_GEMINI_API_KEY ||
    process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
    "";

  const fallback: TopicInsightsResult = {};
  input.sections.forEach((s, idx) => {
    const id = s.sectionId || `section-${idx + 1}`;
    fallback[id] = buildFallback(s);
  });

  if (!apiKey) return fallback;

  const model = process.env.GEMINI_MODEL || "gemini-1.5-flash";

  const sectionsContext = input.sections
    .map((s, idx) => {
      const id = s.sectionId || `section-${idx + 1}`;
      return `${id}: ${s.sectionName || "Topic"} (${Math.round(Number(s.percentage) || 0)}% mastery, ${Number(s.correctCount)||0}/${Number(s.questionCount)||0} correct)`;
    })
    .join("\n");

  const payload = {
    contents: [
      {
        role: "user",
        parts: [
          {
            text: [
              `You are an educational analyst.`,
              `Return only a single JSON object mapping section ids to a one-sentence insight string.`,
              `Keys should be the section id (e.g. section-1) and values should be 1 short sentence each.`,
              `Do not include markdown or bullet points.`,
              `Context:`,
              `Student: ${input.studentName}`,
              `Assignment: ${input.assignmentTitle}`,
              `Test: ${input.testTitle}`,
              `Sections:`,
              sectionsContext,
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

    const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text || "").join("\n") || "";
    const parsed = parseGeminiJson(text);

    const result: TopicInsightsResult = {};
    input.sections.forEach((s, idx) => {
      const id = s.sectionId || `section-${idx + 1}`;
      result[id] = parsed[id] || fallback[id];
    });

    return result;
  } catch {
    return fallback;
  }
}
