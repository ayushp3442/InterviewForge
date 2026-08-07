"use client";
import { useState } from "react";

export default function ResumeUploadPage() {
  const [fileName, setFileName] = useState<string | null>(null);
  const [parsing, setParsing] = useState(false);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setParsing(true);
      // TODO: replace with real upload + AI parsing call later
      setTimeout(() => setParsing(false), 2000);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-xl p-8 shadow-sm border border-gray-200">
        <h1 className="text-lg font-medium mb-1 text-center">Upload your resume</h1>
        <p className="text-sm text-gray-500 mb-6 text-center">
          We'll use this to generate personalized interview questions
        </p>

        <label
          htmlFor="resume-file"
          className="block border-2 border-dashed border-gray-300 rounded-lg py-10 text-center cursor-pointer hover:border-gray-400"
        >
          <p className="text-sm text-gray-600 mb-1">
            {fileName ? fileName : "Drag your resume here or click to browse"}
          </p>
          <p className="text-xs text-gray-400">PDF or DOCX, max 5MB</p>
          <input
            id="resume-file"
            type="file"
            accept=".pdf,.docx"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>

        {parsing && (
          <p className="text-sm text-blue-600 mt-4 text-center">
            Extracting your details...
          </p>
        )}

        <button
          disabled={!fileName || parsing}
          className="w-full bg-gray-900 text-white rounded-lg py-2 text-sm font-medium mt-6 disabled:opacity-40"
        >
          Continue
        </button>
      </div>
    </div>
  );
}