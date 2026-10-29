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
  /** Golden gyoza ever clicked, and which effects have come up. */
  goldenClicks: number;
  goldenSeen: string[];
  /** Clicks on the plate, and the gyoza they baked. */
  clicks: number;
  handBaked: number;
  /** When this game began, in ms since the epoch. */
  startedAt: number;
  /** のれん分け (prestige): times done, recipes held, gyoza baked in earlier shops, achievements kept. */
  rebirths: number;
  recipes: number;
  lifetimeBaked: number;
  keptAchievements: string[];
  /** Skills learned on 餃子の道, paid for with recipes. Kept through のれん分け. */
  skills: string[];
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
    goldenSeen: [],
    clicks: 0,
    handBaked: 0,
    startedAt: now,
    rebirths: 0,
    recipes: 0,
    lifetimeBaked: 0,
    keptAchievements: [],
    skills: [],
    at: now,
  };
}

export function cost(building: Building, owned: number, factor = 1): number {
  return Math.ceil(building.baseCost * PRICE_GROWTH ** owned * factor);
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
  senmonten: 'upgrade-koukoku',
  idou: 'upgrade-delivery',
  central: 'upgrade-reitou',
  franchise: 'upgrade-koukoku',
  themepark: 'upgrade-seiro',
  rengo: 'upgrade-chizu',
  eisei: 'upgrade-rocket',
  getsumen: 'upgrade-rocket',
  kasei: 'upgrade-rocket',
  ginga: 'upgrade-rocket',
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
    name: '時短タイマー',
    description: 'すべての設備の生産が2倍',
    cost: 1e10,
    icon: 'upgrade-jitan',
    unlocked: (s) => s.baked >= 1e9,
  },
  {
    id: 'komugi',
    kind: 'global',
    name: '特選小麦粉',
    description: 'すべての設備の生産が2倍',
    cost: 1e14,
    icon: 'upgrade-komugi',
    unlocked: (s) => s.baked >= 1e13,
  },
  {
    id: 'oukan',
    kind: 'global',
    name: '餃子王の冠',
    description: 'すべての設備の生産が2倍',
    cost: 1e19,
    icon: 'upgrade-oukan',
    unlocked: (s) => s.baked >= 1e18,
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
  return (
    BUILDINGS.reduce((sum, b) => sum + unitPerSecond(state, b) * state.owned[b.id], 0) *
    recipeBoost(state) *
    skillProductionBoost(state)
  );
}

/** Each 秘伝のレシピ adds 1% to production and clicks, for good; 2% with 奇跡のレシピ. */
export function recipeBoost(state: GameState): number {
  return 1 + state.recipes * recipePercent(state) * 0.01;
}

export function recipePercent(state: GameState): number {
  return hasSkill(state, 'kiseki') ? 2 : 1;
}

/** Gyoza per recipe grows as a cube, so each next one takes more baking. */
const RECIPE_UNIT = 1e10;

/** Recipes earned over every shop so far, counting this one. */
function recipesEarned(state: GameState): number {
  return Math.floor(Math.cbrt((state.lifetimeBaked + state.baked) / RECIPE_UNIT));
}

/** Recipes a のれん分け now would add. */
export function pendingRecipes(state: GameState): number {
  return Math.max(0, recipesEarned(state) - state.recipes);
}

/** Total gyoza (over all shops) needed for the next recipe. */
export function nextRecipeAt(state: GameState): number {
  return (recipesEarned(state) + 1) ** 3 * RECIPE_UNIT;
}

/**
 * のれん分け: hand the shop to an apprentice and open a new one. Gyoza,
 * buildings, upgrades and buffs start over; recipes, achievements and
 * lifetime stats carry on. Returns null when it would earn nothing.
 */
