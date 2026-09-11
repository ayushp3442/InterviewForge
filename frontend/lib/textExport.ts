/**
 * Text Report Generator for InterviewForge AI
 * Generates an executive, beautifully-spaced ASCII text report.
 */

function wrapText(text: string, maxWidth = 76, indent = "  "): string {
  if (!text) return indent + "N/A";
  const paragraphs = text.split("\n");
  const result: string[] = [];

  for (const para of paragraphs) {
    if (!para.trim()) {
      result.push("");
      continue;
    }
    const words = para.trim().split(/\s+/);
    let line = indent;

    for (const word of words) {
      if ((line + word).length > maxWidth) {
        result.push(line.trimEnd());
        line = indent + word + " ";
      } else {
        line += word + " ";
      }
    }
    if (line.trim()) {
      result.push(line.trimEnd());
    }
  }

  return result.join("\n");
}

function getRating(pct: number): string {
  if (pct >= 85) return "Exceptional (Strong Hire)";
  if (pct >= 70) return "Proficient (Target Met)";
  if (pct >= 50) return "Competent (Needs Minor Practice)";
  return "Developing (Needs Focus)";
}

export function generateFormattedTextReport(data: any, sessionId: number | string): string {
  const { report, role, type, difficulty, questions } = data;
  const strengths: string[] = Array.isArray(report.strengths)
    ? report.strengths
    : typeof report.strengths === "string" && report.strengths
    ? [report.strengths]
    : ["Clear communication and positive engagement."];

  const weaknesses: string[] = Array.isArray(report.weaknesses)
    ? report.weaknesses
    : typeof report.weaknesses === "string" && report.weaknesses
    ? [report.weaknesses]
    : ["Deepen architectural trade-offs in complex answers."];

  const overallPct = Math.round((report.overallScore ?? 0) * 10);
  const correctnessPct = Math.round((report.correctnessScore ?? 0) * 10);
  const commPct = Math.round((report.communicationScore ?? 0) * 10);
  const structPct = Math.round((report.structureScore ?? 0) * 10);

  const dateStr = data.completedAt || data.startedAt
    ? new Date(data.completedAt || data.startedAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : new Date().toLocaleDateString("en-US");

  const lines: string[] = [];

  const hrDbl = "=".repeat(80);
  const hrSgl = "-".repeat(80);

  // 1. Header
  lines.push(hrDbl);
  lines.push("                    INTERVIEWFORGE AI — EVALUATION REPORT                       ");
  lines.push("                 Performance Assessment & AI Feedback Audit                     ");
  lines.push(hrDbl);
  lines.push("");

  // 2. Metadata
  lines.push("SESSION METADATA");
  lines.push(hrSgl);
  lines.push(`• Target Role    : ${role || "Software Engineer"}`);
  lines.push(`• Category       : ${type || "TECHNICAL"}`);
  lines.push(`• Difficulty     : ${difficulty || "STANDARD"}`);
  lines.push(`• Date Completed : ${dateStr}`);
  lines.push(`• Session ID     : #${sessionId}`);
  lines.push("");

  // 3. Scorecard
  lines.push("EXECUTIVE SCORECARD & PERFORMANCE SUMMARY");
  lines.push(hrSgl);
  lines.push("┌───────────────────────────────────┬─────────┬────────────────────────────────┐");
  lines.push("│ EVALUATION METRIC                 │  SCORE  │ ASSESSMENT RATING              │");
  lines.push("├───────────────────────────────────┼─────────┼────────────────────────────────┤");
  lines.push(`│ Overall Performance               │  ${String(overallPct).padStart(4)}%  │ ${getRating(overallPct).padEnd(30)} │`);
  lines.push(`│ Technical Correctness             │  ${String(correctnessPct).padStart(4)}%  │ ${getRating(correctnessPct).padEnd(30)} │`);
  lines.push(`│ Articulation & Communication      │  ${String(commPct).padStart(4)}%  │ ${getRating(commPct).padEnd(30)} │`);
  lines.push(`│ Answer Structure & Coherence      │  ${String(structPct).padStart(4)}%  │ ${getRating(structPct).padEnd(30)} │`);
  lines.push("└───────────────────────────────────┴─────────┴────────────────────────────────┘");
  lines.push("");

  // 4. Strengths
  lines.push("KEY STRENGTHS IDENTIFIED");
  lines.push(hrSgl);
  strengths.forEach((s) => {
    lines.push(`[+] ${s}`);
  });
  lines.push("");

  // 5. Weaknesses
  lines.push("AREAS FOR IMPROVEMENT & GAPS");
  lines.push(hrSgl);
  weaknesses.forEach((w) => {
    lines.push(`[-] ${w}`);
  });
  lines.push("");

  // 6. Roadmap
  if (report.roadmapText) {
    lines.push("PERSONALIZED LEARNING & REVISION ROADMAP");
    lines.push(hrSgl);
    lines.push(wrapText(report.roadmapText, 76, "  "));
    lines.push("");
  }

  // 7. Q&A Breakdown
  lines.push(hrDbl);
  lines.push("                 DETAILED QUESTION & ANSWER BREAKDOWN                           ");
  lines.push(hrDbl);
  lines.push("");

  const qList = questions || [];
  qList.forEach((q: any, i: number) => {
    const qNum = i + 1;
    const r = q.response || {};
    const skillBadge = q.sourceSkill ? ` [Skill Tag: ${q.sourceSkill}]` : "";

    lines.push(hrSgl);
    lines.push(`QUESTION ${qNum} OF ${qList.length}${skillBadge}`);
    lines.push(hrSgl);
    lines.push("Prompt:");
    lines.push(wrapText(q.text, 76, "  "));
    lines.push("");

    lines.push("Candidate Answer:");
    const ans = r.answerText || "No answer recorded.";
    lines.push(wrapText(ans, 76, "  > "));
    lines.push("");

    const cScore = r.correctnessScore != null ? `${r.correctnessScore * 10}%` : "N/A";
    const cmScore = r.communicationScore != null ? `${r.communicationScore * 10}%` : "N/A";
    const sScore = r.structureScore != null ? `${r.structureScore * 10}%` : "N/A";

    lines.push("Scores Breakdown:");
    lines.push(`  • Correctness   : ${cScore}`);
    lines.push(`  • Communication : ${cmScore}`);
    lines.push(`  • Structure     : ${sScore}`);
    lines.push("");

    lines.push("AI Examiner Feedback & Advice:");
    const fb = r.feedback || "No specific feedback recorded.";
    lines.push(wrapText(fb, 76, "  * "));
    lines.push("");
  });

  // Footer
  lines.push(hrDbl);
  lines.push(`End of Report  ·  InterviewForge AI  ·  Report ID: #${sessionId}`);
  lines.push(hrDbl);

  return lines.join("\n");
}
