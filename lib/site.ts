import { isPhotoSrc } from "./catalog";
import { brand } from "./brand";

export type SiteImage = { src: string; alt: string };

// The homepage tile for an audience (Women, Girls, Baby…), keyed by the audience slug.
export type SiteAudience = {
  id: string;
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


export function phoneHref(phone: string) {
  const digits = phone.replace(/[^\d+]/g, "");
  return digits ? `tel:${digits}` : brand.phoneHref;
}

export function siteContent(settings: { content?: unknown } | null | undefined): SiteContent {
  const raw = settings?.content && typeof settings.content === "object" ? (settings.content as Partial<SiteContent>) : {};
  // Saved tiles for any audience, with the original three always present.
  const savedTiles = (Array.isArray(raw.audiences) ? raw.audiences : []).filter(
    (item): item is SiteAudience => Boolean(item) && typeof item.id === "string" && /^[a-z0-9-]{1,40}$/.test(item.id),
  );
  const ids = [...new Set([...defaultSiteContent.audiences.map((item) => item.id), ...savedTiles.map((item) => item.id)])].slice(0, 30);
  const audiences = ids.map((id) => {
    const fallback = defaultSiteContent.audiences.find((item) => item.id === id);
    const saved = savedTiles.find((item) => item.id === id);
    return {
      id,
      text: text(saved?.text, fallback?.text ?? "", 120),
      image: image(saved?.image, fallback?.image ?? { src: "", alt: "" }),
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
  if (!isPhotoSrc(src)) return fallback;
  return { src, alt: alt || fallback.alt };
}

/** The tile for an audience: its saved photo and caption, or the given fallback photo and no caption. */
export function audienceTile(content: SiteContent, id: string, fallbackImage: SiteImage): SiteAudience {
  const saved = content.audiences.find((item) => item.id === id);
  return {
    id,
    text: saved?.text ?? "",
    image: saved?.image.src ? saved.image : fallbackImage,
  };
}

/** Sets one audience's tile, adding it if it has none yet. */
export function withAudienceTile(content: SiteContent, id: string, patch: Partial<Omit<SiteAudience, "id">>, base: SiteAudience): SiteContent {
  const exists = content.audiences.some((item) => item.id === id);
  const audiences = exists
    ? content.audiences.map((item) => (item.id === id ? { ...item, ...patch } : item))
    : [...content.audiences, { ...base, ...patch, id }];
  return { ...content, audiences };
}
