import { cn } from "@/lib/utils";
import type { GameModeOption } from "@/types/game";

type ModeCardProps = {
  mode: GameModeOption;
  accent: "green" | "red" | "yellow";
  onSelect: (mode: GameModeOption) => void;
};

const accentClasses = {
  green: "bg-[#9fd8cb] group-hover:bg-[#7bcabb]",
  red: "bg-[#ffe0d7] group-hover:bg-[#ffc8ba]",
  yellow: "bg-[#f5c84c] group-hover:bg-[#ffd95f]"
};

const eyebrowLabels = {
  FAMILY: "Safe table",
  DEEP_DIVE: "Big questions",
  RANDOM: "Mixed bag"
};

export function ModeCard({ mode, accent, onSelect }: ModeCardProps) {
  return (
    <button
      className="group flex min-h-64 w-full flex-col justify-between rounded-lg border-2 border-[#111111] bg-white p-6 text-left shadow-[10px_10px_0_#111111] transition hover:-translate-y-1 hover:shadow-[13px_14px_0_#111111] focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-[#f5c84c] active:translate-y-1 active:shadow-[6px_6px_0_#111111]"
      onClick={() => onSelect(mode)}
      type="button"
    >
      <span
        className={cn(
          "w-fit rounded-full border-2 border-[#111111] px-3 py-1 text-xs font-black uppercase tracking-[0.14em] transition",
          accentClasses[accent]
        )}
      >
        {eyebrowLabels[mode.value]}
      </span>

      <span className="mt-8 block">
        <span className="block font-serif text-4xl font-black leading-none text-[#111111] sm:text-5xl">
          {mode.label}
        </span>
        <span className="mt-4 block text-base font-bold leading-relaxed text-[#4d463a]">
          {mode.description}
        </span>
      </span>

      <span className="mt-8 inline-flex w-fit items-center border-b-4 border-[#111111] pb-1 text-sm font-black uppercase tracking-[0.1em]">
        Play this mode
      </span>
    </button>
  );
}
