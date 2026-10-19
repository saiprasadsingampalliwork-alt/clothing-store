import { brand } from "./brand";

export type SiteImage = { src: string; alt: string };

export type SiteAudience = {
  id: "women" | "men" | "unisex";
  text: string;
  image: SiteImage;
};

export type SiteContent = {
  legalName: string;
  address: string;
  phone: string;
  email: string;
  hours: string;
  hero: SiteImage[];
  loginImage: SiteImage;
  audiences: SiteAudience[];
  seasonImage: SiteImage;
  seasonName: string;
  headline: string;
  heroText: string;
  seasonText: string;
};

export const defaultSiteContent: SiteContent = {
  legalName: brand.legalName,
  address: brand.address,
  phone: brand.phone,
  email: brand.email,
  hours: brand.hours,
  hero: [
    { src: "/photos/hero-chair.jpg", alt: "Olive linen shirt on a wooden chair, with a folded clay tee, in morning light" },
    { src: "/photos/trouser-rail.jpg", alt: "Terracotta, sand, and olive trousers hanging from a wooden rail" },
    { src: "/photos/stack.jpg", alt: "A clay shirt, a moss knit, and terracotta trousers folded on linen" },
  ],
  loginImage: { src: "/photos/shelf.jpg", alt: "Folded shirts in olive, sand, clay, and ivory on a wooden shelf" },
  audiences: [
    { id: "women", text: "The linen dress and the straight skirt.", image: { src: "/photos/worn-women.jpg", alt: "A linen shirt dress, worn" } },
    { id: "men", text: "The overshirt and a straight trouser.", image: { src: "/photos/worn-men.jpg", alt: "An olive overshirt and trousers, worn" } },
    { id: "unisex", text: "The same shirt, worn either way.", image: { src: "/photos/worn-unisex.jpg", alt: "An olive overshirt and wide trousers, worn" } },
  ],
  seasonImage: { src: "/photos/season-shelf.jpg", alt: "Stacks of folded shirts in olive, sand, and clay on a wooden shelf" },
  seasonName: "Autumn / Winter 2026",
  headline: "Quiet clothes\nfor every day.",
  heroText: "Eight pieces. Washed linen, heavy cotton, and wool, cut in small runs in Bengaluru.",
  seasonText: "Linen, heavy cotton, and wool, cut in small runs and folded on the shelf.",
};

const audienceIds = ["women", "men", "unisex"] as const;

export function phoneHref(phone: string) {
  const digits = phone.replace(/[^\d+]/g, "");
  return digits ? `tel:${digits}` : brand.phoneHref;
}

export function siteContent(settings: { content?: unknown } | null | undefined): SiteContent {
  const raw = settings?.content && typeof settings.content === "object" ? (settings.content as Partial<SiteContent>) : {};
  const audiences = audienceIds.map((id) => {
    const fallback = defaultSiteContent.audiences.find((item) => item.id === id)!;
    const saved = Array.isArray(raw.audiences) ? raw.audiences.find((item) => item?.id === id) : undefined;
    return {
      id,
      text: text(saved?.text, fallback.text, 120),
      image: image(saved?.image, fallback.image),
    };
  });
  const hero = Array.isArray(raw.hero) ? raw.hero.map((item, index) => image(item, defaultSiteContent.hero[index] ?? defaultSiteContent.hero[0])).slice(0, 6) : [];
  return {
    legalName: text(raw.legalName, defaultSiteContent.legalName, 80),
    address: text(raw.address, defaultSiteContent.address, 180),
    phone: text(raw.phone, defaultSiteContent.phone, 40),
    email: text(raw.email, defaultSiteContent.email, 80),
    hours: text(raw.hours, defaultSiteContent.hours, 80),
    hero: hero.length ? hero : defaultSiteContent.hero,
    loginImage: image(raw.loginImage, defaultSiteContent.loginImage),
    audiences,
    seasonImage: image(raw.seasonImage, defaultSiteContent.seasonImage),
    seasonName: text(raw.seasonName, defaultSiteContent.seasonName, 60),
    headline: paragraph(raw.headline, defaultSiteContent.headline, 120),
    heroText: paragraph(raw.heroText, defaultSiteContent.heroText, 280),
    seasonText: paragraph(raw.seasonText, defaultSiteContent.seasonText, 280),
  };
}

function text(value: unknown, fallback: string, max: number) {
  const next = typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "";
  return (next || fallback).slice(0, max);
}

function paragraph(value: unknown, fallback: string, max: number) {
  const next = typeof value === "string" ? value.trim() : "";
  return (next || fallback).slice(0, max);
}

function image(value: unknown, fallback: SiteImage): SiteImage {
  if (!value || typeof value !== "object") return fallback;
  const src = String((value as SiteImage).src ?? "").trim();
  const alt = String((value as SiteImage).alt ?? "").trim().slice(0, 180);
  if ((!src.startsWith("/photos/") && !src.startsWith("/uploads/")) || src.includes("..")) return fallback;
  return { src, alt: alt || fallback.alt };
}
