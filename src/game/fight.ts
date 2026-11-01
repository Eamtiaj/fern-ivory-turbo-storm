import type { Lexicon } from "@/game/lexicon";
import {
  BOUT_SECONDS,
  CLINCH_CD,
  COMBO_WINDOW,
  MAX_HP,
  RACK,
  calloutFor,
  comboLabel,
  impactFor,
  isVowel,
  makeBag,
  scoreWord,
  shuffle,
} from "@/game/letters";
import { RIVALS, type RivalId } from "@/game/rivals";

export type Side = "you" | "rival";
export type Tone = "good" | "bad" | "info";

export type Tile = { id: number; letter: string };

export type Floater = { id: number; side: Side; text: string };

export type BoutLog = {
  id: number;
  side: Side;
  word: string;
  damage: number;
  callout: string;
};

export type Banner = { text: string; tone: Tone };

export type FightStatus = "live" | "done";
export type EndReason = "ko" | "decision" | "towel";

export type FightFx =
  | { type: "hit"; trauma: number; callout: string; ko: boolean; attacker: Side; damage: number; word: string }
  | { type: "miss"; trauma: number }
  | { type: "bell" }
  | { type: "clinch" }
  | { type: "interrupt" }
  | { type: "tile" };

export type FightState = {
  rivalId: RivalId;
  tiles: Tile[];
  selected: number[];
  youHp: number;
  rivalHp: number;
  timeLeft: number;
  comboYou: number;
  comboRival: number;
  lastYou: number;
  lastRival: number;
  simTime: number;
  spent: Set<string>;
  log: BoutLog[];
  clinchCd: number;
  status: FightStatus;
  winner: "you" | "rival" | "draw" | null;
  endReason: EndReason | null;
  bag: string[];
  discard: string[];
  nextId: number;
  aiTimer: number;
  aiWord: string | null;
  aiLen: number;
  banner: Banner | null;
  floaters: Floater[];
  nextFloat: number;
  bestWord: { word: string; damage: number } | null;
  dealtYou: number;
  dealtRival: number;
  recorded: boolean;
  hitstop: number;
};

export type Step = { state: FightState; fx: FightFx[] };

export function countsOf(tiles: Tile[]): number[] {
  const counts = new Array<number>(26).fill(0);
  for (const tile of tiles) {
    const index = tile.letter.charCodeAt(0) - 97;
    if (index >= 0 && index < 26) counts[index]! += 1;
  }
  return counts;
}

export function canSpell(word: string, tiles: Tile[]): boolean {
  const counts = countsOf(tiles);
  for (const letter of word) {
    const index = letter.charCodeAt(0) - 97;
    if (index < 0 || index > 25 || counts[index]! <= 0) return false;
    counts[index]! -= 1;
  }
  return true;
}

export function selectedWord(state: FightState): string {
  const letters = new Map(state.tiles.map((tile) => [tile.id, tile.letter]));
  let word = "";
  for (const id of state.selected) {
    const letter = letters.get(id);
    if (letter) word += letter;
  }
  return word;
}

export function nextStreak(state: FightState, side: Side): number {
  const prev = side === "you" ? state.comboYou : state.comboRival;
  const last = side === "you" ? state.lastYou : state.lastRival;
  if (prev > 0 && state.simTime - last <= COMBO_WINDOW) return prev + 1;
  return 1;
}

function vowelCount(tiles: Tile[]): number {
  let count = 0;
  for (const tile of tiles) if (isVowel(tile.letter)) count += 1;
  return count;
}

function refillRack(
  tiles: Tile[],
  bag: string[],
  discard: string[],
  nextId: number,
): { tiles: Tile[]; bag: string[]; discard: string[]; nextId: number } {
  tiles = tiles.slice();
  bag = bag.slice();
  discard = discard.slice();
  while (tiles.length < RACK && (bag.length > 0 || discard.length > 0)) {
    if (bag.length === 0) {
      bag = shuffle(discard);
      discard = [];
    }
    let index = bag.length - 1;
    if (vowelCount(tiles) < 3) {
      for (let i = bag.length - 1; i >= 0; i--) {
        if (isVowel(bag[i]!)) {
          index = i;
          break;
        }
      }
    }
    const letter = bag[index]!;
    bag.splice(index, 1);
    tiles.push({ id: nextId, letter });
    nextId += 1;
  }
  return { tiles, bag, discard, nextId };
}

