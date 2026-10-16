"use client";

import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

type AuthGateProps = {
  onPlayAsGuest: () => void;
};

export function AuthGate({ onPlayAsGuest }: AuthGateProps) {
  return (
    <Card className="mx-auto w-full max-w-5xl p-5 sm:p-7">
      <div className="mb-7 max-w-3xl">
        <p className="text-sm font-black uppercase tracking-[0.16em] text-[#d64f2f]">
          Before you play
        </p>
        <h2 className="mt-2 text-3xl font-black leading-tight text-[#111111] sm:text-4xl">
          Sign in to keep every question fresh.
        </h2>
        <p className="mt-3 text-base font-semibold leading-relaxed text-[#4d463a]">
          Signed in, you never see a question twice until you refresh your pool.
          Or jump straight in as a guest, where questions can repeat.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
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
