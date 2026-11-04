/** India's 28 states and 8 union territories, by their official names (the API uses the same list). */
export const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana",
  "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana",
  "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
];

export const UNION_TERRITORIES = [
  "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi",
  "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry",
];

export const ALL_REGIONS = [...INDIAN_STATES, ...UNION_TERRITORIES];

const ALIASES: Record<string, string> = {
  orissa: "odisha",
  pondicherry: "puducherry",
  nctofdelhi: "delhi",
  newdelhi: "delhi",
  uttaranchal: "uttarakhand",
};

/** "orissa", "NCT of Delhi", "TAMIL NADU" -> the official name, or "" when it is not a state or UT. */
export function canonicalState(raw: string | undefined) {
  let key = (raw ?? "").toLowerCase().replace(/[^a-z]/g, "");
  if (key.startsWith("the")) key = key.slice(3);
  key = ALIASES[key] ?? key;
  return ALL_REGIONS.find((state) => state.toLowerCase().replace(/[^a-z]/g, "") === key) ?? "";
}

/** States switched off under Admin › Settings › Delivery areas. */
export function offStates(settings: { disabledStates?: string[] }) {
  return new Set((settings.disabledStates ?? []).map(canonicalState).filter(Boolean));
}

/** A mobile that can receive WhatsApp and courier calls: 10 digits, starting 6 to 9. */
export function validMobile(phone: string) {
  return /^[6-9]\d{9}$/.test(phone);
}

export function validPin(pin: string) {
  return /^[1-9]\d{5}$/.test(pin);
}
