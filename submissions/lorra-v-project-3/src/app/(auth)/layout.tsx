import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-full flex-1 flex-col">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(61,255,181,0.10),_transparent_50%)]"
      />
      <div className="relative mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-16">
        <Link
          href="/"
          className="mb-10 font-display text-lg font-semibold tracking-tight"
        >
          <span className="text-foreground">Comen</span>
          <span className="text-accent">tiq</span>
        </Link>
        {children}
      </div>
    </div>
  );
}
