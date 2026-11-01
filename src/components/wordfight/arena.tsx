import { useEffect, useRef } from "react";
import { Delete, RotateCcw, Volume2, VolumeX } from "lucide-react";
import { MAX_HP, comboLabel, formatTime, isRare, letterValue } from "@/game/letters";
import { previewHit, selectedWord, type FightState } from "@/game/fight";
import { RIVALS } from "@/game/rivals";
import { PORTRAITS } from "@/components/wordfight/portraits";

type Anim = { n: number; kind: "go" | "hurt" };

type Props = {
  fight: FightState;
  pose: { you: Anim; rival: Anim };
  mute: boolean;
  shakeRef: React.RefObject<HTMLDivElement | null>;
  flash: { id: number; attacker: "you" | "rival" } | null;
  onTile: (id: number) => void;
  onSubmit: () => void;
  onBackspace: () => void;
  onClinch: () => void;
  onTowel: () => void;
  onMute: () => void;
};

export function Arena(props: Props) {
  const { fight } = props;
  const rival = RIVALS[fight.rivalId];
  const word = selectedWord(fight);
  const preview = previewHit(fight);
  const ready = word.length >= 3;
  const youRef = useRef<HTMLImageElement>(null);
  const rivalRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    lunge(youRef.current, props.pose.you, 1);
  }, [props.pose.you]);

  useEffect(() => {
    lunge(rivalRef.current, props.pose.rival, -1);
  }, [props.pose.rival]);

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-xl flex-col px-4 py-4 sm:py-8">
      <div ref={props.shakeRef}>
        <div className="ring-canvas relative p-3 sm:p-5">
          {props.flash ? (
            <div
              key={props.flash.id}
              className={`wf-flash pointer-events-none absolute inset-0 z-20 rounded-2xl ${
                props.flash.attacker === "you" ? "bg-brass" : "bg-primary"
              }`}
            />
          ) : null}
          {fight.status === "done" && fight.endReason === "ko" ? (
            <p className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center font-display text-8xl tracking-wide text-fg">
              {fight.winner === "you" ? "KO" : "DOWN"}
            </p>
          ) : null}

          <header className="flex items-center justify-between gap-3">
            <p className="font-display tracking-widest text-brass">Wordfight</p>
            <p
              className={`font-display text-4xl tabular-nums ${fight.timeLeft <= 10 ? "text-primary" : "text-brass"}`}
              aria-label={`${formatTime(fight.timeLeft)} left`}
            >
              {formatTime(fight.timeLeft)}
            </p>
            <button
              type="button"
              onClick={props.onMute}
              aria-label={props.mute ? "Unmute" : "Mute"}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-bg text-fg ring-1 ring-line"
            >
              {props.mute ? <VolumeX aria-hidden size={18} /> : <Volume2 aria-hidden size={18} />}
            </button>
          </header>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <Fighter
              name="You"
              epithet="Southpaw"
              hp={fight.youHp}
              combo={fight.comboYou}
              image={PORTRAITS.you}
              imgRef={youRef}
              bar="brass"
              floaters={fight.floaters.filter((item) => item.side === "you")}
            />
            <Fighter
              name={rival.name}
              epithet={rival.epithet}
              hp={fight.rivalHp}
              combo={fight.comboRival}
              image={PORTRAITS[fight.rivalId]}
              imgRef={rivalRef}
              bar="primary"
              floaters={fight.floaters.filter((item) => item.side === "rival")}
            />
          </div>

          <p
            className={`mt-4 flex min-h-12 items-center justify-center text-center text-base leading-snug font-semibold text-balance ${
              fight.banner?.tone === "good"
                ? "text-brass"
                : fight.banner?.tone === "bad"
                  ? "text-primary"
                  : "text-fg"
            }`}
            aria-live="polite"
          >
            {fight.banner?.text ?? "Build a word. Strike."}
          </p>
          <p className="text-center text-sm text-muted">
            {fight.aiLen > 0
              ? `${rival.name} is measuring a ${fight.aiLen}-letter shot`
              : `${rival.name} is looking for an opening`}
          </p>

          <div className="mt-3 flex min-h-16 flex-col items-center justify-center">
            <p className="font-display text-5xl tracking-widest text-fg sm:text-6xl">
              {word ? word.toUpperCase() : <span className="text-muted">——</span>}
            </p>
            {preview ? (
              <p className="mt-1 text-sm text-muted">
                {preview.callout}
                {comboLabel(preview.streak) ? <span className="text-brass"> {comboLabel(preview.streak)}</span> : null}
                <span className="tabular-nums text-fg"> · {preview.damage}</span>
              </p>
            ) : (
              <p className="mt-1 text-sm text-muted">Three letters to throw</p>
            )}
          </div>

          <div className="mt-3 grid grid-cols-5 gap-2" role="group" aria-label="Letter rack">
            {fight.tiles.map((tile) => {
              const order = fight.selected.indexOf(tile.id);
              const on = order >= 0;
              const rare = isRare(tile.letter);
              return (
                <button
                  key={tile.id}
                  type="button"
                  aria-pressed={on}
                  aria-label={`${tile.letter.toUpperCase()}, ${letterValue(tile.letter)} ${
                    letterValue(tile.letter) === 1 ? "point" : "points"
                  }${on ? ", selected" : ""}`}
                  onClick={() => props.onTile(tile.id)}
                  className={`wf-tile-in relative flex h-14 items-center justify-center rounded-lg font-display text-3xl leading-none motion-safe:transition-transform ${
                    on
                      ? "-translate-y-1 bg-fg text-bg"
                      : `bg-bg-raised ring-1 ring-line ${rare ? "text-brass" : "text-fg"}`
                  }`}
                >
                  {tile.letter.toUpperCase()}
                  <span className={`absolute top-1 right-1 font-body text-xs ${on ? "text-bg" : "text-muted"}`}>
                    {letterValue(tile.letter)}
                  </span>
                  {on ? (
                    <span className="absolute bottom-1 left-1 font-body text-xs text-primary">{order + 1}</span>
                  ) : null}
                </button>
              );
            })}
          </div>

          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={props.onBackspace}
              aria-label="Delete letter"
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-bg text-fg ring-1 ring-line"
            >
              <Delete aria-hidden size={22} />
            </button>
            <button
              type="button"
              onClick={props.onSubmit}
              className={`h-14 flex-1 rounded-lg font-display text-2xl tracking-widest ${
                ready ? "bg-primary text-primary-ink" : "bg-bg text-muted ring-1 ring-line"
              }`}
            >
              {preview ? `Strike · ${preview.damage}` : "Strike"}
            </button>
          </div>
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={props.onClinch}
              className="flex h-12 flex-1 items-center justify-center gap-2 rounded-lg bg-bg text-fg ring-1 ring-line disabled:opacity-50"
            >
              <RotateCcw aria-hidden size={16} />
              <span className="font-display tracking-widest">
                {fight.clinchCd > 0 ? `Clinch ${Math.ceil(fight.clinchCd)}` : "Clinch"}
              </span>
            </button>
            <button
              type="button"
              onClick={props.onTowel}
              className="h-12 rounded-lg px-4 font-display tracking-widest text-muted"
            >
              Towel
            </button>
          </div>
        </div>
      </div>

      {fight.log.length > 0 ? (
        <ul className="mt-4 space-y-1 px-1">
          {fight.log.slice(0, 3).map((entry) => (
            <li key={entry.id} className="flex items-baseline justify-between gap-3 text-sm">
              <span className={entry.side === "you" ? "text-brass" : "text-primary"}>
                {entry.side === "you" ? "You" : rival.name}
              </span>
              <span className="font-display tracking-wide text-fg">{entry.word.toUpperCase()}</span>
              <span className="tabular-nums text-muted">{entry.damage}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </main>
  );
}

function Fighter({
  name,
  epithet,
  hp,
  combo,
  image,
  imgRef,
  bar,
  floaters,
}: {
  name: string;
  epithet: string;
  hp: number;
  combo: number;
  image: string;
  imgRef: React.RefObject<HTMLImageElement | null>;
  bar: "brass" | "primary";
  floaters: { id: number; text: string }[];
}) {
  const pct = Math.max(0, Math.min(100, (hp / MAX_HP) * 100));
  return (
    <article className="relative rounded-xl bg-bg p-2 ring-1 ring-line sm:p-3">
      {floaters.map((floater) => (
        <span
          key={floater.id}
          className="wf-float pointer-events-none absolute top-2 left-1/2 z-10 font-display text-3xl text-primary"
        >
          {floater.text}
        </span>
      ))}
      <div className="flex items-center gap-2">
        <img ref={imgRef} src={image} alt="" className="h-14 w-14 shrink-0 rounded-lg object-cover" />
        <div className="min-w-0 flex-1">
          <h2 className="truncate font-display text-xl tracking-wide text-fg">{name}</h2>
          <p className="truncate text-xs text-muted">{epithet}</p>
        </div>
      </div>
      <div
        className="mt-2 h-2 overflow-hidden rounded-full bg-bg-raised"
        role="meter"
        aria-label={`${name} stamina`}
        aria-valuemin={0}
        aria-valuemax={MAX_HP}
        aria-valuenow={hp}
      >
        <div
          className={`h-full motion-safe:transition-[width] motion-safe:duration-200 ${bar === "brass" ? "bg-brass" : "bg-primary"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-1 flex items-center justify-between text-xs tabular-nums text-muted">
        <span>{hp}</span>
        {combo >= 2 ? <span className="font-display tracking-wide text-brass">Flurry {combo}</span> : <span />}
      </p>
    </article>
  );
}

function lunge(el: HTMLImageElement | null, anim: Anim, sign: number) {
  if (!el || anim.n === 0) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const toward = anim.kind === "go" ? 10 : -8;
  el.animate(
    [
      { transform: "translateX(0)" },
      { transform: `translateX(${toward * sign}px)` },
      { transform: "translateX(0)" },
    ],
    { duration: 280, easing: "ease-out" },
  );
}
