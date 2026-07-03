import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  children: ReactNode;
};

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-[#111111] text-white shadow-[0_14px_0_#d64f2f] hover:-translate-y-0.5 hover:shadow-[0_16px_0_#d64f2f] active:translate-y-1 active:shadow-[0_8px_0_#d64f2f]",
  secondary:
    "border-2 border-[#111111] bg-[#fff7df] text-[#111111] shadow-[0_8px_0_#111111] hover:-translate-y-0.5 active:translate-y-1 active:shadow-[0_4px_0_#111111]",
  ghost:
    "bg-transparent text-[#111111] underline decoration-[#2f8f83] decoration-2 underline-offset-4 hover:text-[#d64f2f]"
};

export function Button({
  className,
  variant = "primary",
  type = "button",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex min-h-12 items-center justify-center rounded-md px-5 py-3 text-sm font-black uppercase tracking-[0.08em] transition disabled:pointer-events-none disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-55",
        variants[variant],
        className
      )}
      type={type}
      {...props}
    >
      {children}
    </button>
  );
}
