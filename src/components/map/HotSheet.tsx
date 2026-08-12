// ─── 핫플 랭킹 하단 시트 (기획 §3.1 산식) ─────────────────────────
// 최근 7일 가중합 + 시간 감쇠. 접힌 상태 = 필 버튼, 펼치면 랭킹 피드.
// 체크인/리뷰/저장 직후 점수·순위가 실시간 반영된다.

import { useMemo } from 'react';
import { computeHotRanking } from '../../lib/ranking';
import { useVisitStore } from '../../store/useVisitStore';
import { useUiStore } from '../../store/useUiStore';
import { useVirtualClock, virtualDayIndex } from '../../mock/clock';
import { CATEGORY_COLORS } from '../../assets/buildings';
import { CategoryGlyph } from '../../assets/misc';

const MEDALS = ['🥇', '🥈', '🥉'];

export function HotSheet({ onPick }: { onPick: (storeId: number) => void }) {
  const open = useUiStore((s) => s.hotSheetOpen);
  const setOpen = useUiStore((s) => s.setHotSheetOpen);
  const events = useVisitStore((s) => s.events);
  const dayOffset = useVirtualClock((s) => s.dayOffset);

  const ranking = useMemo(
    () => computeHotRanking(events, dayOffset, virtualDayIndex(dayOffset)),
    [events, dayOffset],
  );

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="absolute bottom-24 left-4 z-[500] flex items-center gap-1.5 rounded-full bg-town-paper px-4 py-2.5 text-[13px] font-extrabold shadow-card border border-town-line"
      >
        🔥 핫플 랭킹
        <span className="rounded-full bg-town-coral px-1.5 py-0.5 text-[9.5px] font-extrabold text-white">
          LIVE
        </span>
      </button>
    );
  }

  return (
    <div className="pointer-events-none absolute inset-0 z-[540] flex flex-col justify-end px-2 pb-20">
      <div className="sheet-up pointer-events-auto max-h-[54%] overflow-hidden rounded-[1.6rem] border border-town-line bg-town-paper shadow-sheet">
        <div className="flex items-center justify-between px-5 pb-2 pt-4">
          <div>
            <h3 className="text-[16px] font-extrabold">🔥 지금 명동 핫플</h3>
            <p className="text-[10.5px] font-bold text-town-inkSoft">
              최근 7일 방문 데이터 가중합 · 시간 감쇠 반영
            </p>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-town-cream text-[13px] font-bold text-town-inkSoft"
            aria-label="핫플 닫기"
          >
            ✕
          </button>
        </div>

        <ul className="no-scrollbar max-h-[340px] overflow-y-auto px-4 pb-5">
          {ranking.map(({ store, score, counts, minedToday }, i) => (
            <li key={store.id}>
              <button
                onClick={() => {
                  setOpen(false);
                  onPick(store.id);
                }}
                className="flex w-full items-center gap-2.5 rounded-2xl px-2 py-2.5 text-left transition hover:bg-town-cream/70"
              >
                <span className="w-7 shrink-0 text-center text-[15px] font-extrabold text-town-inkSoft">
                  {MEDALS[i] ?? i + 1}
                </span>
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                  style={{ background: CATEGORY_COLORS[store.category] }}
                >
                  <CategoryGlyph category={store.category} size={20} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1.5">
                    <b className="truncate text-[14px]">{store.name}</b>
                    {minedToday && (
                      <span className="shrink-0 rounded-full bg-town-sun px-1.5 py-0.5 text-[9px] font-extrabold text-town-bark">
                        +오늘 내 방문
                      </span>
                    )}
                  </span>
                  <span className="block text-[11px] font-bold text-town-inkSoft">
                    리뷰 {counts.reviews} · 체크인 {counts.checkins} · 저장 {counts.saves}
                  </span>
                </span>
                <span className="shrink-0 rounded-full bg-town-coral/10 px-2 py-1 text-[12px] font-extrabold text-town-coralDeep">
                  🔥 {score.toFixed(1)}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