function pickOpts(state: FightState) {
  const rival = RIVALS[state.rivalId];
  return {
    letters: state.tiles.map((tile) => tile.letter),
    minLen: rival.minLen,
    maxLen: rival.maxLen,
    commonOnly: rival.commonOnly,
    spent: state.spent,
    style: rival.style,
  };
}

function schedule(state: FightState, lex: Lexicon, scale: number): FightState {
  const rival = RIVALS[state.rivalId];
  const word = lex.pick(pickOpts(state));
  const timer = (word ? rival.think : 0.85) * scale;
  return { ...state, aiWord: word, aiLen: word ? word.length : 0, aiTimer: timer };
}

function consumeWord(tiles: Tile[], word: string, discard: string[]): Tile[] | null {
  const next = tiles.slice();
  for (const letter of word) {
    const index = next.findIndex((tile) => tile.letter === letter);
    if (index < 0) return null;
    discard.push(next[index]!.letter);
    next.splice(index, 1);
  }
  return next;
}

function note(state: FightState, text: string): Step {
  return { state: { ...state, banner: { text, tone: "bad" } }, fx: [{ type: "miss", trauma: 0.14 }] };
}

function finishDecision(state: FightState): Step {
  const winner = state.youHp > state.rivalHp ? "you" : state.rivalHp > state.youHp ? "rival" : "draw";
  const name = RIVALS[state.rivalId].name;
  const text =
    winner === "draw" ? "Split decision." : winner === "you" ? "You take the round." : `${name} takes the round.`;
  return {
    state: {
      ...state,
      status: "done",
      winner,
      endReason: "decision",
      timeLeft: 0,
      aiTimer: 99,
      banner: { text, tone: winner === "you" ? "good" : winner === "draw" ? "info" : "bad" },
    },
    fx: [{ type: "bell" }],
  };
}

function commit(state: FightState, attacker: Side, word: string, lex: Lexicon): Step {
  const discard = state.discard.slice();
  let tiles: Tile[] | null;
  let selected = state.selected;
  if (attacker === "you") {
    const drop = new Set(state.selected);
    tiles = [];
    for (const tile of state.tiles) {
      if (drop.has(tile.id)) discard.push(tile.letter);
      else tiles.push(tile);
    }
    selected = [];
  } else {
    tiles = consumeWord(state.tiles, word, discard);
    if (!tiles) return { state, fx: [] };
    const live = new Set(tiles.map((tile) => tile.id));
    selected = state.selected.filter((id) => live.has(id));
  }

  const filled = refillRack(tiles, state.bag, discard, state.nextId);
  const streak = nextStreak(state, attacker);
  const damage = scoreWord(word, streak);
  const impact = impactFor(word.length);
  const youHp = attacker === "rival" ? Math.max(0, state.youHp - damage) : state.youHp;
  const rivalHp = attacker === "you" ? Math.max(0, state.rivalHp - damage) : state.rivalHp;
  const spent = new Set(state.spent);
  spent.add(word);
  const mult = comboLabel(streak);
  const who = attacker === "you" ? "You" : RIVALS[state.rivalId].name;
  const floater: Floater = {
    id: state.nextFloat,
    side: attacker === "you" ? "rival" : "you",
    text: `−${damage}`,
  };
  const ko = youHp <= 0 || rivalHp <= 0;
  let winner: FightState["winner"] = null;
  let status: FightStatus = "live";
  let endReason: EndReason | null = null;
  if (ko) {
    status = "done";
    endReason = "ko";
    if (youHp <= 0 && rivalHp <= 0) winner = attacker === "you" ? "you" : "rival";
    else if (rivalHp <= 0) winner = "you";
    else winner = "rival";
  }

  let next: FightState = {
    ...state,
    ...filled,
    selected,
    youHp,
    rivalHp,
    comboYou: attacker === "you" ? streak : 0,
    comboRival: attacker === "rival" ? streak : 0,
    lastYou: attacker === "you" ? state.simTime : state.lastYou,
    lastRival: attacker === "rival" ? state.simTime : state.lastRival,
    spent,
    log: [
      { id: state.nextFloat, side: attacker, word, damage, callout: impact.callout },
      ...state.log,
    ].slice(0, 6),
    banner: {
      text: `${who} · ${impact.callout}${mult ? ` ${mult}` : ""} · ${word.toUpperCase()} · ${damage}`,
      tone: attacker === "you" ? "good" : "bad",
    },
    floaters: [...state.floaters, floater].slice(-6),
    nextFloat: state.nextFloat + 1,
    bestWord: attacker === "you" && (!state.bestWord || damage > state.bestWord.damage) ? { word, damage } : state.bestWord,
    dealtYou: state.dealtYou + (attacker === "you" ? damage : 0),
    dealtRival: state.dealtRival + (attacker === "rival" ? damage : 0),
    hitstop: impact.hitstop,
    status,
    winner,
    endReason,
  };

  const fx: FightFx[] = [
    {
      type: "hit",
      trauma: ko ? 1 : impact.trauma,
      callout: impact.callout,
      ko,
      attacker,
      damage,
      word,
    },
  ];
  if (status === "done") return { state: next, fx };
  if (attacker === "rival") next = schedule(next, lex, 1);
  else if (next.aiWord && !canSpell(next.aiWord, next.tiles)) {
    next = schedule(next, lex, 0.42);
    fx.push({ type: "interrupt" });
  }
  return { state: next, fx };
}

