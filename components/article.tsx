import type { ReactNode } from "react";

export function Article({ title, children }: { title: string; children: ReactNode }) {
  return (
    <article className="mx-auto max-w-2xl px-4 py-10 md:px-6">
      <h1 className="serif text-4xl">{title}</h1>
      <div className="mt-6 space-y-4 text-sm leading-7 text-ink/90">{children}</div>
    </article>
  );
}
