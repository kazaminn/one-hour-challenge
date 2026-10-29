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
    perSecond: 8,
    flavor: '機械の力で効率アップ。',
  },
  {
    id: 'senmonten',
    name: '町の餃子専門店',
    counter: '店舗',
    baseCost: 12_000,
    perSecond: 47,
    flavor: 'いい匂いで人々を惹きつける。',
  },
  {
    id: 'idou',
    name: '餃子の移動販売車',
    counter: '台',
    baseCost: 130_000,
    perSecond: 260,
    flavor: '焼きたてを町じゅうに届ける。',
  },
  {
    id: 'central',
    name: '餃子セントラルキッチン',
    counter: 'か所',
    baseCost: 1.4e6,
    perSecond: 1_400,
    flavor: '仕込みはまとめて、一気に焼く。',
  },
  {
    id: 'franchise',
    name: '餃子フランチャイズ',
    counter: '社',
    baseCost: 2e7,
    perSecond: 7_800,
    flavor: '全国に餃子の輪を広げる。',
  },
  {
    id: 'kojo',
    name: '全自動餃子工場',
    counter: 'か所',
    baseCost: 3.3e8,
    perSecond: 44_000,
    flavor: '包むのも焼くのも全自動。',
  },
  {
    id: 'kenkyujo',
    name: '餃子研究所',
    counter: 'か所',
    baseCost: 5.1e9,
    perSecond: 260_000,
    flavor: '究極の一個を科学で追い求める。',
  },
  {
    id: 'themepark',
    name: '餃子テーマパーク',
    counter: 'か所',
    baseCost: 7.5e10,
    perSecond: 1.6e6,
    flavor: '食べて遊べる餃子の国。',
  },
  {
    id: 'toshi',
    name: '餃子都市',
    counter: '都市',
    baseCost: 1e12,
    perSecond: 1e7,
    flavor: 'ビルの上にも餃子が乗っている。',
  },
  {
    id: 'rengo',
    name: '世界餃子連合',
    counter: 'か国',
    baseCost: 1.4e13,
    perSecond: 6.5e7,
    flavor: '世界じゅうが餃子で手を結ぶ。',
  },
  {
    id: 'eisei',
    name: '餃子人工衛星',
    counter: '機',
    baseCost: 1.7e14,
    perSecond: 4.3e8,
    flavor: '宇宙から餃子の焼き加減を見守る。',
  },
  {
    id: 'getsumen',
    name: '月面餃子基地',
    counter: '基',
    baseCost: 2.1e15,
    perSecond: 2.9e9,
    flavor: '重力が軽いので皮もふわふわ。',
  },
  {
    id: 'kasei',
    name: '火星餃子農園',
    counter: 'か所',
    baseCost: 2.6e16,
    perSecond: 2.1e10,
    flavor: '赤い大地でニラを育てる。',
  },
  {
    id: 'ginga',
    name: '銀河餃子帝国',
    counter: '銀河',
    baseCost: 3.1e17,
    perSecond: 1.5e11,
    flavor: '銀河の果てまで餃子の旗が立つ。',
  },
  {
    id: 'wakusei',
    name: '餃子惑星',
    counter: '個',
    baseCost: 7.1e18,
    perSecond: 1.1e12,
    flavor: '星そのものが餃子になった。',
  },
  {
    id: 'blackhole',
    name: '餃子ブラックホール',
    counter: '個',
    baseCost: 1.2e20,
    perSecond: 8.3e12,
    flavor: 'あらゆる餃子を引き寄せる。',
  },
  {
    id: 'ryoshi',
    name: '量子餃子生成装置',
    counter: '台',
    baseCost: 1.9e21,
    perSecond: 6.4e13,
    flavor: '焼けている餃子と焼けていない餃子が重なり合う。',
  },
  {
    id: 'jiku',
    name: '時空餃子転送門',
    counter: '門',
    baseCost: 5.4e22,
    perSecond: 5e14,
    flavor: '過去と未来の餃子をここへ。',
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
  /** Ids of the upgrades bought, in purchase order. */
  upgrades: string[];
  /** Golden gyoza effects still running. */
  buffs: Buff[];
  /** Golden gyoza ever clicked. */
  goldenClicks: number;
  /** When this state was last advanced, in ms since the epoch. */
  at: number;
};

