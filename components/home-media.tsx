"use client";

import Link from "next/link";
import { ScrollRow } from "@/components/scroll-row";
import { audienceList, audiencePhoto } from "@/lib/catalog";
import { audienceTile, siteContent } from "@/lib/site";
import { useStore } from "@/lib/store";

// One tile per audience in the shop, in the order set under Admin › Audiences: smaller cards, centred,
// scrolling sideways once there are more than fit.
export function AudienceBand() {
  const content = siteContent(useStore().settings);
  const audiences = audienceList();
  return (
    <section className="mx-auto max-w-6xl px-4 md:px-6" aria-label="Shop for">
      <ScrollRow label="Audiences" centered cards="compact">
        {audiences.map((audience) => {
          const tile = audienceTile(content, audience.slug, audiencePhoto(audience.slug));
          return (
            <Link key={audience.slug} href={`/shop?gender=${audience.slug}`} className="group block text-center">
              {/* Circular crop, set a little above centre so faces in the portrait photos stay in frame. */}
              <span className="block overflow-hidden rounded-full">
                <img
                  src={tile.image.src}
                  alt={tile.image.alt}
                  width={768}
                  height={768}
                  className="aspect-square w-full bg-[#efeae2] object-cover object-[50%_28%] transition-transform duration-500 group-hover:scale-[1.04]"
                />
              </span>
              <p className="serif mt-4 text-xl">{audience.label}</p>
              {tile.text && <p className="mt-1 text-sm text-muted">{tile.text}</p>}
            </Link>
          );
        })}
      </ScrollRow>
    </section>
  );
}

export function HeroIntro() {
  const content = siteContent(useStore().settings);
  const lines = content.headline.split("\n").map((line) => line.trim()).filter(Boolean).slice(0, 3);
  return (
    <div>
      <p className="eyebrow settle text-muted [--i:0]">{content.seasonName}</p>
      <h1 className="serif mt-5 max-w-md text-5xl leading-[1.05] md:text-6xl">
        {lines.map((line, index) => (
          <span key={index} className="line-mask">
            <span className="line-rise" style={{ ["--i" as string]: index }}>{line}</span>
          </span>
        ))}
      </h1>
      <p className="settle mt-5 max-w-sm text-sm leading-7 text-muted [--i:2]">{content.heroText}</p>
      <div className="settle mt-8 flex flex-col gap-3 sm:flex-row [--i:3]">
        <Link href="/shop?category=new" className="flex h-12 items-center justify-center bg-terra px-6 text-sm tracking-[0.16em] text-cream">
          SHOP THE COLLECTION
        </Link>
        <Link href="/about" className="flex h-12 items-center justify-center border border-ink px-6 text-sm tracking-[0.16em]">
          OUR STORY
        </Link>
      </div>
    </div>
  );
}

export function SeasonBanner() {
  const content = siteContent(useStore().settings);
  return (
    <section className="mx-auto max-w-6xl px-4 py-12 md:px-6">
      <div className="relative">
        <img
          src={content.seasonImage.src}
          alt={content.seasonImage.alt}
          width={1584}
          height={672}
          className="aspect-[4/3] w-full object-cover object-left lg:aspect-[1584/672]"
        />
        <div className="mt-6 max-w-sm lg:absolute lg:inset-y-0 lg:right-0 lg:mt-0 lg:flex lg:w-[34%] lg:max-w-none lg:items-center lg:pr-8">
          <div>
            <p className="eyebrow text-muted">{content.seasonName}</p>
            <h2 className="serif mt-3 text-4xl leading-[1.05] md:text-5xl">New this season</h2>
            <p className="mt-4 text-sm leading-7 text-muted">{content.seasonText}</p>
            <Link href="/shop?category=new" className="mt-6 inline-flex h-12 items-center bg-terra px-6 text-sm tracking-[0.16em] text-cream">
              SHOP THE COLLECTION
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
