import { lengthMult } from "@/game/letters";
import { previewPathPrefix } from "@/lib/preview-path-prefix";

export type PickOpts = {
  letters: string[];
  minLen: number;
  maxLen: number;
  commonOnly: boolean;
  spent: Set<string>;
  style: "shortest" | "best";
};

export type Lexicon = {
  isWord(word: string): boolean;
  pick(opts: PickOpts): string | null;
};

type Node = {
  n: Array<Node | undefined> | null;
  end: 0 | 1 | 2;
};

const VALUE = [1, 3, 3, 2, 1, 4, 2, 4, 1, 8, 5, 1, 3, 1, 1, 3, 10, 1, 1, 1, 1, 4, 4, 8, 4, 10];

function countsOf(letters: string[]): number[] {
  const counts = new Array<number>(26).fill(0);
  for (const letter of letters) {
    const index = letter.charCodeAt(0) - 97;
    if (index >= 0 && index < 26) counts[index]! += 1;
  }
  return counts;
}

export function buildLexicon(wordsText: string, commonText: string): Lexicon {
  const common = new Set<string>();
  for (const line of commonText.split("\n")) {
    const word = line.trim();
    if (word) common.add(word);
  }

  const root: Node = { n: null, end: 0 };
  for (const line of wordsText.split("\n")) {
    const word = line.trim();
    if (word.length < 3) continue;
    let node = root;
    let ok = true;
    for (let i = 0; i < word.length; i++) {
      const index = word.charCodeAt(i) - 97;
      if (index < 0 || index > 25) {
        ok = false;
        break;
      }
      if (!node.n) node.n = new Array(26);
      let child = node.n[index];
      if (!child) {
        child = { n: null, end: 0 };
        node.n[index] = child;
      }
      node = child;
    }
    if (!ok) continue;
    node.end = common.has(word) ? 2 : 1;
  }

  function isWord(word: string): boolean {
    if (word.length < 3) return false;
    let node = root;
    for (let i = 0; i < word.length; i++) {
      const index = word.charCodeAt(i) - 97;
      if (index < 0 || index > 25 || !node.n || !node.n[index]) return false;
      node = node.n[index]!;
    }
    return node.end > 0;
  }

  function pick(opts: PickOpts): string | null {
    const counts = countsOf(opts.letters);
    const path: number[] = [];
    const shortBag: string[] = [];
    let shortLen = 99;
    let shortSeen = 0;
    const best: { word: string; score: number; common: boolean }[] = [];
    const commonRows: { word: string; score: number }[] = [];

    const pathStr = () => {
      let word = "";
      for (const index of path) word += String.fromCharCode(97 + index);
      return word;
    };

    const pushCap = <T extends { score: number }>(list: T[], row: T, cap: number) => {
      if (list.length < cap) {
        list.push(row);
        if (list.length === cap) list.sort((a, b) => b.score - a.score);
        return;
      }
      if (row.score <= list[cap - 1]!.score) return;
      list[cap - 1] = row;
      list.sort((a, b) => b.score - a.score);
    };

    const consider = (node: Node, len: number, raw: number) => {
      if (len < opts.minLen || len > opts.maxLen || !node.end) return;
      if (opts.commonOnly && node.end !== 2) return;
      const word = pathStr();
      if (opts.spent.has(word)) return;
      if (opts.style === "shortest") {
        if (len < shortLen) {
          shortLen = len;
          shortBag.length = 0;
          shortSeen = 0;
        }
        if (len === shortLen) {
          shortSeen += 1;
          if (shortBag.length < 18) shortBag.push(word);
          else {
            const slot = Math.floor(Math.random() * shortSeen);
            if (slot < 18) shortBag[slot] = word;
          }
        }
        return;
      }
      const score = raw * lengthMult(len);
      pushCap(best, { word, score, common: node.end === 2 }, 8);
      if (node.end === 2) pushCap(commonRows, { word, score }, 6);
    };

    const walk = (node: Node, len: number, raw: number) => {
      consider(node, len, raw);
      if (len >= opts.maxLen || !node.n) return;
      for (let index = 0; index < 26; index++) {
        const child = node.n[index];
        if (!child || counts[index]! <= 0) continue;
        counts[index]! -= 1;
        path.push(index);
        walk(child, len + 1, raw + (VALUE[index] ?? 0));
        path.pop();
        counts[index]! += 1;
      }
    };

    walk(root, 0, 0);

    if (opts.style === "shortest") {
      if (!shortBag.length) return null;
      return shortBag[Math.floor(Math.random() * shortBag.length)] ?? null;
    }
    if (!best.length) return null;
    best.sort((a, b) => b.score - a.score);
    const top = best[0]!.score;
    if (!opts.commonOnly && commonRows.length) {
      commonRows.sort((a, b) => b.score - a.score);
      const commonTop = commonRows[0]!.score;
      if (commonTop >= top * 0.62) {
        const pool = commonRows.filter((row) => row.score >= commonTop * 0.9).slice(0, 4);
        return pool[Math.floor(Math.random() * pool.length)]?.word ?? null;
      }
    }
    const pool = best.filter((row) => row.score >= top * 0.9).slice(0, 4);
    return pool[Math.floor(Math.random() * pool.length)]?.word ?? null;
  }

  return { isWord, pick };
}

export async function loadLexicon(): Promise<Lexicon> {
  const prefix =
    typeof window === "undefined"
      ? ""
      : (previewPathPrefix(window.location.hostname, window.location.pathname) ?? "");
  const [wordsRes, commonRes] = await Promise.all([
    fetch(`${prefix}/lexicon/words.txt`),
    fetch(`${prefix}/lexicon/common.txt`),
  ]);
  if (!wordsRes.ok || !commonRes.ok) throw new Error("dictionary unavailable");
  const [wordsText, commonText] = await Promise.all([wordsRes.text(), commonRes.text()]);
  await new Promise((resolve) => setTimeout(resolve, 16));
  return buildLexicon(wordsText, commonText);
}
