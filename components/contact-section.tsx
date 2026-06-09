"use client"

import { useEffect, useRef } from "react"
import Link from "next/link"

const contacts = [
  {
    name: "Roberts Murnieks",
    email: "Roberts@solidmarketing.no",
    phone: "988 31 492",
  },
  {
    name: "Ludvig Thomas Schanning",
    email: "Ludvig@solidmarketing.no",
    phone: "922 03 241",
  },
]

function RevealOnScroll({ children }: { children: React.ReactNode }) {
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
    <div ref={ref} className="reveal">
      {children}
    </div>
  )
}

export function ContactSection() {
  return (
    <section id="kontakt" className="py-[100px] bg-[#1a1a2e] text-white">
      <div className="max-w-[1140px] mx-auto px-7">
        <div className="text-xs font-bold tracking-[0.1em] uppercase text-white/50 mb-3.5">
          Kontakt oss
        </div>
        <h2 className="font-serif text-[clamp(30px,4vw,48px)] font-bold leading-[1.12] tracking-[-0.02em] mb-12 text-white">
          Ta kontakt med <em className="italic text-[#4f52e8]">oss</em>
        </h2>

        <RevealOnScroll>
          <div className="grid md:grid-cols-2 gap-[60px] items-start">
            <div className="flex flex-col gap-8">
              {contacts.map((contact) => (
                <div
                  key={contact.name}
                  className="border-l-[3px] border-[#4f52e8] pl-6"
                >
                  <h3 className="text-xl font-extrabold text-white mb-1.5">
                    {contact.name}
                  </h3>
                  <Link
                    href={`mailto:${contact.email}`}
                    className="block text-white/70 text-sm font-medium hover:text-[#4f52e8] transition-colors mb-0.5"
                  >
                    {contact.email}
                  </Link>
                  <Link
                    href={`tel:${contact.phone.replace(/\s/g, "")}`}
                    className="block text-white/70 text-sm font-medium hover:text-[#4f52e8] transition-colors"
                  >
                    {contact.phone}
                  </Link>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-5 md:items-end">
              <div className="md:text-right">
                <p className="text-white font-bold text-[15px]">
                  Kontakt@Solidmarketing.no
                </p>
              </div>

              <div className="text-white/60 text-sm leading-relaxed md:text-right">
                SolidMarketing,
                <br />
                Opsalvegen 94, 2008
                <br />
                Rælingen
              </div>

              <div>
                <div className="text-white/50 text-[13px] uppercase tracking-[0.08em] font-bold mb-3 md:text-right">
                  Sosiale Medier
                </div>
                <div className="flex gap-3.5 md:justify-end">
                  <Link
                    href="#"
                    className="w-10 h-10 rounded-[10px] bg-white/[0.08] border border-white/15 flex items-center justify-center text-lg hover:bg-[rgba(79,82,232,0.3)] hover:border-[#4f52e8] transition-all"
                    title="X / Twitter"
                  >
                    𝕏
                  </Link>
                  <Link
                    href="#"
                    className="w-10 h-10 rounded-[10px] bg-white/[0.08] border border-white/15 flex items-center justify-center text-lg hover:bg-[rgba(79,82,232,0.3)] hover:border-[#4f52e8] transition-all"
                    title="Facebook"
                  >
                    f
                  </Link>
                  <Link
                    href="#"
                    className="w-10 h-10 rounded-[10px] bg-white/[0.08] border border-white/15 flex items-center justify-center text-lg hover:bg-[rgba(79,82,232,0.3)] hover:border-[#4f52e8] transition-all"
                    title="Instagram"
                  >
                    ◎
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  )
}
