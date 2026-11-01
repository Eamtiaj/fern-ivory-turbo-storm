import { i as __toESM } from "../_runtime.mjs";
import { K as require_react, b as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as Delete, i as RotateCcw, n as Volume2, t as VolumeX } from "../_libs/lucide-react.mjs";
import { n as previewPathPrefix } from "./router-Bu2yS-Kr.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-DhT9yBBr.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var ctx = null;
var master = null;
var sfx = null;
var bound = false;
function contextCtor() {
	if (typeof window === "undefined") return null;
	return window.AudioContext ?? window.webkitAudioContext ?? null;
}
function unlockAudio() {
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
	if (ctx.state === "suspended") ctx.resume();
}
function bindAudioLifecycle() {
	if (bound || typeof document === "undefined") return;
	bound = true;
	document.addEventListener("visibilitychange", () => {
		if (document.visibilityState === "visible" && ctx && ctx.state === "suspended") ctx.resume();
	});
}
function setAudioMuted(muted) {
	if (!ctx || !master) return;
	master.gain.setTargetAtTime(muted ? 0 : 1, ctx.currentTime, .02);
}
function envGain(peak, duration) {
	if (!ctx || !sfx) return null;
	const gain = ctx.createGain();
	const now = ctx.currentTime;
	gain.gain.setValueAtTime(peak, now);
	gain.gain.exponentialRampToValueAtTime(.001, now + duration);
	gain.connect(sfx);
	return gain;
}
function tone(freq, duration, peak, type) {
	if (!ctx) return;
	const gain = envGain(peak, duration);
	if (!gain) return;
	const osc = ctx.createOscillator();
	const rate = 1 + (Math.random() * 2 - 1) * .07;
	const now = ctx.currentTime;
	osc.type = type;
	osc.frequency.setValueAtTime(Math.max(40, freq * rate), now);
	osc.connect(gain);
	osc.start(now);
	osc.stop(now + duration + .02);
	osc.onended = () => {
		osc.disconnect();
		gain.disconnect();
	};
}
function noise(duration, peak, cutoff) {
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
function playTone(kind) {
	if (!ctx || ctx.state !== "running") return;
	if (kind === "tile") tone(740, .035, .03, "sine");
	else if (kind === "miss") tone(160, .07, .04, "square");
	else if (kind === "jab") {
		noise(.06, .08, 900);
		tone(180, .09, .08, "sine");
	} else if (kind === "cross") {
		noise(.08, .1, 800);
		tone(140, .12, .1, "sine");
	} else if (kind === "hook") {
		noise(.1, .12, 700);
		tone(110, .14, .12, "sine");
	} else if (kind === "upper") {
		noise(.12, .14, 640);
		tone(90, .16, .14, "sine");
	} else if (kind === "hay" || kind === "ko") {
		noise(.2, .18, 520);
		tone(70, .28, .16, "sine");
		tone(48, .32, .1, "sine");
	} else if (kind === "bell") {
		tone(523, .42, .07, "sine");
		tone(784, .5, .045, "sine");
	} else if (kind === "clinch") {
		noise(.09, .06, 1400);
		tone(240, .08, .03, "triangle");
	}
}
function playCallout(callout, ko) {
	if (ko) playTone("ko");
	else if (callout === "Haymaker") playTone("hay");
	else if (callout === "Uppercut") playTone("upper");
	else if (callout === "Hook") playTone("hook");
	else if (callout === "Cross") playTone("cross");
	else playTone("jab");
	if (ko) playTone("bell");
}
var VALUE$1 = [
	1,
	3,
	3,
	2,
	1,
	4,
	2,
	4,
	1,
	8,
	5,
	1,
	3,
	1,
	1,
	3,
	10,
	1,
	1,
	1,
	1,
	4,
	4,
	8,
	4,
	10
];
var FREQ = [
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
	["z", 1]
];
var VOWELS = /* @__PURE__ */ new Set([
	"a",
	"e",
	"i",
	"o",
	"u"
]);
function shuffle(list) {
	const next = list.slice();
	for (let i = next.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		const swap = next[i];
		next[i] = next[j];
		next[j] = swap;
	}
	return next;
}
function makeBag() {
	const tiles = [];
	for (let set = 0; set < 2; set++) for (const [letter, count] of FREQ) for (let i = 0; i < count; i++) tiles.push(letter);
	return shuffle(tiles);
}
function letterValue(letter) {
	return VALUE$1[letter.charCodeAt(0) - 97] ?? 0;
}
function isRare(letter) {
	return letterValue(letter) >= 5;
}
function isVowel(letter) {
	return VOWELS.has(letter);
}
function lengthMult(length) {
	if (length >= 7) return 3;
	if (length >= 6) return 2.2;
	if (length >= 5) return 1.7;
	if (length >= 4) return 1.3;
	return 1;
}
function calloutFor(length) {
	if (length >= 7) return "Haymaker";
	if (length >= 6) return "Uppercut";
	if (length >= 5) return "Hook";
	if (length >= 4) return "Cross";
	return "Jab";
}
function impactFor(length) {
	if (length >= 7) return {
		hitstop: .14,
		trauma: .9,
		callout: "Haymaker"
	};
	if (length >= 6) return {
		hitstop: .1,
		trauma: .62,
		callout: "Uppercut"
	};
	if (length >= 5) return {
		hitstop: .08,
		trauma: .45,
		callout: "Hook"
	};
	if (length >= 4) return {
		hitstop: .055,
		trauma: .3,
		callout: "Cross"
	};
	return {
		hitstop: .04,
		trauma: .18,
		callout: "Jab"
	};
}
function comboMultiplier(streak) {
	return Math.min(2, 1 + Math.max(0, streak - 1) * .25);
}
function comboLabel(streak) {
	if (streak < 2) return null;
	return `×${Number(comboMultiplier(streak).toFixed(2))}`;
}
function scoreWord(word, streak) {
	let raw = 0;
	for (const letter of word) raw += letterValue(letter);
	return Math.max(4, Math.round(raw * lengthMult(word.length) * comboMultiplier(streak)));
}
function formatTime(seconds) {
	const total = Math.max(0, Math.ceil(seconds));
	return `${Math.floor(total / 60)}:${(total % 60).toString().padStart(2, "0")}`;
}
var RIVALS = {
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
		style: "shortest"
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
		style: "best"
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
		style: "best"
	}
};
var RIVAL_ORDER = [
	"kip",
	"sable",
	"marlow"
];
function countsOf$1(tiles) {
	const counts = new Array(26).fill(0);
	for (const tile of tiles) {
		const index = tile.letter.charCodeAt(0) - 97;
		if (index >= 0 && index < 26) counts[index] += 1;
	}
	return counts;
}
function canSpell(word, tiles) {
	const counts = countsOf$1(tiles);
	for (const letter of word) {
		const index = letter.charCodeAt(0) - 97;
		if (index < 0 || index > 25 || counts[index] <= 0) return false;
		counts[index] -= 1;
	}
	return true;
}
function selectedWord(state) {
	const letters = new Map(state.tiles.map((tile) => [tile.id, tile.letter]));
	let word = "";
	for (const id of state.selected) {
		const letter = letters.get(id);
		if (letter) word += letter;
	}
	return word;
}
function nextStreak(state, side) {
	const prev = side === "you" ? state.comboYou : state.comboRival;
	const last = side === "you" ? state.lastYou : state.lastRival;
	if (prev > 0 && state.simTime - last <= 4) return prev + 1;
	return 1;
}
function vowelCount(tiles) {
	let count = 0;
	for (const tile of tiles) if (isVowel(tile.letter)) count += 1;
	return count;
}
function refillRack(tiles, bag, discard, nextId) {
	tiles = tiles.slice();
	bag = bag.slice();
	discard = discard.slice();
	while (tiles.length < 10 && (bag.length > 0 || discard.length > 0)) {
		if (bag.length === 0) {
			bag = shuffle(discard);
			discard = [];
		}
		let index = bag.length - 1;
		if (vowelCount(tiles) < 3) {
			for (let i = bag.length - 1; i >= 0; i--) if (isVowel(bag[i])) {
				index = i;
				break;
			}
		}
		const letter = bag[index];
		bag.splice(index, 1);
		tiles.push({
			id: nextId,
			letter
		});
		nextId += 1;
	}
	return {
		tiles,
		bag,
		discard,
		nextId
	};
}
function pickOpts(state) {
	const rival = RIVALS[state.rivalId];
	return {
		letters: state.tiles.map((tile) => tile.letter),
		minLen: rival.minLen,
		maxLen: rival.maxLen,
		commonOnly: rival.commonOnly,
		spent: state.spent,
		style: rival.style
	};
}
function schedule(state, lex, scale) {
	const rival = RIVALS[state.rivalId];
	const word = lex.pick(pickOpts(state));
	const timer = (word ? rival.think : .85) * scale;
	return {
		...state,
		aiWord: word,
		aiLen: word ? word.length : 0,
		aiTimer: timer
	};
}
function consumeWord(tiles, word, discard) {
	const next = tiles.slice();
	for (const letter of word) {
		const index = next.findIndex((tile) => tile.letter === letter);
		if (index < 0) return null;
		discard.push(next[index].letter);
		next.splice(index, 1);
	}
	return next;
}
function note(state, text) {
	return {
		state: {
			...state,
			banner: {
				text,
				tone: "bad"
			}
		},
		fx: [{
			type: "miss",
			trauma: .14
		}]
	};
}
function finishDecision(state) {
	const winner = state.youHp > state.rivalHp ? "you" : state.rivalHp > state.youHp ? "rival" : "draw";
	const name = RIVALS[state.rivalId].name;
	const text = winner === "draw" ? "Split decision." : winner === "you" ? "You take the round." : `${name} takes the round.`;
	return {
		state: {
			...state,
			status: "done",
			winner,
			endReason: "decision",
			timeLeft: 0,
			aiTimer: 99,
			banner: {
				text,
				tone: winner === "you" ? "good" : winner === "draw" ? "info" : "bad"
			}
		},
		fx: [{ type: "bell" }]
	};
}
function commit(state, attacker, word, lex) {
	const discard = state.discard.slice();
	let tiles;
	let selected = state.selected;
	if (attacker === "you") {
		const drop = new Set(state.selected);
		tiles = [];
		for (const tile of state.tiles) if (drop.has(tile.id)) discard.push(tile.letter);
		else tiles.push(tile);
		selected = [];
	} else {
		tiles = consumeWord(state.tiles, word, discard);
		if (!tiles) return {
			state,
			fx: []
		};
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
	const floater = {
		id: state.nextFloat,
		side: attacker === "you" ? "rival" : "you",
		text: `−${damage}`
	};
	const ko = youHp <= 0 || rivalHp <= 0;
	let winner = null;
	let status = "live";
	let endReason = null;
	if (ko) {
		status = "done";
		endReason = "ko";
		if (youHp <= 0 && rivalHp <= 0) winner = attacker === "you" ? "you" : "rival";
		else if (rivalHp <= 0) winner = "you";
		else winner = "rival";
	}
	let next = {
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
		log: [{
			id: state.nextFloat,
			side: attacker,
			word,
			damage,
			callout: impact.callout
		}, ...state.log].slice(0, 6),
		banner: {
			text: `${who} · ${impact.callout}${mult ? ` ${mult}` : ""} · ${word.toUpperCase()} · ${damage}`,
			tone: attacker === "you" ? "good" : "bad"
		},
		floaters: [...state.floaters, floater].slice(-6),
		nextFloat: state.nextFloat + 1,
		bestWord: attacker === "you" && (!state.bestWord || damage > state.bestWord.damage) ? {
			word,
			damage
		} : state.bestWord,
		dealtYou: state.dealtYou + (attacker === "you" ? damage : 0),
		dealtRival: state.dealtRival + (attacker === "rival" ? damage : 0),
		hitstop: impact.hitstop,
		status,
		winner,
		endReason
	};
	const fx = [{
		type: "hit",
		trauma: ko ? 1 : impact.trauma,
		callout: impact.callout,
		ko,
		attacker,
		damage,
		word
	}];
	if (status === "done") return {
		state: next,
		fx
	};
	if (attacker === "rival") next = schedule(next, lex, 1);
	else if (next.aiWord && !canSpell(next.aiWord, next.tiles)) {
		next = schedule(next, lex, .42);
		fx.push({ type: "interrupt" });
	}
	return {
		state: next,
		fx
	};
}
function aiClinch(state, lex) {
	const victims = shuffle(state.tiles).slice(0, 4);
	const drop = new Set(victims.map((tile) => tile.id));
	const discard = state.discard.slice();
	const filled = refillRack(state.tiles.filter((tile) => {
		if (!drop.has(tile.id)) return true;
		discard.push(tile.letter);
		return false;
	}), state.bag, discard, state.nextId);
	const live = new Set(filled.tiles.map((tile) => tile.id));
	let next = {
		...state,
		...filled,
		selected: state.selected.filter((id) => live.has(id)),
		comboRival: 0,
		banner: {
			text: `${RIVALS[state.rivalId].name} clinches.`,
			tone: "info"
		}
	};
	next = schedule(next, lex, 1);
	return {
		state: next,
		fx: [{ type: "clinch" }]
	};
}
function createFight(rivalId, lex) {
	const drawn = refillRack([], makeBag(), [], 1);
	return schedule({
		rivalId,
		tiles: shuffle(drawn.tiles),
		selected: [],
		youHp: 100,
		rivalHp: 100,
		timeLeft: 75,
		comboYou: 0,
		comboRival: 0,
		lastYou: -99,
		lastRival: -99,
		simTime: 0,
		spent: /* @__PURE__ */ new Set(),
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
		banner: {
			text: "Bell. The rack is live.",
			tone: "info"
		},
		floaters: [],
		nextFloat: 1,
		bestWord: null,
		dealtYou: 0,
		dealtRival: 0,
		recorded: false,
		hitstop: 0
	}, lex, 1);
}
function pressTile(state, id) {
	if (state.status !== "live") return {
		state,
		fx: []
	};
	if (!state.tiles.some((tile) => tile.id === id)) return {
		state,
		fx: []
	};
	const adding = !state.selected.includes(id);
	const selected = adding ? [...state.selected, id] : state.selected.filter((tileId) => tileId !== id);
	return {
		state: {
			...state,
			selected,
			banner: state.banner?.tone === "bad" ? null : state.banner
		},
		fx: adding ? [{ type: "tile" }] : []
	};
}
function typeLetter(state, letter) {
	if (state.status !== "live") return {
		state,
		fx: []
	};
	const used = new Set(state.selected);
	const tile = state.tiles.find((item) => item.letter === letter && !used.has(item.id));
	if (!tile) return note(state, "Not on the rack.");
	return pressTile(state, tile.id);
}
function backspace(state) {
	if (!state.selected.length) return state;
	return {
		...state,
		selected: state.selected.slice(0, -1),
		banner: state.banner?.tone === "bad" ? null : state.banner
	};
}
function submitWord(state, lex) {
	if (state.status !== "live") return {
		state,
		fx: []
	};
	const word = selectedWord(state);
	if (word.length < 3) return note(state, "Three letters minimum.");
	if (state.spent.has(word)) return note(state, "Already thrown.");
	if (!lex.isWord(word)) return note(state, "Not a word.");
	return commit(state, "you", word, lex);
}
function clinch(state, lex) {
	if (state.status !== "live") return {
		state,
		fx: []
	};
	if (state.clinchCd > 0) return note(state, `Clinch in ${Math.ceil(state.clinchCd)}s.`);
	const held = new Set(state.selected);
	const open = state.tiles.filter((tile) => !held.has(tile.id));
	if (open.length === 0) return note(state, "Let go of a few letters.");
	const victims = shuffle(open).slice(0, Math.min(4, open.length));
	const drop = new Set(victims.map((tile) => tile.id));
	const discard = state.discard.slice();
	const filled = refillRack(state.tiles.filter((tile) => {
		if (!drop.has(tile.id)) return true;
		discard.push(tile.letter);
		return false;
	}), state.bag, discard, state.nextId);
	let next = {
		...state,
		...filled,
		comboYou: 0,
		clinchCd: 10,
		banner: {
			text: "Clinch. Fresh letters.",
			tone: "info"
		}
	};
	const fx = [{ type: "clinch" }];
	if (next.aiWord && !canSpell(next.aiWord, next.tiles)) {
		next = schedule(next, lex, .42);
		fx.push({ type: "interrupt" });
	}
	return {
		state: next,
		fx
	};
}
function tick(state, dt, lex) {
	if (state.status !== "live") return {
		state,
		fx: []
	};
	dt = Math.min(Math.max(dt, 0), .1);
	if (dt === 0) return {
		state,
		fx: []
	};
	if (state.hitstop > 0) {
		const used = Math.min(state.hitstop, dt);
		const rest = dt - used;
		const frozen = {
			...state,
			hitstop: state.hitstop - used
		};
		if (rest <= 1e-4 || frozen.hitstop > 0) return {
			state: frozen,
			fx: []
		};
		return tick(frozen, rest, lex);
	}
	const timeLeft = state.timeLeft - dt;
	const simTime = state.simTime + dt;
	const clinchCd = Math.max(0, state.clinchCd - dt);
	if (timeLeft <= 0) return finishDecision({
		...state,
		timeLeft: 0,
		simTime,
		clinchCd,
		hitstop: 0
	});
	const aiTimer = state.aiTimer - dt;
	const base = {
		...state,
		timeLeft,
		simTime,
		clinchCd,
		aiTimer
	};
	if (aiTimer > 0) return {
		state: base,
		fx: []
	};
	if (base.aiWord && canSpell(base.aiWord, base.tiles)) return commit(base, "rival", base.aiWord, lex);
	const fresh = lex.pick(pickOpts(base));
	if (fresh && canSpell(fresh, base.tiles)) return commit({
		...base,
		aiWord: fresh,
		aiLen: fresh.length
	}, "rival", fresh, lex);
	return aiClinch(base, lex);
}
function previewHit(state) {
	const word = selectedWord(state);
	if (word.length < 3) return null;
	const streak = nextStreak(state, "you");
	return {
		callout: calloutFor(word.length),
		damage: scoreWord(word, streak),
		streak
	};
}
var VALUE = [
	1,
	3,
	3,
	2,
	1,
	4,
	2,
	4,
	1,
	8,
	5,
	1,
	3,
	1,
	1,
	3,
	10,
	1,
	1,
	1,
	1,
	4,
	4,
	8,
	4,
	10
];
function countsOf(letters) {
	const counts = new Array(26).fill(0);
	for (const letter of letters) {
		const index = letter.charCodeAt(0) - 97;
		if (index >= 0 && index < 26) counts[index] += 1;
	}
	return counts;
}
function buildLexicon(wordsText, commonText) {
	const common = /* @__PURE__ */ new Set();
	for (const line of commonText.split("\n")) {
		const word = line.trim();
		if (word) common.add(word);
	}
	const root = {
		n: null,
		end: 0
	};
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
				child = {
					n: null,
					end: 0
				};
				node.n[index] = child;
			}
			node = child;
		}
		if (!ok) continue;
		node.end = common.has(word) ? 2 : 1;
	}
	function isWord(word) {
		if (word.length < 3) return false;
		let node = root;
		for (let i = 0; i < word.length; i++) {
			const index = word.charCodeAt(i) - 97;
			if (index < 0 || index > 25 || !node.n || !node.n[index]) return false;
			node = node.n[index];
		}
		return node.end > 0;
	}
	function pick(opts) {
		const counts = countsOf(opts.letters);
		const path = [];
		const shortBag = [];
		let shortLen = 99;
		let shortSeen = 0;
		const best = [];
		const commonRows = [];
		const pathStr = () => {
			let word = "";
			for (const index of path) word += String.fromCharCode(97 + index);
			return word;
		};
		const pushCap = (list, row, cap) => {
			if (list.length < cap) {
				list.push(row);
				if (list.length === cap) list.sort((a, b) => b.score - a.score);
				return;
			}
			if (row.score <= list[cap - 1].score) return;
			list[cap - 1] = row;
			list.sort((a, b) => b.score - a.score);
		};
		const consider = (node, len, raw) => {
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
			pushCap(best, {
				word,
				score,
				common: node.end === 2
			}, 8);
			if (node.end === 2) pushCap(commonRows, {
				word,
				score
			}, 6);
		};
		const walk = (node, len, raw) => {
			consider(node, len, raw);
			if (len >= opts.maxLen || !node.n) return;
			for (let index = 0; index < 26; index++) {
				const child = node.n[index];
				if (!child || counts[index] <= 0) continue;
				counts[index] -= 1;
				path.push(index);
				walk(child, len + 1, raw + (VALUE[index] ?? 0));
				path.pop();
				counts[index] += 1;
			}
		};
		walk(root, 0, 0);
		if (opts.style === "shortest") {
			if (!shortBag.length) return null;
			return shortBag[Math.floor(Math.random() * shortBag.length)] ?? null;
		}
		if (!best.length) return null;
		best.sort((a, b) => b.score - a.score);
		const top = best[0].score;
		if (!opts.commonOnly && commonRows.length) {
			commonRows.sort((a, b) => b.score - a.score);
			const commonTop = commonRows[0].score;
			if (commonTop >= top * .62) {
				const pool = commonRows.filter((row) => row.score >= commonTop * .9).slice(0, 4);
				return pool[Math.floor(Math.random() * pool.length)]?.word ?? null;
			}
		}
		const pool = best.filter((row) => row.score >= top * .9).slice(0, 4);
		return pool[Math.floor(Math.random() * pool.length)]?.word ?? null;
	}
	return {
		isWord,
		pick
	};
}
async function loadLexicon() {
	const prefix = typeof window === "undefined" ? "" : previewPathPrefix(window.location.hostname, window.location.pathname) ?? "";
	const [wordsRes, commonRes] = await Promise.all([fetch(`${prefix}/lexicon/words.txt`), fetch(`${prefix}/lexicon/common.txt`)]);
	if (!wordsRes.ok || !commonRes.ok) throw new Error("dictionary unavailable");
	const [wordsText, commonText] = await Promise.all([wordsRes.text(), commonRes.text()]);
	await new Promise((resolve) => setTimeout(resolve, 16));
	return buildLexicon(wordsText, commonText);
}
var KEY = "wordfight-save-v1";
function defaultSave() {
	return {
		version: 1,
		kos: 0,
		streak: 0,
		bestStreak: 0,
		wins: {
			kip: 0,
			sable: 0,
			marlow: 0
		},
		bestHit: null,
		mute: false,
		shake: null
	};
}
function loadSave() {
	try {
		const raw = localStorage.getItem(KEY);
		if (!raw) return defaultSave();
		const parsed = JSON.parse(raw);
		if (parsed.version !== 1) return defaultSave();
		const base = defaultSave();
		return {
			...base,
			...parsed,
			wins: {
				...base.wins,
				...parsed.wins
			},
			version: 1
		};
	} catch {
		return defaultSave();
	}
}
function writeSave(save) {
	try {
		localStorage.setItem(KEY, JSON.stringify(save));
	} catch {}
}
function applyResult(save, fight) {
	const next = {
		...save,
		wins: { ...save.wins },
		bestHit: save.bestHit ? { ...save.bestHit } : null
	};
	if (fight.bestWord && (!next.bestHit || fight.bestWord.damage > next.bestHit.damage)) next.bestHit = { ...fight.bestWord };
	if (fight.winner === "you") {
		next.wins[fight.rivalId] += 1;
		next.streak += 1;
		next.bestStreak = Math.max(next.bestStreak, next.streak);
		if (fight.endReason === "ko") next.kos += 1;
	} else if (fight.winner === "rival") next.streak = 0;
	return next;
}
var PORTRAITS = {
	you: "/assets/you-CdvlULHu.jpg",
	kip: "/assets/kip-BtlS28dy.jpg",
	sable: "/assets/sable-B_YFedk6.jpg",
	marlow: "/assets/marlow-Dgye-5uM.jpg"
};
function Arena(props) {
	const { fight } = props;
	const rival = RIVALS[fight.rivalId];
	const word = selectedWord(fight);
	const preview = previewHit(fight);
	const ready = word.length >= 3;
	const youRef = (0, import_react.useRef)(null);
	const rivalRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		lunge(youRef.current, props.pose.you, 1);
	}, [props.pose.you]);
	(0, import_react.useEffect)(() => {
		lunge(rivalRef.current, props.pose.rival, -1);
	}, [props.pose.rival]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto flex min-h-dvh w-full max-w-xl flex-col px-4 py-4 sm:py-8",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			ref: props.shakeRef,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "ring-canvas relative p-3 sm:p-5",
				children: [
					props.flash ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: `wf-flash pointer-events-none absolute inset-0 z-20 rounded-2xl ${props.flash.attacker === "you" ? "bg-brass" : "bg-primary"}` }, props.flash.id) : null,
					fight.status === "done" && fight.endReason === "ko" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "pointer-events-none absolute inset-0 z-30 flex items-center justify-center font-display text-8xl tracking-wide text-fg",
						children: fight.winner === "you" ? "KO" : "DOWN"
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
						className: "flex items-center justify-between gap-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-display tracking-widest text-brass",
								children: "Wordfight"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: `font-display text-4xl tabular-nums ${fight.timeLeft <= 10 ? "text-primary" : "text-brass"}`,
								"aria-label": `${formatTime(fight.timeLeft)} left`,
								children: formatTime(fight.timeLeft)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: props.onMute,
								"aria-label": props.mute ? "Unmute" : "Mute",
								className: "flex h-11 w-11 items-center justify-center rounded-full bg-bg text-fg ring-1 ring-line",
								children: props.mute ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VolumeX, {
									"aria-hidden": true,
									size: 18
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Volume2, {
									"aria-hidden": true,
									size: 18
								})
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 grid grid-cols-2 gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Fighter, {
							name: "You",
							epithet: "Southpaw",
							hp: fight.youHp,
							combo: fight.comboYou,
							image: PORTRAITS.you,
							imgRef: youRef,
							bar: "brass",
							floaters: fight.floaters.filter((item) => item.side === "you")
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Fighter, {
							name: rival.name,
							epithet: rival.epithet,
							hp: fight.rivalHp,
							combo: fight.comboRival,
							image: PORTRAITS[fight.rivalId],
							imgRef: rivalRef,
							bar: "primary",
							floaters: fight.floaters.filter((item) => item.side === "rival")
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: `mt-4 flex min-h-12 items-center justify-center text-center text-base leading-snug font-semibold text-balance ${fight.banner?.tone === "good" ? "text-brass" : fight.banner?.tone === "bad" ? "text-primary" : "text-fg"}`,
						"aria-live": "polite",
						children: fight.banner?.text ?? "Build a word. Strike."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-center text-sm text-muted",
						children: fight.aiLen > 0 ? `${rival.name} is measuring a ${fight.aiLen}-letter shot` : `${rival.name} is looking for an opening`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 flex min-h-16 flex-col items-center justify-center",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-display text-5xl tracking-widest text-fg sm:text-6xl",
							children: word ? word.toUpperCase() : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-muted",
								children: "——"
							})
						}), preview ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-1 text-sm text-muted",
							children: [
								preview.callout,
								comboLabel(preview.streak) ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-brass",
									children: [" ", comboLabel(preview.streak)]
								}) : null,
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "tabular-nums text-fg",
									children: [" · ", preview.damage]
								})
							]
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm text-muted",
							children: "Three letters to throw"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-3 grid grid-cols-5 gap-2",
						role: "group",
						"aria-label": "Letter rack",
						children: fight.tiles.map((tile) => {
							const order = fight.selected.indexOf(tile.id);
							const on = order >= 0;
							const rare = isRare(tile.letter);
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								"aria-pressed": on,
								"aria-label": `${tile.letter.toUpperCase()}, ${letterValue(tile.letter)} ${letterValue(tile.letter) === 1 ? "point" : "points"}${on ? ", selected" : ""}`,
								onClick: () => props.onTile(tile.id),
								className: `wf-tile-in relative flex h-14 items-center justify-center rounded-lg font-display text-3xl leading-none motion-safe:transition-transform ${on ? "-translate-y-1 bg-fg text-bg" : `bg-bg-raised ring-1 ring-line ${rare ? "text-brass" : "text-fg"}`}`,
								children: [
									tile.letter.toUpperCase(),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: `absolute top-1 right-1 font-body text-xs ${on ? "text-bg" : "text-muted"}`,
										children: letterValue(tile.letter)
									}),
									on ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "absolute bottom-1 left-1 font-body text-xs text-primary",
										children: order + 1
									}) : null
								]
							}, tile.id);
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 flex gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: props.onBackspace,
							"aria-label": "Delete letter",
							className: "flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-bg text-fg ring-1 ring-line",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Delete, {
								"aria-hidden": true,
								size: 22
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: props.onSubmit,
							className: `h-14 flex-1 rounded-lg font-display text-2xl tracking-widest ${ready ? "bg-primary text-primary-ink" : "bg-bg text-muted ring-1 ring-line"}`,
							children: preview ? `Strike · ${preview.damage}` : "Strike"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-2 flex gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: props.onClinch,
							className: "flex h-12 flex-1 items-center justify-center gap-2 rounded-lg bg-bg text-fg ring-1 ring-line disabled:opacity-50",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, {
								"aria-hidden": true,
								size: 16
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-display tracking-widest",
								children: fight.clinchCd > 0 ? `Clinch ${Math.ceil(fight.clinchCd)}` : "Clinch"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: props.onTowel,
							className: "h-12 rounded-lg px-4 font-display tracking-widest text-muted",
							children: "Towel"
						})]
					})
				]
			})
		}), fight.log.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "mt-4 space-y-1 px-1",
			children: fight.log.slice(0, 3).map((entry) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				className: "flex items-baseline justify-between gap-3 text-sm",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: entry.side === "you" ? "text-brass" : "text-primary",
						children: entry.side === "you" ? "You" : rival.name
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-display tracking-wide text-fg",
						children: entry.word.toUpperCase()
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "tabular-nums text-muted",
						children: entry.damage
					})
				]
			}, entry.id))
		}) : null]
	});
}
function Fighter({ name, epithet, hp, combo, image, imgRef, bar, floaters }) {
	const pct = Math.max(0, Math.min(100, hp / 100 * 100));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		className: "relative rounded-xl bg-bg p-2 ring-1 ring-line sm:p-3",
		children: [
			floaters.map((floater) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "wf-float pointer-events-none absolute top-2 left-1/2 z-10 font-display text-3xl text-primary",
				children: floater.text
			}, floater.id)),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					ref: imgRef,
					src: image,
					alt: "",
					className: "h-14 w-14 shrink-0 rounded-lg object-cover"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0 flex-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "truncate font-display text-xl tracking-wide text-fg",
						children: name
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "truncate text-xs text-muted",
						children: epithet
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-2 h-2 overflow-hidden rounded-full bg-bg-raised",
				role: "meter",
				"aria-label": `${name} stamina`,
				"aria-valuemin": 0,
				"aria-valuemax": 100,
				"aria-valuenow": hp,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: `h-full motion-safe:transition-[width] motion-safe:duration-200 ${bar === "brass" ? "bg-brass" : "bg-primary"}`,
					style: { width: `${pct}%` }
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-1 flex items-center justify-between text-xs tabular-nums text-muted",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: hp }), combo >= 2 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "font-display tracking-wide text-brass",
					children: ["Flurry ", combo]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {})]
			})
		]
	});
}
function lunge(el, anim, sign) {
	if (!el || anim.n === 0) return;
	if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
	const toward = anim.kind === "go" ? 10 : -8;
	el.animate([
		{ transform: "translateX(0)" },
		{ transform: `translateX(${toward * sign}px)` },
		{ transform: "translateX(0)" }
	], {
		duration: 280,
		easing: "ease-out"
	});
}
var RULES = [
	{
		n: "01",
		title: "Spend the letters",
		body: "Tap tiles or type. Three letters minimum. Strike throws the word and those letters leave the rack."
	},
	{
		n: "02",
		title: "Length hits harder",
		body: "Jab, cross, hook, uppercut, haymaker. Rare letters add weight. Chain before they answer and the flurry climbs."
	},
	{
		n: "03",
		title: "Steal the shot",
		body: "You share one rack. Use the letters they're measuring, or clinch to redraw four. A clean hit breaks their flurry."
	}
];
function Lobby({ boot, save, shakeOn, onToggleMute, onToggleShake, onFight, onRetry }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto flex min-h-dvh w-full max-w-3xl flex-col px-4 py-6 sm:px-8 sm:py-12",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex items-center justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-display tracking-widest text-brass",
					children: "Ten tiles · One rack"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: onToggleShake,
						className: "h-11 rounded-full bg-surface px-4 text-sm text-fg ring-1 ring-line",
						children: ["Shake ", shakeOn ? "on" : "off"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: onToggleMute,
						"aria-label": save.mute ? "Unmute" : "Mute",
						className: "flex h-11 w-11 items-center justify-center rounded-full bg-surface text-fg ring-1 ring-line",
						children: save.mute ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VolumeX, {
							"aria-hidden": true,
							size: 20
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Volume2, {
							"aria-hidden": true,
							size: 20
						})
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-8 font-display text-6xl leading-none tracking-tight text-fg sm:text-8xl",
				children: "Wordfight"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 max-w-lg text-lg leading-relaxed text-pretty text-muted",
				children: "Spell from a shared rack. Spend the letters. Hit harder than the fighter across the ring."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
				className: "mt-8 grid grid-cols-3 gap-2 sm:gap-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Streak",
						value: save.streak
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Best",
						value: save.bestStreak
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "KOs",
						value: save.kos
					})
				]
			}),
			save.bestHit ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-3 text-sm text-muted",
				children: [
					"Best shot",
					" ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-display tracking-wide text-fg",
						children: save.bestHit.word.toUpperCase()
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "tabular-nums text-brass",
						children: [" · ", save.bestHit.damage]
					})
				]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-10",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-end justify-between gap-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-3xl tracking-wide text-fg",
							children: "Tonight's card"
						}),
						boot === "load" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted",
							children: "Opening the dictionary…"
						}) : null,
						boot === "error" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: onRetry,
							className: "inline-flex items-center gap-2 text-sm text-brass",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, {
								"aria-hidden": true,
								size: 16
							}), "Retry dictionary"]
						}) : null
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-4 grid gap-3",
					children: RIVAL_ORDER.map((id) => {
						const rival = RIVALS[id];
						return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							disabled: boot !== "ready",
							onClick: () => onFight(id),
							className: "flex w-full items-center gap-3 rounded-xl bg-surface p-3 text-left ring-1 ring-line motion-safe:transition-transform motion-safe:hover:-translate-y-0.5 disabled:cursor-default disabled:opacity-60 sm:gap-4 sm:p-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: PORTRAITS[id],
								alt: "",
								className: "h-20 w-20 shrink-0 rounded-lg object-cover sm:h-24 sm:w-24"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "min-w-0 flex-1",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "flex items-baseline justify-between gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "font-display text-3xl tracking-wide text-fg",
											children: rival.name
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "shrink-0 font-display text-lg tracking-wide text-primary",
											children: "Fight"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "mt-1 block text-sm text-brass",
										children: [
											rival.difficulty,
											" · ",
											rival.epithet
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "mt-1 block text-sm leading-snug text-pretty text-muted",
										children: rival.blurb
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "mt-2 block text-xs tabular-nums tracking-wide text-muted",
										children: [
											save.wins[id],
											" ",
											save.wins[id] === 1 ? "win" : "wins"
										]
									})
								]
							})]
						}) }, id);
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-10 mb-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-2xl tracking-wide text-fg",
						children: "How a round lands"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
						className: "mt-4 grid gap-4 sm:grid-cols-3",
						children: RULES.map((rule) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "rounded-xl bg-bg-raised p-4 ring-1 ring-line",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-display text-xl tracking-wide text-brass",
									children: rule.n
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									className: "mt-2 font-display text-2xl tracking-wide text-fg",
									children: rule.title
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-sm leading-relaxed text-pretty text-muted",
									children: rule.body
								})
							]
						}, rule.n))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-4 text-sm text-muted",
						children: "Seventy-five seconds. One hundred stamina. Bell or knockout."
					})
				]
			})
		]
	});
}
function Stat({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-xl bg-surface px-3 py-3 ring-1 ring-line",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
			className: "text-xs tracking-widest text-muted uppercase",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
			className: "font-display text-4xl tabular-nums text-brass",
			children: value
		})]
	});
}
function Result({ fight, streak, onRematch, onCard }) {
	const rival = RIVALS[fight.rivalId];
	const win = fight.winner === "you";
	const draw = fight.winner === "draw";
	const headline = fight.endReason === "ko" && win ? "Knockout" : fight.endReason === "ko" ? "Counted out" : fight.endReason === "towel" ? "Towel" : draw ? "Split decision" : "Decision";
	const lasted = Math.max(0, 75 - fight.timeLeft);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto flex min-h-dvh w-full max-w-xl flex-col px-4 py-8 sm:py-14",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-display tracking-widest text-brass",
				children: "Wordfight"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: `mt-4 font-display text-6xl leading-none tracking-tight sm:text-7xl ${win ? "text-brass" : draw ? "text-fg" : "text-primary"}`,
				children: headline
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-3 text-lg text-pretty text-muted",
				children: [
					win ? "You" : draw ? "Neither of you" : rival.name,
					" ",
					draw ? "gave ground." : win ? `dropped ${rival.name}.` : "keeps the ring.",
					" Streak ",
					streak,
					"."
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-8 flex items-center gap-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: PORTRAITS.you,
						alt: "",
						className: "h-16 w-16 rounded-lg object-cover"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-display text-2xl tracking-wide text-muted",
						children: "vs"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: PORTRAITS[fight.rivalId],
						alt: "",
						className: "h-16 w-16 rounded-lg object-cover"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-display text-3xl tracking-wide text-fg",
						children: rival.name
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
				className: "mt-8 grid grid-cols-2 gap-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cell, {
						label: "You dealt",
						value: String(fight.dealtYou)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cell, {
						label: "You took",
						value: String(fight.dealtRival)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cell, {
						label: "Best word",
						value: fight.bestWord ? fight.bestWord.word.toUpperCase() : "—"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cell, {
						label: "Lasted",
						value: formatTime(lasted)
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-8 flex flex-col gap-2 sm:flex-row",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: onRematch,
					className: "h-14 flex-1 rounded-lg bg-primary font-display text-2xl tracking-widest text-primary-ink",
					children: "Rematch"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: onCard,
					className: "h-14 flex-1 rounded-lg bg-surface font-display text-2xl tracking-widest text-fg ring-1 ring-line",
					children: "The card"
				})]
			})
		]
	});
}
function Cell({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-xl bg-surface px-4 py-3 ring-1 ring-line",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
			className: "text-xs tracking-widest text-muted uppercase",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
			className: "mt-1 font-display text-3xl tracking-wide text-fg tabular-nums",
			children: value
		})]
	});
}
var STILL = {
	n: 0,
	kind: "go"
};
function WordfightApp() {
	const [phase, setPhase] = (0, import_react.useState)("lobby");
	const [boot, setBoot] = (0, import_react.useState)("load");
	const [save, setSave] = (0, import_react.useState)(() => ({
		version: 1,
		kos: 0,
		streak: 0,
		bestStreak: 0,
		wins: {
			kip: 0,
			sable: 0,
			marlow: 0
		},
		bestHit: null,
		mute: false,
		shake: null
	}));
	const [snap, setSnap] = (0, import_react.useState)(null);
	const [pose, setPose] = (0, import_react.useState)({
		you: STILL,
		rival: STILL
	});
	const [flash, setFlash] = (0, import_react.useState)(null);
	const [reduce, setReduce] = (0, import_react.useState)(false);
	const phaseRef = (0, import_react.useRef)("lobby");
	const fightRef = (0, import_react.useRef)(null);
	const lexRef = (0, import_react.useRef)(null);
	const saveRef = (0, import_react.useRef)(save);
	const shakeRef = (0, import_react.useRef)(null);
	const traumaRef = (0, import_react.useRef)(0);
	const shakeOnRef = (0, import_react.useRef)(true);
	const timers = (0, import_react.useRef)([]);
	const bootToken = (0, import_react.useRef)(0);
	saveRef.current = save;
	const shakeOn = save.shake === null ? !reduce : save.shake;
	shakeOnRef.current = shakeOn;
	(0, import_react.useEffect)(() => {
		bindAudioLifecycle();
		setSave(loadSave());
		const media = window.matchMedia("(prefers-reduced-motion: reduce)");
		const apply = () => setReduce(media.matches);
		apply();
		media.addEventListener("change", apply);
		return () => media.removeEventListener("change", apply);
	}, []);
	(0, import_react.useEffect)(() => {
		setAudioMuted(save.mute);
	}, [save.mute]);
	(0, import_react.useEffect)(() => {
		const token = ++bootToken.current;
		setBoot("load");
		loadLexicon().then((lex) => {
			if (bootToken.current !== token) return;
			lexRef.current = lex;
			setBoot("ready");
		}).catch(() => {
			if (bootToken.current !== token) return;
			setBoot("error");
		});
	}, [bootToken]);
	(0, import_react.useEffect)(() => {
		let frame = 0;
		let last = performance.now();
		let publish = 0;
		const loop = (now) => {
			const dt = Math.min(.1, (now - last) / 1e3);
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
				if (step.fx.length || publish >= .1) {
					publish = 0;
					setSnap(next);
				}
			}
			traumaRef.current = Math.max(0, traumaRef.current - dt * 1.5);
			const el = shakeRef.current;
			if (el) {
				const trauma = traumaRef.current;
				const mag = shakeOnRef.current ? trauma * trauma * 12 : 0;
				if (mag > .25) {
					const x = Math.sin(now * .041) * mag;
					const y = Math.cos(now * .033) * mag * .65;
					el.style.transform = `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px)`;
				} else if (el.style.transform) el.style.transform = "";
			}
			frame = requestAnimationFrame(loop);
		};
		frame = requestAnimationFrame(loop);
		return () => cancelAnimationFrame(frame);
	}, []);
	(0, import_react.useEffect)(() => {
		return () => {
			for (const timer of timers.current) window.clearTimeout(timer);
		};
	}, []);
	(0, import_react.useEffect)(() => {
		if (phase !== "fight") return;
		const onKey = (event) => {
			if (event.metaKey || event.ctrlKey || event.altKey) return;
			if (!!(event.target instanceof HTMLElement ? event.target : null)?.closest("button") && (event.key === "Enter" || event.key === " ")) return;
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
	function go(next) {
		phaseRef.current = next;
		setPhase(next);
	}
	function record(state) {
		if (state.recorded) return state;
		const updated = applyResult(saveRef.current, state);
		saveRef.current = updated;
		setSave(updated);
		writeSave(updated);
		return {
			...state,
			recorded: true
		};
	}
	function handleFx(fx, state) {
		for (const event of fx) if (event.type === "tile") playTone("tile");
		else if (event.type === "miss") {
			playTone("miss");
			traumaRef.current = Math.min(1, traumaRef.current + event.trauma);
		} else if (event.type === "clinch") playTone("clinch");
		else if (event.type === "bell") playTone("bell");
		else if (event.type === "interrupt") playTone("tile");
		else if (event.type === "hit") {
			traumaRef.current = Math.min(1, traumaRef.current + event.trauma);
			playCallout(event.callout, event.ko);
			setFlash({
				id: state.nextFloat,
				attacker: event.attacker
			});
			setPose((current) => event.attacker === "you" ? {
				you: {
					n: current.you.n + 1,
					kind: "go"
				},
				rival: {
					n: current.rival.n + 1,
					kind: "hurt"
				}
			} : {
				you: {
					n: current.you.n + 1,
					kind: "hurt"
				},
				rival: {
					n: current.rival.n + 1,
					kind: "go"
				}
			});
			const floater = state.floaters[state.floaters.length - 1];
			if (floater) {
				const id = floater.id;
				const timer = window.setTimeout(() => {
					const live = fightRef.current;
					if (!live) return;
					const next = {
						...live,
						floaters: live.floaters.filter((item) => item.id !== id)
					};
					fightRef.current = next;
					setSnap(next);
				}, 820);
				timers.current.push(timer);
			}
		}
	}
	function commit(step) {
		fightRef.current = step.state;
		setSnap(step.state);
		if (step.fx.length) handleFx(step.fx, step.state);
	}
	function start(id) {
		const lex = lexRef.current;
		if (!lex) return;
		unlockAudio();
		const fight = createFight(id, lex);
		fightRef.current = fight;
		setSnap(fight);
		setPose({
			you: STILL,
			rival: STILL
		});
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
	function type(letter) {
		const fight = fightRef.current;
		if (!fight) return;
		commit(typeLetter(fight, letter));
	}
	function tile(id) {
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
		const recorded = record({
			...fight,
			status: "done",
			winner: "rival",
			endReason: "towel"
		});
		fightRef.current = recorded;
		setSnap(recorded);
		go("result");
	}
	function toggleMute() {
		unlockAudio();
		const next = {
			...saveRef.current,
			mute: !saveRef.current.mute
		};
		saveRef.current = next;
		setSave(next);
		writeSave(next);
	}
	function toggleShake() {
		const next = {
			...saveRef.current,
			shake: !shakeOnRef.current
		};
		saveRef.current = next;
		setSave(next);
		writeSave(next);
	}
	function retry() {
		bootToken.current += 1;
		const token = bootToken.current;
		setBoot("load");
		loadLexicon().then((lex) => {
			if (bootToken.current !== token) return;
			lexRef.current = lex;
			setBoot("ready");
		}).catch(() => {
			if (bootToken.current !== token) return;
			setBoot("error");
		});
	}
	if (phase === "fight" && snap) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Arena, {
		fight: snap,
		pose,
		mute: save.mute,
		shakeRef,
		flash,
		onTile: tile,
		onSubmit: strike,
		onBackspace: erase,
		onClinch: hold,
		onTowel: towel,
		onMute: toggleMute
	});
	if (phase === "result" && snap) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Result, {
		fight: snap,
		streak: save.streak,
		onRematch: () => start(snap.rivalId),
		onCard: () => go("lobby")
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lobby, {
		boot,
		save,
		shakeOn,
		onToggleMute: toggleMute,
		onToggleShake: toggleShake,
		onFight: start,
		onRetry: retry
	});
}
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WordfightApp, {});
}
//#endregion
export { Home as component };
