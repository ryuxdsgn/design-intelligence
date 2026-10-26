import type { ReactNode } from "react";

type Props = { tone?: "info" | "warning" | "danger"; title: string; children?: ReactNode; action?: ReactNode };

export function Banner({ tone = "info", title, children, action }: Props) {
  return (
    <div className={`banner banner-${tone}`} role={tone === "danger" ? "alert" : "status"}>
      <div>
        <p className="banner-title">{title}</p>
        {children && <p>{children}</p>}
      </div>
      {action}
    </div>
  );
}
