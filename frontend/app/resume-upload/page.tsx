"use client";
import { useRouter } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";

function ResumeUploadContent() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-lg mx-auto">

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => router.push("/dashboard")}
            className="text-gray-400 hover:text-gray-700 text-sm transition-colors"
          >
            ← Back
          </button>
          <h1 className="text-lg font-semibold text-gray-900">Resume Upload</h1>
        </div>

        {/* Upload card */}
        <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-12 text-center shadow-sm">
          {/* Icon */}
          <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-7 h-7 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m6.75 12-3-3m0 0-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
              />
            </svg>
          </div>

          <h2 className="text-base font-semibold text-gray-800 mb-2">Upload your resume</h2>
          <p className="text-sm text-gray-500 mb-1">PDF or DOCX — max 5 MB</p>

          {/* Coming soon badge */}
          <div className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-medium px-3 py-1 rounded-full mt-3 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            Coming in Week 5
          </div>

          {/* Stub upload area */}
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 cursor-not-allowed opacity-50 mb-4">
            <p className="text-sm text-gray-400">Drag &amp; drop your resume here</p>
            <p className="text-xs text-gray-400 mt-1">or click to browse files</p>
          </div>

          <button
            disabled
            className="w-full bg-gray-900 text-white rounded-lg py-2 text-sm font-medium opacity-40 cursor-not-allowed"
          >
            Upload &amp; Parse Resume
          </button>
        </div>

        {/* Info card */}
        <div className="mt-4 bg-blue-50 border border-blue-100 rounded-xl p-4">
          <p className="text-xs font-semibold text-blue-800 mb-1">What this will do (Week 5)</p>
          <ul className="text-xs text-blue-700 space-y-1 list-disc pl-4">
            <li>Parse your resume to extract skills &amp; project details</li>
            <li>Generate interview questions tailored to your background</li>
            <li>Show which questions were inspired by your resume skills</li>
          </ul>
        </div>

      </div>
    </div>
  );
}

export default function ResumeUploadPage() {
  return (
    <AuthGuard>
      <ResumeUploadContent />
    </AuthGuard>
  );
}