export function rebirth(state: GameState, now: number): GameState | null {
  if (pendingRecipes(state) < 1) return null;
  const fresh = initialState(now);
  return {
    ...fresh,
    goldenClicks: state.goldenClicks,
    goldenSeen: state.goldenSeen,
    clicks: state.clicks,
    handBaked: state.handBaked,
    startedAt: state.startedAt,
    rebirths: state.rebirths + 1,
    recipes: recipesEarned(state),
    lifetimeBaked: state.lifetimeBaked + state.baked,
    keptAchievements: [...earnedAchievements(state)],
    skills: state.skills,
  };
}

/**
 * 餃子の道: three paths of skills bought with recipes. Each path starts at one
 * skill, branches in two, and each branch ends in a big one. Learned skills
 * last for good; the recipes spent still count toward the +1% boost.
 */
export const SKILL_PATHS = [
  { id: 'tezutsumi', name: '手包みの道', subtitle: 'クリックを極める', badge: 'skill-path-tezutsumi', icon: 'skill-cat-click' },
  { id: 'shokunin', name: '職人の道', subtitle: '放置で生産を広げる', badge: 'skill-path-shokunin', icon: 'skill-cat-seisan' },
  { id: 'hiden', name: '秘伝の道', subtitle: '運と金の餃子を味方に', badge: 'skill-path-hiden', icon: 'skill-cat-un' },
] as const;

export type SkillPathId = (typeof SKILL_PATHS)[number]['id'];

export type Skill = {
  id: string;
  path: SkillPathId;
  name: string;
  description: string;
  cost: number;
  /** The skill that must be learned first, if any. */
  requires: string | null;
};

export const SKILLS: readonly Skill[] = [
  { id: 'kogane', path: 'tezutsumi', name: '黄金の指先', description: 'クリックで焼ける餃子が25%増える', cost: 10, requires: null },
  { id: 'hyakuretsu', path: 'tezutsumi', name: '百裂餃子拳', description: 'クリックで焼ける餃子が2倍', cost: 50, requires: 'kogane' },
  { id: 'shinsoku', path: 'tezutsumi', name: '神速の包み', description: 'クリックに毎秒の生産の3%が上乗せされる', cost: 100, requires: 'kogane' },
  { id: 'mugen', path: 'tezutsumi', name: '無限包み', description: 'クリックで焼ける餃子が5倍', cost: 300, requires: 'hyakuretsu' },
  { id: 'sennin', path: 'tezutsumi', name: '餃子仙人', description: 'クリックで焼ける餃子が10倍', cost: 800, requires: 'shinsoku' },
  { id: 'fumin', path: 'shokunin', name: '不眠不休', description: '毎秒の生産が25%増える', cost: 10, requires: null },
  { id: 'kouritsu', path: 'shokunin', name: '自動効率化', description: '設備の値段が10%安くなる', cost: 50, requires: 'fumin' },
  { id: 'tairyou', path: 'shokunin', name: '大量生産', description: '毎秒の生産が2倍', cost: 100, requires: 'fumin' },
  { id: 'eikyu', path: 'shokunin', name: '永久機関', description: '毎秒の生産が3倍', cost: 300, requires: 'kouritsu' },
  { id: 'tokuiten', path: 'shokunin', name: '餃子特異点', description: '毎秒の生産が10倍', cost: 800, requires: 'tairyou' },
  { id: 'kounira', path: 'hiden', name: '幸運のニラ', description: '金の餃子が1.5倍よく出てくる', cost: 10, requires: null },
  { id: 'michibiki', path: 'hiden', name: '黄金餃子の導き', description: '金の餃子の効果が1.5倍長く続く', cost: 50, requires: 'kounira' },
  { id: 'zukan', path: 'hiden', name: 'レア餃子図鑑', description: '「神の手」が3倍出やすくなる', cost: 100, requires: 'kounira' },
  { id: 'daifever', path: 'hiden', name: '大フィーバー', description: '焼きたてラッシュが7倍から15倍になる', cost: 300, requires: 'michibiki' },
  { id: 'kiseki', path: 'hiden', name: '奇跡のレシピ', description: '秘伝のレシピ1つの効果が+1%から+2%になる', cost: 800, requires: 'zukan' },
];

