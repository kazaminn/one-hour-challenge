'use client';

import { useEffect, useRef, useState, type MouseEvent } from 'react';
import {
  ACHIEVEMENTS,
  BUILDINGS,
  affordableCount,
  bonus,
  buy,
  click,
  costOf,
  earnedAchievements,
  formatJa,
  initialState,
  load,
  nextBonusStep,
  perSecond,
  tick,
  unitPerSecond,
  visibility,
  type BuildingId,
  type GameState,
} from './game';

const STORAGE_KEY = 'gyoza-clicker:v1';
const SAVE_EVERY_MS = 5_000;

const format = formatJa;
const formatRate = (n: number) =>
  n >= 1e4 ? formatJa(n) : n.toLocaleString('ja-JP', { maximumFractionDigits: n < 10 ? 1 : 0 });

/** How many to buy per press; 'max' buys as many as the gyoza on hand allow. */
type Amount = number | 'max';
const AMOUNT_PRESETS: Amount[] = [1, 10, 50, 100, 'max'];

type Floater = { id: number; x: number; y: number };
type Toast = { id: number; name: string; description: string };

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
    const added = fresh.map((a) => ({ id: nextId.current++, name: a.name, description: a.description }));
    setToasts((t) => [...t, ...added]);
    setTimeout(() => {
      const gone = new Set(added.map((t) => t.id));
      setToasts((t) => t.filter((x) => !gone.has(x.id)));
    }, 3_500);
  });

  useEffect(() => {
    let saved: string | null = null;
    try {
      saved = localStorage.getItem(STORAGE_KEY);
    } catch {}
    // `tick` from the saved time adds what was baked while the tab was closed.
    setState(tick(load(saved, Date.now()), Date.now()));
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
    setState((s) => click(tick(s, Date.now())));
    setWobble((n) => n + 1);
    const box = e.currentTarget.getBoundingClientRect();
    // Keyboard clicks have no pointer position; float from the middle then.
    const x = e.clientX ? e.clientX - box.left : box.width / 2;
    const y = e.clientY ? e.clientY - box.top : box.height / 2;
    const id = nextId.current++;
    setFloaters((f) => [...f, { id, x, y }]);
    setTimeout(() => setFloaters((f) => f.filter((x) => x.id !== id)), 800);
  };

  const onBuy = (id: BuildingId, count: number) => {
    setState((s) => {
      const next = buy(tick(s, Date.now()), id, count);
      if (next) save(next);
      return next ?? s;
    });
  };

  const rate = perSecond(state);

  return (
    <div
      className="min-h-dvh bg-cover bg-center"
      style={{ backgroundImage: 'url(/gyoza/background-shop.webp)' }}
    >
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-6 md:grid-cols-[1fr_26rem] md:py-10">
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
            <p className="text-sm text-stone-600">毎秒 {formatRate(rate)} 個</p>
          </div>
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
                +1
              </span>
            ))}
          </button>
        </section>

        <section className="rounded-2xl bg-amber-50/95 p-4 text-stone-900 shadow-xl">
          <h2 className="mb-3 border-b-2 border-amber-800/30 pb-2 text-[1.25rem] font-bold">お店</h2>
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
                      毎秒 {formatRate(unitPerSecond(b, state.owned[b.id]))} 個・{b.flavor}
                    </p>
                    <p className="text-xs text-amber-800">
                      {bonus(state.owned[b.id]) > 1 && (
                        <span className="mr-1 rounded bg-amber-600 px-1 font-bold text-white">
                          ×{bonus(state.owned[b.id])}
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

          <h2 className="mt-6 mb-3 border-b-2 border-amber-800/30 pb-2 text-[1.25rem] font-bold">
            実績
            <span className="ml-2 text-sm font-normal text-stone-600">
              {earned.size} / {ACHIEVEMENTS.length}
            </span>
          </h2>
          <ul className="flex flex-wrap gap-2">
            {ACHIEVEMENTS.map((a) =>
              earned.has(a.id) ? (
                <li
                  key={a.id}
                  title={a.description}
                  className="rounded-full bg-amber-500 px-3 py-1 text-sm font-bold text-white"
                >
                  🏆 {a.name}
                </li>
              ) : (
                <li key={a.id} className="rounded-full bg-stone-200 px-3 py-1 text-sm text-stone-500">
                  ？？？
                </li>
              ),
            )}
          </ul>
        </section>
      </div>

      <div aria-live="polite" className="fixed inset-x-0 bottom-4 flex flex-col items-center gap-2 px-4">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="gyoza-toast rounded-xl bg-stone-900/90 px-5 py-3 text-white shadow-xl"
          >
            <p className="font-bold">🏆 実績解除：{t.name}</p>
            <p className="text-sm text-stone-300">{t.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
