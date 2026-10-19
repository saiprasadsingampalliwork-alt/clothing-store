import type { Silhouette } from "@/lib/studio";

export type Size = "XS" | "S" | "M" | "L" | "XL";

export type Colorway = {
  name: string;
  hex: string;
};

export type Category = string;

export type ShopCategory = {
  slug: string;
  label: string;
  blurb: string;
  image: string;
  chart: "upper" | "lower";
};

export type Gender = "women" | "men" | "unisex";

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
  /** Stored on the product. Omitted only on local samples, which fall back to the slug map. */
  gender?: Gender;
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

export const GENDERS: { id: Gender; label: string }[] = [
  { id: "women", label: "Women" },
  { id: "men", label: "Men" },
  { id: "unisex", label: "Unisex" },
];

const genderBySlug: Partial<Record<string, Gender>> = {
  "sleeveless-tank": "women",
  "boat-neck-tee": "women",
  "light-cardigan": "women",
  "pleated-trouser": "men",
  "band-collar-shirt": "men",
  "oxford-shirt": "men",
  "henley-tee": "men",
  "tapered-trouser": "men",
  "wool-overshirt": "men",
  "cotton-chore-coat": "men",
};

export function productGender(product: Pick<Product, "slug" | "silhouette"> & { gender?: string }): Gender {
  if (product.gender === "women" || product.gender === "men" || product.gender === "unisex") return product.gender;
  if (product.silhouette === "skirt") return "women";
  return genderBySlug[product.slug] ?? "unisex";
}

const NEW_IN: ShopCategory = {
  slug: "new",
  label: "New in",
  blurb: "The autumn pieces, just in",
  image: "/photos/hero-chair.jpg",
  chart: "upper",
};

export const PLACEHOLDER_IMAGE = "/photos/placeholder.svg";

export const DEFAULT_CATEGORIES: ShopCategory[] = [
  { slug: "tops", label: "Tops", blurb: "Shirts, tees, and overshirts", image: "/photos/linen-hanging.jpg", chart: "upper" },
  { slug: "bottoms", label: "Bottoms", blurb: "Trousers and a straight skirt", image: "/photos/trouser-rail.jpg", chart: "lower" },
  { slug: "outerwear", label: "Outerwear", blurb: "A cardigan and an unlined jacket", image: "/photos/jacket-room.jpg", chart: "upper" },
  { slug: "dresses", label: "Dresses", blurb: "Shirt dresses and slips", image: "/photos/category-dresses.jpg", chart: "lower" },
  { slug: "knitwear", label: "Knitwear", blurb: "Crews, polos, and fine knits", image: "/photos/category-knitwear.jpg", chart: "upper" },
  { slug: "lounge", label: "Lounge", blurb: "Sleep shirts and easy robes", image: "/photos/category-lounge.jpg", chart: "upper" },
];

/** Shop entrances, including New in, which is a filter and not a product category. */
export const CATEGORIES: ShopCategory[] = [NEW_IN, ...DEFAULT_CATEGORIES];

let installedCategories: ShopCategory[] | null = null;

export function categorySlug(value: string) {
  const text = value.trim().toLowerCase();
  if (!text) return "";
  if (text === "top" || text === "tops") return "tops";
  if (text.startsWith("bottom")) return "bottoms";
  if (text.startsWith("outer")) return "outerwear";
  return text
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
}

export function categoryList() {
  return installedCategories ?? DEFAULT_CATEGORIES;
}

export function shopEntrances() {
  return [NEW_IN, ...categoryList()];
}

export function installCategories(rows: Array<{ slug: string; label: string; blurb?: string; image?: string; chart?: string }> | undefined) {
  installedCategories = rows?.length ? rows.map(asShopCategory) : null;
}

export function rememberCategory(category: { slug: string; label: string; blurb?: string; image?: string; chart?: string }) {
  const next = asShopCategory(category);
  const list = categoryList();
  const index = list.findIndex((entry) => entry.slug === next.slug);
  installedCategories = index >= 0 ? list.map((entry) => (entry.slug === next.slug ? next : entry)) : [...list, next];
}

