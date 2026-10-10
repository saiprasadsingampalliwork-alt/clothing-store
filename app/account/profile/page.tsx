"use client";

import { FormEvent, useState } from "react";
import { useStore, type Address } from "@/lib/store";

export default function ProfilePage() {
  const { user, updateProfile, saveAddress, removeAddress, usualSize, setUsualSize } = useStore();
  const [name, setName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [saved, setSaved] = useState(false);
  const [editing, setEditing] = useState(false);

  if (!user) return null;

  async function saveProfile(event: FormEvent) {
    event.preventDefault();
    await updateProfile({ name, phone });
    setSaved(true);
  }

  return (
    <div>
      <h1 className="serif text-4xl">Profile</h1>
      <form onSubmit={saveProfile} className="mt-6 max-w-md space-y-3">
        <label className="block text-sm">
          Name
          <input value={name} onChange={(event) => setName(event.target.value)} className="mt-1 h-12 w-full border border-line bg-paper px-3 outline-none" />
        </label>
        <label className="block text-sm">
          Email
          <input value={user.email} disabled className="mt-1 h-12 w-full border border-line bg-cream px-3 text-muted" />
        </label>
        <label className="block text-sm">
          Mobile
          <input value={phone} onChange={(event) => setPhone(event.target.value.replace(/\D/g, "").slice(0, 10))} className="mt-1 h-12 w-full border border-line bg-paper px-3 outline-none" />
        </label>
        <button className="h-12 bg-ink px-6 text-xs tracking-[0.16em] text-cream">SAVE PROFILE</button>
        {saved && <p className="text-sm text-muted">Saved.</p>}
      </form>

      <h2 className="serif mt-12 text-2xl">Usual size</h2>
      <p className="mt-2 max-w-md text-sm leading-6 text-muted">We will select this size when you open a piece. You can still change it.</p>
      <div className="mt-3 flex gap-2">
        {(["XS", "S", "M", "L", "XL"] as const).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setUsualSize(option)}
            className={`h-11 w-11 border text-sm ${usualSize === option ? "border-ink bg-ink text-cream" : "border-line"}`}
          >
            {option}
          </button>
        ))}
      </div>

      <h2 className="serif mt-12 text-2xl">Address book</h2>
      <ul className="mt-4 space-y-3">
        {user.addresses.map((address) => (
          <li key={address.id} className="border border-line p-4 text-sm">
            <p>
              {address.label}
              {address.isDefault ? " · Default" : ""}
            </p>
            <p className="mt-1 text-muted">
              {address.name}, {address.line1}, {address.city}, {address.state} {address.pin}
            </p>
            <div className="mt-3 flex gap-4">
              {!address.isDefault && (
                <button className="underline" onClick={() => void saveAddress({ ...address, isDefault: true })}>
                  Make default
                </button>
              )}
              <button className="underline" onClick={() => void removeAddress(address.id)}>
                Remove
              </button>
            </div>
          </li>
        ))}
      </ul>
      {editing ? (
        <AddressForm
          onCancel={() => setEditing(false)}
          onSave={(address) => {
            void saveAddress(address);
            setEditing(false);
          }}
        />
      ) : (
        <button className="mt-4 h-11 border border-ink px-4 text-xs tracking-[0.14em]" onClick={() => setEditing(true)}>
          ADD ADDRESS
        </button>
      )}
    </div>
  );
}

function AddressForm({ onSave, onCancel }: { onSave: (address: Address) => void; onCancel: () => void }) {
  const [form, setForm] = useState({ name: "", phone: "", line1: "", line2: "", city: "", state: "Karnataka", pin: "", label: "Home" });

  return (
    <form
      className="mt-4 grid max-w-md gap-3"
      onSubmit={(event) => {
        event.preventDefault();
        onSave({ ...form, id: `addr-${Date.now()}`, isDefault: false });
      }}
    >
      <div className="grid gap-3">
        {(
          [
            ["label", "Label"],
            ["name", "Full name"],
            ["phone", "Mobile"],
            ["line1", "Address"],
            ["line2", "Area"],
            ["city", "City"],
            ["pin", "PIN code"],
          ] as const
        ).map(([key, label]) => (
          <label key={key} className="block text-sm">
            {label}
            <input
              required={key !== "line2"}
              value={form[key]}
              onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))}
              className="mt-1 h-11 w-full border border-line bg-paper px-3 outline-none"
            />
          </label>
        ))}
      </div>
      <div className="flex gap-3">
        <button className="h-11 bg-ink px-4 text-xs tracking-[0.14em] text-cream">SAVE</button>
        <button type="button" onClick={onCancel} className="h-11 px-4 text-sm">
          Cancel
        </button>
      </div>
    </form>
  );
}
