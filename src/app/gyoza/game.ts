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

export function perSecond(state: GameState): number {
  return BUILDINGS.reduce((sum, b) => sum + b.perSecond * state.owned[b.id], 0);
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

/** Returns the state after buying one `id`, or null when it can't be afforded. */
export function buy(state: GameState, id: BuildingId): GameState | null {
  const building = BUILDINGS.find((b) => b.id === id)!;
  const price = cost(building, state.owned[id]);
  if (state.gyoza < price) return null;
  return {
    ...state,
    gyoza: state.gyoza - price,
    owned: { ...state.owned, [id]: state.owned[id] + 1 },
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
