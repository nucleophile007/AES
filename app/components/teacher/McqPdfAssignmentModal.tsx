"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  CheckCircle2,
  Clock3,
  FileJson,
  FileQuestion,
  ListChecks,
  RefreshCcw,
  Save,
  Timer,
  Upload,
} from "lucide-react";

type QuestionType = "single" | "multiple";
type OptionLabelStyle = "alpha-upper" | "numeric" | "roman-lower" | "custom";
type QuestionNumberingStyle = "numeric" | "alpha-upper" | "roman-lower" | "roman-upper";
type Difficulty = "easy" | "medium" | "hard";
type BulkTargetMode = "range" | "section";
type BulkTypeTargetMode = BulkTargetMode | "topic";
type AutoFormulaMode = "per-question" | "section" | "difficulty";
type AssessmentType = "mock-test" | "simple-assignment";

interface AutoTimeFormula {
  mode: AutoFormulaMode;
  defaultMinutesPerQuestion: number;
  sectionMinutesPerQuestion: Record<string, number>;
  difficultyMinutesPerQuestion: Record<Difficulty, number>;
}

interface McqSection {
  id: string;
  name: string;
  rangeExpression: string;
  color: string;
}

interface McqSubtopic {
  id: string;
  name: string;
}

interface McqTopic {
  id: string;
  name: string;
  subtopics: McqSubtopic[];
}

interface McqQuestion {
  id: string;
  sectionId: string;
  topicId: string | null;
  subtopicId: string | null;
  type: QuestionType;
  marks: number;
  negativeEnabled: boolean;
  negativeMarks: number;
  partialMarkingEnabled: boolean;
  optionCount: number;
  optionLabelStyle: OptionLabelStyle;
  customOptionLabels: string[];
  difficulty: Difficulty;
  correctAnswers: string[];
}

interface McqPdfConfig {
  version: 1;
  status: "draft" | "ready";
  assessmentType: AssessmentType;
  title: string;
  description: string;
  numberingStyle: QuestionNumberingStyle;
  recommendedTimeMode: "auto" | "manual";
  recommendedTimeMinutes: number;
  autoTimeFormula: AutoTimeFormula;
  sections: McqSection[];
  topics: McqTopic[];
  questions: McqQuestion[];
  createdAt: string;
  updatedAt: string;
}

interface PreviewQuestionState {
  selectedAnswers: string[];
  markedForReview: boolean;
}

interface SavedTemplate {
  id: number;
  title: string;
  summary: string;
  fileUrl: string | null;
  fileName: string | null;
  updatedAt: string;
  config: unknown;
}

interface McqPdfAssignmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teacherEmail: string;
  initialTemplateId?: number | null;
  onTemplatesUpdated?: () => void;
}

interface ParsedRangeResult {
  indexes: number[];
  normalized: string;
}

const DRAFT_STORAGE_VERSION = 1;
const getDraftStorageKey = (teacherEmail: string) => `aes:teacher:assignment:mcq-pdf:draft:v${DRAFT_STORAGE_VERSION}:${teacherEmail}`;
const getTimerStorageKey = (teacherEmail: string) => `aes:teacher:assignment:mcq-pdf:timer:v3:${teacherEmail}`;
const MCQ_METADATA_START = "[MCQ_PDF_CONFIG_V1]";
const MCQ_METADATA_END = "[/MCQ_PDF_CONFIG_V1]";
const AUTO_RECOMMENDED_PER_QUESTION = 1.8;
const DEFAULT_DIFFICULTY_MINUTES: Record<Difficulty, number> = {
  easy: 1.2,
  medium: 1.8,
  hard: 2.5,
};
const SECTION_COLORS = ["#60a5fa", "#f87171", "#34d399", "#fbbf24", "#a78bfa", "#fb7185", "#22d3ee", "#4ade80"] as const;
const getAssessmentTypeLabel = (value: AssessmentType) => (value === "simple-assignment" ? "Simple Assignment" : "Mock Test");
const NO_TOPIC_VALUE = "__no_topic__";
const NO_SUBTOPIC_VALUE = "__no_subtopic__";
const ANY_TOPIC_VALUE = "__any_topic__";
const ANY_SUBTOPIC_FILTER_VALUE = "__any_subtopic_filter__";
const KEEP_TOPIC_ASSIGNMENT_VALUE = "__keep_topic_assignment__";
const KEEP_SUBTOPIC_ASSIGNMENT_VALUE = "__keep_subtopic_assignment__";

const createId = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const getSectionColor = (index: number) => SECTION_COLORS[index % SECTION_COLORS.length];

