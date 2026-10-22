"use client";

import { useEffect, useState } from "react";
import { Icon } from "./icons";

/* Mobile or desktop, read from the screenshot itself: wider than tall is desktop. Nothing is stored;
   a tablet held sideways reads as desktop (accepted 2026-10-23, owner chose image size over a field). */

export type FormFactor = "mobile" | "desktop";

export const formFactorOf = (width: number, height: number): FormFactor => (width > height ? "desktop" : "mobile");

/** The form factor of one image URL, once it has loaded; null before that. */
export function useFormFactor(url: string | null | undefined) {
  const [value, setValue] = useState<FormFactor | null>(null);
  useEffect(() => {
    if (!url) return;
    const img = new Image();
    img.onload = () => setValue(formFactorOf(img.naturalWidth, img.naturalHeight));
    img.src = url;
  }, [url]);
  return value;
}

export function FormFactorBadge({ value, className = "" }: { value: FormFactor | null; className?: string }) {
  if (!value) return null;
  return (
    <span className={`inline-flex shrink-0 items-center gap-1 rounded-full bg-paper px-2 py-0.5 text-xs font-medium text-ink-2 ${className}`}>
      <Icon name={value} />{value === "desktop" ? "Desktop" : "Mobile"}
    </span>
  );
}

/** The card preview on the flow list: three portrait screens side by side, or one wide desktop screen. */
export function FlowCover({ covers, steps }: { covers: string[]; steps: number }) {
  const value = useFormFactor(covers[0]);
  return (
    <span className="relative flex aspect-[4/3] items-center justify-center gap-2 overflow-hidden rounded-2xl bg-paper-2 p-4">
      {!covers.length ? <span className="text-sm text-muted">{steps ? "Preview unavailable" : "No screens yet"}</span>
        : value === "desktop" ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={covers[0]} alt="" className="max-h-full w-full rounded-lg object-contain object-top shadow-sm transition-transform duration-[var(--dur-2)] ease-[var(--ease-out)] group-hover:-translate-y-1 motion-reduce:transition-none" />
        ) : covers.map((u, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={i} src={u} alt="" className="h-full w-[30%] rounded-lg object-cover object-top shadow-sm transition-transform duration-[var(--dur-2)] ease-[var(--ease-out)] group-hover:-translate-y-1 motion-reduce:transition-none" />
        ))}
      <FormFactorBadge value={value} className="absolute left-3 top-3 shadow-sm" />
    </span>
  );
}
