import { jsPDF } from "jspdf";

export interface ReportInterviewData {
  id?: number;
  role: string;
  type: string;
  difficulty: string;
  startedAt?: string;
  completedAt?: string;
  report: {
    overallScore: number;
    correctnessScore: number;
    communicationScore: number;
    structureScore: number;
    strengths: string[] | string;
    weaknesses: string[] | string;
    roadmapText: string;
  };
  questions: Array<{
    id: number;
    orderIndex?: number;
    text: string;
    sourceSkill?: string | null;
    response?: {
      answerText: string;
      correctnessScore: number | null;
      communicationScore: number | null;
      structureScore: number | null;
      feedback: string;
    } | null;
  }>;
}

export function generateVectorReportPdf(data: ReportInterviewData, sessionId: number | string): void {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const pageWidth = 210;
  const pageHeight = 297;
  const marginX = 16;
  const contentWidth = pageWidth - marginX * 2; // 178mm
  const bottomMargin = 20;
  const maxContentY = pageHeight - bottomMargin;

  let currentY = 18;

  // Colors & Helpers
  type RGB = readonly [number, number, number];
  const COLOR_PRIMARY: RGB = [37, 99, 235];      // #2563eb
  const COLOR_PRIMARY_DARK: RGB = [30, 58, 138]; // #1e3a8a
  const COLOR_DARK: RGB = [15, 23, 42];          // #0f172a
  const COLOR_SLATE: RGB = [71, 85, 105];        // #475569
  const COLOR_MUTED: RGB = [148, 163, 184];      // #94a3b8
  const COLOR_BORDER: RGB = [226, 232, 240];     // #e2e8f0
  const COLOR_BG_LIGHT: RGB = [248, 250, 252];   // #f8fafc
  const COLOR_GREEN: RGB = [16, 185, 129];       // #10b981
  const COLOR_GREEN_BG: RGB = [240, 253, 244];   // #f0fdf4
  const COLOR_RED: RGB = [239, 68, 68];          // #ef4444
  const COLOR_RED_BG: RGB = [254, 242, 242];     // #fef2f2
  const COLOR_PURPLE: RGB = [124, 58, 237];      // #7c3aed
  const COLOR_PURPLE_BG: RGB = [245, 243, 255];  // #f5f3ff

  const setTextColor = (rgb: RGB) => doc.setTextColor(rgb[0], rgb[1], rgb[2]);
  const setFillColor = (rgb: RGB) => doc.setFillColor(rgb[0], rgb[1], rgb[2]);
  const setDrawColor = (rgb: RGB) => doc.setDrawColor(rgb[0], rgb[1], rgb[2]);

  function checkPageBreak(neededHeight: number): void {
    if (currentY + neededHeight > maxContentY) {
      doc.addPage();
      currentY = 22;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // 1. TOP BRAND HEADER
  // ─────────────────────────────────────────────────────────────

  // Top accent bar
  doc.setFillColor(...COLOR_PRIMARY);
  doc.rect(0, 0, pageWidth, 4, "F");

  // Brand Name
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(...COLOR_PRIMARY_DARK);
  doc.text("INTERVIEWFORGE AI", marginX, currentY);

  // Badge: AUDIT REPORT
  const badgeText = "EXECUTIVE EVALUATION REPORT";
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  const badgeW = doc.getTextWidth(badgeText) + 8;
  doc.setFillColor(...COLOR_BG_LIGHT);
  doc.setDrawColor(...COLOR_PRIMARY);
  doc.roundedRect(pageWidth - marginX - badgeW, currentY - 5, badgeW, 7, 2, 2, "FD");
  doc.setTextColor(...COLOR_PRIMARY);
  doc.text(badgeText, pageWidth - marginX - badgeW + 4, currentY - 0.5);

  currentY += 8;

  // Title: Target Role
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(...COLOR_DARK);
  doc.text(data.role || "Technical Candidate Evaluation", marginX, currentY);

  currentY += 6;

  // Meta strip (Type, Difficulty, Date, Session)
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...COLOR_SLATE);
  const interviewDate = data.completedAt || data.startedAt
    ? new Date(data.completedAt || data.startedAt || "").toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : new Date().toLocaleDateString("en-US");

  const metaText = `Category: ${data.type || "GENERAL"}   |   Difficulty: ${data.difficulty || "STANDARD"}   |   Date: ${interviewDate}   |   Session ID: #${sessionId}`;
  doc.text(metaText, marginX, currentY);

  currentY += 4;

  // Divider Line
  doc.setDrawColor(...COLOR_BORDER);
  doc.setLineWidth(0.4);
  doc.line(marginX, currentY, pageWidth - marginX, currentY);

  currentY += 8;

  // ─────────────────────────────────────────────────────────────
  // 2. EXECUTIVE SCORECARD (4 KPI CARDS)
  // ─────────────────────────────────────────────────────────────

  const overallPct = Math.round((data.report.overallScore ?? 0) * 10);
  const correctnessPct = Math.round((data.report.correctnessScore ?? 0) * 10);
  const commPct = Math.round((data.report.communicationScore ?? 0) * 10);
  const structPct = Math.round((data.report.structureScore ?? 0) * 10);

  const cardGap = 4;
  const cardW = (contentWidth - cardGap * 3) / 4;
  const cardH = 30;

  const scoreCards: Array<{
    label: string;
    val: string;
    pct: number;
    color: RGB;
    highlight: boolean;
  }> = [
    { label: "OVERALL SCORE", val: `${overallPct}%`, pct: overallPct, color: COLOR_PRIMARY, highlight: true },
    { label: "CORRECTNESS", val: `${correctnessPct}%`, pct: correctnessPct, color: [59, 130, 246], highlight: false },
    { label: "COMMUNICATION", val: `${commPct}%`, pct: commPct, color: [139, 92, 246], highlight: false },
    { label: "STRUCTURE", val: `${structPct}%`, pct: structPct, color: COLOR_GREEN, highlight: false },
  ];

  scoreCards.forEach((sc, i) => {
    const cardX = marginX + i * (cardW + cardGap);
    
    // Background card
    if (sc.highlight) {
      doc.setFillColor(239, 246, 255); // light blue
      setDrawColor(COLOR_PRIMARY);
      doc.setLineWidth(0.6);
    } else {
      setFillColor(COLOR_BG_LIGHT);
      setDrawColor(COLOR_BORDER);
      doc.setLineWidth(0.3);
    }
    doc.roundedRect(cardX, currentY, cardW, cardH, 2.5, 2.5, "FD");

    // Label
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    setTextColor(sc.highlight ? COLOR_PRIMARY_DARK : COLOR_SLATE);
    doc.text(sc.label, cardX + cardW / 2, currentY + 7, { align: "center" });

    // Large Score Number
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    setTextColor(sc.highlight ? COLOR_PRIMARY : COLOR_DARK);
    doc.text(sc.val, cardX + cardW / 2, currentY + 18, { align: "center" });

    // Progress bar inside card
    const barW = cardW - 10;
    const barH = 2.5;
    const barX = cardX + 5;
    const barY = currentY + 22;

    // Track
    doc.setFillColor(226, 232, 240);
    doc.roundedRect(barX, barY, barW, barH, 1, 1, "F");

    // Fill
    const fillW = Math.max(1, (barW * sc.pct) / 100);
    setFillColor(sc.color);
    doc.roundedRect(barX, barY, fillW, barH, 1, 1, "F");
  });

  currentY += cardH + 10;

  // ─────────────────────────────────────────────────────────────
  // 3. STRENGTHS & WEAKNESSES
  // ─────────────────────────────────────────────────────────────

  const strengthsList: string[] = Array.isArray(data.report.strengths)
    ? data.report.strengths
    : typeof data.report.strengths === "string" && data.report.strengths
    ? [data.report.strengths]
    : ["Clear communication and positive demeanor."];

  const weaknessesList: string[] = Array.isArray(data.report.weaknesses)
    ? data.report.weaknesses
    : typeof data.report.weaknesses === "string" && data.report.weaknesses
    ? [data.report.weaknesses]
    : ["Deepen architectural trade-off explanations."];

  // Calculate box height dynamically based on wrapped text
  const boxGap = 5;
  const boxW = (contentWidth - boxGap) / 2;

  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  const strengthLinesList = strengthsList.map((s) => doc.splitTextToSize(`•  ${s}`, boxW - 12));
  const weaknessLinesList = weaknessesList.map((w) => doc.splitTextToSize(`•  ${w}`, boxW - 12));

  const countStrengthLines = strengthLinesList.reduce((acc, l) => acc + l.length, 0);
  const countWeaknessLines = weaknessLinesList.reduce((acc, l) => acc + l.length, 0);
  const maxBulletLines = Math.max(countStrengthLines, countWeaknessLines);
  const swBoxHeight = Math.max(36, 14 + maxBulletLines * 4.6);

  checkPageBreak(swBoxHeight + 6);

  // Strengths Box (Left)
  const strengthBoxX = marginX;
  doc.setFillColor(...COLOR_GREEN_BG);
  doc.setDrawColor(...COLOR_GREEN);
  doc.setLineWidth(0.4);
  doc.roundedRect(strengthBoxX, currentY, boxW, swBoxHeight, 2.5, 2.5, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(5, 150, 105);
  doc.text("KEY STRENGTHS", strengthBoxX + 6, currentY + 8);

  let sY = currentY + 14;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...COLOR_DARK);
  strengthLinesList.forEach((lines) => {
    lines.forEach((line: string) => {
      doc.text(line, strengthBoxX + 6, sY);
      sY += 4.5;
    });
  });

  // Areas for Improvement Box (Right)
  const weaknessBoxX = marginX + boxW + boxGap;
  doc.setFillColor(...COLOR_RED_BG);
  doc.setDrawColor(...COLOR_RED);
  doc.setLineWidth(0.4);
  doc.roundedRect(weaknessBoxX, currentY, boxW, swBoxHeight, 2.5, 2.5, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(220, 38, 38);
  doc.text("AREAS FOR IMPROVEMENT", weaknessBoxX + 6, currentY + 8);

  let wY = currentY + 14;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...COLOR_DARK);
  weaknessLinesList.forEach((lines) => {
    lines.forEach((line: string) => {
      doc.text(line, weaknessBoxX + 6, wY);
      wY += 4.5;
    });
  });

  currentY += swBoxHeight + 8;

  // ─────────────────────────────────────────────────────────────
  // 4. PERSONALIZED LEARNING ROADMAP
  // ─────────────────────────────────────────────────────────────

  if (data.report.roadmapText) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    const roadmapLines = doc.splitTextToSize(data.report.roadmapText, contentWidth - 14);
    const roadmapBoxH = 15 + roadmapLines.length * 4.4;

    checkPageBreak(Math.min(roadmapBoxH + 4, 60));

    doc.setFillColor(...COLOR_PURPLE_BG);
    doc.setDrawColor(...COLOR_PURPLE);
    doc.setLineWidth(0.4);
    doc.roundedRect(marginX, currentY, contentWidth, roadmapBoxH, 2.5, 2.5, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(...COLOR_PURPLE);
    doc.text("PERSONALIZED LEARNING & REVISION ROADMAP", marginX + 6, currentY + 8);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...COLOR_DARK);
    let rY = currentY + 14;
    roadmapLines.forEach((line: string) => {
      // If within box
      doc.text(line, marginX + 6, rY);
      rY += 4.4;
    });

    currentY += roadmapBoxH + 10;
  }

  // ─────────────────────────────────────────────────────────────
  // 5. DETAILED QUESTION & ANSWER BREAKDOWN
  // ─────────────────────────────────────────────────────────────

  checkPageBreak(25);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...COLOR_DARK);
  doc.text("Question-by-Question Evaluation Breakdown", marginX, currentY);

  currentY += 3;
  doc.setDrawColor(...COLOR_BORDER);
  doc.setLineWidth(0.3);
  doc.line(marginX, currentY, pageWidth - marginX, currentY);
  currentY += 7;

  const questions = data.questions || [];

  questions.forEach((q, idx) => {
    const qNum = idx + 1;
    const resp = q.response;
    const qText = q.text || "Interview Question";
    const answerText = resp?.answerText ? resp.answerText : "No answer submitted.";
    const feedbackText = resp?.feedback ? resp.feedback : "No feedback recorded for this question.";

    const cScore = resp?.correctnessScore ?? 0;
    const commScore = resp?.communicationScore ?? 0;
    const sScore = resp?.structureScore ?? 0;

    // Calculate heights for text elements
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    const qLines = doc.splitTextToSize(qText, contentWidth - 28);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    const ansLines = doc.splitTextToSize(answerText, contentWidth - 16);
    const fbLines = doc.splitTextToSize(feedbackText, contentWidth - 16);

    const questionBlockH =
      12 +
      qLines.length * 4.5 +
      10 +
      ansLines.length * 4.2 +
      10 +
      fbLines.length * 4.2 +
      14;

    // Make sure entire question card stays intact whenever possible
    checkPageBreak(Math.min(questionBlockH, 90));

    const cardStartY = currentY;

    // Card background
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(...COLOR_BORDER);
    doc.setLineWidth(0.4);
    doc.roundedRect(marginX, cardStartY, contentWidth, questionBlockH, 2.5, 2.5, "FD");

    // Question Header Pill: "Q1"
    doc.setFillColor(...COLOR_PRIMARY);
    doc.roundedRect(marginX + 4, cardStartY + 5, 12, 6, 1.5, 1.5, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(255, 255, 255);
    doc.text(`Q${qNum}`, marginX + 10, cardStartY + 9.2, { align: "center" });

    // Source Skill Pill if present
    if (q.sourceSkill) {
      doc.setFontSize(7);
      doc.setFont("helvetica", "bold");
      const skillText = `Skill: ${q.sourceSkill}`;
      const skillW = doc.getTextWidth(skillText) + 6;
      doc.setFillColor(241, 245, 249);
      doc.setDrawColor(...COLOR_BORDER);
      doc.roundedRect(pageWidth - marginX - skillW - 4, cardStartY + 5, skillW, 6, 1.5, 1.5, "FD");
      doc.setTextColor(...COLOR_SLATE);
      doc.text(skillText, pageWidth - marginX - skillW - 1, cardStartY + 9.2);
    }

    // Question Text
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...COLOR_DARK);
    let qY = cardStartY + 9.5;
    qLines.forEach((line: string) => {
      doc.text(line, marginX + 20, qY);
      qY += 4.5;
    });

    let innerY = Math.max(cardStartY + 16, qY + 2);

    // Candidate Answer Box
    doc.setFillColor(...COLOR_BG_LIGHT);
    doc.setDrawColor(...COLOR_BORDER);
    const ansBoxH = ansLines.length * 4.2 + 8;
    doc.roundedRect(marginX + 4, innerY, contentWidth - 8, ansBoxH, 1.5, 1.5, "FD");

    // Left Accent bar on answer
    doc.setFillColor(...COLOR_PRIMARY);
    doc.rect(marginX + 4, innerY, 1.5, ansBoxH, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(...COLOR_SLATE);
    doc.text("Candidate Answer:", marginX + 8, innerY + 4.5);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.2);
    doc.setTextColor(...COLOR_DARK);
    let aY = innerY + 8.5;
    ansLines.forEach((line: string) => {
      doc.text(line, marginX + 8, aY);
      aY += 4.2;
    });

    innerY += ansBoxH + 4;

    // Scores Bar for this question
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(...COLOR_SLATE);
    const scoresSummary = `Scores  —  Correctness: ${cScore * 10}%   |   Communication: ${commScore * 10}%   |   Structure: ${sScore * 10}%`;
    doc.text(scoresSummary, marginX + 6, innerY + 2);

    innerY += 5;

    // AI Feedback Box
    const fbBoxH = fbLines.length * 4.2 + 8;
    doc.setFillColor(239, 246, 255); // Soft blue
    doc.setDrawColor(191, 219, 254);
    doc.roundedRect(marginX + 4, innerY, contentWidth - 8, fbBoxH, 1.5, 1.5, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(...COLOR_PRIMARY_DARK);
    doc.text("AI Examiner Feedback & Advice:", marginX + 8, innerY + 4.5);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.2);
    doc.setTextColor(...COLOR_DARK);
    let fY = innerY + 8.5;
    fbLines.forEach((line: string) => {
      doc.text(line, marginX + 8, fY);
      fY += 4.2;
    });

    currentY = cardStartY + questionBlockH + 6;
  });

  // ─────────────────────────────────────────────────────────────
  // 6. GLOBAL HEADERS & FOOTERS ON ALL PAGES
  // ─────────────────────────────────────────────────────────────

  const totalPages = doc.getNumberOfPages();

  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);

    // Running top header on pages 2+
    if (p > 1) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(...COLOR_MUTED);
      doc.text("InterviewForge AI  ·  Evaluation Report", marginX, 12);
      doc.text(data.role || "Technical Evaluation", pageWidth - marginX, 12, { align: "right" });

      doc.setDrawColor(...COLOR_BORDER);
      doc.setLineWidth(0.2);
      doc.line(marginX, 14, pageWidth - marginX, 14);
    }

    // Bottom Footer (all pages)
    const footerY = pageHeight - 10;
    doc.setDrawColor(...COLOR_BORDER);
    doc.setLineWidth(0.2);
    doc.line(marginX, footerY - 3, pageWidth - marginX, footerY - 3);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...COLOR_MUTED);
    doc.text("Generated by InterviewForge AI  ·  Strictly Confidential", marginX, footerY);

    const pageStr = `Page ${p} of ${totalPages}`;
    doc.text(pageStr, pageWidth - marginX, footerY, { align: "right" });
  }

  // Save the PDF
  doc.save(`InterviewForge_Report_${sessionId}.pdf`);
}
