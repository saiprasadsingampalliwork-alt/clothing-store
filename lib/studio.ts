export type Silhouette = "overshirt" | "tee" | "shirt" | "trouser" | "skirt" | "cardigan" | "jacket";

export type StudioView = "worn" | "fabric" | "flat" | "stitch";

export const STUDIO_VIEWS: { id: StudioView; label: string }[] = [
  { id: "worn", label: "Worn" },
  { id: "fabric", label: "Cloth" },
  { id: "flat", label: "Flat" },
  { id: "stitch", label: "Stitch" },
];

const PAPER = "#f3eee6";
const INK = "#1c1a17";
const SKIN = "#e7d2c0";
const NEUTRAL = "#ebe4d8";

function svg(body: string) {
  const doc = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500" role="img">${body}</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(doc)}`;
}

function paper() {
  return `<rect width="400" height="500" fill="${PAPER}"/>`;
}

function shadow() {
  return `<ellipse cx="200" cy="458" rx="72" ry="7" fill="${INK}" opacity="0.08"/>`;
}

const tee = "M146 176c0-18 22-34 54-28 32-6 54 10 54 28l16 40-20 6-6 92h-88l-6-92-20-6z";
const overshirt = "M132 170c2-22 28-40 68-32 40-8 66 10 68 32l22 48-24 8-4 118h-124l-4-118-26-8z";
const shirt = "M138 166c2-20 26-36 62-30 36-6 60 10 62 30l18 44-22 8-2 112h-112l-2-112-22-8z";
const jacket = "M128 168c4-24 30-42 72-34 42-8 68 10 72 34l24 52-26 8-2 124h-136l-2-124-28-8z";
const trousers = "M156 214h88l10 214h-36l-8-150-8 150h-36z";
const skirt = "M158 214h84l22 168c-8 10-28 16-64 16s-56-6-64-16z";
const cardiganLeft = "M132 172c8-28 36-40 68-34v188h-62l-8-108-22-8z";
const cardiganRight = "M268 172c-8-28-36-40-68-34v188h62l8-108 22-8z";

function neck() {
  return `<path d="M184 132h32v40h-32z" fill="${SKIN}"/>`;
}

function legs() {
  return `<path d="M168 300h26l4 140h-22zm38 0h26l-8 140h-22z" fill="${NEUTRAL}"/>`;
}

function worn(hex: string, silhouette: Silhouette) {
  const stage = `translate(200 270) scale(1.55) translate(-200 -270)`;
  const base = `${paper()}${shadow()}`;
  if (silhouette === "trouser") {
    return svg(
      `${base}<g transform="${stage}">${neck()}<path d="${tee}" fill="${NEUTRAL}"/>${legs()}<path d="${trousers}" fill="${hex}"/><path d="${trousers}" fill="none" stroke="${INK}" stroke-opacity="0.28" stroke-width="1.4"/></g>`,
    );
  }
  if (silhouette === "skirt") {
    return svg(
      `${base}<g transform="${stage}">${neck()}<path d="${tee}" fill="${NEUTRAL}"/><path d="${skirt}" fill="${hex}"/><path d="${skirt}" fill="none" stroke="${INK}" stroke-opacity="0.28" stroke-width="1.4"/></g>`,
    );
  }
  if (silhouette === "cardigan") {
    return svg(
      `${base}<g transform="${stage}">${neck()}<path d="${tee}" fill="${NEUTRAL}"/><path d="${cardiganLeft}" fill="${hex}"/><path d="${cardiganRight}" fill="${hex}"/><path d="M200 150v176" fill="none" stroke="${PAPER}" stroke-width="8"/></g>`,
    );
  }
  const garment = silhouette === "overshirt" ? overshirt : silhouette === "shirt" ? shirt : silhouette === "jacket" ? jacket : tee;
  const hem = silhouette === "tee" ? legs() : "";
  const placket = silhouette === "shirt" || silhouette === "overshirt" ? `<path d="M200 160v150" stroke="${INK}" stroke-opacity="0.35" stroke-width="1"/>` : "";
  return svg(
    `${base}<g transform="${stage}">${neck()}${hem}<path d="${garment}" fill="${hex}"/><path d="${garment}" fill="none" stroke="${INK}" stroke-opacity="0.22" stroke-width="1.4"/>${placket}</g>`,
  );
}

function flat(hex: string, silhouette: Silhouette) {
  const garment =
    silhouette === "trouser" ? trousers : silhouette === "skirt" ? skirt : silhouette === "overshirt" || silhouette === "jacket" ? overshirt : silhouette === "shirt" ? shirt : tee;
  const panels =
    silhouette === "cardigan"
      ? `<g transform="translate(200 250) scale(1.7) translate(-200 -250)"><path d="${cardiganLeft}" fill="${hex}"/><path d="${cardiganRight}" fill="${hex}"/></g>`
      : `<g transform="translate(200 250) scale(1.7) translate(-200 -230)"><path d="${garment}" fill="${hex}"/></g>`;
  return svg(`${paper()}${panels}`);
}

function fabric(hex: string) {
  const lines = Array.from({ length: 28 }, (_, index) => {
    const y = 18 + index * 17;
    return `<line x1="0" y1="${y}" x2="400" y2="${y + 8}" />`;
  }).join("");
  return svg(
    `${paper()}<rect width="400" height="500" fill="${hex}"/><g stroke="${INK}" stroke-opacity="0.16" stroke-width="1.1">${lines}</g>`,
  );
}

function stitch(hex: string) {
  return svg(
    `${paper()}<rect x="36" y="36" width="328" height="428" fill="${hex}"/>
    <path d="M200 36v428" stroke="${INK}" stroke-opacity="0.45" stroke-width="1.2" stroke-dasharray="2 4"/>
    <circle cx="200" cy="150" r="11" fill="${PAPER}" stroke="${INK}" stroke-opacity="0.55"/>
    <circle cx="200" cy="210" r="11" fill="${PAPER}" stroke="${INK}" stroke-opacity="0.55"/>
    <circle cx="200" cy="270" r="11" fill="${PAPER}" stroke="${INK}" stroke-opacity="0.55"/>
    <circle cx="200" cy="150" r="2" fill="${INK}" opacity="0.6"/>
    <circle cx="200" cy="210" r="2" fill="${INK}" opacity="0.6"/>
    <circle cx="200" cy="270" r="2" fill="${INK}" opacity="0.6"/>`,
  );
}

export function studioSrc(view: StudioView, hex: string, silhouette: Silhouette) {
  if (view === "fabric") return fabric(hex);
  if (view === "flat") return flat(hex, silhouette);
  if (view === "stitch") return stitch(hex);
  return worn(hex, silhouette);
}
