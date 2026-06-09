"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"

function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const hasAnimated = useRef(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true
          let current = 0
          const increment = target / 60
          const timer = setInterval(() => {
            current = Math.min(current + increment, target)
            setCount(Math.round(current))
            if (current >= target) clearInterval(timer)
          }, 25)
        }
      },
      { threshold: 0.1 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [target])

  return (
    <div ref={ref} className="font-serif text-[44px] font-bold text-[#4f52e8] leading-none">
      {count}
      {suffix && <span className="text-[22px]">{suffix}</span>}
    </div>
  )
}

function ProgressBar({ targetWidth }: { targetWidth: string }) {
  const [width, setWidth] = useState("0%")
  const ref = useRef<HTMLDivElement>(null)
  const hasAnimated = useRef(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true
          setTimeout(() => setWidth(targetWidth), 500)
        }
      },
      { threshold: 0.1 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [targetWidth])

  return (
    <div ref={ref} className="h-1.5 bg-border rounded-sm mt-3.5 overflow-hidden">
      <div
        className="h-full bg-gradient-to-r from-[#4f52e8] to-[#6366f1] rounded-sm transition-all duration-[1500ms] ease-out"
        style={{ width }}
      />
    </div>
  )
}

export function HeroSection() {
  return (
    <section id="hero" className="min-h-screen flex items-center pt-[120px] pb-20 relative">
      {/* Animated gradient blob */}
      <div className="absolute -top-[100px] -right-[120px] w-[700px] h-[700px] rounded-full bg-[radial-gradient(circle,rgba(79,82,232,0.10)_0%,transparent_70%)] animate-blob pointer-events-none" />

      <div className="max-w-[1140px] mx-auto px-7 w-full">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.1em] uppercase text-[#4f52e8] mb-5">
              <span className="w-2 h-2 rounded-full bg-[#4f52e8] animate-pulse-dot" />
              Meta Ads-spesialister · Oslo/Akershus
            </div>
            <h1 className="font-serif text-[clamp(40px,5.5vw,68px)] font-bold leading-[1.08] tracking-[-0.02em] mb-6 text-foreground">
              Vi fyller
              <br />
              kalenderen din
              <br />
              med <em className="italic text-[#4f52e8]">kvalitetsleads</em>
            </h1>
            <p className="text-lg text-muted-foreground leading-[1.75] max-w-[460px] mb-10">
              Solid Marketing hjelper rørleggere, elektrikere og andre håndverksbedrifter i Oslo og Akershus
              å hente inn nye kunder via Meta Ads – forutsigbart og målbart.
            </p>
            <div className="flex gap-4 flex-wrap">
              <Link
                href="#booking"
                className="inline-flex items-center gap-2 px-7 py-3.5 text-[15px] font-bold bg-[#4f52e8] text-white rounded-xl shadow-[0_4px_18px_rgba(79,82,232,0.35)] hover:bg-[#6366f1] hover:shadow-[0_8px_28px_rgba(79,82,232,0.45)] hover:-translate-y-[3px] transition-all"
              >
                Book gratis strategimøte &rarr;
              </Link>
              <Link
                href="#prosess"
                className="inline-flex items-center gap-2 px-7 py-3.5 text-[15px] font-bold border-2 border-border rounded-xl text-foreground hover:border-[#4f52e8] hover:text-[#4f52e8] transition-all"
              >
                Se hvordan det fungerer
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Wide card */}
              <div className="sm:col-span-2 bg-white border border-border rounded-2xl p-6 shadow-[0_2px_16px_rgba(0,0,0,0.05)] hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(0,0,0,0.10)] transition-all">
                <AnimatedCounter target={248} />
                <div className="text-[13px] text-muted-foreground mt-1.5 font-medium">
                  Leads generert for håndverksbedrifter
                </div>
                <div className="flex items-end gap-1 h-9 mt-3">
                  {[35, 50, 42, 68, 58, 82, 100].map((height, i) => (
                    <div
                      key={i}
                      className={`w-[11px] rounded-t-sm bg-[#4f52e8] ${height === 100 ? "opacity-100" : "opacity-20"}`}
                      style={{ height: `${height}%` }}
                    />
                  ))}
                </div>
              </div>

              {/* Percentage card */}
              <div className="bg-white border border-border rounded-2xl p-6 shadow-[0_2px_16px_rgba(0,0,0,0.05)] hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(0,0,0,0.10)] transition-all">
                <div className="font-serif text-[44px] font-bold text-[#7b5ea7] leading-none">
                  <AnimatedCounter target={62} suffix="%" />
                </div>
                <div className="text-[13px] text-muted-foreground mt-1.5 font-medium">
                  Lavere kostnad per lead
                </div>
                <ProgressBar targetWidth="72%" />
              </div>

              {/* Tags card */}
              <div className="bg-white border border-border rounded-2xl p-6 shadow-[0_2px_16px_rgba(0,0,0,0.05)] hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(0,0,0,0.10)] transition-all">
                <div className="flex flex-wrap gap-2 mt-3">
                  {["Rørlegger", "Elektriker", "Tømrer", "Maler"].map((tag) => (
                    <span
                      key={tag}
                      className="text-xs font-semibold px-3 py-1.5 rounded-full bg-[rgba(79,82,232,0.07)] text-[#4f52e8] border border-[rgba(79,82,232,0.15)]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="text-[13px] text-muted-foreground mt-3.5 font-medium">
                  Bransjer vi hjelper
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
