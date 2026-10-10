import type { Silhouette } from "@/lib/studio";

export type Size = "XS" | "S" | "M" | "L" | "XL";

export type Colorway = {
  name: string;
  hex: string;
};

export type Category = "tops" | "bottoms" | "outerwear";

export type Review = {
  name: string;
  rating: number;
  text: string;
  size: Size;
  fit: string;
  heightCm: number;
  color: string;
};

export type ProductPhoto = {
  id: string;
  label: string;
  src: string;
  alt: string;
};

export type Product = {
  slug: string;
  name: string;
  price: number;
  category: Category;
  silhouette: Silhouette;
  colors: Colorway[];
  sizes: Size[];
  /** Units available for `${colorName}|${size}`. Missing keys are out of stock. */
  stock: Record<string, number>;
  fabric: string;
  origin: string;
  fit: string;
  model: { heightCm: number; size: Size };
  description: string;
  details: string[];
  care: string[];
  rating: number;
  reviewCount: number;
  isNew?: boolean;
  reviews: Review[];
  photos?: ProductPhoto[];
  shot?: string;
};

export const SIZES: Size[] = ["XS", "S", "M", "L", "XL"];

export const CATEGORIES: { slug: Category | "new"; label: string; blurb: string; hex: string; silhouette: Silhouette; image: string }[] = [
  { slug: "new", label: "New in", blurb: "The autumn pieces, just in", hex: "#6E764E", silhouette: "overshirt", image: "/photos/hero-chair.jpg" },
  { slug: "tops", label: "Tops", blurb: "Shirts, tees, and overshirts", hex: "#D9C6AE", silhouette: "tee", image: "/photos/linen-hanging.jpg" },
  { slug: "bottoms", label: "Bottoms", blurb: "Trousers and a straight skirt", hex: "#C4785A", silhouette: "trouser", image: "/photos/trouser-rail.jpg" },
  { slug: "outerwear", label: "Outerwear", blurb: "A cardigan and an unlined jacket", hex: "#8A9168", silhouette: "cardigan", image: "/photos/jacket-room.jpg" },
];

const sizes = SIZES;

function stockFor(colors: string[], extras: Record<string, number> = {}) {
  const stock: Record<string, number> = {};
  for (const color of colors) {
    for (const size of sizes) {
      stock[`${color}|${size}`] = 12;
    }
  }
  return { ...stock, ...extras };
}

