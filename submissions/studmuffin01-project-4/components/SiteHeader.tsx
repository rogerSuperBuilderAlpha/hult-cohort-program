import Link from "next/link";
import { courseMeta } from "@/content/course";

export function SiteHeader() {
  return (
    <header className="site-header">
      <Link href="/" className="brand">
        <span className="brand-mark">SCORE Method</span>
        <span className="brand-title">{courseMeta.title}</span>
      </Link>
      <nav className="nav" aria-label="Primary">
        <Link href="/">Home</Link>
        <Link href="/modules">Modules</Link>
        <Link href="/launch">Launch</Link>
        <Link href="/integration">Ludwitt</Link>
      </nav>
    </header>
  );
}