export function forgetCategory(slug: string) {
  installedCategories = categoryList().filter((entry) => entry.slug !== slug);
}

function asShopCategory(category: { slug: string; label: string; blurb?: string; image?: string; chart?: string }): ShopCategory {
  return {
    slug: category.slug,
    label: category.label,
    blurb: category.blurb ?? "",
    image: category.image ?? "",
    chart: category.chart === "lower" ? "lower" : "upper",
  };
}

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
    photos: [{ id: "photo", label: "Photo", src: "/photos/everyday-shirt.jpg", alt: "Ivory cotton poplin shirt on a wooden hanger" }],
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
    photos: [{ id: "photo", label: "Photo", src: "/photos/pleated-trouser.jpg", alt: "Olive wool-cotton pleated trousers hanging from a rail" }],
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
    photos: [{ id: "photo", label: "Photo", src: "/photos/column-skirt.jpg", alt: "Clay linen column skirt, cut straight to the mid-calf" }],
  },
];

const palette = {
  Olive: "#6E764E",
  Sand: "#E4D7C4",
  Clay: "#C9A588",
  Ink: "#1C1A17",
  Stone: "#C8C2B4",
  Moss: "#8A9168",
  Ivory: "#F3EDE3",
  Terracotta: "#C4785A",
} as const;

