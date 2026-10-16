import { cn } from "@/lib/utils";
import type { Choice } from "@/types/game";
import { ResultsBar } from "./ResultsBar";

type OptionButtonProps = {
  choice: Choice;
  label: string;
  votes: number;
  totalVotes: number;
  selectedChoice: Choice | null;
  disabled: boolean;
  onSelect: (choice: Choice) => void;
};

export function OptionButton({
  choice,
  label,
  votes,
  totalVotes,
  selectedChoice,
  disabled,
  onSelect
}: OptionButtonProps) {
  const hasVoted = selectedChoice !== null;
  const selected = selectedChoice === choice;

  return (
    <button
      className={cn(
        "group flex min-h-44 w-full flex-col justify-between rounded-md border-2 border-[#111111] bg-white p-5 text-left shadow-[6px_6px_0_#111111] transition focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-[#f5c84c] sm:min-h-48 sm:shadow-[8px_8px_0_#111111]",
        !hasVoted &&
          "hover:-translate-y-1 hover:bg-[#fff1bf] hover:shadow-[10px_12px_0_#111111] active:translate-y-0.5 active:shadow-[3px_3px_0_#111111]",
        selected && "bg-[#ffe0d7]",
        disabled && "cursor-not-allowed"
      )}
      disabled={disabled}
      onClick={() => onSelect(choice)}
      type="button"
    >
      <span className="flex items-center justify-between gap-3">
        <span className="rounded-full border-2 border-[#111111] bg-[#f5c84c] px-3 py-1 text-xs font-black uppercase tracking-[0.14em]">
          Option {choice}
        </span>
        {selected ? (
          <span className="rounded-full bg-[#111111] px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-white">
            Selected
          </span>
        ) : null}
      </span>
      <span className="mt-6 block text-2xl font-black leading-tight text-[#111111] sm:text-3xl">
        {label}
      </span>
      {hasVoted ? (
        <ResultsBar
          choice={choice}
          selected={selected}
          totalVotes={totalVotes}
          votes={votes}
        />
      ) : null}
    </button>
  );
}