export const products: Product[] = [
  {
    slug: "linen-overshirt",
    name: "Linen Overshirt",
    price: 3499,
    category: "tops",
    silhouette: "overshirt",
    isNew: true,
    shot: "Photographed in olive.",
    colors: [
      { name: "Olive", hex: "#6E764E" },
      { name: "Sand", hex: "#E4D7C4" },
      { name: "Clay", hex: "#C9A588" },
      { name: "Ink", hex: "#1C1A17" },
    ],
    sizes,
    stock: stockFor(["Olive", "Sand", "Clay", "Ink"], { "Olive|XL": 0, "Ink|XS": 0 }),
    fabric: "Washed European linen, 180 gsm",
    origin: "Woven in Belgium, cut and sewn in Bengaluru",
    fit: "Fits true to size. The shoulder is relaxed, so take the size you usually wear.",
    model: { heightCm: 178, size: "M" },
    description:
      "Washed European linen, 180 gsm, in a relaxed fit. Soft from the first wear. Wear it open over the cotton tee, or buttoned, with the wide-leg trouser.",
    details: ["Relaxed unisex fit", "Corozo buttons", "Single chest pocket", "Side vents", "Cut in Bengaluru"],
    care: ["Machine wash cold", "Hang dry in the shade", "Iron on medium while slightly damp"],
    rating: 4.6,
    reviewCount: 128,
    reviews: [
      { name: "Meera", rating: 5, text: "The linen softens after one wash. Olive is quiet, not costume.", size: "S", fit: "True to size", heightCm: 168, color: "Olive" },
      { name: "Arjun", rating: 4, text: "I wear M open over the tee. The shoulder has room without slipping.", size: "M", fit: "True to size", heightCm: 180, color: "Sand" },
    ],
    photos: [
      { id: "hanging", label: "Hanging", src: "/photos/linen-hanging.jpg", alt: "Olive linen overshirt on a wooden hanger against a plaster wall" },
      { id: "detail", label: "Detail", src: "/photos/linen-detail.jpg", alt: "Close view of the olive linen placket, collar, and chest pocket" },
      { id: "cloth", label: "Cloth", src: "/photos/linen-weave.jpg", alt: "The linen weave and a line of stitching" },
    ],
  },
  {
    slug: "relaxed-cotton-tee",
    name: "Relaxed Cotton Tee",
    price: 1299,
    category: "tops",
    silhouette: "tee",
    isNew: true,
    shot: "Photographed in sand and clay.",
    colors: [
      { name: "Sand", hex: "#D9C6AE" },
      { name: "Clay", hex: "#C4846A" },
      { name: "Olive", hex: "#6E764E" },
    ],
    sizes,
    stock: stockFor(["Sand", "Clay", "Olive"], { "Sand|XS": 0 }),
    fabric: "Organic cotton jersey, 220 gsm",
    origin: "Knitted and sewn in Tiruppur",
    fit: "Fits true to size. The shoulder is dropped, so there is no need to size up.",
    model: { heightCm: 172, size: "S" },
    description:
      "Organic cotton jersey, 220 gsm, with a dropped shoulder and a neckline that keeps its shape. The piece the rest of the wardrobe sits on.",
    details: ["Midweight jersey", "Set-in sleeves", "Slightly cropped hem", "Unisex sizing"],
    care: ["Machine wash cold with like colours", "Tumble dry low", "Do not bleach"],
    rating: 4.8,
    reviewCount: 86,
    reviews: [
      { name: "Leela", rating: 5, text: "Weighty without being stiff. Sand works with the linen and the trousers.", size: "S", fit: "True to size", heightCm: 165, color: "Sand" },
      { name: "Kabir", rating: 5, text: "I am between S and M. S sits cleaner at the hem.", size: "S", fit: "True to size", heightCm: 174, color: "Clay" },
    ],
    photos: [
      { id: "flat", label: "Flat", src: "/photos/tee-flat.jpg", alt: "Sand cotton tee folded on a linen cloth" },
      { id: "cloth", label: "Cloth", src: "/photos/tee-detail.jpg", alt: "Clay tee folded over a sand tee, showing the jersey" },
    ],
  },
  {
    slug: "wide-leg-trousers",
    name: "Wide-Leg Trousers",
    price: 2799,
    category: "bottoms",
    silhouette: "trouser",
    isNew: true,
    shot: "Photographed in terracotta, with stone and olive beside it.",
    colors: [
      { name: "Terracotta", hex: "#C4785A" },
      { name: "Olive", hex: "#6E764E" },
      { name: "Stone", hex: "#C8C2B0" },
    ],
    sizes,
    stock: stockFor(["Terracotta", "Olive", "Stone"], { "Terracotta|S": 1 }),
    fabric: "Washed cotton twill, 240 gsm",
    origin: "Woven in Tamil Nadu, cut in Bengaluru",
    fit: "Fits true to size through the waist. The leg is full, and the inseam is 74 cm.",
    model: { heightCm: 180, size: "M" },
    description:
      "Washed cotton twill, 240 gsm, with a soft pleat and a mid rise. Full through the leg, and cut to fall clean over a sandal or a shoe.",
    details: ["Pleated front", "Side pockets", "Elasticated back waist", "Inseam 74 cm"],
    care: ["Machine wash cold", "Hang dry", "Warm iron on the reverse"],
    rating: 4.5,
    reviewCount: 64,
    reviews: [
      { name: "Nisha", rating: 5, text: "Terracotta is richer in person. M is comfortable for a full day at a desk.", size: "M", fit: "True to size", heightCm: 170, color: "Terracotta" },
    ],
    photos: [
      { id: "flat", label: "Flat", src: "/photos/trouser-flat.jpg", alt: "Terracotta wide-leg trousers laid flat on linen" },
      { id: "detail", label: "Detail", src: "/photos/trouser-detail.jpg", alt: "Folded terracotta trousers, with the waist button and pocket" },
      { id: "colours", label: "Colours", src: "/photos/trouser-rail.jpg", alt: "Terracotta, stone, and olive trousers hanging on a rail" },
    ],
  },
  {
    slug: "knit-cardigan",
    name: "Knit Cardigan",
    price: 3890,
    category: "outerwear",
    silhouette: "cardigan",
    isNew: true,
    shot: "Photographed in moss.",
    colors: [
      { name: "Moss", hex: "#8A9168" },
      { name: "Stone", hex: "#C8C2B0" },
    ],
    sizes,
    stock: stockFor(["Moss", "Stone"]),
    fabric: "Cotton and merino, 12 gauge",
    origin: "Yarn spun in New Zealand, knitted in Tiruppur",
    fit: "Fits true to size. It is light, not oversized.",
    model: { heightCm: 175, size: "M" },
    description:
      "A 12-gauge cotton and merino cardigan with a clean edge and no bulk at the cuff. For air-conditioned rooms and the first cool evenings.",
    details: ["Button front", "Patch pockets", "Rib at cuff and hem", "Unisex fit"],
    care: ["Hand wash cold", "Dry flat", "Do not tumble dry"],
    rating: 4.7,
    reviewCount: 41,
    reviews: [
      { name: "Kabir", rating: 5, text: "Light enough for the office. M layers over the tee without bunching.", size: "M", fit: "True to size", heightCm: 176, color: "Moss" },
    ],
    photos: [
      { id: "flat", label: "Flat", src: "/photos/cardigan-flat.jpg", alt: "Moss knit cardigan laid flat, with wooden buttons" },
      { id: "detail", label: "Detail", src: "/photos/cardigan-detail.jpg", alt: "Close view of the cardigan rib and buttons" },
    ],
  },
  {
    slug: "everyday-shirt",
    name: "Everyday Shirt",
    price: 2490,
    category: "tops",
    silhouette: "shirt",
    colors: [
      { name: "Ivory", hex: "#F3EEE4" },
      { name: "Olive", hex: "#6E764E" },
    ],
    sizes,
    stock: stockFor(["Ivory", "Olive"], { "Ivory|M": 3 }),
    fabric: "Cotton poplin, 120 gsm",
    origin: "Woven in Coimbatore, cut in Bengaluru",
    fit: "Fits true to size. The collar is soft, not a dress-shirt stand.",
    model: { heightCm: 170, size: "S" },
    description:
      "Cotton poplin, 120 gsm, cut straight with a soft collar. The hem is finished to wear tucked or out.",
    details: ["Mother-of-pearl buttons", "Box pleat back", "Curved hem"],
    care: ["Machine wash cold", "Hang dry", "Iron while damp"],
    rating: 4.4,
    reviewCount: 53,
    reviews: [{ name: "Sara", rating: 4, text: "A proper shirt that still feels easy. Ivory stays bright after washing.", size: "S", fit: "True to size", heightCm: 163, color: "Ivory" }],
  },
  {
    slug: "pleated-trouser",
    name: "Pleated Trouser",
    price: 3190,
    category: "bottoms",
    silhouette: "trouser",
    colors: [
      { name: "Olive", hex: "#5E6844" },
      { name: "Ink", hex: "#1C1A17" },
    ],
    sizes,
    stock: stockFor(["Olive", "Ink"], { "Ink|XL": 0 }),
    fabric: "Wool and cotton, 260 gsm",
    origin: "Cloth milled in Italy, cut in Bengaluru",
    fit: "Take your usual size. The hem is unfinished, so a tailor can set the length.",
    model: { heightCm: 182, size: "L" },
    description:
      "Wool and cotton, 260 gsm, with a single pleat and a clean break. Dressier than the wide-leg, and still cloth you can sit in.",
    details: ["Hook and bar closure", "Side adjusters", "Unfinished hem, ready to tailor"],
    care: ["Dry clean", "Steam to refresh between wears"],
    rating: 4.3,
    reviewCount: 29,
    reviews: [{ name: "Dev", rating: 5, text: "Olive reads almost black in low light. L needed only a small hem.", size: "L", fit: "True to size", heightCm: 183, color: "Olive" }],
  },
  {
    slug: "cotton-drill-jacket",
    name: "Cotton Drill Jacket",
    price: 4290,
    category: "outerwear",
    silhouette: "jacket",
    isNew: true,
    shot: "Photographed in olive, beside the cardigan.",
    colors: [
      { name: "Sand", hex: "#CDB892" },
      { name: "Olive", hex: "#4F5638" },
    ],
    sizes,
    stock: stockFor(["Sand", "Olive"], { "Sand|L": 2 }),
    fabric: "Cotton drill, 280 gsm",
    origin: "Woven and sewn in India",
    fit: "Fits true to size over a shirt. Take one size up if you want it over the cardigan.",
    model: { heightCm: 178, size: "M" },
    description:
      "Cotton drill, 280 gsm, unlined, with a camp collar. Enough structure to hold a shape over a shirt, without the weight of a coat.",
    details: ["Unlined", "Two patch pockets", "Horn buttons", "Unisex"],
    care: ["Spot clean", "Cold machine wash if needed", "Hang dry"],
    rating: 4.6,
    reviewCount: 22,
    reviews: [{ name: "Anika", rating: 5, text: "Sand is the jacket I take when I do not want a coat. M fits over the shirt.", size: "M", fit: "True to size", heightCm: 171, color: "Sand" }],
    photos: [
      { id: "room", label: "In the room", src: "/photos/jacket-room.jpg", alt: "Olive drill jacket and moss cardigan on wooden hooks" },
    ],
  },
  {
    slug: "column-skirt",
    name: "Column Skirt",
    price: 2190,
    category: "bottoms",
    silhouette: "skirt",
    colors: [
      { name: "Clay", hex: "#C9A588" },
      { name: "Ink", hex: "#1C1A17" },
    ],
    sizes,
    stock: stockFor(["Clay", "Ink"]),
    fabric: "Washed European linen, 170 gsm",
    origin: "Woven in Belgium, cut in Bengaluru",
    fit: "Fits true to size at the waist. The elastic back gives a little room.",
    model: { heightCm: 168, size: "S" },
    description:
      "Washed European linen, 170 gsm, cut straight to the mid-calf. A quiet slit, and an elastic back so it sits without a belt.",
    details: ["Mid-calf length", "Side slit", "Side seam pockets"],
    care: ["Machine wash cold", "Hang dry in the shade", "Iron while damp"],
    rating: 4.5,
    reviewCount: 18,
    reviews: [{ name: "Rhea", rating: 5, text: "Simple and well cut. Clay is the whole point, and S sits at the waist.", size: "S", fit: "True to size", heightCm: 166, color: "Clay" }],
  },
];

