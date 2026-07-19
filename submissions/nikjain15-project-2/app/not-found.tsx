import Link from 'next/link';

/**
 * 404 — a reviewer clicking a stale link should meet the product, not the framework. A server
 * component with no listeners on purpose: it has to render when something else is already broken.
 */
export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-bg px-6 text-center">
      <p className="text-body text-navy">That page isn&apos;t here. The cohort still is, though.</p>
      <Link
        href="/home"
        className="mt-4 inline-flex h-10 items-center rounded-md bg-blurple px-5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blurple-600 focus:outline-none focus:ring-4 focus:ring-blurple/10"
      >
        Back to Rally
      </Link>
    </main>
  );
}
