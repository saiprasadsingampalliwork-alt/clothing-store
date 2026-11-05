const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/v1";

const STAFF_TOKEN = "earthen-staff-token";
const CUSTOMER_TOKEN = "earthen-customer-token";

export function staffToken() {
  return typeof window === "undefined" ? null : localStorage.getItem(STAFF_TOKEN);
}

export function customerToken() {
  return typeof window === "undefined" ? null : localStorage.getItem(CUSTOMER_TOKEN);
}

export function setStaffToken(token: string | null) {
  if (token) localStorage.setItem(STAFF_TOKEN, token);
  else localStorage.removeItem(STAFF_TOKEN);
}

export function setCustomerToken(token: string | null) {
  if (token) localStorage.setItem(CUSTOMER_TOKEN, token);
  else localStorage.removeItem(CUSTOMER_TOKEN);
}

/*
 * Activity: how many requests are in flight, so the site can show it is working (components/activity.tsx).
 * The button the shopper or staff member just pressed is marked busy too, until its requests finish.
 */
type Activity = { inflight: number; since: number | null };
let activity: Activity = { inflight: 0, since: null };
const listeners = new Set<() => void>();
const busyCount = new WeakMap<HTMLElement, number>();
let lastPressed: { element: HTMLElement; at: number } | null = null;

export function apiActivity() {
  return activity;
}

export function subscribeApiActivity(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Remembers the button just pressed, so a request it starts can mark it busy. */
export function notePressed(element: HTMLElement) {
  lastPressed = { element, at: Date.now() };
}

function setActivity(next: Activity) {
  activity = next;
  listeners.forEach((listener) => listener());
}

function begin() {
  setActivity({ inflight: activity.inflight + 1, since: activity.since ?? Date.now() });
  // A request that starts right after a press belongs to that button.
  const pressed = lastPressed && Date.now() - lastPressed.at < 800 && lastPressed.element.isConnected ? lastPressed.element : null;
  if (pressed) {
    busyCount.set(pressed, (busyCount.get(pressed) ?? 0) + 1);
    pressed.setAttribute("data-busy", "");
    pressed.setAttribute("aria-busy", "true");
  }
  return () => {
    const inflight = Math.max(0, activity.inflight - 1);
    setActivity({ inflight, since: inflight ? activity.since : null });
    if (pressed) {
      const left = (busyCount.get(pressed) ?? 1) - 1;
      busyCount.set(pressed, left);
      if (left <= 0) {
        pressed.removeAttribute("data-busy");
        pressed.removeAttribute("aria-busy");
      }
    }
  };
}

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const done = typeof window === "undefined" ? () => undefined : begin();
  try {
    return await request<T>(path, init);
  } finally {
    done();
  }
}

async function request<T>(path: string, init: RequestInit): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body && !headers.has("content-type")) headers.set("content-type", "application/json");
  const staff = staffToken();
  const customer = customerToken();
  if (staff) headers.set("authorization", `Bearer ${staff}`);
  if (customer) headers.set("x-customer-token", customer);
  const response = await fetch(`${API}${path}`, { ...init, headers });
  const data = (await response.json().catch(() => ({}))) as T & { message?: string | string[] };
  if (!response.ok) {
    const message = Array.isArray(data.message) ? data.message.join(" ") : data.message;
    throw new Error(message || "The studio API could not complete that.");
  }
  return data;
}
