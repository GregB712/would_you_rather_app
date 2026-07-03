import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

type EmptyStateProps = {
  onRetry: () => void;
  onChangeMode?: () => void;
  modeLabel?: string;
};

export function EmptyState({ onRetry, onChangeMode, modeLabel }: EmptyStateProps) {
  return (
    <Card className="mx-auto w-full max-w-3xl p-6 sm:p-8">
      <p className="mb-2 text-sm font-black uppercase tracking-[0.16em] text-[#2f8f83]">
        {modeLabel ? `${modeLabel} is empty` : "The question box is empty"}
      </p>
      <h2 className="text-3xl font-black text-[#111111]">
        No questions are available for this mode yet.
      </h2>
      <p className="mt-3 text-base font-semibold leading-relaxed text-[#4d463a]">
        Seed the database or insert a row into the Question table with two options
        and isActive set to true for this mode.
      </p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        {onChangeMode ? (
          <Button onClick={onChangeMode} variant="primary">
            Back to modes
          </Button>
        ) : null}
        <Button onClick={onRetry} variant="secondary">
          Check again
        </Button>
      </div>
    </Card>
  );
}
