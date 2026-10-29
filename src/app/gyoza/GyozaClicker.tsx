'use client';

import { useEffect, useRef, useState, type MouseEvent } from 'react';
import {
  ACHIEVEMENTS,
  BUILDINGS,
  affordableCount,
  availableUpgrades,
  bonus,
  buffsLeft,
  buy,
  buyUpgrade,
  click,
  costOf,
  currentPerSecond,
  earnedAchievements,
  exportSave,
  importSave,
  formatJa,
  GOLDEN_STAY_MS,
  goldenClick,
  goldenWaitMs,
  initialState,
  load,
  nextBonusStep,
  nextRecipeAt,
  pendingRecipes,
  perClick,
  pickGoldenEffect,
  rebirth,
  tezukuriClickShare,
  tick,
  unitPerSecond,
  upgradeMultiplier,
  visibility,
  type BuildingId,
  type GameState,
  type Upgrade,
} from './game';
import { playSound, type SoundName } from './sound';

const STORAGE_KEY = 'gyoza-clicker:v1';
const SETTINGS_KEY = 'gyoza-clicker:settings';

/** Per-browser preferences, kept apart from the save so export/import leaves them be. */
type Settings = { sound: boolean; scene: 'auto' | 'day' | 'night' };
const DEFAULT_SETTINGS: Settings = { sound: false, scene: 'auto' };

function loadSettings(): Settings {
  try {
    const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY) ?? '{}') as Partial<Settings>;
    return {
      sound: saved.sound === true,
      scene: saved.scene === 'day' || saved.scene === 'night' ? saved.scene : 'auto',
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

/** Evening and night (18:00–5:59) by the player's own clock. */
function isNightAt(ms: number): boolean {
  const hour = new Date(ms).getHours();
  return hour >= 18 || hour < 6;
}
const SAVE_EVERY_MS = 5_000;

const format = formatJa;
const formatRate = (n: number) =>
  n >= 1e4 ? formatJa(n) : n.toLocaleString('ja-JP', { maximumFractionDigits: n < 10 ? 1 : 0 });

/** How many to buy per press; 'max' buys as many as the gyoza on hand allow. */
type Amount = number | 'max';
const AMOUNT_PRESETS: Amount[] = [1, 10, 50, 100, 'max'];

type Tab = 'shop' | 'upgrades' | 'achievements' | 'more';
const TABS: { id: Tab; label: string }[] = [
  { id: 'shop', label: 'お店' },
  { id: 'upgrades', label: '強化' },
  { id: 'achievements', label: '実績' },
  { id: 'more', label: 'その他' },
];

type Floater = { id: number; x: number; y: number; n: number };
type Toast = { id: number; image: string; title: string; description: string };
/** Where a golden gyoza sits, in % of the viewport. */
type Golden = { id: number; x: number; y: number };

function save(state: GameState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Private mode or full storage: the game still runs, it just won't resume.
  }
}

