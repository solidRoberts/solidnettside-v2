"use client"

import { useEffect, useRef } from "react"
import { BarChart3, Palette, Target, TrendingUp, RefreshCw, ClipboardList } from "lucide-react"

const services = [
  {
    icon: BarChart3,
    title: "Meta Ads-strategi",
    description:
      "Datadrevet strategi tilpasset din bransje og lokasjon. Ingen generiske maler – kun det som funker for håndverkere i ditt marked.",
  },
  {
    icon: Palette,
    title: "Kreativ produksjon",
    description:
      "Vi lager annonsemateriell som stopper scrollingen: hooks, stillbilder og karuseller designet for å konvertere.",
  },
  {
    icon: Target,
    title: "Leadgenerering",
    description:
      "Kampanjer som leverer kvalifiserte henvendelser direkte til deg – ikke bare klikk og likes.",
  },
  {
    icon: TrendingUp,
    title: "Pixel-sporing",
    description:
      "Meta Pixel konfigurert korrekt slik at vi kan spore konverteringer, optimere budsjett og retargete besøkende.",
  },
  {
    icon: RefreshCw,
    title: "Kontinuerlig optimering",
    description:
      "Ukentlig gjennomgang og justering. Vi tester og skalerer det som fungerer – alltid.",
  },
  {
    icon: ClipboardList,
    title: "Månedlig rapport",
    description:
      "Klare rapporter: antall leads, kostnad per lead og ROI. Ingen sjargong – bare resultater.",
  },
]

function RevealOnScroll({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible")
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.1 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} className={`reveal ${delay > 0 ? `reveal-delay-${delay}` : ""}`}>
      {children}
    </div>
  )
}

export function ServicesSection() {
  return (
    <section id="tjenester" className="py-[100px] bg-white">
      <div className="max-w-[1140px] mx-auto px-7">
        <div className="text-xs font-bold tracking-[0.1em] uppercase text-[#4f52e8] mb-3.5">
          Tjenester
        </div>
        <h2 className="font-serif text-[clamp(30px,4vw,48px)] font-bold leading-[1.12] tracking-[-0.02em] mb-4 text-foreground">
          Alt du trenger for å
          <br />
          vokse med <em className="italic text-[#4f52e8]">Meta Ads</em>
        </h2>
        <p className="text-[17px] text-muted-foreground max-w-[540px] mb-14 leading-[1.75]">
          Vi håndterer hele kjeden – fra strategi og kreativ produksjon til optimering og rapportering.
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, i) => (
            <RevealOnScroll key={service.title} delay={i % 3}>
              <div className="bg-[#f8f7f4] border border-border rounded-2xl p-8 hover:border-[#4f52e8] hover:-translate-y-[5px] hover:shadow-[0_4px_24px_rgba(79,82,232,0.10)] transition-all h-full">
                <div className="w-[52px] h-[52px] rounded-[14px] bg-[rgba(79,82,232,0.09)] flex items-center justify-center text-[#4f52e8] mb-5">
                  <service.icon size={22} />
                </div>
                <h3 className="text-lg font-bold mb-2.5">{service.title}</h3>
                <p className="text-[15px] text-muted-foreground leading-relaxed">{service.description}</p>
              </div>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  )
}
