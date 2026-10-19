import { categoryList, type Size } from "@/lib/catalog";

const sizes: Size[] = ["XS", "S", "M", "L", "XL"];

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

export function sizeChart(category: string) {
  const lower = categoryList().find((entry) => entry.slug === category)?.chart === "lower" || category === "bottoms";
  return {
    caption: lower
      ? "Waist and hip are body measurements. Inseam is the garment. All figures are centimetres."
      : "Chest and shoulder are body measurements. Length is the garment, from the shoulder. All figures are centimetres.",
    columns: lower ? ["Size", "Waist", "Hip", "Inseam"] : ["Size", "Chest", "Shoulder", "Length"],
    rows: sizes.map((size, index) => [size, ...(lower ? bottoms[index] : tops[index])]),
  };
}
