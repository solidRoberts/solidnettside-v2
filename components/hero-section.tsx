"use client"

import Link from "next/link"
import { BarChart3, Eye } from "lucide-react"

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
                <div className="w-11 h-11 rounded-xl bg-[rgba(79,82,232,0.09)] flex items-center justify-center text-[#4f52e8] mb-3.5">
                  <BarChart3 size={22} />
                </div>
                <div className="text-base font-bold text-foreground leading-snug">Meta Ads</div>
                <div className="text-[13px] text-muted-foreground mt-1 font-medium leading-relaxed">
                  Facebook- &amp; Instagram-annonser skreddersydd for håndverkere
                </div>
              </div>

              {/* Transparency card */}
              <div className="bg-white border border-border rounded-2xl p-6 shadow-[0_2px_16px_rgba(0,0,0,0.05)] hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(0,0,0,0.10)] transition-all">
                <div className="w-11 h-11 rounded-xl bg-[rgba(79,82,232,0.09)] flex items-center justify-center text-[#4f52e8] mb-3.5">
                  <Eye size={22} />
                </div>
                <div className="text-base font-bold text-foreground leading-snug">Full åpenhet</div>
                <div className="text-[13px] text-muted-foreground mt-1 font-medium leading-relaxed">
                  Du ser hva budsjettet brukes på
                </div>
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