const toRoman = (num: number) => {
  if (num <= 0) return "";
  const romans: Array<[number, string]> = [[1000, "M"], [900, "CM"], [500, "D"], [400, "CD"], [100, "C"], [90, "XC"], [50, "L"], [40, "XL"], [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"]];
  let value = num;
  let result = "";
  romans.forEach(([v, symbol]) => {
    while (value >= v) {
      result += symbol;
      value -= v;
    }
  });
  return result;
};

const toAlpha = (num: number) => {
  if (num <= 0) return "";
  let n = num;
  let result = "";
  while (n > 0) {
    n -= 1;
    result = String.fromCharCode(65 + (n % 26)) + result;
    n = Math.floor(n / 26);
  }
  return result;
};

const formatQuestionNumber = (index: number, style: QuestionNumberingStyle) => {
  const n = index + 1;
  if (style === "alpha-upper") return toAlpha(n);
  if (style === "roman-lower") return toRoman(n).toLowerCase();
  if (style === "roman-upper") return toRoman(n);
  return String(n);
};

const clampAutoMinutesValue = (value: unknown, fallback: number) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return fallback;
  return Math.max(0.1, Math.min(60, numeric));
};

const createDefaultAutoTimeFormula = (sectionId = ""): AutoTimeFormula => ({
  mode: "per-question",
  defaultMinutesPerQuestion: AUTO_RECOMMENDED_PER_QUESTION,
  sectionMinutesPerQuestion: sectionId ? { [sectionId]: AUTO_RECOMMENDED_PER_QUESTION } : {},
  difficultyMinutesPerQuestion: { ...DEFAULT_DIFFICULTY_MINUTES },
});

const getAutoRecommendedTimeMinutes = (questions: McqQuestion[], formula: AutoTimeFormula) => {
  if (questions.length === 0) return 1;
  const sectionRateMap = formula.sectionMinutesPerQuestion || {};
  const difficultyRateMap = formula.difficultyMinutesPerQuestion || DEFAULT_DIFFICULTY_MINUTES;
  const fallbackRate = clampAutoMinutesValue(formula.defaultMinutesPerQuestion, AUTO_RECOMMENDED_PER_QUESTION);

  const total = questions.reduce((sum, question) => {
    if (formula.mode === "section") {
      return sum + clampAutoMinutesValue(sectionRateMap[question.sectionId], fallbackRate);
    }
    if (formula.mode === "difficulty") {
      return sum + clampAutoMinutesValue(difficultyRateMap[question.difficulty], fallbackRate);
    }
    return sum + fallbackRate;
  }, 0);

  return Math.max(1, Math.ceil(total));
};

const getOptionLabels = (question: McqQuestion) => {
  const count = Math.max(2, Math.min(8, question.optionCount));
  if (question.optionLabelStyle === "custom") {
    const normalizedCustom = question.customOptionLabels.map((item) => item.trim()).filter(Boolean);
    return Array.from({ length: count }, (_, idx) => normalizedCustom[idx] || `Opt ${idx + 1}`);
  }

  return Array.from({ length: count }, (_, idx) => {
    const n = idx + 1;
    if (question.optionLabelStyle === "numeric") return String(n);
    if (question.optionLabelStyle === "roman-lower") return toRoman(n).toLowerCase();
    return toAlpha(n);
  });
};

const createDefaultSection = (index = 0): McqSection => ({
  id: createId(),
  name: `Section ${index + 1}`,
  rangeExpression: "",
  color: getSectionColor(index),
});

const createQuestionFromSection = (section: McqSection): McqQuestion => ({
  id: createId(),
  sectionId: section.id,
  topicId: null,
  subtopicId: null,
  type: "single",
  marks: 4,
  negativeEnabled: false,
  negativeMarks: 0,
  partialMarkingEnabled: false,
  optionCount: 4,
  optionLabelStyle: "alpha-upper",
  customOptionLabels: [],
  difficulty: "medium",
  correctAnswers: [],
});

const createDefaultConfig = (): McqPdfConfig => {
  const section = createDefaultSection(0);
  const defaultQuestionCount = 10;
  const autoTimeFormula = createDefaultAutoTimeFormula(section.id);
  const questions = Array.from({ length: defaultQuestionCount }, () => createQuestionFromSection(section));
  return {
    version: 1,
    status: "draft",
    assessmentType: "mock-test",
    title: "MCQ Test",
    description: "MCQ test linked to uploaded PDF",
    numberingStyle: "numeric",
    recommendedTimeMode: "auto",
    recommendedTimeMinutes: getAutoRecommendedTimeMinutes(questions, autoTimeFormula),
    autoTimeFormula,
    sections: [section],
    topics: [],
    questions,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
};

const formatMs = (ms: number) => {
  const clamped = Math.max(0, ms);
  const totalSeconds = Math.floor(clamped / 1000);
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;
  return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};

const formatRate = (value: number) => {
  const fixed = Number(value.toFixed(2));
  return Number.isInteger(fixed) ? `${fixed}` : `${fixed}`;
};

const sanitizeQuestionForType = (question: McqQuestion): McqQuestion => {
  const normalizedTopicId = question.topicId && question.topicId.trim() ? question.topicId : null;
  const normalizedSubtopicId = normalizedTopicId && question.subtopicId && question.subtopicId.trim()
    ? question.subtopicId
    : null;

  if (question.type === "single") {
    return {
      ...question,
      topicId: normalizedTopicId,
      subtopicId: normalizedSubtopicId,
      partialMarkingEnabled: false,
      correctAnswers: question.correctAnswers.slice(0, 1),
    };
  }
  return {
    ...question,
    topicId: normalizedTopicId,
    subtopicId: normalizedSubtopicId,
  };
};

const parseRangeExpression = (expression: string, totalQuestions: number): ParsedRangeResult => {
  const raw = expression.trim();
  if (!raw) return { indexes: [], normalized: "" };

  const set = new Set<number>();
  const normalizedParts: string[] = [];
  const tokens = raw.split(",").map((part) => part.trim()).filter(Boolean);

  for (const token of tokens) {
    const match = token.match(/^(\d+)(\s*-\s*(\d+))?$/);
    if (!match) throw new Error(`Invalid range token "${token}". Use "1-5" or "7".`);

    const startRaw = Number.parseInt(match[1], 10);
    const endRaw = match[3] ? Number.parseInt(match[3], 10) : startRaw;
    const start = Math.min(startRaw, endRaw);
    const end = Math.max(startRaw, endRaw);

    if (start < 1 || end > totalQuestions) {
      throw new Error(`Range "${token}" is outside available questions (1-${totalQuestions}).`);
    }

    normalizedParts.push(start === end ? `${start}` : `${start}-${end}`);
    for (let n = start; n <= end; n += 1) set.add(n - 1);
  }

  return { indexes: Array.from(set).sort((a, b) => a - b), normalized: normalizedParts.join(", ") };
};

const sanitizeRangeExpression = (expression: string, totalQuestions: number) => {
  const raw = expression.trim();
  if (!raw || totalQuestions < 1) return "";
  const tokens = raw.split(",").map((part) => part.trim()).filter(Boolean);
  const normalizedParts: string[] = [];

  for (const token of tokens) {
    const match = token.match(/^(\d+)(\s*-\s*(\d+))?$/);
    if (!match) continue;
    const startRaw = Number.parseInt(match[1], 10);
    const endRaw = match[3] ? Number.parseInt(match[3], 10) : startRaw;
    let start = Math.min(startRaw, endRaw);
    let end = Math.max(startRaw, endRaw);

    if (start > totalQuestions) continue;
    if (start < 1) start = 1;
    if (end < 1) continue;
    if (end > totalQuestions) end = totalQuestions;
    if (start > end) continue;

    normalizedParts.push(start === end ? `${start}` : `${start}-${end}`);
  }

  if (normalizedParts.length === 0) return "";
  try {
    return parseRangeExpression(normalizedParts.join(", "), totalQuestions).normalized;
  } catch {
    return "";
  }
};

const normalizeImportedConfig = (input: unknown): McqPdfConfig => {
  const fallback = createDefaultConfig();
  const raw = (input || {}) as Record<string, unknown>;
  const rawSections = Array.isArray(raw.sections) ? raw.sections : [];

  const sections: McqSection[] = rawSections.length > 0
    ? rawSections.map((section, idx) => {
        const s = (section || {}) as Record<string, unknown>;
        return {
          id: typeof s.id === "string" && s.id ? s.id : createId(),
          name: typeof s.name === "string" && s.name.trim() ? s.name.trim() : `Section ${idx + 1}`,
          rangeExpression: typeof s.rangeExpression === "string" ? s.rangeExpression : "",
          color: typeof s.color === "string" && s.color ? s.color : getSectionColor(idx),
        };
      })
    : fallback.sections;

  const sectionIdSet = new Set(sections.map((section) => section.id));
  const firstSection = sections[0];
  const rawTopics = Array.isArray(raw.topics) ? raw.topics : [];
  const topics: McqTopic[] = rawTopics
    .map((topic) => {
      const current = (topic || {}) as Record<string, unknown>;
      const topicName = typeof current.name === "string" ? current.name.trim() : "";
      if (!topicName) return null;

      const rawSubtopics = Array.isArray(current.subtopics) ? current.subtopics : [];
      const subtopics: McqSubtopic[] = rawSubtopics
        .map((subtopic) => {
          const sub = (subtopic || {}) as Record<string, unknown>;
          const subtopicName = typeof sub.name === "string" ? sub.name.trim() : "";
          if (!subtopicName) return null;
          return {
            id: typeof sub.id === "string" && sub.id ? sub.id : createId(),
            name: subtopicName,
          };
        })
        .filter((subtopic): subtopic is McqSubtopic => Boolean(subtopic));

      return {
        id: typeof current.id === "string" && current.id ? current.id : createId(),
        name: topicName,
        subtopics,
      };
    })
    .filter((topic): topic is McqTopic => Boolean(topic));
  const subtopicIdByTopicId = new Map(topics.map((topic) => [topic.id, new Set(topic.subtopics.map((subtopic) => subtopic.id))]));
  const rawQuestions = Array.isArray(raw.questions) ? raw.questions : [];

  const questions: McqQuestion[] = rawQuestions.length > 0
    ? rawQuestions.map((question) => {
        const q = (question || {}) as Record<string, unknown>;
        const optionCountRaw = Number(q.optionCount);
        const optionCount = Number.isFinite(optionCountRaw) ? Math.max(2, Math.min(8, Math.floor(optionCountRaw))) : 4;
        const sectionIdRaw = typeof q.sectionId === "string" ? q.sectionId : "";
        const negativeMarks = Math.max(0, Number.isFinite(Number(q.negativeMarks)) ? Number(q.negativeMarks) : 0);
        const topicIdRaw = typeof q.topicId === "string" ? q.topicId : "";
        const topicId = subtopicIdByTopicId.has(topicIdRaw) ? topicIdRaw : null;
        const subtopicIdRaw = typeof q.subtopicId === "string" ? q.subtopicId : "";
        const subtopicId = topicId && subtopicIdByTopicId.get(topicId)?.has(subtopicIdRaw) ? subtopicIdRaw : null;

        return sanitizeQuestionForType({
          id: typeof q.id === "string" && q.id ? q.id : createId(),
          sectionId: sectionIdSet.has(sectionIdRaw) ? sectionIdRaw : firstSection.id,
          topicId,
          subtopicId,
          type: q.type === "multiple" ? "multiple" : "single",
          marks: Math.max(1, Number.isFinite(Number(q.marks)) ? Number(q.marks) : 4),
          negativeEnabled: negativeMarks > 0,
          negativeMarks,
          partialMarkingEnabled: q.type === "multiple" ? Boolean(q.partialMarkingEnabled) : false,
          optionCount,
          optionLabelStyle: ["alpha-upper", "numeric", "roman-lower", "custom"].includes(String(q.optionLabelStyle))
            ? (q.optionLabelStyle as OptionLabelStyle)
            : "alpha-upper",
          customOptionLabels: Array.isArray(q.customOptionLabels) ? q.customOptionLabels.map((item) => String(item)).filter(Boolean) : [],
          difficulty: ["easy", "medium", "hard"].includes(String(q.difficulty)) ? (q.difficulty as Difficulty) : "medium",
          correctAnswers: Array.isArray(q.correctAnswers) ? q.correctAnswers.map((item) => String(item)).filter(Boolean) : [],
        });
      })
    : [createQuestionFromSection(firstSection)];
  const rawFormula = (raw.autoTimeFormula || {}) as Record<string, unknown>;
  const rawSectionFormula = (rawFormula.sectionMinutesPerQuestion || {}) as Record<string, unknown>;
  const rawDifficultyFormula = (rawFormula.difficultyMinutesPerQuestion || {}) as Record<string, unknown>;
  const defaultFormula = createDefaultAutoTimeFormula(firstSection.id);
  const formulaMode: AutoFormulaMode = rawFormula.mode === "section" || rawFormula.mode === "difficulty" ? rawFormula.mode : "per-question";
  const sectionMinutesPerQuestion = Object.fromEntries(
    sections.map((section) => [
      section.id,
      clampAutoMinutesValue(rawSectionFormula[section.id], defaultFormula.defaultMinutesPerQuestion),
    ])
  );
  const autoTimeFormula: AutoTimeFormula = {
    mode: formulaMode,
    defaultMinutesPerQuestion: clampAutoMinutesValue(rawFormula.defaultMinutesPerQuestion, defaultFormula.defaultMinutesPerQuestion),
    sectionMinutesPerQuestion,
    difficultyMinutesPerQuestion: {
      easy: clampAutoMinutesValue(rawDifficultyFormula.easy, defaultFormula.difficultyMinutesPerQuestion.easy),
      medium: clampAutoMinutesValue(rawDifficultyFormula.medium, defaultFormula.difficultyMinutesPerQuestion.medium),
      hard: clampAutoMinutesValue(rawDifficultyFormula.hard, defaultFormula.difficultyMinutesPerQuestion.hard),
    },
  };

  const recommendedMode = raw.recommendedTimeMode === "manual" ? "manual" : "auto";
  const autoRecommended = getAutoRecommendedTimeMinutes(questions, autoTimeFormula);
  const parsedRecommended = Number(raw.recommendedTimeMinutes);
  const recommendedTimeMinutes = recommendedMode === "manual"
    ? (Number.isFinite(parsedRecommended) ? Math.max(1, Math.floor(parsedRecommended)) : autoRecommended)
    : autoRecommended;
  const assessmentType: AssessmentType = raw.assessmentType === "simple-assignment" || raw.type === "simple-assignment"
    ? "simple-assignment"
    : "mock-test";

  return {
    version: 1,
    status: raw.status === "ready" ? "ready" : "draft",
    assessmentType,
    title: typeof raw.title === "string" ? raw.title : fallback.title,
    description: typeof raw.description === "string" ? raw.description : fallback.description,
    numberingStyle: ["numeric", "alpha-upper", "roman-lower", "roman-upper"].includes(String(raw.numberingStyle))
      ? (raw.numberingStyle as QuestionNumberingStyle)
      : fallback.numberingStyle,
    recommendedTimeMode: recommendedMode,
    recommendedTimeMinutes,
    autoTimeFormula,
    sections,
    topics,
    questions,
    createdAt: typeof raw.createdAt === "string" ? raw.createdAt : new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
};

export default function McqPdfAssignmentModal({
  open,
  onOpenChange,
  teacherEmail,
  initialTemplateId = null,
  onTemplatesUpdated,
}: McqPdfAssignmentModalProps) {
  const { toast } = useToast();

  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [linkedPdfUrl, setLinkedPdfUrl] = useState<string>("");
  const [linkedPdfName, setLinkedPdfName] = useState<string>("");
  const [pdfUrl, setPdfUrl] = useState<string>("");
  const [config, setConfig] = useState<McqPdfConfig>(createDefaultConfig);
  const [activeTab, setActiveTab] = useState<"configure" | "answer-key" | "preview">("configure");
  const [selectedQuestionId, setSelectedQuestionId] = useState<string>("");
  const [customOptionInput, setCustomOptionInput] = useState<string>("");
  const [lastAutoSavedAt, setLastAutoSavedAt] = useState<string>("");
  const [editingTemplateId, setEditingTemplateId] = useState<number | null>(null);
  const [templates, setTemplates] = useState<SavedTemplate[]>([]);
  const [savingTemplate, setSavingTemplate] = useState(false);
  const [templateSummary, setTemplateSummary] = useState("");
  const [topicNameInput, setTopicNameInput] = useState("");
  const [subtopicNameInput, setSubtopicNameInput] = useState("");
  const [selectedTopicId, setSelectedTopicId] = useState("");
  const [topicRangeExpression, setTopicRangeExpression] = useState("");
  const [topicRangeTopicId, setTopicRangeTopicId] = useState("");
  const [topicRangeSubtopicId, setTopicRangeSubtopicId] = useState("");

  const [bulkTypeMode, setBulkTypeMode] = useState<BulkTypeTargetMode>("range");
  const [bulkTypeRange, setBulkTypeRange] = useState("");
  const [bulkTypeSectionIds, setBulkTypeSectionIds] = useState<string[]>([]);
  const [bulkTypeFilterTopicId, setBulkTypeFilterTopicId] = useState<string>(ANY_TOPIC_VALUE);
  const [bulkTypeFilterSubtopicId, setBulkTypeFilterSubtopicId] = useState<string>(ANY_SUBTOPIC_FILTER_VALUE);
  const [bulkTypeValue, setBulkTypeValue] = useState<QuestionType>("single");
  const [bulkTypeAssignTopicId, setBulkTypeAssignTopicId] = useState<string>(KEEP_TOPIC_ASSIGNMENT_VALUE);
  const [bulkTypeAssignSubtopicId, setBulkTypeAssignSubtopicId] = useState<string>(KEEP_SUBTOPIC_ASSIGNMENT_VALUE);

  const [bulkScoringMode, setBulkScoringMode] = useState<BulkTargetMode>("range");
  const [bulkScoringRange, setBulkScoringRange] = useState("");
  const [bulkScoringSectionIds, setBulkScoringSectionIds] = useState<string[]>([]);
  const [bulkMarks, setBulkMarks] = useState(4);
  const [bulkNegativeMarks, setBulkNegativeMarks] = useState(0);
  const [bulkPartialMode, setBulkPartialMode] = useState<BulkTargetMode>("range");
  const [bulkPartialRange, setBulkPartialRange] = useState("");
  const [bulkPartialSectionIds, setBulkPartialSectionIds] = useState<string[]>([]);
  const [bulkPartialAction, setBulkPartialAction] = useState<"enable" | "disable">("enable");

  const [bulkOptionMode, setBulkOptionMode] = useState<BulkTargetMode>("range");
  const [bulkOptionRange, setBulkOptionRange] = useState("");
  const [bulkOptionSectionIds, setBulkOptionSectionIds] = useState<string[]>([]);
  const [bulkOptionCount, setBulkOptionCount] = useState(4);
  const [bulkDifficulty, setBulkDifficulty] = useState<Difficulty>("medium");
  const [bulkOptionLabelStyle, setBulkOptionLabelStyle] = useState<OptionLabelStyle>("alpha-upper");

  const [manualQuestionCount, setManualQuestionCount] = useState(10);

  const [previewCursor, setPreviewCursor] = useState(0);
  const [previewState, setPreviewState] = useState<Record<string, PreviewQuestionState>>({});
  const [previewStarted, setPreviewStarted] = useState(false);
  const [previewTimerDecision, setPreviewTimerDecision] = useState<"pending" | "timed" | "untimed">("pending");
  const [previewTimerMinutes, setPreviewTimerMinutes] = useState(Math.ceil(10 * AUTO_RECOMMENDED_PER_QUESTION));
  const [timerRemainingMs, setTimerRemainingMs] = useState(0);
  const [timerEndAtMs, setTimerEndAtMs] = useState<number | null>(null);
  const [timerRunning, setTimerRunning] = useState(false);

  const autosaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasLoadedLocalSessionRef = useRef(false);

  const sectionById = useMemo(() => {
    const map = new Map<string, McqSection>();
    config.sections.forEach((section) => map.set(section.id, section));
    return map;
  }, [config.sections]);
  const topicById = useMemo(() => {
    const map = new Map<string, McqTopic>();
    config.topics.forEach((topic) => map.set(topic.id, topic));
    return map;
  }, [config.topics]);
  const selectedTopic = selectedTopicId ? topicById.get(selectedTopicId) || null : null;
  const selectedRangeTopic = topicRangeTopicId ? topicById.get(topicRangeTopicId) || null : null;
  const selectedBulkTypeFilterTopic = topicById.get(bulkTypeFilterTopicId) || null;
  const selectedBulkTypeAssignTopic = topicById.get(bulkTypeAssignTopicId) || null;

  const pruneSectionSelections = useCallback((selectedIds: string[]) => {
    const validSectionIds = new Set(config.sections.map((section) => section.id));
    return selectedIds.filter((id) => validSectionIds.has(id));
  }, [config.sections]);

  const toggleSectionSelection = useCallback((selectedIds: string[], sectionId: string) => (
    selectedIds.includes(sectionId)
      ? selectedIds.filter((id) => id !== sectionId)
      : [...selectedIds, sectionId]
  ), []);

  const getSectionSelectionLabel = useCallback((selectedIds: string[]) => {
    const cleaned = pruneSectionSelections(selectedIds);
    if (cleaned.length === 0) return "Select sections";
    const names = cleaned.map((id) => sectionById.get(id)?.name || "Section");
    if (names.length <= 2) return names.join(", ");
    return `${names.length} sections selected`;
  }, [pruneSectionSelections, sectionById]);

  const selectedQuestion = useMemo(() => {
    if (!selectedQuestionId) return config.questions[0] || null;
    return config.questions.find((question) => question.id === selectedQuestionId) || config.questions[0] || null;
  }, [config.questions, selectedQuestionId]);

  const totalPoints = useMemo(() => config.questions.reduce((sum, question) => sum + question.marks, 0), [config.questions]);
  const autoRecommendedTimeMinutes = useMemo(
    () => getAutoRecommendedTimeMinutes(config.questions, config.autoTimeFormula),
    [config.questions, config.autoTimeFormula]
  );
  const recommendedTimeMinutes = config.recommendedTimeMode === "manual"
    ? Math.max(1, Math.floor(config.recommendedTimeMinutes || 1))
    : autoRecommendedTimeMinutes;
  const isMockTestType = config.assessmentType === "mock-test";
  const assessmentTypeLabel = getAssessmentTypeLabel(config.assessmentType);
  const assessmentNounLower = isMockTestType ? "test" : "assignment";
  const autoFormulaSummary = useMemo(() => {
    const formula = config.autoTimeFormula;
    if (formula.mode === "section") {
      return config.sections
        .map((section) => `${section.name}: ${formatRate(clampAutoMinutesValue(formula.sectionMinutesPerQuestion[section.id], formula.defaultMinutesPerQuestion))}`)
        .join(" | ");
    }
    if (formula.mode === "difficulty") {
      return `Easy: ${formatRate(formula.difficultyMinutesPerQuestion.easy)} | Medium: ${formatRate(formula.difficultyMinutesPerQuestion.medium)} | Hard: ${formatRate(formula.difficultyMinutesPerQuestion.hard)}`;
    }
    return `${formatRate(formula.defaultMinutesPerQuestion)} min per question`;
  }, [config.autoTimeFormula, config.sections]);
  const previewQuestion = config.questions[previewCursor] || null;

  const answeredQuestionIds = useMemo(
    () => new Set(Object.entries(previewState).filter(([, s]) => s.selectedAnswers.length > 0).map(([id]) => id)),
    [previewState]
  );

  const markedQuestionIds = useMemo(
    () => new Set(Object.entries(previewState).filter(([, s]) => s.markedForReview).map(([id]) => id)),
    [previewState]
  );

  const fetchTemplates = useCallback(async () => {
    if (!teacherEmail) return;
    try {
      const response = await fetch(`/api/teacher/mcq-tests?teacherEmail=${encodeURIComponent(teacherEmail)}`);
      const data = await response.json();
      const tests = Array.isArray(data.tests) ? data.tests : Array.isArray(data.templates) ? data.templates : [];
      if (response.ok) {
        setTemplates(tests as SavedTemplate[]);
      }
    } catch (error) {
      console.error('Error loading tests', error);
    }
  }, [teacherEmail]);

  useEffect(() => {
    if (!open) return;
    void fetchTemplates();
  }, [open, teacherEmail, fetchTemplates]);

  useEffect(() => {
    if (!open) return;
    if (config.questions.length === 0) {
      const fallback = createDefaultConfig();
      setConfig(fallback);
      setSelectedQuestionId(fallback.questions[0]?.id || "");
      setPreviewCursor(0);
      return;
    }
    if (!selectedQuestionId || !config.questions.some((question) => question.id === selectedQuestionId)) {
      setSelectedQuestionId(config.questions[0]?.id || "");
    }
  }, [open, config.questions, selectedQuestionId]);

  useEffect(() => {
    if (!open) {
      hasLoadedLocalSessionRef.current = false;
      return;
    }
    if (hasLoadedLocalSessionRef.current) return;
    hasLoadedLocalSessionRef.current = true;

    const draftKey = getDraftStorageKey(teacherEmail);
    try {
      const raw = localStorage.getItem(draftKey);
      if (raw) {
        const parsed = JSON.parse(raw) as { config?: unknown; savedAt?: string; summary?: string };
        if (parsed.config) {
          const normalized = normalizeImportedConfig(parsed.config);
          setConfig(normalized);
          setSelectedQuestionId(normalized.questions[0]?.id || "");
          setLastAutoSavedAt(parsed.savedAt || "");
          setTemplateSummary(parsed.summary || "");
          setManualQuestionCount(normalized.questions.length);
        }
      }
    } catch {
      // ignore
    }

    const timerKey = getTimerStorageKey(teacherEmail);
    try {
      const rawTimer = localStorage.getItem(timerKey);
      if (rawTimer) {
        const parsed = JSON.parse(rawTimer) as {
          remainingMs?: number;
          endAtMs?: number | null;
          running?: boolean;
          decision?: "pending" | "timed" | "untimed";
          started?: boolean;
          minutes?: number;
        };

        setPreviewTimerDecision(parsed.decision || "pending");
        setPreviewStarted(Boolean(parsed.started));
        setPreviewTimerMinutes(Number.isFinite(parsed.minutes) ? Math.max(1, Math.floor(parsed.minutes as number)) : recommendedTimeMinutes);

        if ((parsed.decision || "pending") === "timed") {
          if (parsed.running && parsed.endAtMs) {
            const remaining = Math.max(0, parsed.endAtMs - Date.now());
            setTimerEndAtMs(parsed.endAtMs);
            setTimerRemainingMs(remaining);
            setTimerRunning(remaining > 0);
          } else {
            setTimerRunning(false);
            setTimerEndAtMs(null);
            setTimerRemainingMs(Math.max(0, parsed.remainingMs ?? recommendedTimeMinutes * 60 * 1000));
          }
        }
      } else {
        setPreviewTimerMinutes(recommendedTimeMinutes);
      }
    } catch {
      setPreviewTimerMinutes(recommendedTimeMinutes);
    }
  }, [open, teacherEmail, recommendedTimeMinutes]);

  useEffect(() => {
    if (!open) return;
    if (config.recommendedTimeMode !== "auto") return;
    if (config.recommendedTimeMinutes === autoRecommendedTimeMinutes) return;
    setConfig((prev) => ({
      ...prev,
      recommendedTimeMinutes: autoRecommendedTimeMinutes,
      updatedAt: new Date().toISOString(),
    }));
  }, [open, config.recommendedTimeMode, config.recommendedTimeMinutes, autoRecommendedTimeMinutes]);

  useEffect(() => {
    if (!open) return;
    if (config.assessmentType !== "simple-assignment") return;
    if (previewTimerDecision !== "untimed") {
      setPreviewTimerDecision("untimed");
    }
    if (timerRunning) setTimerRunning(false);
    if (timerEndAtMs !== null) setTimerEndAtMs(null);
    if (timerRemainingMs !== 0) setTimerRemainingMs(0);
  }, [open, config.assessmentType, previewTimerDecision, timerRunning, timerEndAtMs, timerRemainingMs]);

  useEffect(() => {
    setBulkTypeSectionIds((prev) => pruneSectionSelections(prev));
    setBulkScoringSectionIds((prev) => pruneSectionSelections(prev));
    setBulkPartialSectionIds((prev) => pruneSectionSelections(prev));
    setBulkOptionSectionIds((prev) => pruneSectionSelections(prev));
  }, [pruneSectionSelections]);

  useEffect(() => {
    if (selectedTopicId && !topicById.has(selectedTopicId)) {
      setSelectedTopicId(config.topics[0]?.id || "");
      setSubtopicNameInput("");
    }

    if (topicRangeTopicId && !topicById.has(topicRangeTopicId)) {
      setTopicRangeTopicId("");
      setTopicRangeSubtopicId("");
    }

    if (topicRangeSubtopicId) {
      const rangeTopic = topicRangeTopicId ? topicById.get(topicRangeTopicId) : null;
      const isValidSubtopic = rangeTopic?.subtopics.some((subtopic) => subtopic.id === topicRangeSubtopicId);
      if (!isValidSubtopic) setTopicRangeSubtopicId("");
    }

    if (
      bulkTypeFilterTopicId !== ANY_TOPIC_VALUE
      && bulkTypeFilterTopicId !== NO_TOPIC_VALUE
      && !topicById.has(bulkTypeFilterTopicId)
    ) {
      setBulkTypeFilterTopicId(ANY_TOPIC_VALUE);
      setBulkTypeFilterSubtopicId(ANY_SUBTOPIC_FILTER_VALUE);
    }

    if (bulkTypeFilterTopicId === ANY_TOPIC_VALUE || bulkTypeFilterTopicId === NO_TOPIC_VALUE) {
      if (bulkTypeFilterSubtopicId !== ANY_SUBTOPIC_FILTER_VALUE) {
        setBulkTypeFilterSubtopicId(ANY_SUBTOPIC_FILTER_VALUE);
      }
    } else {
      const filterTopic = topicById.get(bulkTypeFilterTopicId) || null;
      const isValidSubtopicFilter = bulkTypeFilterSubtopicId === ANY_SUBTOPIC_FILTER_VALUE
        || bulkTypeFilterSubtopicId === NO_SUBTOPIC_VALUE
        || Boolean(filterTopic?.subtopics.some((subtopic) => subtopic.id === bulkTypeFilterSubtopicId));
      if (!isValidSubtopicFilter) {
        setBulkTypeFilterSubtopicId(ANY_SUBTOPIC_FILTER_VALUE);
      }
    }

    if (
      bulkTypeAssignTopicId !== KEEP_TOPIC_ASSIGNMENT_VALUE
      && bulkTypeAssignTopicId !== NO_TOPIC_VALUE
      && !topicById.has(bulkTypeAssignTopicId)
    ) {
      setBulkTypeAssignTopicId(KEEP_TOPIC_ASSIGNMENT_VALUE);
      setBulkTypeAssignSubtopicId(KEEP_SUBTOPIC_ASSIGNMENT_VALUE);
    }

    if (bulkTypeAssignTopicId === KEEP_TOPIC_ASSIGNMENT_VALUE || bulkTypeAssignTopicId === NO_TOPIC_VALUE) {
      if (bulkTypeAssignSubtopicId !== KEEP_SUBTOPIC_ASSIGNMENT_VALUE) {
        setBulkTypeAssignSubtopicId(KEEP_SUBTOPIC_ASSIGNMENT_VALUE);
      }
    } else {
      const assignTopic = topicById.get(bulkTypeAssignTopicId) || null;
      const isValidAssignSubtopic = bulkTypeAssignSubtopicId === KEEP_SUBTOPIC_ASSIGNMENT_VALUE
        || bulkTypeAssignSubtopicId === NO_SUBTOPIC_VALUE
        || Boolean(assignTopic?.subtopics.some((subtopic) => subtopic.id === bulkTypeAssignSubtopicId));
      if (!isValidAssignSubtopic) {
        setBulkTypeAssignSubtopicId(KEEP_SUBTOPIC_ASSIGNMENT_VALUE);
      }
    }
  }, [
    config.topics,
    selectedTopicId,
    topicById,
    topicRangeTopicId,
    topicRangeSubtopicId,
    bulkTypeFilterTopicId,
    bulkTypeFilterSubtopicId,
    bulkTypeAssignTopicId,
    bulkTypeAssignSubtopicId,
  ]);

  useEffect(() => {
    if (config.topics.length === 0) return;
    if (!selectedTopicId) {
      setSelectedTopicId(config.topics[0].id);
    }
    if (!topicRangeTopicId) {
      setTopicRangeTopicId(config.topics[0].id);
    }
  }, [config.topics, selectedTopicId, topicRangeTopicId]);

  useEffect(() => {
    if (!open) return;
    if (autosaveTimeoutRef.current) clearTimeout(autosaveTimeoutRef.current);
    autosaveTimeoutRef.current = setTimeout(() => {
      const savedAt = new Date().toISOString();
      try {
        localStorage.setItem(getDraftStorageKey(teacherEmail), JSON.stringify({ config, savedAt, summary: templateSummary }));
        setLastAutoSavedAt(savedAt);
      } catch {
        // ignore
      }
      autosaveTimeoutRef.current = null;
    }, 850);

    return () => {
      if (autosaveTimeoutRef.current) clearTimeout(autosaveTimeoutRef.current);
    };
  }, [config, open, teacherEmail, templateSummary]);

  useEffect(() => {
    if (!open) return;
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (timerRunning && previewTimerDecision === "timed") {
      intervalRef.current = setInterval(() => {
        setTimerRemainingMs((prev) => {
          const next = timerEndAtMs ? Math.max(0, timerEndAtMs - Date.now()) : Math.max(0, prev - 1000);
          if (next <= 0) {
            setTimerRunning(false);
            setTimerEndAtMs(null);
          }
          return next;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [timerRunning, timerEndAtMs, previewTimerDecision, open]);

  useEffect(() => {
    if (!open) return;
    try {
      localStorage.setItem(
        getTimerStorageKey(teacherEmail),
        JSON.stringify({
          running: timerRunning,
          remainingMs: timerRemainingMs,
          endAtMs: timerEndAtMs,
          decision: previewTimerDecision,
          started: previewStarted,
          minutes: previewTimerMinutes,
          updatedAt: new Date().toISOString(),
        })
      );
    } catch {
      // ignore
    }
  }, [timerRunning, timerRemainingMs, timerEndAtMs, previewTimerDecision, previewStarted, previewTimerMinutes, teacherEmail, open]);

  useEffect(() => {
    if (pdfFile) {
      const nextUrl = URL.createObjectURL(pdfFile);
      setPdfUrl(nextUrl);
      return () => URL.revokeObjectURL(nextUrl);
    }
    setPdfUrl("");
    return undefined;
  }, [pdfFile]);

  const setQuestion = (questionId: string, updater: (question: McqQuestion) => McqQuestion) => {
    setConfig((prev) => ({
      ...prev,
      updatedAt: new Date().toISOString(),
      questions: prev.questions.map((question) => (
        question.id === questionId ? sanitizeQuestionForType(updater(question)) : question
      )),
    }));
  };

  const updateAutoTimeFormula = (updater: (formula: AutoTimeFormula) => AutoTimeFormula) => {
    setConfig((prev) => {
      const nextFormula = updater(prev.autoTimeFormula);
      return {
        ...prev,
        updatedAt: new Date().toISOString(),
        autoTimeFormula: nextFormula,
        recommendedTimeMinutes: prev.recommendedTimeMode === "auto"
          ? getAutoRecommendedTimeMinutes(prev.questions, nextFormula)
          : prev.recommendedTimeMinutes,
      };
    });
  };

  const addQuestions = (count = 1) => {
    const safeCount = Math.max(0, Math.floor(count));
    if (safeCount < 1) return;
    setConfig((prev) => {
      const safeSections = prev.sections.length > 0 ? prev.sections : [createDefaultSection(0)];
      const firstSection = safeSections[0];
      const questions = [...prev.questions, ...Array.from({ length: safeCount }, () => createQuestionFromSection(firstSection))];
      return { ...prev, sections: safeSections, questions, updatedAt: new Date().toISOString() };
    });
  };

  const setQuestionCount = (nextCountInput: number) => {
    if (!Number.isFinite(nextCountInput)) {
      toast({ variant: "destructive", title: "Invalid count", description: "Enter a valid number of questions." });
      return;
    }

    const nextCount = Math.max(1, Math.min(500, Math.floor(nextCountInput)));
    const current = config.questions.length;
    if (nextCount === current) return;

    if (nextCount > current) {
      addQuestions(nextCount - current);
      setManualQuestionCount(nextCount);
      toast({ title: "Question count updated", description: `Total questions set to ${nextCount}.` });
      return;
    }

    const currentQuestions = config.questions;
    const trimmedQuestions = currentQuestions.slice(0, nextCount);
    const keptQuestionIds = new Set(trimmedQuestions.map((question) => question.id));
    const removedQuestionIds = currentQuestions.filter((question) => !keptQuestionIds.has(question.id)).map((question) => question.id);

    setConfig((prev) => ({
      ...prev,
      updatedAt: new Date().toISOString(),
      sections: prev.sections.map((section) => ({
        ...section,
        rangeExpression: sanitizeRangeExpression(section.rangeExpression, nextCount),
      })),
      questions: prev.questions.slice(0, nextCount),
    }));
    setManualQuestionCount(nextCount);
    setPreviewCursor((prev) => Math.min(prev, nextCount - 1));
    setPreviewState((prev) => {
      if (removedQuestionIds.length === 0) return prev;
      const next = { ...prev };
      removedQuestionIds.forEach((questionId) => {
        delete next[questionId];
      });
      return next;
    });
    if (!keptQuestionIds.has(selectedQuestionId)) {
      setSelectedQuestionId(trimmedQuestions[0]?.id || "");
    }
    toast({ title: "Question count updated", description: `Total questions set to ${nextCount}.` });
  };

  const removeQuestion = (questionId: string) => {
    if (config.questions.length <= 1) {
      toast({ title: "At least one question is required", description: "Keep one base question and edit it." });
      return;
    }

    setConfig((prev) => ({ ...prev, updatedAt: new Date().toISOString(), questions: prev.questions.filter((q) => q.id !== questionId) }));
    setPreviewState((prev) => {
      const next = { ...prev };
      delete next[questionId];
      return next;
    });
  };

  const addSection = () => {
    const section = createDefaultSection(config.sections.length);
    setConfig((prev) => ({
      ...prev,
      updatedAt: new Date().toISOString(),
      sections: [...prev.sections, section],
      autoTimeFormula: {
        ...prev.autoTimeFormula,
        sectionMinutesPerQuestion: {
          ...prev.autoTimeFormula.sectionMinutesPerQuestion,
          [section.id]: clampAutoMinutesValue(
            prev.autoTimeFormula.defaultMinutesPerQuestion,
            AUTO_RECOMMENDED_PER_QUESTION
          ),
        },
      },
    }));
  };

  const removeSection = (sectionId: string) => {
    if (config.sections.length <= 1) {
      toast({ title: "At least one section is required", description: "Use one section if you do not need multiple sections." });
      return;
    }

    const fallback = config.sections.find((section) => section.id !== sectionId);
    if (!fallback) return;

    setConfig((prev) => ({
      ...prev,
      updatedAt: new Date().toISOString(),
      sections: prev.sections.filter((section) => section.id !== sectionId),
      autoTimeFormula: {
        ...prev.autoTimeFormula,
        sectionMinutesPerQuestion: Object.fromEntries(
          Object.entries(prev.autoTimeFormula.sectionMinutesPerQuestion).filter(([id]) => id !== sectionId)
        ),
      },
      questions: prev.questions.map((question) =>
        question.sectionId === sectionId ? { ...question, sectionId: fallback.id } : question
      ),
    }));
  };

  const setSection = (sectionId: string, updater: (section: McqSection) => McqSection) => {
    setConfig((prev) => ({ ...prev, updatedAt: new Date().toISOString(), sections: prev.sections.map((section) => (section.id === sectionId ? updater(section) : section)) }));
  };

  const addTopic = () => {
    const name = topicNameInput.trim();
    if (!name) {
      toast({ title: "Topic name required", description: "Enter a topic name before adding." });
      return;
    }

    const exists = config.topics.some((topic) => topic.name.toLowerCase() === name.toLowerCase());
    if (exists) {
      toast({ title: "Topic already exists", description: "Use a different topic name." });
      return;
    }

    const topic: McqTopic = { id: createId(), name, subtopics: [] };
    setConfig((prev) => ({
      ...prev,
      updatedAt: new Date().toISOString(),
      topics: [...prev.topics, topic],
    }));
    setSelectedTopicId(topic.id);
    setTopicRangeTopicId((prev) => prev || topic.id);
    setTopicNameInput("");
    toast({ title: "Topic added", description: `${name} is now available.` });
  };

  const removeTopic = (topicId: string) => {
    const topicName = topicById.get(topicId)?.name || "Topic";
    setConfig((prev) => ({
      ...prev,
      updatedAt: new Date().toISOString(),
      topics: prev.topics.filter((topic) => topic.id !== topicId),
      questions: prev.questions.map((question) =>
        question.topicId === topicId
          ? { ...question, topicId: null, subtopicId: null }
          : question
      ),
    }));
    if (selectedTopicId === topicId) {
      setSelectedTopicId("");
      setSubtopicNameInput("");
    }
    if (topicRangeTopicId === topicId) {
      setTopicRangeTopicId("");
      setTopicRangeSubtopicId("");
    }
    toast({ title: "Topic removed", description: `${topicName} and related mappings were cleared.` });
  };

  const addSubtopic = () => {
    if (!selectedTopic) {
      toast({ title: "Select topic first", description: "Subtopics can only be added under a topic." });
      return;
    }

    const name = subtopicNameInput.trim();
    if (!name) {
      toast({ title: "Subtopic name required", description: "Enter a subtopic name before adding." });
      return;
    }

    const exists = selectedTopic.subtopics.some((subtopic) => subtopic.name.toLowerCase() === name.toLowerCase());
    if (exists) {
      toast({ title: "Subtopic already exists", description: "Use a different subtopic name." });
      return;
    }

    const subtopic: McqSubtopic = { id: createId(), name };
    setConfig((prev) => ({
      ...prev,
      updatedAt: new Date().toISOString(),
      topics: prev.topics.map((topic) =>
        topic.id === selectedTopic.id
          ? { ...topic, subtopics: [...topic.subtopics, subtopic] }
          : topic
      ),
    }));
    setTopicRangeTopicId((prev) => prev || selectedTopic.id);
    setSubtopicNameInput("");
    toast({ title: "Subtopic added", description: `${name} is now available under ${selectedTopic.name}.` });
  };

  const removeSubtopic = (topicId: string, subtopicId: string) => {
    const topicName = topicById.get(topicId)?.name || "Topic";
    const subtopicName = topicById.get(topicId)?.subtopics.find((subtopic) => subtopic.id === subtopicId)?.name || "Subtopic";
    setConfig((prev) => ({
      ...prev,
      updatedAt: new Date().toISOString(),
      topics: prev.topics.map((topic) =>
        topic.id === topicId
          ? { ...topic, subtopics: topic.subtopics.filter((subtopic) => subtopic.id !== subtopicId) }
          : topic
      ),
      questions: prev.questions.map((question) =>
        question.topicId === topicId && question.subtopicId === subtopicId
          ? { ...question, subtopicId: null }
          : question
      ),
    }));
    if (topicRangeTopicId === topicId && topicRangeSubtopicId === subtopicId) {
      setTopicRangeSubtopicId("");
    }
    toast({ title: "Subtopic removed", description: `${subtopicName} was removed from ${topicName}.` });
  };

  const applyTopicRangeMapping = () => {
    let parsed: ParsedRangeResult;
    try {
      parsed = parseRangeExpression(topicRangeExpression, config.questions.length);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Range update failed",
        description: error instanceof Error ? error.message : "Invalid range.",
      });
      return;
    }

    if (parsed.indexes.length === 0) {
      toast({ variant: "destructive", title: "Range update failed", description: "Provide at least one question range." });
      return;
    }

    const topic = topicRangeTopicId ? topicById.get(topicRangeTopicId) || null : null;
    const subtopic = topic && topicRangeSubtopicId
      ? topic.subtopics.find((item) => item.id === topicRangeSubtopicId) || null
      : null;

    const indexSet = new Set(parsed.indexes);
    setConfig((prev) => ({
      ...prev,
      updatedAt: new Date().toISOString(),
      questions: prev.questions.map((question, index) => (
        indexSet.has(index)
          ? sanitizeQuestionForType({
              ...question,
              topicId: topic ? topic.id : null,
              subtopicId: topic && subtopic ? subtopic.id : null,
            })
          : question
      )),
    }));

    const label = topic
      ? `${topic.name}${subtopic ? ` / ${subtopic.name}` : " / No subtopic"}`
      : "No topic";
    toast({ title: "Topic range applied", description: `Updated ${parsed.indexes.length} questions to ${label}.` });
  };

  const toggleAnswerKeyOption = (question: McqQuestion, optionLabel: string) => {
    if (question.type === "single") {
      setQuestion(question.id, (current) => ({ ...current, correctAnswers: [optionLabel] }));
      return;
    }

    setQuestion(question.id, (current) => {
      const exists = current.correctAnswers.includes(optionLabel);
      return {
        ...current,
        correctAnswers: exists
          ? current.correctAnswers.filter((value) => value !== optionLabel)
          : [...current.correctAnswers, optionLabel],
      };
    });
  };

  const resolveBulkTargetIndexes = (mode: BulkTargetMode, range: string, sectionIds: string[]) => {
    if (mode === "range") {
      const parsed = parseRangeExpression(range, config.questions.length);
      if (parsed.indexes.length === 0) throw new Error("Provide at least one valid question range.");
      return parsed.indexes;
    }

    const cleanedSectionIds = pruneSectionSelections(sectionIds);
    if (cleanedSectionIds.length === 0) throw new Error("Select at least one section.");

    const sectionSet = new Set(cleanedSectionIds);
    const indexes = config.questions
      .map((q, i) => ({ q, i }))
      .filter((item) => sectionSet.has(item.q.sectionId))
      .map((item) => item.i);
    if (indexes.length === 0) throw new Error("Selected section has no mapped questions.");
    return indexes;
  };

  const resolveBulkTypeTargetIndexes = () => {
    if (bulkTypeMode !== "topic") {
      return resolveBulkTargetIndexes(bulkTypeMode, bulkTypeRange, bulkTypeSectionIds);
    }

    const indexes = config.questions
      .map((question, index) => ({ question, index }))
      .filter(({ question }) => {
        if (bulkTypeFilterTopicId === ANY_TOPIC_VALUE) return true;
        if (bulkTypeFilterTopicId === NO_TOPIC_VALUE) return !question.topicId;
        if (question.topicId !== bulkTypeFilterTopicId) return false;

        if (bulkTypeFilterSubtopicId === ANY_SUBTOPIC_FILTER_VALUE) return true;
        if (bulkTypeFilterSubtopicId === NO_SUBTOPIC_VALUE) return !question.subtopicId;
        return question.subtopicId === bulkTypeFilterSubtopicId;
      })
      .map(({ index }) => index);

    if (indexes.length === 0) {
      throw new Error("No questions matched the selected topic/subtopic filter.");
    }

    return indexes;
  };

  const applySectionMapping = () => {
    const ownership = new Map<number, string>();
    const coveredBy = new Map<number, string>();

    try {
      for (const section of config.sections) {
        if (!section.rangeExpression.trim()) continue;
        const parsed = parseRangeExpression(section.rangeExpression, config.questions.length);
        for (const idx of parsed.indexes) {
          const existing = coveredBy.get(idx);
          if (existing && existing !== section.id) {
            const sectionNameA = sectionById.get(existing)?.name || "Another section";
            throw new Error(`Overlap at Q${idx + 1}: "${sectionNameA}" and "${section.name}".`);
          }
          coveredBy.set(idx, section.id);
          ownership.set(idx, section.id);
        }
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Section mapping failed", description: error instanceof Error ? error.message : "Invalid mapping." });
      return;
    }

    const fallback = config.sections[0];
    if (!fallback) return;

    const uncoveredCount = config.questions.filter((_, idx) => !ownership.has(idx)).length;

    setConfig((prev) => ({
      ...prev,
      updatedAt: new Date().toISOString(),
      sections: prev.sections.map((section) => {
        if (!section.rangeExpression.trim()) return section;
        try {
          return { ...section, rangeExpression: parseRangeExpression(section.rangeExpression, prev.questions.length).normalized };
        } catch {
          return section;
        }
      }),
      questions: prev.questions.map((q, idx) => ({ ...q, sectionId: ownership.get(idx) || fallback.id })),
    }));

    toast({ title: "Section ranges applied", description: uncoveredCount > 0 ? `${uncoveredCount} questions were assigned to ${fallback.name}.` : "All questions mapped." });
  };

  const applyBulkType = () => {
    let indexes: number[] = [];
    try {
      indexes = resolveBulkTypeTargetIndexes();
    } catch (error) {
      toast({ variant: "destructive", title: "Bulk update failed", description: error instanceof Error ? error.message : "Invalid target." });
      return;
    }

    const set = new Set(indexes);
    const applyTopicAssignment = bulkTypeAssignTopicId !== KEEP_TOPIC_ASSIGNMENT_VALUE;
    const applySubtopicAssignment = bulkTypeAssignSubtopicId !== KEEP_SUBTOPIC_ASSIGNMENT_VALUE;
    const nextAssignedTopic = bulkTypeAssignTopicId !== NO_TOPIC_VALUE ? (topicById.get(bulkTypeAssignTopicId) || null) : null;
    if (applySubtopicAssignment && !applyTopicAssignment) {
      toast({
        variant: "destructive",
        title: "Bulk update failed",
        description: "Select a topic assignment before applying subtopic assignment.",
      });
      return;
    }
    if (applyTopicAssignment && bulkTypeAssignTopicId !== NO_TOPIC_VALUE && !nextAssignedTopic) {
      toast({
        variant: "destructive",
        title: "Bulk update failed",
        description: "Selected topic assignment is invalid.",
      });
      return;
    }
    if (
      applyTopicAssignment
      && applySubtopicAssignment
      && bulkTypeAssignTopicId !== NO_TOPIC_VALUE
      && bulkTypeAssignSubtopicId !== NO_SUBTOPIC_VALUE
      && !nextAssignedTopic?.subtopics.some((subtopic) => subtopic.id === bulkTypeAssignSubtopicId)
    ) {
      toast({
        variant: "destructive",
        title: "Bulk update failed",
        description: "Selected subtopic does not belong to selected topic assignment.",
      });
      return;
    }
    setConfig((prev) => ({
      ...prev,
      updatedAt: new Date().toISOString(),
      questions: prev.questions.map((q, idx) => {
        if (!set.has(idx)) return q;

        const nextQuestion = {
          ...q,
          type: bulkTypeValue,
          correctAnswers: bulkTypeValue === "single" ? q.correctAnswers.slice(0, 1) : q.correctAnswers,
        };

        if (applyTopicAssignment) {
          if (bulkTypeAssignTopicId === NO_TOPIC_VALUE) {
            return sanitizeQuestionForType({
              ...nextQuestion,
              topicId: null,
              subtopicId: null,
            });
          }

          const nextSubtopicId = applySubtopicAssignment
            ? (bulkTypeAssignSubtopicId === NO_SUBTOPIC_VALUE ? null : bulkTypeAssignSubtopicId)
            : (
                q.subtopicId && nextAssignedTopic?.subtopics.some((subtopic) => subtopic.id === q.subtopicId)
                  ? q.subtopicId
                  : null
              );

          return sanitizeQuestionForType({
            ...nextQuestion,
            topicId: nextAssignedTopic?.id || null,
            subtopicId: nextSubtopicId,
          });
        }

        return sanitizeQuestionForType(nextQuestion);
      }),
    }));

    toast({
      title: "Bulk type applied",
      description: `Updated ${indexes.length} questions${applyTopicAssignment || applySubtopicAssignment ? " with topic mapping." : "."}`,
    });
  };

  const applyBulkScoring = () => {
    let indexes: number[] = [];
    try {
      indexes = resolveBulkTargetIndexes(bulkScoringMode, bulkScoringRange, bulkScoringSectionIds);
    } catch (error) {
      toast({ variant: "destructive", title: "Bulk update failed", description: error instanceof Error ? error.message : "Invalid target." });
      return;
    }

    const set = new Set(indexes);
    const safeMarks = Math.max(1, bulkMarks);
    const safeNeg = Math.max(0, bulkNegativeMarks);

    setConfig((prev) => ({
      ...prev,
      updatedAt: new Date().toISOString(),
      questions: prev.questions.map((q, idx) => {
        if (!set.has(idx)) return q;
        return {
          ...q,
          marks: safeMarks,
          negativeMarks: safeNeg,
          negativeEnabled: safeNeg > 0,
        };
      }),
    }));

    toast({ title: "Bulk scoring applied", description: `Updated ${indexes.length} questions.` });
  };

  const applyBulkPartialMarking = () => {
    let indexes: number[] = [];
    try {
      indexes = resolveBulkTargetIndexes(bulkPartialMode, bulkPartialRange, bulkPartialSectionIds);
    } catch (error) {
      toast({ variant: "destructive", title: "Bulk update failed", description: error instanceof Error ? error.message : "Invalid target." });
      return;
    }

    const set = new Set(indexes);
    const shouldEnable = bulkPartialAction === "enable";
    let updatedCount = 0;

    setConfig((prev) => ({
      ...prev,
      updatedAt: new Date().toISOString(),
      questions: prev.questions.map((q, idx) => {
        if (!set.has(idx)) return q;
        if (q.type !== "multiple") return sanitizeQuestionForType(q);
        updatedCount += 1;
        return {
          ...q,
          partialMarkingEnabled: shouldEnable,
        };
      }),
    }));

    const skipped = indexes.length - updatedCount;
    toast({
      title: "Bulk partial marking applied",
      description: skipped > 0
        ? `${shouldEnable ? "Enabled" : "Disabled"} for ${updatedCount} multiple-select questions. Skipped ${skipped} single-choice questions.`
        : `${shouldEnable ? "Enabled" : "Disabled"} for ${updatedCount} questions.`,
    });
  };

  const getBulkOptionTargetIndexes = () => {
    let indexes: number[] = [];
    try {
      indexes = resolveBulkTargetIndexes(bulkOptionMode, bulkOptionRange, bulkOptionSectionIds);
    } catch (error) {
      toast({ variant: "destructive", title: "Bulk update failed", description: error instanceof Error ? error.message : "Invalid target." });
      return null;
    }
    return indexes;
  };

  const applyBulkOptionCount = () => {
    const indexes = getBulkOptionTargetIndexes();
    if (!indexes) return;
    const set = new Set(indexes);
    const count = Math.max(2, Math.min(8, bulkOptionCount));

    setConfig((prev) => ({
      ...prev,
      updatedAt: new Date().toISOString(),
      questions: prev.questions.map((q, idx) => {
        if (!set.has(idx)) return q;
        return {
          ...q,
          optionCount: count,
        };
      }),
    }));

    toast({ title: "Bulk option count applied", description: `Updated ${indexes.length} questions.` });
  };

  const applyBulkOptionLabelStyle = () => {
    const indexes = getBulkOptionTargetIndexes();
    if (!indexes) return;
    const set = new Set(indexes);

    setConfig((prev) => ({
      ...prev,
      updatedAt: new Date().toISOString(),
      questions: prev.questions.map((q, idx) => {
        if (!set.has(idx)) return q;
        return {
          ...q,
          optionLabelStyle: bulkOptionLabelStyle,
        };
      }),
    }));

    toast({ title: "Bulk option label style applied", description: `Updated ${indexes.length} questions.` });
  };

  const applyBulkDifficulty = () => {
    const indexes = getBulkOptionTargetIndexes();
    if (!indexes) return;
    const set = new Set(indexes);

    setConfig((prev) => ({
      ...prev,
      updatedAt: new Date().toISOString(),
      questions: prev.questions.map((q, idx) => {
        if (!set.has(idx)) return q;
        return {
          ...q,
          difficulty: bulkDifficulty,
        };
      }),
    }));

    toast({ title: "Bulk difficulty applied", description: `Updated ${indexes.length} questions.` });
  };

  const clearDraft = () => {
    const nextDefault = createDefaultConfig();
    setConfig(nextDefault);
    setSelectedQuestionId("");
    setPreviewCursor(0);
    setPreviewState({});
    setPdfFile(null);
    setLinkedPdfUrl("");
    setLinkedPdfName("");
    setTemplateSummary("");
    setTopicNameInput("");
    setSubtopicNameInput("");
    setSelectedTopicId("");
    setTopicRangeExpression("");
    setTopicRangeTopicId("");
    setTopicRangeSubtopicId("");
    setBulkTypeMode("range");
    setBulkTypeRange("");
    setBulkTypeSectionIds([]);
    setBulkTypeFilterTopicId(ANY_TOPIC_VALUE);
    setBulkTypeFilterSubtopicId(ANY_SUBTOPIC_FILTER_VALUE);
    setBulkTypeAssignTopicId(KEEP_TOPIC_ASSIGNMENT_VALUE);
    setBulkTypeAssignSubtopicId(KEEP_SUBTOPIC_ASSIGNMENT_VALUE);
    setEditingTemplateId(null);
    setManualQuestionCount(nextDefault.questions.length);

    setPreviewStarted(false);
    setPreviewTimerDecision("pending");
    setPreviewTimerMinutes(nextDefault.recommendedTimeMinutes);
    setTimerRunning(false);
    setTimerEndAtMs(null);
    setTimerRemainingMs(0);

    try {
      localStorage.removeItem(getDraftStorageKey(teacherEmail));
      localStorage.removeItem(getTimerStorageKey(teacherEmail));
    } catch {
      // ignore
    }

    toast({ title: "Draft cleared", description: "Test draft has been reset." });
  };

  const saveDraftNow = () => {
    const draftKey = getDraftStorageKey(teacherEmail);
    const savedAt = new Date().toISOString();
    try {
      localStorage.setItem(draftKey, JSON.stringify({ config, savedAt, summary: templateSummary }));
      setLastAutoSavedAt(savedAt);
      toast({ title: "Draft saved", description: "Test draft saved locally." });
    } catch {
      toast({ variant: "destructive", title: "Draft save failed", description: "Browser blocked local storage." });
    }
  };

  const exportConfig = () => {
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `mcq-pdf-config-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportAnswerKey = () => {
    const lines = ["Question,Section,Topic,Subtopic,Type,Correct Answers,Marks,Negative Marking,Partial Marking,Difficulty"];
    config.questions.forEach((question, idx) => {
      const questionLabel = formatQuestionNumber(idx, config.numberingStyle);
      const sectionName = sectionById.get(question.sectionId)?.name || "Section";
      const topic = question.topicId ? topicById.get(question.topicId) || null : null;
      const subtopic = topic && question.subtopicId
        ? topic.subtopics.find((item) => item.id === question.subtopicId) || null
        : null;
      const answers = question.correctAnswers.join("|");
      lines.push(
        [
          questionLabel,
          sectionName,
          topic?.name || "",
          subtopic?.name || "",
          question.type,
          answers,
          String(question.marks),
          String(question.negativeMarks > 0 ? question.negativeMarks : 0),
          question.type === "multiple" && question.partialMarkingEnabled ? "enabled" : "disabled",
          question.difficulty,
        ]
          .map((value) => `"${String(value).replace(/"/g, '""')}"`)
          .join(",")
      );
    });

    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `mcq-answer-key-${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importConfig = async (file: File) => {
    try {
      const raw = await file.text();
      const parsed = JSON.parse(raw) as unknown;
      const normalized = normalizeImportedConfig(parsed);
      setConfig(normalized);
      setSelectedQuestionId(normalized.questions[0]?.id || "");
      setSelectedTopicId(normalized.topics[0]?.id || "");
      setSubtopicNameInput("");
      setTopicRangeExpression("");
      setTopicRangeTopicId(normalized.topics[0]?.id || "");
      setTopicRangeSubtopicId("");
      setBulkTypeMode("range");
      setBulkTypeRange("");
      setBulkTypeSectionIds([]);
      setBulkTypeFilterTopicId(ANY_TOPIC_VALUE);
      setBulkTypeFilterSubtopicId(ANY_SUBTOPIC_FILTER_VALUE);
      setBulkTypeAssignTopicId(KEEP_TOPIC_ASSIGNMENT_VALUE);
      setBulkTypeAssignSubtopicId(KEEP_SUBTOPIC_ASSIGNMENT_VALUE);
      setPreviewCursor(0);
      setManualQuestionCount(normalized.questions.length);
      toast({ title: "Config imported", description: "MCQ config imported successfully." });
    } catch (error) {
      toast({ variant: "destructive", title: "Import failed", description: error instanceof Error ? error.message : "Could not import file." });
    }
  };

  const uploadPdfToR2 = async (file: File) => {
    const presignResponse = await fetch('/api/r2-presign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fileName: file.name,
        contentType: file.type,
        fileSize: file.size,
        resourceType: 'mcq-test',
      }),
    });

    const presignData = await presignResponse.json();
    if (!presignResponse.ok || !presignData.success) {
      throw new Error(presignData.error || 'Failed to request upload URL');
    }

    const putResponse = await fetch(presignData.url, {
      method: 'PUT',
      headers: { 'Content-Type': file.type },
      body: file,
      mode: 'cors',
      credentials: 'omit',
    });

    if (!putResponse.ok) {
      throw new Error(`Upload failed for ${file.name}`);
    }

    return {
      pdfUrl: String(presignData.publicUrl || ''),
      pdfName: file.name,
    };
  };

  const saveTemplateCard = async () => {
    if (!config.title.trim()) {
      toast({ title: "Title required", description: `Please enter ${assessmentNounLower} title.`, className: "border-yellow-500 bg-yellow-50 text-yellow-900" });
      return;
    }

    if (config.questions.some((question) => question.correctAnswers.length === 0)) {
      toast({ title: "Answer key incomplete", description: "Set at least one correct answer for every question.", className: "border-yellow-500 bg-yellow-50 text-yellow-900" });
      return;
    }

    let pdfUrl = linkedPdfUrl;
    let pdfName = linkedPdfName;

    try {
      setSavingTemplate(true);
      if (pdfFile) {
        const uploaded = await uploadPdfToR2(pdfFile);
        pdfUrl = uploaded.pdfUrl;
        pdfName = uploaded.pdfName;
      }

      if (!pdfUrl) {
        throw new Error(`Upload or link a PDF before saving ${assessmentNounLower}.`);
      }

      const method = editingTemplateId ? 'PATCH' : 'POST';
      const response = await fetch('/api/teacher/mcq-tests', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...(editingTemplateId ? { id: editingTemplateId } : {}),
          title: config.title.trim(),
          summary: templateSummary.trim(),
          pdfUrl,
          pdfName,
          config,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || `Failed to save ${assessmentNounLower}`);
      }

      setLinkedPdfUrl(pdfUrl);
      setLinkedPdfName(pdfName);
      setPdfFile(null);
      setEditingTemplateId(Number(data.test?.id || data.template?.id || editingTemplateId));
      await fetchTemplates();
      onTemplatesUpdated?.();

      toast({
        title: `${assessmentTypeLabel} saved`,
        description: `MCQ ${assessmentNounLower} is saved and reusable in assignments.`,
        className: 'border-green-500 bg-green-50 text-green-900',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: `${assessmentTypeLabel} save failed`,
        description: error instanceof Error ? error.message : 'Please try again.',
      });
    } finally {
      setSavingTemplate(false);
    }
  };

  const loadTemplateForEdit = useCallback((template: SavedTemplate) => {
    const normalized = normalizeImportedConfig(template.config);
    setConfig(normalized);
    setTemplateSummary(template.summary || '');
    setEditingTemplateId(template.id);
    setLinkedPdfUrl(template.fileUrl || '');
    setLinkedPdfName(template.fileName || '');
    setPdfFile(null);
    setSelectedQuestionId(normalized.questions[0]?.id || '');
    setSelectedTopicId(normalized.topics[0]?.id || "");
    setSubtopicNameInput("");
    setTopicRangeExpression("");
    setTopicRangeTopicId(normalized.topics[0]?.id || "");
    setTopicRangeSubtopicId("");
    setBulkTypeMode("range");
    setBulkTypeRange("");
    setBulkTypeSectionIds([]);
    setBulkTypeFilterTopicId(ANY_TOPIC_VALUE);
    setBulkTypeFilterSubtopicId(ANY_SUBTOPIC_FILTER_VALUE);
    setBulkTypeAssignTopicId(KEEP_TOPIC_ASSIGNMENT_VALUE);
    setBulkTypeAssignSubtopicId(KEEP_SUBTOPIC_ASSIGNMENT_VALUE);
    setManualQuestionCount(normalized.questions.length);
    toast({ title: `${getAssessmentTypeLabel(normalized.assessmentType)} loaded`, description: `Editing ${template.title}` });
  }, [toast]);

  useEffect(() => {
    setManualQuestionCount(config.questions.length);
  }, [config.questions.length]);

  useEffect(() => {
    if (!open) return;
    if (!initialTemplateId) return;
    const match = templates.find((template) => template.id === initialTemplateId);
    if (!match) return;
    if (editingTemplateId === initialTemplateId) return;
    loadTemplateForEdit(match);
  }, [open, initialTemplateId, templates, editingTemplateId, loadTemplateForEdit]);

  const togglePreviewAnswer = (question: McqQuestion, optionLabel: string) => {
    setPreviewState((prev) => {
      const current = prev[question.id] || { selectedAnswers: [], markedForReview: false };
      if (question.type === "single") {
        return { ...prev, [question.id]: { ...current, selectedAnswers: [optionLabel] } };
      }

      const exists = current.selectedAnswers.includes(optionLabel);
      return {
        ...prev,
        [question.id]: {
          ...current,
          selectedAnswers: exists ? current.selectedAnswers.filter((value) => value !== optionLabel) : [...current.selectedAnswers, optionLabel],
        },
      };
    });
  };

  const toggleMarkForReview = (questionId: string) => {
    setPreviewState((prev) => {
      const current = prev[questionId] || { selectedAnswers: [], markedForReview: false };
      return { ...prev, [questionId]: { ...current, markedForReview: !current.markedForReview } };
    });
  };

  const startTimer = () => {
    const minutes = Math.max(1, previewTimerMinutes);
    const startingMs = timerRemainingMs > 0 ? timerRemainingMs : minutes * 60 * 1000;
    setTimerEndAtMs(Date.now() + startingMs);
    setTimerRemainingMs(startingMs);
    setTimerRunning(true);
  };

  const pauseTimer = () => {
    if (timerEndAtMs) setTimerRemainingMs(Math.max(0, timerEndAtMs - Date.now()));
    setTimerRunning(false);
    setTimerEndAtMs(null);
  };

  const resetTimer = () => {
    const next = Math.max(1, previewTimerMinutes) * 60 * 1000;
    setTimerRunning(false);
    setTimerEndAtMs(null);
    setTimerRemainingMs(next);
  };

  const startPreview = () => {
    const requiresTimerChoice = config.assessmentType === "mock-test";
    if (requiresTimerChoice && previewTimerDecision === "pending") {
      toast({ title: "Select timer preference", description: "Choose timed or untimed mode before starting preview." });
      return;
    }
    const effectiveDecision = requiresTimerChoice ? previewTimerDecision : "untimed";

    setPreviewStarted(true);
    setPreviewCursor(0);
    if (effectiveDecision === "timed") {
      const ms = Math.max(1, previewTimerMinutes) * 60 * 1000;
      setTimerRemainingMs(ms);
      setTimerEndAtMs(null);
      setTimerRunning(false);
    } else {
      setTimerRemainingMs(0);
      setTimerEndAtMs(null);
      setTimerRunning(false);
    }
  };

  const restartPreviewSetup = () => {
    setPreviewStarted(false);
    setPreviewCursor(0);
    setTimerRunning(false);
    setTimerEndAtMs(null);
    setTimerRemainingMs(previewTimerDecision === "timed" ? Math.max(1, previewTimerMinutes) * 60 * 1000 : 0);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-screen max-w-[100vw] h-[100dvh] max-h-[100dvh] rounded-none border-0 p-0 overflow-hidden">
        <div className="flex h-full min-h-0 w-full flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-slate-100">
          <DialogHeader className="shrink-0 border-b border-slate-700/80 bg-slate-900/70 px-6 py-4 text-left">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <DialogTitle className="text-2xl font-semibold tracking-tight text-white">MCQ + PDF {assessmentTypeLabel} Builder</DialogTitle>
                <p className="mt-1 text-sm text-slate-300">Create reusable MCQ + PDF {isMockTestType ? "mock tests" : "simple assignments"} and attach them to assignments later.</p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Badge className="bg-blue-600/90 text-white hover:bg-blue-600">Draft {assessmentTypeLabel}</Badge>
                <Badge variant="secondary" className="bg-slate-700 text-slate-100">{config.questions.length} Questions</Badge>
                <Badge variant="secondary" className="bg-slate-700 text-slate-100">{totalPoints} Marks</Badge>
                {lastAutoSavedAt && <span className="text-xs text-slate-300">Auto-saved {new Date(lastAutoSavedAt).toLocaleTimeString()}</span>}
              </div>
            </div>
          </DialogHeader>

          <div className="flex min-h-0 flex-1 overflow-hidden">
            <div className="grid h-full min-h-0 w-full grid-cols-1 grid-rows-[minmax(280px,1fr)_minmax(0,1fr)] lg:grid-cols-[1.45fr_1fr] lg:grid-rows-1">
              <section className="flex min-h-0 flex-col border-r border-slate-700/70 bg-slate-900/60 p-4">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300">PDF Workspace</h3>
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-slate-600 bg-slate-800 px-3 py-2 text-xs font-medium text-slate-100 hover:bg-slate-700">
                    <Upload className="h-3.5 w-3.5" /> Upload PDF
                    <input
                      className="hidden"
                      type="file"
                      accept="application/pdf"
                      onChange={(event) => {
                        const file = event.target.files?.[0] || null;
                        if (file && file.type !== "application/pdf") {
                          toast({ title: "Only PDF is allowed", description: "Please upload a PDF file.", variant: "destructive" });
                          return;
                        }
                        setPdfFile(file);
                        setLinkedPdfUrl("");
                        setLinkedPdfName(file?.name || "");
                      }}
                    />
                  </label>
                </div>

                <div className="min-h-0 flex-1 overflow-hidden rounded-xl border border-slate-700/90 bg-slate-950">
                  {pdfUrl || linkedPdfUrl ? (
                    <iframe src={pdfUrl || linkedPdfUrl} title="Linked PDF" className="h-full w-full" />
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-slate-400">
                      <FileQuestion className="h-10 w-10" />
                      <p className="max-w-sm text-sm">Upload a PDF to build a linked OMR-style MCQ {assessmentNounLower}.</p>
                    </div>
                  )}
                </div>

                {(pdfFile || linkedPdfName) && <p className="mt-2 truncate text-xs text-slate-300">Linked PDF: {pdfFile?.name || linkedPdfName}</p>}
              </section>

              <section className="flex min-h-0 min-w-0 flex-col overflow-hidden bg-slate-900/40 p-4">
                <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "configure" | "answer-key" | "preview")} className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
                  <TabsList className="grid w-full grid-cols-3 bg-slate-800 text-slate-200">
                    <TabsTrigger value="configure" className="data-[state=active]:bg-slate-100 data-[state=active]:text-slate-900">Configure</TabsTrigger>
                    <TabsTrigger value="answer-key" className="data-[state=active]:bg-slate-100 data-[state=active]:text-slate-900">Answer Key</TabsTrigger>
                    <TabsTrigger value="preview" className="data-[state=active]:bg-slate-100 data-[state=active]:text-slate-900">Preview</TabsTrigger>
                  </TabsList>

                  {activeTab === "configure" && (
                    <TabsContent value="configure" className="mt-3 flex min-h-0 flex-1 flex-col overflow-hidden">
                      <div className="flex-1 min-h-0 overflow-y-auto space-y-4 pb-8 pr-2">
                        <Card className="border-slate-700 bg-slate-900/80">
                          <CardContent className="space-y-3 p-4">
                            <div className="grid gap-3 md:grid-cols-3">
                              <div>
                                <Label htmlFor="mcq-title" className="text-slate-200">Test Title</Label>
                                <Input id="mcq-title" value={config.title} onChange={(e) => setConfig((p) => ({ ...p, title: e.target.value, updatedAt: new Date().toISOString() }))} className="border-slate-700 bg-slate-950 text-slate-100" />
                              </div>
                              <div>
                                <Label className="text-slate-200">Select Type</Label>
                                <Select
                                  value={config.assessmentType}
                                  onValueChange={(value) =>
                                    setConfig((p) => ({ ...p, assessmentType: value as AssessmentType, updatedAt: new Date().toISOString() }))
                                  }
                                >
                                  <SelectTrigger className="border-slate-700 bg-slate-950 text-slate-100"><SelectValue /></SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="mock-test">Mock Test</SelectItem>
                                    <SelectItem value="simple-assignment">Simple Assignment</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label className="text-slate-200">Question Number Format</Label>
                                <Select value={config.numberingStyle} onValueChange={(value) => setConfig((p) => ({ ...p, numberingStyle: value as QuestionNumberingStyle, updatedAt: new Date().toISOString() }))}>
                                  <SelectTrigger className="border-slate-700 bg-slate-950 text-slate-100"><SelectValue /></SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="numeric">1, 2, 3</SelectItem>
                                    <SelectItem value="alpha-upper">A, B, C</SelectItem>
                                    <SelectItem value="roman-lower">i, ii, iii</SelectItem>
                                    <SelectItem value="roman-upper">I, II, III</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>

                            <div>
                              <Label htmlFor="template-summary" className="text-slate-200">Test Notes</Label>
                              <Input id="template-summary" value={templateSummary} onChange={(e) => setTemplateSummary(e.target.value)} className="border-slate-700 bg-slate-950 text-slate-100" />
                            </div>

                            <div>
                              <Label htmlFor="mcq-description" className="text-slate-200">Description</Label>
                              <Textarea id="mcq-description" value={config.description} onChange={(e) => setConfig((p) => ({ ...p, description: e.target.value, updatedAt: new Date().toISOString() }))} rows={3} className="border-slate-700 bg-slate-950 text-slate-100" />
                            </div>

                            <div className="grid gap-3 md:grid-cols-2">
                              <div className="space-y-2 rounded-md border border-blue-500/30 bg-blue-500/10 px-3 py-2 text-sm text-blue-100">
                                <div>Recommended time: <strong>{recommendedTimeMinutes} min</strong></div>
                                <div className="flex flex-wrap items-end gap-2">
                                  <div className="w-28">
                                    <Label className="text-[11px] text-blue-100/90">Minutes</Label>
                                    <Input
                                      type="number"
                                      min={1}
                                      max={600}
                                      value={recommendedTimeMinutes}
                                      onChange={(e) => {
                                        const value = Math.max(1, Math.min(600, Number(e.target.value) || 1));
                                        setConfig((prev) => ({
                                          ...prev,
                                          recommendedTimeMode: "manual",
                                          recommendedTimeMinutes: value,
                                          updatedAt: new Date().toISOString(),
                                        }));
                                      }}
                                      className="border-blue-400/40 bg-slate-950 text-slate-100"
                                    />
                                  </div>
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    className="border-blue-400/40 bg-slate-950 text-blue-100 hover:bg-slate-800"
                                    onClick={() =>
                                      setConfig((prev) => ({
                                        ...prev,
                                        recommendedTimeMode: "auto",
                                        recommendedTimeMinutes: getAutoRecommendedTimeMinutes(prev.questions, prev.autoTimeFormula),
                                        updatedAt: new Date().toISOString(),
                                      }))
                                    }
                                  >
                                    Use Auto
                                  </Button>
                                  <span className="text-[11px] text-blue-100/80">Auto formula: {autoFormulaSummary}</span>
                                </div>
                                <div className="rounded-md border border-blue-400/30 bg-slate-900/50 p-2">
                                  <div className="mb-2 flex flex-wrap items-center gap-2">
                                    <Label className="text-[11px] text-blue-100/90">Auto Formula Mode</Label>
                                    <Select
                                      value={config.autoTimeFormula.mode}
                                      onValueChange={(value) =>
                                        updateAutoTimeFormula((formula) => ({ ...formula, mode: value as AutoFormulaMode }))
                                      }
                                    >
                                      <SelectTrigger className="h-8 w-[220px] border-blue-400/40 bg-slate-950 text-slate-100">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="per-question">Per question (same for all)</SelectItem>
                                        <SelectItem value="section">By section</SelectItem>
                                        <SelectItem value="difficulty">By difficulty</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <p className="mb-2 text-[11px] text-blue-100/80">
                                    Time is calculated question-by-question using this mode, then summed as total recommended minutes.
                                  </p>

                                  {config.autoTimeFormula.mode === "per-question" && (
                                    <div className="max-w-[220px]">
                                      <Label className="text-[11px] text-blue-100/90">Minutes per question</Label>
                                      <Input
                                        type="number"
                                        min={0.1}
                                        max={60}
                                        step="0.1"
                                        value={config.autoTimeFormula.defaultMinutesPerQuestion}
                                        onChange={(e) => {
                                          const value = clampAutoMinutesValue(e.target.value, AUTO_RECOMMENDED_PER_QUESTION);
                                          updateAutoTimeFormula((formula) => ({ ...formula, defaultMinutesPerQuestion: value }));
                                        }}
                                        className="h-8 border-blue-400/40 bg-slate-950 text-slate-100"
                                      />
                                    </div>
                                  )}

                                  {config.autoTimeFormula.mode === "section" && (
                                    <div className="grid gap-2 md:grid-cols-2">
                                      {config.sections.map((section) => (
                                        <div key={`formula-section-${section.id}`}>
                                          <Label className="text-[11px] text-blue-100/90">{section.name} (min / question)</Label>
                                          <Input
                                            type="number"
                                            min={0.1}
                                            max={60}
                                            step="0.1"
                                            value={clampAutoMinutesValue(config.autoTimeFormula.sectionMinutesPerQuestion[section.id], config.autoTimeFormula.defaultMinutesPerQuestion)}
                                            onChange={(e) => {
                                              const value = clampAutoMinutesValue(e.target.value, config.autoTimeFormula.defaultMinutesPerQuestion);
                                              updateAutoTimeFormula((formula) => ({
                                                ...formula,
                                                sectionMinutesPerQuestion: { ...formula.sectionMinutesPerQuestion, [section.id]: value },
                                              }));
                                            }}
                                            className="h-8 border-blue-400/40 bg-slate-950 text-slate-100"
                                          />
                                        </div>
                                      ))}
                                    </div>
                                  )}

                                  {config.autoTimeFormula.mode === "difficulty" && (
                                    <div className="grid gap-2 md:grid-cols-3">
                                      {(["easy", "medium", "hard"] as Difficulty[]).map((difficulty) => (
                                        <div key={`formula-difficulty-${difficulty}`}>
                                          <Label className="text-[11px] text-blue-100/90">{difficulty[0].toUpperCase() + difficulty.slice(1)} (min / question)</Label>
                                          <Input
                                            type="number"
                                            min={0.1}
                                            max={60}
                                            step="0.1"
                                            value={config.autoTimeFormula.difficultyMinutesPerQuestion[difficulty]}
                                            onChange={(e) => {
                                              const value = clampAutoMinutesValue(e.target.value, DEFAULT_DIFFICULTY_MINUTES[difficulty]);
                                              updateAutoTimeFormula((formula) => ({
                                                ...formula,
                                                difficultyMinutesPerQuestion: {
                                                  ...formula.difficultyMinutesPerQuestion,
                                                  [difficulty]: value,
                                                },
                                              }));
                                            }}
                                            className="h-8 border-blue-400/40 bg-slate-950 text-slate-100"
                                          />
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="space-y-2">
                                <div className="w-full max-w-[180px]">
                                  <Label className="text-xs text-slate-300">Total questions</Label>
                                  <Input
                                    type="number"
                                    min={1}
                                    max={500}
                                    value={manualQuestionCount}
                                    onChange={(e) => setManualQuestionCount(Math.max(1, Number(e.target.value) || 1))}
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") setQuestionCount(manualQuestionCount);
                                    }}
                                    className="border-slate-700 bg-slate-950 text-slate-100"
                                  />
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                  <Button type="button" variant="outline" className="border-slate-600 bg-slate-950 text-slate-100 hover:bg-slate-800" onClick={() => setQuestionCount(manualQuestionCount)}>Apply</Button>
                                  <Button type="button" variant="outline" className="border-slate-600 bg-slate-950 text-slate-100 hover:bg-slate-800" onClick={() => setQuestionCount(config.questions.length - 1)}>-1</Button>
                                  <Button type="button" variant="outline" className="border-slate-600 bg-slate-950 text-slate-100 hover:bg-slate-800" onClick={() => setQuestionCount(config.questions.length - 5)}>-5</Button>
                                  <Button type="button" variant="outline" className="border-slate-600 bg-slate-950 text-slate-100 hover:bg-slate-800" onClick={() => setQuestionCount(config.questions.length + 5)}>+5</Button>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="border-slate-700 bg-slate-900/80">
                          <CardContent className="space-y-3 p-4">
                            <div className="flex items-center justify-between">
                              <h4 className="text-sm font-semibold text-slate-200">Section Settings (Range Mapping)</h4>
                              <div className="flex items-center gap-2">
                                <Button type="button" size="sm" variant="outline" className="border-slate-600 bg-slate-950 text-slate-100 hover:bg-slate-800" onClick={addSection}>+ Add Section</Button>
                                <Button type="button" size="sm" className="bg-blue-600 hover:bg-blue-500" onClick={applySectionMapping}>Apply Ranges</Button>
                              </div>
                            </div>
                            <p className="text-xs text-slate-300">Use ranges like <code>1-2, 5-9</code>. Overlaps are blocked.</p>
                            <div className="space-y-3">
                              {config.sections.map((section) => (
                                <div key={section.id} className="rounded-md border border-slate-700 bg-slate-950 p-3">
                                  <div className="mb-2 grid gap-2 md:grid-cols-[1fr_1fr_auto] md:items-center">
                                    <div className="flex items-center gap-2">
                                      <span className="inline-block h-3 w-3 rounded-full" style={{ backgroundColor: section.color }} />
                                      <Input value={section.name} onChange={(e) => setSection(section.id, (c) => ({ ...c, name: e.target.value }))} className="border-slate-700 bg-slate-900 text-slate-100" />
                                    </div>
                                    <Input value={section.rangeExpression} onChange={(e) => setSection(section.id, (c) => ({ ...c, rangeExpression: e.target.value }))} placeholder="1-2, 5-9" className="border-slate-700 bg-slate-900 text-slate-100" />
                                    <Button type="button" variant="ghost" size="sm" className="text-red-300 hover:bg-red-500/10 hover:text-red-200" onClick={() => removeSection(section.id)}>Remove</Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="border-slate-700 bg-slate-900/80">
                          <CardContent className="space-y-4 p-4">
                            <h4 className="text-sm font-semibold text-slate-200">Topic &amp; Subtopic Mapping</h4>
                            <p className="text-xs text-slate-300">
                              Add topics first. Subtopics are only available under a selected topic. Then use question range mapping to label questions.
                            </p>

                            <div className="grid gap-2 md:grid-cols-[minmax(0,1fr)_auto]">
                              <Input
                                value={topicNameInput}
                                onChange={(e) => setTopicNameInput(e.target.value)}
                                placeholder="Add topic (e.g., Algebra)"
                                className="border-slate-700 bg-slate-900 text-slate-100"
                              />
                              <Button type="button" className="bg-blue-600 hover:bg-blue-500" onClick={addTopic}>Add Topic</Button>
                            </div>

                            <div className="grid gap-3 md:grid-cols-2">
                              <div className="space-y-2">
                                <Label className="text-xs text-slate-300">Topics</Label>
                                <div className="space-y-2 rounded-md border border-slate-700 bg-slate-950 p-2">
                                  {config.topics.length === 0 ? (
                                    <p className="text-xs text-slate-400">No topics added yet.</p>
                                  ) : (
                                    config.topics.map((topic) => {
                                      const active = topic.id === selectedTopicId;
                                      return (
                                        <div key={topic.id} className="flex items-center justify-between gap-2 rounded-md border border-slate-700 bg-slate-900 px-2 py-1.5">
                                          <button
                                            type="button"
                                            className={`min-w-0 truncate text-left text-sm ${active ? "text-blue-300" : "text-slate-100"}`}
                                            onClick={() => setSelectedTopicId(topic.id)}
                                          >
                                            {topic.name}
                                          </button>
                                          <Button type="button" size="sm" variant="ghost" className="text-red-300 hover:bg-red-500/10 hover:text-red-200" onClick={() => removeTopic(topic.id)}>Remove</Button>
                                        </div>
                                      );
                                    })
                                  )}
                                </div>
                              </div>

                              <div className="space-y-2">
                                <Label className="text-xs text-slate-300">Subtopics</Label>
                                {!selectedTopic ? (
                                  <div className="rounded-md border border-slate-700 bg-slate-950 p-2 text-xs text-slate-400">Select a topic to add subtopics.</div>
                                ) : (
                                  <div className="space-y-2 rounded-md border border-slate-700 bg-slate-950 p-2">
                                    <div className="grid gap-2 md:grid-cols-[minmax(0,1fr)_auto]">
                                      <Input
                                        value={subtopicNameInput}
                                        onChange={(e) => setSubtopicNameInput(e.target.value)}
                                        placeholder={`Add subtopic under ${selectedTopic.name}`}
                                        className="border-slate-700 bg-slate-900 text-slate-100"
                                      />
                                      <Button type="button" className="bg-blue-600 hover:bg-blue-500" onClick={addSubtopic}>Add Subtopic</Button>
                                    </div>
                                    {selectedTopic.subtopics.length === 0 ? (
                                      <p className="text-xs text-slate-400">No subtopics yet for this topic.</p>
                                    ) : (
                                      <div className="space-y-1">
                                        {selectedTopic.subtopics.map((subtopic) => (
                                          <div key={subtopic.id} className="flex items-center justify-between gap-2 rounded-md border border-slate-700 bg-slate-900 px-2 py-1.5">
                                            <p className="min-w-0 truncate text-sm text-slate-100">{subtopic.name}</p>
                                            <Button type="button" size="sm" variant="ghost" className="text-red-300 hover:bg-red-500/10 hover:text-red-200" onClick={() => removeSubtopic(selectedTopic.id, subtopic.id)}>Remove</Button>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto] md:items-end">
                              <div>
                                <Label className="text-xs text-slate-300">Range</Label>
                                <Input
                                  value={topicRangeExpression}
                                  onChange={(e) => setTopicRangeExpression(e.target.value)}
                                  placeholder="1-10, 14, 18-20"
                                  className="border-slate-700 bg-slate-900 text-slate-100"
                                />
                              </div>
                              <div>
                                <Label className="text-xs text-slate-300">Topic</Label>
                                <Select
                                  value={topicRangeTopicId || NO_TOPIC_VALUE}
                                  onValueChange={(value) => {
                                    const nextTopicId = value === NO_TOPIC_VALUE ? "" : value;
                                    setTopicRangeTopicId(nextTopicId);
                                    setTopicRangeSubtopicId("");
                                  }}
                                >
                                  <SelectTrigger className="border-slate-700 bg-slate-900 text-slate-100"><SelectValue /></SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value={NO_TOPIC_VALUE}>No topic (null)</SelectItem>
                                    {config.topics.map((topic) => (
                                      <SelectItem key={topic.id} value={topic.id}>{topic.name}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label className="text-xs text-slate-300">Subtopic</Label>
                                <Select
                                  value={topicRangeSubtopicId || NO_SUBTOPIC_VALUE}
                                  onValueChange={(value) => setTopicRangeSubtopicId(value === NO_SUBTOPIC_VALUE ? "" : value)}
                                  disabled={!selectedRangeTopic}
                                >
                                  <SelectTrigger className="border-slate-700 bg-slate-900 text-slate-100"><SelectValue /></SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value={NO_SUBTOPIC_VALUE}>No subtopic (null)</SelectItem>
                                    {(selectedRangeTopic?.subtopics || []).map((subtopic) => (
                                      <SelectItem key={subtopic.id} value={subtopic.id}>{subtopic.name}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <Button type="button" className="bg-blue-600 hover:bg-blue-500" onClick={applyTopicRangeMapping}>Apply Range</Button>
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="border-slate-700 bg-slate-900/80">
                          <CardContent className="space-y-4 p-4">
                            <h4 className="text-sm font-semibold text-slate-200">Bulk Question Type</h4>
                            <div className="grid gap-3 md:grid-cols-2">
                              <div>
                                <Label className="text-xs text-slate-300">Target Mode</Label>
                                <Select value={bulkTypeMode} onValueChange={(v) => setBulkTypeMode(v as BulkTypeTargetMode)}>
                                  <SelectTrigger className="border-slate-700 bg-slate-900 text-slate-100"><SelectValue /></SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="range">By Range</SelectItem>
                                    <SelectItem value="section">By Section</SelectItem>
                                    <SelectItem value="topic">By Topic/Subtopic</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              {bulkTypeMode === "range" ? (
                                <div><Label className="text-xs text-slate-300">Range</Label><Input value={bulkTypeRange} onChange={(e) => setBulkTypeRange(e.target.value)} placeholder="1-10, 12-15" className="border-slate-700 bg-slate-900 text-slate-100" /></div>
                              ) : bulkTypeMode === "section" ? (
                                <div>
                                  <Label className="text-xs text-slate-300">Sections</Label>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button type="button" variant="outline" className="w-full justify-between border-slate-700 bg-slate-900 text-slate-100 hover:bg-slate-800">
                                        <span className="truncate">{getSectionSelectionLabel(bulkTypeSectionIds)}</span>
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="start" className="w-[var(--radix-dropdown-menu-trigger-width)] min-w-[220px] border-slate-700 bg-slate-950 text-slate-100">
                                      <DropdownMenuCheckboxItem
                                        className="pl-9 [&>span]:rounded-[3px] [&>span]:border [&>span]:border-slate-500 [&>span]:bg-slate-900 data-[state=checked]:[&>span]:border-blue-400 data-[state=checked]:[&>span]:bg-blue-500/25"
                                        checked={config.sections.length > 0 && pruneSectionSelections(bulkTypeSectionIds).length === config.sections.length}
                                        onSelect={(event) => event.preventDefault()}
                                        onCheckedChange={() => setBulkTypeSectionIds((prev) => {
                                          const isAllSelected = config.sections.length > 0 && pruneSectionSelections(prev).length === config.sections.length;
                                          return isAllSelected ? [] : config.sections.map((section) => section.id);
                                        })}
                                      >
                                        Select all
                                      </DropdownMenuCheckboxItem>
                                      <DropdownMenuItem onSelect={(event) => { event.preventDefault(); setBulkTypeSectionIds([]); }}>Clear</DropdownMenuItem>
                                      <DropdownMenuSeparator className="bg-slate-700" />
                                      {config.sections.map((section) => (
                                        <DropdownMenuCheckboxItem
                                          key={section.id}
                                          className="pl-9 [&>span]:rounded-[3px] [&>span]:border [&>span]:border-slate-500 [&>span]:bg-slate-900 data-[state=checked]:[&>span]:border-blue-400 data-[state=checked]:[&>span]:bg-blue-500/25"
                                          checked={bulkTypeSectionIds.includes(section.id)}
                                          onSelect={(event) => event.preventDefault()}
                                          onCheckedChange={() => setBulkTypeSectionIds((prev) => toggleSectionSelection(prev, section.id))}
                                        >
                                          {section.name}
                                        </DropdownMenuCheckboxItem>
                                      ))}
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              ) : (
                                <div className="grid gap-3 md:grid-cols-2 md:col-span-2">
                                  <div>
                                    <Label className="text-xs text-slate-300">Filter Topic</Label>
                                    <Select
                                      value={bulkTypeFilterTopicId}
                                      onValueChange={(value) => {
                                        setBulkTypeFilterTopicId(value);
                                        setBulkTypeFilterSubtopicId(ANY_SUBTOPIC_FILTER_VALUE);
                                      }}
                                    >
                                      <SelectTrigger className="border-slate-700 bg-slate-900 text-slate-100"><SelectValue /></SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value={ANY_TOPIC_VALUE}>Any topic</SelectItem>
                                        <SelectItem value={NO_TOPIC_VALUE}>No topic (null)</SelectItem>
                                        {config.topics.map((topic) => (
                                          <SelectItem key={topic.id} value={topic.id}>{topic.name}</SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div>
                                    <Label className="text-xs text-slate-300">Filter Subtopic</Label>
                                    <Select
                                      value={bulkTypeFilterSubtopicId}
                                      onValueChange={setBulkTypeFilterSubtopicId}
                                      disabled={!selectedBulkTypeFilterTopic}
                                    >
                                      <SelectTrigger className="border-slate-700 bg-slate-900 text-slate-100"><SelectValue /></SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value={ANY_SUBTOPIC_FILTER_VALUE}>Any subtopic</SelectItem>
                                        <SelectItem value={NO_SUBTOPIC_VALUE}>No subtopic (null)</SelectItem>
                                        {(selectedBulkTypeFilterTopic?.subtopics || []).map((subtopic) => (
                                          <SelectItem key={subtopic.id} value={subtopic.id}>{subtopic.name}</SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                              )}
                            </div>
                            <div className="grid gap-3 md:grid-cols-3">
                              <div><Label className="text-xs text-slate-300">Type</Label><Select value={bulkTypeValue} onValueChange={(v) => setBulkTypeValue(v as QuestionType)}><SelectTrigger className="border-slate-700 bg-slate-900 text-slate-100"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="single">Single correct</SelectItem><SelectItem value="multiple">Multiple correct</SelectItem></SelectContent></Select></div>
                              <div>
                                <Label className="text-xs text-slate-300">Assign Topic</Label>
                                <Select
                                  value={bulkTypeAssignTopicId}
                                  onValueChange={(value) => {
                                    setBulkTypeAssignTopicId(value);
                                    setBulkTypeAssignSubtopicId(KEEP_SUBTOPIC_ASSIGNMENT_VALUE);
                                  }}
                                >
                                  <SelectTrigger className="border-slate-700 bg-slate-900 text-slate-100"><SelectValue /></SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value={KEEP_TOPIC_ASSIGNMENT_VALUE}>Keep existing</SelectItem>
                                    <SelectItem value={NO_TOPIC_VALUE}>No topic (null)</SelectItem>
                                    {config.topics.map((topic) => (
                                      <SelectItem key={topic.id} value={topic.id}>{topic.name}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label className="text-xs text-slate-300">Assign Subtopic</Label>
                                <Select
                                  value={bulkTypeAssignSubtopicId}
                                  onValueChange={setBulkTypeAssignSubtopicId}
                                  disabled={!selectedBulkTypeAssignTopic || bulkTypeAssignTopicId === NO_TOPIC_VALUE}
                                >
                                  <SelectTrigger className="border-slate-700 bg-slate-900 text-slate-100"><SelectValue /></SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value={KEEP_SUBTOPIC_ASSIGNMENT_VALUE}>Keep existing</SelectItem>
                                    <SelectItem value={NO_SUBTOPIC_VALUE}>No subtopic (null)</SelectItem>
                                    {(selectedBulkTypeAssignTopic?.subtopics || []).map((subtopic) => (
                                      <SelectItem key={subtopic.id} value={subtopic.id}>{subtopic.name}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                            <div className="flex justify-end">
                              <Button type="button" className="bg-blue-600 hover:bg-blue-500" onClick={applyBulkType}>Apply</Button>
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="border-slate-700 bg-slate-900/80">
                          <CardContent className="space-y-4 p-4">
                            <h4 className="text-sm font-semibold text-slate-200">Bulk Marks + Negative</h4>
                            <div className="grid gap-3 md:grid-cols-2">
                              <div>
                                <Label className="text-xs text-slate-300">Target Mode</Label>
                                <Select value={bulkScoringMode} onValueChange={(v) => setBulkScoringMode(v as BulkTargetMode)}>
                                  <SelectTrigger className="border-slate-700 bg-slate-900 text-slate-100"><SelectValue /></SelectTrigger>
                                  <SelectContent><SelectItem value="range">By Range</SelectItem><SelectItem value="section">By Section</SelectItem></SelectContent>
                                </Select>
                              </div>
                              {bulkScoringMode === "range" ? (
                                <div><Label className="text-xs text-slate-300">Range</Label><Input value={bulkScoringRange} onChange={(e) => setBulkScoringRange(e.target.value)} placeholder="1-10, 12-15" className="border-slate-700 bg-slate-900 text-slate-100" /></div>
                              ) : (
                                <div>
                                  <Label className="text-xs text-slate-300">Sections</Label>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button type="button" variant="outline" className="w-full justify-between border-slate-700 bg-slate-900 text-slate-100 hover:bg-slate-800">
                                        <span className="truncate">{getSectionSelectionLabel(bulkScoringSectionIds)}</span>
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="start" className="w-[var(--radix-dropdown-menu-trigger-width)] min-w-[220px] border-slate-700 bg-slate-950 text-slate-100">
                                      <DropdownMenuCheckboxItem
                                        className="pl-9 [&>span]:rounded-[3px] [&>span]:border [&>span]:border-slate-500 [&>span]:bg-slate-900 data-[state=checked]:[&>span]:border-blue-400 data-[state=checked]:[&>span]:bg-blue-500/25"
                                        checked={config.sections.length > 0 && pruneSectionSelections(bulkScoringSectionIds).length === config.sections.length}
                                        onSelect={(event) => event.preventDefault()}
                                        onCheckedChange={() => setBulkScoringSectionIds((prev) => {
                                          const isAllSelected = config.sections.length > 0 && pruneSectionSelections(prev).length === config.sections.length;
                                          return isAllSelected ? [] : config.sections.map((section) => section.id);
                                        })}
                                      >
                                        Select all
                                      </DropdownMenuCheckboxItem>
                                      <DropdownMenuItem onSelect={(event) => { event.preventDefault(); setBulkScoringSectionIds([]); }}>Clear</DropdownMenuItem>
                                      <DropdownMenuSeparator className="bg-slate-700" />
                                      {config.sections.map((section) => (
                                        <DropdownMenuCheckboxItem
                                          key={section.id}
                                          className="pl-9 [&>span]:rounded-[3px] [&>span]:border [&>span]:border-slate-500 [&>span]:bg-slate-900 data-[state=checked]:[&>span]:border-blue-400 data-[state=checked]:[&>span]:bg-blue-500/25"
                                          checked={bulkScoringSectionIds.includes(section.id)}
                                          onSelect={(event) => event.preventDefault()}
                                          onCheckedChange={() => setBulkScoringSectionIds((prev) => toggleSectionSelection(prev, section.id))}
                                        >
                                          {section.name}
                                        </DropdownMenuCheckboxItem>
                                      ))}
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              )}
                            </div>
                            <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto] md:items-end">
                              <div><Label className="text-xs text-slate-300">Marks</Label><Input type="number" min={1} value={bulkMarks} onChange={(e) => setBulkMarks(Math.max(1, Number(e.target.value) || 1))} className="border-slate-700 bg-slate-900 text-slate-100" /></div>
                              <div><Label className="text-xs text-slate-300">Negative marks (0 = disabled)</Label><Input type="number" min={0} step="0.25" value={bulkNegativeMarks} onChange={(e) => setBulkNegativeMarks(Math.max(0, Number(e.target.value) || 0))} className="border-slate-700 bg-slate-900 text-slate-100" /></div>
                              <Button type="button" className="bg-blue-600 hover:bg-blue-500" onClick={applyBulkScoring}>Apply</Button>
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="border-slate-700 bg-slate-900/80">
                          <CardContent className="space-y-4 p-4">
                            <h4 className="text-sm font-semibold text-slate-200">Bulk Partial Marking (Multiple Select Only)</h4>
                            <div className="grid gap-3 md:grid-cols-2">
                              <div>
                                <Label className="text-xs text-slate-300">Target Mode</Label>
                                <Select value={bulkPartialMode} onValueChange={(v) => setBulkPartialMode(v as BulkTargetMode)}>
                                  <SelectTrigger className="border-slate-700 bg-slate-900 text-slate-100"><SelectValue /></SelectTrigger>
                                  <SelectContent><SelectItem value="range">By Range</SelectItem><SelectItem value="section">By Section</SelectItem></SelectContent>
                                </Select>
                              </div>
                              {bulkPartialMode === "range" ? (
                                <div><Label className="text-xs text-slate-300">Range</Label><Input value={bulkPartialRange} onChange={(e) => setBulkPartialRange(e.target.value)} placeholder="1-10, 12-15" className="border-slate-700 bg-slate-900 text-slate-100" /></div>
                              ) : (
                                <div>
                                  <Label className="text-xs text-slate-300">Sections</Label>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button type="button" variant="outline" className="w-full justify-between border-slate-700 bg-slate-900 text-slate-100 hover:bg-slate-800">
                                        <span className="truncate">{getSectionSelectionLabel(bulkPartialSectionIds)}</span>
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="start" className="w-[var(--radix-dropdown-menu-trigger-width)] min-w-[220px] border-slate-700 bg-slate-950 text-slate-100">
                                      <DropdownMenuCheckboxItem
                                        className="pl-9 [&>span]:rounded-[3px] [&>span]:border [&>span]:border-slate-500 [&>span]:bg-slate-900 data-[state=checked]:[&>span]:border-blue-400 data-[state=checked]:[&>span]:bg-blue-500/25"
                                        checked={config.sections.length > 0 && pruneSectionSelections(bulkPartialSectionIds).length === config.sections.length}
                                        onSelect={(event) => event.preventDefault()}
                                        onCheckedChange={() => setBulkPartialSectionIds((prev) => {
                                          const isAllSelected = config.sections.length > 0 && pruneSectionSelections(prev).length === config.sections.length;
                                          return isAllSelected ? [] : config.sections.map((section) => section.id);
                                        })}
                                      >
                                        Select all
                                      </DropdownMenuCheckboxItem>
                                      <DropdownMenuItem onSelect={(event) => { event.preventDefault(); setBulkPartialSectionIds([]); }}>Clear</DropdownMenuItem>
                                      <DropdownMenuSeparator className="bg-slate-700" />
                                      {config.sections.map((section) => (
                                        <DropdownMenuCheckboxItem
                                          key={section.id}
                                          className="pl-9 [&>span]:rounded-[3px] [&>span]:border [&>span]:border-slate-500 [&>span]:bg-slate-900 data-[state=checked]:[&>span]:border-blue-400 data-[state=checked]:[&>span]:bg-blue-500/25"
                                          checked={bulkPartialSectionIds.includes(section.id)}
                                          onSelect={(event) => event.preventDefault()}
                                          onCheckedChange={() => setBulkPartialSectionIds((prev) => toggleSectionSelection(prev, section.id))}
                                        >
                                          {section.name}
                                        </DropdownMenuCheckboxItem>
                                      ))}
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              )}
                            </div>
                            <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
                              <div>
                                <Label className="text-xs text-slate-300">Action</Label>
                                <Select value={bulkPartialAction} onValueChange={(value) => setBulkPartialAction(value as "enable" | "disable")}>
                                  <SelectTrigger className="border-slate-700 bg-slate-900 text-slate-100"><SelectValue /></SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="enable">Enable Partial Marking</SelectItem>
                                    <SelectItem value="disable">Disable Partial Marking</SelectItem>
                                  </SelectContent>
                                </Select>
                                <p className="mt-1 text-[11px] text-slate-300">Applies only to Multiple Select. Single Choice is always ignored.</p>
                              </div>
                              <Button type="button" className="bg-blue-600 hover:bg-blue-500" onClick={applyBulkPartialMarking}>Apply Action</Button>
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="border-slate-700 bg-slate-900/80">
                          <CardContent className="space-y-4 p-4">
                            <h4 className="text-sm font-semibold text-slate-200">Bulk Option Count</h4>
                            <div className="grid gap-3 md:grid-cols-2">
                              <div>
                                <Label className="text-xs text-slate-300">Target Mode</Label>
                                <Select value={bulkOptionMode} onValueChange={(v) => setBulkOptionMode(v as BulkTargetMode)}>
                                  <SelectTrigger className="border-slate-700 bg-slate-900 text-slate-100"><SelectValue /></SelectTrigger>
                                  <SelectContent><SelectItem value="range">By Range</SelectItem><SelectItem value="section">By Section</SelectItem></SelectContent>
                                </Select>
                              </div>
                              {bulkOptionMode === "range" ? (
                                <div><Label className="text-xs text-slate-300">Range</Label><Input value={bulkOptionRange} onChange={(e) => setBulkOptionRange(e.target.value)} placeholder="1-10, 12-15" className="border-slate-700 bg-slate-900 text-slate-100" /></div>
                              ) : (
                                <div>
                                  <Label className="text-xs text-slate-300">Sections</Label>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button type="button" variant="outline" className="w-full justify-between border-slate-700 bg-slate-900 text-slate-100 hover:bg-slate-800">
                                        <span className="truncate">{getSectionSelectionLabel(bulkOptionSectionIds)}</span>
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="start" className="w-[var(--radix-dropdown-menu-trigger-width)] min-w-[220px] border-slate-700 bg-slate-950 text-slate-100">
                                      <DropdownMenuCheckboxItem
                                        className="pl-9 [&>span]:rounded-[3px] [&>span]:border [&>span]:border-slate-500 [&>span]:bg-slate-900 data-[state=checked]:[&>span]:border-blue-400 data-[state=checked]:[&>span]:bg-blue-500/25"
                                        checked={config.sections.length > 0 && pruneSectionSelections(bulkOptionSectionIds).length === config.sections.length}
                                        onSelect={(event) => event.preventDefault()}
                                        onCheckedChange={() => setBulkOptionSectionIds((prev) => {
                                          const isAllSelected = config.sections.length > 0 && pruneSectionSelections(prev).length === config.sections.length;
                                          return isAllSelected ? [] : config.sections.map((section) => section.id);
                                        })}
                                      >
                                        Select all
                                      </DropdownMenuCheckboxItem>
                                      <DropdownMenuItem onSelect={(event) => { event.preventDefault(); setBulkOptionSectionIds([]); }}>Clear</DropdownMenuItem>
                                      <DropdownMenuSeparator className="bg-slate-700" />
                                      {config.sections.map((section) => (
                                        <DropdownMenuCheckboxItem
                                          key={section.id}
                                          className="pl-9 [&>span]:rounded-[3px] [&>span]:border [&>span]:border-slate-500 [&>span]:bg-slate-900 data-[state=checked]:[&>span]:border-blue-400 data-[state=checked]:[&>span]:bg-blue-500/25"
                                          checked={bulkOptionSectionIds.includes(section.id)}
                                          onSelect={(event) => event.preventDefault()}
                                          onCheckedChange={() => setBulkOptionSectionIds((prev) => toggleSectionSelection(prev, section.id))}
                                        >
                                          {section.name}
                                        </DropdownMenuCheckboxItem>
                                      ))}
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              )}
                            </div>
                            <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
                              <div><Label className="text-xs text-slate-300">Option count</Label><Input type="number" min={2} max={8} value={bulkOptionCount} onChange={(e) => setBulkOptionCount(Math.max(2, Math.min(8, Number(e.target.value) || 2)))} className="border-slate-700 bg-slate-900 text-slate-100" /></div>
                              <Button type="button" className="bg-blue-600 hover:bg-blue-500" onClick={applyBulkOptionCount}>Apply Count</Button>
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="border-slate-700 bg-slate-900/80">
                          <CardContent className="space-y-4 p-4">
                            <h4 className="text-sm font-semibold text-slate-200">Bulk Option Label Style</h4>
                            <div className="grid gap-3 md:grid-cols-2">
                              <div>
                                <Label className="text-xs text-slate-300">Target Mode</Label>
                                <Select value={bulkOptionMode} onValueChange={(v) => setBulkOptionMode(v as BulkTargetMode)}>
                                  <SelectTrigger className="border-slate-700 bg-slate-900 text-slate-100"><SelectValue /></SelectTrigger>
                                  <SelectContent><SelectItem value="range">By Range</SelectItem><SelectItem value="section">By Section</SelectItem></SelectContent>
                                </Select>
                              </div>
                              {bulkOptionMode === "range" ? (
                                <div><Label className="text-xs text-slate-300">Range</Label><Input value={bulkOptionRange} onChange={(e) => setBulkOptionRange(e.target.value)} placeholder="1-10, 12-15" className="border-slate-700 bg-slate-900 text-slate-100" /></div>
                              ) : (
                                <div>
                                  <Label className="text-xs text-slate-300">Sections</Label>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button type="button" variant="outline" className="w-full justify-between border-slate-700 bg-slate-900 text-slate-100 hover:bg-slate-800">
                                        <span className="truncate">{getSectionSelectionLabel(bulkOptionSectionIds)}</span>
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="start" className="w-[var(--radix-dropdown-menu-trigger-width)] min-w-[220px] border-slate-700 bg-slate-950 text-slate-100">
                                      <DropdownMenuCheckboxItem
                                        className="pl-9 [&>span]:rounded-[3px] [&>span]:border [&>span]:border-slate-500 [&>span]:bg-slate-900 data-[state=checked]:[&>span]:border-blue-400 data-[state=checked]:[&>span]:bg-blue-500/25"
                                        checked={config.sections.length > 0 && pruneSectionSelections(bulkOptionSectionIds).length === config.sections.length}
                                        onSelect={(event) => event.preventDefault()}
                                        onCheckedChange={() => setBulkOptionSectionIds((prev) => {
                                          const isAllSelected = config.sections.length > 0 && pruneSectionSelections(prev).length === config.sections.length;
                                          return isAllSelected ? [] : config.sections.map((section) => section.id);
                                        })}
                                      >
                                        Select all
                                      </DropdownMenuCheckboxItem>
                                      <DropdownMenuItem onSelect={(event) => { event.preventDefault(); setBulkOptionSectionIds([]); }}>Clear</DropdownMenuItem>
                                      <DropdownMenuSeparator className="bg-slate-700" />
                                      {config.sections.map((section) => (
                                        <DropdownMenuCheckboxItem
                                          key={section.id}
                                          className="pl-9 [&>span]:rounded-[3px] [&>span]:border [&>span]:border-slate-500 [&>span]:bg-slate-900 data-[state=checked]:[&>span]:border-blue-400 data-[state=checked]:[&>span]:bg-blue-500/25"
                                          checked={bulkOptionSectionIds.includes(section.id)}
                                          onSelect={(event) => event.preventDefault()}
                                          onCheckedChange={() => setBulkOptionSectionIds((prev) => toggleSectionSelection(prev, section.id))}
                                        >
                                          {section.name}
                                        </DropdownMenuCheckboxItem>
                                      ))}
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              )}
                            </div>
                            <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
                              <div><Label className="text-xs text-slate-300">Option label style</Label><Select value={bulkOptionLabelStyle} onValueChange={(v) => setBulkOptionLabelStyle(v as OptionLabelStyle)}><SelectTrigger className="border-slate-700 bg-slate-900 text-slate-100"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="alpha-upper">A, B, C, D</SelectItem><SelectItem value="numeric">1, 2, 3, 4</SelectItem><SelectItem value="roman-lower">i, ii, iii, iv</SelectItem><SelectItem value="custom">Custom labels</SelectItem></SelectContent></Select></div>
                              <Button type="button" className="bg-blue-600 hover:bg-blue-500" onClick={applyBulkOptionLabelStyle}>Apply Style</Button>
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="border-slate-700 bg-slate-900/80">
                          <CardContent className="space-y-4 p-4">
                            <h4 className="text-sm font-semibold text-slate-200">Bulk Difficulty</h4>
                            <div className="grid gap-3 md:grid-cols-2">
                              <div>
                                <Label className="text-xs text-slate-300">Target Mode</Label>
                                <Select value={bulkOptionMode} onValueChange={(v) => setBulkOptionMode(v as BulkTargetMode)}>
                                  <SelectTrigger className="border-slate-700 bg-slate-900 text-slate-100"><SelectValue /></SelectTrigger>
                                  <SelectContent><SelectItem value="range">By Range</SelectItem><SelectItem value="section">By Section</SelectItem></SelectContent>
                                </Select>
                              </div>
                              {bulkOptionMode === "range" ? (
                                <div><Label className="text-xs text-slate-300">Range</Label><Input value={bulkOptionRange} onChange={(e) => setBulkOptionRange(e.target.value)} placeholder="1-10, 12-15" className="border-slate-700 bg-slate-900 text-slate-100" /></div>
                              ) : (
                                <div>
                                  <Label className="text-xs text-slate-300">Sections</Label>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button type="button" variant="outline" className="w-full justify-between border-slate-700 bg-slate-900 text-slate-100 hover:bg-slate-800">
                                        <span className="truncate">{getSectionSelectionLabel(bulkOptionSectionIds)}</span>
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="start" className="w-[var(--radix-dropdown-menu-trigger-width)] min-w-[220px] border-slate-700 bg-slate-950 text-slate-100">
                                      <DropdownMenuCheckboxItem
                                        className="pl-9 [&>span]:rounded-[3px] [&>span]:border [&>span]:border-slate-500 [&>span]:bg-slate-900 data-[state=checked]:[&>span]:border-blue-400 data-[state=checked]:[&>span]:bg-blue-500/25"
                                        checked={config.sections.length > 0 && pruneSectionSelections(bulkOptionSectionIds).length === config.sections.length}
                                        onSelect={(event) => event.preventDefault()}
                                        onCheckedChange={() => setBulkOptionSectionIds((prev) => {
                                          const isAllSelected = config.sections.length > 0 && pruneSectionSelections(prev).length === config.sections.length;
                                          return isAllSelected ? [] : config.sections.map((section) => section.id);
                                        })}
                                      >
                                        Select all
                                      </DropdownMenuCheckboxItem>
                                      <DropdownMenuItem onSelect={(event) => { event.preventDefault(); setBulkOptionSectionIds([]); }}>Clear</DropdownMenuItem>
                                      <DropdownMenuSeparator className="bg-slate-700" />
                                      {config.sections.map((section) => (
                                        <DropdownMenuCheckboxItem
                                          key={section.id}
                                          className="pl-9 [&>span]:rounded-[3px] [&>span]:border [&>span]:border-slate-500 [&>span]:bg-slate-900 data-[state=checked]:[&>span]:border-blue-400 data-[state=checked]:[&>span]:bg-blue-500/25"
                                          checked={bulkOptionSectionIds.includes(section.id)}
                                          onSelect={(event) => event.preventDefault()}
                                          onCheckedChange={() => setBulkOptionSectionIds((prev) => toggleSectionSelection(prev, section.id))}
                                        >
                                          {section.name}
                                        </DropdownMenuCheckboxItem>
                                      ))}
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              )}
                            </div>
                            <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
                              <div><Label className="text-xs text-slate-300">Difficulty</Label><Select value={bulkDifficulty} onValueChange={(v) => setBulkDifficulty(v as Difficulty)}><SelectTrigger className="border-slate-700 bg-slate-900 text-slate-100"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="easy">Easy</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="hard">Hard</SelectItem></SelectContent></Select></div>
                              <Button type="button" className="bg-blue-600 hover:bg-blue-500" onClick={applyBulkDifficulty}>Apply Difficulty</Button>
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="border-slate-700 bg-slate-900/80">
                          <CardContent className="space-y-3 p-4">
                            <div className="flex items-center justify-between">
                              <h4 className="text-sm font-semibold text-slate-200">Per Question Customization (Overrides Bulk)</h4>
                              <div className="flex items-center gap-2">
                                <Button type="button" size="sm" variant="outline" className="border-slate-600 bg-slate-950 text-slate-100 hover:bg-slate-800" onClick={() => addQuestions(1)}>+ Add Question</Button>
                                {selectedQuestion && <Button type="button" size="sm" variant="ghost" className="text-red-300 hover:bg-red-500/10 hover:text-red-200" onClick={() => removeQuestion(selectedQuestion.id)}>Remove</Button>}
                              </div>
                            </div>

                            <div className="grid gap-3 md:grid-cols-[180px_1fr]">
                              <div className="max-h-64 overflow-auto rounded-md border border-slate-700 bg-slate-950 p-2">
                                <div className="space-y-1">
                                  {config.questions.map((question, idx) => {
                                    const qNo = formatQuestionNumber(idx, config.numberingStyle);
                                    const active = selectedQuestion?.id === question.id;
                                    const section = sectionById.get(question.sectionId);
                                    const topic = question.topicId ? topicById.get(question.topicId) || null : null;
                                    const subtopic = topic && question.subtopicId
                                      ? topic.subtopics.find((item) => item.id === question.subtopicId) || null
                                      : null;
                                    return (
                                      <button type="button" key={question.id} onClick={() => { setSelectedQuestionId(question.id); setCustomOptionInput(question.customOptionLabels.join(", ")); }} className={`flex w-full items-center gap-2 rounded px-2 py-1 text-left text-xs transition ${active ? "bg-blue-600 text-white" : "bg-slate-900 text-slate-200 hover:bg-slate-800"}`}>
                                        <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: section?.color || "#94a3b8" }} />
                                        <span className="min-w-0">
                                          <span className="block">Q {qNo}</span>
                                          <span className={`block truncate text-[10px] ${active ? "text-blue-100" : "text-slate-400"}`}>
                                            {topic ? `${topic.name}${subtopic ? ` / ${subtopic.name}` : ""}` : "No topic"}
                                          </span>
                                        </span>
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>

                              {selectedQuestion && (
                                <div className="space-y-3 rounded-md border border-slate-700 bg-slate-950 p-3">
                                  <div className="grid gap-3 md:grid-cols-2">
                                    <div><Label className="text-xs text-slate-300">Section</Label><Select value={selectedQuestion.sectionId} onValueChange={(value) => setQuestion(selectedQuestion.id, (current) => ({ ...current, sectionId: value }))}><SelectTrigger className="border-slate-700 bg-slate-900 text-slate-100"><SelectValue /></SelectTrigger><SelectContent>{config.sections.map((section) => <SelectItem key={section.id} value={section.id}>{section.name}</SelectItem>)}</SelectContent></Select></div>
                                    <div><Label className="text-xs text-slate-300">Question Type</Label><Select value={selectedQuestion.type} onValueChange={(value) => setQuestion(selectedQuestion.id, (current) => ({ ...current, type: value as QuestionType }))}><SelectTrigger className="border-slate-700 bg-slate-900 text-slate-100"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="single">Single correct</SelectItem><SelectItem value="multiple">Multiple correct</SelectItem></SelectContent></Select></div>
                                    <div>
                                      <Label className="text-xs text-slate-300">Topic</Label>
                                      <Select
                                        value={selectedQuestion.topicId || NO_TOPIC_VALUE}
                                        onValueChange={(value) =>
                                          setQuestion(selectedQuestion.id, (current) => {
                                            const topicId = value === NO_TOPIC_VALUE ? null : value;
                                            return { ...current, topicId, subtopicId: null };
                                          })
                                        }
                                      >
                                        <SelectTrigger className="border-slate-700 bg-slate-900 text-slate-100"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value={NO_TOPIC_VALUE}>No topic (null)</SelectItem>
                                          {config.topics.map((topic) => (
                                            <SelectItem key={topic.id} value={topic.id}>{topic.name}</SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <div>
                                      <Label className="text-xs text-slate-300">Subtopic</Label>
                                      <Select
                                        value={selectedQuestion.subtopicId || NO_SUBTOPIC_VALUE}
                                        onValueChange={(value) =>
                                          setQuestion(selectedQuestion.id, (current) => ({
                                            ...current,
                                            subtopicId: value === NO_SUBTOPIC_VALUE ? null : value,
                                          }))
                                        }
                                        disabled={!selectedQuestion.topicId}
                                      >
                                        <SelectTrigger className="border-slate-700 bg-slate-900 text-slate-100"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value={NO_SUBTOPIC_VALUE}>No subtopic (null)</SelectItem>
                                          {(selectedQuestion.topicId ? topicById.get(selectedQuestion.topicId)?.subtopics || [] : []).map((subtopic) => (
                                            <SelectItem key={subtopic.id} value={subtopic.id}>{subtopic.name}</SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  </div>

                                  <div className="grid gap-3 md:grid-cols-3">
                                    <div><Label className="text-xs text-slate-300">Marks</Label><Input type="number" min={1} max={20} value={selectedQuestion.marks} onChange={(e) => setQuestion(selectedQuestion.id, (current) => ({ ...current, marks: Math.max(1, Number(e.target.value) || 1) }))} className="border-slate-700 bg-slate-900 text-slate-100" /></div>
                                    <div><Label className="text-xs text-slate-300">Negative marks (0 = disabled)</Label><Input type="number" min={0} step="0.25" value={selectedQuestion.negativeMarks} onChange={(e) => setQuestion(selectedQuestion.id, (current) => { const val = Math.max(0, Number(e.target.value) || 0); return { ...current, negativeMarks: val, negativeEnabled: val > 0 }; })} className="border-slate-700 bg-slate-900 text-slate-100" /></div>
                                    <div><Label className="text-xs text-slate-300">Option count</Label><Input type="number" min={2} max={8} value={selectedQuestion.optionCount} onChange={(e) => setQuestion(selectedQuestion.id, (current) => ({ ...current, optionCount: Math.max(2, Math.min(8, Number(e.target.value) || 2)) }))} className="border-slate-700 bg-slate-900 text-slate-100" /></div>
                                  </div>

                                  {selectedQuestion.type === "multiple" && (
                                    <div className="flex items-center justify-between rounded-md border border-slate-700 bg-slate-900 px-3 py-2">
                                      <div>
                                        <p className="text-xs font-medium text-slate-100">Enable Partial Marking</p>
                                        <p className="text-[11px] text-slate-300">Award proportional marks for partially correct multi-select responses.</p>
                                      </div>
                                      <Switch
                                        checked={selectedQuestion.partialMarkingEnabled}
                                        onCheckedChange={(checked) => setQuestion(selectedQuestion.id, (current) => ({
                                          ...current,
                                          partialMarkingEnabled: Boolean(checked),
                                        }))}
                                      />
                                    </div>
                                  )}

                                  <div className="grid gap-3 md:grid-cols-2">
                                    <div><Label className="text-xs text-slate-300">Option label style</Label><Select value={selectedQuestion.optionLabelStyle} onValueChange={(value) => setQuestion(selectedQuestion.id, (current) => ({ ...current, optionLabelStyle: value as OptionLabelStyle }))}><SelectTrigger className="border-slate-700 bg-slate-900 text-slate-100"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="alpha-upper">A, B, C, D</SelectItem><SelectItem value="numeric">1, 2, 3, 4</SelectItem><SelectItem value="roman-lower">i, ii, iii, iv</SelectItem><SelectItem value="custom">Custom labels</SelectItem></SelectContent></Select></div>
                                    <div><Label className="text-xs text-slate-300">Difficulty</Label><Select value={selectedQuestion.difficulty} onValueChange={(value) => setQuestion(selectedQuestion.id, (current) => ({ ...current, difficulty: value as Difficulty }))}><SelectTrigger className="border-slate-700 bg-slate-900 text-slate-100"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="easy">Easy</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="hard">Hard</SelectItem></SelectContent></Select></div>
                                  </div>

                                  {selectedQuestion.optionLabelStyle === "custom" && (
                                    <div>
                                      <Label className="text-xs text-slate-300">Custom labels (comma separated)</Label>
                                      <Input value={customOptionInput} onChange={(e) => { setCustomOptionInput(e.target.value); const labels = e.target.value.split(",").map((v) => v.trim()).filter(Boolean); setQuestion(selectedQuestion.id, (current) => ({ ...current, customOptionLabels: labels })); }} placeholder="True, False, NA, Skip" className="border-slate-700 bg-slate-900 text-slate-100" />
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </TabsContent>
                  )}

                  {activeTab === "answer-key" && (
                    <TabsContent value="answer-key" className="mt-3 flex min-h-0 flex-1 flex-col overflow-y-auto">
                      <div className="space-y-3 pr-2">
                        {config.questions.map((question, idx) => {
                          const questionNumber = formatQuestionNumber(idx, config.numberingStyle);
                          const section = sectionById.get(question.sectionId);
                          const sectionName = section?.name || "Section";
                          const topic = question.topicId ? topicById.get(question.topicId) || null : null;
                          const subtopic = topic && question.subtopicId
                            ? topic.subtopics.find((item) => item.id === question.subtopicId) || null
                            : null;
                          const optionLabels = getOptionLabels(question);
                          const optionMinWidth = optionLabels.length <= 2 ? 220 : optionLabels.length <= 4 ? 170 : 130;
                          return (
                            <Card key={question.id} className="border-slate-700 bg-slate-900/80">
                              <CardContent className="space-y-2 p-3">
                                  <div className="flex flex-wrap items-start justify-between gap-2">
                                  <div>
                                      <p className="text-sm font-semibold text-slate-100">Question {questionNumber}</p>
                                      <p className="text-xs text-slate-300">
                                        {sectionName} • {question.type === "single" ? "Single correct" : "Multiple correct"} • {question.marks} marks • Topic: {topic ? topic.name : "None"}
                                        {topic ? ` • Subtopic: ${subtopic ? subtopic.name : "None"}` : ""}
                                        • Partial marking: {question.type === "multiple" && question.partialMarkingEnabled ? "On" : "Off"}
                                      </p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: section?.color || "#94a3b8" }} />
                                      <Badge className="bg-slate-700 text-slate-100">{question.correctAnswers.length} selected</Badge>
                                  </div>
                                </div>

                                  <div
                                    className="grid gap-2"
                                    style={{ gridTemplateColumns: `repeat(auto-fit, minmax(${optionMinWidth}px, 1fr))` }}
                                  >
                                  {optionLabels.map((label) => {
                                    const checked = question.correctAnswers.includes(label);
                                    return (
                                        <button type="button" key={`${question.id}-${label}`} onClick={() => toggleAnswerKeyOption(question, label)} className={`flex items-center justify-between gap-2 rounded-md border px-2.5 py-1.5 text-xs transition ${checked ? "border-green-400 bg-green-500/20 text-green-100" : "border-slate-700 bg-slate-950 text-slate-200 hover:bg-slate-800"}`}>
                                        <span className="truncate">{label}</span>
                                        {checked ? <CheckCircle2 className="h-4 w-4" /> : null}
                                      </button>
                                    );
                                  })}
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    </TabsContent>
                  )}

                  {activeTab === "preview" && (
                    <TabsContent value="preview" className="mt-3 flex min-h-0 flex-1 flex-col overflow-y-auto">
                      <div className="flex min-h-0 flex-1 flex-col gap-3">
                        {!previewStarted ? (
                        <Card className="border-slate-700 bg-slate-900/80">
                          <CardContent className="space-y-4 p-4">
                            <h4 className="text-base font-semibold text-slate-100">Preview Setup</h4>
                            <p className="text-sm text-slate-300">
                              {isMockTestType
                                ? `This preview has ${config.questions.length} questions. Would you like to use a timer?`
                                : `This preview has ${config.questions.length} questions. Simple assignments are untimed by default.`}
                            </p>
                            <p className="text-xs text-slate-400">Recommended time: {recommendedTimeMinutes} min (editable if enabled)</p>
                            {isMockTestType && (
                              <div className="flex flex-wrap items-center gap-2">
                                <Button type="button" variant={previewTimerDecision === "timed" ? "default" : "outline"} className={previewTimerDecision === "timed" ? "bg-blue-600 hover:bg-blue-500" : "border-slate-600 bg-slate-950 text-slate-100 hover:bg-slate-800"} onClick={() => { setPreviewTimerDecision("timed"); setPreviewTimerMinutes(recommendedTimeMinutes); setTimerRemainingMs(recommendedTimeMinutes * 60 * 1000); }}>Yes, use timer</Button>
                                <Button type="button" variant={previewTimerDecision === "untimed" ? "default" : "outline"} className={previewTimerDecision === "untimed" ? "bg-blue-600 hover:bg-blue-500" : "border-slate-600 bg-slate-950 text-slate-100 hover:bg-slate-800"} onClick={() => { setPreviewTimerDecision("untimed"); setTimerRemainingMs(0); }}>No, untimed</Button>
                              </div>
                            )}
                            {isMockTestType && previewTimerDecision === "timed" && (
                              <div className="max-w-xs">
                                <Label className="text-xs text-slate-300">Timer minutes</Label>
                                <Input type="number" min={1} max={600} value={previewTimerMinutes} onChange={(e) => setPreviewTimerMinutes(Math.max(1, Math.min(600, Number(e.target.value) || 1)))} className="border-slate-700 bg-slate-900 text-slate-100" />
                              </div>
                            )}
                            <Button type="button" className="bg-blue-600 hover:bg-blue-500" onClick={startPreview}>Start Preview {isMockTestType ? "Test" : "Assignment"}</Button>
                          </CardContent>
                        </Card>
                      ) : (
                        <>
                          <Card className="border-slate-700 bg-slate-900/80">
                            <CardContent className="flex flex-wrap items-center justify-between gap-3 p-3">
                              <div className="flex items-center gap-3">
                                {previewTimerDecision === "timed" ? (
                                  <>
                                    <div className="rounded-md bg-slate-950 px-3 py-2 text-sm font-mono text-slate-100"><span className="mr-2 inline-flex items-center gap-1 text-slate-300"><Timer className="h-3.5 w-3.5" />Timer</span>{formatMs(timerRemainingMs)}</div>
                                    <div className="w-28"><Input type="number" min={1} max={600} value={previewTimerMinutes} onChange={(e) => setPreviewTimerMinutes(Math.max(1, Math.min(600, Number(e.target.value) || 1)))} className="h-8 border-slate-700 bg-slate-950 text-slate-100" /></div>
                                  </>
                                ) : (
                                  <div className="rounded-md bg-slate-950 px-3 py-2 text-sm text-slate-100">Untimed preview mode</div>
                                )}
                              </div>

                              <div className="flex items-center gap-2">
                                {previewTimerDecision === "timed" && (
                                  <>
                                    {!timerRunning ? <Button type="button" size="sm" onClick={startTimer} className="bg-blue-600 hover:bg-blue-500">Start</Button> : <Button type="button" size="sm" variant="outline" className="border-slate-600 bg-slate-950 text-slate-100 hover:bg-slate-800" onClick={pauseTimer}>Pause</Button>}
                                    <Button type="button" size="sm" variant="outline" className="border-slate-600 bg-slate-950 text-slate-100 hover:bg-slate-800" onClick={resetTimer}>Reset</Button>
                                  </>
                                )}
                                <Button type="button" size="sm" variant="outline" className="border-slate-600 bg-slate-950 text-slate-100 hover:bg-slate-800" onClick={restartPreviewSetup}>Reconfigure</Button>
                              </div>
                            </CardContent>
                          </Card>

                          <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 md:grid-cols-[1fr_250px]">
                            <Card className="min-h-0 border-slate-700 bg-slate-900/80">
                              <CardContent className="flex h-full min-h-0 flex-col p-3">
                                {previewQuestion ? (
                                  <>
                                    <div className="mb-3 flex items-center justify-between gap-2">
                                      <div>
                                        <p className="text-sm font-semibold text-slate-100">Q {formatQuestionNumber(previewCursor, config.numberingStyle)}</p>
                                        <p className="text-xs text-slate-300">{previewQuestion.type === "single" ? "Single select" : "Multi select"} • OMR preview mode</p>
                                      </div>
                                      <Button type="button" size="sm" variant="outline" className="border-slate-600 bg-slate-950 text-slate-100 hover:bg-slate-800" onClick={() => toggleMarkForReview(previewQuestion.id)}>{previewState[previewQuestion.id]?.markedForReview ? "Unmark Review" : "Mark Review"}</Button>
                                    </div>

                                    <div className="grid gap-2 md:grid-cols-2">
                                      {getOptionLabels(previewQuestion).map((optionLabel) => {
                                        const selected = (previewState[previewQuestion.id]?.selectedAnswers || []).includes(optionLabel);
                                        return (
                                          <button type="button" key={`preview-${previewQuestion.id}-${optionLabel}`} onClick={() => togglePreviewAnswer(previewQuestion, optionLabel)} className={`flex items-center gap-3 rounded-md border px-3 py-2 text-left transition ${selected ? "border-blue-300 bg-blue-500/20 text-blue-100" : "border-slate-700 bg-slate-950 text-slate-100 hover:bg-slate-800"}`}>
                                            <span className={`inline-flex h-5 w-5 items-center justify-center rounded-full border text-xs ${selected ? "border-blue-300 bg-blue-500" : "border-slate-600"}`}>{optionLabel}</span>
                                            <span className="text-sm">Option {optionLabel}</span>
                                          </button>
                                        );
                                      })}
                                    </div>

                                    <div className="mt-auto flex items-center justify-between pt-3">
                                      <Button type="button" variant="outline" className="border-slate-600 bg-slate-950 text-slate-100 hover:bg-slate-800" disabled={previewCursor === 0} onClick={() => setPreviewCursor((prev) => Math.max(0, prev - 1))}>Previous</Button>
                                      <Button type="button" variant="outline" className="border-slate-600 bg-slate-950 text-slate-100 hover:bg-slate-800" disabled={previewCursor >= config.questions.length - 1} onClick={() => setPreviewCursor((prev) => Math.min(config.questions.length - 1, prev + 1))}>Next</Button>
                                    </div>
                                  </>
                                ) : (
                                  <div className="flex h-full items-center justify-center text-sm text-slate-300">No questions available.</div>
                                )}
                              </CardContent>
                            </Card>

                            <Card className="min-h-0 border-slate-700 bg-slate-900/80">
                              <CardContent className="flex h-full min-h-0 flex-col p-3">
                                <div className="mb-3 flex items-center justify-between"><h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300">Question Nav</h4><ListChecks className="h-4 w-4 text-slate-300" /></div>
                                <div className="mb-3 space-y-1 text-xs text-slate-300"><p><span className="inline-block h-2 w-2 rounded-full bg-green-400" /> Answered</p><p><span className="inline-block h-2 w-2 rounded-full bg-red-400" /> Not answered</p><p><span className="inline-block h-2 w-2 rounded-full bg-yellow-300" /> Marked review</p></div>
                                <div className="mb-3 rounded-md border border-slate-700 bg-slate-950 p-2"><p className="mb-2 text-xs font-semibold text-slate-300">Section Colors</p><div className="space-y-1">{config.sections.map((section) => <div key={section.id} className="flex items-center gap-2 text-xs text-slate-200"><span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: section.color }} /><span>{section.name}</span></div>)}</div></div>
                                <div className="min-h-0 flex-1 overflow-y-auto pr-1"><div className="grid grid-cols-4 gap-2 pr-2">{config.questions.map((question, idx) => { const answered = answeredQuestionIds.has(question.id); const marked = markedQuestionIds.has(question.id); const active = idx === previewCursor; const sectionColor = sectionById.get(question.sectionId)?.color || "#94a3b8"; const bgClass = marked ? "bg-yellow-400 text-slate-950" : answered ? "bg-green-500 text-white" : "bg-red-500 text-white"; return <button type="button" key={question.id} onClick={() => setPreviewCursor(idx)} className={`h-9 w-9 rounded-full border-2 text-xs font-semibold transition ${bgClass} ${active ? "ring-2 ring-white" : "opacity-90 hover:opacity-100"}`} style={{ borderColor: sectionColor }}>{formatQuestionNumber(idx, config.numberingStyle)}</button>; })}</div></div>
                              </CardContent>
                            </Card>
                          </div>
                        </>
                        )}
                      </div>
                    </TabsContent>
                  )}
                </Tabs>
              </section>
            </div>
          </div>

          <footer className="shrink-0 border-t border-slate-700/80 bg-slate-900/95 px-5 py-3 backdrop-blur">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <Button type="button" size="sm" variant="outline" className="border-slate-600 bg-slate-950 text-slate-100 hover:bg-slate-800" onClick={saveDraftNow}><Save className="mr-1 h-3.5 w-3.5" /> Save Draft</Button>
                <Button type="button" size="sm" variant="outline" className="border-slate-600 bg-slate-950 text-slate-100 hover:bg-slate-800" onClick={exportConfig}><FileJson className="mr-1 h-3.5 w-3.5" /> Export Config</Button>
                <label className="inline-flex cursor-pointer items-center gap-1 rounded-md border border-slate-600 bg-slate-950 px-3 py-2 text-xs text-slate-100 hover:bg-slate-800"><Upload className="h-3.5 w-3.5" />Import Config<input type="file" accept="application/json" className="hidden" onChange={(event) => { const file = event.target.files?.[0]; if (file) { void importConfig(file); event.currentTarget.value = ""; } }} /></label>
                <Button type="button" size="sm" variant="outline" className="border-slate-600 bg-slate-950 text-slate-100 hover:bg-slate-800" onClick={exportAnswerKey}><ListChecks className="mr-1 h-3.5 w-3.5" /> Export Answer Key</Button>
                <Button type="button" size="sm" variant="ghost" className="text-slate-200 hover:bg-slate-800" onClick={clearDraft}><RefreshCcw className="mr-1 h-3.5 w-3.5" /> Reset Draft</Button>
              </div>

              <div className="flex items-center gap-2">
                <Button type="button" variant="outline" className="border-slate-600 bg-slate-950 text-slate-100 hover:bg-slate-800" onClick={() => onOpenChange(false)}>Close</Button>
                <Button type="button" className="bg-blue-600 hover:bg-blue-500" disabled={savingTemplate} onClick={() => void saveTemplateCard()}>
                  {savingTemplate ? `Saving ${assessmentNounLower}...` : editingTemplateId ? `Update ${assessmentTypeLabel}` : `Save ${assessmentTypeLabel}`}
                </Button>
              </div>
            </div>
            <div className="mt-2 flex items-center gap-2 text-xs text-slate-300"><Clock3 className="h-3.5 w-3.5" />Draft and preview timer preferences auto-save locally for stability.</div>
          </footer>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export { MCQ_METADATA_START, MCQ_METADATA_END };
