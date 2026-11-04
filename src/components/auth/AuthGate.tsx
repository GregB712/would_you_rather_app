"use client";

import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

type AuthGateProps = {
  onPlayAsGuest: () => void;
};

export function AuthGate({ onPlayAsGuest }: AuthGateProps) {
  return (
    <Card className="animate-rise mx-auto w-full max-w-2xl px-6 py-10 text-center sm:px-12 sm:py-14">
      <p className="text-[13px] font-semibold uppercase tracking-[0.06em] text-label-2">
        Before you play
      </p>
      <h2 className="mt-2 text-[28px] font-bold leading-tight tracking-[-0.025em] text-label sm:text-[34px]">
        Sign in to keep every question fresh.
      </h2>
      <p className="mx-auto mt-3 max-w-md text-[17px] leading-relaxed text-label-2">
        Signed in, you never see a question twice until you refresh your pool.
        As a guest, questions can repeat.
      </p>

      <div className="mx-auto mt-8 flex max-w-sm flex-col gap-2">
        <SignInButton mode="modal">
          <Button variant="primary">Sign in</Button>
        </SignInButton>
        <SignUpButton mode="modal">
          <Button variant="secondary">Create account</Button>
        </SignUpButton>
        <Button onClick={onPlayAsGuest} variant="ghost">
          Play as guest
        </Button>
      </div>
    </Card>
  );
}