export function GyozaClicker() {
  // Starts empty on the server; the saved game is read after mount so the
  // first client render matches the HTML.
  const [state, setState] = useState<GameState>(() => initialState(0));
  const [loaded, setLoaded] = useState(false);
  const [wobble, setWobble] = useState(0);
  const [amount, setAmount] = useState<Amount>(1);
  const [floaters, setFloaters] = useState<Floater[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [focusedUpgrade, setFocusedUpgrade] = useState<string | null>(null);
  const [golden, setGolden] = useState<Golden | null>(null);
  const [tab, setTab] = useState<Tab>('shop');
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const settingsRef = useRef(settings);
  settingsRef.current = settings;
  const sound = (name: SoundName) => {
    if (settingsRef.current.sound) playSound(name);
  };
  const changeSettings = (next: Settings) => {
    setSettings(next);
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
    } catch {}
  };
  const nextId = useRef(0);
  const stateRef = useRef(state);
  stateRef.current = state;
  // Null until the save is loaded, so achievements already earned don't toast.
  const earnedRef = useRef<Set<string> | null>(null);
  const earned = earnedAchievements(state);

  useEffect(() => {
    if (!loaded) return;
    const before = earnedRef.current;
    earnedRef.current = earned;
    if (!before) return;
    const fresh = ACHIEVEMENTS.filter((a) => earned.has(a.id) && !before.has(a.id));
    if (fresh.length === 0) return;
    sound('achievement');
    showToasts(
      fresh.map((a) => ({
        image: `/gyoza/${a.icon}.webp`,
        title: `🏆 実績解除：${a.name}`,
        description: a.description,
      })),
    );
  });

  function showToasts(list: Omit<Toast, 'id'>[]) {
    const added = list.map((t) => ({ ...t, id: nextId.current++ }));
    setToasts((t) => [...t, ...added]);
    setTimeout(() => {
      const gone = new Set(added.map((t) => t.id));
      setToasts((t) => t.filter((x) => !gone.has(x.id)));
    }, 3_500);
  }

  // A golden gyoza shows up every one to three minutes and leaves after a while.
  useEffect(() => {
    if (!loaded) return;
    let timer: ReturnType<typeof setTimeout>;
    const wait = () => {
      const { min, max } = goldenWaitMs(stateRef.current);
      const delay = min + Math.random() * (max - min);
      timer = setTimeout(() => {
        setGolden({ id: nextId.current++, x: 8 + Math.random() * 76, y: 12 + Math.random() * 68 });
        timer = setTimeout(() => {
          setGolden(null);
          wait();
        }, GOLDEN_STAY_MS);
      }, delay);
    };
    wait();
    return () => clearTimeout(timer);
  }, [loaded]);

  useEffect(() => {
    let saved: string | null = null;
    try {
      saved = localStorage.getItem(STORAGE_KEY);
    } catch {}
    // `tick` from the saved time adds what was baked while the tab was closed.
    setState(tick(load(saved, Date.now()), Date.now()));
    setSettings(loadSettings());
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    const frame = setInterval(() => setState((s) => tick(s, Date.now())), 100);
    const autosave = setInterval(() => save(stateRef.current), SAVE_EVERY_MS);
    const saveNow = () => save(tick(stateRef.current, Date.now()));
    document.addEventListener('visibilitychange', saveNow);
    window.addEventListener('pagehide', saveNow);
    return () => {
      clearInterval(frame);
      clearInterval(autosave);
      document.removeEventListener('visibilitychange', saveNow);
      window.removeEventListener('pagehide', saveNow);
    };
  }, [loaded]);

  const onBake = (e: MouseEvent<HTMLButtonElement>) => {
    const n = perClick(state);
    setState((s) => click(tick(s, Date.now())));
    sound('bake');
    setWobble((n) => n + 1);
    const box = e.currentTarget.getBoundingClientRect();
    // Keyboard clicks have no pointer position; float from the middle then.
    const x = e.clientX ? e.clientX - box.left : box.width / 2;
    const y = e.clientY ? e.clientY - box.top : box.height / 2;
    const id = nextId.current++;
    setFloaters((f) => [...f, { id, x, y, n }]);
    setTimeout(() => setFloaters((f) => f.filter((x) => x.id !== id)), 800);
  };

  const onBuy = (id: BuildingId, count: number) => {
    const next = buy(tick(stateRef.current, Date.now()), id, count);
    if (!next) return;
    setState(next);
    save(next);
    sound('buy');
  };

  const onGolden = () => {
    setGolden(null);
    const effect = pickGoldenEffect(Math.random());
    const { state: next, gained } = goldenClick(stateRef.current, effect, Date.now());
    setState(next);
    save(next);
    sound('golden');
    showToasts([
      {
        image: `/gyoza/${effect.image}.webp`,
        title: `${effect.name}！`,
        description: gained > 0 ? `餃子を${format(gained)}個もらった` : effect.description,
      },
    ]);
  };

  /** Swaps in a whole new game (import or reset) without toasting its achievements. */
  const onReplace = (next: GameState) => {
    earnedRef.current = earnedAchievements(next);
    setState(next);
    save(next);
  };

  const onBuyUpgrade = (id: string) => {
    const next = buyUpgrade(tick(stateRef.current, Date.now()), id);
    if (!next) return;
    setState(next);
    save(next);
    sound('buy');
  };

  const rate = currentPerSecond(state, state.at);
  const buffs = buffsLeft(state, state.at);
  const upgrades = availableUpgrades(state);
  const affordableUpgrades = upgrades.filter((u) => state.gyoza >= u.cost).length;
  const shownUpgrade = upgrades.find((u) => u.id === focusedUpgrade) ?? upgrades[0];

  const night = settings.scene === 'night' || (settings.scene === 'auto' && loaded && isNightAt(state.at));

  return (
    <div
      className="min-h-dvh bg-cover bg-fixed bg-center"
      style={{ backgroundImage: 'url(/gyoza/background-shop.webp)' }}
    >
      {/* Night: the same shop, darkened and lit by its lanterns. */}
      <div
        aria-hidden="true"
        className={`pointer-events-none fixed inset-0 transition-opacity duration-1000 ${night ? 'opacity-100' : 'opacity-0'}`}
        style={{
          background:
            'radial-gradient(ellipse 40% 30% at 18% 8%, rgb(255 170 80 / 0.35), transparent), radial-gradient(ellipse 50% 35% at 50% 70%, rgb(255 190 110 / 0.18), transparent), rgb(20 24 60 / 0.55)',
        }}
      />
      <div className="relative mx-auto grid max-w-6xl gap-6 px-4 py-6 md:grid-cols-[1fr_26rem] md:py-10">
        <section className="flex flex-col items-center gap-4">
          <img
            src="/gyoza/logo.webp"
            alt="餃子クリッカー"
            width={1200}
            height={320}
            className="w-full max-w-md"
          />
          <div className="rounded-2xl bg-white/85 px-8 py-3 text-center text-stone-900 shadow-lg">
            <p className="text-[2.5rem] leading-tight font-bold tabular-nums">
              {format(state.gyoza)}
              <span className="ml-1 text-[1.25rem]">個</span>
            </p>
            <p className="text-sm text-stone-600">
              毎秒 {formatRate(rate)} 個・1クリック {format(perClick(state))} 個
            </p>
            {state.recipes > 0 && (
              <p className="text-xs text-amber-800">秘伝のレシピ {format(state.recipes)}個（+{format(state.recipes)}%）</p>
            )}
          </div>
          {buffs.length > 0 && (
            <ul className="flex flex-wrap justify-center gap-2">
              {buffs.map((b) => (
                <li
                  key={b.effect.kind}
                  title={b.effect.description}
                  className="flex items-center gap-1 rounded-full bg-amber-500 py-1 pr-3 pl-1.5 text-sm font-bold text-white shadow tabular-nums"
                >
                  <img src={`/gyoza/${b.effect.image}.webp`} alt="" className="size-6" />
                  {b.effect.name} 残り{b.seconds}秒
                </li>
              ))}
            </ul>
          )}
          <button
            type="button"
            onClick={onBake}
            className="relative cursor-pointer transition-transform hover:scale-105 active:scale-95"
          >
            <img
              key={wobble}
              src="/gyoza/plate.webp"
              alt="餃子を焼く"
              width={1200}
              height={750}
              draggable={false}
              className={`w-72 select-none drop-shadow-xl md:w-96 ${wobble ? 'gyoza-wobble' : ''}`}
            />
            {floaters.map((f) => (
              <span
                key={f.id}
                aria-hidden="true"
                className="gyoza-float pointer-events-none absolute text-[1.75rem] font-bold text-white [text-shadow:0_2px_4px_rgb(0_0_0/0.6)]"
                style={{ left: f.x, top: f.y }}
              >
                +{format(f.n)}
              </span>
            ))}
          </button>
        </section>

        <section className="flex flex-col overflow-hidden rounded-2xl bg-amber-50/95 text-stone-900 shadow-xl md:sticky md:top-6 md:h-[calc(100dvh-3rem)]">
          <div role="tablist" aria-label="お店のメニュー" className="flex shrink-0 gap-1 overflow-x-auto border-b-2 border-amber-800/20 px-3 pt-3">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                id={`gyoza-tab-${t.id}`}
                aria-selected={tab === t.id}
                aria-controls="gyoza-tabpanel"
                onClick={() => setTab(t.id)}
                className="relative flex shrink-0 cursor-pointer items-center gap-1.5 rounded-t-xl border-2 border-b-0 border-amber-800/20 bg-amber-100 px-2 py-2 font-bold sm:px-3 text-amber-900 hover:bg-amber-200 aria-selected:border-red-700 aria-selected:bg-red-600 aria-selected:text-white"
              >
                {t.id === 'shop' && <img src="/gyoza/gyoza.webp" alt="" className="hidden size-6 sm:block" />}
                {t.label}
                {t.id === 'upgrades' && affordableUpgrades > 0 && (
                  <span className="rounded-full bg-amber-500 px-1.5 text-xs text-white tabular-nums">
                    {affordableUpgrades}
                  </span>
                )}
                {t.id === 'achievements' && (
                  <span className="text-xs font-normal tabular-nums opacity-80">
                    {earned.size}/{ACHIEVEMENTS.length}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div
            role="tabpanel"
            id="gyoza-tabpanel"
            aria-labelledby={`gyoza-tab-${tab}`}
            className="min-h-0 flex-1 overflow-y-auto p-4 [scrollbar-gutter:stable]"
          >
            {tab === 'shop' && (
              <>
              <div className="mb-3 flex flex-wrap items-center gap-1.5 text-sm">
                <span className="mr-1 text-stone-600">まとめ買い</span>
                {AMOUNT_PRESETS.map((a) => (
                  <button
                    key={a}
                    type="button"
                    aria-pressed={amount === a}
                    onClick={() => setAmount(a)}
                    className="cursor-pointer rounded-md border border-amber-700/40 px-2.5 py-1 font-bold aria-pressed:bg-amber-700 aria-pressed:text-white"
                  >
                    {a === 'max' ? '最大' : `×${a}`}
                  </button>
                ))}
                <label className="flex items-center gap-1">
                  <span className="sr-only">個数を指定</span>×
                  <input
                    type="number"
                    min={1}
                    max={9999}
                    value={typeof amount === 'number' ? amount : ''}
                    placeholder="n"
                    onChange={(e) => {
                      const n = Math.floor(Number(e.target.value));
                      if (n >= 1) setAmount(Math.min(n, 9999));
                    }}
                    className="w-16 rounded-md border border-amber-700/40 bg-white px-2 py-1"
                  />
                </label>
              </div>
              <ul className="flex flex-col gap-2">
                {BUILDINGS.map((b, i) => {
                  const shown = visibility(state, i);
                  if (shown === 'hidden') return null;
                  if (shown === 'teaser') {
                    return (
                      <li key={b.id} className="flex items-center gap-3 rounded-xl bg-stone-200/70 p-2">
                        <img src="/gyoza/building-locked.webp" alt="" className="size-14 opacity-70" />
                        <p className="text-lg font-bold text-stone-500">???</p>
                      </li>
                    );
                  }
                  const count = amount === 'max' ? affordableCount(state, b) : amount;
                  const price = costOf(b, state.owned[b.id], count);
                  const affordable = state.gyoza >= price;
                  return (
                    <li key={b.id} className="flex items-center gap-3 rounded-xl bg-white p-2 shadow-sm">
                      <img src={`/gyoza/building-${b.id}.webp`} alt="" className="size-14 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="font-bold">
                          {b.name}
                          <span className="ml-2 text-sm font-normal text-stone-600">
                            {state.owned[b.id]}
                            {b.counter}
                          </span>
                        </p>
                        <p className="text-xs text-stone-600">
                          毎秒 {formatRate(unitPerSecond(state, b))} 個
                          {b.id === 'tezukuri' && `・1クリック +${format(tezukuriClickShare(state))}個`}・
                          {b.flavor}
                        </p>
                        <p className="text-xs text-amber-800">
                          {bonus(state.owned[b.id]) * upgradeMultiplier(state, b.id) > 1 && (
                            <span className="mr-1 rounded bg-amber-600 px-1 font-bold text-white">
                              ×{format(bonus(state.owned[b.id]) * upgradeMultiplier(state, b.id))}
                            </span>
                          )}
                          {nextBonusStep(state.owned[b.id]) != null
                            ? `${nextBonusStep(state.owned[b.id])}${b.counter}で生産2倍`
                            : 'ボーナス最大'}
                        </p>
                      </div>
                      <button
                        type="button"
                        disabled={!affordable}
                        onClick={() => onBuy(b.id, count)}
                        className="shrink-0 cursor-pointer rounded-lg bg-amber-600 px-3 py-2 text-sm font-bold text-white tabular-nums hover:bg-amber-700 disabled:cursor-not-allowed disabled:bg-stone-300 disabled:text-stone-500"
                      >
                        {format(price)}個
                        <br />
                        {count > 1 ? `${count}${b.counter}購入` : '購入'}
                      </button>
                    </li>
                  );
                })}
              </ul>
              </>
            )}

            {tab === 'upgrades' && (
              <>
                <p className="mb-3 text-sm text-stone-600">{state.upgrades.length}個 購入済み</p>
              {upgrades.length === 0 ? (
                <p className="text-sm text-stone-600">餃子を焼いたり設備を増やすと強化が出てきます。</p>
              ) : (
                <div>
                  <ul className="flex flex-wrap gap-1.5" onMouseLeave={() => setFocusedUpgrade(null)}>
                    {upgrades.map((u) => (
                      <li key={u.id}>
                        <button
                          type="button"
                          aria-label={`${u.name}：${u.description}（${format(u.cost)}個）`}
                          aria-disabled={state.gyoza < u.cost}
                          onClick={() => onBuyUpgrade(u.id)}
                          onMouseEnter={() => setFocusedUpgrade(u.id)}
                          onFocus={() => setFocusedUpgrade(u.id)}
                          className={`block cursor-pointer rounded-lg border-2 bg-white p-1 shadow-sm ${
                            state.gyoza >= u.cost
                              ? 'border-amber-500 hover:bg-amber-100'
                              : 'border-stone-300 opacity-50'
                          } ${shownUpgrade?.id === u.id ? 'ring-2 ring-amber-700' : ''}`}
                        >
                          <img src={upgradeIcon(u)} alt="" className="size-10" />
                        </button>
                      </li>
                    ))}
                  </ul>
                  {/* Fixed height so hovering a different upgrade never shifts the page. */}
                  {shownUpgrade && (
                    <div className="mt-2 h-10 text-sm leading-5">
                      <p className="flex gap-2">
                        <span className="truncate font-bold">{shownUpgrade.name}</span>
                        <span
                          className={`ml-auto shrink-0 font-bold tabular-nums ${state.gyoza >= shownUpgrade.cost ? 'text-amber-700' : 'text-stone-500'}`}
                        >
                          {format(shownUpgrade.cost)}個
                        </span>
                      </p>
                      <p className="truncate text-stone-600">{shownUpgrade.description}</p>
                    </div>
                  )}
                </div>
              )}
              </>
            )}

            {tab === 'achievements' && (
              <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {ACHIEVEMENTS.map((a) =>
                  earned.has(a.id) ? (
                    <li key={a.id} title={a.description} className="flex flex-col items-center gap-1 text-center">
                      <img src={`/gyoza/${a.icon}.webp`} alt="" className="size-16" />
                      <span className="text-xs font-bold leading-tight">{a.name}</span>
                      <span className="sr-only">{a.description}</span>
                    </li>
                  ) : (
                    <li key={a.id} className="flex flex-col items-center gap-1 text-center">
                      <span className="grid size-16 place-items-center rounded-xl bg-stone-700 text-[1.75rem] font-bold text-stone-300">
                        ?
                      </span>
                      <span className="text-xs text-stone-500">？？？</span>
                    </li>
                  ),
                )}
              </ul>
            )}

            {tab === 'more' && (
              <MorePanel
                state={state}
                earnedCount={earned.size}
                onReplace={onReplace}
                settings={settings}
                onSettings={changeSettings}
              />
            )}
          </div>
        </section>
      </div>

      {golden && (
        <button
          key={golden.id}
          type="button"
          aria-label="金の餃子をつかまえる"
          onClick={onGolden}
          className="gyoza-golden fixed z-10 cursor-pointer"
          style={{ left: `${golden.x}%`, top: `${golden.y}%` }}
        >
          <img
            src="/gyoza/golden.webp"
            alt=""
            draggable={false}
            className="size-20 select-none drop-shadow-[0_0_12px_rgb(253_224_71)] md:size-24"
          />
        </button>
      )}

      <div aria-live="polite" className="fixed inset-x-0 bottom-4 flex flex-col items-center gap-2 px-4">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="gyoza-toast flex items-center gap-3 rounded-xl bg-stone-900/90 px-5 py-3 text-white shadow-xl"
          >
            <img src={t.image} alt="" className="size-12 shrink-0" />
            <div>
              <p className="font-bold">{t.title}</p>
              <p className="text-sm text-stone-300">{t.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function upgradeIcon(u: Upgrade): string {
  return `/gyoza/${u.icon}.webp`;
}

function formatDuration(ms: number): string {
  const minutes = Math.floor(ms / 60_000);
  const days = Math.floor(minutes / 1440);
  const hours = Math.floor((minutes % 1440) / 60);
  if (days > 0) return `${days}日${hours}時間`;
  if (hours > 0) return `${hours}時間${minutes % 60}分`;
  return `${minutes}分`;
}

function MorePanel({
  state,
  earnedCount,
  onReplace,
  settings,
  onSettings,
}: {
  state: GameState;
  earnedCount: number;
  onReplace: (next: GameState) => void;
  settings: Settings;
  onSettings: (next: Settings) => void;
}) {
  const [exported, setExported] = useState('');
  const [importText, setImportText] = useState('');
  const [message, setMessage] = useState('');

  const stats: [string, string][] = [
    ['手持ちの餃子', `${format(state.gyoza)}個`],
    ['これまでに焼いた餃子', `${format(state.baked)}個`],
    ['手で焼いた餃子', `${format(state.handBaked)}個`],
    ['お皿をクリックした回数', `${format(state.clicks)}回`],
    ['毎秒の生産', `${formatRate(currentPerSecond(state, state.at))}個`],
    ['1クリックで焼ける数', `${format(perClick(state))}個`],
    ['設備の合計', `${format(BUILDINGS.reduce((sum, b) => sum + state.owned[b.id], 0))}`],
    ['買った強化', `${state.upgrades.length}個`],
    ['実績', `${earnedCount} / ${ACHIEVEMENTS.length}`],
    ['金の餃子をつかまえた回数', `${state.goldenClicks}回`],
    ['遊びはじめてから', formatDuration(state.at - state.startedAt)],
    ['のれん分けした回数', `${state.rebirths}回`],
    ['すべての店で焼いた餃子', `${format(state.lifetimeBaked + state.baked)}個`],
  ];

  const onExport = async () => {
    const text = exportSave(state);
    setExported(text);
    try {
      await navigator.clipboard.writeText(text);
      setMessage('セーブをコピーしました。メモ帳などに貼って保存してください。');
    } catch {
      setMessage('下の欄のテキストを選んでコピーしてください。');
    }
  };

  const onImport = () => {
    const next = importSave(importText, Date.now());
    if (!next) {
      setMessage('読み込めませんでした。「GYOZA1:」で始まるテキストを貼ってください。');
      return;
    }
    if (!window.confirm('今の餃子屋を、貼ったセーブで上書きします。よろしいですか？')) return;
    onReplace(next);
    setImportText('');
    setMessage('セーブを読み込みました。');
  };

  const pending = pendingRecipes(state);

  const onRebirth = () => {
    if (
      !window.confirm(
        `のれん分けして新しい店を始めます。餃子・設備・強化は最初からになり、秘伝のレシピが${pending}個増えます。`,
      )
    )
      return;
    const next = rebirth(state, Date.now());
    if (!next) return;
    onReplace(next);
    setMessage('');
  };

  const onReset = () => {
    if (!window.confirm('最初からやり直します。餃子も設備も強化も実績もすべて消えます。')) return;
    if (!window.confirm('本当にリセットしますか？ 元に戻せません。')) return;
    onReplace(initialState(Date.now()));
    setExported('');
    setMessage('リセットしました。また1個目から焼きましょう！');
  };

  return (
    <div className="flex flex-col gap-6 text-sm">
      <section>
        <h3 className="mb-2 font-bold">統計</h3>
        <dl className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-1.5 rounded-xl bg-white p-3 shadow-sm">
          {stats.map(([label, value]) => (
            <div key={label} className="contents">
              <dt className="text-stone-600">{label}</dt>
              <dd className="text-right font-bold tabular-nums">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="font-bold">設定</h3>
        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={settings.sound}
            onChange={(e) => {
              onSettings({ ...settings, sound: e.target.checked });
              if (e.target.checked) playSound('bake');
            }}
            className="size-4 accent-amber-600"
          />
          効果音（焼く音・購入・金の餃子・実績）
        </label>
        <fieldset className="flex flex-wrap items-center gap-1.5">
          <legend className="mb-1.5">お店の時間帯</legend>
          {(
            [
              ['auto', '時計に合わせる'],
              ['day', '昼'],
              ['night', '夜'],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              aria-pressed={settings.scene === value}
              onClick={() => onSettings({ ...settings, scene: value })}
              className="cursor-pointer rounded-md border border-amber-700/40 px-2.5 py-1 font-bold aria-pressed:bg-amber-700 aria-pressed:text-white"
            >
              {label}
            </button>
          ))}
        </fieldset>
      </section>

      <section className="flex flex-col gap-2">
        <h3 className="font-bold">のれん分け</h3>
        <p className="text-stone-600">
          お店を弟子にゆずって、新しいお店を一から始めます。それまでに焼いた餃子の数に応じて「秘伝のレシピ」がもらえ、1つにつき生産とクリックがずっと+1%されます。実績もそのまま残ります。
        </p>
        <div className="flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm">
          <img src="/gyoza/bonus-crown.webp" alt="" className="size-12 shrink-0" />
          <div className="min-w-0 flex-1">
            <p>
              秘伝のレシピ <span className="font-bold tabular-nums">{format(state.recipes)}個</span>
              <span className="ml-1 text-stone-600">（+{format(state.recipes)}%）</span>
            </p>
            <p>
              のれん分けでもらえる <span className="font-bold text-amber-700 tabular-nums">+{format(pending)}個</span>
            </p>
            <p className="text-xs text-stone-600">
              次のレシピまで あと{format(nextRecipeAt(state) - state.lifetimeBaked - state.baked)}個
            </p>
          </div>
        </div>
        <div>
          <button
            type="button"
            disabled={pending < 1}
            onClick={onRebirth}
            className="cursor-pointer rounded-lg bg-red-600 px-3 py-2 font-bold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-stone-300 disabled:text-stone-500"
          >
            のれん分けする
          </button>
        </div>
      </section>

      <section className="flex flex-col gap-2">
        <h3 className="font-bold">セーブ</h3>
        <p className="text-stone-600">
          セーブはこのブラウザの中だけにあります。別の端末で続けるときや、念のための控えに使ってください。
        </p>
        <div>
          <button
            type="button"
            onClick={onExport}
            className="cursor-pointer rounded-lg bg-amber-600 px-3 py-2 font-bold text-white hover:bg-amber-700"
          >
            書き出してコピー
          </button>
        </div>
        {exported && (
          <textarea
            readOnly
            value={exported}
            rows={3}
            aria-label="書き出したセーブ"
            onFocus={(e) => e.currentTarget.select()}
            className="w-full rounded-md border border-amber-700/40 bg-white p-2 font-mono text-xs break-all"
          />
        )}
        <label className="mt-2 flex flex-col gap-1">
          <span className="font-bold">読み込み</span>
          <textarea
            value={importText}
            rows={3}
            placeholder="GYOZA1:..."
            onChange={(e) => setImportText(e.target.value)}
            className="w-full rounded-md border border-amber-700/40 bg-white p-2 font-mono text-xs"
          />
        </label>
        <div>
          <button
            type="button"
            disabled={!importText.trim()}
            onClick={onImport}
            className="cursor-pointer rounded-lg bg-amber-600 px-3 py-2 font-bold text-white hover:bg-amber-700 disabled:cursor-not-allowed disabled:bg-stone-300 disabled:text-stone-500"
          >
            読み込む
          </button>
        </div>
        <p role="status" className="min-h-5 text-amber-800">
          {message}
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h3 className="font-bold">リセット</h3>
        <p className="text-stone-600">すべて消して最初からやり直します。先にセーブを書き出しておくと安心です。</p>
        <div>
          <button
            type="button"
            onClick={onReset}
            className="cursor-pointer rounded-lg border-2 border-red-700 px-3 py-2 font-bold text-red-700 hover:bg-red-50"
          >
            リセットする
          </button>
        </div>
      </section>
    </div>
  );
}
