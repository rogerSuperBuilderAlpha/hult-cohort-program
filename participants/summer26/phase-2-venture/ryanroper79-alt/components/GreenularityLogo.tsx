import Image from 'next/image';
import Link from 'next/link';

type GreenularityLogoProps = {
  size?: 'sm' | 'md' | 'lg';
  /** White backing for dark backgrounds (sidebar) */
  onDark?: boolean;
  href?: string | null;
  className?: string;
  priority?: boolean;
};

const SIZES = {
  sm: { height: 36, width: 140 },
  md: { height: 48, width: 190 },
  lg: { height: 64, width: 260 },
} as const;

export function GreenularityLogo({
  size = 'md',
  onDark = false,
  href = '/',
  className = '',
  priority = false,
}: GreenularityLogoProps) {
  const { height, width } = SIZES[size];

  const img = (
    <Image
      src="/greenularity-logo.png"
      alt="Greenularity — Digitize. Decide. Decarbonize."
      width={width}
      height={height}
      priority={priority}
      className="h-auto w-auto max-w-full object-contain object-left"
      style={{ maxHeight: height }}
    />
  );

  const inner = onDark ? (
    <span
      className={`inline-flex max-w-full items-center rounded-xl bg-white px-2.5 py-2 shadow-sm ${className}`}
    >
      {img}
    </span>
  ) : (
    <span className={`inline-flex max-w-full items-center ${className}`}>{img}</span>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="inline-block max-w-full rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
      >
        {inner}
      </Link>
    );
  }

  return inner;
}

/** Colored tagline for text-only contexts (logo already includes tagline) */
export function GreenularityTagline({ className = '' }: { className?: string }) {
  return (
    <p className={`text-xs font-medium ${className}`}>
      <span className="text-sky-600">Digitize.</span>{' '}
      <span className="text-amber-500">Decide.</span>{' '}
      <span className="text-emerald-600">Decarbonize.</span>
    </p>
  );
}
