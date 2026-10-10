import type { Order, StaffRole } from "@/lib/store";
import { includedGst } from "@/lib/money";

export function canAccess(role: StaffRole, path: string) {
  if (path === "/admin/login" || path === "/admin") return true;
  if (role === "Owner") return true;
  const catalog = ["/admin/products", "/admin/coupons"];
  const desk = ["/admin/orders", "/admin/returns", "/admin/customers", "/admin/reports"];
  const allowed = role === "Catalog manager" ? catalog : desk;
  return allowed.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
}

export function dayKey(iso: string) {
  return iso.slice(0, 10);
}

export function salesByDay(orders: Order[], days = 7) {
  return Array.from({ length: days }, (_, index) => {
    const date = new Date();
    date.setHours(12, 0, 0, 0);
    date.setDate(date.getDate() - (days - 1 - index));
    const key = date.toISOString().slice(0, 10);
    const total = orders
      .filter((order) => order.status !== "Cancelled" && dayKey(order.createdAt) === key)
      .reduce((sum, order) => sum + order.total, 0);
    return { key, label: date.toLocaleDateString("en-IN", { weekday: "short" }), total };
  });
}

export function gstSplit(order: Order) {
  let cgst = 0;
  let sgst = 0;
  let igst = 0;
  let taxable = 0;
  const same = order.address.state === "Karnataka";
  for (const item of order.items) {
    const gst = includedGst(item.price);
    const tax = gst.tax * item.quantity;
    taxable += gst.taxable * item.quantity;
    if (same) {
      const half = Math.round(tax / 2);
      cgst += half;
      sgst += tax - half;
    } else {
      igst += tax;
    }
  }
  return { taxable, cgst, sgst, igst };
}

export function downloadCsv(filename: string, rows: string[][]) {
  const csv = rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function sku(slug: string, color: string, size: string) {
  return `${catalogSku(slug)}-${color.slice(0, 2).toUpperCase()}-${size}`;
}

export function catalogSku(slug: string) {
  return `EA-${slug
    .split("-")
    .map((part) => part[0] ?? "")
    .join("")
    .toUpperCase()}`;
}

export function orderCode(number: string) {
  const bare = number.replace(/^#/, "").replace(/^EH-/, "EA-");
  return bare.startsWith("EA-") ? `#${bare}` : `#EA-${bare}`;
}

export function paymentLabel(method: string) {
  const key = method.toLowerCase();
  if (key === "upi") return "UPI · Paid";
  if (key === "card") return "Card · Paid";
  if (key === "cod") return "COD";
  if (key.includes("net")) return "Net banking · Paid";
  return method;
}

export function shortDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export function placedAt(iso: string) {
  const date = new Date(iso);
  const day = date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  const time = date.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true }).toLowerCase();
  return `${day}, ${time}`;
}

export function compactINR(amount: number) {
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)} L`;
  if (amount >= 1000) return `₹${Math.round(amount / 1000)}k`;
  return `₹${amount}`;
}
