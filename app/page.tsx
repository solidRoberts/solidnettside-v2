import { Navigation } from "@/components/navigation"
import { HeroSection } from "@/components/hero-section"
import { LogoBar } from "@/components/logo-bar"
import { ServicesSection } from "@/components/services-section"
import { ProcessSection } from "@/components/process-section"
import { ResultsSection } from "@/components/results-section"
import { StatsSection } from "@/components/stats-section"
import { BookingSection } from "@/components/booking-section"
import { ContactSection } from "@/components/contact-section"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <>
      <Navigation />
      <main>
        <HeroSection />
        <LogoBar />
        <ServicesSection />
        <ProcessSection />
        <ResultsSection />
        <StatsSection />
        <BookingSection />
        <ContactSection />
      </main>
      <Footer />
    </>
  )
}
