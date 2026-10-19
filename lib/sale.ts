export type SaleRules = {
  saleEnabled?: boolean;
  saleName?: string;
  salePercent?: number;
  saleStart?: string;
  saleEnd?: string;
};

export function salePercent(rules: SaleRules) {
  const percent = Math.round(Number(rules.salePercent));
  if (!Number.isFinite(percent)) return 0;
  return Math.min(90, Math.max(0, percent));
}

export function storeSaleActive(rules: SaleRules, today = new Date().toISOString().slice(0, 10)) {
  if (rules.saleEnabled !== true) return false;
  if (salePercent(rules) < 1) return false;
  if (rules.saleStart && today < rules.saleStart) return false;
  if (rules.saleEnd && today > rules.saleEnd) return false;
  return true;
}

export function applyStoreSale(basePrice: number, currentPrice: number, rules: SaleRules) {
  if (!storeSaleActive(rules)) return currentPrice;
  if (currentPrice < basePrice) return currentPrice;
  return Math.max(1, Math.round(basePrice * (1 - salePercent(rules) / 100)));
}

export function withStoreSale<T extends { price: number; basePrice: number }>(product: T, rules: SaleRules): T {
  const price = applyStoreSale(product.basePrice, product.price, rules);
  return price === product.price ? product : { ...product, price };
}
