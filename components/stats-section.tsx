"use client"

import { useEffect, useState, useRef } from "react"

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

export function StatsSection() {
  const [stats, setStats] = useState({
    pageViews: "—",
    uniqueVisitors: "—",
    meetingsBooked: "—",
    pixelEvents: "—",
  })

  useEffect(() => {
    // Demo stats - in production these would come from GA4/Meta
    setStats({
      pageViews: String(Math.floor(Math.random() * 80) + 40),
      uniqueVisitors: String(Math.floor(Math.random() * 40) + 20),
      meetingsBooked: String(Math.floor(Math.random() * 5) + 2),
      pixelEvents: String(Math.floor(Math.random() * 30) + 10),
    })
  }, [])

  const statCards = [
    {
      label: "Sidevisninger i dag",
      value: stats.pageViews,
      delta: "↑ +18% vs i går",
      color: "#4f52e8",
    },
    {
      label: "Unike besøkende",
      value: stats.uniqueVisitors,
      delta: "↑ +9% denne uka",
      color: "#7b5ea7",
    },
    {
      label: "Møter booket",
      value: stats.meetingsBooked,
      delta: "↑ +3 siden mandag",
      color: "#4f52e8",
    },
    {
      label: "Meta Pixel-events",
      value: stats.pixelEvents,
      delta: "✓ Pixel aktiv",
      color: "#7b5ea7",
    },
  ]

  return (
    <section id="stats" className="py-[100px] bg-[#f8f7f4] border-t border-border">
      <div className="max-w-[1140px] mx-auto px-7">
        <div className="text-xs font-bold tracking-[0.1em] uppercase text-[#4f52e8] mb-3.5">
          Nettside-statistikk
        </div>
        <h2 className="font-serif text-[clamp(30px,4vw,48px)] font-bold leading-[1.12] tracking-[-0.02em] mb-4 text-foreground">
          Se hva som skjer på
          <br />
          <em className="italic text-[#4f52e8]">nettsiden din</em>
        </h2>
        <p className="text-[17px] text-muted-foreground max-w-[540px] mb-14 leading-[1.75]">
          Kobler du inn Google Analytics 4 + Meta Pixel får du full oversikt over trafikk, leads og annonseavkastning.
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-5">
          {statCards.map((stat, i) => (
            <RevealOnScroll key={stat.label} delay={i}>
              <div className="bg-white border border-border rounded-[14px] p-6">
                <div className="text-xs font-bold tracking-[0.06em] uppercase text-muted-foreground">
                  {stat.label}
                </div>
                <div
                  className="font-serif text-4xl font-bold my-1.5"
                  style={{ color: stat.color }}
                >
                  {stat.value}
                </div>
                <div className="text-[13px] text-[#16a34a] font-semibold">{stat.delta}</div>
              </div>
            </RevealOnScroll>
          ))}
        </div>

        <p className="text-[13px] text-muted-foreground text-center pt-3">
          Koble til <strong>Google Analytics 4</strong> og <strong>Meta Events Manager</strong> for live data. Se hosting-guiden for detaljer.
        </p>
      </div>
    </section>
  )
}
