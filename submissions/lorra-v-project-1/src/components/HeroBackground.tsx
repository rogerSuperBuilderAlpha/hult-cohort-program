"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const OVERLAY =
  "linear-gradient(90deg, rgba(6,10,20,0.92) 0%, rgba(6,10,20,0.75) 30%, rgba(6,10,20,0.35) 60%, rgba(6,10,20,0.1) 100%)";

export function HeroBackground() {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      {reducedMotion ? (
        <div className="absolute inset-0">
          <Image
            src="/images/galaxy-hero.png"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
        </div>
      ) : (
        <video
          className="absolute inset-0 h-full w-full object-cover object-center"
          autoPlay
          muted
          loop
          playsInline
          poster="/images/galaxy-hero.png"
          ref={(el) => {
            // React can omit the muted DOM attribute; set the property for autoplay.
            if (el) el.muted = true;
          }}
        >
          <source src="/videos/hero-video.mp4" type="video/mp4" />
        </video>
      )}
      <div className="absolute inset-0" style={{ background: OVERLAY }} />
    </div>
  );
}
