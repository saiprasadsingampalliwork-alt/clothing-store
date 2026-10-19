"use client";

import { Suspense } from "react";
import { ShopView } from "@/components/shop-view";

function Results() {
  return <ShopView path="/search" />;
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="px-4 py-16 text-sm text-muted">Loading search…</div>}>
      <Results />
    </Suspense>
  );
}
