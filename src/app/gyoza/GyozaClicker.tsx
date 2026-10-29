'use client';

import { useEffect, useRef, useState } from 'react';
import {
  BUILDINGS,
  buy,
  click,
  cost,
  initialState,
  load,
  perSecond,
  tick,
  visibility,
  type BuildingId,
  type GameState,
} from './game';

const STORAGE_KEY = 'gyoza-clicker:v1';
const SAVE_EVERY_MS = 5_000;

const format = (n: number) => Math.floor(n).toLocaleString('ja-JP');
const formatRate = (n: number) =>
  n.toLocaleString('ja-JP', { maximumFractionDigits: n < 10 ? 1 : 0 });

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
  const stateRef = useRef(state);
  stateRef.current = state;

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

  const onBake = () => {
    setState((s) => click(tick(s, Date.now())));
    setWobble((n) => n + 1);
  };

  const onBuy = (id: BuildingId) => {
    setState((s) => {
      const next = buy(tick(s, Date.now()), id);
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
            className="cursor-pointer transition-transform hover:scale-105 active:scale-95"
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
          </button>
        </section>

        <section className="rounded-2xl bg-amber-50/95 p-4 text-stone-900 shadow-xl">
          <h2 className="mb-3 border-b-2 border-amber-800/30 pb-2 text-[1.25rem] font-bold">お店</h2>
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
              const price = cost(b, state.owned[b.id]);
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
                      毎秒 {formatRate(b.perSecond)} 個・{b.flavor}
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={!affordable}
                    onClick={() => onBuy(b.id)}
                    className="shrink-0 cursor-pointer rounded-lg bg-amber-600 px-3 py-2 text-sm font-bold text-white tabular-nums hover:bg-amber-700 disabled:cursor-not-allowed disabled:bg-stone-300 disabled:text-stone-500"
                  >
                    {format(price)}個
                    <br />
                    購入
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </div>
  );
}