function aiClinch(state: FightState, lex: Lexicon): Step {
  const victims = shuffle(state.tiles).slice(0, 4);
  const drop = new Set(victims.map((tile) => tile.id));
  const discard = state.discard.slice();
  const tiles = state.tiles.filter((tile) => {
    if (!drop.has(tile.id)) return true;
    discard.push(tile.letter);
    return false;
  });
  const filled = refillRack(tiles, state.bag, discard, state.nextId);
  const live = new Set(filled.tiles.map((tile) => tile.id));
  let next: FightState = {
    ...state,
    ...filled,
    selected: state.selected.filter((id) => live.has(id)),
    comboRival: 0,
    banner: { text: `${RIVALS[state.rivalId].name} clinches.`, tone: "info" },
  };
  next = schedule(next, lex, 1);
  return { state: next, fx: [{ type: "clinch" }] };
}

export function createFight(rivalId: RivalId, lex: Lexicon): FightState {
  const drawn = refillRack([], makeBag(), [], 1);
  const state: FightState = {
    rivalId,
    tiles: shuffle(drawn.tiles),
    selected: [],
    youHp: MAX_HP,
    rivalHp: MAX_HP,
    timeLeft: BOUT_SECONDS,
    comboYou: 0,
    comboRival: 0,
    lastYou: -99,
    lastRival: -99,
    simTime: 0,
    spent: new Set(),
    log: [],
    clinchCd: 0,
    status: "live",
    winner: null,
    endReason: null,
    bag: drawn.bag,
    discard: drawn.discard,
    nextId: drawn.nextId,
    aiTimer: 0,
    aiWord: null,
    aiLen: 0,
    banner: { text: "Bell. The rack is live.", tone: "info" },
    floaters: [],
    nextFloat: 1,
    bestWord: null,
    dealtYou: 0,
    dealtRival: 0,
    recorded: false,
    hitstop: 0,
  };
  return schedule(state, lex, 1);
}

export function pressTile(state: FightState, id: number): Step {
  if (state.status !== "live") return { state, fx: [] };
  if (!state.tiles.some((tile) => tile.id === id)) return { state, fx: [] };
  const adding = !state.selected.includes(id);
  const selected = adding ? [...state.selected, id] : state.selected.filter((tileId) => tileId !== id);
  return {
    state: {
      ...state,
      selected,
      banner: state.banner?.tone === "bad" ? null : state.banner,
    },
    fx: adding ? [{ type: "tile" }] : [],
  };
}

