import { cn, toPersianNumber } from "@/app/_lib/utils"
import CompanyInfo from "@/app/_ui/companyInfo"
import Image from "next/image"

const namad = [
  { src: "/allameh-white.png", link: 'https://incubator.atu.ac.ir', alt: "ATU", className: "scale-85" },
  { src: "/enamad-white.png", link: '', alt: "E-namad", className: "scale-90" },
  { src: "/zplogo.png", link: '', alt: "Zarinpal", className: "scale-80 mt-0.5" },
]

export default function Footer() {
  return (
    <footer className="bg-neutral-800/75 text-neutral-50 pt-16 md:pt-12 pb-6 mt-10 min-h-screen">
      <div id="about-footer" className="md:px-32 mx-auto px-6 grid grid-cols-1 sm:grid-cols-5 xl:grid-cols-8 gap-y-6 gap-x-32">

        <CompanyInfo showDescription={true} />

        {/* نمادهای الکترونیکی */}
        <div className="md:order-1 sm:col-span-1 xl:col-span-2">
          <div className="grid grid-cols-3 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {namad?.map((n, idx) => (
              <a key={idx} href={n.link} className="size-16 p-0.5 mx-auto overflow-hidden bg-neutral-400/25 md:hover:bg-neutral-400/50 active:bg-neutral-400/50 rounded-2xl transition-all">
                <Image
                  width={500}
                  height={500}
                  src={n.src}
                  alt={n.alt}
                  className={cn(
                    "size-full object-contain",
                    n.className
                  )}
                />
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* خط جداکننده */}
      <div className="border-t border-neutral-400/10 mt-4 md:mt-10 pt-2 text-center text-xs text-neutral-400">
        © {toPersianNumber(new Date().getFullYear())} دادنوس. تمامی حقوق محفوظ است.
      </div>
    </footer>
  )
}
