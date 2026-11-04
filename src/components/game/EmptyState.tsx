import Link from "next/link";
import { Show } from "@clerk/nextjs";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

type EmptyStateProps = {
  onRetry: () => void;
  onChangeMode?: () => void;
  modeLabel?: string;
};

export function EmptyState({ onRetry, onChangeMode, modeLabel }: EmptyStateProps) {
  return (
    <Card className="animate-rise mx-auto w-full max-w-2xl px-6 py-10 text-center sm:px-10 sm:py-12">
      <p className="text-[13px] font-semibold uppercase tracking-[0.06em] text-label-2">
        {modeLabel ? `${modeLabel} is empty` : "The question box is empty"}
      </p>
      <h2 className="mt-2 text-[28px] font-bold leading-tight tracking-[-0.025em] text-label">
        No questions available yet.
      </h2>
      <p className="mx-auto mt-3 max-w-md text-[15px] leading-relaxed text-label-2">
        Seed the database or insert a row into the Question table with two options
        and isActive set to true for this mode.
      </p>
      <Show when="signed-in">
        <p className="mx-auto mt-3 max-w-md text-[15px] leading-relaxed text-label-2">
          You may have seen them all. Open your{" "}
          <Link className="font-medium text-accent hover:underline" href="/profile">
            profile
          </Link>{" "}
          and refresh your pool to bring every question back.
        </p>
      </Show>
      <div className="mt-8 flex flex-col justify-center gap-2 sm:flex-row">
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
