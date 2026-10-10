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

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
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
