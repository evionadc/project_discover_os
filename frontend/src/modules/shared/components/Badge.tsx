import type { ReactNode } from "react";

type Tone = "default" | "success" | "warning" | "danger";

export default function Badge({
  children,
  tone = "default",
}: {
  children: ReactNode;
  tone?: Tone;
}) {
  const toneClass =
    tone === "success"
      ? "badge--success"
      : tone === "warning"
      ? "badge--warning"
      : tone === "danger"
      ? "badge--danger"
      : "badge--default";

  return <span className={`badge ${toneClass}`}>{children}</span>;
}