export const popularSearches = ["linen", "overshirt", "trousers", "cardigan", "olive"];

export function stockKey(color: string, size: string) {
  return `${color}|${size}`;
}

export function unitsAvailable(product: Product, color: string, size: string) {
  return product.stock[stockKey(color, size)] ?? 0;
}

export type ProductOverride = {
  price?: number;
  salePrice?: number | null;
  saleStart?: string;
  saleEnd?: string;
  status?: "active" | "draft" | "archived";
  metaTitle?: string;
  metaDescription?: string;
  stock?: Record<string, number>;
};

export type LiveProduct = Product & { status: "active" | "draft" | "archived"; basePrice: number };

export function liveProduct(product: Product, override?: ProductOverride): LiveProduct {
  const status = override?.status ?? "active";
  const stock = override?.stock ?? product.stock;
  const basePrice = override?.price ?? product.price;
  const today = new Date().toISOString().slice(0, 10);
  const saleLive =
    typeof override?.salePrice === "number" &&
    override.salePrice > 0 &&
    (!override.saleStart || today >= override.saleStart) &&
    (!override.saleEnd || today <= override.saleEnd);
  return {
    ...product,
    stock,
    basePrice,
    price: saleLive ? override!.salePrice! : basePrice,
    status,
  };
}

export function getProduct(slug: string) {
  return products.find((product) => product.slug === slug);
}

