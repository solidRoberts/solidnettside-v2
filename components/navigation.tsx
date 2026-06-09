"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Menu, X } from "lucide-react"

export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const navLinks = [
    { href: "#tjenester", label: "Tjenester" },
    { href: "#prosess", label: "Prosess" },
    { href: "#resultater", label: "Resultater" },
    { href: "#booking", label: "Book møte" },
    { href: "#kontakt", label: "Kontakt" },
  ]

  return (
    <>
      <nav
        className={`fixed top-0 w-full z-50 bg-[#f8f7f4]/90 backdrop-blur-xl border-b border-border transition-shadow duration-300 ${
          isScrolled ? "shadow-[0_2px_24px_rgba(0,0,0,0.07)]" : ""
        }`}
      >
        <div className="max-w-[1140px] mx-auto px-7">
          <div className="flex items-center justify-between h-[70px]">
            <Link href="/" className="flex items-center">
              <Image
                src="/logo.png"
                alt="Solid Marketing"
                width={160}
                height={44}
                className="h-[44px] w-auto object-contain rounded-lg"
              />
            </Link>

            <ul className="hidden lg:flex items-center gap-8 text-[15px] font-medium">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground hover:text-[#4f52e8] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="hidden lg:flex items-center gap-3">
              <Link
                href="#booking"
                className="inline-flex items-center gap-2 px-7 py-3.5 text-[15px] font-bold border-2 border-border rounded-xl text-foreground hover:border-[#4f52e8] hover:text-[#4f52e8] transition-all"
              >
                Kontakt oss
              </Link>
              <Link
                href="#booking"
                className="inline-flex items-center gap-2 px-7 py-3.5 text-[15px] font-bold bg-[#4f52e8] text-white rounded-xl shadow-[0_4px_18px_rgba(79,82,232,0.35)] hover:bg-[#6366f1] hover:shadow-[0_8px_28px_rgba(79,82,232,0.45)] hover:-translate-y-[3px] transition-all"
              >
                Gratis møte &rarr;
              </Link>
            </div>

            <button
              className="lg:hidden flex flex-col gap-[5px] cursor-pointer"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <span className="w-6 h-0.5 bg-foreground rounded-sm" />
              <span className="w-6 h-0.5 bg-foreground rounded-sm" />
              <span className="w-6 h-0.5 bg-foreground rounded-sm" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div
        className={`fixed inset-0 z-[200] bg-white flex flex-col items-center justify-center gap-9 transition-opacity duration-300 ${
          isMobileMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
      >
        <button
          className="absolute top-6 right-7 text-[28px] cursor-pointer text-foreground"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-label="Close menu"
        >
          <X size={28} />
        </button>
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="text-[26px] font-bold text-foreground hover:text-[#4f52e8] transition-colors"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            {link.label}
          </Link>
        ))}
        <Link
          href="#booking"
          className="inline-flex items-center gap-2 px-7 py-3.5 text-[17px] font-bold bg-[#4f52e8] text-white rounded-xl shadow-[0_4px_18px_rgba(79,82,232,0.35)] hover:bg-[#6366f1] transition-all"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          Kom i gang &rarr;
        </Link>
      </div>
    </>
  )
}
