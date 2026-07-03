import { Card } from "@/components/ui/Card";

export function LoadingState() {
  return (
    <Card className="mx-auto w-full max-w-5xl p-6 sm:p-8">
      <div className="animate-pulse space-y-5">
        <div className="h-5 w-44 rounded bg-[#f5c84c]" />
        <div className="h-9 w-2/3 rounded bg-[#111111]/20" />
        <div className="grid gap-5 md:grid-cols-2">
          <div className="h-52 rounded-md border-2 border-[#111111] bg-white" />
          <div className="h-52 rounded-md border-2 border-[#111111] bg-white" />
        </div>
      </div>
    </Card>
  );
}
