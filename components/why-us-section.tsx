"use client"

import { useEffect, useRef } from "react"
import { Eye, HardHat, MessageCircle } from "lucide-react"

const reasons = [
  {
    icon: Eye,
    title: "Full åpenhet",
    description:
      "Du ser nøyaktig hva annonsebudsjettet brukes på, hvilke kampanjer som kjører, og hva som skjer underveis. Ingen skjulte avgifter eller uklare rapporter.",
  },
  {
    icon: HardHat,
    title: "Bygget for håndverkere",
    description:
      "Vi spesialiserer oss på håndverksbedrifter i Oslo og Akershus. Vi kjenner kundene dine, sesongene og hva som faktisk skaper henvendelser i ditt marked.",
  },
  {
    icon: MessageCircle,
    title: "Tett oppfølging",
    description:
      "Du får en fast kontaktperson som er tilgjengelig. Vi snakker rett fram, uten fagsjargong, og holder deg oppdatert hele veien.",
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
      { threshold: 0.1 },
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} className={`reveal ${delay > 0 ? `reveal-delay-${delay * 2}` : ""}`}>
      {children}
    </div>
  )
}

export function WhyUsSection() {
  return (
    <section id="hvorfor-oss" className="py-[100px] bg-[#0f0f0f] text-white">
      <div className="max-w-[1140px] mx-auto px-7">
        <div className="text-xs font-bold tracking-[0.1em] uppercase text-white/50 mb-3.5">Hvorfor oss</div>
        <h2 className="font-serif text-[clamp(30px,4vw,48px)] font-bold leading-[1.12] tracking-[-0.02em] mb-4 text-white">
          Et byrå du kan <em className="italic text-[#4f52e8]">stole på</em>
        </h2>
        <p className="text-[17px] text-white/55 max-w-[540px] mb-14 leading-[1.75]">
          Vi holder det enkelt og ærlig. Her er det som skiller oss ut.
        </p>

        <div className="grid md:grid-cols-3 gap-6">
          {reasons.map((reason, i) => (
            <RevealOnScroll key={reason.title} delay={i}>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-9 hover:border-[rgba(79,82,232,0.5)] hover:-translate-y-1 transition-all h-full">
                <div className="w-[52px] h-[52px] rounded-[14px] bg-[rgba(79,82,232,0.18)] flex items-center justify-center text-[#4f52e8] mb-5">
                  <reason.icon size={22} />
                </div>
                <h3 className="text-lg font-bold mb-2.5 text-white">{reason.title}</h3>
                <p className="text-[15px] text-white/55 leading-relaxed">{reason.description}</p>
              </div>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  )
}