function morePieces(): Product[] {
  const rows: {
    slug: string;
    name: string;
    price: number;
    category: Category;
    silhouette: Silhouette;
    colors: (keyof typeof palette)[];
    fabric: string;
    description: string;
    details: string[];
    isNew?: boolean;
    rating: number;
    reviewCount: number;
  }[] = [
    { slug: "boxy-linen-tee", name: "Boxy Linen Tee", price: 1490, category: "tops", silhouette: "tee", colors: ["Sand", "Ivory"], fabric: "Washed linen jersey, 160 gsm", description: "A square linen tee with a dropped shoulder. Meant to be worn untucked.", details: ["Boxy fit", "Bound neck", "Side vents"], isNew: true, rating: 4.4, reviewCount: 16 },
    { slug: "band-collar-shirt", name: "Band Collar Shirt", price: 2690, category: "tops", silhouette: "shirt", colors: ["Ink", "Sand"], fabric: "Cotton poplin, 120 gsm", description: "A band collar, no fuss, in cotton poplin. Buttoned or open over the tee.", details: ["Band collar", "Corozo buttons", "Curved hem"], rating: 4.6, reviewCount: 31 },
    { slug: "sleeveless-tank", name: "Sleeveless Tank", price: 1290, category: "tops", silhouette: "tee", colors: ["Clay", "Olive"], fabric: "Organic cotton rib, 180 gsm", description: "A ribbed tank with a high neck. Layer it, or wear it on its own.", details: ["Rib knit", "High neck", "Straight hem"], isNew: true, rating: 4.3, reviewCount: 9 },
    { slug: "oxford-shirt", name: "Oxford Shirt", price: 2890, category: "tops", silhouette: "shirt", colors: ["Ivory", "Ink"], fabric: "Cotton oxford, 140 gsm", description: "A classic oxford with a soft collar. The cloth gets better with washing.", details: ["Button-down collar", "Single chest pocket", "Rounded hem"], rating: 4.7, reviewCount: 44 },
    { slug: "henley-tee", name: "Henley Tee", price: 1590, category: "tops", silhouette: "tee", colors: ["Moss", "Ink"], fabric: "Organic cotton jersey, 200 gsm", description: "A three-button henley in a heavier jersey. The placket is short on purpose.", details: ["Three-button placket", "Set-in sleeve", "Tonal stitching"], rating: 4.5, reviewCount: 22 },
    { slug: "camp-collar-shirt", name: "Camp Collar Shirt", price: 2790, category: "tops", silhouette: "shirt", colors: ["Terracotta", "Sand"], fabric: "Washed linen, 150 gsm", description: "An open camp collar in washed linen. Wear it loose, sleeves rolled.", details: ["Camp collar", "Chest pocket", "Coconut buttons"], isNew: true, rating: 4.6, reviewCount: 18 },
    { slug: "straight-linen-trouser", name: "Straight Linen Trouser", price: 2990, category: "bottoms", silhouette: "trouser", colors: ["Olive", "Stone"], fabric: "Washed European linen, 190 gsm", description: "A straight leg in linen, with a flat front and a little ease through the thigh.", details: ["Flat front", "Side pockets", "Straight leg"], rating: 4.5, reviewCount: 27 },
    { slug: "drawstring-short", name: "Drawstring Short", price: 1890, category: "bottoms", silhouette: "trouser", colors: ["Sand", "Clay"], fabric: "Cotton twill, 220 gsm", description: "A knee-length short with a cotton drawstring. No belt loops.", details: ["Drawstring waist", "Side pockets", "Above the knee"], isNew: true, rating: 4.2, reviewCount: 11 },
    { slug: "tapered-trouser", name: "Tapered Trouser", price: 2790, category: "bottoms", silhouette: "trouser", colors: ["Ink", "Stone"], fabric: "Cotton twill, 250 gsm", description: "A tapered trouser that narrows at the ankle. Sits at the natural waist.", details: ["Tapered leg", "Belt loops", "Coin pocket"], rating: 4.6, reviewCount: 36 },
    { slug: "pleated-linen-skirt", name: "Pleated Linen Skirt", price: 2490, category: "bottoms", silhouette: "skirt", colors: ["Sand", "Ink"], fabric: "Washed linen, 170 gsm", description: "Two soft pleats and a straight fall to the mid-calf.", details: ["Front pleats", "Side seam pockets", "Mid-calf"], rating: 4.4, reviewCount: 14 },
    { slug: "wrap-skirt", name: "Wrap Skirt", price: 2290, category: "bottoms", silhouette: "skirt", colors: ["Clay", "Olive"], fabric: "Washed linen, 160 gsm", description: "A wrap that ties at the side. The overlap stays put when you walk.", details: ["Side tie", "Overlap front", "Knee length"], isNew: true, rating: 4.5, reviewCount: 19 },
    { slug: "wool-overshirt", name: "Wool Overshirt", price: 4290, category: "outerwear", silhouette: "overshirt", colors: ["Moss", "Ink"], fabric: "Wool flannel, 280 gsm", description: "A heavier overshirt for cooler evenings. Unlined, so it layers over the oxford.", details: ["Unlined", "Two chest pockets", "Horn buttons"], rating: 4.8, reviewCount: 21 },
    { slug: "quilted-vest", name: "Quilted Vest", price: 3190, category: "outerwear", silhouette: "jacket", colors: ["Sand", "Olive"], fabric: "Cotton shell, light fill", description: "A short quilted vest. Enough for a Bengaluru morning, not a coat.", details: ["Snap front", "Two patch pockets", "Stand collar"], isNew: true, rating: 4.3, reviewCount: 8 },
    { slug: "cotton-chore-coat", name: "Cotton Chore Coat", price: 4590, category: "outerwear", silhouette: "jacket", colors: ["Clay", "Ink"], fabric: "Cotton canvas, 320 gsm", description: "A chore coat with four pockets. The canvas softens after a few wears.", details: ["Four pockets", "Unlined", "Button front"], rating: 4.7, reviewCount: 29 },
    { slug: "light-cardigan", name: "Light Cardigan", price: 3490, category: "outerwear", silhouette: "cardigan", colors: ["Ivory", "Stone"], fabric: "Cotton knit, 8 gauge", description: "A finer cardigan than the moss one. It sits under a jacket without bulk.", details: ["Button front", "Patch pockets", "Ribbed cuffs"], rating: 4.5, reviewCount: 17 },
    { slug: "boat-neck-tee", name: "Boat Neck Tee", price: 1390, category: "tops", silhouette: "tee", colors: ["Ivory", "Terracotta"], fabric: "Organic cotton jersey, 180 gsm", description: "A wide neck and a short sleeve. Quiet, and easy under the overshirt.", details: ["Boat neck", "Set-in sleeve", "Straight hem"], isNew: true, rating: 4.4, reviewCount: 13 },
  ];

  return rows.map((row) => ({
    slug: row.slug,
    name: row.name,
    price: row.price,
    category: row.category,
    silhouette: row.silhouette,
    isNew: row.isNew,
    colors: row.colors.map((name) => ({ name, hex: palette[name] })),
    sizes,
    stock: stockFor([...row.colors]),
    fabric: row.fabric,
    origin: "Cut and sewn in Bengaluru",
    fit: "Fits true to size.",
    model: { heightCm: 174, size: "M" },
    description: row.description,
    details: row.details,
    care: ["Machine wash cold", "Hang dry in the shade"],
    rating: row.rating,
    reviewCount: row.reviewCount,
    reviews: [],
    photos: [{ id: "photo", label: "Photo", src: `/photos/${row.slug}.jpg`, alt: row.description }],
  }));
}

