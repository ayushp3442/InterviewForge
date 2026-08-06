import dynamic from "next/dynamic";
import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";

// Lazy load below-the-fold sections for performance
const TrustedBy = dynamic(() => import("@/components/landing/TrustedBy"));
const Features = dynamic(() => import("@/components/landing/Features"));
const HowItWorks = dynamic(() => import("@/components/landing/HowItWorks"));
const DashboardPreview = dynamic(() => import("@/components/landing/DashboardPreview"));
const ResumePreview = dynamic(() => import("@/components/landing/ResumePreview"));
const AIFeedback = dynamic(() => import("@/components/landing/AIFeedback"));
const Comparison = dynamic(() => import("@/components/landing/Comparison"));
const Testimonials = dynamic(() => import("@/components/landing/Testimonials"));
const FAQ = dynamic(() => import("@/components/landing/FAQ"));
const CTA = dynamic(() => import("@/components/landing/CTA"));
const Footer = dynamic(() => import("@/components/landing/Footer"));

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <Hero />
      <TrustedBy />
      <Features />
      <HowItWorks />
      <DashboardPreview />
      <ResumePreview />
      <AIFeedback />
      <Comparison />
      <Testimonials />
      <FAQ />
      <CTA />
      <Footer />
    </main>
  );
}