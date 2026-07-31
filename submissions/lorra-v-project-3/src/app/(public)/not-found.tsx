import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-start gap-4 px-6 py-24">
      <p className="text-xs uppercase tracking-[0.16em] text-foreground-muted">
        404
      </p>
      <h1 className="font-display text-3xl font-semibold tracking-tight">
        Not found
      </h1>
      <p className="text-foreground-muted">
        That builder or project isn’t published — or the link is wrong.
      </p>
      <div className="flex flex-wrap gap-2 pt-2">
        <Link href="/projects">
          <Button>Projects</Button>
        </Link>
        <Link href="/builders">
          <Button variant="secondary">Builders</Button>
        </Link>
      </div>
    </div>
  );
}
