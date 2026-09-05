"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";
import AppLayout from "@/components/AppLayout";
import { getMe, updateProfile, changePassword } from "@/lib/api";
import { getUser, logout } from "@/lib/auth";
import { logoutUser } from "@/lib/api";
import { getRefreshToken } from "@/lib/auth";

type Toast = { id: number; type: "success" | "error"; message: string };

function ToastContainer({ toasts, remove }: { toasts: Toast[]; remove: (id: number) => void }) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl border backdrop-blur-xl pointer-events-auto animate-in slide-in-from-right-4 duration-300 ${
            t.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
              : "bg-red-500/10 border-red-500/30 text-red-300"
          }`}
        >
          {t.type === "success" ? (
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          <p className="text-sm font-medium">{t.message}</p>
          <button onClick={() => remove(t.id)} className="ml-2 opacity-60 hover:opacity-100 transition-opacity">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}

function ProfileContent() {
  const router = useRouter();
  const storedUser = getUser();

  const [userData, setUserData] = useState<{ name: string; email: string; role: string; createdAt: string } | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // Profile form state
  const [name, setName] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  // Password form state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  // Danger zone
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // Toasts
  const [toasts, setToasts] = useState<Toast[]>([]);
  let toastId = 0;

  function addToast(type: "success" | "error", message: string) {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => removeToast(id), 4000);
  }

  function removeToast(id: number) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await getMe();
        setUserData(res.user);
        setName(res.user.name);
      } catch {
        // Fall back to localStorage data
        if (storedUser) {
          setUserData({ name: storedUser.name, email: storedUser.email, role: "student", createdAt: "" });
          setName(storedUser.name);
        }
      } finally {
        setLoadingUser(false);
      }
    }
    fetchUser();
  }, []);

  async function handleSaveProfile() {
    if (!name.trim() || name.trim().length < 2) { addToast("error", "Name must be at least 2 characters."); return; }
    if (name.trim().length > 50) { addToast("error", "Name must not exceed 50 characters."); return; }
    setSavingProfile(true);
    try {
      const res = await updateProfile(name.trim());
      // Update localStorage so the sidebar reflects new name immediately
      const stored = localStorage.getItem("user");
      if (stored) {
        const parsed = JSON.parse(stored);
        localStorage.setItem("user", JSON.stringify({ ...parsed, name: res.user.name }));
      }
      setUserData((prev) => prev ? { ...prev, name: res.user.name } : prev);
      addToast("success", "Profile updated successfully!");
    } catch (err: any) {
      addToast("error", err.message || "Failed to update profile.");
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleChangePassword() {
    if (!currentPassword || !newPassword || !confirmPassword) { addToast("error", "All password fields are required."); return; }
    if (newPassword.length < 6) { addToast("error", "New password must be at least 6 characters."); return; }
    if (newPassword !== confirmPassword) { addToast("error", "New passwords do not match."); return; }
    if (currentPassword === newPassword) { addToast("error", "New password must be different from current password."); return; }
    setSavingPassword(true);
    try {
      await changePassword(currentPassword, newPassword);
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
      addToast("success", "Password changed successfully!");
    } catch (err: any) {
      addToast("error", err.message || "Failed to change password.");
    } finally {
      setSavingPassword(false);
    }
  }

  async function handleLogout() {
    setLoggingOut(true);
    try {
      const refreshToken = getRefreshToken();
      if (refreshToken) await logoutUser(refreshToken);
    } catch { /* clear client even if server fails */ }
    finally {
      logout();
      router.push("/login");
    }
  }

  const initials = (userData?.name || storedUser?.name || "?").split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  const joinedDate = userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString("en-IN", { month: "long", year: "numeric" }) : null;

  const passwordMismatch = confirmPassword.length > 0 && newPassword !== confirmPassword;

  return (
    <>
      <ToastContainer toasts={toasts} remove={removeToast} />

      <div className="min-h-screen bg-[#0a0a0f] px-4 py-8 lg:py-10">
        {/* Ambient orbs */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 right-1/4 w-80 h-80 bg-violet-600/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 left-0 w-64 h-64 bg-blue-600/5 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-xl mx-auto space-y-5">
          {/* Page header */}
          <div className="mb-8">
            <h1 className="text-xl font-bold text-white mb-1">Profile & Settings</h1>
            <p className="text-white/40 text-sm">Manage your account details and security</p>
          </div>

          {/* ── Avatar card ── */}
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-sm p-6 flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-xl font-bold text-white flex-shrink-0">
              {loadingUser ? "…" : initials}
            </div>
            <div className="min-w-0">
              {loadingUser ? (
                <div className="space-y-2">
                  <div className="h-4 w-32 bg-white/10 rounded animate-pulse" />
                  <div className="h-3 w-48 bg-white/5 rounded animate-pulse" />
                </div>
              ) : (
                <>
                  <p className="text-base font-semibold text-white truncate">{userData?.name}</p>
                  <p className="text-sm text-white/40 truncate">{userData?.email}</p>
                  {joinedDate && <p className="text-xs text-white/25 mt-0.5">Member since {joinedDate}</p>}
                </>
              )}
            </div>
          </div>

          {/* ── Update name ── */}
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-sm p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-6 h-6 rounded-lg bg-blue-500/15 flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h2 className="text-sm font-semibold text-white/80">Profile Information</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-white/40 uppercase tracking-wider block mb-2">Display name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSaveProfile()}
                  maxLength={50}
                  className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white/80 placeholder-white/20 focus:outline-none focus:border-blue-500/50 transition-colors"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-white/40 uppercase tracking-wider block mb-2">Email address</label>
                <input
                  type="email"
                  value={userData?.email || ""}
                  disabled
                  className="w-full bg-white/[0.02] border border-white/[0.05] rounded-xl px-4 py-2.5 text-sm text-white/30 cursor-not-allowed"
                />
                <p className="text-[11px] text-white/20 mt-1.5">Email cannot be changed</p>
              </div>
            </div>

            <button
              onClick={handleSaveProfile}
              disabled={savingProfile || !name.trim() || name.trim() === userData?.name}
              className="mt-5 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 transition-all duration-300 shadow-lg shadow-blue-500/20 hover:-translate-y-0.5 disabled:opacity-30 disabled:cursor-not-allowed disabled:translate-y-0 disabled:shadow-none flex items-center gap-2"
            >
              {savingProfile ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving...</>
              ) : "Save changes"}
            </button>
          </div>

          {/* ── Change password ── */}
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-sm p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-6 h-6 rounded-lg bg-violet-500/15 flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 className="text-sm font-semibold text-white/80">Change Password</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-white/40 uppercase tracking-wider block mb-2">Current password</label>
                <input
                  type="password"
                  placeholder="Enter current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white/80 placeholder-white/20 focus:outline-none focus:border-violet-500/50 transition-colors"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-white/40 uppercase tracking-wider block mb-2">New password</label>
                <input
                  type="password"
                  placeholder="Min. 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white/80 placeholder-white/20 focus:outline-none focus:border-violet-500/50 transition-colors"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-white/40 uppercase tracking-wider block mb-2">Confirm new password</label>
                <input
                  type="password"
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full bg-white/[0.05] border rounded-xl px-4 py-2.5 text-sm text-white/80 placeholder-white/20 focus:outline-none transition-colors ${
                    passwordMismatch
                      ? "border-red-500/50 focus:border-red-500/70"
                      : confirmPassword && !passwordMismatch
                      ? "border-emerald-500/40 focus:border-emerald-500/60"
                      : "border-white/[0.08] focus:border-violet-500/50"
                  }`}
                />
                {passwordMismatch && <p className="text-[11px] text-red-400 mt-1.5">Passwords don&apos;t match</p>}
                {confirmPassword && !passwordMismatch && (
                  <p className="text-[11px] text-emerald-400 mt-1.5 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    Passwords match
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={handleChangePassword}
              disabled={savingPassword || !currentPassword || !newPassword || !confirmPassword || passwordMismatch}
              className="mt-5 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 transition-all duration-300 shadow-lg shadow-violet-500/20 hover:-translate-y-0.5 disabled:opacity-30 disabled:cursor-not-allowed disabled:translate-y-0 disabled:shadow-none flex items-center gap-2"
            >
              {savingPassword ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Updating...</>
              ) : "Update password"}
            </button>
          </div>

          {/* ── Danger zone ── */}
          <div className="rounded-2xl border border-red-500/20 bg-red-500/[0.02] p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded-lg bg-red-500/15 flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-sm font-semibold text-red-400">Danger Zone</h2>
            </div>

            {/* Sign out all sessions */}
            <div className="flex items-center justify-between py-3 border-b border-white/[0.04]">
              <div>
                <p className="text-sm text-white/70 font-medium">Sign out</p>
                <p className="text-xs text-white/30 mt-0.5">End your current session and return to login</p>
              </div>
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="px-4 py-2 rounded-lg border border-white/[0.10] bg-white/[0.03] hover:bg-white/[0.07] text-xs font-medium text-white/60 hover:text-white/90 transition-all disabled:opacity-40"
              >
                {loggingOut ? "Signing out..." : "Sign out"}
              </button>
            </div>

            {/* Delete account warning */}
            <div className="pt-3">
              {!showDeleteConfirm ? (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/70 font-medium">Delete account</p>
                    <p className="text-xs text-white/30 mt-0.5">Permanently remove your data — this cannot be undone</p>
                  </div>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="px-4 py-2 rounded-lg border border-red-500/30 bg-red-500/[0.05] hover:bg-red-500/[0.10] text-xs font-medium text-red-400 transition-all"
                  >
                    Delete
                  </button>
                </div>
              ) : (
                <div className="rounded-xl bg-red-500/[0.06] border border-red-500/20 p-4">
                  <p className="text-sm font-semibold text-red-400 mb-1">Are you absolutely sure?</p>
                  <p className="text-xs text-white/40 mb-4">
                    This will permanently delete all your interviews, reports, and resume data. This action <strong className="text-white/60">cannot be undone</strong>.
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="flex-1 py-2 rounded-lg border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.07] text-xs font-medium text-white/50 hover:text-white/80 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      className="flex-1 py-2 rounded-lg bg-red-600/80 hover:bg-red-600 text-xs font-semibold text-white transition-all opacity-50 cursor-not-allowed"
                      title="Contact support to delete your account"
                    >
                      Confirm delete (contact support)
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function ProfilePage() {
  return (
    <AuthGuard>
      <AppLayout>
        <ProfileContent />
      </AppLayout>
    </AuthGuard>
  );
}