products.push(...morePieces(), ...extraPieces());

function extraPieces(): Product[] {
  const rows: {
    slug: string;
    name: string;
    price: number;
    category: Category;
    gender: Gender;
    silhouette: Silhouette;
    colors: (keyof typeof palette)[];
    fabric: string;
    description: string;
    details: string[];
    isNew?: boolean;
  }[] = [
    { slug: "linen-shirt-dress", name: "Linen Shirt Dress", price: 3890, category: "dresses", gender: "women", silhouette: "shirt", colors: ["Sand", "Olive"], fabric: "Washed European linen, 170 gsm", description: "A shirt dress to the mid-calf, with a collar and a self belt.", details: ["Point collar", "Self belt", "Side pockets"], isNew: true },
    { slug: "slip-dress", name: "Slip Dress", price: 3290, category: "dresses", gender: "women", silhouette: "skirt", colors: ["Clay", "Ink"], fabric: "Washed linen, 140 gsm", description: "A narrow slip with a wide strap. Wear it alone, or under the cardigan.", details: ["Wide straps", "Bias cut", "Midi length"], isNew: true },
    { slug: "cotton-day-dress", name: "Cotton Day Dress", price: 3490, category: "dresses", gender: "women", silhouette: "shirt", colors: ["Ivory", "Terracotta"], fabric: "Cotton poplin, 120 gsm", description: "A short-sleeved day dress with a button front and a slight A-line.", details: ["Button front", "Short sleeve", "Above the knee"] },
    { slug: "merino-crew", name: "Merino Crew", price: 4290, category: "knitwear", gender: "unisex", silhouette: "tee", colors: ["Moss", "Ink"], fabric: "Merino wool, 12 gauge", description: "A fine crew neck in merino. Light enough for a Bengaluru evening.", details: ["Crew neck", "Set-in sleeve", "Ribbed hem"], isNew: true },
    { slug: "rib-polo", name: "Rib Polo", price: 3590, category: "knitwear", gender: "men", silhouette: "shirt", colors: ["Sand", "Olive"], fabric: "Cotton rib, 8 gauge", description: "A short-sleeved polo in cotton rib, with a soft collar.", details: ["Two-button placket", "Rib collar", "Straight hem"] },
    { slug: "fine-knit-vest", name: "Fine Knit Vest", price: 3190, category: "knitwear", gender: "women", silhouette: "jacket", colors: ["Ivory", "Stone"], fabric: "Cotton knit, 14 gauge", description: "A sleeveless vest to wear over the shirt dress or the tee.", details: ["Button front", "Sleeveless", "Hip length"] },
    { slug: "sleep-shirt", name: "Sleep Shirt", price: 2490, category: "lounge", gender: "unisex", silhouette: "shirt", colors: ["Ivory", "Clay"], fabric: "Washed cotton, 140 gsm", description: "An oversized shirt for the house, cut long enough to sleep in.", details: ["Chest pocket", "Long hem", "Mother-of-pearl buttons"], isNew: true },
    { slug: "lounge-tee", name: "Lounge Tee", price: 1690, category: "lounge", gender: "unisex", silhouette: "tee", colors: ["Sand", "Moss"], fabric: "Organic cotton jersey, 180 gsm", description: "A heavier tee with a dropped shoulder, meant for home.", details: ["Dropped shoulder", "Bound neck", "Longer body"] },
    { slug: "washed-robe", name: "Washed Robe", price: 4590, category: "lounge", gender: "unisex", silhouette: "overshirt", colors: ["Olive", "Stone"], fabric: "Washed linen, 180 gsm", description: "A knee-length robe in washed linen, with a tie belt.", details: ["Tie belt", "Patch pockets", "Knee length"] },
  ];

  return rows.map((row) => ({
    slug: row.slug,
    name: row.name,
    price: row.price,
    category: row.category,
    gender: row.gender,
    silhouette: row.silhouette,
    isNew: row.isNew,
    colors: row.colors.map((name) => ({ name, hex: palette[name] })),
    sizes,
    stock: stockFor([...row.colors]),
    fabric: row.fabric,
    origin: "Cut and sewn in Bengaluru",
    fit: row.gender === "unisex" ? "Fits true to size. One size chart, shared." : "Fits true to size.",
    model: { heightCm: row.gender === "women" ? 168 : 178, size: row.gender === "women" ? "S" : "M" },
    description: row.description,
    details: row.details,
    care: ["Machine wash cold", "Hang dry in the shade"],
    rating: 0,
    reviewCount: 0,
    reviews: [],
    photos: [{ id: "photo", label: "Photo", src: `/photos/${row.slug}.jpg`, alt: row.description }],
  }));
}

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

