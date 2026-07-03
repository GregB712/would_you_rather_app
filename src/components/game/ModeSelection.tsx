import { Card } from "@/components/ui/Card";
import { GAME_MODES } from "@/lib/gameModes";
import type { GameModeOption } from "@/types/game";
import { ModeCard } from "./ModeCard";

type ModeSelectionProps = {
  onSelectMode: (mode: GameModeOption) => void;
};

export function ModeSelection({ onSelectMode }: ModeSelectionProps) {
  return (
    <Card className="mx-auto w-full max-w-5xl p-5 sm:p-7">
      <div className="mb-7 max-w-3xl">
        <p className="text-sm font-black uppercase tracking-[0.16em] text-[#d64f2f]">
          Choose your room
        </p>
        <h2 className="mt-2 text-3xl font-black leading-tight text-[#111111] sm:text-4xl">
          Pick the kind of dilemma you want next.
        </h2>
        <p className="mt-3 text-base font-semibold leading-relaxed text-[#4d463a]">
          Vote anonymously, see how the crowd split, then pull another question
          from the same mode.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {GAME_MODES.map((mode, index) => (
          <ModeCard
            accent={index === 0 ? "green" : index === 1 ? "red" : "yellow"}
            key={mode.value}
            mode={mode}
            onSelect={onSelectMode}
          />
        ))}
      </div>
    </Card>
  );
}
