import { LEGAL_DISCLAIMER } from "@/lib/navigation";
import { cn } from "@/lib/utils";

type LegalDisclaimerProps = {
  className?: string;
  variant?: "inline" | "banner";
};

export function LegalDisclaimer({
  className,
  variant = "inline",
}: LegalDisclaimerProps) {
  return (
    <p
      role="note"
      className={cn(
        "text-xs leading-relaxed text-lex-navy/60",
        variant === "banner" &&
          "rounded-lg border border-lex-navy/10 bg-lex-pale/60 px-4 py-3",
        className
      )}
    >
      {LEGAL_DISCLAIMER}
    </p>
  );
}
