"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import type { Choice } from "@/types/game";

type ResultsBarProps = {
  choice: Choice;
  votes: number;
  totalVotes: number;
};

export function ResultsBar({ choice, votes, totalVotes }: ResultsBarProps) {
  const percentage = totalVotes === 0 ? 0 : Math.round((votes / totalVotes) * 100);

  // Start at zero and grow on the next frame so the bar visibly fills in
  // once results unlock. scaleX keeps the animation on the compositor.
  const [shown, setShown] = useState(0);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setShown(percentage));
    return () => cancelAnimationFrame(frame);
  }, [percentage]);

  return (
    <div className="mt-auto pt-6" aria-label={`Option ${choice}: ${percentage}%, ${votes} ${votes === 1 ? "vote" : "votes"}`}>
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <span className="text-[34px] font-bold leading-none tracking-[-0.03em] tabular-nums text-label">
          {percentage}%
        </span>
        <span className="text-[13px] tabular-nums text-label-2">
          {votes.toLocaleString()} {votes === 1 ? "vote" : "votes"}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-fill-strong">
        <div
          className={cn(
            "h-full w-full origin-left rounded-full transition-transform duration-[900ms] ease-soft",
            choice === "A" ? "bg-choice-a" : "bg-choice-b"
          )}
          style={{ transform: `scaleX(${shown / 100})` }}
        />
      </div>
    </div>
  );
}
