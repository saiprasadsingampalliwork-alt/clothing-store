"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FormEvent, useEffect, useRef, useState } from "react";
import { Icon } from "@/components/icons";
import { liveProduct, popularSearches, shopEntrances, styleList, suggestionsFor } from "@/lib/catalog";
import { formatINR } from "@/lib/money";
import { withStoreSale } from "@/lib/sale";
import { announcementCopy, announcementLink, useStore } from "@/lib/store";

export function Header() {
  const { totals, settings } = useStore();
  const announcement = settings.announcementEnabled === false ? "" : announcementCopy(settings);
  const announcementHref = announcementLink(settings.announcementHref);
  const links = shopEntrances().map((category) => ({ href: `/shop?category=${category.slug}`, label: category.label }));
  const styleLinks = styleList().map((style) => ({ href: `/shop?style=${style.slug}`, label: style.label }));
  const pathname = usePathname();
  const [menu, setMenu] = useState(false);
  const [search, setSearch] = useState(false);
  const [query, setQuery] = useState("");
  const [hidden, setHidden] = useState(false);
  const [solid, setSolid] = useState(false);
  const [tick, setTick] = useState(false);
  const lastY = useRef(0);
  const seenCount = useRef(false);

  useEffect(() => {
    setMenu(false);
    setSearch(false);
    setQuery("");
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = menu || search ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menu, search]);

  useEffect(() => {
    function onScroll() {
      const y = window.scrollY;
      setSolid(y > 12);
      const delta = y - lastY.current;
      if (menu || search || y < 72) setHidden(false);
      else if (delta > 8) setHidden(true);
      else if (delta < -8) setHidden(false);
      lastY.current = y;
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [menu, search]);

  useEffect(() => {
    if (!seenCount.current) {
      seenCount.current = true;
      return;
    }
    setTick(true);
    const timer = window.setTimeout(() => setTick(false), 280);
    return () => window.clearTimeout(timer);
  }, [totals.count]);

  return (
    <header className={`site-header${hidden ? " is-hidden" : ""}${solid ? " is-solid" : ""}`}>
      {announcement && (
        <div className="bg-olive text-center text-[12px] tracking-wide text-cream">
          {announcementHref ? (
            announcementHref.startsWith("/") ? (
              <Link href={announcementHref} className="block px-4 py-2">
                {announcement}
              </Link>
            ) : (
              <a href={announcementHref} className="block px-4 py-2">
                {announcement}
              </a>
            )
          ) : (
            <p className="px-4 py-2">{announcement}</p>
          )}
        </div>
      )}
      <div className="nav-bar">
        {/* Three columns: the centre holds the name, and the side columns can never run into it. */}
        <div className="relative mx-auto grid h-16 max-w-6xl grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-6 px-4 md:px-6">
          <div className="flex min-w-0 items-center">
          <button
            className="flex h-11 w-11 items-center justify-center md:hidden"
            aria-label="Open menu"
            onClick={() => setMenu(true)}
          >
            <span className="flex w-5 flex-col gap-1.5">
              <span className="h-px bg-ink" />
              <span className="h-px bg-ink" />
              <span className="h-px bg-ink" />
            </span>
          </button>

          <DesktopNav links={links} />
          </div>

          <Link href="/" className="text-[15px] tracking-[0.32em]">
            EARTHEN
          </Link>

          <div className="flex items-center justify-end gap-4 text-sm">
            <button className="hidden h-11 items-center gap-1.5 md:flex" onClick={() => setSearch(true)}>
              <Icon name="search" className="h-4 w-4" />
              Search
            </button>
            <button className="flex h-11 w-11 items-center justify-center md:hidden" onClick={() => setSearch(true)} aria-label="Search">
              <Icon name="search" />
            </button>
            <Link href="/account" className="hidden h-11 items-center gap-1.5 md:flex">
              <Icon name="user" className="h-4 w-4" />
              Account
            </Link>
            <Link href="/cart" className="flex h-11 items-center gap-1.5" aria-label={`Bag, ${totals.count} items`}>
              <Icon name="bag" className={`h-4 w-4 ${tick ? "bag-pop" : ""}`} />
              <span className="hidden sm:inline">Bag</span>
              <span>
                (<span className={tick ? "count-tick" : undefined}>{totals.count}</span>)
              </span>
            </Link>
          </div>
        </div>
      </div>

      {menu && (
        <div className="fixed inset-0 z-50 bg-cream md:hidden">
          <div className="flex h-16 items-center justify-between border-b border-line px-4">
            <span className="tracking-[0.32em]">EARTHEN</span>
            <button className="flex h-11 w-11 items-center justify-center" onClick={() => setMenu(false)} aria-label="Close menu">
              <Icon name="close" />
            </button>
          </div>
          <nav className="flex flex-col px-6 py-6 text-2xl serif">
            {links.map((link, index) => (
              <Link key={link.href} href={link.href} className="menu-link border-b border-line py-4" style={{ ["--i" as string]: index }} onClick={() => setMenu(false)}>
                {link.label}
              </Link>
            ))}
            {styleLinks.length > 0 && (
              <div className="menu-link border-b border-line py-4" style={{ ["--i" as string]: links.length }}>
                <p className="eyebrow font-sans text-muted">Shop by style</p>
                <div className="mt-3 flex flex-wrap gap-2 font-sans text-sm">
                  {styleLinks.map((link) => (
                    <Link key={link.href} href={link.href} className="border border-line px-3 py-2" onClick={() => setMenu(false)}>
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            )}
            {[{ href: "/about", label: "Our story" }, { href: "/account", label: "Account" }, { href: "/help", label: "Help" }].map((link, index) => (
              <Link key={link.href} href={link.href} className="menu-link border-b border-line py-4 last:border-0" style={{ ["--i" as string]: links.length + 1 + index }} onClick={() => setMenu(false)}>
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}

      {search && <SearchOverlay query={query} setQuery={setQuery} onClose={() => setSearch(false)} />}
    </header>
  );
}

function SearchOverlay({
  query,
  setQuery,
  onClose,
}: {
  query: string;
  setQuery: (value: string) => void;
  onClose: () => void;
}) {
  const router = useRouter();
  const { overrides, settings } = useStore();
  const matches = suggestionsFor(query, overrides).map((product) => withStoreSale(liveProduct(product, overrides[product.slug]), settings));

  function submit(event: FormEvent) {
    event.preventDefault();
    const next = query.trim();
    if (!next) return;
    router.push(`/search?q=${encodeURIComponent(next)}`);
    onClose();
  }

  return (
    <div className="search-pop fixed inset-0 z-50 bg-cream">
      <form onSubmit={submit} className="mx-auto flex h-16 max-w-3xl items-center gap-3 border-b border-line px-4">
        <input
          autoFocus
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          aria-label="Search"
          className="h-11 flex-1 bg-transparent outline-none"
        />
        <button type="submit" className="text-sm">
          Search
        </button>
        <button type="button" className="flex h-11 w-11 items-center justify-center text-muted" onClick={onClose} aria-label="Close search">
          <Icon name="close" />
        </button>
      </form>
      <div className="mx-auto max-w-3xl px-4 py-6">
        {query.trim() && matches.length > 0 && (
          <ul className="divide-y divide-line border-y border-line">
            {matches.map((product) => (
              <li key={product.slug}>
                <Link href={`/product/${product.slug}`} className="flex items-center gap-4 py-3">
                  <span className="h-14 w-12" style={{ background: product.colors[0].hex }} />
                  <span>
                    <span className="block">{product.name}</span>
                    <span className="text-sm text-muted">
                      {formatINR(product.price)}
                      {product.price < product.basePrice && <span className="ml-2 line-through">{formatINR(product.basePrice)}</span>}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
        {query.trim() && (
          <Link href={`/search?q=${encodeURIComponent(query.trim())}`} className="mt-4 inline-block text-sm underline">
            View all results
          </Link>
        )}
        <p className="eyebrow mt-8 text-muted">Popular searches</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {popularSearches.map((term) => (
            <Link
              key={term}
              href={`/search?q=${encodeURIComponent(term)}`}
              className="border border-line px-3 py-2 text-sm"
            >
              {term}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

const NAV_GAP = 24; // gap-6

/**
 * The category links in the desktop header. Shows as many as fit beside the name and moves the rest
 * under "More", so adding categories (or a narrower window) never pushes links into the name.
 */
function DesktopNav({ links }: { links: { href: string; label: string }[] }) {
  const pathname = usePathname();
  const navRef = useRef<HTMLElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const moreRef = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(links.length);
  const [open, setOpen] = useState(false);
  const key = links.map((link) => link.href).join("|");

  useEffect(() => {
    const nav = navRef.current;
    const measure = measureRef.current;
    if (!nav || !measure) return;
    const fit = () => {
      const widths = [...measure.children].map((child) => (child as HTMLElement).offsetWidth);
      const more = widths.pop() ?? 0;
      const room = nav.clientWidth;
      const total = (count: number) => widths.slice(0, count).reduce((sum, width) => sum + width, 0) + Math.max(0, count - 1) * NAV_GAP;
      if (total(widths.length) <= room) {
        setShown(widths.length);
        return;
      }
      let count = widths.length;
      while (count > 0 && total(count) + NAV_GAP + more > room) count -= 1;
      setShown(count);
    };
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(nav);
    void document.fonts?.ready.then(fit);
    return () => observer.disconnect();
  }, [key]);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent | KeyboardEvent) => {
      if (event instanceof KeyboardEvent ? event.key === "Escape" : !moreRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", close);
    };
  }, [open]);

  const visible = links.slice(0, shown);
  const hidden = links.slice(shown);

  return (
    <nav ref={navRef} aria-label="Shop" className="relative hidden min-w-0 flex-1 items-center gap-6 text-sm md:flex">
      {/* Clipped sideways so links can never paint over the name, even before the first measurement. */}
      <div className="flex min-w-0 items-center gap-6 overflow-x-clip">
        {visible.map((link) => (
          <Link key={link.href} href={link.href} className="whitespace-nowrap hover:text-olive-deep">
            {link.label}
          </Link>
        ))}
      </div>
      {hidden.length > 0 && (
        <div ref={moreRef} className="relative">
          <button
            type="button"
            aria-expanded={open}
            aria-haspopup="true"
            onClick={() => setOpen((value) => !value)}
            className="flex items-center gap-1 whitespace-nowrap hover:text-olive-deep"
          >
            More <span aria-hidden="true" className="text-[10px]">▾</span>
          </button>
          {open && (
            <div className="absolute left-0 top-full z-40 mt-3 min-w-44 border border-line bg-cream py-2 shadow-sm">
              {hidden.map((link) => (
                <Link key={link.href} href={link.href} className="block whitespace-nowrap px-4 py-2 hover:text-olive-deep">
                  {link.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
      {/* Off-screen copy of every link plus "More", used only to measure how many fit. */}
      <div ref={measureRef} aria-hidden="true" className="pointer-events-none invisible absolute left-0 top-0 flex gap-6 whitespace-nowrap">
        {links.map((link) => (
          <span key={link.href}>{link.label}</span>
        ))}
        <span className="flex items-center gap-1">
          More <span className="text-[10px]">▾</span>
        </span>
      </div>
    </nav>
  );
}
