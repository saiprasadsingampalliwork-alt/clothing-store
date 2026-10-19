import type { ReactNode } from "react";

export type IconName =
  | "search"
  | "user"
  | "bag"
  | "close"
  | "truck"
  | "returns"
  | "card"
  | "lock"
  | "ruler"
  | "mail"
  | "phone"
  | "box"
  | "pin"
  | "home"
  | "check"
  | "trash";

export function Icon({ name, className = "h-5 w-5" }: { name: IconName; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      {paths[name]}
    </svg>
  );
}

const paths: Record<IconName, ReactNode> = {
  search: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="M16 16.5 20 20.5" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="3.2" />
      <path d="M5.5 19.5c1.4-3 3.6-4.5 6.5-4.5s5.1 1.5 6.5 4.5" />
    </>
  ),
  bag: (
    <>
      <path d="M6.5 8.5h11l-.8 11h-9.4l-.8-11Z" />
      <path d="M9 8.5V7a3 3 0 0 1 6 0v1.5" />
    </>
  ),
  close: (
    <>
      <path d="M6 6 18 18" />
      <path d="M18 6 6 18" />
    </>
  ),
  truck: (
    <>
      <path d="M3 7.5h11v9H3z" />
      <path d="M14 11h4.2L20 14.2V16.5h-6" />
      <circle cx="7" cy="17.5" r="1.4" />
      <circle cx="16.5" cy="17.5" r="1.4" />
    </>
  ),
  returns: (
    <>
      <path d="M4.5 12a7.5 7.5 0 1 0 2.1-5.2" />
      <path d="M4.5 4.5v4h4" />
    </>
  ),
  card: (
    <>
      <rect x="3" y="6" width="18" height="12" rx="1.5" />
      <path d="M3 10h18" />
    </>
  ),
  lock: (
    <>
      <rect x="5.5" y="10.5" width="13" height="9" rx="1.2" />
      <path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" />
    </>
  ),
  ruler: (
    <>
      <path d="M4 16.5 16.5 4" />
      <path d="m7.2 13.3 1.6 1.6" />
      <path d="m10.2 10.3 1.6 1.6" />
      <path d="m13.2 7.3 1.6 1.6" />
    </>
  ),
  mail: (
    <>
      <rect x="3.5" y="6" width="17" height="12" rx="1.2" />
      <path d="m4.5 7.5 7.5 6 7.5-6" />
    </>
  ),
  phone: (
    <>
      <path d="M8 4.5h2.2l1.2 3-1.6 1a11 11 0 0 0 5.7 5.7l1-1.6 3 1.2V18a1.5 1.5 0 0 1-1.6 1.5A14.5 14.5 0 0 1 4.5 6.1 1.5 1.5 0 0 1 6 4.5H8Z" />
    </>
  ),
  box: (
    <>
      <path d="M4 8.5 12 4.5l8 4v11l-8 4-8-4v-11Z" />
      <path d="M12 12.5V19.5" />
      <path d="M4.2 8.7 12 12.5l7.8-3.8" />
    </>
  ),
  pin: (
    <>
      <path d="M12 21s6-5.2 6-10a6 6 0 1 0-12 0c0 4.8 6 10 6 10Z" />
      <circle cx="12" cy="11" r="1.8" />
    </>
  ),
  home: (
    <>
      <path d="m4 11 8-6.5L20 11" />
      <path d="M7 10.5V19h10v-8.5" />
    </>
  ),
  check: <path d="m5.5 12.5 4.2 4.2 8.8-9.2" />,
  trash: (
    <>
      <path d="M5 7.5h14" />
      <path d="M9.5 7.4V6.2A1.2 1.2 0 0 1 10.7 5h2.6a1.2 1.2 0 0 1 1.2 1.2v1.2" />
      <path d="m7.2 7.5.7 11.2a1 1 0 0 0 1 .8h6.2a1 1 0 0 0 1-.8l.7-11.2" />
      <path d="M10.5 11v5" />
      <path d="M13.5 11v5" />
    </>
  ),
};
