import Link from "next/link"
import Image from "next/image"

export function Footer() {
  return (
    <footer className="bg-[#0f0f0f] text-white/60 py-[52px]">
      <div className="max-w-[1140px] mx-auto px-7">
        <div className="flex items-center justify-between flex-wrap gap-6">
          <div>
            <Image
              src="/logo.jpg"
              alt="Solid Marketing"
              width={38}
              height={38}
              className="rounded-lg opacity-95"
            />
          </div>

          <div className="flex gap-6 text-sm">
            <Link href="#tjenester" className="hover:text-white transition-colors">
              Tjenester
            </Link>
            <Link href="#prosess" className="hover:text-white transition-colors">
              Prosess
            </Link>
            <Link
              href="mailto:hei@solidmarketing.no"
              className="hover:text-white transition-colors"
            >
              hei@solidmarketing.no
            </Link>
          </div>

          <div className="text-[13px] opacity-40">© 2025 Solid Marketing AS</div>
        </div>
      </div>
    </footer>
  )
}
