import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "ghost" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: Variant;
}

export default function Button({
  children,
  variant = "ghost",
  className = "",
  ...props
}: ButtonProps) {
  const variantClass =
    variant === "primary" ? "btn--primary" : variant === "danger" ? "btn--danger" : "btn--ghost";

  return (
    <button className={`btn ${variantClass} ${className}`.trim()} {...props}>
      {children}
    </button>
  );
}
