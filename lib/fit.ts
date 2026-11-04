import { categoryList, type AudienceGroup, type Size } from "@/lib/catalog";

const sizes: Size[] = ["XS", "S", "M", "L", "XL"];

// Typical body measurements by age size, in centimetres and kilograms. Sizes not listed show a dash.
const kids: Record<string, [string, string]> = {
  "2-3Y": ["92–98", "52–53"],
  "3-4Y": ["98–104", "53–55"],
  "4-5Y": ["104–110", "55–57"],
  "5-6Y": ["110–116", "57–59"],
  "6-7Y": ["116–122", "59–61"],
  "7-8Y": ["122–128", "61–64"],
  "8-9Y": ["128–134", "64–66"],
  "9-10Y": ["134–140", "66–69"],
  "10-11Y": ["140–146", "69–72"],
  "11-12Y": ["146–152", "72–76"],
  "12-13Y": ["152–158", "76–79"],
  "13-14Y": ["158–164", "79–83"],
};

const baby: Record<string, [string, string]> = {
  "0-3M": ["56–62", "3–6"],
  "3-6M": ["62–68", "6–8"],
  "6-9M": ["68–74", "8–9"],
  "6-12M": ["68–80", "8–10"],
  "9-12M": ["74–80", "9–10"],
  "12-18M": ["80–86", "10–12"],
  "18-24M": ["86–92", "12–14"],
};

const tops = [
  ["86", "39", "66"],
  ["90", "41", "68"],
  ["96", "43", "70"],
  ["102", "45", "72"],
  ["108", "47", "74"],
];

const bottoms = [
  ["71", "90", "71"],
  ["76", "96", "72"],
  ["81", "102", "73"],
  ["86", "108", "74"],
  ["92", "114", "75"],
];

export function fitHint(reviews: { size?: string; heightCm?: number; fit?: string }[]) {
  const sized = reviews.filter((review) => review.size && typeof review.heightCm === "number" && review.heightCm >= 120);
  const trueToSize = sized.filter((review) => !review.fit || review.fit === "True to size");
  const sample = trueToSize.length >= 2 ? trueToSize : sized;
  if (sample.length < 2) return null;
  const heights = new Map<string, number[]>();
  for (const review of sample) {
    const list = heights.get(review.size!) ?? [];
    list.push(review.heightCm!);
    heights.set(review.size!, list);
  }
  let best: number[] = [];
  for (const list of heights.values()) {
    if (list.length > best.length) best = list;
  }
  const winners = [...heights.entries()].filter(([, list]) => list.length === best.length);
  if (winners.length > 1) {
    const names = winners.map(([name]) => name).join(" and ");
    return `Reviews are split between ${names}.`;
  }
  const size = winners[0][0];
  const sorted = [...best].sort((left, right) => left - right);
  const middle = sorted[Math.floor(sorted.length / 2)];
  const around = Math.round(middle / 5) * 5;
  return `People around ${around} cm mostly take ${size}.`;
}

export function sizeChart(category: string, productSizes: Size[] = sizes, group: AudienceGroup = "adults") {
  if (group === "kids" || group === "baby") {
    const table = group === "kids" ? kids : baby;
    return {
      caption:
        group === "kids"
          ? "Height and chest are body measurements, in centimetres. If your child is between sizes, choose the larger."
          : "Height in centimetres and weight in kilograms. If your baby is between sizes, choose the larger.",
      columns: group === "kids" ? ["Size", "Height", "Chest"] : ["Size", "Height", "Weight"],
      rows: productSizes.map((size) => [size, ...(table[size.toUpperCase()] ?? ["—", "—"])]),
    };
  }
  const lower = categoryList().find((entry) => entry.slug === category)?.chart === "lower" || category === "bottoms";
  return {
    caption: lower
      ? "Waist and hip are body measurements. Inseam is the garment. All figures are centimetres."
      : "Chest and shoulder are body measurements. Length is the garment, from the shoulder. All figures are centimetres.",
    columns: lower ? ["Size", "Waist", "Hip", "Inseam"] : ["Size", "Chest", "Shoulder", "Length"],
    rows: productSizes.map((size) => {
      const index = sizes.indexOf(size);
      return [size, ...(index >= 0 ? (lower ? bottoms : tops)[index] : ["—", "—", "—"])];
    }),
  };
}
