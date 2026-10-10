import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center">
      <p className="eyebrow text-muted">404</p>
      <h1 className="serif mt-3 text-5xl">This page has wandered off.</h1>
      <p className="mt-3 text-sm leading-6 text-muted">The link may be old, or the piece may have sold through.</p>
      <p className="mt-2 text-sm text-muted">
        <a href="tel:+918045672100" className="underline">
          +91 80 4567 2100
        </a>
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link href="/" className="flex h-12 items-center justify-center bg-terra px-6 text-sm tracking-[0.16em] text-cream">
          BACK HOME
        </Link>
        <Link href="/shop?category=new" className="flex h-12 items-center justify-center border border-ink px-6 text-xs tracking-[0.16em]">
          NEW ARRIVALS
        </Link>
      </div>
    </div>
  );
}
