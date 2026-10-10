import type { Category, Size } from "@/lib/catalog";

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

export function sizeChart(category: Category) {
  const lower = category === "bottoms";
  return {
    caption: lower
      ? "Waist and hip are body measurements. Inseam is the garment. All figures are centimetres."
      : "Chest and shoulder are body measurements. Length is the garment, from the shoulder. All figures are centimetres.",
    columns: lower ? ["Size", "Waist", "Hip", "Inseam"] : ["Size", "Chest", "Shoulder", "Length"],
    rows: sizes.map((size, index) => [size, ...(lower ? bottoms[index] : tops[index])]),
  };
}
