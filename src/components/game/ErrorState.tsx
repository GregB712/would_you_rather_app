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
    <Card className="mx-auto w-full max-w-3xl p-6 sm:p-8">
      <p className="mb-2 text-sm font-black uppercase tracking-[0.16em] text-[#d64f2f]">
        Something got stuck
      </p>
      <h2 className="text-3xl font-black text-[#111111]">Try that again.</h2>
      <p className="mt-3 text-base font-semibold leading-relaxed text-[#4d463a]">
        {message}
      </p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Button onClick={onRetry}>Retry</Button>
        {onChangeMode ? (
          <Button onClick={onChangeMode} variant="secondary">
            Back to modes
          </Button>
        ) : null}
      </div>
    </Card>
  );
}
