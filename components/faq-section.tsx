"use client"

import { useEffect, useRef, useState } from "react"
import { Plus } from "lucide-react"

const faqs = [
  {
    question: "Hva koster det?",
    answer:
      "Det avhenger av hva du trenger og hvor stort annonsebudsjettet ditt er. Vi setter oss ned med deg på et gratis og uforpliktende møte, blir kjent med bedriften din, og gir deg et konkret forslag tilpasset din situasjon. Du får alltid vite hva du betaler for før du bestemmer deg.",
  },
  {
    question: "Hvor raskt ser jeg resultater?",
    answer:
      "Det varierer fra bedrift til bedrift, og avhenger blant annet av bransje, budsjett og konkurransen i ditt område. Vi lover ikke mirakler over natten – men vi er ærlige med deg om forventningene underveis og justerer kontinuerlig for å få mest mulig ut av kronene.",
  },
  {
    question: "Må jeg binde meg?",
    answer:
      "Nei. Vi mener at gode resultater skal være grunnen til at du blir – ikke en kontrakt. Vi ønsker et samarbeid som varer fordi det fungerer, ikke fordi du er låst fast.",
  },
  {
    question: "Jeg har aldri annonsert før – passer det?",
    answer:
      "Absolutt. Mange av dem vi hjelper har aldri kjørt annonser tidligere. Vi tar oss av det tekniske og forklarer alt på en måte som er enkel å forstå. Du trenger ikke kunne noe om Meta Ads fra før.",
  },
  {
    question: "Hvilke bransjer jobber dere med?",
    answer:
      "Vi spesialiserer oss på håndverksbedrifter i Oslo og Akershus – blant annet malere, flisleggere, gulvleggere, glassmestere, elektrikere, rørleggere, ventilasjon/VVS, varmepumpe, tømrere, blikkenslagere, taktekkere, murere, anleggsgartnere og bedrifter innen betong og grunnarbeid. Driver du med noe annet innen håndverk? Ta kontakt, så ser vi på det sammen.",
  },
]

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="border border-border rounded-2xl bg-white overflow-hidden transition-all">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 text-left px-6 py-5 hover:bg-[#f8f7f4] transition-colors"
        aria-expanded={open}
      >
        <span className="text-[17px] font-bold text-foreground">{question}</span>
        <span
          className={`flex-shrink-0 text-[#4f52e8] transition-transform duration-300 ${open ? "rotate-45" : ""}`}
        >
          <Plus size={22} />
        </span>
      </button>
      <div
        className={`grid transition-all duration-300 ease-out ${
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <p className="px-6 pb-5 text-[15px] text-muted-foreground leading-relaxed">{answer}</p>
        </div>
      </div>
    </div>
  )
}

export function FaqSection() {
  return (
    <section id="faq" className="py-[100px] bg-[#f8f7f4] border-t border-border">
      <div className="max-w-[820px] mx-auto px-7">
        <div className="text-xs font-bold tracking-[0.1em] uppercase text-[#4f52e8] mb-3.5">
          Ofte stilte spørsmål
        </div>
        <h2 className="font-serif text-[clamp(30px,4vw,48px)] font-bold leading-[1.12] tracking-[-0.02em] mb-4 text-foreground">
          Spørsmål og <em className="italic text-[#4f52e8]">svar</em>
        </h2>
        <p className="text-[17px] text-muted-foreground max-w-[540px] mb-12 leading-[1.75]">
          Lurer du på noe? Her er de vanligste spørsmålene vi får.
        </p>

        <div className="flex flex-col gap-4">
          {faqs.map((faq) => (
            <FaqItem key={faq.question} question={faq.question} answer={faq.answer} />
          ))}
        </div>
      </div>
    </section>
  )
}
