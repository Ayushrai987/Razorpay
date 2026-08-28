"use client";

import React from "react";
import Hero from "@/components/Hero";
import Stats from "@/components/Stats";
import ProblemSolution from "@/components/ProblemSolution";
import Features from "@/components/Features";
import HowItWorks from "@/components/HowItWorks";
import Demo from "@/components/Demo";
import Results from "@/components/Results";
import Testimonials from "@/components/Testimonials";
import ComparisonTable from "@/components/ComparisonTable";
import FAQ from "@/components/FAQ";
import CTA from "@/components/CTA";

export default function HomePage() {
  return (
    <div className="bg-white">
      {/* 1. Hero Banner with Interactive Modal & Live Feed Tabs */}
      <Hero />

      {/* 2. Stats Section with Animated Counters */}
      <Stats />

      {/* 3. Problem & Solution Deep-Dive Sections */}
      <ProblemSolution />

      {/* 4. Core Features Matrix Cards */}
      <Features />

      {/* 5. 4-Step How It Works Timeline */}
      <HowItWorks />

      {/* 6. Live Interactive Sandbox Demo & CSV Scanner */}
      <Demo />

      {/* 7. Results, Charts & Merchant Case Study */}
      <Results />

      {/* 8. Verified Merchant Testimonials Deck */}
      <Testimonials />

      {/* 9. Technical Comparison Table */}
      <ComparisonTable />

      {/* 10. FAQ Accordions */}
      <FAQ />

      {/* 11. Final Conversion CTA Banner */}
      <CTA />
    </div>
  );
}
