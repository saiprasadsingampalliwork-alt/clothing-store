import Link from "next/link";
import { Icon, type IconName } from "@/components/icons";
import { HeroCarousel } from "@/components/hero-carousel";
import { NewArrivals } from "@/components/new-arrivals";
import { RecentShelf } from "@/components/recent-shelf";
import { CategoryStrip } from "@/components/category-strip";
import { AudienceBand, HeroIntro, SeasonBanner } from "@/components/home-media";

const promises: { title: string; text: string; icon: IconName }[] = [
  { title: "Free shipping", text: "On orders over ₹1,999", icon: "truck" },
  { title: "7-day returns", text: "We collect it from you", icon: "returns" },
  { title: "Cash on delivery", text: "Available across India", icon: "card" },
  { title: "Secure payments", text: "UPI, cards, net banking", icon: "lock" },
];

export default function HomePage() {
  return (
    <div>
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 md:grid-cols-2 md:gap-16 md:px-6 md:py-20">
        <HeroIntro />
        <HeroCarousel />
      </section>

      <AudienceBand />

      <CategoryStrip />

      <SeasonBanner />

      <section className="mx-auto max-w-6xl px-4 py-12 md:px-6">
        <h2 className="serif text-3xl">New arrivals</h2>
        <NewArrivals />
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
              <Icon name={item.icon} className="h-5 w-5 text-cream" />
              <p className="mt-3 text-sm">{item.title}</p>
              <p className="mt-1 text-sm leading-6 text-cream/75">{item.text}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
