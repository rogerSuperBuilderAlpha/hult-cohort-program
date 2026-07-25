"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import LogoutButton from "@/components/auth/LogoutButton";
import ThemeToggle from "@/components/ThemeToggle";
import { CommandCenterMobileToggle } from "@/hooks/CommandCenterMobileProvider";
import { WELCOME_GATE_IMAGE, WELCOME_GATE_IMAGE_REMOTE } from "@/lib/auth/welcomeStyles";
import { dashboardHeaderSubtitleClassName, COMMAND_CENTER_SIDEBAR_WIDTH_CLASS } from "@/lib/dashboardStyles";
import { useSupabaseUser } from "@/hooks/useSupabaseUser";

interface PageHeaderProps {
  id?: string;
  backHref?: string;
  backLabel?: string;
  title?: string;
  subtitle?: string;
}

function BrandGateMark() {
  const [imageSrc, setImageSrc] = useState(WELCOME_GATE_IMAGE);

  return (
    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl shadow-lg ring-2 ring-amber-400/50 sm:h-20 sm:w-20 lg:h-24 lg:w-24">
      <Image
        src={imageSrc}
        alt=""
        fill
        className="object-cover object-center"
        sizes="(max-width: 640px) 64px, (max-width: 1024px) 80px, 96px"
        priority
        onError={() => {
          if (imageSrc !== WELCOME_GATE_IMAGE_REMOTE) {
            setImageSrc(WELCOME_GATE_IMAGE_REMOTE);
          }
        }}
      />
    </div>
  );
}

export default function PageHeader({
  id,
  backHref,
  backLabel,
  title = "INITIARA",
  subtitle = "The Gateway to Project Success",
}: PageHeaderProps) {
  const { userId, isAuthLoaded } = useSupabaseUser();
  const isMainDashboard = !backHref && title === "INITIARA";

  return (
    <header
      id={id}
      className="relative scroll-mt-0 overflow-hidden shadow-lg dark:border-b dark:border-surface-border dark:shadow-none"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-br from-amber-950 via-stone-900 to-emerald-950"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-r from-black/25 via-transparent to-black/10"
      />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-amber-400/35 to-transparent"
      />

      <div
        className={`relative z-10 flex w-full items-center justify-between gap-4 ${
          isMainDashboard ? "px-2 py-5 sm:px-3 sm:py-6 lg:px-4 lg:py-7" : "py-5 sm:py-6"
        }`}
      >
        {!isMainDashboard && (
          <div className={`hidden shrink-0 lg:block ${COMMAND_CENTER_SIDEBAR_WIDTH_CLASS}`} aria-hidden="true" />
        )}
        <div
          className={`min-w-0 flex-1 ${
            isMainDashboard ? "" : "px-4 sm:px-6 lg:px-8"
          }`}
        >
          {backHref && backLabel && (
            <Link
              href={backHref}
              className="text-sm font-medium text-amber-100/90 transition-colors hover:text-white"
            >
              {backLabel}
            </Link>
          )}
          <div
            className={
              isMainDashboard
                ? "flex items-center gap-3 sm:gap-4"
                : backHref
                  ? "mt-3"
                  : ""
            }
          >
            {isMainDashboard && <BrandGateMark />}
            <div>
              <h1
                className={`font-display font-extrabold tracking-wide text-white drop-shadow-sm dark:text-surface-primary ${
                  backHref ? "text-2xl sm:text-3xl" : "text-3xl sm:text-4xl"
                }`}
              >
                {title}
              </h1>
              {subtitle && <p className={dashboardHeaderSubtitleClassName}>{subtitle}</p>}
            </div>
          </div>
        </div>
        <div
          className={`flex shrink-0 items-center gap-2 self-center ${
            isMainDashboard ? "" : "pr-4 sm:pr-6 lg:pr-8"
          }`}
        >
          <CommandCenterMobileToggle />
          {isAuthLoaded && userId ? (
            <LogoutButton compact />
          ) : isAuthLoaded ? (
            <Link
              href="/auth/login"
              className="rounded-lg border border-white/25 bg-white/10 px-3 py-2 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/20"
            >
              Log in
            </Link>
          ) : null}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