export type ApiProduct = {
  slug: string;
  name: string;
  price: number;
  category: string;
  gender?: string;
  fabric: string;
  description: string;
  details: unknown;
  care: unknown;
  rating: number;
  reviewCount: number;
  isNew?: boolean;
  reviews: unknown;
  colors: unknown;
  sizes: unknown;
  stock: unknown;
  silhouette?: string;
  origin?: string;
  fit?: string;
  model?: unknown;
  photos?: unknown;
};

let source: Product[] | null = null;

export function catalogSource() {
  return source ?? products;
}

export function rememberProduct(product: Product) {
  source = [...catalogSource().filter((entry) => entry.slug !== product.slug), product];
}

export function installCatalog(rows: ApiProduct[] | undefined) {
  if (!rows?.length) {
    source = null;
    return;
  }
  source = rows.map(toProduct);
}

function storedPhotos(value: unknown): ProductPhoto[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const src = String((item as ProductPhoto).src ?? "").trim();
    if ((!src.startsWith("/photos/") && !src.startsWith("/uploads/")) || src.includes("..")) return [];
    return [{
      id: String((item as ProductPhoto).id ?? "photo"),
      label: String((item as ProductPhoto).label ?? "Photo"),
      src,
      alt: String((item as ProductPhoto).alt ?? ""),
    }];
  });
}

