import Link from "next/link";
import { ShieldCheck } from "lucide-react";

type LudwittSignInPromptProps = {
  title: string;
  description: string;
  returnPath: string;
};

export function LudwittSignInPrompt({
  title,
  description,
  returnPath,
}: LudwittSignInPromptProps) {
  const loginHref = `/auth/login?returnTo=${encodeURIComponent(returnPath)}`;

  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center">
      <ShieldCheck
        className="mx-auto size-10 text-lex-gold"
        strokeWidth={1.75}
        aria-hidden
      />
      <h1 className="mt-4 font-serif text-2xl font-semibold text-lex-navy">
        {title}
      </h1>
      <p className="mt-3 text-base leading-relaxed text-lex-navy/75">
        {description}
      </p>
      <p className="mt-2 text-sm text-lex-navy/60">
        Sign in with your Ludwitt account to begin tracked learning. Browsing the
        homepage and module list does not require sign-in.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link
          href={loginHref}
          className="inline-flex h-11 items-center justify-center rounded-lg bg-lex-navy px-6 text-sm font-medium text-white hover:bg-lex-navy/90"
        >
          Sign in with Ludwitt
        </Link>
        <Link
          href="/learn"
          className="inline-flex h-11 items-center justify-center rounded-lg border border-lex-navy/20 bg-white px-6 text-sm font-medium text-lex-navy hover:bg-lex-pale"
        >
          Back to modules
        </Link>
      </div>
    </div>
  );
}
