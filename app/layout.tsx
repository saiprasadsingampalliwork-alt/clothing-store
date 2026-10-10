import type { Metadata } from "next";
import { Roboto_Condensed } from "next/font/google";
import { SiteShell } from "@/components/site-shell";
import { StoreProvider } from "@/lib/store";
import "./globals.css";

const robotoCondensed = Roboto_Condensed({
  subsets: ["latin"],
  weight: "variable",
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-roboto-condensed",
});

export const metadata: Metadata = {
  title: {
    default: "Earthen — Quiet clothes for every day",
    template: "%s — Earthen",
  },
  description: "Timeless unisex essentials in natural fabrics and earthy tones.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={robotoCondensed.variable}>
      <body className={`${robotoCondensed.className} antialiased`}>
        <StoreProvider>
          <SiteShell>{children}</SiteShell>
        </StoreProvider>
      </body>
    </html>
  );
}
