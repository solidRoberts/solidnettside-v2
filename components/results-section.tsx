"use client"

import { useEffect, useRef } from "react"

const results = [
  {
    value: "3–8×",
    description: "ROAS (Return on Ad Spend) for kunder i første kvartal",
  },
  {
    value: "−62%",
    description: "Lavere kostnad per lead vs. bransjegjennomsnitt",
  },
  {
    value: "14d",
    description: "Fra oppstart til første kvalifiserte lead i snitt",
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
    <div ref={ref} className={`reveal ${delay > 0 ? `reveal-delay-${delay * 2}` : ""}`}>
      {children}
    </div>
  )
}

export function ResultsSection() {
  return (
    <section id="resultater" className="py-[100px] bg-[#0f0f0f] text-white">
      <div className="max-w-[1140px] mx-auto px-7">
        <div className="text-xs font-bold tracking-[0.1em] uppercase text-white/50 mb-3.5">
          Resultater
        </div>
        <h2 className="font-serif text-[clamp(30px,4vw,48px)] font-bold leading-[1.12] tracking-[-0.02em] mb-4 text-white">
          Tall som taler <em className="italic text-[#4f52e8]">for seg selv</em>
        </h2>
        <p className="text-[17px] text-white/55 max-w-[540px] mb-14 leading-[1.75]">
          Eksempler på hva vi leverer for håndverksbedrifter i Oslo/Akershus.
        </p>

        <div className="grid md:grid-cols-3 gap-6">
          {results.map((result, i) => (
            <RevealOnScroll key={result.value} delay={i}>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-9 text-center hover:border-[rgba(79,82,232,0.5)] hover:-translate-y-1 transition-all">
                <div className="font-serif text-[54px] font-bold leading-none text-[#7b5ea7]">
                  {result.value}
                </div>
                <p className="text-sm text-white/50 mt-2.5">{result.description}</p>
              </div>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  )
}
