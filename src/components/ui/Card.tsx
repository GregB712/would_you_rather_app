import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
};

export function Card({ className, children, ...props }: CardProps) {
  return (
    <section
      className={cn(
        "rounded-lg border-2 border-[#111111] bg-[#fffaf0] shadow-[12px_12px_0_#111111]",
        className
      )}
      {...props}
    >
      {children}
    </section>
  );
}
