"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { Icon } from "@/components/icons";
import { canAccess, orderCode, paymentLabel, shortDate } from "@/lib/admin";
import { formatINR } from "@/lib/money";
import { useStore, type StaffRole } from "@/lib/store";

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/returns", label: "Returns" },
  { href: "/admin/customers", label: "Customers" },
  { href: "/admin/coupons", label: "Coupons" },
  { href: "/admin/reports", label: "Reports" },
  { href: "/admin/settings", label: "Settings" },
];

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { staff, ready, staffSignOut } = useStore();
  const [menu, setMenu] = useState(false);

  useEffect(() => {
    if (!ready || pathname === "/admin/login" || staff) return;
    router.replace("/admin/login");
  }, [ready, staff, pathname, router]);

  useEffect(() => {
    setMenu(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = menu ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menu]);

  if (!ready) return <div className="min-h-screen bg-[#fbf8f4]" />;
  if (pathname === "/admin/login") return <>{children}</>;
  if (pathname.endsWith("/label")) return <div className="min-h-screen bg-white">{children}</div>;
  if (!staff) return <div className="min-h-screen bg-[#fbf8f4]" />;

  const allowed = canAccess(staff.role, pathname);
  const visible = links.filter((link) => canAccess(staff.role, link.href));

  return (
    <div className="min-h-screen bg-[#fbf8f4] md:grid md:grid-cols-[216px_1fr]">
      <aside className="hidden bg-[#2a2925] text-[#f3efe8] md:block md:min-h-screen">
        <div className="px-6 pb-4 pt-8">
          <p className="text-[13px] tracking-[0.28em]">EARTHEN</p>
          <p className="mt-1 text-[10px] tracking-[0.22em] text-[#f3efe8]/55">ADMIN</p>
        </div>
        <nav className="space-y-1 px-3 pb-6">
          {visible.map((link) => {
            const active = link.href === "/admin" ? pathname === "/admin" : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`block whitespace-nowrap rounded-sm px-3 py-2 text-[14px] ${active ? "bg-[#5b6043] text-[#fbf8f4]" : "text-[#e7e1d4]/90 hover:text-[#fbf8f4]"}`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <header className="sticky top-0 z-30 border-b border-[#e6dfd4] bg-[#fbf8f4] md:hidden">
        <div className="relative flex h-16 items-center px-4">
          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center"
            aria-label="Open menu"
            onClick={() => setMenu(true)}
          >
            <span className="flex w-5 flex-col gap-1.5">
              <span className="h-px bg-[#2a2925]" />
              <span className="h-px bg-[#2a2925]" />
              <span className="h-px bg-[#2a2925]" />
            </span>
          </button>
          <p className="absolute left-1/2 -translate-x-1/2 text-[15px] tracking-[0.32em] text-[#2a2925]">EARTHEN</p>
          <button
            type="button"
            onClick={staffSignOut}
            title="Sign out"
            className="ml-auto grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#5b6043] text-sm text-[#fbf8f4]"
          >
            {staff.name.slice(0, 1)}
          </button>
        </div>
        {menu && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-[#f7f4ee]">
            <div className="flex h-16 items-center justify-between border-b border-[#e4ddd2] px-4">
              <span className="tracking-[0.32em] text-[#2a2925]">EARTHEN</span>
              <button type="button" className="flex h-11 w-11 items-center justify-center" onClick={() => setMenu(false)} aria-label="Close menu">
                <Icon name="close" />
              </button>
            </div>
            <nav className="flex flex-col px-6 py-6 text-2xl serif">
              {visible.map((link, index) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="menu-link border-b border-[#e4ddd2] py-4 text-[#2a2925] last:border-0"
                  style={{ ["--i" as string]: index }}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </header>
      <div className="min-w-0 px-5 py-6 md:px-10 md:py-8">
        {allowed ? children : (
          <>
            <AdminHeader title="Studio" />
            <p className="mt-8 text-sm text-[#6d6960]">Your role does not open this page.</p>
          </>
        )}
      </div>
    </div>
  );
}

export function AdminHeader({ title, actions }: { title: string; actions?: ReactNode }) {
  const { staff, staffSignOut } = useStore();
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <h1 className="serif text-[28px] leading-none text-[#2a2925] sm:text-[32px]">{title}</h1>
      <div className="flex flex-wrap items-center gap-3">
        {actions}
        {staff && (
          <button
            type="button"
            onClick={staffSignOut}
            title="Sign out"
            className="hidden h-9 w-9 shrink-0 place-items-center rounded-full bg-[#5b6043] text-sm text-[#fbf8f4] md:grid"
          >
            {staff.name.slice(0, 1)}
          </button>
        )}
      </div>
    </div>
  );
}

export function OutlineButton({ children, onClick, type = "button" }: { children: ReactNode; onClick?: () => void; type?: "button" | "submit" }) {
  return (
    <button type={type} onClick={onClick} className="h-9 border border-[#2a2925] bg-white px-3 text-[11px] tracking-[0.14em] text-[#2a2925]">
      {children}
    </button>
  );
}

export function SolidButton({ children, onClick, type = "button" }: { children: ReactNode; onClick?: () => void; type?: "button" | "submit" }) {
  return (
    <button type={type} onClick={onClick} className="h-9 bg-[#2a2925] px-3 text-[11px] tracking-[0.14em] text-[#fbf8f4]">
      {children}
    </button>
  );
}

export function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-8 px-3 text-sm ${active ? "bg-[#2a2925] text-[#fbf8f4]" : "border border-[#e6dfd4] bg-white text-[#2a2925]"}`}
    >
      {children}
    </button>
  );
}

export function Showing({ shown, total, noun }: { shown: number; total: number; noun: string }) {
  return (
    <p className="px-5 py-3 text-xs text-[#6d6960]">
      Showing {shown} of {total} {noun}
    </p>
  );
}

export function StatusPill({ status }: { status: string }) {
  const key = status.toLowerCase();
  const tone =
    key === "shipped" || key === "requested" || key === "awaiting review" || key === "return requested"
      ? "bg-[#ab6446] text-[#fbf8f4]"
      : key === "confirmed"
        ? "bg-[#2a2925] text-[#fbf8f4]"
        : key === "packed" || key === "active" || key === "live"
          ? "bg-[#8d9174] text-[#fbf8f4]"
          : key === "delivered" || key === "approved" || key === "returned"
            ? "bg-[#5b6043] text-[#fbf8f4]"
            : key === "scheduled" || key === "invited"
              ? "bg-[#c4b49a] text-[#2a2925]"
              : "bg-[#6d6960] text-[#fbf8f4]";
  const label =
    key === "awaiting review" || key === "return requested"
      ? "REQUESTED"
      : key === "active"
        ? "ACTIVE"
        : key === "draft"
          ? "DRAFT"
          : key === "archived"
            ? "ARCHIVED"
            : key === "live"
              ? "LIVE"
              : status.toUpperCase();
  return <span className={`inline-block px-2 py-1 text-[10px] tracking-[0.12em] ${tone}`}>{label}</span>;
}

export function roleLabel(role: StaffRole) {
  if (role === "Owner") return "Admin";
  return role;
}

export function OrdersTable({
  orders,
  showDate = false,
  linked = true,
}: {
  orders: { id: string; number: string; createdAt?: string; address: { name: string }; items: { quantity: number }[]; total: number; payment: string; status: string }[];
  showDate?: boolean;
  linked?: boolean;
}) {
  return (
    <>
    <ul className="divide-y divide-[#efeae2] md:hidden">
      {orders.map((order) => {
        const count = order.items.reduce((sum, item) => sum + item.quantity, 0);
        const body = (
          <>
            <span className="flex items-center justify-between gap-3">
              <span>{orderCode(order.number)}</span>
              <StatusPill status={order.status} />
            </span>
            <span className="mt-1 block text-[#6d6960]">
              {order.address.name}
              {showDate && order.createdAt ? ` · ${shortDate(order.createdAt)}` : ""}
            </span>
            <span className="mt-1 block text-[#6d6960]">
              {count} {count === 1 ? "item" : "items"} · {formatINR(order.total)} · {paymentLabel(order.payment)}
            </span>
          </>
        );
        return (
          <li key={order.id} className="px-4 py-4 text-sm sm:px-5">
            {linked ? (
              <Link href={`/admin/orders/${order.id}`} className="block text-[#2a2925]">
                {body}
              </Link>
            ) : (
              body
            )}
          </li>
        );
      })}
    </ul>
    <div className="hidden overflow-auto md:block">
      <table className="w-full min-w-[760px] text-left text-sm">
        <thead className="text-[11px] tracking-[0.14em] text-[#8a847c]">
          <tr className="border-y border-[#e6dfd4]">
            <th className="px-5 py-3 font-medium">ORDER</th>
            {showDate && <th className="py-3 font-medium">DATE</th>}
            <th className="py-3 font-medium">CUSTOMER</th>
            <th className="py-3 font-medium">ITEMS</th>
            <th className="py-3 font-medium">TOTAL</th>
            <th className="py-3 font-medium">PAYMENT</th>
            <th className="px-5 py-3 font-medium">STATUS</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className="border-b border-[#efeae2]">
              <td className="px-5 py-3">
                {linked ? (
                  <Link href={`/admin/orders/${order.id}`} className="text-[#2a2925]">
                    {orderCode(order.number)}
                  </Link>
                ) : (
                  <span>{orderCode(order.number)}</span>
                )}
              </td>
              {showDate && <td className="text-[#6d6960]">{order.createdAt ? shortDate(order.createdAt) : ""}</td>}
              <td>{order.address.name}</td>
              <td>{order.items.reduce((sum, item) => sum + item.quantity, 0)}</td>
              <td>{formatINR(order.total)}</td>
              <td>{paymentLabel(order.payment)}</td>
              <td className="px-5 py-3">
                <StatusPill status={order.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    </>
  );
}
