import dynamic from "next/dynamic";
import Navbar from "@/components/landing/Navbar";
import VirtualBoardroomHero from "@/components/landing/VirtualBoardroomHero";

const TrustedBy = dynamic(() => import("@/components/landing/TrustedBy"));
const Features = dynamic(() => import("@/components/landing/Features"));
const HowItWorks = dynamic(() => import("@/components/landing/HowItWorks"));
const DashboardPreview = dynamic(() => import("@/components/landing/DashboardPreview"));
const ResumePreview = dynamic(() => import("@/components/landing/ResumePreview"));
const AIFeedback = dynamic(() => import("@/components/landing/AIFeedback"));
const Comparison = dynamic(() => import("@/components/landing/Comparison"));
const FAQ = dynamic(() => import("@/components/landing/FAQ"));
const CTA = dynamic(() => import("@/components/landing/CTA"));
const Footer = dynamic(() => import("@/components/landing/Footer"));

export default function Home() {
  return (
    <main className="min-h-screen bg-[#06070a] text-white selection:bg-amber-500/30 selection:text-amber-200">
      <Navbar />
      <VirtualBoardroomHero />
      <TrustedBy />
      <Features />
      <HowItWorks />
      <DashboardPreview />
      <ResumePreview />
      <AIFeedback />
      <Comparison />
      <FAQ />
      <CTA />
      <Footer />
    </main>
  );
}