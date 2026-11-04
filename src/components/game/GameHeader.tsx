import Link from "next/link";
import { Show, SignInButton, SignOutButton } from "@clerk/nextjs";

const barLinkClass =
  "rounded-full px-3 py-1.5 text-[13px] font-medium text-accent transition-[transform,background-color] duration-150 hover:bg-fill active:scale-[0.96] active:duration-75 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

export function GameHeader() {
  return (
    <>
      <nav className="material-bar sticky top-0 z-20 pt-[env(safe-area-inset-top)]">
        <div className="mx-auto flex h-12 w-full max-w-5xl items-center justify-between gap-3 px-5 sm:px-8">
          <Link
            className="flex items-center gap-2 text-[15px] font-semibold tracking-[-0.01em] text-label"
            href="/"
          >
            <AppGlyph />
            Would You Rather
          </Link>
          <div className="flex items-center gap-1">
            <Show when="signed-out">
              <SignInButton mode="modal">
                <button className={barLinkClass} type="button">
                  Sign in
                </button>
              </SignInButton>
            </Show>
            <Show when="signed-in">
              <Link className={barLinkClass} href="/profile">
                Profile
              </Link>
              <SignOutButton>
                <button className={barLinkClass} type="button">
                  Sign out
                </button>
              </SignOutButton>
            </Show>
          </div>
        </div>
      </nav>

      <header className="animate-rise mx-auto w-full max-w-5xl px-5 pt-10 sm:px-8 sm:pt-16">
        <p className="text-[13px] font-semibold uppercase tracking-[0.06em] text-label-2">
          One question. Two futures.
        </p>
        <h1 className="mt-2 text-[clamp(2.5rem,7vw,4.5rem)] font-bold leading-[1.02] tracking-[-0.035em] text-label">
          Would you rather?
        </h1>
        <p className="mt-3 max-w-xl text-[17px] leading-relaxed text-label-2 sm:text-[19px]">
          Vote, see how everyone else split, then pull another dilemma.
        </p>
      </header>
    </>
  );
}

function AppGlyph() {
  return (
    <span
      aria-hidden="true"
      className="flex size-6 overflow-hidden rounded-[7px] shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.1)]"
    >
      <span className="h-full w-1/2 bg-choice-a" />
      <span className="h-full w-1/2 bg-choice-b" />
    </span>
  );
}
