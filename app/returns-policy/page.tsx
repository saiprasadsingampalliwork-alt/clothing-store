import Link from "next/link";
import { Article } from "@/components/article";

export const metadata = { title: "Returns" };

export default function ReturnsPolicy() {
  return (
    <Article title="Returns and exchanges">
      <p>You have 7 days from delivery. The piece should be unworn, unwashed, and with its tags. We collect it from the address on the order. You do not pack a courier slip.</p>
      <p>Tell us whether you want a refund or a different size or colour. Refunds go back to the original payment. Cash on delivery is refunded to the bank account you share with us, within 5 working days of the piece reaching the studio.</p>
      <p>Start from the order page once it says Delivered, or write to hello@earthen.in with the order number.</p>
      <p>
        <Link href="/contact" className="underline">
          Contact the studio
        </Link>
      </p>
    </Article>
  );
}
