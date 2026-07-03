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
    <Card className="mx-auto w-full max-w-5xl p-5 sm:p-7">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.16em] text-[#d64f2f]">
            Would you rather...
          </p>
          <h2 className="mt-2 text-2xl font-black leading-tight text-[#111111] sm:text-3xl">
            Pick one path. Results unlock after your vote.
          </h2>
        </div>
        <div className="flex flex-wrap items-center gap-3 sm:justify-end">
          <span className="rounded-full border-2 border-[#111111] bg-[#9fd8cb] px-3 py-1 text-xs font-black uppercase tracking-[0.12em]">
            {mode.label}
          </span>
          <p className="text-sm font-bold text-[#4d463a]">
            {totalVotes} {totalVotes === 1 ? "vote" : "votes"} counted
          </p>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
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
      </div>

      <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="min-h-6 text-sm font-bold text-[#4d463a]">
          {isVoting
            ? "Saving your vote..."
            : selectedChoice
              ? "The crowd has spoken. Ready for another?"
              : "No switching after you choose."}
        </p>
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
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
            Next question
          </Button>
        </div>
      </div>
    </Card>
  );
}
