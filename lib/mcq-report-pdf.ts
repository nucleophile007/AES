import fs from "fs";
import path from "path";
import { degrees, PDFDocument, PDFFont, PDFPage, rgb, StandardFonts } from "pdf-lib";
import { McqReportPresentation } from "@/lib/mcq-report-presentation";

type ScoreSummary = {
  finalScore?: number;
  rawScore?: number;
  percentage?: number;
  maxScore?: number;
  correctCount?: number;
  partialCount?: number;
  wrongCount?: number;
  answeredCount?: number;
  unansweredCount?: number;
};

type SectionStat = {
  sectionId?: string;
  sectionName?: string;
  questionCount?: number;
  correctCount?: number;
  wrongCount?: number;
  score?: number;
  maxScore?: number;
  percentage?: number;
};

type DifficultyStat = {
  difficulty?: string;
  questionCount?: number;
  correctCount?: number;
  wrongCount?: number;
  score?: number;
  maxScore?: number;
  percentage?: number;
};

type QuestionStat = {
  questionNumber?: string;
  sectionName?: string;
  difficulty?: string;
  correctAnswers?: string[];
  selectedAnswers?: string[];
  scoreAwarded?: number;
  status?: string;
};

export interface McqReportPdfInput {
  report: {
    scoreSummary?: ScoreSummary;
    sectionStats?: SectionStat[];
    difficultyStats?: DifficultyStat[];
    questionStats?: QuestionStat[];
    generatedAt?: string;
    attemptPolicy?: {
      consideredAttemptNumber?: number;
      consideredAttemptSubmittedAt?: string;
      attemptsFound?: number;
      validAttemptsBeforeDue?: number;
    };
  };
  presentation: McqReportPresentation;
  studentName: string;
  assignmentTitle: string;
  testTitle: string;
  attemptsLabel?: string;
  consideredAttemptLabel?: string;
}

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN = 34;
const NAVY = rgb(0.13, 0.22, 0.42);
const LIGHT_NAVY = rgb(0.92, 0.95, 0.99);
const TEXT = rgb(0.14, 0.16, 0.19);
const MUTED = rgb(0.42, 0.46, 0.51);
const BORDER = rgb(0.76, 0.78, 0.82);
const GREEN = rgb(0.12, 0.55, 0.35);
const RED = rgb(0.73, 0.19, 0.24);
const AMBER = rgb(0.77, 0.53, 0.12);

const colorForIndex = (index: number) => {
  const colors = [rgb(0.78, 0.18, 0.26), rgb(0.92, 0.52, 0.18), rgb(0.91, 0.71, 0.18), rgb(0.38, 0.28, 0.69), rgb(0.1, 0.55, 0.64)];
  return colors[index % colors.length];
};

const percentValue = (value: number | undefined) => Math.max(0, Math.min(100, Number(value) || 0));
const narrativeTitle = (value: string | undefined) => {
  return value === "AI Performance Narrative" ? "Performance Narrative" : value || "Performance Narrative";
};

