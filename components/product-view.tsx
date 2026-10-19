"use client";

import Link from "next/link";
import { FormEvent, useEffect, useRef, useState, type ReactNode } from "react";
import { ProductCard } from "@/components/product-card";
import { ProductVisual } from "@/components/product-visual";
import { ReviewBox } from "@/components/review-box";
import { categoryLabel, GENDERS, getProduct, liveProduct, productGender, relatedProducts, unitsAvailable, type Product } from "@/lib/catalog";
import { Icon } from "@/components/icons";
import { fitHint, sizeChart } from "@/lib/fit";
import { formatINR } from "@/lib/money";
import { storeSaleActive, withStoreSale } from "@/lib/sale";
import { useStore } from "@/lib/store";
import { useHydrated } from "@/lib/use-hydrated";

export function ProductView({ product: initial }: { product: Product }) {
  const { addToCart, toggleWishlist, wished, overrides, usualSize, noteView, askRestock, ready, settings } = useStore();
  const hydrated = useHydrated();
  const product = (ready ? getProduct(initial.slug) : undefined) ?? initial;
  const listed = liveProduct(product, hydrated ? overrides[product.slug] : undefined);
  const live = hydrated ? withStoreSale(listed, settings) : listed;
  const gender = productGender(product);
  const genderLabel = GENDERS.find((item) => item.id === gender)?.label ?? "Unisex";
  const [color, setColor] = useState(product.colors[0].name);
  const [size, setSize] = useState(product.sizes.includes("M") ? "M" : product.sizes[0]);
  const picked = useRef(false);
  const [pin, setPin] = useState("");
  const [delivery, setDelivery] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [guide, setGuide] = useState(false);
  const [open, setOpen] = useState<string | null>(null);
  const [added, setAdded] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [pop, setPop] = useState(false);
  const [restockContact, setRestockContact] = useState("");
  const [restockNote, setRestockNote] = useState<string | null>(null);
  const [landedReview, setLandedReview] = useState<string | null>(null);
  const hex = product.colors.find((entry) => entry.name === color)?.hex ?? product.colors[0].hex;
  const available = unitsAvailable(live, color, size);
  const saved = wished(product.slug);
  const related = relatedProducts(product.slug);
  const chart = sizeChart(product.category);
  const hint = fitHint(product.reviews);

  useEffect(() => {
    noteView(product.slug);
  }, [product.slug, noteView]);

  useEffect(() => {
    if (picked.current || !usualSize || !product.sizes.includes(usualSize)) return;
    setSize(usualSize);
  }, [usualSize, product.sizes]);

  function checkPin() {
    if (!/^\d{6}$/.test(pin) || pin.startsWith("0")) {
      setDelivery("Enter a 6-digit PIN code.");
      return;
    }
    if (pin.startsWith("9")) {
      setDelivery("We do not deliver to this PIN code yet.");
      return;
    }
    setDelivery("Delivery in 3–5 days · Cash on delivery available");
  }

  function add() {
    if (available <= 0) {
      setNotice("That combination is out of stock.");
      return;
    }
    const error = addToCart(product, color, size, quantity);
    if (error) {
      setNotice(error);
      return;
    }
    setNotice(null);
    setAdded(true);
    window.dispatchEvent(new CustomEvent("earthen:bag", { detail: { slug: product.slug, color, size } }));
    window.setTimeout(() => setAdded(false), 1400);
  }

  function save() {
    if (!saved) setPop(true);
    toggleWishlist(product.slug, color);
  }

  async function requestRestock(event: FormEvent) {
    event.preventDefault();
    const message = await askRestock({ slug: product.slug, color, size, contact: restockContact });
    setRestockNote(message);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 md:px-6 md:py-10">
      <p className="text-sm text-muted">
        <Link href="/">Home</Link> / <Link href={`/shop?category=${product.category}`}>{categoryLabel(product.category)}</Link> / {product.name}
      </p>
      <div className="mt-4 md:grid md:grid-cols-2 md:gap-12">
        <div>
          <ProductVisual
            slug={product.slug}
            name={product.name}
            hex={hex}
            colorName={color}
            silhouette={product.silhouette}
            photos={product.photos}
            stage
          />
          <p className="mt-4 text-sm leading-6 text-muted">{wearingNote(product)}</p>
        </div>
        <div className="mt-6 md:mt-0">
          <p className="eyebrow text-muted">
            {product.isNew ? "New in · " : ""}
            <Link href={`/shop?gender=${gender}`} className="hover:text-ink">
              {genderLabel}
            </Link>
          </p>
          <h1 className="serif mt-2 text-4xl">{product.name}</h1>
          <p className="mt-3 text-lg">
            {formatINR(live.price)}{" "}
            {live.price < live.basePrice && <span className="text-sm text-muted line-through">{formatINR(live.basePrice)}</span>}{" "}
            <span className="text-sm text-muted">Inclusive of all taxes</span>
          </p>
          {hydrated && storeSaleActive(settings) && listed.price === listed.basePrice && live.price < live.basePrice && settings.saleName.trim() && (
            <p className="mt-1 text-sm text-olive">{settings.saleName.trim()}</p>
          )}
          <p className="mt-2 text-sm text-muted">
            {product.reviewCount > 0
              ? `${"★".repeat(Math.round(product.rating))} ${product.rating.toFixed(1)} · ${product.reviewCount} reviews`
              : "No reviews yet"}
          </p>
          <p className="mt-6 text-sm">Colour: {color}</p>
          <div className="mt-2 flex gap-2">
            {product.colors.map((entry) => (
              <button
                key={entry.name}
                aria-label={entry.name}
                  onClick={() => {
                    setColor(entry.name);
                    setQuantity(1);
                  }}
                className={`h-8 w-8 rounded-full border ${entry.name === color ? "border-ink" : "border-line"}`}
                style={{ background: entry.hex }}
              />
            ))}
          </div>
          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm">Size: {size}</p>
            <button className="inline-flex items-center gap-1.5 text-sm underline" onClick={() => setGuide(true)}>
              <Icon name="ruler" className="h-4 w-4" />
              Size guide
            </button>
          </div>
          <div className="mt-2 flex gap-2">
            {product.sizes.map((option) => {
              const left = unitsAvailable(live, color, option);
              return (
                <button
                  key={option}
                  disabled={left <= 0}
                  onClick={() => {
                    picked.current = true;
                    setSize(option);
                    setQuantity(1);
                  }}
                  className={`h-11 w-11 border text-sm ${option === size ? "border-ink bg-ink text-cream" : "border-line"} disabled:text-muted disabled:line-through`}
                >
                  {option}
                </button>
              );
            })}
          </div>
          {available > 0 && (
            <div className="mt-4 flex h-11 w-28 items-center border border-line">
              <button type="button" className="h-full flex-1 disabled:opacity-40" aria-label="Decrease quantity" disabled={quantity <= 1} onClick={() => setQuantity((current) => Math.max(1, current - 1))}>
                –
              </button>
              <span className="flex-1 text-center text-sm">{quantity}</span>
              <button type="button" className="h-full flex-1 disabled:opacity-40" aria-label="Increase quantity" disabled={quantity >= available} onClick={() => setQuantity((current) => Math.min(available, current + 1))}>
                +
              </button>
            </div>
          )}
          {available > 0 && available <= 3 && <p className="mt-2 text-sm text-muted">Only {available} left in {color}, size {size}.</p>}
          {hint && <p className="mt-2 text-sm text-muted">{hint}</p>}
          {available === 0 && (
            <form onSubmit={requestRestock} className="mt-4">
              <p className="text-sm">Out of stock in this size.</p>
              <p className="mt-1 text-sm text-muted">Leave an email and we will write when {color} in {size} is back. A mobile number is kept on this browser only. Nothing else.</p>
              <div className="mt-2 flex gap-2">
                <label className="sr-only" htmlFor="restock">
                  Email or mobile
                </label>
                <input
                  id="restock"
                  value={restockContact}
                  onChange={(event) => setRestockContact(event.target.value)}
                  className="h-11 flex-1 border border-line bg-paper px-3 outline-none"
                />
                <button className="h-11 border border-ink px-4 text-xs tracking-[0.14em]">TELL ME</button>
              </div>
              {restockNote && <p className="note-in mt-2 text-sm text-muted">{restockNote}</p>}
            </form>
          )}

          <div className="mt-6">
            <p className="flex items-center gap-1.5 text-sm">
              <Icon name="truck" className="h-4 w-4" />
              Check delivery
            </p>
            <div className="mt-2 flex gap-2">
              <input
                value={pin}
                onChange={(event) => setPin(event.target.value.replace(/\D/g, "").slice(0, 6))}
                className="h-11 flex-1 border border-line bg-paper px-3 outline-none"
                aria-label="PIN code"
                inputMode="numeric"
              />
              <button onClick={checkPin} className="h-11 border border-ink px-4 text-xs tracking-[0.14em]">
                CHECK
              </button>
            </div>
            {delivery && <p key={delivery} className="note-in mt-2 text-sm text-muted">{delivery}</p>}
          </div>

          <button onClick={add} className={`motion-btn relative mt-6 h-12 w-full bg-terra text-sm tracking-[0.16em] text-cream ${added ? "done" : ""}`}>
            <span className="lbl">ADD TO BAG</span>
            <span className="tick" aria-hidden="true">
              ✓
            </span>
          </button>
          <button
            onClick={save}
            className="mt-3 flex h-12 w-full items-center justify-center gap-2 border border-ink text-xs tracking-[0.16em]"
          >
            <Heart filled={saved} pop={pop} onDone={() => setPop(false)} />
            {saved ? "SAVED TO WISHLIST" : "ADD TO WISHLIST"}
          </button>
          {notice && <p key={notice} className="note-in mt-3 text-sm">{notice}</p>}

          <div className="mt-8 divide-y divide-line border-y border-line">
            <Accordion title="Product details" open={open === "details"} onToggle={() => setOpen(open === "details" ? null : "details")}>
              <p>{product.description}</p>
              <p className="mt-2">{product.origin}.</p>
              <ul className="mt-2 list-disc pl-4">
                {product.details.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </Accordion>
            <Accordion title="Fabric and care" open={open === "care"} onToggle={() => setOpen(open === "care" ? null : "care")}>
              <p>{product.fabric}</p>
              <ul className="mt-2 list-disc pl-4">
                {product.care.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </Accordion>
            <Accordion title="Shipping and returns" open={open === "ship"} onToggle={() => setOpen(open === "ship" ? null : "ship")}>
              <p>
                Free standard delivery on orders over ₹1,999, usually 3–5 days from Bengaluru. Express is ₹149 and arrives in 1–2 days. You have 7 days after delivery to return or exchange a piece. We arrange the pickup.{" "}
                <Link href="/returns-policy" className="underline">
                  Read the return policy
                </Link>
                .
              </p>
            </Accordion>
          </div>

          <div className="mt-8" id="reviews">
            <h2 className="text-sm">Reviews</h2>
            <ReviewBox slug={product.slug} onPublished={setLandedReview} />
            <ul className="mt-4 space-y-5">
              {product.reviews.map((review) => (
                <li key={`${review.name}-${review.size}-${review.text}`} className={landedReview === review.text ? "line-land" : undefined}>
                  <p className="text-sm">
                    {review.name} · {"★".repeat(review.rating)}
                  </p>
                  {reviewLine(review) && <p className="mt-1 text-sm text-muted">{reviewLine(review)}</p>}
                  <p className="mt-1 text-sm text-muted">{review.text}</p>
                </li>
              ))}
              {product.reviews.length === 0 && <li className="text-sm text-muted">Be the first to review this piece after it arrives.</li>}
            </ul>
          </div>
        </div>
      </div>

      <section className="mt-16">
        <h2 className="serif text-3xl">You may also like</h2>
        <div className="reveal mt-8 grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {related.map((item) => (
            <ProductCard key={item.slug} product={item} />
          ))}
        </div>
      </section>

      {guide && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 md:items-center" onClick={() => setGuide(false)}>
          <div className="w-full max-w-md bg-cream p-6" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="serif text-2xl">Size guide</h2>
              <button onClick={() => setGuide(false)}>Close</button>
            </div>
            <p className="mt-3 text-sm leading-6 text-muted">
              {chart.caption} {product.fit}
              {gender === "unisex" ? " One chart for everyone who wears this cut." : ""}
            </p>
            <table className="mt-4 w-full text-left text-sm">
              <thead>
                <tr className="border-b border-line">
                  {chart.columns.map((column) => (
                    <th key={column} className="py-2 font-medium">
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {chart.rows.map((row) => (
                  <tr key={row[0]} className="border-b border-line">
                    {row.map((cell) => (
                      <td key={cell} className="py-2">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-4 text-sm text-muted">From reviews</p>
            <ul className="mt-2 space-y-2 text-sm text-muted">
              {product.reviews.map((review) => (
                <li key={`${review.name}-${review.size}-${review.text}`}>
                  {review.name}
                  {review.heightCm ? `, ${review.heightCm} cm` : ""}, wears {review.size}. {review.fit ? `${review.fit}.` : ""}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

function wearingNote(product: Product) {
  const model = product.shot ?? `Model is ${product.model.heightCm} cm and wears size ${product.model.size}.`;
  if (productGender(product) !== "unisex") return `${model} ${product.fit}`;
  const worn = product.reviews.filter((review) => review.heightCm >= 120 && review.size).sort((left, right) => left.heightCm - right.heightCm);
  const low = worn[0];
  const high = worn[worn.length - 1];
  if (low && high && low.heightCm !== high.heightCm) {
    const photo = product.shot ? `${product.shot} ` : "";
    return `${photo}Worn at ${low.heightCm} cm in ${low.size}, and at ${high.heightCm} cm in ${high.size}. ${product.fit} One size chart, shared.`;
  }
  return `${model} ${product.fit} One size chart, shared.`;
}

function reviewLine(review: Product["reviews"][number]) {
  return [review.heightCm ? `${review.heightCm} cm` : "", review.size ? `size ${review.size}` : "", review.fit].filter(Boolean).join(" · ");
}

function Accordion({
  title,
  open,
  onToggle,
  children,
}: {
  title: string;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <div>
      <button className="flex h-12 w-full items-center justify-between text-left text-sm" aria-expanded={open} onClick={onToggle}>
        {title}
        <span>{open ? "–" : "+"}</span>
      </button>
      <div className={open ? "fold open" : "fold"}>
        <div className="fold-inner" inert={open ? undefined : true}>
          <div className="pb-4 text-sm leading-6 text-muted">{children}</div>
        </div>
      </div>
    </div>
  );
}

function Heart({ filled, pop, onDone }: { filled: boolean; pop: boolean; onDone: () => void }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      aria-hidden="true"
      onAnimationEnd={onDone}
      className={`heart ${pop ? "is-pop" : ""} ${filled ? "fill-terra text-terra" : "fill-none text-ink"}`}
    >
      <path d="M8 13.2 2.4 8.1a3.2 3.2 0 0 1 4.3-4.7L8 4.6l1.3-1.2a3.2 3.2 0 0 1 4.3 4.7Z" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}
