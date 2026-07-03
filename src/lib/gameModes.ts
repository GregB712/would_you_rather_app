import type { GameModeOption, PlayMode, QuestionMode } from "@/types/game";

export const GAME_MODES: GameModeOption[] = [
  {
    value: "FAMILY",
    label: "Family Friendly",
    description: "Light, safe dilemmas for any table, couch, or group chat."
  },
  {
    value: "DEEP_DIVE",
    label: "Deep Dive",
    description: "Thoughtful choices with more tension, reflection, and debate."
  },
  {
    value: "RANDOM",
    label: "Random / All Modes",
    description: "A mixed draw from Family Friendly, Deep Dive, and uncategorized questions."
  }
];

export function isQuestionMode(value: unknown): value is QuestionMode {
  return value === "FAMILY" || value === "DEEP_DIVE";
}

export function isPlayMode(value: unknown): value is PlayMode {
  return isQuestionMode(value) || value === "RANDOM";
}

export function getGameModeOption(mode: PlayMode) {
  return GAME_MODES.find((option) => option.value === mode) ?? GAME_MODES[0];
}
