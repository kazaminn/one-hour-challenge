/**
 * Gyoza Clicker rules, free of React and the hub so the game can move to
 * task-cooker as is. Every function is pure: it takes a state and returns a
 * new one.
 */

export const BUILDINGS = [
  {
    id: 'tezukuri',
    name: '手作り餃子',
    counter: '個',
    baseCost: 15,
    perSecond: 0.1,
    flavor: '伝説はここから始まる。',
  },
  {
    id: 'shokunin',
    name: '餃子職人のおじさん',
    counter: '人',
    baseCost: 100,
    perSecond: 1,
    flavor: '黙々と餃子を包んでくれる。ありがとう。',
  },
  {
    id: 'kikai',
    name: '餃子の自動製造機',
    counter: '台',
    baseCost: 1_100,
    perSecond: 10,
    flavor: '機械の力で効率アップ。',
  },
  {
    id: 'senmonten',
    name: '町の餃子専門店',
    counter: '店舗',
    baseCost: 12_000,
    perSecond: 100,
    flavor: 'いい匂いで人々を惹きつける。',
  },
  {
    id: 'franchise',
    name: '餃子フランチャイズ',
    counter: '社',
    baseCost: 130_000,
    perSecond: 1_000,
    flavor: '全国に餃子の輪を広げる。',
  },
  {
    id: 'kojo',
    name: '世界の餃子工場',
    counter: 'か所',
    baseCost: 1_400_000,
    perSecond: 10_000,
    flavor: '世界中に餃子を届けよう。',
  },
] as const;

export type Building = (typeof BUILDINGS)[number];
export type BuildingId = Building['id'];

/** Each purchase makes the next one of the same building this much dearer. */
const PRICE_GROWTH = 1.15;

export type GameState = {
  /** Gyoza on hand. Fractional; shown rounded down. */
  gyoza: number;
  /** Gyoza ever baked, spent or not. Unlocks buildings. */
  baked: number;
  owned: Record<BuildingId, number>;
  /** When this state was last advanced, in ms since the epoch. */
  at: number;
};

export function initialState(now: number): GameState {
  return {
    gyoza: 0,
    baked: 0,
    owned: Object.fromEntries(BUILDINGS.map((b) => [b.id, 0])) as Record<BuildingId, number>,
    at: now,
  };
}

export function cost(building: Building, owned: number): number {
  return Math.ceil(building.baseCost * PRICE_GROWTH ** owned);
}

/**
 * Owning this many of one building doubles its output, each step on top of the
 * last. Spaced wider as they go so the bonus keeps pace with the 1.15× price:
 * by 100 owned a unit costs ~1,000,000× more, against ×16 production.
 */
export const BONUS_STEPS = [10, 25, 50, 100, 200] as const;

/** The production multiplier `owned` of one building has earned. */
export function bonus(owned: number): number {
  return 2 ** BONUS_STEPS.filter((step) => owned >= step).length;
}

/** The next owned count that raises the bonus, or null past the last step. */
export function nextBonusStep(owned: number): number | null {
  return BONUS_STEPS.find((step) => owned < step) ?? null;
}

/** What one of `building` bakes per second right now, bonus included. */
export function unitPerSecond(building: Building, owned: number): number {
  return building.perSecond * bonus(owned);
}

export function perSecond(state: GameState): number {
  return BUILDINGS.reduce(
    (sum, b) => sum + unitPerSecond(b, state.owned[b.id]) * state.owned[b.id],
    0,
  );
}

function add(state: GameState, n: number): GameState {
  return { ...state, gyoza: state.gyoza + n, baked: state.baked + n };
}

/** Advances to `now`: whatever was produced since `state.at`, offline time included. */
export function tick(state: GameState, now: number): GameState {
  const seconds = Math.max(0, now - state.at) / 1000;
  return { ...add(state, perSecond(state) * seconds), at: now };
}

export function click(state: GameState): GameState {
  return add(state, 1);
}

/** What the next `count` of a building cost together, each priced as it's bought. */
export function costOf(building: Building, owned: number, count: number): number {
  let total = 0;
  for (let i = 0; i < count; i++) total += cost(building, owned + i);
  return total;
}

/** How many of a building the gyoza on hand can buy, at least 1 so a price can show. */
export function affordableCount(state: GameState, building: Building): number {
  let count = 0;
  let total = 0;
  while (true) {
    total += cost(building, state.owned[building.id] + count);
    if (total > state.gyoza) return Math.max(1, count);
    count++;
  }
}

/** Returns the state after buying `count` of `id`, or null when they can't be afforded. */
export function buy(state: GameState, id: BuildingId, count = 1): GameState | null {
  const building = BUILDINGS.find((b) => b.id === id)!;
  const price = costOf(building, state.owned[id], count);
  if (count < 1 || state.gyoza < price) return null;
  return {
    ...state,
    gyoza: state.gyoza - price,
    owned: { ...state.owned, [id]: state.owned[id] + count },
  };
}

