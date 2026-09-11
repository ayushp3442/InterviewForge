"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";
import AppLayout from "@/components/AppLayout";
import { getMe, updateProfile, changePassword } from "@/lib/api";
import { getUser, logout } from "@/lib/auth";
import { logoutUser } from "@/lib/api";
import { getRefreshToken } from "@/lib/auth";
import { useToast } from "@/components/ToastProvider";

function ProfileContent() {
  const router = useRouter();
  const storedUser = getUser();
  const { success: showSuccess, error: showError } = useToast();

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
    if (!name.trim() || name.trim().length < 2) { showError("Name must be at least 2 characters."); return; }
    if (name.trim().length > 50) { showError("Name must not exceed 50 characters."); return; }
    setSavingProfile(true);
    try {
      const res = await updateProfile(name.trim());
      const stored = localStorage.getItem("user");
      if (stored) {
        const parsed = JSON.parse(stored);
        localStorage.setItem("user", JSON.stringify({ ...parsed, name: res.user.name }));
      }
      setUserData((prev) => prev ? { ...prev, name: res.user.name } : prev);
      showSuccess("Profile updated successfully!");
    } catch (err: any) {
      showError(err.message || "Failed to update profile.");
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleChangePassword() {
    if (!currentPassword || !newPassword || !confirmPassword) { showError("All password fields are required."); return; }
    if (newPassword.length < 6) { showError("New password must be at least 6 characters."); return; }
    if (newPassword !== confirmPassword) { showError("New passwords do not match."); return; }
    if (currentPassword === newPassword) { showError("New password must be different from current password."); return; }
    setSavingPassword(true);
    try {
      await changePassword(currentPassword, newPassword);
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
      showSuccess("Password changed successfully!");
    } catch (err: any) {
      showError(err.message || "Failed to change password.");
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
    <div className="min-h-screen bg-cream px-4 py-8 lg:py-10">
      <div className="relative max-w-xl mx-auto space-y-5">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-xl font-serif text-charcoal mb-1">Profile & Settings</h1>
          <p className="text-stone text-sm">Manage your account details and security</p>
        </div>

        {/* ── Avatar card ── */}
        <div className="card-board p-6 flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-charcoal flex items-center justify-center text-xl font-bold text-gold flex-shrink-0 ring-2 ring-gold/20">
            {loadingUser ? "…" : initials}
          </div>
          <div className="min-w-0">
            {loadingUser ? (
              <div className="space-y-2">
                <div className="h-4 w-32 bg-cream-dark rounded animate-pulse" />
                <div className="h-3 w-48 bg-cream-dark/60 rounded animate-pulse" />
              </div>
            ) : (
              <>
                <p className="text-base font-semibold text-charcoal truncate">{userData?.name}</p>
                <p className="text-sm text-stone truncate">{userData?.email}</p>
                {joinedDate && <p className="text-xs text-stone-light mt-0.5">Member since {joinedDate}</p>}
              </>
            )}
          </div>
        </div>

        {/* ── Update name ── */}
        <div className="card-board p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-6 h-6 rounded-lg bg-gold/10 flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h2 className="text-sm font-semibold text-charcoal">Profile Information</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="label-board">Display name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSaveProfile()}
                maxLength={50}
                className="input-board"
              />
            </div>
            <div>
              <label className="label-board">Email address</label>
              <input
                type="email"
                value={userData?.email || ""}
                disabled
                className="input-board !bg-cream-dark/30 !text-stone-light cursor-not-allowed"
              />
              <p className="text-[11px] text-stone-light mt-1.5">Email cannot be changed</p>
            </div>
          </div>

          <button
            onClick={handleSaveProfile}
            disabled={savingProfile || !name.trim() || name.trim() === userData?.name}
            className="btn-tactile mt-5 py-2.5 px-5"
          >
            {savingProfile ? (
              <><div className="w-4 h-4 border-2 border-cream/30 border-t-cream rounded-full animate-spin" />Saving...</>
            ) : "Save changes"}
          </button>
        </div>

        {/* ── Change password ── */}
        <div className="card-board p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-6 h-6 rounded-lg bg-charcoal/[0.06] flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-charcoal-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-sm font-semibold text-charcoal">Change Password</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="label-board">Current password</label>
              <input
                type="password"
                placeholder="Enter current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="input-board"
              />
            </div>
            <div>
              <label className="label-board">New password</label>
              <input
                type="password"
                placeholder="Min. 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="input-board"
              />
            </div>
            <div>
              <label className="label-board">Confirm new password</label>
              <input
                type="password"
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`input-board ${
                  passwordMismatch
                    ? "!border-warm-red/50 focus:!border-warm-red/70 focus:!ring-warm-red/10"
                    : confirmPassword && !passwordMismatch
                    ? "!border-forest/40 focus:!border-forest/60 focus:!ring-forest/10"
                    : ""
                }`}
              />
              {passwordMismatch && <p className="text-[11px] text-warm-red mt-1.5">Passwords don&apos;t match</p>}
              {confirmPassword && !passwordMismatch && (
                <p className="text-[11px] text-forest mt-1.5 flex items-center gap-1">
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
            className="btn-tactile mt-5 py-2.5 px-5"
          >
            {savingPassword ? (
              <><div className="w-4 h-4 border-2 border-cream/30 border-t-cream rounded-full animate-spin" />Updating...</>
            ) : "Update password"}
          </button>
        </div>

        {/* ── Danger zone ── */}
        <div className="rounded-2xl border border-warm-red/20 bg-warm-red/[0.02] p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 rounded-lg bg-warm-red/10 flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-warm-red" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-sm font-semibold text-warm-red">Danger Zone</h2>
          </div>

          {/* Sign out */}
          <div className="flex items-center justify-between py-3 border-b border-stone-faint/15">
            <div>
              <p className="text-sm text-charcoal font-medium">Sign out</p>
              <p className="text-xs text-stone-light mt-0.5">End your current session and return to login</p>
            </div>
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="btn-ghost text-xs py-2 px-4"
            >
              {loggingOut ? "Signing out..." : "Sign out"}
            </button>
          </div>

          {/* Delete account */}
          <div className="pt-3">
            {!showDeleteConfirm ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-charcoal font-medium">Delete account</p>
                  <p className="text-xs text-stone-light mt-0.5">Permanently remove your data — this cannot be undone</p>
                </div>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-4 py-2 rounded-lg border border-warm-red/30 bg-warm-red/[0.05] hover:bg-warm-red/[0.10] text-xs font-medium text-warm-red transition-all"
                >
                  Delete
                </button>
              </div>
            ) : (
              <div className="rounded-xl bg-warm-red/[0.04] border border-warm-red/20 p-4">
                <p className="text-sm font-semibold text-warm-red mb-1">Are you absolutely sure?</p>
                <p className="text-xs text-stone mb-4">
                  This will permanently delete all your interviews, reports, and resume data. This action <strong className="text-charcoal">cannot be undone</strong>.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="btn-ghost flex-1 py-2 text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    className="flex-1 py-2 rounded-lg bg-warm-red/80 hover:bg-warm-red text-xs font-semibold text-white transition-all opacity-50 cursor-not-allowed"
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
