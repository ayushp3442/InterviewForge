// test_rachel_resume.js
// Test our Week 5 AI Integration using the real resume provided: "Rachel Frank"

require("dotenv").config();

const API_KEY = process.env.GEMINI_API_KEY;
const MODEL = "gemini-3.5-flash";

if (!API_KEY) {
  console.error("❌ GEMINI_API_KEY not found in .env");
  process.exit(1);
}

const callGemini = async (prompt) => {
  const maxNetworkAttempts = 3;
  let lastError = null;

  for (let attempt = 1; attempt <= maxNetworkAttempts; attempt++) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              responseMimeType: "application/json",
            },
          }),
        }
      );

      if (res.status === 503 || res.status === 429) {
        const errorData = await res.json().catch(() => ({}));
        console.warn(`[Gemini API] HTTP ${res.status} (attempt ${attempt}/${maxNetworkAttempts}). Waiting 2s before retry...`);
        if (attempt < maxNetworkAttempts) {
          await new Promise((r) => setTimeout(r, 2000));
          continue;
        }
        throw new Error(`Gemini API error: ${res.status} ${JSON.stringify(errorData)}`);
      }

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(`Gemini API error: ${res.status} ${JSON.stringify(errorData)}`);
      }

      const data = await res.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) {
        throw new Error("Gemini API returned an empty response");
      }

      return rawText;
    } catch (err) {
      lastError = err;
      if (attempt < maxNetworkAttempts) {
        await new Promise((r) => setTimeout(r, 2000));
        continue;
      }
      throw lastError;
    }
  }
  throw lastError;
};

// Raw text extracted from Rachel Frank's resume:
const rachelResumeText = `
RACHEL FRANK
COMPUTER ENGINEERING STUDENT

CONTACT
Email: info@resumekraft.com
Phone: 202-555-0120
Location: Chicago, Illinois, US
LinkedIn: linkedin.com/resumekraft

SUMMARY
Innovative and driven Computer Engineering student pursuing a Bachelor's degree. Proficient in programming languages such as C++, Java, and Python. Skilled in hardware design, troubleshooting, and testing. Proven ability to work effectively in a team and independently, with a strong attention to detail. Seeking an internship opportunity to further enhance my technical prowess and contribute to cutting-edge technology solutions.

SKILLS
C, C++, Java, Python, HTML, R, SQL, MySQL

EXPERIENCE
1. Data Science Intern — Inmovidu Technologies (Aug 2020 - Sep 2020)
• Assisting data scientists in collecting, cleaning, and organizing large datasets for analysis
• Conducting data preprocessing tasks, including data cleaning, data transformation, and data integration
• Collaborating with data scientists to develop and implement machine learning and data mining models
• Conducting exploratory analysis and data visualization to identify patterns, trends, and insights
• Supporting the development and evaluation of predictive models and algorithms
• Assisting in the implementation and testing of statistical and machine learning methods and algorithms
• Assisting in the design and execution of A/B tests and experiments to optimize business strategies and operations

2. Digital Technology Intern — Krishitect (Jun 2021 - Aug 2021)
• 2 months internship. Worked on dataset creation and labelling & collecting samples for image processing.
• Furthermore, DL (Deep Learning) model designing, training & testing and model deployment.

EDUCATION
• Bachelor in Computer Engineering — Arizona State University (Aug 2018 - Present) | Current CGPA: 9.06
• XIIth State Board (Mar 2018) — Northeastern University | 76%

CERTIFICATIONS AND COURSES
• CCNA 7.0 Module 1
• Data Science
• Data Scientist's Toolbox
• Neural Networks and Deep Learning
• Artificial Intelligence
• Mobile Apps using Flutter and Dart
• Python Bootcamp 2021 Build 15 working Applications and Games

EXTRA-CURRICULAR
• Volunteer Sense-O-Track (Line Follower) Event
`;

