export type Choice = "A" | "B";

export type QuestionMode = "FAMILY" | "DEEP_DIVE";
export type PlayMode = QuestionMode | "RANDOM";

export type GameModeOption = {
  value: PlayMode;
  label: string;
  description: string;
};

export type Question = {
  id: string;
  optionA: string;
  optionB: string;
  votesA: number;
  votesB: number;
  mode: QuestionMode | null;
};

export type RandomQuestionResponse = {
  question: Question | null;
};

export type VoteResponse = {
  question: Question;
  selectedChoice: Choice;
};

export type ApiErrorResponse = {
  error: string;
};