export function initialState(now: number): GameState {
  return {
    gyoza: 0,
    baked: 0,
    owned: Object.fromEntries(BUILDINGS.map((b) => [b.id, 0])) as Record<BuildingId, number>,
    upgrades: [],
    buffs: [],
    goldenClicks: 0,
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

/**
 * Upgrades are one-off purchases. Building upgrades double one building's
 * output; click upgrades double the click or add a share of the per-second
 * rate to it, so clicking stays worth it late in the game.
 */
export type Upgrade = {
  id: string;
  name: string;
  description: string;
  cost: number;
  /** Image under /gyoza/. */
  icon: string;
  /** Shows in the shop once this holds; it stays bought after that. */
  unlocked: (state: GameState) => boolean;
} & (
  | { kind: 'building'; building: BuildingId }
  | { kind: 'clickDouble' }
  | { kind: 'clickRate'; share: number }
  | { kind: 'global' }
  | { kind: 'goldenLonger' }
  | { kind: 'goldenOften' }
);

/** Building upgrades borrow an item from the sheet where one fits, else the building itself. */
const TIER_ICON: Partial<Record<BuildingId, string>> = {
  tezukuri: 'upgrade-kawa',
  shokunin: 'upgrade-hachimaki',
  kikai: 'upgrade-aichip',
  kojo: 'upgrade-aichip',
  kenkyujo: 'upgrade-aichip',
};

/** Owned counts that unlock each tier of a building's upgrades, and the price as a multiple of its base cost. */
const BUILDING_TIERS = [
  { owned: 1, price: 10, name: '下ごしらえ' },
  { owned: 5, price: 50, name: '秘伝のタレ' },
  { owned: 25, price: 500, name: '羽根つき' },
  { owned: 50, price: 50_000, name: '黄金の焼き色' },
  { owned: 100, price: 5_000_000, name: '伝説の一皿' },
  { owned: 150, price: 500_000_000, name: '餃子の極み' },
] as const;

export const UPGRADES: readonly Upgrade[] = [
  {
    id: 'click1',
    kind: 'clickDouble',
    name: '魔法の麺棒',
    description: 'クリックで焼ける数が2倍',
    cost: 100,
    icon: 'upgrade-menbou',
    unlocked: (s) => s.baked >= 50,
  },
  {
    id: 'click2',
    kind: 'clickDouble',
    name: '特製ラー油',
    description: 'クリックで焼ける数が2倍',
    cost: 500,
    icon: 'upgrade-rayu',
    unlocked: (s) => s.owned.tezukuri >= 1,
  },
  {
    id: 'click3',
    kind: 'clickDouble',
    name: '黄金のフライパン',
    description: 'クリックで焼ける数が2倍',
    cost: 10_000,
    icon: 'upgrade-frypan',
    unlocked: (s) => s.owned.tezukuri >= 10,
  },
  {
    id: 'nira',
    kind: 'global',
    name: '極上のニラ',
    description: 'すべての設備の生産が2倍',
    cost: 1e6,
    icon: 'upgrade-nira',
    unlocked: (s) => s.baked >= 1e5,
  },
  {
    id: 'jitan',
    kind: 'global',
    name: '時短マシン',
    description: 'すべての設備の生産が2倍',
    cost: 1e10,
    icon: 'upgrade-jitan',
    unlocked: (s) => s.baked >= 1e9,
  },
  {
    id: 'ninniku',
    kind: 'goldenLonger',
    name: 'にんにくパワー',
    description: '金の餃子の効果が2倍長く続く',
    cost: 77_777,
    icon: 'upgrade-ninniku',
    unlocked: (s) => s.goldenClicks >= 3,
  },
  {
    id: 'yousei',
    kind: 'goldenOften',
    name: '餃子の妖精',
    description: '金の餃子が2倍の頻度で出る',
    cost: 777_777,
    icon: 'upgrade-yousei',
    unlocked: (s) => s.goldenClicks >= 7,
  },
  ...(
    [
      [4, '餃子の目利き', 1e4, 5e4],
      [5, '焼き場の達人', 1e6, 5e6],
      [6, '餃子の神の手', 1e8, 5e8],
      [7, '無限焼き', 1e10, 5e10],
      [8, '宇宙の焼き手', 1e12, 5e12],
    ] as const
  ).map(
    ([n, name, need, cost]): Upgrade => ({
      id: `click${n}`,
      kind: 'clickRate',
      share: 0.01,
      name,
      description: 'クリックごとに毎秒の生産の1%も焼ける',
      cost,
      icon: 'gyoza-click',
      unlocked: (s) => s.baked >= need,
    }),
  ),
  ...BUILDINGS.flatMap((b) =>
    BUILDING_TIERS.map(
      (t, i): Upgrade => ({
        id: `${b.id}${i + 1}`,
        kind: 'building',
        building: b.id,
        name: `${b.name}・${t.name}`,
        description: `${b.name}の生産が2倍`,
        cost: b.baseCost * t.price,
        icon: TIER_ICON[b.id] ?? `building-${b.id}`,
        unlocked: (s) => s.owned[b.id] >= t.owned,
      }),
    ),
  ),
];

const UPGRADE_BY_ID = new Map(UPGRADES.map((u) => [u.id, u]));

function bought(state: GameState): Upgrade[] {
  return state.upgrades.flatMap((id) => UPGRADE_BY_ID.get(id) ?? []);
}

/** Upgrades on sale now: unlocked, not yet bought, cheapest first. */
export function availableUpgrades(state: GameState): Upgrade[] {
  const have = new Set(state.upgrades);
  return UPGRADES.filter((u) => !have.has(u.id) && u.unlocked(state)).sort((a, b) => a.cost - b.cost);
}

/** Returns the state after buying upgrade `id`, or null when it can't be. */
export function buyUpgrade(state: GameState, id: string): GameState | null {
  const upgrade = UPGRADE_BY_ID.get(id);
  if (!upgrade || state.upgrades.includes(id) || !upgrade.unlocked(state)) return null;
  if (state.gyoza < upgrade.cost) return null;
  return { ...state, gyoza: state.gyoza - upgrade.cost, upgrades: [...state.upgrades, id] };
}

function has(state: GameState, kind: Upgrade['kind']): number {
  return bought(state).filter((u) => u.kind === kind).length;
}

/** The multiplier bought upgrades give `building`, including the ones for every building. */
export function upgradeMultiplier(state: GameState, building: BuildingId): number {
  const own = bought(state).filter((u) => u.kind === 'building' && u.building === building).length;
  return 2 ** (own + has(state, 'global'));
}

/** What one of `building` bakes per second right now, bonuses and upgrades included. */
export function unitPerSecond(state: GameState, building: Building): number {
  return building.perSecond * bonus(state.owned[building.id]) * upgradeMultiplier(state, building.id);
}

export function perSecond(state: GameState): number {
  return BUILDINGS.reduce((sum, b) => sum + unitPerSecond(state, b) * state.owned[b.id], 0);
}

function add(state: GameState, n: number): GameState {
  return { ...state, gyoza: state.gyoza + n, baked: state.baked + n };
}

/**
 * Advances to `now`: whatever was produced since `state.at`, offline time
 * included. Time is cut where a buff ends so a ×7 doesn't run past its end.
 */
export function tick(state: GameState, now: number): GameState {
  if (now <= state.at) return state;
  const base = perSecond(state);
  const ends = state.buffs.map((b) => b.until).filter((t) => t > state.at && t < now);
  const cuts = [state.at, ...[...new Set(ends)].sort((a, b) => a - b), now];
  let baked = 0;
  for (let i = 0; i < cuts.length - 1; i++) {
    const from = cuts[i]!;
    baked += base * productionBoost(state, from) * ((cuts[i + 1]! - from) / 1000);
  }
  return { ...add(state, baked), buffs: state.buffs.filter((b) => b.until > now), at: now };
}

/** The golden gyoza's effects. `weight` sets how often each is drawn. */
export const GOLDEN_EFFECTS = [
  {
    kind: 'frenzy',
    image: 'bonus-fire',
    name: '焼きたてラッシュ',
    description: '77秒間、毎秒の生産が7倍',
    seconds: 77,
    weight: 4,
  },
  {
    kind: 'clickFrenzy',
    image: 'bonus-bolt',
    name: '神の手',
    description: '13秒間、クリックが777倍',
    seconds: 13,
    weight: 1,
  },
  {
    kind: 'lucky',
    image: 'bonus-clover',
    name: '幸運の餃子',
    description: '手持ちの15%か、生産15分ぶんの少ないほうをもらえる',
    seconds: 0,
    weight: 4,
  },
  {
    kind: 'timeSkip',
    image: 'bonus-clock',
    name: '時間を先取り',
    description: '生産5分ぶんをすぐもらえる',
    seconds: 0,
    weight: 2,
  },
] as const;

export type GoldenEffect = (typeof GOLDEN_EFFECTS)[number];
export type Buff = { kind: 'frenzy' | 'clickFrenzy'; until: number };

/** How long a golden gyoza stays on screen, and the wait before the next one. */
export const GOLDEN_STAY_MS = 13_000;
const GOLDEN_WAIT_MS = { min: 60_000, max: 180_000 } as const;

/** The wait before the next golden gyoza, halved by 餃子の妖精. */
export function goldenWaitMs(state: GameState): { min: number; max: number } {
  const div = has(state, 'goldenOften') > 0 ? 2 : 1;
  return { min: GOLDEN_WAIT_MS.min / div, max: GOLDEN_WAIT_MS.max / div };
}

function buffActive(state: GameState, kind: Buff['kind'], at: number): boolean {
  return state.buffs.some((b) => b.kind === kind && b.until > at);
}

/** The production multiplier buffs give at time `at`. */
export function productionBoost(state: GameState, at: number): number {
  return buffActive(state, 'frenzy', at) ? 7 : 1;
}

/** Per second right now, golden gyoza buffs included. */
export function currentPerSecond(state: GameState, now: number): number {
  return perSecond(state) * productionBoost(state, now);
}

/** How long a buff lasts, doubled by にんにくパワー. */
export function buffSeconds(state: GameState, effect: GoldenEffect): number {
  return effect.seconds * (has(state, 'goldenLonger') > 0 ? 2 : 1);
}

/** Picks an effect from `roll` in [0, 1), so the game stays free of randomness. */
export function pickGoldenEffect(roll: number): GoldenEffect {
  const total = GOLDEN_EFFECTS.reduce((sum, e) => sum + e.weight, 0);
  let left = roll * total;
  for (const e of GOLDEN_EFFECTS) {
    left -= e.weight;
    if (left < 0) return e;
  }
  return GOLDEN_EFFECTS[0];
}

/** Applies a clicked golden gyoza's effect. Returns the new state and the gyoza it gave right away. */
export function goldenClick(
  state: GameState,
  effect: GoldenEffect,
  now: number,
): { state: GameState; gained: number } {
  const counted = { ...tick(state, now), goldenClicks: state.goldenClicks + 1 };
  if (effect.kind === 'frenzy' || effect.kind === 'clickFrenzy') {
    // A second one of the same kind restarts the timer instead of stacking.
    const buffs = counted.buffs.filter((b) => b.kind !== effect.kind);
    return {
      state: { ...counted, buffs: [...buffs, { kind: effect.kind, until: now + buffSeconds(state, effect) * 1000 }] },
      gained: 0,
    };
  }
  const rate = currentPerSecond(counted, now);
  const gained =
    effect.kind === 'lucky' ? Math.min(counted.gyoza * 0.15, rate * 900) + 13 : rate * 300;
  return { state: add(counted, gained), gained };
}

/** Seconds left on each running buff, for display. */
export function buffsLeft(state: GameState, now: number): { effect: GoldenEffect; seconds: number }[] {
  return state.buffs
    .filter((b) => b.until > now)
    .map((b) => ({
      effect: GOLDEN_EFFECTS.find((e) => e.kind === b.kind)!,
      seconds: Math.ceil((b.until - now) / 1000),
    }));
}

/** What each 手作り餃子 adds to a click: its owned-count bonus and upgrades apply here too. */
export function tezukuriClickShare(state: GameState): number {
  return bonus(state.owned.tezukuri) * upgradeMultiplier(state, 'tezukuri');
}

/**
 * Gyoza per click: 1 by hand plus each 手作り餃子's share, doubled by click
 * upgrades, plus a slice of the per-second rate from the later click upgrades.
 */
export function perClick(state: GameState): number {
  const ups = bought(state);
  const doubles = ups.filter((u) => u.kind === 'clickDouble').length;
  const share = ups.reduce((sum, u) => sum + (u.kind === 'clickRate' ? u.share : 0), 0);
  const base = 1 + state.owned.tezukuri * tezukuriClickShare(state);
  const clickBoost = buffActive(state, 'clickFrenzy', state.at) ? 777 : 1;
  return (base * 2 ** doubles + currentPerSecond(state, state.at) * share) * clickBoost;
}

export function click(state: GameState): GameState {
  return add(state, perClick(state));
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
    const upgrades = Array.isArray(saved.upgrades)
      ? [...new Set(saved.upgrades.filter((id) => typeof id === 'string' && UPGRADE_BY_ID.has(id)))]
      : [];
    return {
      gyoza: num(saved.gyoza, 0),
      baked: num(saved.baked, 0),
      owned,
      upgrades,
      buffs: Array.isArray(saved.buffs)
        ? saved.buffs.filter(
            (b): b is Buff =>
              (b?.kind === 'frenzy' || b?.kind === 'clickFrenzy') && Number.isFinite(b?.until),
          )
        : [],
      goldenClicks: Math.floor(num(saved.goldenClicks, 0)),
      at: Math.min(num(saved.at, now), now),
    };
  } catch {
    return fresh;
  }
}

const JA_UNITS = [
  [1e44, '載'],
  [1e40, '正'],
  [1e36, '澗'],
  [1e32, '溝'],
  [1e28, '穣'],
  [1e24, '𥝱'],
  [1e20, '垓'],
  [1e16, '京'],
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
  /** Image under /gyoza/. */
  icon: string;
  earned: (state: GameState) => boolean;
}[] = [
  { id: 'baked1', name: 'はじめの一個', description: '餃子を1個焼いた', icon: 'ach-baked1', earned: (s) => s.baked >= 1 },
  { id: 'baked100', name: '焼き手見習い', description: '餃子を100個焼いた', icon: 'ach-baked100', earned: (s) => s.baked >= 100 },
  { id: 'baked1k', name: '焼き場の常連', description: '餃子を1,000個焼いた', icon: 'ach-baked1k', earned: (s) => s.baked >= 1_000 },
  { id: 'baked10k', name: '一万個の壁', description: '餃子を1万個焼いた', icon: 'ach-baked10k', earned: (s) => s.baked >= 1e4 },
  { id: 'baked100k', name: '十万個の山', description: '餃子を10万個焼いた', icon: 'ach-baked100k', earned: (s) => s.baked >= 1e5 },
  { id: 'baked1m', name: '餃子長者', description: '餃子を100万個焼いた', icon: 'ach-baked1m', earned: (s) => s.baked >= 1e6 },
  { id: 'baked100m', name: '餃子の星', description: '餃子を1億個焼いた', icon: 'ach-baked1m', earned: (s) => s.baked >= 1e8 },
  { id: 'baked1t', name: '餃子の神', description: '餃子を1兆個焼いた', icon: 'ach-kami', earned: (s) => s.baked >= 1e12 },
  { id: 'baked1kei', name: '餃子の創造主', description: '餃子を1京個焼いた', icon: 'ach-kami', earned: (s) => s.baked >= 1e16 },
  { id: 'shokunin1', name: 'いらっしゃい、おじさん', description: '餃子職人のおじさんを雇った', icon: 'ach-shokunin', earned: (s) => s.owned.shokunin >= 1 },
  { id: 'shokunin10', name: '職人チーム', description: '餃子職人のおじさんを10人雇った', icon: 'ach-shokunin', earned: (s) => s.owned.shokunin >= 10 },
  { id: 'kikai1', name: '機械化', description: '餃子の自動製造機を導入した', icon: 'ach-kojo', earned: (s) => s.owned.kikai >= 1 },
  { id: 'senmonten1', name: '開店！', description: '町の餃子専門店を開いた', icon: 'ach-mise', earned: (s) => s.owned.senmonten >= 1 },
  { id: 'franchise1', name: '全国進出', description: '餃子フランチャイズを始めた', icon: 'ach-mise', earned: (s) => s.owned.franchise >= 1 },
  { id: 'kojo1', name: '工場をつくる', description: '全自動餃子工場を建てた', icon: 'ach-kojo', earned: (s) => s.owned.kojo >= 1 },
  { id: 'rengo1', name: '世界に広げる', description: '世界餃子連合を結成した', icon: 'ach-sekai', earned: (s) => s.owned.rengo >= 1 },
  { id: 'eisei1', name: '宇宙進出', description: '餃子人工衛星を打ち上げた', icon: 'ach-uchu', earned: (s) => s.owned.eisei >= 1 },
  { id: 'ginga1', name: '銀河の覇者', description: '銀河餃子帝国を築いた', icon: 'ach-uchu', earned: (s) => s.owned.ginga >= 1 },
  { id: 'jiku1', name: '時空を超えて', description: '時空餃子転送門を開いた', icon: 'ach-kami', earned: (s) => s.owned.jiku >= 1 },
  { id: 'rate10', name: '自動で焼ける', description: '毎秒10個焼けるようになった', icon: 'ach-baked100', earned: (s) => perSecond(s) >= 10 },
  { id: 'rate1k', name: '餃子の滝', description: '毎秒1,000個焼けるようになった', icon: 'ach-baked10k', earned: (s) => perSecond(s) >= 1_000 },
  { id: 'rate1m', name: '餃子の大河', description: '毎秒100万個焼けるようになった', icon: 'ach-baked1m', earned: (s) => perSecond(s) >= 1e6 },
  { id: 'upgrade1', name: 'ひと工夫', description: '強化を1つ買った', icon: 'upgrade-menbou', earned: (s) => s.upgrades.length >= 1 },
  { id: 'upgrade10', name: '研究熱心', description: '強化を10個買った', icon: 'upgrade-aichip', earned: (s) => s.upgrades.length >= 10 },
  { id: 'upgrade25', name: '餃子研究家', description: '強化を25個買った', icon: 'building-kenkyujo', earned: (s) => s.upgrades.length >= 25 },
  { id: 'golden1', name: '金色の出会い', description: '金の餃子を1回つかまえた', icon: 'golden', earned: (s) => s.goldenClicks >= 1 },
  { id: 'golden7', name: 'ラッキーセブン', description: '金の餃子を7回つかまえた', icon: 'bonus-clover', earned: (s) => s.goldenClicks >= 7 },
  { id: 'golden77', name: '金の餃子ハンター', description: '金の餃子を77回つかまえた', icon: 'bonus-crown', earned: (s) => s.goldenClicks >= 77 },
];

export function earnedAchievements(state: GameState): Set<string> {
  return new Set(ACHIEVEMENTS.filter((a) => a.earned(state)).map((a) => a.id));
}
