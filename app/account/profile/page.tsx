"use client";

import { FormEvent, useState } from "react";
import { AddressFields, addressProblem, emptyAddressDraft, type AddressDraft, type PinStatus } from "@/components/address-fields";
import { canonicalState, offStates } from "@/lib/india";
import { useStore, type Address } from "@/lib/store";

export default function ProfilePage() {
  const { user, updateProfile, saveAddress, removeAddress, usualSize, setUsualSize, settings } = useStore();
  const off = offStates(settings);
  // "new", the id of the address being edited, or null.
  const [addressEditing, setEditing] = useState<string | null>(null);
  const [name, setName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [saved, setSaved] = useState(false);
  const [reminderNote, setReminderNote] = useState<string | null>(null);

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

      <h2 className="serif mt-12 text-2xl">WhatsApp reminders</h2>
      <label className="mt-3 flex max-w-md items-start gap-3 text-sm leading-6">
        <input
          type="checkbox"
          checked={Boolean(user.whatsappOptIn)}
          onChange={(event) => {
            const on = event.target.checked;
            setReminderNote(null);
            updateProfile({ whatsappOptIn: on })
              .then(() => setReminderNote(on ? "Reminders are on." : "Reminders are off."))
              .catch(() => setReminderNote("That did not save. Try again in a moment."));
          }}
          className="mt-1.5 h-4 w-4"
        />
        <span>
          Remind me on WhatsApp about pieces left in my bag or wishlist.
          <span className="block text-muted">You can also reply STOP to any reminder. Order updates are sent either way.</span>
        </span>
      </label>
      {reminderNote && <p className="mt-2 text-sm text-muted" role="status">{reminderNote}</p>}

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
              {address.name}, {[address.line1, address.line2, address.landmark && `near ${address.landmark}`, address.city].filter(Boolean).join(", ")}, {address.state} {address.pin}
            </p>
            {off.has(canonicalState(address.state)) && <p className="mt-1 text-terra">We don't deliver to {canonicalState(address.state)} yet.</p>}
            <div className="mt-3 flex gap-4">
              <button className="underline" onClick={() => setEditing(address.id)}>
                Edit
              </button>
              {!address.isDefault && (
                <button className="underline" onClick={() => void saveAddress({ ...address, isDefault: true }).catch(() => setEditing(address.id))}>
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
      {addressEditing ? (
        <AddressForm
          key={addressEditing}
          initial={user.addresses.find((address) => address.id === addressEditing)}
          off={off}
          onCancel={() => setEditing(null)}
          onSave={async (address) => {
            await saveAddress(address);
            setEditing(null);
          }}
        />
      ) : (
        <button className="mt-4 h-11 border border-ink px-4 text-xs tracking-[0.14em]" onClick={() => setEditing("new")}>
          ADD ADDRESS
        </button>
      )}
    </div>
  );
}

const LABELS = ["Home", "Work", "Other"];

function AddressForm({
  initial,
  off,
  onSave,
  onCancel,
}: {
  initial?: Address;
  off: Set<string>;
  onSave: (address: Address) => Promise<void>;
  onCancel: () => void;
}) {
  const [draft, setDraft] = useState<AddressDraft>({
    ...emptyAddressDraft,
    ...(initial ? { ...initial, landmark: initial.landmark ?? "", state: canonicalState(initial.state) } : {}),
  });
  const [label, setLabel] = useState(initial?.label ?? "Home");
  const [isDefault, setIsDefault] = useState(initial?.isDefault ?? false);
  const [status, setStatus] = useState<PinStatus>({ state: "idle" });
  const [problem, setProblem] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    const issue = addressProblem(draft, status, off, false);
    if (issue) {
      setProblem(issue);
      return;
    }
    setSaving(true);
    setProblem(null);
    try {
      await onSave({ ...draft, label: label.trim() || "Home", isDefault, id: initial?.id ?? `addr-${Date.now()}` });
    } catch (error) {
      setProblem(error instanceof Error ? error.message : "That address could not be saved.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="mt-4 grid max-w-xl gap-4 border border-line p-4" onSubmit={(event) => void submit(event)}>
      <div className="text-sm">
        Save as
        <div className="mt-1 flex flex-wrap gap-2">
          {LABELS.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setLabel(option)}
              className={`h-9 border px-3 ${label === option ? "border-ink bg-ink text-cream" : "border-line"}`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
      <AddressFields value={draft} onChange={setDraft} off={off} onStatus={setStatus} />
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={isDefault} onChange={(event) => setIsDefault(event.target.checked)} className="h-4 w-4" />
        Use as my default address
      </label>
      {problem && <p className="text-sm text-terra" role="alert">{problem}</p>}
      <div className="flex gap-3">
        <button disabled={saving} className="h-11 bg-ink px-4 text-xs tracking-[0.14em] text-cream disabled:opacity-60">
          {saving ? "SAVING" : initial ? "SAVE CHANGES" : "SAVE ADDRESS"}
        </button>
        <button type="button" onClick={onCancel} className="h-11 px-4 text-sm">
          Cancel
        </button>
      </div>
    </form>
  );
}
