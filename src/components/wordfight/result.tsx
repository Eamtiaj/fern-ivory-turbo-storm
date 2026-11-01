import { BOUT_SECONDS, formatTime } from "@/game/letters";
import type { FightState } from "@/game/fight";
import { RIVALS } from "@/game/rivals";
import { PORTRAITS } from "@/components/wordfight/portraits";

type Props = {
  fight: FightState;
  streak: number;
  onRematch: () => void;
  onCard: () => void;
};

export function Result({ fight, streak, onRematch, onCard }: Props) {
  const rival = RIVALS[fight.rivalId];
  const win = fight.winner === "you";
  const draw = fight.winner === "draw";
  const headline =
    fight.endReason === "ko" && win
      ? "Knockout"
      : fight.endReason === "ko"
        ? "Counted out"
        : fight.endReason === "towel"
          ? "Towel"
          : draw
            ? "Split decision"
            : "Decision";
  const lasted = Math.max(0, BOUT_SECONDS - fight.timeLeft);

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-xl flex-col px-4 py-8 sm:py-14">
      <p className="font-display tracking-widest text-brass">Wordfight</p>
      <h1
        className={`mt-4 font-display text-6xl leading-none tracking-tight sm:text-7xl ${
          win ? "text-brass" : draw ? "text-fg" : "text-primary"
        }`}
      >
        {headline}
      </h1>
      <p className="mt-3 text-lg text-pretty text-muted">
        {win ? "You" : draw ? "Neither of you" : rival.name}{" "}
        {draw ? "gave ground." : win ? `dropped ${rival.name}.` : "keeps the ring."} Streak {streak}.
      </p>

      <div className="mt-8 flex items-center gap-4">
        <img src={PORTRAITS.you} alt="" className="h-16 w-16 rounded-lg object-cover" />
        <p className="font-display text-2xl tracking-wide text-muted">vs</p>
        <img src={PORTRAITS[fight.rivalId]} alt="" className="h-16 w-16 rounded-lg object-cover" />
        <p className="font-display text-3xl tracking-wide text-fg">{rival.name}</p>
      </div>

      <dl className="mt-8 grid grid-cols-2 gap-3">
        <Cell label="You dealt" value={String(fight.dealtYou)} />
        <Cell label="You took" value={String(fight.dealtRival)} />
        <Cell label="Best word" value={fight.bestWord ? fight.bestWord.word.toUpperCase() : "—"} />
        <Cell label="Lasted" value={formatTime(lasted)} />
      </dl>

      <div className="mt-8 flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={onRematch}
          className="h-14 flex-1 rounded-lg bg-primary font-display text-2xl tracking-widest text-primary-ink"
        >
          Rematch
        </button>
        <button
          type="button"
          onClick={onCard}
          className="h-14 flex-1 rounded-lg bg-surface font-display text-2xl tracking-widest text-fg ring-1 ring-line"
        >
          The card
        </button>
      </div>
    </main>
  );
}

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-surface px-4 py-3 ring-1 ring-line">
      <dt className="text-xs tracking-widest text-muted uppercase">{label}</dt>
      <dd className="mt-1 font-display text-3xl tracking-wide text-fg tabular-nums">{value}</dd>
    </div>
  );
}
