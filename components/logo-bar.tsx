export function LogoBar() {
  const items = [
    "Betrodd av lokale bedrifter",
    "Oslo",
    "·",
    "Akershus",
    "·",
    "Håndverksbedrifter",
    "·",
    "Resultatorientert",
  ]

  return (
    <div className="bg-white border-y border-border py-5">
      <div className="max-w-[1140px] mx-auto px-7">
        <div className="flex items-center justify-center gap-12 flex-wrap">
          {items.map((item, i) => (
            <span
              key={i}
              className="text-sm font-bold text-[#c5c5c5] tracking-[0.08em] uppercase"
            >
              {item}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
