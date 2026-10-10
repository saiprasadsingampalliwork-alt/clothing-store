import type { ReactNode } from "react";

export function Fold({
  title,
  open,
  onToggle,
  children,
}: {
  title: string;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <section>
      <button type="button" className="flex h-12 w-full items-center justify-between text-left text-sm" aria-expanded={open} onClick={onToggle}>
        {title}
        <span aria-hidden="true">{open ? "–" : "+"}</span>
      </button>
      <div className={open ? "fold open" : "fold"}>
        <div className="fold-inner" inert={open ? undefined : true}>
          {children}
        </div>
      </div>
    </section>
  );
}
