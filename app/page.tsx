import Link from "next/link";
import { HeroCarousel } from "@/components/hero-carousel";
import { ProductCard } from "@/components/product-card";
import { RecentShelf } from "@/components/recent-shelf";
import { CATEGORIES, products } from "@/lib/catalog";

const promises = [
  { title: "Free shipping", text: "On orders over ₹1,999" },
  { title: "7-day returns", text: "We collect it from you" },
  { title: "Cash on delivery", text: "Available across India" },
  { title: "Secure payments", text: "UPI, cards, net banking" },
];

export default function HomePage() {
  const arrivals = products.filter((product) => product.isNew).slice(0, 3);

  return (
    <div>
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 md:grid-cols-2 md:gap-16 md:px-6 md:py-20">
        <div>
          <p className="eyebrow settle text-muted [--i:0]">Autumn / Winter 2026</p>
          <h1 className="serif mt-5 max-w-md text-5xl leading-[1.05] md:text-6xl">
            <span className="line-mask">
              <span className="line-rise [--i:0]">Quiet clothes</span>
            </span>
            <span className="line-mask">
              <span className="line-rise [--i:1]">for every day.</span>
            </span>
          </h1>
          <p className="settle mt-5 max-w-sm text-sm leading-7 text-muted [--i:2]">
            Eight pieces. Washed linen, heavy cotton, and wool, cut in small runs in Bengaluru.
          </p>
          <div className="settle mt-8 flex flex-col gap-3 sm:flex-row [--i:3]">
            <Link href="/shop?category=new" className="flex h-12 items-center justify-center bg-terra px-6 text-sm tracking-[0.16em] text-cream">
              SHOP THE COLLECTION
            </Link>
            <Link href="/about" className="flex h-12 items-center justify-center border border-ink px-6 text-sm tracking-[0.16em]">
              OUR STORY
            </Link>
          </div>
        </div>
        <HeroCarousel />
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 md:px-6">
        <h2 className="serif text-3xl">Shop by category</h2>
        <div className="snap-row mt-8 pb-2">
          {CATEGORIES.map((category) => (
            <Link key={category.slug} href={`/shop?category=${category.slug}`}>
              <img
                src={category.image}
                alt=""
                width={800}
                height={1000}
                className="aspect-[4/5] w-full object-cover"
              />
              <p className="mt-3 text-sm">{category.label}</p>
              <p className="mt-1 text-sm text-muted">{category.blurb}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 md:px-6">
        <div className="relative">
          <img
            src="/photos/season-shelf.jpg"
            alt="Stacks of folded shirts in olive, sand, and clay on a wooden shelf"
            width={1584}
            height={672}
            className="aspect-[4/3] w-full object-cover object-left lg:aspect-[1584/672]"
          />
          <div className="mt-6 max-w-sm lg:absolute lg:inset-y-0 lg:right-0 lg:mt-0 lg:flex lg:w-[34%] lg:max-w-none lg:items-center lg:pr-8">
            <div>
              <p className="eyebrow text-muted">Autumn / Winter 2026</p>
              <h2 className="serif mt-3 text-4xl leading-[1.05] md:text-5xl">New this season</h2>
              <p className="mt-4 text-sm leading-7 text-muted">Linen, heavy cotton, and wool, cut in small runs and folded on the shelf.</p>
              <Link href="/shop?category=new" className="mt-6 inline-flex h-12 items-center bg-terra px-6 text-sm tracking-[0.16em] text-cream">
                SHOP THE COLLECTION
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 md:px-6">
        <h2 className="serif text-3xl">New arrivals</h2>
        <div className="reveal mt-8 grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {arrivals.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
        <div className="mt-12 flex items-center gap-4">
          <span className="h-px flex-1 bg-line" />
          <Link href="/shop?category=new" className="text-xs tracking-[0.18em]">
            SHOP ALL
          </Link>
          <span className="h-px flex-1 bg-line" />
        </div>
      </section>

      <RecentShelf />

      <section className="bg-olive text-cream">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-2 md:grid-cols-4 md:px-6">
          {promises.map((item) => (
            <div key={item.title}>
              <p className="text-sm">{item.title}</p>
              <p className="mt-1 text-sm leading-6 text-cream/75">{item.text}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
