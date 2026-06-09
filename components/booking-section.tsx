"use client"

import { useState, useEffect, useRef } from "react"
import { Zap, Target, Lock } from "lucide-react"

const perks = [
  {
    icon: Zap,
    title: "Rask respons",
    description: "Vi svarer innen samme arbeidsdag og bekrefter tidspunkt.",
  },
  {
    icon: Target,
    title: "Tilpasset for håndverk",
    description: "Vi kjenner bransjens utfordringer og snakker ikke fagsjargong.",
  },
  {
    icon: Lock,
    title: "Ingen forpliktelser",
    description: "Møtet er gratis og uforpliktende. Ingen skjult salg.",
  },
]

const industries = [
  "Maler",
  "Flislegger",
  "Gulvlegger",
  "Glassmester",
  "Elektriker",
  "Rørlegger",
  "Ventilasjon / VVS",
  "Varmepumpe",
  "Tømrer / Snekker",
  "Blikkenslager",
  "Taktekker",
  "Murer",
  "Anleggsgartner",
  "Betong & grunnarbeid",
  "Annet håndverk",
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

export function BookingSection() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    industry: "",
    datetime: "",
    message: "",
  })
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.firstName || !formData.lastName || !formData.email || !formData.industry) {
      alert("Fyll ut fornavn, etternavn, e-post og bransje.")
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("https://formsubmit.co/ajax/Roberts@solidmarketing.no", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          Fornavn: formData.firstName,
          Etternavn: formData.lastName,
          "E-post": formData.email,
          Telefon: formData.phone,
          Bransje: formData.industry,
          "Ønsket tidspunkt": formData.datetime,
          Melding: formData.message,
          _cc: "Ludvig@solidmarketing.no",
          _subject: "Ny henvendelse fra Solidmarketing.no",
          _template: "table",
        }),
      })

      if (!response.ok) {
        throw new Error("Kunne ikke sende forespørsel")
      }

      setIsSubmitted(true)
      setShowToast(true)
      setTimeout(() => setShowToast(false), 4500)

      // Reset form
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        industry: "",
        datetime: "",
        message: "",
      })
    } catch (error) {
      console.error("Booking error:", error)
      alert("Noe gikk galt. Vennligst prøv igjen eller kontakt oss direkte.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <section id="booking" className="py-[100px] bg-white">
        <div className="max-w-[1140px] mx-auto px-7">
          <div className="grid lg:grid-cols-2 gap-[72px] items-start">
            <RevealOnScroll>
              <div>
                <span className="inline-flex items-center gap-1.5 text-xs font-bold tracking-[0.08em] uppercase px-3.5 py-1.5 rounded-full bg-[rgba(79,82,232,0.09)] text-[#4f52e8] border border-[rgba(79,82,232,0.18)] mb-5">
                  Book møte
                </span>
                <h2 className="font-serif text-[clamp(30px,4vw,48px)] font-bold leading-[1.12] tracking-[-0.02em] mb-4 text-foreground mt-4">
                  La oss se på
                  <br />
                  <em className="italic text-[#4f52e8]">mulighetene dine</em>
                </h2>
                <p className="text-[17px] text-muted-foreground mb-9">
                  Book et gratis 30-minutters strategimøte. Vi gir deg konkrete råd – uansett om du velger å jobbe med oss.
                </p>

                <div className="flex flex-col gap-4">
                  {perks.map((perk) => (
                    <div
                      key={perk.title}
                      className="flex gap-4 items-start bg-[#f8f7f4] rounded-xl p-5 border border-border"
                    >
                      <div className="text-[22px] flex-shrink-0 text-[#4f52e8]">
                        <perk.icon size={22} />
                      </div>
                      <div>
                        <h4 className="text-[15px] font-bold mb-0.5">{perk.title}</h4>
                        <p className="text-sm text-muted-foreground">{perk.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </RevealOnScroll>

            <RevealOnScroll delay={2}>
              <div className="bg-[#f8f7f4] border border-border rounded-[20px] p-11 shadow-[0_4px_32px_rgba(0,0,0,0.06)]">
                <h3 className="font-serif text-[26px] font-bold mb-[30px]">Book gratis strategimøte</h3>
                <form onSubmit={handleSubmit}>
                  <div className="grid sm:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-[13px] font-semibold text-foreground mb-1.5">
                        Fornavn *
                      </label>
                      <input
                        type="text"
                        placeholder="Ola"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        className="w-full bg-white border-[1.5px] border-border rounded-[10px] text-foreground text-[15px] px-4 py-3 outline-none transition-all focus:border-[#4f52e8] focus:shadow-[0_0_0_3px_rgba(79,82,232,0.12)]"
                      />
                    </div>
                    <div>
                      <label className="block text-[13px] font-semibold text-foreground mb-1.5">
                        Etternavn *
                      </label>
                      <input
                        type="text"
                        placeholder="Nordmann"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        className="w-full bg-white border-[1.5px] border-border rounded-[10px] text-foreground text-[15px] px-4 py-3 outline-none transition-all focus:border-[#4f52e8] focus:shadow-[0_0_0_3px_rgba(79,82,232,0.12)]"
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-[13px] font-semibold text-foreground mb-1.5">
                      E-post *
                    </label>
                    <input
                      type="email"
                      placeholder="ola@bedriften.no"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-white border-[1.5px] border-border rounded-[10px] text-foreground text-[15px] px-4 py-3 outline-none transition-all focus:border-[#4f52e8] focus:shadow-[0_0_0_3px_rgba(79,82,232,0.12)]"
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-[13px] font-semibold text-foreground mb-1.5">
                      Telefon
                    </label>
                    <input
                      type="tel"
                      placeholder="+47 900 00 000"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full bg-white border-[1.5px] border-border rounded-[10px] text-foreground text-[15px] px-4 py-3 outline-none transition-all focus:border-[#4f52e8] focus:shadow-[0_0_0_3px_rgba(79,82,232,0.12)]"
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-[13px] font-semibold text-foreground mb-1.5">
                      Bransje *
                    </label>
                    <select
                      value={formData.industry}
                      onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                      className="w-full bg-white border-[1.5px] border-border rounded-[10px] text-foreground text-[15px] px-4 py-3 outline-none transition-all focus:border-[#4f52e8] focus:shadow-[0_0_0_3px_rgba(79,82,232,0.12)]"
                    >
                      <option value="">Velg bransje</option>
                      {industries.map((industry) => (
                        <option key={industry} value={industry}>
                          {industry}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-4">
                    <label className="block text-[13px] font-semibold text-foreground mb-1.5">
                      Ønsket tidspunkt
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.datetime}
                      onChange={(e) => setFormData({ ...formData, datetime: e.target.value })}
                      className="w-full bg-white border-[1.5px] border-border rounded-[10px] text-foreground text-[15px] px-4 py-3 outline-none transition-all focus:border-[#4f52e8] focus:shadow-[0_0_0_3px_rgba(79,82,232,0.12)]"
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-[13px] font-semibold text-foreground mb-1.5">
                      Hva kan vi hjelpe deg med?
                    </label>
                    <textarea
                      placeholder="Fortell litt om bedriften og hva du trenger..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full bg-white border-[1.5px] border-border rounded-[10px] text-foreground text-[15px] px-4 py-3 outline-none transition-all focus:border-[#4f52e8] focus:shadow-[0_0_0_3px_rgba(79,82,232,0.12)] resize-y min-h-24"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full inline-flex items-center justify-center gap-2 px-7 py-4 text-base font-bold bg-[#0f0f0f] text-white rounded-xl shadow-[0_4px_18px_rgba(0,0,0,0.2)] hover:bg-[#1a1a1a] hover:shadow-[0_8px_28px_rgba(0,0,0,0.3)] hover:-translate-y-[3px] transition-all mt-1.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                  >
                    {isSubmitting ? "Sender..." : "Send forespørsel"} {!isSubmitting && <span>&rarr;</span>}
                  </button>

                  {isSubmitted && (
                    <div className="mt-4 bg-[rgba(34,197,94,0.08)] border border-[rgba(34,197,94,0.25)] text-[#16a34a] rounded-[10px] px-4 py-3.5 text-center font-semibold text-[15px]">
                      Takk! Vi kontakter deg innen kort tid for å bekrefte møtet.
                    </div>
                  )}
                </form>
              </div>
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* Toast notification */}
      <div
        className={`fixed bottom-7 right-7 z-[9999] bg-white border border-border rounded-xl px-5 py-4 shadow-[0_8px_40px_rgba(0,0,0,0.12)] max-w-[320px] text-sm transition-transform duration-400 ${
          showToast ? "translate-x-0" : "translate-x-[120%]"
        }`}
        style={{ transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)" }}
      >
        <div className="font-bold mb-0.5 text-foreground">Forespørsel mottatt!</div>
        <div className="text-muted-foreground">Vi bekrefter tidspunkt på e-post innen kort tid.</div>
      </div>
    </>
  )
}
