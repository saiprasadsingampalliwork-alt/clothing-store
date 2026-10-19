import Link from "next/link";
import { StudioReach } from "@/components/studio-reach";

export const metadata = { title: "Our story" };

const milestones = [
  {
    year: "2016",
    title: "A room in Indiranagar",
    people: "2",
    body: "Two of us rented a room and borrowed a table. The first run was eight olive shirts, cut from one bolt of Belgian linen and sold from the room to neighbours.",
    src: "/photos/linen-weave.jpg",
    alt: "Close view of olive linen, with the weave and a stitched seam",
    caption: "The first cloth. European linen, woven in Belgium.",
    frame: "aspect-square object-cover",
  },
  {
    year: "2018",
    title: "The first rail",
    people: "6",
    body: "A cutting table replaced the borrowed one, and four stitchers joined. The trouser came next, in terracotta, sand, and olive, hung so one colour could sell through before we cut the next.",
    src: "/photos/trouser-rail.jpg",
    alt: "Terracotta, sand, and olive trousers hanging from a wooden rail",
    caption: "Terracotta, sand, and olive. Six people, one rail.",
    frame: "aspect-[4/5] object-cover object-top",
  },
  {
    year: "2020",
    title: "Scaled to a floor",
    people: "18",
    body: "The room could not take another roll of cloth. We moved to the ground floor at 14, Coconut Avenue and scaled the cutting from a single table to a floor. That year the first parcels left Bengaluru.",
    src: "/photos/season-shelf.jpg",
    alt: "Stacks of folded shirts in olive, sand, and clay on a wooden shelf",
    caption: "Short runs, folded as they came off the table.",
    frame: "aspect-[3/2] object-cover",
  },
  {
    year: "2022",
    title: "Knits from Tiruppur",
    people: "32",
    body: "The cotton jersey and the moss cardigan are knitted in Tiruppur and finished here. Knits kept the same colours through a cooler month. The shelf had a second texture, and the studio was thirty-two people.",
    src: "/photos/cardigan-flat.jpg",
    alt: "A moss green ribbed cardigan with wooden buttons, laid flat",
    caption: "The moss cardigan, knitted in Tiruppur.",
    frame: "aspect-[4/5] object-cover",
  },
  {
    year: "2024",
    title: "The door opened",
    people: "48",
    body: "Visitors could come in on weekdays. The wool-cotton trouser, in cloth milled in Italy, joined the rail. Forty-eight people, still cutting in short runs, so a colour can sell through without a warehouse of leftovers.",
    src: "/photos/jacket-room.jpg",
    alt: "An olive jacket and a moss cardigan hanging in a quiet room",
    caption: "The studio on Coconut Avenue, open on weekdays.",
    frame: "aspect-[4/5] object-cover object-[center_30%]",
  },
  {
    year: "2026",
    title: "Autumn / Winter",
    people: "56",
    body: "Fifty-six people cut and finish everything on Coconut Avenue. The colours stay in the room you already have: olive, sand, clay, ink, and a little terracotta. Prices include GST.",
    src: "/photos/worn-women.jpg",
    alt: "A sand linen shirt dress, worn beside a wooden chair",
    caption: "The linen dress, from this season.",
    frame: "aspect-[3/4] object-cover object-top",
  },
];

const facts = [
  { label: "Started", value: "2016" },
  { label: "People today", value: "56" },
  { label: "Pieces a season", value: "8" },
  { label: "Cut and finished", value: "Bengaluru" },
];