/**
 * A building shows once the one before it is owned or enough gyoza have ever
 * been baked to afford it; the first hidden one appears as "???".
 */
export function visibility(state: GameState, index: number): 'shown' | 'teaser' | 'hidden' {
  const unlocked = (i: number) =>
    i === 0 || state.owned[BUILDINGS[i - 1]!.id] > 0 || state.baked >= BUILDINGS[i]!.baseCost;
  if (unlocked(index)) return 'shown';
  return unlocked(index - 1) ? 'teaser' : 'hidden';
}

/** Restores a saved game, falling back to a fresh one for anything malformed. */
export function load(json: string | null, now: number): GameState {
  const fresh = initialState(now);
  if (!json) return fresh;
  try {
    const saved = JSON.parse(json) as Partial<GameState>;
    const num = (v: unknown, fallback: number) =>
      typeof v === 'number' && Number.isFinite(v) && v >= 0 ? v : fallback;
    const owned = { ...fresh.owned };
    for (const b of BUILDINGS) owned[b.id] = Math.floor(num(saved.owned?.[b.id], 0));
    return {
      gyoza: num(saved.gyoza, 0),
      baked: num(saved.baked, 0),
      owned,
      at: Math.min(num(saved.at, now), now),
    };
  } catch {
    return fresh;
  }
}

const JA_UNITS = [
  [1e12, '兆'],
  [1e8, '億'],
  [1e4, '万'],
] as const;

/** Whole gyoza in Japanese units: 9,999 → 1.23万 → 12.3万 → 1,234万 → 1.23億. */
export function formatJa(n: number): string {
  const whole = Math.floor(n);
  for (const [size, unit] of JA_UNITS) {
    if (whole < size) continue;
    const v = whole / size;
    const digits = v < 10 ? 2 : v < 100 ? 1 : 0;
    // Round down so the display never claims gyoza that aren't there yet.
    const shown = Math.floor(v * 10 ** digits) / 10 ** digits;
    return `${shown.toLocaleString('ja-JP', { maximumFractionDigits: digits })}${unit}`;
  }
  return whole.toLocaleString('ja-JP');
}

/**
 * Achievements are read straight off the state: `baked` and `owned` only ever
 * grow, so once earned an achievement stays earned without being saved.
 */
export const ACHIEVEMENTS: readonly {
  id: string;
  name: string;
  description: string;
  earned: (state: GameState) => boolean;
}[] = [
  { id: 'baked1', name: 'はじめの一個', description: '餃子を1個焼いた', earned: (s) => s.baked >= 1 },
  { id: 'baked100', name: '焼き手見習い', description: '餃子を100個焼いた', earned: (s) => s.baked >= 100 },
  { id: 'baked1k', name: '焼き場の常連', description: '餃子を1,000個焼いた', earned: (s) => s.baked >= 1_000 },
  { id: 'baked10k', name: '一万個の壁', description: '餃子を1万個焼いた', earned: (s) => s.baked >= 1e4 },
  { id: 'baked1m', name: '餃子長者', description: '餃子を100万個焼いた', earned: (s) => s.baked >= 1e6 },
  { id: 'baked100m', name: '餃子の星', description: '餃子を1億個焼いた', earned: (s) => s.baked >= 1e8 },
  { id: 'shokunin1', name: 'いらっしゃい、おじさん', description: '餃子職人のおじさんを雇った', earned: (s) => s.owned.shokunin >= 1 },
  { id: 'shokunin10', name: '職人チーム', description: '餃子職人のおじさんを10人雇った', earned: (s) => s.owned.shokunin >= 10 },
  { id: 'kikai1', name: '機械化', description: '餃子の自動製造機を導入した', earned: (s) => s.owned.kikai >= 1 },
  { id: 'senmonten1', name: '開店！', description: '町の餃子専門店を開いた', earned: (s) => s.owned.senmonten >= 1 },
  { id: 'franchise1', name: '全国進出', description: '餃子フランチャイズを始めた', earned: (s) => s.owned.franchise >= 1 },
  { id: 'kojo1', name: '世界の餃子', description: '世界の餃子工場を建てた', earned: (s) => s.owned.kojo >= 1 },
  { id: 'rate10', name: '自動で焼ける', description: '毎秒10個焼けるようになった', earned: (s) => perSecond(s) >= 10 },
  { id: 'rate1k', name: '餃子の滝', description: '毎秒1,000個焼けるようになった', earned: (s) => perSecond(s) >= 1_000 },
];

export function earnedAchievements(state: GameState): Set<string> {
  return new Set(ACHIEVEMENTS.filter((a) => a.earned(state)).map((a) => a.id));
}
