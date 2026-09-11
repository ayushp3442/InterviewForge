"use client";
import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";
import AppLayout from "@/components/AppLayout";
import { uploadResume, updateResumeSkills } from "@/lib/api";

type UploadState = "idle" | "uploading" | "success" | "error";

function ResumeUploadContent() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [parsedSkills, setParsedSkills] = useState<string[]>([]);
  const [resumeId, setResumeId] = useState<number | null>(null);
  const [newSkill, setNewSkill] = useState("");
  const [savingSkills, setSavingSkills] = useState(false);
  const [skillsSaved, setSkillsSaved] = useState(false);

  const validateFile = (file: File): string | null => {
    const allowed = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/msword"];
    if (!allowed.includes(file.type) && !file.name.match(/\.(pdf|docx|doc)$/i)) return "Only PDF or DOCX files are allowed.";
    if (file.size > 5 * 1024 * 1024) return "File size must be under 5 MB.";
    return null;
  };

  const handleFile = useCallback((file: File) => {
    const err = validateFile(file);
    if (err) { setErrorMsg(err); setSelectedFile(null); return; }
    setErrorMsg(""); setSelectedFile(file); setUploadState("idle");
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploadState("uploading"); setErrorMsg("");
    try {
      const res = await uploadResume(selectedFile);
      const skills = res?.resume?.parsedJson?.skills ?? [];
      setParsedSkills(Array.isArray(skills) ? skills : []);
      setResumeId(res?.resume?.id ?? null);
      setUploadState("success");
      setSkillsSaved(false);
    } catch (err: any) {
      setErrorMsg(err.message || "Upload failed. Please try again.");
      setUploadState("error");
    }
  };

  const handleReset = () => {
    setSelectedFile(null); setUploadState("idle"); setErrorMsg(""); setParsedSkills([]);
    setResumeId(null); setNewSkill(""); setSkillsSaved(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setParsedSkills((prev) => prev.filter((s) => s !== skillToRemove));
    setSkillsSaved(false);
  };

  const handleAddSkill = () => {
    const trimmed = newSkill.trim();
    if (!trimmed) return;
    if (parsedSkills.some((s) => s.toLowerCase() === trimmed.toLowerCase())) {
      setNewSkill("");
      return;
    }
    setParsedSkills((prev) => [...prev, trimmed]);
    setNewSkill("");
    setSkillsSaved(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddSkill();
    }
  };

  const handleSaveSkills = async () => {
    if (!resumeId) return;
    setSavingSkills(true);
    try {
      await updateResumeSkills(resumeId, parsedSkills);
      setSkillsSaved(true);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to save skill changes.");
    } finally {
      setSavingSkills(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] px-4 py-8 lg:py-10">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-1/3 w-80 h-80 bg-blue-600/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-lg mx-auto">
        <div className="mb-8">
          <h1 className="text-xl font-bold text-white mb-1">Upload Resume</h1>
          <p className="text-white/40 text-sm">AI will extract your skills to personalize interview questions</p>
        </div>

        {uploadState === "success" ? (
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.04] p-8">
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-emerald-500/15 flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-base font-semibold text-white mb-1">Resume parsed successfully!</h2>
              <p className="text-sm text-white/40 mb-5">Review and edit the detected skills below before starting your interview.</p>
            </div>

            {/* Editable Skills Section */}
            <div className="mb-6">
              <p className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-3">Detected Skills <span className="text-white/20 normal-case font-normal">— click ✕ to remove, or add new ones below</span></p>

              {parsedSkills.length > 0 ? (
                <div className="flex flex-wrap gap-2 mb-4">
                  {parsedSkills.map((skill) => (
                    <span
                      key={skill}
                      className="group inline-flex items-center gap-1.5 text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20 pl-2.5 pr-1.5 py-1 rounded-full font-medium transition-all hover:border-blue-500/40 hover:bg-blue-500/15"
                    >
                      {skill}
                      <button
                        onClick={() => handleRemoveSkill(skill)}
                        className="w-4 h-4 rounded-full flex items-center justify-center text-blue-400/50 hover:text-red-400 hover:bg-red-500/20 transition-all"
                        title={`Remove ${skill}`}
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-white/25 mb-4 italic">No skills detected. Add skills manually below.</p>
              )}

              {/* Add Skill Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a skill and press Enter..."
                  className="flex-1 bg-white/[0.05] border border-white/[0.08] rounded-xl px-3 py-2 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-blue-500/40 focus:ring-1 focus:ring-blue-500/20 transition-all"
                />
                <button
                  onClick={handleAddSkill}
                  disabled={!newSkill.trim()}
                  className="px-4 py-2 rounded-xl text-sm font-semibold bg-blue-500/15 text-blue-400 border border-blue-500/25 hover:bg-blue-500/25 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  + Add
                </button>
              </div>
            </div>

            {/* Save Changes Button */}
            <button
              onClick={handleSaveSkills}
              disabled={savingSkills || skillsSaved}
              className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2 mb-3 ${
                skillsSaved
                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 cursor-default"
                  : "bg-violet-500/15 text-violet-400 border border-violet-500/25 hover:bg-violet-500/25 disabled:opacity-40 disabled:cursor-not-allowed"
              }`}
            >
              {savingSkills ? (
                <><div className="w-4 h-4 border-2 border-violet-400/30 border-t-violet-400 rounded-full animate-spin" />Saving...</>
              ) : skillsSaved ? (
                <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>Skills saved!</>
              ) : (
                "Save skill changes"
              )}
            </button>

            {errorMsg && <p className="text-xs text-red-400 mb-3 text-center">{errorMsg}</p>}

            <div className="flex gap-3">
              <button onClick={handleReset} className="flex-1 py-2.5 rounded-xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] text-sm text-white/60 hover:text-white/80 transition-all">
                Upload another
              </button>
              <button onClick={() => router.push("/interview-setup")} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 transition-all shadow-lg shadow-blue-500/20">
                Start interview →
              </button>
            </div>
          </div>
        ) : (
          <>
            <div
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              className={`rounded-2xl border-2 border-dashed p-12 text-center cursor-pointer transition-all duration-200 ${
                dragOver
                  ? "border-blue-500/60 bg-blue-500/[0.06]"
                  : selectedFile
                  ? "border-emerald-500/40 bg-emerald-500/[0.04]"
                  : "border-white/[0.10] bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]"
              }`}
            >
              <input ref={fileInputRef} type="file" accept=".pdf,.docx,.doc" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />

              {selectedFile ? (
                <div>
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/15 flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-white/80">{selectedFile.name}</p>
                  <p className="text-xs text-white/30 mt-1">{(selectedFile.size / 1024).toFixed(0)} KB</p>
                  <button onClick={(e) => { e.stopPropagation(); handleReset(); }} className="mt-3 text-xs text-white/25 hover:text-white/50 underline transition-colors">Remove</button>
                </div>
              ) : (
                <div>
                  <div className="w-12 h-12 rounded-xl bg-white/[0.05] flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-white/60">Drag & drop your resume here</p>
                  <p className="text-xs text-white/25 mt-1.5">or click to browse files</p>
                  <p className="text-xs text-white/15 mt-2">PDF or DOCX · max 5 MB</p>
                </div>
              )}
            </div>

            {errorMsg && <p className="text-xs text-red-400 mt-2 text-center">{errorMsg}</p>}

            <button
              onClick={handleUpload}
              disabled={!selectedFile || uploadState === "uploading"}
              className="w-full mt-4 py-3.5 rounded-xl text-sm font-semibold transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-white bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 shadow-lg shadow-blue-500/20 hover:-translate-y-0.5 disabled:translate-y-0 disabled:shadow-none"
            >
              {uploadState === "uploading" ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Uploading & parsing...</>
              ) : "Upload & Parse Resume"}
            </button>

            <div className="mt-5 rounded-xl border border-violet-500/20 bg-violet-500/[0.04] p-4">
              <p className="text-xs font-semibold text-violet-400 mb-2">What happens after upload</p>
              <ul className="space-y-1.5">
                {["AI extracts your skills, tools & projects", "You can review & edit detected skills", "Future interviews will ask skill-specific questions", "Each question shows which resume skill inspired it"].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-xs text-white/40">
                    <span className="text-violet-500/60 mt-0.5 flex-shrink-0">✦</span>{item}
                  </li>
                ))}
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
      <AppLayout>
        <ResumeUploadContent />
      </AppLayout>
    </AuthGuard>
  );
}