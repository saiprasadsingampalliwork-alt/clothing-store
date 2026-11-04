"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { MiniCart } from "@/components/mini-cart";

export function SiteShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return <>{children}</>;
  return (
    <>
      <Header />
      <MiniCart />
      <main className="site-main">{children}</main>
      <Footer />
    </>
  );
}
