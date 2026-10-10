import { Suspense } from "react";
import { ShopView } from "@/components/shop-view";

export const metadata = { title: "Shop" };

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="px-4 py-16 text-sm text-muted">Loading the collection…</div>}>
      <ShopView />
    </Suspense>
  );
}
