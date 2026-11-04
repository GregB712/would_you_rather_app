import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
};

export function Card({ className, children, ...props }: CardProps) {
  return (
    <section
      className={cn(
        "rounded-[28px] bg-surface shadow-(--card-shadow)",
        className
      )}
      {...props}
    >
      {children}
    </section>
  );
}