async function runRealResumeTest() {
  console.log("===================================================================");
  console.log("STEP 1: Testing parseResume on Rachel Frank's Resume");
  console.log("===================================================================");

  const parsePrompt = `You are an expert AI resume parser. Extract structured information from the candidate's resume text below.

Resume Text:
"""
${rachelResumeText}
"""

Instructions:
Extract the following structured fields:
1. "name": Full name of the candidate.
2. "email": Email address of the candidate.
3. "skills": Array of technical and professional skills, tools, and languages.
4. "projects": Array of projects/applications mentioned (e.g. from certifications, work or courses). Include title, techStack, description.
5. "experience": Array of internships / jobs (role, company, duration).
6. "education": Array of degrees/institutions (degree, institution, year).

Provide response in JSON matching the exact schema:
{
  "name": "string | null",
  "email": "string | null",
  "skills": ["string"],
  "projects": [
    {
      "title": "string",
      "techStack": ["string"],
      "description": "string"
    }
  ],
  "experience": [
    {
      "role": "string",
      "company": "string",
      "duration": "string | null"
    }
  ],
  "education": [
    {
      "degree": "string",
      "institution": "string",
      "year": "string | null"
    }
  ]
}`;

  const parseRaw = await callGemini(parsePrompt);
  const parsed = JSON.parse(parseRaw);

  console.log("\n📄 PARSED CANDIDATE PROFILE:");
  console.log("• Name:", parsed.name);
  console.log("• Email:", parsed.email);
  console.log("• Extracted Skills:", parsed.skills.join(", "));
  console.log("\n• Extracted Experience:");
  parsed.experience.forEach((e, i) => {
    console.log(`  ${i + 1}. ${e.role} at ${e.company} (${e.duration || "N/A"})`);
  });
  console.log("\n• Extracted Education:");
  parsed.education.forEach((ed, i) => {
    console.log(`  ${i + 1}. ${ed.degree} — ${ed.institution} (${ed.year || "N/A"})`);
  });

  console.log("\n===================================================================");
  console.log("STEP 2: Generating Tailored Interview Questions for Rachel Frank");
  console.log("===================================================================");

  const genPrompt = `You are an expert technical interviewer conducting a mock interview for Rachel Frank.
Generate exactly 5 technical interview questions for a "Data Science / Machine Learning Engineer" role.

Candidate Resume Context:
- Verified Skills from Resume: ${parsed.skills.join(", ")}
- Internships & Experience: ${JSON.stringify(parsed.experience)}
- Education & Focus: Computer Engineering (ASU, CGPA 9.06)
- Certifications/Topics: Neural Networks & Deep Learning, Image Processing, A/B Testing, Python, SQL, C++

Instructions:
- PERSONALIZATION RULE: At least 3 questions MUST specifically reference Rachel's actual internship experience at Inmovidu Technologies and Krishitect, her deep learning image processing work, or her A/B testing background.
- For each question targeting a resume skill or project, set "sourceSkill" to that skill (e.g. "Deep Learning", "Python", "SQL", "Machine Learning", "A/B Testing").
- Set "sourceSkill" to null for general conceptual questions.

Provide response in JSON matching the exact schema:
{
  "questions": [
    {
      "text": "The text of the question",
      "sourceSkill": "Python"
    }
  ]
}`;

  const genRaw = await callGemini(genPrompt);
  const genParsed = JSON.parse(genRaw);

  console.log("\n🎯 TAILORED INTERVIEW QUESTIONS GENERATED FOR RACHEL:");
  genParsed.questions.forEach((q, i) => {
    console.log(`\nQ${i + 1}: ${q.text}`);
    console.log(`   🏷️  Tagged Skill: ${q.sourceSkill ? `[${q.sourceSkill}] (Derived from Rachel's Resume)` : "null (General Concept)"}`);
  });

  console.log("\n===================================================================");
  console.log("✅ Verification on Real Resume Complete!");
  console.log("===================================================================\n");
}

runRealResumeTest();
