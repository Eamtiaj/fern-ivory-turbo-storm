const VALUE = [1, 3, 3, 2, 1, 4, 2, 4, 1, 8, 5, 1, 3, 1, 1, 3, 10, 1, 1, 1, 1, 4, 4, 8, 4, 10];

const FREQ: ReadonlyArray<readonly [string, number]> = [
  ["a", 9],
  ["b", 2],
  ["c", 2],
  ["d", 4],
  ["e", 12],
  ["f", 2],
  ["g", 3],
  ["h", 2],
  ["i", 9],
  ["j", 1],
  ["k", 1],
  ["l", 4],
  ["m", 2],
  ["n", 6],
  ["o", 8],
  ["p", 2],
  ["q", 1],
  ["r", 6],
  ["s", 4],
  ["t", 6],
  ["u", 4],
  ["v", 2],
  ["w", 2],
  ["x", 1],
  ["y", 2],
  ["z", 1],
];

const VOWELS = new Set(["a", "e", "i", "o", "u"]);

export const MAX_HP = 100;
export const BOUT_SECONDS = 75;
export const RACK = 10;
export const COMBO_WINDOW = 4;
export const CLINCH_CD = 10;

export function shuffle<T>(list: T[]): T[] {
  const next = list.slice();
  for (let i = next.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const swap = next[i];
    next[i] = next[j]!;
    next[j] = swap!;
  }
  return next;
}

export function makeBag(): string[] {
  const tiles: string[] = [];
  for (let set = 0; set < 2; set++) {
    for (const [letter, count] of FREQ) {
      for (let i = 0; i < count; i++) tiles.push(letter);
    }
  }
  return shuffle(tiles);
}

export function letterValue(letter: string): number {
  const index = letter.charCodeAt(0) - 97;
  return VALUE[index] ?? 0;
}

export function isRare(letter: string): boolean {
  return letterValue(letter) >= 5;
}

export function isVowel(letter: string): boolean {
  return VOWELS.has(letter);
}

export function lengthMult(length: number): number {
  if (length >= 7) return 3;
  if (length >= 6) return 2.2;
  if (length >= 5) return 1.7;
  if (length >= 4) return 1.3;
  return 1;
}

export function calloutFor(length: number): string {
  if (length >= 7) return "Haymaker";
  if (length >= 6) return "Uppercut";
  if (length >= 5) return "Hook";
  if (length >= 4) return "Cross";
  return "Jab";
}

export function impactFor(length: number): { hitstop: number; trauma: number; callout: string } {
  if (length >= 7) return { hitstop: 0.14, trauma: 0.9, callout: "Haymaker" };
  if (length >= 6) return { hitstop: 0.1, trauma: 0.62, callout: "Uppercut" };
  if (length >= 5) return { hitstop: 0.08, trauma: 0.45, callout: "Hook" };
  if (length >= 4) return { hitstop: 0.055, trauma: 0.3, callout: "Cross" };
  return { hitstop: 0.04, trauma: 0.18, callout: "Jab" };
}

export function comboMultiplier(streak: number): number {
  return Math.min(2, 1 + Math.max(0, streak - 1) * 0.25);
}

export function comboLabel(streak: number): string | null {
  if (streak < 2) return null;
  return `×${Number(comboMultiplier(streak).toFixed(2))}`;
}

export function scoreWord(word: string, streak: number): number {
  let raw = 0;
  for (const letter of word) raw += letterValue(letter);
  return Math.max(4, Math.round(raw * lengthMult(word.length) * comboMultiplier(streak)));
}

export function formatTime(seconds: number): string {
  const total = Math.max(0, Math.ceil(seconds));
  const mins = Math.floor(total / 60);
  const rest = total % 60;
  return `${mins}:${rest.toString().padStart(2, "0")}`;
}
