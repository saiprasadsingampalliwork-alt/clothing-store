import { Article } from "@/components/article";

export const metadata = { title: "Shipping" };

export default function ShippingPolicy() {
  return (
    <Article title="Shipping">
      <p>We ship across India from one studio. Standard delivery is free on orders of ₹1,999 and above, and ₹99 below that. It usually arrives in 3–5 days.</p>
      <p>Express delivery is ₹149 and usually arrives in 1–2 days. Enter your PIN code at checkout. We confirm the PIN is serviceable before payment.</p>
      <p>You will get a tracking link once the parcel is handed to the courier.</p>
    </Article>
  );
}