const SKILL_BY_ID = new Map(SKILLS.map((s) => [s.id, s]));

export function hasSkill(state: GameState, id: string): boolean {
  return state.skills.includes(id);
}

/** Recipes not yet spent on skills. */
export function usableRecipes(state: GameState): number {
  const spent = state.skills.reduce((sum, id) => sum + (SKILL_BY_ID.get(id)?.cost ?? 0), 0);
  return Math.max(0, state.recipes - spent);
}

/** 'done' learned, 'ready' learnable now, 'open' unlocked but short of recipes, 'locked' needs the one before. */
export function skillStatus(state: GameState, skill: Skill): 'done' | 'ready' | 'open' | 'locked' {
  if (hasSkill(state, skill.id)) return 'done';
  if (skill.requires && !hasSkill(state, skill.requires)) return 'locked';
  return usableRecipes(state) >= skill.cost ? 'ready' : 'open';
}

/** Returns the state after learning skill `id`, or null when it can't be. */
export function learnSkill(state: GameState, id: string): GameState | null {
  const skill = SKILL_BY_ID.get(id);
  if (!skill || skillStatus(state, skill) !== 'ready') return null;
  return { ...state, skills: [...state.skills, id] };
}

/** What 職人の道 multiplies production by. */
export function skillProductionBoost(state: GameState): number {
  return (
    (hasSkill(state, 'fumin') ? 1.25 : 1) *
    (hasSkill(state, 'tairyou') ? 2 : 1) *
    (hasSkill(state, 'eikyu') ? 3 : 1) *
    (hasSkill(state, 'tokuiten') ? 10 : 1)
  );
}

/** What 手包みの道 multiplies clicks by. */
export function skillClickBoost(state: GameState): number {
  return (
    (hasSkill(state, 'kogane') ? 1.25 : 1) *
    (hasSkill(state, 'hyakuretsu') ? 2 : 1) *
    (hasSkill(state, 'mugen') ? 5 : 1) *
    (hasSkill(state, 'sennin') ? 10 : 1)
  );
}

