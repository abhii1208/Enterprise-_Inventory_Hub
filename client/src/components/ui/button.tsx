import type { ButtonHTMLAttributes } from "react";
import { cn } from "../../lib/utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
};

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold transition duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-brand-500/25 disabled:cursor-not-allowed disabled:opacity-60",
        variant === "primary" &&
          "bg-brand-500 text-white shadow-sm hover:-translate-y-1 hover:bg-brand-600 hover:shadow-soft",
        variant === "secondary" &&
          "border border-line bg-white/75 text-ink hover:-translate-y-0.5 hover:border-brand-100 hover:bg-brand-50/70 hover:shadow-panel",
        variant === "ghost" && "text-muted hover:bg-white/70 hover:text-ink",
        variant === "danger" && "bg-danger text-white hover:-translate-y-1 hover:opacity-95 hover:shadow-soft",
        className
      )}
      {...props}
    />
  );
}
