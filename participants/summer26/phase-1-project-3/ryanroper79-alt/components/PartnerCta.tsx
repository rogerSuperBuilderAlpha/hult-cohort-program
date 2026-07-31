import { positioning } from '@/data/cohort';

type Props = {
  variant?: 'primary' | 'secondary';
  className?: string;
};

export function PartnerCta({ variant = 'primary', className = '' }: Props) {
  const base = 'inline-block rounded-md px-5 py-3 font-semibold focus-ring';
  const styles =
    variant === 'primary'
      ? `${base} bg-ceal-sun text-ceal-ink hover:bg-ceal-sunGlow`
      : `${base} border border-ceal-mangrove text-ceal-mangrove hover:bg-ceal-panel`;

  return (
    <a href={positioning.contactHref} className={`${styles} ${className}`}>
      {positioning.partnerAsk}
    </a>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-ceal-line bg-ceal-panel">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-12 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-display text-xl text-ceal-mangrove">Build Now</p>
          <p className="mt-2 max-w-md text-sm text-ceal-muted">{positioning.partnerAsk}</p>
        </div>
        <PartnerCta />
      </div>
    </footer>
  );
}
