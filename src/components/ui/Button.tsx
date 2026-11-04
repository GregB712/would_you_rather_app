import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "destructive";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  children: ReactNode;
};

const variants: Record<ButtonVariant, string> = {
  primary: "bg-accent text-white hover:bg-accent-hover",
  secondary: "bg-fill text-label hover:bg-fill-strong",
  ghost: "bg-transparent text-accent hover:bg-fill",
  destructive: "bg-danger-fill text-white hover:brightness-110"
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
        // Feedback lands on press (scale on :active), not on release.
        "inline-flex min-h-11 select-none items-center justify-center rounded-full px-5 py-2.5 text-[15px] font-semibold tracking-[-0.01em] transition-[transform,background-color,filter] duration-150 ease-out active:scale-[0.97] active:duration-75 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:pointer-events-none disabled:opacity-45",
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
