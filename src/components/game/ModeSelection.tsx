import { GAME_MODES } from "@/lib/gameModes";
import type { GameModeOption } from "@/types/game";
import { ModeCard } from "./ModeCard";

type ModeSelectionProps = {
  onSelectMode: (mode: GameModeOption) => void;
};

export function ModeSelection({ onSelectMode }: ModeSelectionProps) {
  return (
    <section className="mx-auto w-full max-w-5xl">
      <div className="animate-rise mb-6 max-w-2xl">
        <h2 className="text-[28px] font-bold leading-tight tracking-[-0.025em] text-label sm:text-[32px]">
          Choose a mode
        </h2>
        <p className="mt-2 text-[17px] leading-relaxed text-label-2">
          Vote anonymously, see how the crowd split, then pull another question
          from the same mode.
        </p>
      </div>

      <div className="grid gap-4 sm:gap-5 lg:grid-cols-3">
        {GAME_MODES.map((mode, index) => (
          <ModeCard index={index} key={mode.value} mode={mode} onSelect={onSelectMode} />
        ))}
      </div>
    </section>
  );
}
