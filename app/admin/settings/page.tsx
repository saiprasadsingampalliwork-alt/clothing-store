"use client";

import { FormEvent, useEffect, useState, type ReactNode } from "react";
import { useStore, type Banner, type StaffRole, type StoreSettings } from "@/lib/store";
import { AdminHeader, StatusPill, roleLabel } from "@/components/admin-shell";

export default function SettingsPage() {
  const { settings, saveSettings, staffList, inviteStaff, staff, ready, banners, saveBanner, removeBanner } = useStore();
  const [form, setForm] = useState<StoreSettings>(settings);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [bannerOpen, setBannerOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<StaffRole>("Order and support");
  const [banner, setBanner] = useState<Banner>({ id: "", title: "", subtitle: "", href: "/shop", starts: "", ends: "" });
  const [message, setMessage] = useState<string | null>(null);
  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    if (ready) setForm(settings);
  }, [ready]);

  async function save(event: FormEvent) {
    event.preventDefault();
    await saveSettings(form);
    setMessage("Changes saved. Checkout uses these rules.");
  }

  async function invite() {
    if (!name.trim() || !email.trim()) {
      setMessage("Name and email are required.");
      return;
    }
    const error = await inviteStaff({ name, email, role });
    setMessage(error ?? `${email} can sign in with password studio.`);
    if (!error) {
      setName("");
      setEmail("");
      setInviteOpen(false);
    }
  }

  async function addBanner() {
    if (!banner.title.trim()) {
      setMessage("A banner needs a title.");
      return;
    }
    await saveBanner({ ...banner, id: banner.id || `banner-${Date.now()}` });
    setBanner({ id: "", title: "", subtitle: "", href: "/shop", starts: "", ends: "" });
    setBannerOpen(false);
    setMessage("Banner saved.");
  }

  return (
    <div>
      <AdminHeader
        title="Settings"
        actions={
          <button form="settings" className="h-9 bg-[#2a2925] px-3 text-[11px] tracking-[0.14em] text-[#fbf8f4]">
            SAVE CHANGES
          </button>
        }
      />
      <form id="settings" onSubmit={save} className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4">
          <Card title="Shipping">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Free shipping above (₹)" value={form.freeShippingAt} onChange={(value) => setForm({ ...form, freeShippingAt: value })} />
              <Field label="Standard rate (₹)" value={form.standardShipping} onChange={(value) => setForm({ ...form, standardShipping: value })} />
              <Field label="Express rate (₹)" value={form.expressShipping} onChange={(value) => setForm({ ...form, expressShipping: value })} />
              <label className="block text-sm">
                Standard delivery estimate
                <input value={form.deliveryEstimate} onChange={(event) => setForm({ ...form, deliveryEstimate: event.target.value })} className="mt-1 h-11 w-full border border-[#e6dfd4] px-3 outline-none" />
              </label>
            </div>
          </Card>
          <Card title="Cash on delivery">
            <Toggle
              label="Enable cash on delivery"
              hint="Customers can pay when the order arrives"
              on={form.codEnabled}
              onChange={(value) => setForm({ ...form, codEnabled: value })}
            />
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Field label="Maximum order value (₹)" value={form.codMax} onChange={(value) => setForm({ ...form, codMax: value })} />
              <Field label="COD fee (₹)" value={form.codFee} onChange={(value) => setForm({ ...form, codFee: value })} />
            </div>
          </Card>
          <Card title="Returns and exchanges">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Return window (days)" value={form.returnWindowDays} onChange={(value) => setForm({ ...form, returnWindowDays: value })} />
              <label className="block text-sm">
                Refund method
                <input value={form.refundMethod} onChange={(event) => setForm({ ...form, refundMethod: event.target.value })} className="mt-1 h-11 w-full border border-[#e6dfd4] px-3 outline-none" />
              </label>
            </div>
            <div className="mt-4">
              <Toggle label="Allow exchanges" hint="Customers can swap for another size" on={form.exchanges} onChange={(value) => setForm({ ...form, exchanges: value })} />
            </div>
          </Card>
          <Card title="Tax and invoices">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block text-sm">
                Business name
                <input value={form.businessName} onChange={(event) => setForm({ ...form, businessName: event.target.value })} className="mt-1 h-11 w-full border border-[#e6dfd4] px-3 outline-none" />
              </label>
              <label className="block text-sm">
                GSTIN
                <input value={form.gstin} onChange={(event) => setForm({ ...form, gstin: event.target.value })} placeholder="Enter GSTIN" className="mt-1 h-11 w-full border border-[#e6dfd4] px-3 outline-none" />
              </label>
            </div>
            <div className="mt-4">
              <Toggle label="Prices include GST" hint="Show tax-inclusive prices on the storefront" on={form.pricesIncludeGst} onChange={(value) => setForm({ ...form, pricesIncludeGst: value })} />
            </div>
          </Card>
        </div>
        <div className="space-y-4">
          <section className="border border-[#e6dfd4] bg-white p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium">Staff and roles</h2>
              {staff?.role === "Owner" && (
                <button type="button" className="text-sm text-[#ab6446]" onClick={() => setInviteOpen((value) => !value)}>
                  + Invite staff
                </button>
              )}
            </div>
            <table className="mt-4 w-full text-left text-sm">
              <thead className="text-[11px] tracking-[0.14em] text-[#8a847c]">
                <tr>
                  <th className="py-2 font-medium">NAME</th>
                  <th className="font-medium">ROLE</th>
                  <th className="font-medium">STATUS</th>
                </tr>
              </thead>
              <tbody>
                {staffList.map((member) => (
                  <tr key={member.id} className="border-t border-[#efeae2]">
                    <td className="py-3">{member.name}</td>
                    <td>{roleLabel(member.role)}</td>
                    <td>
                      <StatusPill status="Active" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {inviteOpen && (
              <div className="mt-4 grid gap-2">
                <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Name" className="h-11 border border-[#e6dfd4] px-3 outline-none" />
                <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email" className="h-11 border border-[#e6dfd4] px-3 outline-none" />
                <select value={role} onChange={(event) => setRole(event.target.value as StaffRole)} className="h-11 border border-[#e6dfd4] px-2">
                  <option>Owner</option>
                  <option>Catalog manager</option>
                  <option>Order and support</option>
                </select>
                <button type="button" onClick={invite} className="h-10 border border-[#2a2925] text-[11px] tracking-[0.14em]">
                  SEND INVITE
                </button>
              </div>
            )}
          </section>
          <section className="border border-[#e6dfd4] bg-white p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium">Homepage banners</h2>
              <button type="button" className="text-sm text-[#ab6446]" onClick={() => setBannerOpen((value) => !value)}>
                + Add banner
              </button>
            </div>
            <ul className="mt-4 space-y-3">
              {banners.map((item) => {
                const live = (!item.starts || today >= item.starts) && (!item.ends || today <= item.ends);
                return (
                  <li key={item.id} className="flex items-center justify-between gap-3 text-sm">
                    <span className="flex items-center gap-3">
                      <span className="h-8 w-8 bg-[#d4b89a]" />
                      <span>{item.title}</span>
                      <button type="button" className="ml-2 text-xs text-[#8a847c]" onClick={() => void removeBanner(item.id)}>
                        Remove
                      </button>
                    </span>
                    <StatusPill status={live ? "Live" : "Scheduled"} />
                  </li>
                );
              })}
            </ul>
            {bannerOpen && (
              <div className="mt-4 grid gap-2">
                <input value={banner.title} onChange={(event) => setBanner({ ...banner, title: event.target.value })} placeholder="Title" className="h-11 border border-[#e6dfd4] px-3 outline-none" />
                <input value={banner.subtitle} onChange={(event) => setBanner({ ...banner, subtitle: event.target.value })} placeholder="Subtitle" className="h-11 border border-[#e6dfd4] px-3 outline-none" />
                <input type="date" value={banner.starts} onChange={(event) => setBanner({ ...banner, starts: event.target.value })} className="h-11 border border-[#e6dfd4] px-2" />
                <input type="date" value={banner.ends} onChange={(event) => setBanner({ ...banner, ends: event.target.value })} className="h-11 border border-[#e6dfd4] px-2" />
                <button type="button" onClick={addBanner} className="h-10 border border-[#2a2925] text-[11px] tracking-[0.14em]">
                  SAVE BANNER
                </button>
              </div>
            )}
          </section>
        </div>
      </form>
      {message && <p className="mt-4 text-sm">{message}</p>}
    </div>
  );
}

function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border border-[#e6dfd4] bg-white p-5">
      <h2 className="text-sm font-medium">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Field({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <label className="block text-sm">
      {label}
      <input type="number" min={0} value={value} onChange={(event) => onChange(Number(event.target.value))} className="mt-1 h-11 w-full border border-[#e6dfd4] px-3 outline-none" />
    </label>
  );
}

function Toggle({ label, hint, on, onChange }: { label: string; hint: string; on: boolean; onChange: (value: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span>
        <span className="block text-sm">{label}</span>
        <span className="block text-xs text-[#6d6960]">{hint}</span>
      </span>
      <button type="button" onClick={() => onChange(!on)} aria-pressed={on} className={`relative h-6 w-11 rounded-full ${on ? "bg-[#5b6043]" : "bg-[#d9d3c8]"}`}>
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white ${on ? "left-5" : "left-0.5"}`} />
      </button>
    </div>
  );
}
