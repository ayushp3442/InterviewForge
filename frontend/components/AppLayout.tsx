"use client";
import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getUser, getRefreshToken, logout } from "@/lib/auth";
import { logoutUser } from "@/lib/api";
import { useToast } from "@/components/ToastProvider";


const navItems = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    href: "/interview-setup",
    label: "New Interview",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
      </svg>
    ),
    highlight: true,
  },
  {
    href: "/history",
    label: "History",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    href: "/resume-upload",
    label: "Resume",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    href: "/profile",
    label: "Profile",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
];


interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const user = getUser();
  const [loggingOut, setLoggingOut] = useState(false);
  const { info } = useToast();


  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  async function handleLogout() {
    setLoggingOut(true);
    try {
      const refreshToken = getRefreshToken();
      if (refreshToken) await logoutUser(refreshToken);
    } catch { /* clear client even if server call fails */ }
    finally {
      logout();
      info("Signed out. See you next time! 👋");
      setTimeout(() => router.push("/login"), 800);
    }
  }

  return (
    <div className="min-h-screen bg-cream flex">
      {/* ── Sidebar ── */}
      <aside className="hidden md:flex w-56 flex-col fixed inset-y-0 left-0 z-30">
        <div className="flex flex-col h-full bg-white border-r border-stone-faint/30 px-3 py-5">
          {/* Logo */}
          <div className="flex items-center gap-2.5 px-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-charcoal flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-gold tracking-tight">IF</span>
            </div>
            <span className="text-sm font-semibold text-charcoal tracking-tight">
              Interview<span className="font-bold">Forge</span>
            </span>
          </div>

          {/* Nav items */}
          <nav className="flex-1 space-y-0.5">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
              return (
                <button
                  key={item.href}
                  onClick={() => router.push(item.href)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    item.highlight
                      ? isActive
                        ? "bg-charcoal text-cream shadow-sm"
                        : "bg-gold/10 text-gold-muted hover:bg-gold/15 border border-gold/20"
                      : isActive
                      ? "bg-charcoal/[0.06] text-charcoal border-l-2 border-gold -ml-px"
                      : "text-stone hover:text-charcoal hover:bg-charcoal/[0.03]"
                  }`}
                >
                  <span className={item.highlight && !isActive ? "text-gold" : ""}>{item.icon}</span>
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* User section */}
          <div className="border-t border-stone-faint/30 pt-4 mt-4">
            <div className="flex items-center gap-3 px-2 mb-3">
              <div className="w-7 h-7 rounded-full bg-charcoal flex items-center justify-center text-[11px] font-bold text-gold flex-shrink-0 ring-2 ring-gold/20">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-charcoal truncate">{user?.name ?? "User"}</p>
                <p className="text-[10px] text-stone-light truncate">{user?.email ?? ""}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-stone hover:text-warm-red hover:bg-warm-red/[0.05] transition-all duration-200"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              {loggingOut ? "Signing out..." : "Sign out"}
            </button>
          </div>
        </div>
      </aside>

      {/* ── Mobile top bar ── */}
      <header className="md:hidden fixed top-0 inset-x-0 z-30 h-14 flex items-center justify-between px-4 bg-cream/95 backdrop-blur-xl border-b border-stone-faint/30">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-charcoal flex items-center justify-center">
            <span className="text-[10px] font-bold text-gold">IF</span>
          </div>
          <span className="text-sm font-semibold text-charcoal">InterviewForge</span>
        </div>
        <div className="w-7 h-7 rounded-full bg-charcoal flex items-center justify-center text-[11px] font-bold text-gold ring-2 ring-gold/20">
          {initials}
        </div>
      </header>

      {/* ── Mobile bottom nav bar ── */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 h-16 flex items-center justify-around px-2 bg-white/95 backdrop-blur-xl border-t border-stone-faint/30">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
          return (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-200 ${
                item.highlight
                  ? isActive
                    ? "bg-charcoal text-cream shadow-sm"
                    : "bg-gold/10 text-gold-muted"
                  : isActive
                  ? "text-charcoal"
                  : "text-stone-light hover:text-stone"
              }`}
            >
              <span className="w-5 h-5 flex items-center justify-center">{item.icon}</span>
              <span className="text-[9px] font-medium tracking-wide">{item.label}</span>
              {isActive && !item.highlight && (
                <span className="absolute bottom-1.5 w-1 h-1 rounded-full bg-gold" />
              )}
            </button>
          );
        })}
      </nav>

      {/* ── Main content area ── */}
      <main className="flex-1 md:ml-56 min-h-screen">
        <div className="md:hidden h-14" /> {/* spacer for mobile top bar */}
        {children}
        <div className="md:hidden h-16" /> {/* spacer for mobile bottom nav */}
      </main>
    </div>
  );
}
