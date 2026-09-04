"use client";
import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";
import { uploadResume } from "@/lib/api";

type UploadState = "idle" | "uploading" | "success" | "error";

function ResumeUploadContent() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [parsedSkills, setParsedSkills] = useState<string[]>([]);

  const validateFile = (file: File): string | null => {
    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
    ];
    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(pdf|docx|doc)$/i)) {
      return "Only PDF or DOCX files are allowed.";
    }
    if (file.size > 5 * 1024 * 1024) {
      return "File size must be under 5 MB.";
    }
    return null;
  };

  const handleFile = useCallback((file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setErrorMsg(validationError);
      setSelectedFile(null);
      return;
    }
    setErrorMsg("");
    setSelectedFile(file);
    setUploadState("idle");
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploadState("uploading");
    setErrorMsg("");
    try {
      const res = await uploadResume(selectedFile);
      // Extract parsed skills if available
      const skills = res?.resume?.parsedJson?.skills ?? [];
      setParsedSkills(Array.isArray(skills) ? skills.slice(0, 8) : []);
      setUploadState("success");
    } catch (err: any) {
      setErrorMsg(err.message || "Upload failed. Please try again.");
      setUploadState("error");
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setUploadState("idle");
    setErrorMsg("");
    setParsedSkills([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

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
          <h1 className="text-lg font-semibold text-gray-900">Upload Resume</h1>
        </div>

        {uploadState === "success" ? (
          /* ── Success State ── */
          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 text-center">
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-base font-semibold text-gray-800 mb-1">Resume uploaded!</h2>
            <p className="text-sm text-gray-500 mb-4">
              Your resume has been parsed and saved. Future interview questions will be tailored to your background.
            </p>

            {parsedSkills.length > 0 && (
              <div className="mb-6">
                <p className="text-xs font-semibold text-gray-600 mb-2">Detected skills</p>
                <div className="flex flex-wrap gap-1.5 justify-center">
                  {parsedSkills.map((skill) => (
                    <span
                      key={skill}
                      className="text-xs bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleReset}
                className="flex-1 bg-white border border-gray-200 rounded-lg py-2 text-sm text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Upload another
              </button>
              <button
                onClick={() => router.push("/interview-setup")}
                className="flex-1 bg-gray-900 text-white rounded-lg py-2 text-sm font-medium hover:bg-gray-800 transition-colors"
              >
                Start interview →
              </button>
            </div>
          </div>
        ) : (
          /* ── Upload State ── */
          <>
            {/* Drop zone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              className={`bg-white rounded-xl border-2 border-dashed p-10 text-center shadow-sm cursor-pointer transition-colors ${
                dragOver
                  ? "border-gray-600 bg-gray-50"
                  : selectedFile
                  ? "border-green-400 bg-green-50"
                  : "border-gray-200 hover:border-gray-400"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.doc"
                className="hidden"
                onChange={handleInputChange}
              />

              {selectedFile ? (
                /* File selected */
                <div>
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-gray-800">{selectedFile.name}</p>
                  <p className="text-xs text-gray-500 mt-1">{(selectedFile.size / 1024).toFixed(0)} KB</p>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleReset(); }}
                    className="mt-2 text-xs text-gray-400 hover:text-gray-600 underline"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                /* Empty state */
                <div>
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m6.75 12-3-3m0 0-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-gray-800">Drag & drop your resume here</p>
                  <p className="text-xs text-gray-500 mt-1">or click to browse files</p>
                  <p className="text-xs text-gray-400 mt-2">PDF or DOCX — max 5 MB</p>
                </div>
              )}
            </div>

            {/* Error message */}
            {errorMsg && (
              <p className="text-xs text-red-600 mt-2 text-center">{errorMsg}</p>
            )}

            {/* Upload button */}
            <button
              onClick={handleUpload}
              disabled={!selectedFile || uploadState === "uploading"}
              className="w-full mt-4 bg-gray-900 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {uploadState === "uploading" ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Uploading & parsing resume...
                </span>
              ) : (
                "Upload & Parse Resume"
              )}
            </button>

            {/* Info card */}
            <div className="mt-4 bg-blue-50 border border-blue-100 rounded-xl p-4">
              <p className="text-xs font-semibold text-blue-800 mb-1">What this does</p>
              <ul className="text-xs text-blue-700 space-y-1 list-disc pl-4">
                <li>Parses your resume to extract skills &amp; project details</li>
                <li>Tailors interview questions to your specific background</li>
                <li>Shows which questions were inspired by your resume skills</li>
              </ul>
            </div>
          </>
        )}
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