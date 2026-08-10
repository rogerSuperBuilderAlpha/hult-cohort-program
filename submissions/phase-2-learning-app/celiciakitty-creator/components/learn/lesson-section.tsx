import { cn } from "@/lib/utils";

type LessonSectionProps = {
  title: string;
  children: React.ReactNode;
  className?: string;
  id?: string;
};

export function LessonSection({
  title,
  children,
  className,
  id,
}: LessonSectionProps) {
  return (
    <section
      id={id}
      className={cn(
        "rounded-2xl border border-lex-navy/10 bg-white p-6 shadow-sm sm:p-8",
        className
      )}
      aria-labelledby={id ? `${id}-heading` : undefined}
    >
      <h2
        id={id ? `${id}-heading` : undefined}
        className="font-serif text-xl font-semibold text-lex-navy sm:text-2xl"
      >
        {title}
      </h2>
      <div className="mt-4 space-y-4 text-base leading-relaxed text-lex-navy/80">
        {children}
      </div>
    </section>
  );
}
