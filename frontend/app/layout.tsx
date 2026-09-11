import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ToastProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "InterviewForge AI — Ace Every Interview with AI",
  description:
    "AI-powered interview preparation platform. Practice with realistic AI interviews, get instant feedback, and improve your performance with data-driven insights.",
  openGraph: {
    title: "InterviewForge AI — Ace Every Interview with AI",
    description:
      "Practice with realistic AI interviews, get instant feedback, and improve your performance with data-driven insights.",
    type: "website",
    siteName: "InterviewForge AI",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased">
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}