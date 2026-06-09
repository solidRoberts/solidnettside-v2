"use client"

import { useEffect, useRef } from "react"

const steps = [
  {
    number: "01",
    title: "Gratis strategimøte",
    description:
      "Vi setter oss ned og går gjennom bedriften din, målene dine og markedet. Ingen forpliktelser – bare konkrete råd.",
  },
  {
    number: "02",
    title: "Analyse & strategi",
    description:
      "Vi analyserer markedet, konkurrentene og målgruppen din i ditt område. Deretter lager vi en konkret plan.",
  },
  {
    number: "03",
    title: "Kreativ produksjon",
    description:
      "Annonsene lages og godkjennes av deg. Vi tester 2–3 varianter for å finne vinneren raskt.",
  },
  {
    number: "04",
    title: "Lansering & optimering",
    description:
      "Kampanjene går live. Vi følger opp daglig og justerer budsjett, målgruppe og kreativt material.",
  },
  {
    number: "05",
    title: "Skalering",
    description:
      "Når vi finner en vinner skalerer vi kontrollert og replikerer suksessen på nye segmenter og geografi.",
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

export function ProcessSection() {
  return (
    <section id="prosess" className="py-[100px] bg-[#f8f7f4]">
      <div className="max-w-[1140px] mx-auto px-7">
        <div className="text-xs font-bold tracking-[0.1em] uppercase text-[#4f52e8] mb-3.5">
          Vår prosess
        </div>
        <h2 className="font-serif text-[clamp(30px,4vw,48px)] font-bold leading-[1.12] tracking-[-0.02em] mb-4 text-foreground">
          Fra første møte til <em className="italic text-[#4f52e8]">fulle bøker</em>
        </h2>

        <div className="mt-14">
          {steps.map((step, i) => (
            <RevealOnScroll key={step.number} delay={i}>
              <div
                className={`grid grid-cols-[72px_1fr] gap-7 items-start py-8 ${
                  i < steps.length - 1 ? "border-b border-border" : ""
                } group`}
              >
                <div className="font-serif text-[52px] font-bold text-[#4f52e8] opacity-[0.18] leading-none group-hover:opacity-60 transition-opacity">
                  {step.number}
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                  <p className="text-[15px] text-muted-foreground">{step.description}</p>
                </div>
              </div>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  )
}
