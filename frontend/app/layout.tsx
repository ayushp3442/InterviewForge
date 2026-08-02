import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "InterviewForge AI",
  description: "AI-powered interview practice platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}