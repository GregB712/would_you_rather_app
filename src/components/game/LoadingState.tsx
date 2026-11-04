import { Card } from "@/components/ui/Card";

export function LoadingState() {
  return (
    <Card aria-busy="true" aria-label="Loading" className="mx-auto w-full max-w-5xl p-4 sm:p-6">
      <div className="animate-pulse">
        <div className="mb-5 flex items-center justify-between px-2 pt-1">
          <div className="h-3.5 w-36 rounded-full bg-fill-strong" />
          <div className="h-6 w-24 rounded-full bg-fill" />
        </div>
        <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
          <div className="h-40 rounded-[22px] bg-fill sm:h-52" />
          <div className="h-40 rounded-[22px] bg-fill sm:h-52" />
        </div>
        <div className="mt-5 flex justify-end px-2 pb-1">
          <div className="h-11 w-36 rounded-full bg-fill" />
        </div>
      </div>
    </Card>
  );
}
