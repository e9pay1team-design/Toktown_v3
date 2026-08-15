// ─── Tokken 상점 (상점주인 달수) ──────────────────────────────────
// 꾸미기 소품 구매 = Tokken 소비처(기획 §4). 이벤트 한정 소품은
// Event Map 활성 중에만 판매.

import { DECOR_ITEMS, TOWN_EVENTS } from '../../data/seed';
import { useEconomyStore } from '../../store/useEconomyStore';
import { useVillageStore } from '../../store/useVillageStore';
import { useEventStore } from '../../store/useEventStore';
import { useToastStore } from '../../store/useToastStore';
import { OtterSvg } from '../../assets/npcs';
import { TokkenCoin } from '../../assets/misc';
import { DecorSvg } from '../../assets/decor';

export function ShopModal({ onClose }: { onClose: () => void }) {
  const tokken = useEconomyStore((s) => s.tokken);
  const spendTokken = useEconomyStore((s) => s.spendTokken);
  const buyDecor = useVillageStore((s) => s.buyDecor);
  const activeEventId = useEventStore((s) => s.activeEventId);
  const toast = useToastStore((s) => s.show);

  const buy = (id: string, name: string, price: number) => {
    if (!spendTokken(price)) {
      toast('톡큰이 부족해요! 체크인·리뷰·결제로 모아보세요', 'error');
      return;
    }
    buyDecor(id);
    toast(`${name} 구매 완료! 보관함에서 배치하세요`, 'tokken');
  };

  return (
    <div className="absolute inset-0 z-[860] flex flex-col justify-end bg-town-ink/40 pb-16 fade-in">
      <div className="sheet-up mx-2 mb-1 max-h-[78%] overflow-hidden rounded-[1.6rem] bg-town-paper shadow-sheet">
        <div className="flex items-center gap-3 border-b border-town-line px-5 pb-3 pt-4">
          <OtterSvg size={54} />
          <div className="min-w-0 flex-1">
            <h3 className="text-[16px] font-extrabold">달수 상점</h3>
            <p className="text-[11px] font-bold text-town-inkSoft">
              "톡큰만 있으면 뭐든 있죠~ 오늘의 신상 구경하고 가세요!"
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-town-cream text-[13px] font-bold text-town-inkSoft"
            aria-label="상점 닫기"
          >
            ✕
          </button>
        </div>

        <div className="flex items-center justify-between bg-town-cream/70 px-5 py-2">
          <span className="text-[11.5px] font-extrabold text-town-inkSoft">내 톡큰</span>
          <span className="flex items-center gap-1.5 text-[15px] font-extrabold">
            <TokkenCoin size={18} /> {tokken.toLocaleString()}
          </span>
        </div>

        <div className="no-scrollbar grid max-h-[420px] grid-cols-2 gap-2.5 overflow-y-auto p-4 pb-8">
          {DECOR_ITEMS.filter((item) => !item.shopHidden).map((item) => {
            const eventLocked = Boolean(item.eventOnly) && activeEventId !== item.eventOnly;
            const eventTitle = TOWN_EVENTS.find((e) => e.id === item.eventOnly)?.title;
            const affordable = tokken >= item.price;
            return (
              <div
                key={item.id}
                className={`rounded-2xl border p-3 ${
                  item.eventOnly
                    ? 'border-town-lilac bg-town-lilac/10'
                    : 'border-town-line bg-town-cream/50'
                }`}
              >
                <div className={`flex h-16 items-end justify-center ${eventLocked ? 'opacity-40 grayscale' : ''}`}>
                  <DecorSvg id={item.id} size={46} />
                </div>
                <p className="mt-1.5 truncate text-center text-[12.5px] font-extrabold">{item.name}</p>
                {item.eventOnly && (
                  <p className="text-center text-[9px] font-extrabold text-[#8B79C9]">
                    🎪 {eventTitle} 한정
                  </p>
                )}
                <button
                  onClick={() => buy(item.id, item.name, item.price)}
                  disabled={eventLocked || !affordable}
                  aria-label={`${item.name} 구매`}
                  className={`mt-2 flex w-full items-center justify-center gap-1 rounded-xl py-2 text-[12px] font-extrabold transition active:scale-95 ${
                    eventLocked
                      ? 'bg-town-line text-town-inkSoft/60'
                      : affordable
                        ? 'bg-town-leafDark text-white shadow-pop active:translate-y-[1px] active:shadow-none'
                        : 'bg-town-line text-town-inkSoft/60'
                  }`}
                >
                  {eventLocked ? (
                    '이벤트 중에만 판매'
                  ) : (
                    <>
                      <TokkenCoin size={14} /> {item.price}
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