export function categoryLabel(slug: string) {
  if (slug === "new") return "New in";
  return CATEGORIES.find((category) => category.slug === slug)?.label ?? "Clothing";
}

export function filterProducts(options: {
  category?: string;
  query?: string;
  sizes?: string[];
  colors?: string[];
  min?: number;
  max?: number;
  inStock?: boolean;
  sort?: string;
}) {
  const query = options.query?.trim().toLowerCase() ?? "";
  let list = products.filter((product) => {
    if (options.category === "new" && !product.isNew) return false;
    if (options.category && options.category !== "new" && options.category !== "all" && product.category !== options.category) {
      return false;
    }
    if (query) {
      const haystack = `${product.name} ${product.fabric} ${product.origin} ${product.description} ${product.category} ${product.colors.map((color) => color.name).join(" ")}`.toLowerCase();
      const tokens = query.split(/\s+/);
      if (!tokens.every((token) => haystack.includes(token) || close(haystack, token))) return false;
    }
    if (options.sizes?.length && !options.sizes.some((size) => product.sizes.includes(size as Size) && Object.entries(product.stock).some(([key, qty]) => key.endsWith(`|${size}`) && qty > 0))) {
      return false;
    }
    if (options.colors?.length && !product.colors.some((color) => options.colors!.includes(color.name))) return false;
    if (options.min != null && product.price < options.min) return false;
    if (options.max != null && product.price > options.max) return false;
    if (options.inStock && !Object.values(product.stock).some((qty) => qty > 0)) return false;
    return true;
  });

  const sort = options.sort ?? "newest";
  if (sort === "price-asc") list = [...list].sort((a, b) => a.price - b.price);
  else if (sort === "price-desc") list = [...list].sort((a, b) => b.price - a.price);
  else if (sort === "popular") list = [...list].sort((a, b) => b.reviewCount - a.reviewCount);
  else list = [...list].sort((a, b) => Number(b.isNew) - Number(a.isNew));

  return list;
}

function close(haystack: string, token: string) {
  if (token.length < 4) return false;
  return haystack.split(/\s+/).some((word) => {
    if (Math.abs(word.length - token.length) > 1) return false;
    let misses = 0;
    const length = Math.max(word.length, token.length);
    for (let i = 0; i < length; i += 1) {
      if (word[i] !== token[i]) misses += 1;
    }
    return misses <= 1;
  });
}

export function suggestionsFor(query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return filterProducts({ query: q }).slice(0, 3);
}

export function relatedProducts(slug: string) {
  const current = getProduct(slug);
  if (!current) return products.slice(0, 4);
  return products.filter((product) => product.slug !== slug && product.category === current.category).concat(
    products.filter((product) => product.slug !== slug && product.category !== current.category),
  ).slice(0, 4);
}
