type Tone = "tile" | "jab" | "cross" | "hook" | "upper" | "hay" | "miss" | "bell" | "clinch" | "ko";

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let sfx: GainNode | null = null;
let bound = false;

function contextCtor(): typeof AudioContext | null {
  if (typeof window === "undefined") return null;
  return window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext ?? null;
}

export function unlockAudio() {
  const Ctor = contextCtor();
  if (!Ctor) return;
  if (!ctx) {
    ctx = new Ctor({ latencyHint: "interactive" });
    master = ctx.createGain();
    sfx = ctx.createGain();
    sfx.connect(master);
    master.connect(ctx.destination);
    master.gain.setValueAtTime(1, ctx.currentTime);
  }
  if (ctx.state === "suspended") void ctx.resume();
}

export function bindAudioLifecycle() {
  if (bound || typeof document === "undefined") return;
  bound = true;
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible" && ctx && ctx.state === "suspended") void ctx.resume();
  });
}

export function setAudioMuted(muted: boolean) {
  if (!ctx || !master) return;
  master.gain.setTargetAtTime(muted ? 0 : 1, ctx.currentTime, 0.02);
}

function envGain(peak: number, duration: number): GainNode | null {
  if (!ctx || !sfx) return null;
  const gain = ctx.createGain();
  const now = ctx.currentTime;
  gain.gain.setValueAtTime(peak, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
  gain.connect(sfx);
  return gain;
}

function tone(freq: number, duration: number, peak: number, type: OscillatorType) {
  if (!ctx) return;
  const gain = envGain(peak, duration);
  if (!gain) return;
  const osc = ctx.createOscillator();
  const rate = 1 + (Math.random() * 2 - 1) * 0.07;
  const now = ctx.currentTime;
  osc.type = type;
  osc.frequency.setValueAtTime(Math.max(40, freq * rate), now);
  osc.connect(gain);
  osc.start(now);
  osc.stop(now + duration + 0.02);
  osc.onended = () => {
    osc.disconnect();
    gain.disconnect();
  };
}

function noise(duration: number, peak: number, cutoff: number) {
  if (!ctx || !sfx) return;
  const samples = Math.max(1, Math.floor(ctx.sampleRate * duration));
  const buffer = ctx.createBuffer(1, samples, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < samples; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / samples);
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(cutoff, ctx.currentTime);
  const gain = envGain(peak, duration);
  if (!gain) return;
  source.connect(filter);
  filter.connect(gain);
  source.start();
  source.onended = () => {
    source.disconnect();
    filter.disconnect();
    gain.disconnect();
  };
}

export function playTone(kind: Tone) {
  if (!ctx || ctx.state !== "running") return;
  if (kind === "tile") tone(740, 0.035, 0.03, "sine");
  else if (kind === "miss") tone(160, 0.07, 0.04, "square");
  else if (kind === "jab") {
    noise(0.06, 0.08, 900);
    tone(180, 0.09, 0.08, "sine");
  } else if (kind === "cross") {
    noise(0.08, 0.1, 800);
    tone(140, 0.12, 0.1, "sine");
  } else if (kind === "hook") {
    noise(0.1, 0.12, 700);
    tone(110, 0.14, 0.12, "sine");
  } else if (kind === "upper") {
    noise(0.12, 0.14, 640);
    tone(90, 0.16, 0.14, "sine");
  } else if (kind === "hay" || kind === "ko") {
    noise(0.2, 0.18, 520);
    tone(70, 0.28, 0.16, "sine");
    tone(48, 0.32, 0.1, "sine");
  } else if (kind === "bell") {
    tone(523, 0.42, 0.07, "sine");
    tone(784, 0.5, 0.045, "sine");
  } else if (kind === "clinch") {
    noise(0.09, 0.06, 1400);
    tone(240, 0.08, 0.03, "triangle");
  }
}

export function playCallout(callout: string, ko: boolean) {
  if (ko) playTone("ko");
  else if (callout === "Haymaker") playTone("hay");
  else if (callout === "Uppercut") playTone("upper");
  else if (callout === "Hook") playTone("hook");
  else if (callout === "Cross") playTone("cross");
  else playTone("jab");
  if (ko) playTone("bell");
}