/** Building prices after 自動効率化. */
export function priceFactor(state: GameState): number {
  return hasSkill(state, 'kouritsu') ? 0.9 : 1;
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

/** The wait before the next golden gyoza, halved by 餃子の妖精 and shortened by 幸運のニラ. */
export function goldenWaitMs(state: GameState): { min: number; max: number } {
  const div = (has(state, 'goldenOften') > 0 ? 2 : 1) * (hasSkill(state, 'kounira') ? 1.5 : 1);
  return { min: GOLDEN_WAIT_MS.min / div, max: GOLDEN_WAIT_MS.max / div };
}

function buffActive(state: GameState, kind: Buff['kind'], at: number): boolean {
  return state.buffs.some((b) => b.kind === kind && b.until > at);
}

/** The production multiplier buffs give at time `at`. */
export function productionBoost(state: GameState, at: number): number {
  if (!buffActive(state, 'frenzy', at)) return 1;
  return hasSkill(state, 'daifever') ? 15 : 7;
}

/** Per second right now, golden gyoza buffs included. */
export function currentPerSecond(state: GameState, now: number): number {
  return perSecond(state) * productionBoost(state, now);
}

/** How long a buff lasts, doubled by にんにくパワー and ×1.5 by 黄金餃子の導き. */
export function buffSeconds(state: GameState, effect: GoldenEffect): number {
  return (
    effect.seconds * (has(state, 'goldenLonger') > 0 ? 2 : 1) * (hasSkill(state, 'michibiki') ? 1.5 : 1)
  );
}

/** How often `effect` is drawn; レア餃子図鑑 makes 神の手 three times likelier. */
function goldenWeight(state: GameState | null, effect: GoldenEffect): number {
  return effect.kind === 'clickFrenzy' && state && hasSkill(state, 'zukan') ? effect.weight * 3 : effect.weight;
}

/** What `effect` does in this shop, with the skills and upgrades that change it. */
export function goldenDescription(state: GameState, effect: GoldenEffect): string {
  const seconds = Math.round(buffSeconds(state, effect));
  if (effect.kind === 'frenzy') return `${seconds}秒間、毎秒の生産が${hasSkill(state, 'daifever') ? 15 : 7}倍`;
  if (effect.kind === 'clickFrenzy') return `${seconds}秒間、クリックが777倍`;
  return effect.description;
}

/** Picks an effect from `roll` in [0, 1), so the game stays free of randomness. */
export function pickGoldenEffect(roll: number, state: GameState | null = null): GoldenEffect {
  const total = GOLDEN_EFFECTS.reduce((sum, e) => sum + goldenWeight(state, e), 0);
  let left = roll * total;
  for (const e of GOLDEN_EFFECTS) {
    left -= goldenWeight(state, e);
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
  const counted = {
    ...tick(state, now),
    goldenClicks: state.goldenClicks + 1,
    goldenSeen: state.goldenSeen.includes(effect.kind) ? state.goldenSeen : [...state.goldenSeen, effect.kind],
  };
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
  const share =
    ups.reduce((sum, u) => sum + (u.kind === 'clickRate' ? u.share : 0), 0) +
    (hasSkill(state, 'shinsoku') ? 0.03 : 0);
  const base = 1 + state.owned.tezukuri * tezukuriClickShare(state);
  const clickBoost = buffActive(state, 'clickFrenzy', state.at) ? 777 : 1;
  return (
    (base * 2 ** doubles * recipeBoost(state) + currentPerSecond(state, state.at) * share) *
    skillClickBoost(state) *
    clickBoost
  );
}

export function click(state: GameState): GameState {
  const n = perClick(state);
  return { ...add(state, n), clicks: state.clicks + 1, handBaked: state.handBaked + n };
}

/** What the next `count` of a building cost together, each priced as it's bought. */
export function costOf(building: Building, owned: number, count: number, factor = 1): number {
  let total = 0;
  for (let i = 0; i < count; i++) total += cost(building, owned + i, factor);
  return total;
}

/** How many of a building the gyoza on hand can buy, at least 1 so a price can show. */
export function affordableCount(state: GameState, building: Building): number {
  let count = 0;
  let total = 0;
  while (true) {
    total += cost(building, state.owned[building.id] + count, priceFactor(state));
    if (total > state.gyoza) return Math.max(1, count);
    count++;
  }
}

/** Returns the state after buying `count` of `id`, or null when they can't be afforded. */
export function buy(state: GameState, id: BuildingId, count = 1): GameState | null {
  const building = BUILDINGS.find((b) => b.id === id)!;
  const price = costOf(building, state.owned[id], count, priceFactor(state));
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

const EXPORT_PREFIX = 'GYOZA1:';

/** The save as one line of text to copy elsewhere. */
export function exportSave(state: GameState): string {
  return EXPORT_PREFIX + btoa(JSON.stringify(state));
}

/** Reads text from `exportSave`, or returns null when it isn't one. */
export function importSave(text: string, now: number): GameState | null {
  const trimmed = text.trim();
  if (!trimmed.startsWith(EXPORT_PREFIX)) return null;
  try {
    const json = atob(trimmed.slice(EXPORT_PREFIX.length));
    const parsed: unknown = JSON.parse(json);
    if (typeof parsed !== 'object' || parsed === null || !('owned' in parsed)) return null;
    return load(json, now);
  } catch {
    return null;
  }
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
      goldenSeen: Array.isArray(saved.goldenSeen)
        ? saved.goldenSeen.filter((k) => GOLDEN_EFFECTS.some((e) => e.kind === k))
        : [],
      clicks: Math.floor(num(saved.clicks, 0)),
      handBaked: num(saved.handBaked, 0),
      // Saves from before this field existed count from their last save.
      startedAt: Math.min(num(saved.startedAt, num(saved.at, now)), now),
      rebirths: Math.floor(num(saved.rebirths, 0)),
      recipes: Math.floor(num(saved.recipes, 0)),
      lifetimeBaked: num(saved.lifetimeBaked, 0),
      keptAchievements: Array.isArray(saved.keptAchievements)
        ? [...new Set(saved.keptAchievements.filter((id) => ACHIEVEMENTS.some((a) => a.id === id)))]
        : [],
      skills: Array.isArray(saved.skills)
        ? [...new Set(saved.skills.filter((id) => typeof id === 'string' && SKILL_BY_ID.has(id)))]
        : [],
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
 * Achievements are read straight off the state. Most of what they read only
 * ever grows, but not all (すっからかん, or anything after のれん分け), so
 * earned ones are also written into `keptAchievements` by `recordAchievements`.
 */
export const ACHIEVEMENTS: readonly {
  id: string;
  name: string;
  description: string;
  /** Image under /gyoza/. */
  icon: string;
  /** A secret: its hint stays hidden until earned. */
  hidden?: boolean;
  earned: (state: GameState) => boolean;
}[] = [
  { id: 'baked1', name: 'はじめの一個', description: '餃子を1個焼いた', icon: 'ach-baked1', earned: (s) => s.baked >= 1 },
  { id: 'baked100', name: '焼き手見習い', description: '餃子を100個焼いた', icon: 'ach-baked100', earned: (s) => s.baked >= 100 },
  { id: 'baked1k', name: '焼き場の常連', description: '餃子を1,000個焼いた', icon: 'ach-baked1k', earned: (s) => s.baked >= 1_000 },
  { id: 'baked10k', name: '一万個の壁', description: '餃子を1万個焼いた', icon: 'ach-baked10k', earned: (s) => s.baked >= 1e4 },
  { id: 'baked100k', name: '十万個の山', description: '餃子を10万個焼いた', icon: 'ach-baked100k', earned: (s) => s.baked >= 1e5 },
  { id: 'baked1m', name: '餃子長者', description: '餃子を100万個焼いた', icon: 'ach-baked1m', earned: (s) => s.baked >= 1e6 },
  { id: 'baked100m', name: '餃子の星', description: '餃子を1億個焼いた', icon: 'ach-baked1m', earned: (s) => s.baked >= 1e8 },
  { id: 'baked1b', name: '十億の餃子', description: '餃子を10億個焼いた', icon: 'ach-baked1b', earned: (s) => s.baked >= 1e9 },
  { id: 'baked1t', name: '一兆個の夢', description: '餃子を1兆個焼いた', icon: 'ach-baked1t', earned: (s) => s.baked >= 1e12 },
  { id: 'baked1kei', name: '餃子の王になった', description: '餃子を1京個焼いた', icon: 'ach-ou', earned: (s) => s.baked >= 1e16 },
  { id: 'baked1gai', name: '餃子の神に会った', description: '餃子を1垓個焼いた', icon: 'ach-kamisama', earned: (s) => s.baked >= 1e20 },
  { id: 'rate10', name: '自動で焼ける', description: '毎秒10個焼けるようになった', icon: 'ach-baked100', earned: (s) => perSecond(s) >= 10 },
  { id: 'rate1k', name: '餃子の滝', description: '毎秒1,000個焼けるようになった', icon: 'ach-baked10k', earned: (s) => perSecond(s) >= 1_000 },
  { id: 'rate1m', name: '餃子の大河', description: '毎秒100万個焼けるようになった', icon: 'ach-baked1m', earned: (s) => perSecond(s) >= 1e6 },
  { id: 'rate1b', name: '餃子の嵐', description: '毎秒10億個焼けるようになった', icon: 'ach-baked1b', earned: (s) => perSecond(s) >= 1e9 },
  { id: 'clicks1k', name: 'お得意さま', description: 'お皿を1,000回クリックした', icon: 'ach-okyaku', earned: (s) => s.clicks >= 1_000 },
  { id: 'clicks10k', name: 'お客さん1万人', description: 'お皿を1万回クリックした', icon: 'ach-okyaku', earned: (s) => s.clicks >= 1e4 },
  { id: 'hand1m', name: '手包みの達人', description: '手で餃子を100万個焼いた', icon: 'upgrade-menbou', earned: (s) => s.handBaked >= 1e6 },
  { id: 'shokunin1', name: 'いらっしゃい、おじさん', description: '餃子職人のおじさんを雇った', icon: 'ach-shokunin', earned: (s) => s.owned.shokunin >= 1 },
  { id: 'shokunin10', name: '職人チーム', description: '餃子職人のおじさんを10人雇った', icon: 'ach-shokunin', earned: (s) => s.owned.shokunin >= 10 },
  { id: 'shokunin100', name: '職人を100人雇った', description: '餃子職人のおじさんを100人雇った', icon: 'ach-shokunin100', earned: (s) => s.owned.shokunin >= 100 },
  { id: 'kikai1', name: '機械化', description: '餃子の自動製造機を導入した', icon: 'ach-kojo', earned: (s) => s.owned.kikai >= 1 },
  { id: 'senmonten1', name: '開店！', description: '町の餃子専門店を開いた', icon: 'ach-mise', earned: (s) => s.owned.senmonten >= 1 },
  { id: 'senmonten100', name: '100店舗達成', description: '町の餃子専門店を100店舗にした', icon: 'ach-mise100', earned: (s) => s.owned.senmonten >= 100 },
  { id: 'idou100', name: '移動販売で全国制覇', description: '餃子の移動販売車を100台走らせた', icon: 'ach-idou', earned: (s) => s.owned.idou >= 100 },
  { id: 'franchise1', name: '全国進出', description: '餃子フランチャイズを始めた', icon: 'ach-mise', earned: (s) => s.owned.franchise >= 1 },
  { id: 'kojo1', name: '工場をつくる', description: '全自動餃子工場を建てた', icon: 'ach-kojo', earned: (s) => s.owned.kojo >= 1 },
  { id: 'themepark1', name: 'テーマパークを完成', description: '餃子テーマパークを開いた', icon: 'ach-themepark', earned: (s) => s.owned.themepark >= 1 },
  { id: 'rengo1', name: '世界中に届けた', description: '世界餃子連合を結成した', icon: 'ach-sekai2', earned: (s) => s.owned.rengo >= 1 },
  { id: 'eisei1', name: '宇宙進出', description: '餃子人工衛星を打ち上げた', icon: 'ach-uchu', earned: (s) => s.owned.eisei >= 1 },
  { id: 'getsumen1', name: '月に進出した', description: '月面餃子基地をつくった', icon: 'ach-tsuki', earned: (s) => s.owned.getsumen >= 1 },
  { id: 'kasei1', name: '火星に進出した', description: '火星餃子農園をひらいた', icon: 'ach-kasei', earned: (s) => s.owned.kasei >= 1 },
  { id: 'ginga1', name: '銀河に広めた', description: '銀河餃子帝国を築いた', icon: 'ach-ginga', earned: (s) => s.owned.ginga >= 1 },
  { id: 'wakusei1', name: '宇宙工場を建設', description: '餃子惑星を手に入れた', icon: 'ach-uchukojo', earned: (s) => s.owned.wakusei >= 1 },
  { id: 'jiku1', name: '時空を超えて', description: '時空餃子転送門を開いた', icon: 'ach-kami', earned: (s) => s.owned.jiku >= 1 },
  { id: 'total1000', name: '1000台の機械', description: '設備を合計1,000台そろえた', icon: 'ach-kikai1000', earned: (s) => BUILDINGS.reduce((sum, b) => sum + s.owned[b.id], 0) >= 1_000 },
  { id: 'upgrade1', name: 'ひと工夫', description: '強化を1つ買った', icon: 'upgrade-menbou', earned: (s) => s.upgrades.length >= 1 },
  { id: 'upgrade10', name: '研究熱心', description: '強化を10個買った', icon: 'upgrade-aichip', earned: (s) => s.upgrades.length >= 10 },
  { id: 'upgrade25', name: '餃子研究家', description: '強化を25個買った', icon: 'building-kenkyujo', earned: (s) => s.upgrades.length >= 25 },
  { id: 'upgrade50', name: '餃子博士', description: '強化を50個買った', icon: 'upgrade-recipebook', earned: (s) => s.upgrades.length >= 50 },
  { id: 'upgradeAll', name: '全レシピを解放した', description: '強化をすべて買った', icon: 'ach-allrecipe', earned: (s) => s.upgrades.length >= UPGRADES.length },
  { id: 'golden1', name: '黄金餃子をつかんだ', description: '金の餃子を1回つかまえた', icon: 'ach-golden', earned: (s) => s.goldenClicks >= 1 },
  { id: 'golden7', name: 'ラッキーセブン', description: '金の餃子を7回つかまえた', icon: 'bonus-clover', earned: (s) => s.goldenClicks >= 7 },
  { id: 'golden77', name: '金の餃子ハンター', description: '金の餃子を77回つかまえた', icon: 'bonus-crown', earned: (s) => s.goldenClicks >= 77 },
  { id: 'goldenRare', name: 'レア餃子を発見した', description: '金の餃子から「神の手」が出た', icon: 'ach-rare', earned: (s) => s.goldenSeen.includes('clickFrenzy') },
  { id: 'goldenAll', name: '全種類の餃子を集めた', description: '金の餃子の効果を4種類すべて見た', icon: 'ach-allgolden', earned: (s) => GOLDEN_EFFECTS.every((e) => s.goldenSeen.includes(e.kind)) },
  { id: 'rebirth1', name: 'のれん分け', description: 'はじめてのれん分けをした', icon: 'bonus-crown', earned: (s) => s.rebirths >= 1 },
  { id: 'rebirth10', name: '餃子の家元', description: 'のれん分けを10回した', icon: 'ach-kami', earned: (s) => s.rebirths >= 10 },
  { id: 'skill1', name: '餃子の道へ', description: 'スキルをはじめて習得した', icon: 'skill-cat-recipe', earned: (s) => s.skills.length >= 1 },
  { id: 'skillPath', name: '道を極めた', description: 'ひとつの道のスキルをすべて習得した', icon: 'skill-cat-special', earned: (s) => SKILL_PATHS.some((p) => SKILLS.filter((k) => k.path === p.id).every((k) => s.skills.includes(k.id))) },
  { id: 'skillAll', name: '餃子の道を究めた', description: 'スキルをすべて習得した', icon: 'skill-cat-final', earned: (s) => SKILLS.every((k) => s.skills.includes(k.id)) },
  { id: 'sukkarakan', name: 'すっからかん', description: '餃子を使い切って、手持ちがぴったり0個になった', icon: 'ach-hidden', hidden: true, earned: (s) => s.baked >= 1_000 && s.gyoza < 1 },
];

/** Writes newly earned achievements into the save so they stay earned. */
export function recordAchievements(state: GameState): GameState {
  const earned = earnedAchievements(state);
  if (earned.size === state.keptAchievements.length) return state;
  return { ...state, keptAchievements: [...earned] };
}

/** Achievements earned now, plus the ones already recorded. */
export function earnedAchievements(state: GameState): Set<string> {
  return new Set([
    ...state.keptAchievements,
    ...ACHIEVEMENTS.filter((a) => a.earned(state)).map((a) => a.id),
  ]);
}
