import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

type ErrorStateProps = {
  message: string;
  onRetry: () => void;
  onChangeMode?: () => void;
};

export function ErrorState({
  message,
  onRetry,
  onChangeMode
}: ErrorStateProps) {
  return (
    <Card
      className="animate-rise mx-auto w-full max-w-2xl px-6 py-10 text-center sm:px-10 sm:py-12"
      role="alert"
    >
      <span
        aria-hidden="true"
        className="mx-auto flex size-12 items-center justify-center rounded-full bg-danger-fill/15 text-danger"
      >
        <svg
          className="size-6"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path d="M12 7.5v5.5M12 16.5v.01" />
        </svg>
      </span>
      <h2 className="mt-4 text-[28px] font-bold leading-tight tracking-[-0.025em] text-label">
        Something got stuck.
      </h2>
      <p className="mx-auto mt-3 max-w-md text-[15px] leading-relaxed text-label-2">
        {message}
      </p>
      <div className="mt-8 flex flex-col justify-center gap-2 sm:flex-row">
        <Button onClick={onRetry}>Try again</Button>
        {onChangeMode ? (
          <Button onClick={onChangeMode} variant="secondary">
            Back to modes
          </Button>
        ) : null}
      </div>
    </Card>
  );
}
