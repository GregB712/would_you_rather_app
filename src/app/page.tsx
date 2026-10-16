"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { AuthGate } from "@/components/auth/AuthGate";
import { EmptyState } from "@/components/game/EmptyState";
import { ErrorState } from "@/components/game/ErrorState";
import { GameHeader } from "@/components/game/GameHeader";
import { LoadingState } from "@/components/game/LoadingState";
import { ModeSelection } from "@/components/game/ModeSelection";
import { QuestionCard } from "@/components/game/QuestionCard";
import { getGameModeOption } from "@/lib/gameModes";
import type {
  ApiErrorResponse,
  Choice,
  GameModeOption,
  PlayMode,
  Question,
  RandomQuestionResponse,
  VoteResponse
} from "@/types/game";

const RECENT_QUESTIONS_KEY = "would-you-rather:recent-question-ids";
const MAX_RECENT_QUESTIONS = 12;

type GameStatus = "loading" | "ready" | "empty" | "error";

function getRecentQuestionsKey(mode: PlayMode) {
  return `${RECENT_QUESTIONS_KEY}:${mode}`;
}

function readRecentQuestionIds(mode: PlayMode) {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(getRecentQuestionsKey(mode));
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed)
      ? parsed.filter((id): id is string => typeof id === "string")
      : [];
  } catch {
    return [];
  }
}

function rememberQuestionId(mode: PlayMode, questionId: string) {
  const recentIds = readRecentQuestionIds(mode).filter((id) => id !== questionId);
  const nextIds = [questionId, ...recentIds].slice(0, MAX_RECENT_QUESTIONS);
  window.localStorage.setItem(getRecentQuestionsKey(mode), JSON.stringify(nextIds));
}

async function readApiError(response: Response) {
  try {
    const body = (await response.json()) as ApiErrorResponse;
    return body.error || "Something went wrong.";
  } catch {
    return "Something went wrong.";
  }
}

