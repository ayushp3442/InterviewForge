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
    <div className="min-h-screen bg-cream px-4 py-8 lg:py-10">
      <div className="relative max-w-lg mx-auto">
        <div className="mb-8">
          <h1 className="text-xl font-serif text-charcoal mb-1">Upload Resume</h1>
          <p className="text-stone text-sm">AI will extract your skills to personalize interview questions</p>
        </div>

        {uploadState === "success" ? (
          <div className="card-board-gold p-8 border-forest/20">
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-forest/10 flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-forest" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-base font-serif text-charcoal mb-1">Resume parsed successfully!</h2>
              <p className="text-sm text-stone mb-5">Review and edit the detected skills below before starting your interview.</p>
            </div>

            {/* Editable Skills Section */}
            <div className="mb-6">
              <p className="text-xs font-semibold text-stone uppercase tracking-wider mb-3">Detected Skills <span className="text-stone-light normal-case font-normal">— click ✕ to remove, or add new ones below</span></p>

              {parsedSkills.length > 0 ? (
                <div className="flex flex-wrap gap-2 mb-4">
                  {parsedSkills.map((skill) => (
                    <span
                      key={skill}
                      className="group badge-keycap text-xs text-charcoal-muted"
                    >
                      {skill}
                      <button
                        onClick={() => handleRemoveSkill(skill)}
                        className="w-4 h-4 rounded-full flex items-center justify-center text-stone-light hover:text-warm-red hover:bg-warm-red/10 transition-all"
                        title={`Remove ${skill}`}
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-stone-light mb-4 italic">No skills detected. Add skills manually below.</p>
              )}

              {/* Add Skill Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a skill and press Enter..."
                  className="input-board flex-1"
                />
                <button
                  onClick={handleAddSkill}
                  disabled={!newSkill.trim()}
                  className="px-4 py-2 rounded-xl text-sm font-semibold bg-gold/10 text-gold-muted border border-gold/20 hover:bg-gold/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
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
                  ? "bg-forest/10 text-forest border border-forest/20 cursor-default"
                  : "bg-charcoal/[0.06] text-charcoal border border-stone-faint/30 hover:bg-charcoal/10 disabled:opacity-40 disabled:cursor-not-allowed"
              }`}
            >
              {savingSkills ? (
                <><div className="w-4 h-4 border-2 border-charcoal/30 border-t-charcoal rounded-full animate-spin" />Saving...</>
              ) : skillsSaved ? (
                <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>Skills saved!</>
              ) : (
                "Save skill changes"
              )}
            </button>

            {errorMsg && <p className="text-xs text-warm-red mb-3 text-center">{errorMsg}</p>}

            <div className="flex gap-3">
              <button onClick={handleReset} className="btn-ghost flex-1 py-2.5">
                Upload another
              </button>
              <button onClick={() => router.push("/interview-setup")} className="btn-tactile flex-1 py-2.5">
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
                  ? "border-gold/60 bg-gold/[0.04]"
                  : selectedFile
                  ? "border-forest/40 bg-forest/[0.03]"
                  : "border-stone-faint/40 bg-white hover:border-gold/30 hover:bg-cream-dark/30"
              }`}
            >
              <input ref={fileInputRef} type="file" accept=".pdf,.docx,.doc" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />

              {selectedFile ? (
                <div>
                  <div className="w-12 h-12 rounded-xl bg-forest/10 flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-forest" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-charcoal">{selectedFile.name}</p>
                  <p className="text-xs text-stone-light mt-1">{(selectedFile.size / 1024).toFixed(0)} KB</p>
                  <button onClick={(e) => { e.stopPropagation(); handleReset(); }} className="mt-3 text-xs text-stone-light hover:text-stone underline transition-colors">Remove</button>
                </div>
              ) : (
                <div>
                  <div className="w-12 h-12 rounded-xl bg-cream-dark flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-stone-light" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-charcoal-muted">Drag & drop your resume here</p>
                  <p className="text-xs text-stone-light mt-1.5">or click to browse files</p>
                  <p className="text-xs text-stone-faint mt-2">PDF or DOCX · max 5 MB</p>
                </div>
              )}
            </div>

            {errorMsg && <p className="text-xs text-warm-red mt-2 text-center">{errorMsg}</p>}

            <button
              onClick={handleUpload}
              disabled={!selectedFile || uploadState === "uploading"}
              className="btn-tactile w-full mt-4 py-3.5"
            >
              {uploadState === "uploading" ? (
                <><div className="w-4 h-4 border-2 border-cream/30 border-t-cream rounded-full animate-spin" />Uploading & parsing...</>
              ) : "Upload & Parse Resume"}
            </button>

            <div className="mt-5 card-board p-4 border-gold/15">
              <p className="text-xs font-semibold text-gold-muted mb-2">What happens after upload</p>
              <ul className="space-y-1.5">
                {["AI extracts your skills, tools & projects", "You can review & edit detected skills", "Future interviews will ask skill-specific questions", "Each question shows which resume skill inspired it"].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-xs text-stone">
                    <span className="text-gold/60 mt-0.5 flex-shrink-0">✦</span>{item}
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