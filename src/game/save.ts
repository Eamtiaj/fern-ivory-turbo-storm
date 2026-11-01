import type { FightState } from "@/game/fight";
import type { RivalId } from "@/game/rivals";

export type Save = {
  version: 1;
  kos: number;
  streak: number;
  bestStreak: number;
  wins: Record<RivalId, number>;
  bestHit: { word: string; damage: number } | null;
  mute: boolean;
  shake: boolean | null;
};

const KEY = "wordfight-save-v1";

export function defaultSave(): Save {
  return {
    version: 1,
    kos: 0,
    streak: 0,
    bestStreak: 0,
    wins: { kip: 0, sable: 0, marlow: 0 },
    bestHit: null,
    mute: false,
    shake: null,
  };
}

export function loadSave(): Save {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultSave();
    const parsed = JSON.parse(raw) as Partial<Save>;
    if (parsed.version !== 1) return defaultSave();
    const base = defaultSave();
    return {
      ...base,
      ...parsed,
      wins: { ...base.wins, ...parsed.wins },
      version: 1,
    };
  } catch {
    return defaultSave();
  }
}

export function writeSave(save: Save) {
  try {
    localStorage.setItem(KEY, JSON.stringify(save));
  } catch {
    /* private mode or full storage — the bout still plays */
  }
}

export function applyResult(save: Save, fight: FightState): Save {
  const next: Save = {
    ...save,
    wins: { ...save.wins },
    bestHit: save.bestHit ? { ...save.bestHit } : null,
  };
  if (fight.bestWord && (!next.bestHit || fight.bestWord.damage > next.bestHit.damage)) {
    next.bestHit = { ...fight.bestWord };
  }
  if (fight.winner === "you") {
    next.wins[fight.rivalId] += 1;
    next.streak += 1;
    next.bestStreak = Math.max(next.bestStreak, next.streak);
    if (fight.endReason === "ko") next.kos += 1;
  } else if (fight.winner === "rival") {
    next.streak = 0;
  }
  return next;
}
