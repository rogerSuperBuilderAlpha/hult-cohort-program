import Link from "next/link";

type BrandedStatusContentProps = {
  eyebrow: string;
  title: string;
  body: string;
  primaryLabel: string;
  primaryHref?: string;
  onPrimaryClick?: () => void;
  secondaryLabel?: string;
  secondaryHref?: string;
};

export function BrandedStatusContent({
  eyebrow,
  title,
  body,
  primaryLabel,
  primaryHref,
  onPrimaryClick,
  secondaryLabel = "Back to homepage",
  secondaryHref = "/",
}: BrandedStatusContentProps) {
  const primaryClassName =
    "inline-flex h-11 items-center justify-center rounded-lg bg-lex-navy px-6 text-sm font-medium text-white hover:bg-lex-navy/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lex-gold focus-visible:ring-offset-2";

  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lex-gold">
        {eyebrow}
      </p>
      <h1 className="mt-3 font-serif text-3xl font-semibold text-lex-navy">
        {title}
      </h1>
      <p className="mt-4 text-base leading-relaxed text-lex-navy/75">{body}</p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        {onPrimaryClick ? (
          <button type="button" onClick={onPrimaryClick} className={primaryClassName}>
            {primaryLabel}
          </button>
        ) : (
          <Link href={primaryHref ?? "/"} className={primaryClassName}>
            {primaryLabel}
          </Link>
        )}
        <Link
          href={secondaryHref}
          className="inline-flex h-11 items-center justify-center rounded-lg border border-lex-navy/20 bg-white px-6 text-sm font-medium text-lex-navy hover:bg-lex-pale focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lex-gold focus-visible:ring-offset-2"
        >
          {secondaryLabel}
        </Link>
      </div>
    </div>
  );
}
