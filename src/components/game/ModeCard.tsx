import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { GameModeOption, PlayMode } from "@/types/game";

type ModeCardProps = {
  mode: GameModeOption;
  index: number;
  onSelect: (mode: GameModeOption) => void;
};

const modeStyles: Record<PlayMode, { eyebrow: string; tint: string; icon: ReactNode }> = {
  FAMILY: {
    eyebrow: "Safe for any table",
    tint: "text-green bg-green/15",
    icon: (
      <path d="M4 11.5 12 5l8 6.5M6.5 10v8.5h11V10M10 18.5v-4.5h4v4.5" />
    )
  },
  DEEP_DIVE: {
    eyebrow: "Big questions",
    tint: "text-indigo bg-indigo/15",
    icon: (
      <path d="M12 4.5 13.8 10 19.5 12l-5.7 2-1.8 5.5-1.8-5.5-5.7-2 5.7-2Z" />
    )
  },
  RANDOM: {
    eyebrow: "Mixed bag",
    tint: "text-orange bg-orange/15",
    icon: (
      <path d="M4 7.5h3.5c4.5 0 4.5 9 9 9H20m0 0-2.5-2.5M20 16.5 17.5 19M4 16.5h3.5c1.2 0 2-.6 2.7-1.5M20 7.5h-3.5c-1.2 0-2 .6-2.7 1.5M20 7.5 17.5 5M20 7.5 17.5 10" />
    )
  }
};

const delays = ["animate-rise", "animate-rise-delayed", "animate-rise-delayed-2"];

export function ModeCard({ mode, index, onSelect }: ModeCardProps) {
  const style = modeStyles[mode.value];

  return (
    <button
      className={cn(
        "group flex min-h-52 w-full flex-col rounded-[28px] bg-surface p-6 text-left shadow-(--card-shadow) transition-[transform,box-shadow] duration-300 ease-soft hover:-translate-y-0.5 hover:shadow-(--card-shadow-lift) focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent active:scale-[0.98] active:duration-100 sm:min-h-60 sm:p-7",
        delays[index] ?? delays[0]
      )}
      onClick={() => onSelect(mode)}
      type="button"
    >
      <span
        aria-hidden="true"
        className={cn("flex size-12 items-center justify-center rounded-2xl", style.tint)}
      >
        <svg
          className="size-6"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.8}
          viewBox="0 0 24 24"
        >
          {style.icon}
        </svg>
      </span>

      <span className="mt-6 block text-[13px] font-semibold uppercase tracking-[0.06em] text-label-3">
        {style.eyebrow}
      </span>
      <span className="mt-1 block text-[24px] font-bold leading-tight tracking-[-0.02em] text-label">
        {mode.label}
      </span>
      <span className="mt-2 block text-[15px] leading-relaxed text-label-2">
        {mode.description}
      </span>

      <span className="mt-auto flex items-center gap-1 pt-6 text-[15px] font-semibold text-accent">
        Play
        <svg
          aria-hidden="true"
          className="size-4 transition-transform duration-300 ease-soft group-hover:translate-x-0.5"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2.2}
          viewBox="0 0 16 16"
        >
          <path d="m6 3.5 4.5 4.5L6 12.5" />
        </svg>
      </span>
    </button>
  );
}
