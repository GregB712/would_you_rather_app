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

const choiceStyles: Record<Choice, { badge: string; tint: string; ring: string }> = {
  A: {
    badge: "bg-choice-a/15 text-choice-a",
    tint: "bg-choice-a/[0.07]",
    ring: "ring-choice-a"
  },
  B: {
    badge: "bg-choice-b/15 text-choice-b",
    tint: "bg-choice-b/[0.08]",
    ring: "ring-choice-b"
  }
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
  const style = choiceStyles[choice];

  return (
    <button
      aria-pressed={selected}
      className={cn(
        "group flex min-h-40 w-full flex-col rounded-[22px] p-5 text-left transition-[transform,background-color,opacity,box-shadow] duration-300 ease-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:min-h-52 sm:p-6",
        hasVoted ? style.tint : "bg-fill",
        !hasVoted &&
          "hover:bg-fill-strong active:scale-[0.98] active:duration-100",
        selected && cn("ring-2 ring-inset", style.ring),
        hasVoted && !selected && "opacity-75",
        disabled && !hasVoted && "cursor-progress"
      )}
      disabled={disabled}
      onClick={() => onSelect(choice)}
      type="button"
    >
      <span className="flex items-center justify-between gap-3">
        <span
          className={cn(
            "flex size-8 items-center justify-center rounded-full text-[15px] font-bold",
            style.badge
          )}
        >
          {choice}
        </span>
        {selected ? (
          <span className="flex items-center gap-1 text-[13px] font-semibold text-label">
            <svg
              aria-hidden="true"
              className="size-4"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.4}
              viewBox="0 0 16 16"
            >
              <path d="m3.5 8.5 3 3 6-7" />
            </svg>
            Your pick
          </span>
        ) : null}
      </span>
      <span className="mt-5 block text-[22px] font-semibold leading-snug tracking-[-0.02em] text-label sm:text-[26px]">
        {label}
      </span>
      {hasVoted ? (
        <ResultsBar choice={choice} totalVotes={totalVotes} votes={votes} />
      ) : null}
    </button>
  );
}
