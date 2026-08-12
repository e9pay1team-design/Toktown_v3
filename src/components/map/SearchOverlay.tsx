// ─── 검색 (기획 §6 화면 2·3) ──────────────────────────────────────
// 입력창 + 자동완성 + 최근 검색 + 카테고리 바로가기.
// 결과는 현재 위치 기준 거리순 정렬, 탭하면 지도 포커스 + 상세.

import { useMemo, useState } from 'react';
import type { StoreCategory } from '../../types';
import { STORES } from '../../data/seed';
import { CATEGORY_COLORS } from '../../assets/buildings';
import { CategoryGlyph, BenefitIcon } from '../../assets/misc';
import { MagpieSvg } from '../../assets/npcs';
import { useSearchHistory, useUiStore } from '../../store/useUiStore';
import { distanceM, formatDistance, useVirtualLocation } from '../../mock/location';

const QUICK_CATEGORIES: StoreCategory[] = ['국밥', '한식', '면', '카페', '공연장'];

export function SearchOverlay({ onPick }: { onPick: (storeId: number) => void }) {
  const setSearchOpen = useUiStore((s) => s.setSearchOpen);
  const { recent, push, clear } = useSearchHistory();
  const position = useVirtualLocation((s) => s.position);
  const [query, setQuery] = useState('');

  const q = query.trim().toLowerCase();

  const results = useMemo(() => {
    if (!q) return [];
    return STORES.filter((s) =>
      [s.name, s.category, s.subCategory ?? '', ...s.tags].some((t) =>
        t.toLowerCase().includes(q),
      ),
    )
      .map((s) => ({ store: s, dist: distanceM(position, s) }))
      .sort((a, b) => a.dist - b.dist);
  }, [q, position]);

  const pick = (storeId: number, label: string) => {
    push(label);
    setSearchOpen(false);
    onPick(storeId);
  };

  return (
    <div className="absolute inset-0 z-[580] flex flex-col bg-town-cream">
      {/* 헤더 */}
      <header className="flex items-center gap-2 px-4 pb-3 pt-11">
        <button
          onClick={() => setSearchOpen(false)}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-town-line bg-town-paper shadow-card"
          aria-label="뒤로"
        >
          <svg width={18} height={18} viewBox="0 0 24 24" aria-hidden>
            <path d="M15 4 L7 12 L15 20" stroke="#4A3B32" strokeWidth={2.8} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div className="flex flex-1 items-center gap-2 rounded-xl border-2 border-town-leaf bg-town-paper px-3.5 py-2.5">
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="매장, 음식, 장소 검색"
            className="w-full bg-transparent text-[15px] font-bold outline-none placeholder:font-medium placeholder:text-town-inkSoft/50"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="shrink-0 rounded-full bg-town-line px-1.5 text-[11px] font-bold text-town-inkSoft"
              aria-label="지우기"
            >
              ✕
            </button>
          )}
        </div>
      </header>

      <div className="no-scrollbar flex-1 overflow-y-auto px-4 pb-8">
        {!q && (
          <>
            {/* 최근 검색 */}
            {recent.length > 0 && (
              <section className="mb-5">
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-[13px] font-extrabold text-town-inkSoft">최근 검색</h3>
                  <button onClick={clear} className="text-[11.5px] font-bold text-town-inkSoft/60">
                    전체 삭제
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recent.map((r) => (
                    <button
                      key={r}
                      onClick={() => setQuery(r)}
                      className="rounded-full border border-town-line bg-town-paper px-3 py-1.5 text-[12.5px] font-bold text-town-ink shadow-sm"
                    >
                      🕘 {r}
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* 카테고리 바로가기 */}
            <section>
              <h3 className="mb-2 text-[13px] font-extrabold text-town-inkSoft">카테고리 바로가기</h3>
              <div className="grid grid-cols-5 gap-2">
                {QUICK_CATEGORIES.map((c) => (
                  <button
                    key={c}
                    onClick={() => setQuery(c)}
                    className="flex flex-col items-center gap-1.5 rounded-2xl border border-town-line bg-town-paper py-3 shadow-sm"
                  >
                    <span
                      className="flex h-9 w-9 items-center justify-center rounded-xl"
                      style={{ background: CATEGORY_COLORS[c] }}
                    >
                      <CategoryGlyph category={c} size={20} />
                    </span>
                    <span className="text-[11px] font-bold">{c}</span>
                  </button>
                ))}
              </div>
            </section>

            <p className="mt-8 text-center text-[12px] leading-relaxed text-town-inkSoft/70">
              명동 도보권의 로컬 매장 {STORES.length}곳이 준비되어 있어요.
              <br />
              <b>미성옥</b>을 검색해 보세요!
            </p>
          </>
        )}

        {q && results.length > 0 && (
          <ul className="flex flex-col gap-2">
            {results.map(({ store, dist }) => (
              <li key={store.id}>
                <button
                  onClick={() => pick(store.id, store.name)}
                  className="flex w-full items-center gap-3 rounded-2xl border border-town-line bg-town-paper p-3 text-left shadow-sm"
                >
                  <span
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                    style={{ background: CATEGORY_COLORS[store.category] }}
                  >
                    <CategoryGlyph category={store.category} size={22} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1.5">
                      <b className="truncate text-[15px]">{store.name}</b>
                      {store.founded && (
                        <span className="shrink-0 rounded bg-town-sun/40 px-1 py-0.5 text-[9.5px] font-extrabold text-town-bark">
                          since {store.founded}
                        </span>
                      )}
                    </span>
                    <span className="mt-0.5 block truncate text-[12px] text-town-inkSoft">
                      {store.category}
                      {store.subCategory ? ` · ${store.subCategory}` : ''} · {formatDistance(dist)}
                    </span>
                    {store.benefit && (
                      <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-[#EAF4F8] px-2 py-0.5 text-[10.5px] font-bold text-town-skyDeep">
                        <BenefitIcon size={12} /> {store.benefit}
                      </span>
                    )}
                  </span>
                  <svg width={16} height={16} viewBox="0 0 24 24" className="shrink-0" aria-hidden>
                    <path d="M9 4 L17 12 L9 20" stroke="#B4A99A" strokeWidth={2.6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        )}

        {q && results.length === 0 && (
          <div className="flex flex-col items-center gap-3 pt-14 text-center">
            <MagpieSvg size={110} />
            <p className="text-[14px] font-bold">앗, 까미도 못 찾는 곳이에요</p>
            <p className="text-[12.5px] text-town-inkSoft">
              다른 키워드로 검색해 보세요. 예) 국밥, 카페, 노포
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
