export function GameHeader() {
  return (
    <header className="mx-auto flex w-full max-w-5xl flex-col gap-5 px-5 pt-6 sm:px-8 sm:pt-10">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b-2 border-[#111111] pb-5">
        <div>
          <p className="mb-2 w-fit bg-[#f5c84c] px-2 py-1 text-xs font-black uppercase tracking-[0.16em] text-[#111111]">
            One question. Two futures.
          </p>
          <h1 className="max-w-3xl font-serif text-5xl font-black leading-[0.92] text-[#111111] sm:text-7xl">
            Would You Rather?
          </h1>
        </div>
        <div className="max-w-48 rotate-[-2deg] border-2 border-[#111111] bg-[#9fd8cb] px-4 py-3 text-sm font-bold leading-tight text-[#111111] shadow-[6px_6px_0_#111111]">
          Vote, compare the room, then pull another dilemma.
        </div>
      </div>
    </header>
  );
}
