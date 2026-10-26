import type { ReactNode } from "react";

type Props = { title?: string; action?: ReactNode; children: ReactNode };

export function Card({ title, action, children }: Props) {
  return (
    <section className="card">
      {(title || action) && (
        <div className="card-header">
          {title && <h2 className="card-title">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}
