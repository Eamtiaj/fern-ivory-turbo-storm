import { RotateCcw, Volume2, VolumeX } from "lucide-react";
import { RIVAL_ORDER, RIVALS, type RivalId } from "@/game/rivals";
import type { Save } from "@/game/save";
import { PORTRAITS } from "@/components/wordfight/portraits";

type Boot = "load" | "ready" | "error";

type Props = {
  boot: Boot;
  save: Save;
  shakeOn: boolean;
  onToggleMute: () => void;
  onToggleShake: () => void;
  onFight: (id: RivalId) => void;
  onRetry: () => void;
};

const RULES = [
  {
    n: "01",
    title: "Spend the letters",
    body: "Tap tiles or type. Three letters minimum. Strike throws the word and those letters leave the rack.",
  },
  {
    n: "02",
    title: "Length hits harder",
    body: "Jab, cross, hook, uppercut, haymaker. Rare letters add weight. Chain before they answer and the flurry climbs.",
  },
  {
    n: "03",
    title: "Steal the shot",
    body: "You share one rack. Use the letters they're measuring, or clinch to redraw four. A clean hit breaks their flurry.",
  },
];

export function Lobby({ boot, save, shakeOn, onToggleMute, onToggleShake, onFight, onRetry }: Props) {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col px-4 py-6 sm:px-8 sm:py-12">
      <header className="flex items-center justify-between gap-3">
        <p className="font-display tracking-widest text-brass">Ten tiles · One rack</p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleShake}
            className="h-11 rounded-full bg-surface px-4 text-sm text-fg ring-1 ring-line"
          >
            Shake {shakeOn ? "on" : "off"}
          </button>
          <button
            type="button"
            onClick={onToggleMute}
            aria-label={save.mute ? "Unmute" : "Mute"}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-surface text-fg ring-1 ring-line"
          >
            {save.mute ? <VolumeX aria-hidden size={20} /> : <Volume2 aria-hidden size={20} />}
          </button>
        </div>
      </header>

      <h1 className="mt-8 font-display text-6xl leading-none tracking-tight text-fg sm:text-8xl">Wordfight</h1>
      <p className="mt-4 max-w-lg text-lg leading-relaxed text-pretty text-muted">
        Spell from a shared rack. Spend the letters. Hit harder than the fighter across the ring.
      </p>

      <dl className="mt-8 grid grid-cols-3 gap-2 sm:gap-3">
        <Stat label="Streak" value={save.streak} />
        <Stat label="Best" value={save.bestStreak} />
        <Stat label="KOs" value={save.kos} />
      </dl>
      {save.bestHit ? (
        <p className="mt-3 text-sm text-muted">
          Best shot{" "}
          <span className="font-display tracking-wide text-fg">{save.bestHit.word.toUpperCase()}</span>
          <span className="tabular-nums text-brass"> · {save.bestHit.damage}</span>
        </p>
      ) : null}

      <section className="mt-10">
        <div className="flex items-end justify-between gap-3">
          <h2 className="font-display text-3xl tracking-wide text-fg">Tonight's card</h2>
          {boot === "load" ? <p className="text-sm text-muted">Opening the dictionary…</p> : null}
          {boot === "error" ? (
            <button type="button" onClick={onRetry} className="inline-flex items-center gap-2 text-sm text-brass">
              <RotateCcw aria-hidden size={16} />
              Retry dictionary
            </button>
          ) : null}
        </div>
        <ul className="mt-4 grid gap-3">
          {RIVAL_ORDER.map((id) => {
            const rival = RIVALS[id];
            return (
              <li key={id}>
                <button
                  type="button"
                  disabled={boot !== "ready"}
                  onClick={() => onFight(id)}
                  className="flex w-full items-center gap-3 rounded-xl bg-surface p-3 text-left ring-1 ring-line motion-safe:transition-transform motion-safe:hover:-translate-y-0.5 disabled:cursor-default disabled:opacity-60 sm:gap-4 sm:p-4"
                >
                  <img
                    src={PORTRAITS[id]}
                    alt=""
                    className="h-20 w-20 shrink-0 rounded-lg object-cover sm:h-24 sm:w-24"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-baseline justify-between gap-2">
                      <span className="font-display text-3xl tracking-wide text-fg">{rival.name}</span>
                      <span className="shrink-0 font-display text-lg tracking-wide text-primary">Fight</span>
                    </span>
                    <span className="mt-1 block text-sm text-brass">
                      {rival.difficulty} · {rival.epithet}
                    </span>
                    <span className="mt-1 block text-sm leading-snug text-pretty text-muted">{rival.blurb}</span>
                    <span className="mt-2 block text-xs tabular-nums tracking-wide text-muted">
                      {save.wins[id]} {save.wins[id] === 1 ? "win" : "wins"}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="mt-10 mb-4">
        <h2 className="font-display text-2xl tracking-wide text-fg">How a round lands</h2>
        <ol className="mt-4 grid gap-4 sm:grid-cols-3">
          {RULES.map((rule) => (
            <li key={rule.n} className="rounded-xl bg-bg-raised p-4 ring-1 ring-line">
              <p className="font-display text-xl tracking-wide text-brass">{rule.n}</p>
              <h3 className="mt-2 font-display text-2xl tracking-wide text-fg">{rule.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-pretty text-muted">{rule.body}</p>
            </li>
          ))}
        </ol>
        <p className="mt-4 text-sm text-muted">Seventy-five seconds. One hundred stamina. Bell or knockout.</p>
      </section>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-surface px-3 py-3 ring-1 ring-line">
      <dt className="text-xs tracking-widest text-muted uppercase">{label}</dt>
      <dd className="font-display text-4xl tabular-nums text-brass">{value}</dd>
    </div>
  );
}
