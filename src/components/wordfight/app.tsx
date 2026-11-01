import { useEffect, useRef, useState } from "react";
import { bindAudioLifecycle, playCallout, playTone, setAudioMuted, unlockAudio } from "@/game/audio";
import {
  backspace,
  clinch,
  createFight,
  pressTile,
  submitWord,
  tick,
  typeLetter,
  type FightFx,
  type FightState,
  type Side,
} from "@/game/fight";
import { loadLexicon, type Lexicon } from "@/game/lexicon";
import type { RivalId } from "@/game/rivals";
import { applyResult, loadSave, writeSave, type Save } from "@/game/save";
import { Arena } from "@/components/wordfight/arena";
import { Lobby } from "@/components/wordfight/lobby";
import { Result } from "@/components/wordfight/result";

type Phase = "lobby" | "fight" | "result";
type Boot = "load" | "ready" | "error";
type Anim = { n: number; kind: "go" | "hurt" };

const STILL: Anim = { n: 0, kind: "go" };

export function WordfightApp() {
  const [phase, setPhase] = useState<Phase>("lobby");
  const [boot, setBoot] = useState<Boot>("load");
  const [save, setSave] = useState<Save>(() => ({
    version: 1,
    kos: 0,
    streak: 0,
    bestStreak: 0,
    wins: { kip: 0, sable: 0, marlow: 0 },
    bestHit: null,
    mute: false,
    shake: null,
  }));
  const [snap, setSnap] = useState<FightState | null>(null);
  const [pose, setPose] = useState<{ you: Anim; rival: Anim }>({ you: STILL, rival: STILL });
  const [flash, setFlash] = useState<{ id: number; attacker: Side } | null>(null);
  const [reduce, setReduce] = useState(false);

  const phaseRef = useRef<Phase>("lobby");
  const fightRef = useRef<FightState | null>(null);
  const lexRef = useRef<Lexicon | null>(null);
  const saveRef = useRef(save);
  const shakeRef = useRef<HTMLDivElement>(null);
  const traumaRef = useRef(0);
  const shakeOnRef = useRef(true);
  const timers = useRef<number[]>([]);
  const bootToken = useRef(0);

  saveRef.current = save;
  const shakeOn = save.shake === null ? !reduce : save.shake;
  shakeOnRef.current = shakeOn;

  useEffect(() => {
    bindAudioLifecycle();
    setSave(loadSave());
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduce(media.matches);
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    setAudioMuted(save.mute);
  }, [save.mute]);

  useEffect(() => {
    const token = ++bootToken.current;
    setBoot("load");
    loadLexicon()
      .then((lex) => {
        if (bootToken.current !== token) return;
        lexRef.current = lex;
        setBoot("ready");
      })
      .catch(() => {
        if (bootToken.current !== token) return;
        setBoot("error");
      });
  }, [bootToken]);

  useEffect(() => {
    let frame = 0;
    let last = performance.now();
    let publish = 0;
    const loop = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      const lex = lexRef.current;
      const current = fightRef.current;
      if (phaseRef.current === "fight" && current && current.status === "live" && lex) {
        const step = tick(current, dt, lex);
        let next = step.state;
        if (step.fx.length) handleFx(step.fx, next);
        if (next.status === "done" && !next.recorded) {
          next = record(next);
          const delay = next.endReason === "ko" ? 1100 : 650;
          const timer = window.setTimeout(() => {
            if (phaseRef.current === "fight") go("result");
          }, delay);
          timers.current.push(timer);
        }
        fightRef.current = next;
        publish += dt;
        if (step.fx.length || publish >= 0.1) {
          publish = 0;
          setSnap(next);
        }
      }
      traumaRef.current = Math.max(0, traumaRef.current - dt * 1.5);
      const el = shakeRef.current;
      if (el) {
        const trauma = traumaRef.current;
        const mag = shakeOnRef.current ? trauma * trauma * 12 : 0;
        if (mag > 0.25) {
          const x = Math.sin(now * 0.041) * mag;
          const y = Math.cos(now * 0.033) * mag * 0.65;
          el.style.transform = `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px)`;
        } else if (el.style.transform) {
          el.style.transform = "";
        }
      }
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    return () => {
      for (const timer of timers.current) window.clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (phase !== "fight") return;
    const onKey = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target instanceof HTMLElement ? event.target : null;
      const onButton = !!target?.closest("button");
      if (onButton && (event.key === "Enter" || event.key === " ")) return;
      if (event.key === "Enter") {
        event.preventDefault();
        strike();
      } else if (event.key === "Backspace") {
        event.preventDefault();
        erase();
      } else if (/^[a-zA-Z]$/.test(event.key)) {
        event.preventDefault();
        type(event.key.toLowerCase());
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase]);

  function go(next: Phase) {
    phaseRef.current = next;
    setPhase(next);
  }

  function record(state: FightState): FightState {
    if (state.recorded) return state;
    const updated = applyResult(saveRef.current, state);
    saveRef.current = updated;
    setSave(updated);
    writeSave(updated);
    return { ...state, recorded: true };
  }

  function handleFx(fx: FightFx[], state: FightState) {
    for (const event of fx) {
      if (event.type === "tile") playTone("tile");
      else if (event.type === "miss") {
        playTone("miss");
        traumaRef.current = Math.min(1, traumaRef.current + event.trauma);
      } else if (event.type === "clinch") playTone("clinch");
      else if (event.type === "bell") playTone("bell");
      else if (event.type === "interrupt") playTone("tile");
      else if (event.type === "hit") {
        traumaRef.current = Math.min(1, traumaRef.current + event.trauma);
        playCallout(event.callout, event.ko);
        setFlash({ id: state.nextFloat, attacker: event.attacker });
        setPose((current) =>
          event.attacker === "you"
            ? {
                you: { n: current.you.n + 1, kind: "go" },
                rival: { n: current.rival.n + 1, kind: "hurt" },
              }
            : {
                you: { n: current.you.n + 1, kind: "hurt" },
                rival: { n: current.rival.n + 1, kind: "go" },
              },
        );
        const floater = state.floaters[state.floaters.length - 1];
        if (floater) {
          const id = floater.id;
          const timer = window.setTimeout(() => {
            const live = fightRef.current;
            if (!live) return;
            const next = { ...live, floaters: live.floaters.filter((item) => item.id !== id) };
            fightRef.current = next;
            setSnap(next);
          }, 820);
          timers.current.push(timer);
        }
      }
    }
  }

  function commit(step: { state: FightState; fx: FightFx[] }) {
    fightRef.current = step.state;
    setSnap(step.state);
    if (step.fx.length) handleFx(step.fx, step.state);
  }

  function start(id: RivalId) {
    const lex = lexRef.current;
    if (!lex) return;
    unlockAudio();
    const fight = createFight(id, lex);
    fightRef.current = fight;
    setSnap(fight);
    setPose({ you: STILL, rival: STILL });
    setFlash(null);
    traumaRef.current = 0;
    go("fight");
    playTone("bell");
  }

  function strike() {
    const lex = lexRef.current;
    const fight = fightRef.current;
    if (!lex || !fight) return;
    commit(submitWord(fight, lex));
  }

  function erase() {
    const fight = fightRef.current;
    if (!fight) return;
    const next = backspace(fight);
    fightRef.current = next;
    setSnap(next);
  }

  function type(letter: string) {
    const fight = fightRef.current;
    if (!fight) return;
    commit(typeLetter(fight, letter));
  }

  function tile(id: number) {
    const fight = fightRef.current;
    if (!fight) return;
    commit(pressTile(fight, id));
  }

  function hold() {
    const lex = lexRef.current;
    const fight = fightRef.current;
    if (!lex || !fight) return;
    commit(clinch(fight, lex));
  }

  function towel() {
    const fight = fightRef.current;
    if (!fight || fight.status !== "live") {
      go("lobby");
      return;
    }
    if (fight.simTime <= 3) {
      go("lobby");
      return;
    }
    const lost: FightState = {
      ...fight,
      status: "done",
      winner: "rival",
      endReason: "towel",
    };
    const recorded = record(lost);
    fightRef.current = recorded;
    setSnap(recorded);
    go("result");
  }

  function toggleMute() {
    unlockAudio();
    const next = { ...saveRef.current, mute: !saveRef.current.mute };
    saveRef.current = next;
    setSave(next);
    writeSave(next);
  }

  function toggleShake() {
    const next = { ...saveRef.current, shake: !shakeOnRef.current };
    saveRef.current = next;
    setSave(next);
    writeSave(next);
  }

  function retry() {
    bootToken.current += 1;
    const token = bootToken.current;
    setBoot("load");
    loadLexicon()
      .then((lex) => {
        if (bootToken.current !== token) return;
        lexRef.current = lex;
        setBoot("ready");
      })
      .catch(() => {
        if (bootToken.current !== token) return;
        setBoot("error");
      });
  }

  if (phase === "fight" && snap) {
    return (
      <Arena
        fight={snap}
        pose={pose}
        mute={save.mute}
        shakeRef={shakeRef}
        flash={flash}
        onTile={tile}
        onSubmit={strike}
        onBackspace={erase}
        onClinch={hold}
        onTowel={towel}
        onMute={toggleMute}
      />
    );
  }

  if (phase === "result" && snap) {
    return <Result fight={snap} streak={save.streak} onRematch={() => start(snap.rivalId)} onCard={() => go("lobby")} />;
  }

  return (
    <Lobby
      boot={boot}
      save={save}
      shakeOn={shakeOn}
      onToggleMute={toggleMute}
      onToggleShake={toggleShake}
      onFight={start}
      onRetry={retry}
    />
  );
}