export function typeLetter(state: FightState, letter: string): Step {
  if (state.status !== "live") return { state, fx: [] };
  const used = new Set(state.selected);
  const tile = state.tiles.find((item) => item.letter === letter && !used.has(item.id));
  if (!tile) return note(state, "Not on the rack.");
  return pressTile(state, tile.id);
}

export function backspace(state: FightState): FightState {
  if (!state.selected.length) return state;
  return {
    ...state,
    selected: state.selected.slice(0, -1),
    banner: state.banner?.tone === "bad" ? null : state.banner,
  };
}

export function submitWord(state: FightState, lex: Lexicon): Step {
  if (state.status !== "live") return { state, fx: [] };
  const word = selectedWord(state);
  if (word.length < 3) return note(state, "Three letters minimum.");
  if (state.spent.has(word)) return note(state, "Already thrown.");
  if (!lex.isWord(word)) return note(state, "Not a word.");
  return commit(state, "you", word, lex);
}

export function clinch(state: FightState, lex: Lexicon): Step {
  if (state.status !== "live") return { state, fx: [] };
  if (state.clinchCd > 0) return note(state, `Clinch in ${Math.ceil(state.clinchCd)}s.`);
  const held = new Set(state.selected);
  const open = state.tiles.filter((tile) => !held.has(tile.id));
  if (open.length === 0) return note(state, "Let go of a few letters.");
  const victims = shuffle(open).slice(0, Math.min(4, open.length));
  const drop = new Set(victims.map((tile) => tile.id));
  const discard = state.discard.slice();
  const tiles = state.tiles.filter((tile) => {
    if (!drop.has(tile.id)) return true;
    discard.push(tile.letter);
    return false;
  });
  const filled = refillRack(tiles, state.bag, discard, state.nextId);
  let next: FightState = {
    ...state,
    ...filled,
    comboYou: 0,
    clinchCd: CLINCH_CD,
    banner: { text: "Clinch. Fresh letters.", tone: "info" },
  };
  const fx: FightFx[] = [{ type: "clinch" }];
  if (next.aiWord && !canSpell(next.aiWord, next.tiles)) {
    next = schedule(next, lex, 0.42);
    fx.push({ type: "interrupt" });
  }
  return { state: next, fx };
}

export function tick(state: FightState, dt: number, lex: Lexicon): Step {
  if (state.status !== "live") return { state, fx: [] };
  dt = Math.min(Math.max(dt, 0), 0.1);
  if (dt === 0) return { state, fx: [] };
  if (state.hitstop > 0) {
    const used = Math.min(state.hitstop, dt);
    const rest = dt - used;
    const frozen = { ...state, hitstop: state.hitstop - used };
    if (rest <= 0.0001 || frozen.hitstop > 0) return { state: frozen, fx: [] };
    return tick(frozen, rest, lex);
  }

  const timeLeft = state.timeLeft - dt;
  const simTime = state.simTime + dt;
  const clinchCd = Math.max(0, state.clinchCd - dt);
  if (timeLeft <= 0) return finishDecision({ ...state, timeLeft: 0, simTime, clinchCd, hitstop: 0 });

  const aiTimer = state.aiTimer - dt;
  const base: FightState = { ...state, timeLeft, simTime, clinchCd, aiTimer };
  if (aiTimer > 0) return { state: base, fx: [] };
  if (base.aiWord && canSpell(base.aiWord, base.tiles)) return commit(base, "rival", base.aiWord, lex);
  const fresh = lex.pick(pickOpts(base));
  if (fresh && canSpell(fresh, base.tiles)) return commit({ ...base, aiWord: fresh, aiLen: fresh.length }, "rival", fresh, lex);
  return aiClinch(base, lex);
}

export function previewHit(state: FightState): { callout: string; damage: number; streak: number } | null {
  const word = selectedWord(state);
  if (word.length < 3) return null;
  const streak = nextStreak(state, "you");
  return { callout: calloutFor(word.length), damage: scoreWord(word, streak), streak };
}