export default function Home() {
  const { isLoaded, isSignedIn } = useUser();

  // Signed-out players can opt to play as a guest; the choice persists for the
  // browser session so the gate does not reappear on every reload.
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    try {
      setIsGuest(window.sessionStorage.getItem("wyr:guest") === "1");
    } catch {
      // Session storage may be unavailable; the gate just reappears.
    }
  }, []);

  const handlePlayAsGuest = useCallback(() => {
    try {
      window.sessionStorage.setItem("wyr:guest", "1");
    } catch {
      // Ignore; guest mode still applies for this render.
    }
    setIsGuest(true);
  }, []);

  const [status, setStatus] = useState<GameStatus>("loading");
  const [selectedMode, setSelectedMode] = useState<GameModeOption | null>(null);
  const [question, setQuestion] = useState<Question | null>(null);
  const [selectedChoice, setSelectedChoice] = useState<Choice | null>(null);
  const [isVoting, setIsVoting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Holds the next question fetched in the background so "Next question" is
  // instant. A ref (not state) tracks the active mode so a prefetch that
  // resolves after the player switches modes is discarded.
  const [prefetched, setPrefetched] = useState<Question | null>(null);
  const activeModeRef = useRef<PlayMode | null>(null);

  useEffect(() => {
    activeModeRef.current = selectedMode?.value ?? null;
  }, [selectedMode]);

  const fetchRandomQuestion = useCallback(async (mode: PlayMode) => {
    const recentIds = readRecentQuestionIds(mode);
    const params = new URLSearchParams({ mode });

    if (recentIds.length > 0) {
      params.set("exclude", recentIds.join(","));
    }

    const response = await fetch(`/api/questions/random?${params.toString()}`, {
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error(await readApiError(response));
    }

    const data = (await response.json()) as RandomQuestionResponse;
    return data.question;
  }, []);

  const prefetchNext = useCallback(
    async (mode: PlayMode) => {
      try {
        const next = await fetchRandomQuestion(mode);

        if (next && activeModeRef.current === mode) {
          setPrefetched(next);
        }
      } catch {
        // Prefetch is best-effort; a failure just falls back to a live load.
      }
    },
    [fetchRandomQuestion]
  );

  const loadQuestion = useCallback(async () => {
    if (!selectedMode) {
      return;
    }

    const mode = selectedMode.value;
    setStatus("loading");
    setSelectedChoice(null);
    setIsVoting(false);
    setErrorMessage("");
    setPrefetched(null);

    try {
      const next = await fetchRandomQuestion(mode);

      if (!next) {
        setQuestion(null);
        setStatus("empty");
        return;
      }

      rememberQuestionId(mode, next.id);
      setQuestion(next);
      setStatus("ready");
      void prefetchNext(mode);
    } catch (error) {
      setQuestion(null);
      setErrorMessage(
        error instanceof Error ? error.message : "Could not load a question."
      );
      setStatus("error");
    }
  }, [selectedMode, fetchRandomQuestion, prefetchNext]);

  useEffect(() => {
    if (selectedMode) {
      void loadQuestion();
    }
  }, [loadQuestion, selectedMode]);

  const handleNext = useCallback(() => {
    if (!selectedMode || !prefetched) {
      void loadQuestion();
      return;
    }

    const next = prefetched;
    const mode = selectedMode.value;
    setPrefetched(null);
    setSelectedChoice(null);
    setIsVoting(false);
    setErrorMessage("");
    rememberQuestionId(mode, next.id);
    setQuestion(next);
    setStatus("ready");
    void prefetchNext(mode);
  }, [selectedMode, prefetched, loadQuestion, prefetchNext]);

  const handleSelectMode = useCallback((mode: GameModeOption) => {
    setSelectedMode(mode);
    setQuestion(null);
    setSelectedChoice(null);
    setIsVoting(false);
    setErrorMessage("");
    setPrefetched(null);
    setStatus("loading");
  }, []);

  const handleChangeMode = useCallback(() => {
    setSelectedMode(null);
    setQuestion(null);
    setSelectedChoice(null);
    setIsVoting(false);
    setErrorMessage("");
    setPrefetched(null);
    setStatus("loading");
  }, []);

  const handleVote = useCallback(
    async (choice: Choice) => {
      if (!question || selectedChoice || isVoting) {
        return;
      }

      setIsVoting(true);
      setErrorMessage("");

      try {
        const response = await fetch("/api/vote", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            questionId: question.id,
            choice
          })
        });

        if (!response.ok) {
          throw new Error(await readApiError(response));
        }

        const data = (await response.json()) as VoteResponse;
        setQuestion(data.question);
        setSelectedChoice(data.selectedChoice);
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : "Could not save your vote."
        );
      } finally {
        setIsVoting(false);
      }
    },
    [isVoting, question, selectedChoice]
  );

  const content = useMemo(() => {
    if (!selectedMode) {
      return <ModeSelection onSelectMode={handleSelectMode} />;
    }

    if (status === "loading") {
      return <LoadingState />;
    }

    if (status === "empty") {
      return (
        <EmptyState
          modeLabel={selectedMode.label}
          onChangeMode={handleChangeMode}
          onRetry={loadQuestion}
        />
      );
    }

    if (status === "error") {
      return (
        <ErrorState
          message={errorMessage}
          onChangeMode={handleChangeMode}
          onRetry={loadQuestion}
        />
      );
    }

    if (!question) {
      return (
        <EmptyState
          modeLabel={selectedMode.label}
          onChangeMode={handleChangeMode}
          onRetry={loadQuestion}
        />
      );
    }

    return (
      <div className="space-y-4">
        <QuestionCard
          isVoting={isVoting}
          mode={getGameModeOption(selectedMode.value)}
          onChangeMode={handleChangeMode}
          onNext={handleNext}
          onVote={handleVote}
          question={question}
          selectedChoice={selectedChoice}
        />
        {errorMessage ? (
          <p className="mx-auto max-w-5xl rounded-md border-2 border-[#111111] bg-[#ffe0d7] px-4 py-3 text-sm font-black text-[#111111] shadow-[6px_6px_0_#111111]">
            {errorMessage}
          </p>
        ) : null}
      </div>
    );
  }, [
    errorMessage,
    handleChangeMode,
    handleNext,
    handleSelectMode,
    handleVote,
    isVoting,
    loadQuestion,
    question,
    selectedMode,
    selectedChoice,
    status
  ]);

  const showGate = isLoaded && !isSignedIn && !isGuest;

  return (
    <main className="min-h-screen pb-10">
      <GameHeader />
      <div className="mx-auto w-full max-w-5xl px-5 py-8 sm:px-8 sm:py-10">
        {!isLoaded ? (
          <LoadingState />
        ) : showGate ? (
          <AuthGate onPlayAsGuest={handlePlayAsGuest} />
        ) : (
          content
        )}
      </div>
    </main>
  );
}