export default function AboutPage() {
  return (
    <div className="pb-16">
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-12 md:grid-cols-2 md:gap-16 md:px-6 md:py-20">
        <div>
          <p className="eyebrow settle text-muted [--i:0]">Our story</p>
          <h1 className="serif mt-4 text-4xl leading-[1.02] min-[380px]:text-5xl md:text-6xl">
            <span className="line-mask">
              <span className="line-rise" style={{ ["--i" as string]: 0 }}>
                Ten years.
              </span>
            </span>
            <span className="line-mask">
              <span className="line-rise" style={{ ["--i" as string]: 1 }}>
                Still eight pieces.
              </span>
            </span>
          </h1>
          <p className="settle mt-6 max-w-md text-sm leading-7 text-ink/90 [--i:2]">
            Earthen started in 2016 with two people and one bolt of linen, in a rented room in Indiranagar. The studio is larger now. The work is the same: shirts, trousers, and layers you can wear on a Tuesday and still want on Sunday.
          </p>
        </div>
        <img
          src="/photos/linen-hanging.jpg"
          alt="An olive linen overshirt hanging on a wooden hanger"
          width={1200}
          height={1500}
          className="settle aspect-[4/5] w-full object-cover [--i:1]"
        />
      </section>

      <section className="border-y border-line">
        <dl className="mx-auto grid max-w-6xl grid-cols-2 md:grid-cols-4">
          {facts.map((fact) => (
            <div key={fact.label} className="border-line px-4 py-8 md:border-l md:px-6 md:first:border-l-0">
              <dt className="eyebrow text-muted">{fact.label}</dt>
              <dd className="serif mt-2 text-3xl md:text-4xl">{fact.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <ol className="relative mx-auto max-w-6xl px-4 md:px-6">
        {milestones.map((item, index) => (
          <li key={item.year} className="story-item relative grid gap-6 py-14 pl-10 md:grid-cols-[minmax(0,1fr)_7rem_minmax(0,1fr)] md:items-center md:gap-0 md:py-24 md:pl-0">
            <span className="story-node" aria-hidden="true" />
            <div className={index % 2 === 0 ? "md:col-start-3 md:pl-8" : "md:col-start-1 md:pr-8"}>
              <p className="serif text-5xl leading-none text-olive">{item.year}</p>
              <h2 className="serif mt-3 text-3xl md:text-4xl">{item.title}</h2>
              <p className="mt-4 max-w-md text-sm leading-7 text-ink/90">{item.body}</p>
              <p className="mt-6 flex items-baseline gap-3">
                <span className="serif text-3xl">{item.people}</span>
                <span className="text-xs tracking-[0.16em] text-muted">PEOPLE</span>
              </p>
            </div>
            <figure className={index % 2 === 0 ? "md:col-start-1 md:row-start-1 md:pr-8" : "md:col-start-3 md:pl-8"}>
              <img src={item.src} alt={item.alt} width={1200} height={1500} className={`w-full ${item.frame}`} />
              <figcaption className="mt-3 text-xs leading-5 text-muted">{item.caption}</figcaption>
            </figure>
          </li>
        ))}
      </ol>

      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 pt-4 md:grid-cols-2 md:gap-16 md:px-6 md:pt-8">
        <img
          src="/photos/stack.jpg"
          alt="A clay shirt, the moss cardigan, and terracotta trousers, folded on linen"
          width={1200}
          height={1500}
          className="aspect-[4/3] w-full object-cover"
        />
        <div>
          <p className="eyebrow text-muted">From this studio</p>
          <h2 className="serif mt-3 text-4xl leading-[1.05]">The cloth is named on every piece.</h2>
          <p className="mt-4 text-sm leading-7 text-ink/90">
            European linen is woven in Belgium. The cotton jersey and the cardigan are knitted in Tiruppur. The wool-cotton trouser uses cloth milled in Italy. Everything is cut and finished here, and we collect returns ourselves.
          </p>
          <p className="mt-4 text-sm leading-7 text-ink/90">
            <StudioReach />
          </p>
          <Link href="/shop?category=new" className="mt-8 inline-flex h-12 items-center bg-terra px-6 text-sm tracking-[0.16em] text-cream">
            SHOP THE COLLECTION
          </Link>
        </div>
      </section>
    </div>
  );
}
