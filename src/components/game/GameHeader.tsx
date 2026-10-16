import Link from "next/link";
import { Show, SignInButton, SignOutButton } from "@clerk/nextjs";

const authLinkClass =
  "rounded-md border-2 border-[#111111] bg-white px-3 py-1.5 text-xs font-black uppercase tracking-[0.1em] text-[#111111] shadow-[3px_3px_0_#111111] transition hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0_#111111]";

export function GameHeader() {
  return (
    <header className="mx-auto flex w-full max-w-5xl flex-col gap-5 px-5 pt-6 sm:px-8 sm:pt-10">
      <div className="flex items-center justify-end gap-3">
        <Show when="signed-out">
          <SignInButton mode="modal">
            <button className={authLinkClass} type="button">
              Sign in
            </button>
          </SignInButton>
        </Show>
        <Show when="signed-in">
          <Link className={authLinkClass} href="/profile">
            Profile
          </Link>
          <SignOutButton>
            <button className={authLinkClass} type="button">
              Sign out
            </button>
          </SignOutButton>
        </Show>
      </div>

      <div className="flex flex-wrap items-end justify-between gap-4 border-b-2 border-[#111111] pb-5">
        <div>
          <p className="mb-2 w-fit bg-[#f5c84c] px-2 py-1 text-xs font-black uppercase tracking-[0.16em] text-[#111111]">
            One question. Two futures.
          </p>
          <h1 className="max-w-3xl font-serif text-4xl font-black leading-[0.95] text-[#111111] sm:text-7xl sm:leading-[0.92]">
            Would You Rather?
          </h1>
        </div>
        <div className="max-w-full rotate-[-2deg] border-2 border-[#111111] bg-[#9fd8cb] px-4 py-3 text-sm font-bold leading-tight text-[#111111] shadow-[6px_6px_0_#111111] sm:max-w-48">
          Vote, compare the room, then pull another dilemma.
        </div>
      </div>
    </header>
  );
}
