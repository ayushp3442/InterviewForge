// test-gemini.js
// Quick sanity check: (1) API key works, (2) structured JSON output works reliably.
// Run: node test-gemini.js

require('dotenv').config();

const API_KEY = process.env.GEMINI_API_KEY;
const MODEL = "gemini-flash-latest"; // alias — always points to current stable flash model

if (!API_KEY) {
  console.error("❌ GEMINI_API_KEY not found in .env — check your .env file");
  process.exit(1);
}

async function testBasicCall() {
  console.log("\n--- Test 1: Basic text generation ---");
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: "Say hello in one short sentence." }] }],
      }),
    }
  );
  const data = await res.json();
  if (!res.ok) {
    console.error("❌ API call failed:", JSON.stringify(data, null, 2));
    return false;
  }
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  console.log("✅ Response:", text);
  return true;
}

async function testStructuredJSON() {
  console.log("\n--- Test 2: Structured JSON output (mimics generateQuestions) ---");
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: "Generate 2 technical interview questions for a candidate skilled in React. Return ONLY valid JSON, no markdown formatting, matching this exact shape: { \"questions\": [ { \"text\": string, \"sourceSkill\": string } ] }",
              },
            ],
          },
        ],
        generationConfig: {
          responseMimeType: "application/json",
        },
      }),
    }
  );
  const data = await res.json();
  if (!res.ok) {
    console.error("❌ API call failed:", JSON.stringify(data, null, 2));
    return false;
  }
  const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
  console.log("Raw output:", rawText);

  try {
    const parsed = JSON.parse(rawText);
    console.log("✅ Parsed successfully:", JSON.stringify(parsed, null, 2));
    if (Array.isArray(parsed.questions) && parsed.questions.length > 0) {
      console.log("✅ Shape matches expected schema");
    } else {
      console.warn("⚠️  JSON parsed but shape doesn't match — questions array missing/empty");
    }
    return true;
  } catch (e) {
    console.error("❌ Failed to parse as JSON:", e.message);
    return false;
  }
}

(async () => {
  const t1 = await testBasicCall();
  const t2 = await testStructuredJSON();
  console.log("\n--- Summary ---");
  console.log(t1 ? "✅ Basic call: PASS" : "❌ Basic call: FAIL");
  console.log(t2 ? "✅ Structured JSON: PASS" : "❌ Structured JSON: FAIL");
})();