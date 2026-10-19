"use client";

import { FormEvent, useEffect, useRef, useState, type ReactNode } from "react";
import { salePercent, storeSaleActive } from "@/lib/sale";
import { announcementCopy, announcementLink, useStore, type Banner, type StaffRole, type StoreSettings } from "@/lib/store";
import { AdminHeader, StatusPill, roleLabel } from "@/components/admin-shell";
import { Icon } from "@/components/icons";
import { ImageUpload } from "@/components/image-upload";
import { siteContent, type SiteContent, type SiteImage } from "@/lib/site";

export default function SettingsPage() {
  const { settings, saveSettings, staffList, inviteStaff, staff, ready, banners, saveBanner, removeBanner } = useStore();
  const [form, setForm] = useState<StoreSettings>(() => normalizeSettings({ ...settings, content: siteContent(settings) }));
  const [inviteOpen, setInviteOpen] = useState(false);
  const [bannerOpen, setBannerOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<StaffRole>("Order and support");
  const [banner, setBanner] = useState<Banner>({ id: "", title: "", subtitle: "", href: "/shop", starts: "", ends: "" });
  const [notice, setNotice] = useState<{ tone: "muted" | "saved" | "error"; text: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const savedForm = useRef("");
  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    if (!ready) return;
    const next = normalizeSettings({ ...settings, content: siteContent(settings) });
    setForm(next);
    savedForm.current = JSON.stringify(next);
  }, [ready]);

  const dirty = savedForm.current !== "" && JSON.stringify(form) !== savedForm.current;

  useEffect(() => {
    if (!savedForm.current || saving) return;
    setNotice((current) => {
      if (dirty) return { tone: "muted", text: "Unsaved changes" };
      if (current?.text === "Unsaved changes") return null;
      return current;
    });
  }, [dirty, saving]);

  async function save(event: FormEvent) {
    event.preventDefault();
    if (!dirty || saving) return;
    setSaving(true);
    try {
      await saveSettings(form);
      savedForm.current = JSON.stringify(form);
      setNotice({ tone: "saved", text: "Saved." });
    } catch (error) {
      setNotice({ tone: "error", text: error instanceof Error ? error.message : "Could not save these changes." });
    } finally {
      setSaving(false);
    }
  }

  async function invite() {
    if (!name.trim() || !email.trim()) {
      setNotice({ tone: "error", text: "Name and email are required." });
      return;
    }
    const error = await inviteStaff({ name, email, role });
    setNotice(error ? { tone: "error", text: error } : { tone: "saved", text: `${email} can sign in with password studio.` });
    if (!error) {
      setName("");
      setEmail("");
      setInviteOpen(false);
    }
  }

  async function addBanner() {
    if (!banner.title.trim()) {
      setNotice({ tone: "error", text: "A banner needs a title." });
      return;
    }
    await saveBanner({ ...banner, id: banner.id || `banner-${Date.now()}` });
    setBanner({ id: "", title: "", subtitle: "", href: "/shop", starts: "", ends: "" });
    setBannerOpen(false);
    setNotice({ tone: "saved", text: "Banner saved." });
  }

  const content = siteContent(form);
  function updateContent(patch: Partial<SiteContent>) {
    setForm({ ...form, content: { ...content, ...patch } });
  }

  return (
    <div>
      <div className="sticky top-16 z-20 -mx-5 border-b border-[#e6dfd4] bg-[#fbf8f4] px-5 py-3 md:top-0 md:-mx-10 md:px-10">
      <AdminHeader
        title="Settings"
        actions={
          <span className="flex items-center gap-3">
            {notice && (
              <span className={`max-w-[16rem] text-sm leading-5 ${notice.tone === "saved" ? "text-[#5b6043]" : notice.tone === "error" ? "text-[#ab6446]" : "text-[#8a847c]"}`}>
                {notice.text}
              </span>
            )}
            <button
              type="submit"
              form="settings"
              disabled={!dirty || saving}
              className={`h-9 px-3 text-[11px] tracking-[0.14em] text-[#fbf8f4] ${dirty && !saving ? "bg-[#2a2925]" : "cursor-not-allowed bg-[#2a2925]/35"}`}
            >
              {saving ? "SAVING" : "SAVE CHANGES"}
            </button>
          </span>
        }
      />
      </div>
      <form id="settings" onSubmit={save} className="mt-6 space-y-4">
      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4">
          <Card title="Announcement bar">
            <p className="mb-3 text-sm text-[#6d6960]">The olive strip at the top of the shop. Leave the message blank to use the shipping threshold and the return window.</p>
            <Toggle
              label="Show the bar"
              hint="Turn this off to hide it on the shop"
              on={form.announcementEnabled}
              onChange={(announcementEnabled) => setForm({ ...form, announcementEnabled })}
            />
            <div className="mt-4 grid gap-3">
              <Text label="Message" value={form.announcementText} maxLength={140} onChange={(announcementText) => setForm({ ...form, announcementText })} />
              <Text label="Link" value={form.announcementHref} onChange={(announcementHref) => setForm({ ...form, announcementHref })} />
              <p className="text-xs text-[#8a847c]">A path such as /shop, or a full https link. Leave the link blank for plain text.</p>
              {form.announcementHref.trim() && !announcementLink(form.announcementHref) && (
                <p className="text-sm text-[#ab6446]">That link needs to start with / or https://.</p>
              )}
              <p className="text-sm text-[#6d6960]">{form.announcementEnabled ? `The shop will show: ${announcementCopy(form)}` : "The bar is hidden."}</p>
            </div>
          </Card>
          <Card title="Store sale">
            <p className="mb-3 text-sm text-[#6d6960]">A percent off every piece that is not already on its own sale. The announcement bar stays as you wrote it.</p>
            <Toggle
              label="Run a store-wide sale"
              hint="Shop, bag, and checkout use this price"
              on={form.saleEnabled}
              onChange={(saleEnabled) => setForm({ ...form, saleEnabled })}
            />
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Text label="Sale name" value={form.saleName} maxLength={80} onChange={(saleName) => setForm({ ...form, saleName })} />
              <Field label="Percent off" value={form.salePercent} onChange={(salePercent) => setForm({ ...form, salePercent: Math.min(90, Math.max(0, salePercent)) })} />
              <label className="block text-sm">
                Starts
                <input type="date" value={form.saleStart} onChange={(event) => setForm({ ...form, saleStart: event.target.value })} className="mt-1 h-11 w-full border border-[#e6dfd4] px-3 outline-none" />
              </label>
              <label className="block text-sm">
                Ends
                <input type="date" value={form.saleEnd} onChange={(event) => setForm({ ...form, saleEnd: event.target.value })} className="mt-1 h-11 w-full border border-[#e6dfd4] px-3 outline-none" />
              </label>
            </div>
            <p className="mt-3 text-xs text-[#8a847c]">Percent can be from 1 to 90. Leave either date blank to keep the sale open on that side.</p>
            {form.saleStart && form.saleEnd && form.saleEnd < form.saleStart && (
              <p className="mt-2 text-sm text-[#ab6446]">The end date is earlier than the start date, so this sale will not run.</p>
            )}
            <p className="mt-2 text-sm text-[#6d6960]">
              {storeSaleActive(form)
                ? `${form.saleName.trim() || "This sale"} is live at ${salePercent(form)}% off.`
                : form.saleEnabled
                  ? "Saved, and waiting for a percent of at least 1 and dates that include today."
                  : "The sale is turned off. Listed prices stay as they are."}
            </p>
          </Card>
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
          <Card title="Studio address">
            <p className="mb-3 text-sm text-[#6d6960]">Shown in the footer, on the contact page, and on the invoice.</p>
            <div className="grid gap-3">
              <Text label="Legal name" value={content.legalName} onChange={(legalName) => updateContent({ legalName })} />
              <Text label="Address" value={content.address} onChange={(address) => updateContent({ address })} />
              <div className="grid gap-3 sm:grid-cols-2">
                <Text label="Phone" value={content.phone} onChange={(phone) => updateContent({ phone })} />
                <Text label="Email" value={content.email} onChange={(email) => updateContent({ email })} />
              </div>
              <Text label="Hours" value={content.hours} onChange={(hours) => updateContent({ hours })} />
            </div>
          </Card>
          <Card title="Homepage words">
            <div className="grid gap-3">
              <Text label="Season name" value={content.seasonName} onChange={(seasonName) => updateContent({ seasonName })} />
              <label className="block text-sm">
                Headline
                <textarea value={content.headline} onChange={(event) => updateContent({ headline: event.target.value })} className="mt-1 min-h-20 w-full border border-[#e6dfd4] p-3 outline-none" />
              </label>
              <p className="text-xs text-[#8a847c]">Put the second line of the headline on its own line.</p>
              <label className="block text-sm">
                Paragraph beside the headline
                <textarea value={content.heroText} onChange={(event) => updateContent({ heroText: event.target.value })} className="mt-1 min-h-20 w-full border border-[#e6dfd4] p-3 outline-none" />
              </label>
              <label className="block text-sm">
                Paragraph beside the season picture
                <textarea value={content.seasonText} onChange={(event) => updateContent({ seasonText: event.target.value })} className="mt-1 min-h-20 w-full border border-[#e6dfd4] p-3 outline-none" />
              </label>
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
      </div>
      <Pictures content={content} onChange={(next) => setForm({ ...form, content: next })} />
      </form>
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

function normalizeSettings(settings: StoreSettings): StoreSettings {
  return {
    ...settings,
    announcementEnabled: settings.announcementEnabled !== false,
    announcementText: settings.announcementText ?? "",
    announcementHref: settings.announcementHref ?? "",
    saleEnabled: settings.saleEnabled === true,
    saleName: settings.saleName ?? "",
    salePercent: Math.min(90, Math.max(0, Math.round(Number(settings.salePercent) || 0))),
    saleStart: settings.saleStart ?? "",
    saleEnd: settings.saleEnd ?? "",
  };
}

function Text({ label, value, onChange, maxLength }: { label: string; value: string; onChange: (value: string) => void; maxLength?: number }) {
  return (
    <label className="block text-sm">
      {label}
      <input value={value} maxLength={maxLength} onChange={(event) => onChange(event.target.value)} className="mt-1 h-11 w-full border border-[#e6dfd4] px-3 outline-none" />
    </label>
  );
}

const HERO_LIMIT = 6;

function Pictures({ content, onChange }: { content: SiteContent; onChange: (content: SiteContent) => void }) {
  function setHero(hero: SiteImage[]) {
    onChange({ ...content, hero: hero.length ? hero : content.hero });
  }

  const heroFull = content.hero.length >= HERO_LIMIT;

  return (
    <section className="border border-[#e6dfd4] bg-white p-5">
      <h2 className="text-sm font-medium">Pictures</h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6d6960]">JPEG, PNG, or WebP, under 6 MB. A new photo stays on this page until you press Save changes. Saved appears beside that button.</p>
      <div className="mt-6 space-y-8">
        <div>
          <div className="flex items-baseline justify-between gap-3">
            <h3 className="text-sm">Homepage hero</h3>
            <p className="text-xs tracking-[0.12em] text-[#8a847c]">
              {content.hero.length} of {HERO_LIMIT}
            </p>
          </div>
          <p className="mt-1 max-w-xl text-sm leading-6 text-[#6d6960]">These play beside the headline. The first photograph shows first. Portrait, about 4:5.</p>
          <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 xl:grid-cols-4">
            {content.hero.map((frame, index) => (
              <li key={`${frame.src}-${index}`} className="relative min-w-0 border border-[#e6dfd4] bg-[#fbf8f4]">
                <img src={frame.src} alt="" className="aspect-[4/5] w-full object-cover" />
                <button
                  type="button"
                  aria-label={`Remove photograph ${index + 1}`}
                  disabled={content.hero.length === 1}
                  className="absolute right-2 top-2 grid h-8 w-8 place-items-center border border-[#e6dfd4] bg-[#fbf8f4] text-[#ab6446] disabled:opacity-40"
                  onClick={() => setHero(content.hero.filter((_, itemIndex) => itemIndex !== index))}
                >
                  <Icon name="trash" className="h-4 w-4" />
                </button>
                <div className="flex items-center gap-2 px-2 py-2">
                  <span className="text-xs text-[#8a847c]">{index + 1}</span>
                  <div className="min-w-0 flex-1">
                    <ImageUpload fill label="REPLACE" onUploaded={(src) => setHero(content.hero.map((item, itemIndex) => (itemIndex === index ? { ...item, src } : item)))} />
                  </div>
                </div>
              </li>
            ))}
            <li>
              {heroFull ? (
                <p className="flex aspect-[4/5] items-center border border-dashed border-[#c4bfb6] px-4 text-sm leading-6 text-[#6d6960]">
                  This row holds {HERO_LIMIT} photographs. Remove one before adding another.
                </p>
              ) : (
                <ImageUpload
                  layout="frame"
                  label="Add a photograph"
                  hint={`${HERO_LIMIT - content.hero.length} still open`}
                  onUploaded={(src) => setHero([...content.hero, { src, alt: "Homepage photograph" }])}
                />
              )}
            </li>
          </ul>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <Still
            title="Sign-in photograph"
            note="The panel beside the sign-in form."
            image={content.loginImage}
            frame="aspect-[4/5] max-h-80"
            onChange={(loginImage) => onChange({ ...content, loginImage })}
          />
          <Still
            title="Season banner"
            note="The wide photograph in the season block. About 1600 × 680."
            image={content.seasonImage}
            frame="aspect-[2.4/1]"
            onChange={(seasonImage) => onChange({ ...content, seasonImage })}
          />
        </div>
        <div>
          <h3 className="text-sm">Women, Men, Unisex</h3>
          <p className="mt-1 text-sm leading-6 text-[#6d6960]">Portrait, about 3:4. The line under each name is the caption on the homepage.</p>
          <ul className="mt-4 grid gap-4 sm:grid-cols-3">
            {content.audiences.map((audience) => (
              <li key={audience.id} className="border border-[#e6dfd4] bg-[#fbf8f4]">
                <img src={audience.image.src} alt="" className="aspect-[3/4] w-full object-cover" />
                <div className="space-y-3 p-3">
                  <p className="text-sm capitalize">{audience.id}</p>
                  <label className="block text-xs text-[#6d6960]">
                    Caption
                    <input
                      value={audience.text}
                      onChange={(event) =>
                        onChange({
                          ...content,
                          audiences: content.audiences.map((item) => (item.id === audience.id ? { ...item, text: event.target.value } : item)),
                        })
                      }
                      className="mt-1 h-11 w-full border border-[#e6dfd4] bg-white px-3 text-sm text-[#2a2925] outline-none"
                      aria-label={`${audience.id} caption`}
                    />
                  </label>
                  <ImageUpload
                    label="REPLACE"
                    onUploaded={(src) =>
                      onChange({
                        ...content,
                        audiences: content.audiences.map((item) => (item.id === audience.id ? { ...item, image: { ...item.image, src } } : item)),
                      })
                    }
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function Still({ title, note, image, frame, onChange }: { title: string; note: string; image: SiteImage; frame: string; onChange: (image: SiteImage) => void }) {
  return (
    <div className="border border-[#e6dfd4] bg-[#fbf8f4]">
      <img src={image.src} alt="" className={`${frame} w-full object-cover`} />
      <div className="flex items-end justify-between gap-4 p-3">
        <div>
          <h3 className="text-sm">{title}</h3>
          <p className="mt-1 text-sm leading-6 text-[#6d6960]">{note}</p>
        </div>
        <ImageUpload label="REPLACE" onUploaded={(src) => onChange({ ...image, src })} />
      </div>
    </div>
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
