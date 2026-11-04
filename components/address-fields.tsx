"use client";

import { useEffect, useId, useRef, useState } from "react";
import { api } from "@/lib/api";
import { canonicalState, INDIAN_STATES, UNION_TERRITORIES, validMobile, validPin } from "@/lib/india";

export type AddressDraft = {
  name: string;
  phone: string;
  line1: string;
  line2: string;
  landmark: string;
  city: string;
  state: string;
  pin: string;
};

export const emptyAddressDraft: AddressDraft = { name: "", phone: "", line1: "", line2: "", landmark: "", city: "", state: "", pin: "" };

type PinInfo = { pin: string; district: string; states: string[]; areas: string[]; delivers: boolean; estimate: string; cod: boolean };

/** What the form knows about the PIN code, for the page to act on (e.g. stop checkout). */
export type PinStatus = { state: "idle" | "checking" | "found" | "unknown"; info?: PinInfo };

/**
 * The address fields shared by checkout and the address book.
 * The PIN fills in the city and state; "Use my current location" fills the rest it can.
 */
export function AddressFields({
  value,
  onChange,
  off,
  blockOff = false,
  onStatus,
}: {
  value: AddressDraft;
  onChange: (next: AddressDraft) => void;
  /** States the studio does not deliver to. */
  off: Set<string>;
  /** At checkout those states cannot be chosen; in the address book they can, with a note. */
  blockOff?: boolean;
  onStatus?: (status: PinStatus) => void;
}) {
  const [status, setStatus] = useState<PinStatus>({ state: "idle" });
  const [locating, setLocating] = useState(false);
  const [locateNote, setLocateNote] = useState<string | null>(null);
  const latest = useRef(value);
  latest.current = value;
  const filledCity = useRef("");
  const areasId = useId();

  function set(patch: Partial<AddressDraft>) {
    onChange({ ...latest.current, ...patch });
  }

  // Look the PIN up as soon as it has six digits, and fill in the city and state from it.
  useEffect(() => {
    if (!validPin(value.pin)) {
      setStatus({ state: "idle" });
      return;
    }
    let stale = false;
    setStatus({ state: "checking" });
    const timer = setTimeout(() => {
      api<PinInfo>(`/delivery/pincode/${value.pin}`)
        .then((info) => {
          if (stale) return;
          setStatus({ state: "found", info });
          const current = latest.current;
          const patch: Partial<AddressDraft> = {};
          // Only overwrite a city the shopper has not typed themselves.
          if (!current.city.trim() || current.city === filledCity.current) {
            patch.city = info.district;
            filledCity.current = info.district;
          }
          if (!info.states.includes(canonicalState(current.state))) patch.state = info.states[0];
          if (Object.keys(patch).length) onChange({ ...current, ...patch });
        })
        .catch(() => {
          if (!stale) setStatus({ state: "unknown" });
        });
    }, 250);
    return () => {
      stale = true;
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value.pin]);

  useEffect(() => {
    onStatus?.(status);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  function locate() {
    setLocateNote(null);
    if (!("geolocation" in navigator)) {
      setLocateNote("This browser cannot share its location. Type the PIN code instead.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const found = await api<{ pin: string; line2: string; city: string; state: string }>(
            `/delivery/reverse?lat=${position.coords.latitude.toFixed(6)}&lng=${position.coords.longitude.toFixed(6)}`,
          );
          const current = latest.current;
          filledCity.current = found.city;
          onChange({
            ...current,
            pin: found.pin || current.pin,
            line2: current.line2.trim() || found.line2,
            city: found.city || current.city,
            state: canonicalState(found.state) || current.state,
          });
          setLocateNote("Filled in from your location. Add your house or flat number, and check the rest.");
        } catch (error) {
          setLocateNote(error instanceof Error ? error.message : "We could not find your location. Type the PIN code instead.");
        } finally {
          setLocating(false);
        }
      },
      (error) => {
        setLocating(false);
        setLocateNote(
          error.code === error.PERMISSION_DENIED
            ? "Location is blocked for this site. Allow it in the browser, or type the PIN code."
            : "We could not get your location. Type the PIN code instead.",
        );
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  }

  const state = canonicalState(value.state);
  const info = status.state === "found" ? status.info : undefined;
  const mismatch = Boolean(info && state && !info.states.includes(state));
  const stateOff = Boolean(state && off.has(state));

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <button
          type="button"
          onClick={locate}
          disabled={locating}
          className="inline-flex h-10 items-center gap-2 border border-ink px-3 text-xs tracking-[0.14em] disabled:opacity-50"
        >
          <span aria-hidden="true">⌖</span>
          {locating ? "FINDING YOU…" : "USE MY CURRENT LOCATION"}
        </button>
        {locateNote && <p className="mt-2 text-sm text-muted" role="status">{locateNote}</p>}
        {locateNote?.startsWith("Filled in") && (
          <p className="mt-1 text-xs text-muted">
            Address data ©{" "}
            <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer" className="underline">
              OpenStreetMap contributors
            </a>
          </p>
        )}
      </div>

      <Input label="Full name" value={value.name} onChange={(name) => set({ name })} autoComplete="name" required />
      <Input
        label="Mobile"
        value={value.phone}
        onChange={(phone) => set({ phone: phone.replace(/\D/g, "").slice(0, 10) })}
        autoComplete="tel-national"
        inputMode="numeric"
        required
        problem={value.phone.length === 10 && !validMobile(value.phone) ? "Mobile numbers start with 6, 7, 8, or 9." : undefined}
      />

      <div className="sm:col-span-2">
        <Input
          label="PIN code"
          value={value.pin}
          onChange={(pin) => set({ pin: pin.replace(/\D/g, "").slice(0, 6) })}
          autoComplete="postal-code"
          inputMode="numeric"
          required
          problem={value.pin.length === 6 && !validPin(value.pin) ? "A PIN code does not start with 0." : undefined}
        />
        <PinNote status={status} stateOff={stateOff} />
      </div>

      <Input
        label="House, flat, building"
        value={value.line1}
        onChange={(line1) => set({ line1 })}
        autoComplete="address-line1"
        required
        className="sm:col-span-2"
      />
      <div className="sm:col-span-2">
        <Input label="Area, street, locality" value={value.line2} onChange={(line2) => set({ line2 })} autoComplete="address-line2" list={areasId} />
        {/* Post office areas for this PIN, offered as the shopper types. */}
        <datalist id={areasId}>
          {(info?.areas ?? []).map((area) => (
            <option key={area} value={area} />
          ))}
        </datalist>
      </div>
      <Input label="Landmark (optional)" value={value.landmark} onChange={(landmark) => set({ landmark })} placeholder="Near the temple, opposite the park…" className="sm:col-span-2" />
      <Input label="City or district" value={value.city} onChange={(city) => set({ city })} autoComplete="address-level2" required />
      <label className="block text-sm">
        State
        <select
          value={state}
          onChange={(event) => set({ state: event.target.value })}
          required
          autoComplete="address-level1"
          className="mt-1 h-12 w-full border border-line bg-paper px-3"
        >
          <option value="" disabled>
            Choose a state
          </option>
          {[
            ["States", INDIAN_STATES],
            ["Union territories", UNION_TERRITORIES],
          ].map(([group, names]) => (
            <optgroup key={group as string} label={group as string}>
              {(names as string[]).map((name) => (
                <option key={name} value={name} disabled={blockOff && off.has(name) && name !== state}>
                  {name}
                  {off.has(name) ? " (we don't deliver here yet)" : ""}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
        {mismatch && <span className="mt-1 block text-sm text-terra">PIN {value.pin} is in {info!.states.join(" / ")}. Check the PIN or the state.</span>}
        {!mismatch && stateOff && <span className="mt-1 block text-sm text-terra">We don't deliver to {state} yet.</span>}
      </label>
    </div>
  );
}

// Announced to screen readers, since it also fills in the city and state.
function PinNote(props: { status: PinStatus; stateOff: boolean }) {
  return (
    <div role="status" aria-live="polite">
      <PinMessage {...props} />
    </div>
  );
}

function PinMessage({ status, stateOff }: { status: PinStatus; stateOff: boolean }) {
  if (status.state === "checking") return <p className="mt-1 text-sm text-muted">Looking up this PIN…</p>;
  if (status.state === "unknown") return <p className="mt-1 text-sm text-muted">We could not find this PIN code. Check it, or fill in the city and state yourself.</p>;
  if (status.state !== "found" || !status.info) return null;
  const info = status.info;
  const where = `${info.district}, ${info.states.join(" / ")}`;
  if (!info.delivers || stateOff) return <p className="mt-1 text-sm text-terra">{where}. We don't deliver here yet.</p>;
  return (
    <p className="mt-1 text-sm text-muted">
      {where}. We deliver here in {info.estimate}
      {info.cod ? ", and cash on delivery is available" : ""}.
    </p>
  );
}

function Input({
  label,
  value,
  onChange,
  className = "",
  problem,
  ...rest
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
  problem?: string;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange">) {
  return (
    <label className={`block text-sm ${className}`}>
      {label}
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={Boolean(problem)}
        className="mt-1 h-12 w-full border border-line bg-paper px-3 outline-none aria-[invalid=true]:border-terra"
        {...rest}
      />
      {problem && <span className="mt-1 block text-sm text-terra">{problem}</span>}
    </label>
  );
}

/** What stops this address from being used, or null. Shared by checkout and the address book. */
export function addressProblem(value: AddressDraft, status: PinStatus, off: Set<string>, forCheckout: boolean) {
  if (!value.name.trim()) return "Add the name of the person receiving it.";
  if (!validMobile(value.phone)) return "Enter a 10-digit mobile number starting with 6, 7, 8, or 9.";
  if (!validPin(value.pin)) return "Enter a 6-digit PIN code.";
  if (!value.line1.trim()) return "Add the house, flat, or building.";
  if (!value.city.trim()) return "Add the city or district.";
  const state = canonicalState(value.state);
  if (!state) return "Choose the state.";
  if (status.state === "found" && status.info && !status.info.states.includes(state)) {
    return `PIN ${value.pin} is in ${status.info.states.join(" / ")}. Check the PIN or the state.`;
  }
  if (forCheckout && off.has(state)) return `We don't deliver to ${state} yet.`;
  return null;
}
