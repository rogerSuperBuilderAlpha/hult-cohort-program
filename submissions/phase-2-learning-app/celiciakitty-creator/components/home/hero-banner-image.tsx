import Image from "next/image";

/** Above-the-fold hero banner — server-rendered so `priority` preloads for LCP. */
export function HeroBannerImage() {
  return (
    <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-lex-navy/10 bg-white shadow-[0_20px_50px_-20px_rgba(30,58,95,0.25)] sm:aspect-[16/11] lg:aspect-[4/5] lg:min-h-[420px]">
      <Image
        src="/images/floral-banner.png"
        alt="Blue and white botanical illustration of roses and peonies"
        fill
        priority
        quality={90}
        sizes="(max-width: 640px) calc(100vw - 2rem), (max-width: 1024px) calc(100vw - 3rem), 484px"
        className="object-cover object-center"
      />
    </div>
  );
}
