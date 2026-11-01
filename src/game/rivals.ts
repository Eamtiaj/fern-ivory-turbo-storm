export type RivalId = "kip" | "sable" | "marlow";
export type RivalStyle = "shortest" | "best";

export type Rival = {
  id: RivalId;
  name: string;
  epithet: string;
  blurb: string;
  difficulty: string;
  think: number;
  minLen: number;
  maxLen: number;
  commonOnly: boolean;
  style: RivalStyle;
};

export const RIVALS: Record<RivalId, Rival> = {
  kip: {
    id: "kip",
    name: "Kip",
    epithet: "The warm-up",
    blurb: "Swings short words and leaves the long ones sitting on the rack.",
    difficulty: "Easy",
    think: 4,
    minLen: 3,
    maxLen: 4,
    commonOnly: true,
    style: "shortest",
  },
  sable: {
    id: "sable",
    name: "Sable",
    epithet: "The contender",
    blurb: "Reads the rack and takes the clean five-letter shot.",
    difficulty: "Even",
    think: 2.55,
    minLen: 3,
    maxLen: 6,
    commonOnly: true,
    style: "best",
  },
  marlow: {
    id: "marlow",
    name: "Marlow",
    epithet: "Main event",
    blurb: "Knows the whole book. Will haymaker you if you blink.",
    difficulty: "Hard",
    think: 1.9,
    minLen: 3,
    maxLen: 10,
    commonOnly: false,
    style: "best",
  },
};

export const RIVAL_ORDER: RivalId[] = ["kip", "sable", "marlow"];
