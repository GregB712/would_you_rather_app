import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { Choice, GameModeOption, Question } from "@/types/game";
import { OptionButton } from "./OptionButton";

type QuestionCardProps = {
  question: Question;
  mode: GameModeOption;
  selectedChoice: Choice | null;
  isVoting: boolean;
  onVote: (choice: Choice) => void;
  onNext: () => void;
  onChangeMode: () => void;
};

export function QuestionCard({
  question,
  mode,
  selectedChoice,
  isVoting,
  onVote,
  onNext,
  onChangeMode
}: QuestionCardProps) {
  const totalVotes = question.votesA + question.votesB;

  return (
    <Card className="animate-rise mx-auto w-full max-w-5xl p-4 sm:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-2 pt-1 sm:mb-5">
        <h2 className="text-[13px] font-semibold uppercase tracking-[0.06em] text-label-2">
          Would you rather…
        </h2>
        <div className="flex items-center gap-2 text-[13px] text-label-2">
          <span className="rounded-full bg-fill px-2.5 py-1 font-medium text-label">
            {mode.label}
          </span>
          <span className="tabular-nums">
            {totalVotes.toLocaleString()} {totalVotes === 1 ? "vote" : "votes"}
          </span>
        </div>
      </div>

      {/* Keyed by question so each new dilemma rises in fresh. */}
      <div
        className="animate-rise relative grid auto-rows-fr gap-3 sm:gap-4 md:grid-cols-2"
        key={question.id}
      >
        <OptionButton
          choice="A"
          disabled={isVoting || selectedChoice !== null}
          label={question.optionA}
          onSelect={onVote}
          selectedChoice={selectedChoice}
          totalVotes={totalVotes}
          votes={question.votesA}
        />
        <OptionButton
          choice="B"
          disabled={isVoting || selectedChoice !== null}
          label={question.optionB}
          onSelect={onVote}
          selectedChoice={selectedChoice}
          totalVotes={totalVotes}
          votes={question.votesB}
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2 flex size-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-surface text-[12px] font-bold uppercase tracking-[0.04em] text-label-2 shadow-(--card-shadow)"
        >
          or
        </span>
      </div>

      <div className="mt-5 flex flex-col gap-3 px-2 pb-1 sm:flex-row sm:items-center sm:justify-between">
        <p aria-live="polite" className="min-h-5 text-[15px] text-label-2">
          {isVoting
            ? "Saving your vote…"
            : selectedChoice
              ? "The crowd has spoken. Ready for another?"
              : "Choose carefully. No switching after you vote."}
        </p>
        <div className="flex w-full flex-col-reverse gap-2 sm:w-auto sm:flex-row">
          <Button
            className="w-full sm:w-auto"
            disabled={isVoting}
            onClick={onChangeMode}
            variant="ghost"
          >
            Change mode
          </Button>
          <Button
            className="w-full sm:w-auto"
            disabled={isVoting}
            onClick={onNext}
            variant={selectedChoice ? "primary" : "secondary"}
          >
            {selectedChoice ? "Next question" : "Skip"}
          </Button>
        </div>
      </div>
    </Card>
  );
}