const toTextLines = (value: string | undefined | null) => {
  return String(value || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
};

const wrapText = (text: string, font: PDFFont, size: number, maxWidth: number) => {
  const rawLines = String(text || "").split(/\r?\n/);
  const result: string[] = [];

  rawLines.forEach((line) => {
    const words = line.trim().split(/\s+/).filter(Boolean);
    if (words.length === 0) {
      result.push("");
      return;
    }

    let current = words[0];
    for (let i = 1; i < words.length; i += 1) {
      const next = `${current} ${words[i]}`;
      if (font.widthOfTextAtSize(next, size) <= maxWidth) {
        current = next;
      } else {
        result.push(current);
        current = words[i];
      }
    }
    result.push(current);
  });

  return result;
};

const drawWrappedText = (
  page: PDFPage,
  text: string,
  x: number,
  topY: number,
  width: number,
  font: PDFFont,
  size: number,
  lineHeight: number,
  color = TEXT,
) => {
  const lines = wrapText(text, font, size, width);
  let cursor = topY;
  for (const line of lines) {
    page.drawText(line, { x, y: cursor - size, size, font, color });
    cursor -= lineHeight;
  }
  return cursor;
};

const drawWatermark = async (page: PDFPage, pdfDoc: PDFDocument, opacity = 0.12) => {
  const logoPath = path.join(process.cwd(), "public", "acharya-logo.png");
  if (!fs.existsSync(logoPath)) return;
  const logoBytes = fs.readFileSync(logoPath);
  const image = await pdfDoc.embedPng(logoBytes);
  const size = 200;
  const x = (PAGE_WIDTH - size) / 2;
  const y = (PAGE_HEIGHT - size) / 2;
  page.drawImage(image, { x, y, width: size, height: size, opacity });
};

const drawBox = (page: PDFPage, x: number, yTop: number, width: number, height: number, borderColor = BORDER) => {
  page.drawRectangle({ x, y: yTop - height, width, height, borderWidth: 1, borderColor });
};

const drawStripBox = (
  page: PDFPage,
  title: string,
  bodyLines: string[],
  x: number,
  yTop: number,
  width: number,
  height: number,
  fonts: { body: PDFFont; bodyBold: PDFFont; title: PDFFont },
) => {
  drawBox(page, x, yTop, width, height);
  page.drawRectangle({ x, y: yTop - 20, width, height: 20, color: NAVY });
  page.drawText(title, {
    x: x + 8,
    y: yTop - 15,
    size: 9,
    font: fonts.title,
    color: rgb(1, 1, 1),
  });

  let cursor = yTop - 28;
  bodyLines.forEach((line, index) => {
    const isPrimary = index === 0;
    page.drawText(line, {
      x: x + 8,
      y: cursor - (isPrimary ? 13 : 11),
      size: isPrimary ? 13 : 8.5,
      font: isPrimary ? fonts.bodyBold : fonts.body,
      color: TEXT,
    });
    cursor -= isPrimary ? 18 : 13;
  });
};

const drawStatusIcon = (page: PDFPage, x: number, y: number, status: string | undefined, font: PDFFont) => {
  const boxSize = 10;
  if (status === "correct") {
    page.drawRectangle({ x, y, width: boxSize, height: boxSize, color: rgb(0.89, 0.97, 0.92), borderColor: GREEN, borderWidth: 1 });
    page.drawLine({ start: { x: x + 2, y: y + 5 }, end: { x: x + 4, y: y + 2 }, thickness: 1.2, color: GREEN });
    page.drawLine({ start: { x: x + 4, y: y + 2 }, end: { x: x + 8, y: y + 8 }, thickness: 1.2, color: GREEN });
    return;
  }

  if (status === "incorrect") {
    page.drawRectangle({ x, y, width: boxSize, height: boxSize, color: rgb(0.99, 0.92, 0.93), borderColor: RED, borderWidth: 1 });
    page.drawLine({ start: { x: x + 2, y: y + 2 }, end: { x: x + 8, y: y + 8 }, thickness: 1.2, color: RED });
    page.drawLine({ start: { x: x + 8, y: y + 2 }, end: { x: x + 2, y: y + 8 }, thickness: 1.2, color: RED });
    return;
  }

  page.drawRectangle({ x, y, width: boxSize, height: boxSize, color: rgb(0.98, 0.95, 0.88), borderColor: AMBER, borderWidth: 1 });
  page.drawText("~", { x: x + 2.5, y: y + 0.5, size: 10, font, color: AMBER });
};

const drawBulletList = (
  page: PDFPage,
  items: string[],
  x: number,
  topY: number,
  width: number,
  font: PDFFont,
  size: number,
  lineHeight: number,
) => {
  let cursor = topY;
  items.forEach((item) => {
    const lines = wrapText(item, font, size, width - 12);
    page.drawText("-", { x, y: cursor - size, size, font, color: MUTED });
    let lineCursor = cursor;
    lines.forEach((line, index) => {
      page.drawText(line, { x: x + 10, y: lineCursor - size, size, font, color: TEXT });
      lineCursor -= lineHeight;
    });
    cursor = lineCursor - 3;
  });
  return cursor;
};

const drawSectionHeader = (page: PDFPage, title: string, x: number, yTop: number, width: number, font: PDFFont) => {
  page.drawRectangle({ x, y: yTop - 18, width, height: 18, color: NAVY });
  page.drawText(title, { x: x + 8, y: yTop - 13, size: 10, font, color: rgb(1, 1, 1) });
  return yTop - 24;
};

const drawSectionInsights = (
  page: PDFPage,
  title: string,
  sections: SectionStat[],
  presentation: McqReportPresentation,
  x: number,
  yTop: number,
  width: number,
  height: number,
  fonts: { body: PDFFont; bodyBold: PDFFont; title: PDFFont }
) => {
  drawBox(page, x, yTop, width, height);
  page.drawRectangle({ x, y: yTop - 20, width, height: 20, color: NAVY });
  page.drawText(title, { x: x + 8, y: yTop - 15, size: 9, font: fonts.title, color: rgb(1, 1, 1) });

  let cursor = yTop - 28;
  const perItem = Math.max(1, Math.floor((height - 28) / Math.max(1, sections.length)));
  sections.forEach((section) => {
    const name = section.sectionName || "Section";
    const id = section.sectionId || "";
    const insight = presentation.aiTopicInsights && id ? presentation.aiTopicInsights[id] : "";
    const fallback = insight || (percentValue(section.percentage) >= 80
      ? "Strong conceptual understanding and high execution consistency."
      : percentValue(section.percentage) >= 50
      ? "Developing understanding with room for stronger application."
      : "Major conceptual struggles detected requiring focused revision.");

    page.drawText(name, { x: x + 8, y: cursor - 11, size: 9, font: fonts.bodyBold, color: TEXT });
    drawWrappedText(page, fallback, x + 8, cursor - 26, width - 16, fonts.body, 8, 10, MUTED);
    cursor -= perItem;
  });
};

const drawPageChrome = async (
  page: PDFPage,
  pdfDoc: PDFDocument,
  fonts: { body: PDFFont; bodyBold: PDFFont; title: PDFFont },
  presentation: McqReportPresentation,
  studentName: string,
  titleLabel: string,
) => {
  const y = PAGE_HEIGHT - MARGIN;
  const headerLogoPath = path.join(process.cwd(), "public", "acharya-logo.png");
  if (fs.existsSync(headerLogoPath)) {
    const logo = await pdfDoc.embedPng(fs.readFileSync(headerLogoPath));
    page.drawImage(logo, { x: MARGIN, y: y - 42, width: 38, height: 38 });
  }

  page.drawText("AES Math Competition", { x: MARGIN + 48, y: y - 8, size: 11, font: fonts.bodyBold, color: TEXT });
  page.drawText(`Student: ${studentName}`, { x: MARGIN + 48, y: y - 22, size: 8.5, font: fonts.body, color: MUTED });
  page.drawText(titleLabel, { x: PAGE_WIDTH - MARGIN - 160, y: y - 8, size: 11, font: fonts.title, color: NAVY, maxWidth: 160 });
  page.drawText(presentation.reportType, { x: PAGE_WIDTH - MARGIN - 160, y: y - 22, size: 8.5, font: fonts.body, color: MUTED, maxWidth: 160 });
  page.drawLine({ start: { x: MARGIN, y: y - 34 }, end: { x: PAGE_WIDTH - MARGIN, y: y - 34 }, thickness: 1.1, color: NAVY });
  return y - 48;
};

export async function generateMcqReportPdfBytes(input: McqReportPdfInput): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const bodyFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const bodyBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const titleFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
  const serifFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);

  const { report, presentation } = input;
  const summary = report.scoreSummary || {};
  const sectionStats = report.sectionStats || [];
  const difficultyStats = report.difficultyStats || [];
  const questionStats = report.questionStats || [];
  const strengths = toTextLines(presentation.strengths);
  const weaknesses = toTextLines(presentation.weaknesses);

  const makePage = async () => {
    const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    await drawWatermark(page, pdfDoc, 0.08);
    return page;
  };

  let page = await makePage();
  let y = await drawPageChrome(page, pdfDoc, { body: bodyFont, bodyBold: bodyBoldFont, title: titleFont }, presentation, input.studentName, input.testTitle);

  page.drawText(presentation.reportTitle, { x: MARGIN, y: y - 4, size: 18, font: titleFont, color: NAVY, maxWidth: PAGE_WIDTH - MARGIN * 2 });
  page.drawText(presentation.reportType, { x: MARGIN, y: y - 20, size: 8.5, font: bodyFont, color: MUTED, maxWidth: PAGE_WIDTH - MARGIN * 2 });
  /* Attempts/considered attempt removed from PDF header per request */
  y -= 54;

  const metaWidth = (PAGE_WIDTH - MARGIN * 2 - 8) / 2;
  drawStripBox(page, "STUDENT", [input.studentName], MARGIN, y, metaWidth, 48, { body: bodyFont, bodyBold: bodyBoldFont, title: bodyBoldFont });
  drawStripBox(page, "ASSESSMENT", [input.assignmentTitle, input.testTitle], MARGIN + metaWidth + 8, y, metaWidth, 48, { body: bodyFont, bodyBold: bodyBoldFont, title: bodyBoldFont });
  y -= 60;

  const summaryW = (PAGE_WIDTH - MARGIN * 2 - 12) / 2;
  const summaryH = 62;
  drawStripBox(page, "RAW SCORE", [`${summary.finalScore ?? 0}/${summary.maxScore ?? 0}`], MARGIN, y, summaryW, summaryH, { body: bodyFont, bodyBold: bodyBoldFont, title: bodyBoldFont });
  drawStripBox(page, "ACCURACY", [`${summary.percentage ?? 0}%`], MARGIN + summaryW + 12, y, summaryW, summaryH, { body: bodyFont, bodyBold: bodyBoldFont, title: bodyBoldFont });
  y -= 72;
  page.drawRectangle({ x: MARGIN, y: y - 98, width: PAGE_WIDTH - MARGIN * 2, height: 98, borderWidth: 1, borderColor: BORDER });
  page.drawRectangle({ x: MARGIN, y: y - 18, width: PAGE_WIDTH - MARGIN * 2, height: 18, color: NAVY });
  page.drawText(narrativeTitle(presentation.sectionTitleNarrative), { x: MARGIN + 8, y: y - 13, size: 10, font: bodyBoldFont, color: rgb(1, 1, 1) });
  const narrative = drawWrappedText(page, presentation.aiNarrative, MARGIN + 8, y - 28, PAGE_WIDTH - MARGIN * 2 - 16, serifFont, 9.5, 13, TEXT);
  y = narrative - 6;

  const listYTop = y;
  const listWidth = (PAGE_WIDTH - MARGIN * 2 - 10) / 2;
  const blockHeight = 86;
  drawStripBox(page, "STRENGTHS", strengths, MARGIN, listYTop, listWidth, blockHeight, { body: bodyFont, bodyBold: bodyBoldFont, title: bodyBoldFont });
  drawStripBox(page, "WEAKNESSES", weaknesses, MARGIN + listWidth + 10, listYTop, listWidth, blockHeight, { body: bodyFont, bodyBold: bodyBoldFont, title: bodyBoldFont });
  y = listYTop - blockHeight - 14;
  page.drawRectangle({ x: MARGIN, y: y - 58, width: PAGE_WIDTH - MARGIN * 2, height: 58, borderWidth: 1, borderColor: BORDER });
  page.drawText("INTERPRETATION", { x: MARGIN + 8, y: y - 13, size: 9, font: bodyBoldFont, color: NAVY });
  drawWrappedText(page, presentation.interpretationText, MARGIN + 8, y - 28, PAGE_WIDTH - MARGIN * 2 - 16, bodyFont, 9, 12, TEXT);
  y -= 72;

  const topicTitle = drawSectionHeader(page, presentation.sectionTitleMastery, MARGIN, y, PAGE_WIDTH - MARGIN * 2, bodyBoldFont);
  y = topicTitle - 4;
  const topicBoxWidth = (PAGE_WIDTH - MARGIN * 2 - 10) / 3;
  const topicBoxHeight = 128;
  const excellent = sectionStats.filter((section) => percentValue(section.percentage) >= 80);
  const developing = sectionStats.filter((section) => percentValue(section.percentage) >= 60 && percentValue(section.percentage) < 80);
  const critical = sectionStats.filter((section) => percentValue(section.percentage) < 60);
  drawSectionInsights(page, "EXCELLENT", excellent, presentation, MARGIN, y, topicBoxWidth, topicBoxHeight, { body: bodyFont, bodyBold: bodyBoldFont, title: bodyBoldFont });
  drawSectionInsights(page, "DEVELOPING", developing, presentation, MARGIN + topicBoxWidth + 5, y, topicBoxWidth, topicBoxHeight, { body: bodyFont, bodyBold: bodyBoldFont, title: bodyBoldFont });
  drawSectionInsights(page, "CRITICAL", critical, presentation, MARGIN + (topicBoxWidth + 5) * 2, y, topicBoxWidth, topicBoxHeight, { body: bodyFont, bodyBold: bodyBoldFont, title: bodyBoldFont });

  page = await makePage();
  y = await drawPageChrome(page, pdfDoc, { body: bodyFont, bodyBold: bodyBoldFont, title: titleFont }, presentation, input.studentName, input.testTitle);
  y = drawSectionHeader(page, presentation.sectionTitleDifficulty, MARGIN, y, PAGE_WIDTH - MARGIN * 2, bodyBoldFont) - 2;
  difficultyStats.forEach((difficulty, index) => {
    const boxHeight = 58;
    page.drawRectangle({ x: MARGIN, y: y - boxHeight, width: PAGE_WIDTH - MARGIN * 2, height: boxHeight, borderColor: BORDER, borderWidth: 1 });
    page.drawText(String(difficulty.difficulty || "medium").toUpperCase(), {
      x: MARGIN + 8,
      y: y - 14,
      size: 9,
      font: bodyBoldFont,
      color: TEXT,
    });
    page.drawText(`${difficulty.score ?? 0}/${difficulty.maxScore ?? 0} (${difficulty.percentage ?? 0}%)`, { x: PAGE_WIDTH - MARGIN - 110, y: y - 14, size: 9, font: bodyFont, color: MUTED });
    page.drawRectangle({ x: MARGIN + 8, y: y - 34, width: PAGE_WIDTH - MARGIN * 2 - 16, height: 8, color: rgb(0.9, 0.9, 0.9) });
    page.drawRectangle({ x: MARGIN + 8, y: y - 34, width: (PAGE_WIDTH - MARGIN * 2 - 16) * (percentValue(difficulty.percentage) / 100), height: 8, color: colorForIndex(index) });
    page.drawText(`Correct ${difficulty.correctCount ?? 0} • Wrong ${difficulty.wrongCount ?? 0} • Questions ${difficulty.questionCount ?? 0}`, { x: MARGIN + 8, y: y - 48, size: 8, font: bodyFont, color: MUTED });
    y -= 68;
  });
  const tierCards = [
    {
      key: "easy" as const,
      label: "Easy Tier",
      color: rgb(46 / 255, 158 / 255, 92 / 255),
      fill: rgb(238 / 255, 250 / 255, 242 / 255),
      border: rgb(166 / 255, 222 / 255, 186 / 255),
    },
    {
      key: "medium" as const,
      label: "Medium Tier",
      color: rgb(219 / 255, 148 / 255, 38 / 255),
      fill: rgb(255 / 255, 248 / 255, 232 / 255),
      border: rgb(245 / 255, 213 / 255, 148 / 255),
    },
    {
      key: "hard" as const,
      label: "Hard Tier",
      color: rgb(124 / 255, 74 / 255, 189 / 255),
      fill: rgb(246 / 255, 240 / 255, 255 / 255),
      border: rgb(212 / 255, 188 / 255, 245 / 255),
    },
  ];
  const tierCardWidth = (PAGE_WIDTH - MARGIN * 2 - 12) / 3;
  const tierCardHeight = 150;
  page.drawText("Mastery by Difficulty Level (Gap Analysis)", {
    x: MARGIN,
    y: y - 12,
    size: 10,
    font: bodyBoldFont,
    color: NAVY,
  });
  let cardY = y - 22;
  tierCards.forEach((tier, index) => {
    const x = MARGIN + index * (tierCardWidth + 6);
    const stat = difficultyStats.find((item) => String(item.difficulty || "").toLowerCase() === tier.key);
    const percentage = percentValue(stat?.percentage);
    const aiText = presentation.aiDifficultyReviews?.[tier.key] || "AI review will appear here after generation.";
    const mentorText = presentation.difficultyReviews?.[tier.key] || "Mentor review will appear here.";

    page.drawRectangle({ x, y: cardY - tierCardHeight, width: tierCardWidth, height: tierCardHeight, borderColor: tier.border, borderWidth: 1, color: tier.fill });
    page.drawText(tier.label, { x: x + 8, y: cardY - 14, size: 9.5, font: bodyBoldFont, color: tier.color });
    page.drawText(`${percentage}%`, { x: x + tierCardWidth - 34, y: cardY - 14, size: 14, font: bodyBoldFont, color: tier.color });
    page.drawRectangle({ x: x + 8, y: cardY - 30, width: tierCardWidth - 16, height: 14, color: rgb(1, 1, 1) });
    page.drawText("Gemini AI Review", { x: x + 10, y: cardY - 26, size: 7.5, font: bodyBoldFont, color: tier.color });
    drawWrappedText(page, aiText, x + 8, cardY - 42, tierCardWidth - 16, bodyFont, 7.8, 10, TEXT);
    page.drawText("Mentor Edit", { x: x + 8, y: cardY - 86, size: 7.5, font: bodyBoldFont, color: MUTED });
    drawWrappedText(page, mentorText, x + 8, cardY - 98, tierCardWidth - 16, bodyFont, 7.8, 10, TEXT);
  });
  y = cardY - tierCardHeight - 12;

  page = await makePage();
  y = await drawPageChrome(page, pdfDoc, { body: bodyFont, bodyBold: bodyBoldFont, title: titleFont }, presentation, input.studentName, input.testTitle);
  y = drawSectionHeader(page, "6. TEACHER'S RECOMMENDATION", MARGIN, y, PAGE_WIDTH - MARGIN * 2, bodyBoldFont) - 10;
  page.drawRectangle({ x: MARGIN, y: y - 180, width: PAGE_WIDTH - MARGIN * 2, height: 180, borderWidth: 1, borderColor: BORDER });
  drawWrappedText(
    page,
    presentation.teacherRecommendation || "Teacher recommendation will appear here after generation.",
    MARGIN + 14,
    y - 18,
    PAGE_WIDTH - MARGIN * 2 - 28,
    serifFont,
    10.5,
    15,
    TEXT
  );

  page = await makePage();
  y = PAGE_HEIGHT - MARGIN;
  y = drawSectionHeader(page, "DETAILED ITEM ANALYSIS", MARGIN, y, PAGE_WIDTH - MARGIN * 2, bodyBoldFont) - 4;
  const colWidths = [34, 150, 72, 104, 104, 40, 40];
  const headers = ["Q#", "Topic / Sub-topic", "Difficulty", "Correct Answer", "Student Answer", "Score", "Status"];

  const drawTableHeader = (topY: number) => {
    let x = MARGIN;
    page.drawRectangle({ x: MARGIN, y: topY - 20, width: PAGE_WIDTH - MARGIN * 2, height: 20, color: NAVY });
    headers.forEach((header, index) => {
      page.drawText(header, { x: x + 4, y: topY - 14, size: 7.5, font: bodyBoldFont, color: rgb(1, 1, 1) });
      x += colWidths[index];
    });
    return topY - 22;
  };

  let tableY = drawTableHeader(y);
  const rowHeight = 18;
  for (const [index, question] of questionStats.entries()) {
    if (tableY - rowHeight < MARGIN + 24) {
      page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
      await drawWatermark(page, pdfDoc, 0.08);
      y = await drawPageChrome(page, pdfDoc, { body: bodyFont, bodyBold: bodyBoldFont, title: titleFont }, presentation, input.studentName, input.testTitle);
      tableY = drawTableHeader(y);
    }

    const rowTop = tableY;
    // alternating row background removed so watermark shows through

    let x = MARGIN;
    const cells = [
      question.questionNumber || String(index + 1),
      question.sectionName || "Topic",
      (question.difficulty || "medium").toUpperCase(),
      (question.correctAnswers || []).join(", ") || "-",
      (question.selectedAnswers || []).join(", ") || "-",
      String(question.scoreAwarded ?? 0),
    ];

    cells.forEach((cell, cellIndex) => {
      const width = colWidths[cellIndex];
      page.drawText(cell, {
        x: x + 4,
        y: rowTop - 12,
        size: 7.4,
        font: cellIndex === 0 || cellIndex === 5 ? bodyBoldFont : bodyFont,
        color: TEXT,
        maxWidth: width - 8,
      });
      x += width;
    });

    drawStatusIcon(page, x + 13, rowTop - 13, question.status, bodyFont);
    page.drawLine({ start: { x: MARGIN, y: rowTop - rowHeight }, end: { x: PAGE_WIDTH - MARGIN, y: rowTop - rowHeight }, thickness: 0.5, color: BORDER });
    tableY -= rowHeight;
  }

  /* Footer generated timestamp removed per request. */

  return pdfDoc.save();
}
