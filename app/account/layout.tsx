"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStore } from "@/lib/store";

const links = [
  { href: "/account", label: "Overview" },
  { href: "/account/profile", label: "Profile" },
  { href: "/account/orders", label: "Orders" },
  { href: "/wishlist", label: "Wishlist" },
];

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const { user, ready, signOut } = useStore();
  const pathname = usePathname();
  if (!ready) return null;
  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-16">
        <h1 className="serif text-4xl">Account</h1>
        <p className="mt-3 text-sm text-muted">Sign in to see orders, addresses, and your wishlist.</p>
        <Link href="/sign-in" className="mt-6 flex h-12 items-center justify-center bg-terra text-sm tracking-[0.16em] text-cream">
          SIGN IN
        </Link>
      </div>
    );
  }
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:grid md:grid-cols-[200px_1fr] md:gap-12 md:px-6">
      <aside>
        <p className="text-sm text-muted">Hello, {user.name.split(" ")[0]}</p>
        <nav className="mt-4 flex gap-4 overflow-auto text-sm md:flex-col md:gap-1">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className={`py-2 ${pathname === link.href ? "underline" : ""}`}>
              {link.label}
            </Link>
          ))}
          <button className="py-2 text-left text-muted" onClick={signOut}>
            Sign out
          </button>
        </nav>
      </aside>
      <div>{children}</div>
    </div>
  );
}
