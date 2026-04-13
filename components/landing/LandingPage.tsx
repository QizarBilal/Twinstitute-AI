'use client'

import { Navbar } from './Navbar'
import { HeroSection } from './HeroSection'
import {
  TrustStrip,
  SolutionSection,
  HowItWorksSection,
  SystemModulesSection,
  DifferenceSection,
  OutcomeSection,
  FinalCTASection,
  Footer,
} from './LandingSections'

/**
 * MASTER LANDING PAGE COMPONENT
 *
 * Orchestrates all landing page sections in sequence:
 * 1. Navbar (fixed, premium)
 * 2. Hero (cinematic entry)
 * 3. Trust Strip (positioning)
 * 4. Solution Section (core value)
 * 5. How It Works (visual flow)
 * 6. System Modules (5 core capabilities)
 * 7. Difference Section (comparison)
 * 8. Outcome Section (benefits)
 * 9. Final CTA (conversion)
 * 10. Footer (info + links)
 *
 * Design: FAANG-level, premium, minimal, high-impact
 * Color: Black with blue (#3B82F6) accents
 * Feel: Apple + Stripe + OpenAI
 */
export const LandingPage = () => {
  return (
    <div className="w-full bg-black">
      {/* Fixed Navigation */}
      <Navbar />

      {/* Main Content */}
      <main className="w-full">
        {/* 1. HERO SECTION */}
        <HeroSection />

        {/* 2. TRUST STRIP */}
        <TrustStrip />

        {/* 3. SOLUTION SECTION */}
        <SolutionSection />

        {/* 5. HOW IT WORKS */}
        <HowItWorksSection />

        {/* 6. SYSTEM MODULES */}
        <SystemModulesSection />

        {/* 7. DIFFERENCE SECTION */}
        <DifferenceSection />

        {/* 8. OUTCOME SECTION */}
        <OutcomeSection />

        {/* 9. FINAL CTA */}
        <FinalCTASection />

        {/* 10. FOOTER */}
        <Footer />
      </main>
    </div>
  )
}

export default LandingPage
