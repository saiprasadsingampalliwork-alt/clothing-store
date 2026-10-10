import { Article } from "@/components/article";
import { brand } from "@/lib/brand";

export const metadata = { title: "Our story" };

export default function AboutPage() {
  return (
    <Article title="Our story">
      <p>
        Earthen is a small studio in Indiranagar, Bengaluru. We make eight pieces at a time: shirts, trousers, and layers you can wear on a Tuesday and still want on Sunday.
      </p>
      <p>
        The cloth is named on every piece. European linen is woven in Belgium. The cotton jersey and the cardigan are knitted in Tiruppur. The wool-cotton trouser uses cloth milled in Italy. Everything is cut and finished here, in short runs, so a colour can sell through without a warehouse of leftovers.
      </p>
      <p>
        The colours stay in the room you already have: olive, sand, clay, ink, and a little terracotta. Prices include GST. We ship across India from this studio, and we collect returns ourselves.
      </p>
      <p>
        Autumn / Winter 2026 is the first season. If you want to talk to a person, call {brand.phone} or write to {brand.email}. {brand.hours}.
      </p>
      <img
        src="/photos/stack.jpg"
        alt="A clay shirt, the moss cardigan, and terracotta trousers, folded on linen"
        width={1200}
        height={1500}
        className="mt-8 w-full object-cover"
      />
    </Article>
  );
}
