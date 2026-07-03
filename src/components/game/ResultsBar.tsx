import { cn } from "@/lib/utils";
import type { Choice } from "@/types/game";

type ResultsBarProps = {
  choice: Choice;
  votes: number;
  totalVotes: number;
  selected: boolean;
};

export function ResultsBar({
  choice,
  votes,
  totalVotes,
  selected
}: ResultsBarProps) {
  const percentage = totalVotes === 0 ? 0 : Math.round((votes / totalVotes) * 100);

  return (
    <div className="mt-4" aria-label={`Option ${choice} results`}>
      <div className="mb-2 flex items-center justify-between gap-3 text-sm font-black uppercase tracking-[0.08em]">
        <span>{selected ? "Your pick" : `Option ${choice}`}</span>
        <span>
          {percentage}% · {votes} {votes === 1 ? "vote" : "votes"}
        </span>
      </div>
      <div className="h-4 overflow-hidden rounded-full border-2 border-[#111111] bg-white">
        <div
          className={cn(
            "h-full rounded-full transition-[width] duration-700 ease-out",
            selected ? "bg-[#d64f2f]" : "bg-[#2f8f83]"
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