export function toProduct(row: ApiProduct): Product {
  const known = products.find((product) => product.slug === row.slug);
  const photos = storedPhotos(row.photos);
  const category = categorySlug(row.category) || known?.category || "tops";
  const lower = categoryList().find((entry) => entry.slug === category)?.chart === "lower" || category === "bottoms";
  const silhouette = (row.silhouette || known?.silhouette || (lower ? "trouser" : category === "outerwear" ? "jacket" : "tee")) as Silhouette;
  return {
    slug: row.slug,
    name: row.name,
    price: row.price,
    category,
    gender: row.gender === "women" || row.gender === "men" || row.gender === "unisex" ? row.gender : productGender({ slug: row.slug, silhouette, gender: known?.gender }),
    silhouette,
    colors: (Array.isArray(row.colors) ? row.colors : known?.colors ?? []) as Colorway[],
    sizes: (Array.isArray(row.sizes) ? row.sizes : known?.sizes ?? SIZES) as Size[],
    stock: (row.stock && typeof row.stock === "object" ? row.stock : known?.stock ?? {}) as Record<string, number>,
    fabric: row.fabric || known?.fabric || "Cotton",
    origin: row.origin || known?.origin || "Cut and sewn in Bengaluru",
    fit: row.fit || known?.fit || "Fits true to size.",
    model: (row.model as Product["model"]) || known?.model || { heightCm: 178, size: "M" },
    description: row.description || known?.description || "",
    details: Array.isArray(row.details) && row.details.length ? (row.details as string[]) : known?.details ?? [],
    care: Array.isArray(row.care) && row.care.length ? (row.care as string[]) : known?.care ?? ["Machine wash cold"],
    rating: row.rating ?? known?.rating ?? 0,
    reviewCount: row.reviewCount ?? known?.reviewCount ?? 0,
    isNew: row.isNew ?? known?.isNew,
    reviews: mergeReviews(row.reviews, known?.reviews),
    photos: photos.length
      ? photos
      : known?.photos?.length
        ? known.photos
        : known
          ? undefined
          : [{ id: "photo", label: "Photo", src: PLACEHOLDER_IMAGE, alt: `${row.name}. Photo to be added.` }],
    shot: known?.shot,
  };
}

function mergeReviews(value: unknown, samples: Review[] = []): Review[] {
  const incoming = Array.isArray(value) ? (value as Partial<Review>[]) : [];
  if (!incoming.length) return samples;
  return incoming.map((review) => {
    const sample = !review.size && !review.fit ? samples.find((item) => item.name === review.name) : undefined;
    return {
      name: review.name || "Customer",
      rating: Number(review.rating ?? sample?.rating ?? 0),
      text: review.text || sample?.text || "",
      size: (review.size || sample?.size || "") as Size,
      fit: review.fit || sample?.fit || "",
      heightCm: Number(review.heightCm || sample?.heightCm || 0),
      color: review.color || sample?.color || "",
    };
  });
}

export function getProduct(slug: string) {
  return catalogSource().find((product) => product.slug === slug);
}

export function categoryLabel(slug: string) {
  const known = shopEntrances().find((category) => category.slug === slug);
  if (known) return known.label;
  return slug
    .split("-")
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}

export function filterProducts<T extends Product = Product>(options: {
  category?: string;
  query?: string;
  sizes?: string[];
  colors?: string[];
  genders?: string[];
  min?: number;
  max?: number;
  inStock?: boolean;
  sort?: string;
  source?: readonly T[];
}): T[] {
  const query = options.query?.trim().toLowerCase() ?? "";
  const rows: T[] = options.source ? [...options.source] : (catalogSource() as T[]);
  let list = rows.filter((product) => {
    if (options.category === "new" && !product.isNew) return false;
    if (options.category && options.category !== "new" && options.category !== "all" && product.category !== options.category) {
      return false;
    }
    const gender = productGender(product);
    if (query) {
      const haystack = `${product.name} ${product.fabric} ${product.origin} ${product.description} ${product.category} ${gender} ${product.colors.map((color) => color.name).join(" ")}`.toLowerCase();
      const tokens = query.split(/\s+/);
      if (!tokens.every((token) => haystack.includes(token) || close(haystack, token))) return false;
    }
    if (options.genders?.length) {
      const selected = new Set(options.genders);
      const matches =
        (selected.has("women") && (gender === "women" || gender === "unisex")) ||
        (selected.has("men") && (gender === "men" || gender === "unisex")) ||
        (selected.has("unisex") && gender === "unisex");
      if (!matches) return false;
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
  const list = catalogSource();
  if (!current) return list.slice(0, 4);
  return list.filter((product) => product.slug !== slug && product.category === current.category).concat(
    list.filter((product) => product.slug !== slug && product.category !== current.category),
  ).slice(0, 4);
}
