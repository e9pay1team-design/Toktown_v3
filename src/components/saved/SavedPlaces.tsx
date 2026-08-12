// ─── 저장 장소 (기획 §6 화면 7) ───────────────────────────────────
// 저장 목록 + 지도에서 보기 + 저장 해제. (커뮤니티 공유는 M3)

import { STORES } from '../../data/seed';
import { CATEGORY_COLORS } from '../../assets/buildings';
import { BenefitIcon, CategoryGlyph } from '../../assets/misc';
import { useSavedStore } from '../../store/useSavedStore';
import { useToastStore } from '../../store/useToastStore';
import { useUiStore } from '../../store/useUiStore';

export function SavedPlaces({ onPick }: { onPick: (storeId: number) => void }) {
  const setSavedListOpen = useUiStore((s) => s.setSavedListOpen);
  const savedIds = useSavedStore((s) => s.savedIds);
  const toggle = useSavedStore((s) => s.toggle);
  const toast = useToastStore((s) => s.show);

  const savedStores = savedIds
    .map((id) => STORES.find((s) => s.id === id))
    .filter((s): s is (typeof STORES)[number] => Boolean(s));

  return (
    <div className="absolute inset-0 z-[590] flex flex-col bg-town-cream">
      <header className="flex items-center gap-2 px-4 pb-3 pt-11">
        <button
          onClick={() => setSavedListOpen(false)}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-town-line bg-town-paper shadow-card"
          aria-label="뒤로"
        >
          <svg width={18} height={18} viewBox="0 0 24 24" aria-hidden>
            <path d="M15 4 L7 12 L15 20" stroke="#4A3B32" strokeWidth={2.8} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div>
          <h2 className="text-[18px] font-extrabold leading-tight">저장한 장소</h2>
          <p className="text-[11.5px] font-bold text-town-inkSoft">
            ❤️ {savedStores.length}곳 · 기본 폴더
          </p>
        </div>
      </header>

      <div className="no-scrollbar flex-1 overflow-y-auto px-4 pb-8">
        {savedStores.length === 0 ? (
          <div className="flex flex-col items-center gap-3 pt-16 text-center">
            <span className="text-[44px]">🤍</span>
            <p className="text-[14.5px] font-extrabold">아직 저장한 장소가 없어요</p>
            <p className="text-[12.5px] leading-relaxed text-town-inkSoft">
              지도에서 마음에 드는 매장을 찾아
              <br />
              하트를 눌러 저장해 보세요!
            </p>
          </div>
        ) : (
          <ul className="flex flex-col gap-2">
            {savedStores.map((store) => (
              <li
                key={store.id}
                className="flex items-center gap-3 rounded-2xl border border-town-line bg-town-paper p-3 shadow-sm"
              >
                <span
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                  style={{ background: CATEGORY_COLORS[store.category] }}
                >
                  <CategoryGlyph category={store.category} size={22} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14.5px] font-extrabold">{store.name}</p>
                  <p className="truncate text-[11.5px] font-bold text-town-inkSoft">
                    {store.category}
                    {store.subCategory ? ` · ${store.subCategory}` : ''}
                  </p>
                  {store.benefit && (
                    <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-[#EAF4F8] px-2 py-0.5 text-[10px] font-bold text-town-skyDeep">
                      <BenefitIcon size={11} /> {store.benefit}
                    </span>
                  )}
                </div>
                <div className="flex shrink-0 flex-col gap-1.5">
                  <button
                    onClick={() => {
                      setSavedListOpen(false);
                      onPick(store.id);
                    }}
                    className="rounded-lg bg-town-leafDark px-2.5 py-1.5 text-[11px] font-extrabold text-white"
                  >
                    지도에서 보기
                  </button>
                  <button
                    onClick={() => {
                      toggle(store.id);
                      toast('저장을 해제했어요', 'info');
                    }}
                    className="rounded-lg border border-town-line bg-town-paper px-2.5 py-1.5 text-[11px] font-bold text-town-inkSoft"
                  >
                    저장 해제
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
