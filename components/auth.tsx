import type { ReactNode } from "react";

export function AuthShell({ title, text, children }: { title: string; text: string; children: ReactNode }) {
  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="serif text-4xl">{title}</h1>
      <p className="mt-2 text-sm text-muted">{text}</p>
      <div className="mt-6">{children}</div>
    </div>
  );
}

export function Input({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <label className="block text-sm">
      {label}
      <input required type={type} value={value} onChange={(event) => onChange(event.target.value)} className="mt-1 h-12 w-full border border-line bg-paper px-3 outline-none" />
    </label>
  );
}
