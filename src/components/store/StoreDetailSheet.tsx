// ─── 매장 상세 (기획 §6 화면 4) ───────────────────────────────────
// 바텀 시트: 건물 일러스트, 이름/카테고리/영업시간, 톡페이 혜택 뱃지,
// 버튼(저장/길찾기/결제), 리뷰(장소 귀속, 인증 뱃지).
// 길찾기·결제 플로우와 리뷰 작성은 M2, 번역 보기는 M3에서 활성화.

import { useMemo } from 'react';
import { reviewsByStore, storeById } from '../../data/seed';
import { StoreBuilding, CATEGORY_COLORS } from '../../assets/buildings';
import { BenefitIcon, CertifiedBadge } from '../../assets/misc';
import { useSavedStore } from '../../store/useSavedStore';
import { useToastStore } from '../../store/useToastStore';
import { distanceM, formatDistance, useVirtualLocation } from '../../mock/location';

function Stars({ n }: { n: number }) {
  return (
    <span className="text-[11px] tracking-tight text-town-sunDeep" aria-label={`별점 ${n}점`}>
      {'★'.repeat(n)}
      <span className="text-town-line">{'★'.repeat(5 - n)}</span>
    </span>
  );
}

export function StoreDetailSheet({ storeId, onClose }: { storeId: number; onClose: () => void }) {
  const store = storeById(storeId);
  const reviews = useMemo(() => reviewsByStore(storeId), [storeId]);
  const savedIds = useSavedStore((s) => s.savedIds);
  const toggleSaved = useSavedStore((s) => s.toggle);
  const toast = useToastStore((s) => s.show);
  const position = useVirtualLocation((s) => s.position);

  if (!store) return null;
  const saved = savedIds.includes(store.id);
  const avg = reviews.length
    ? Math.round((reviews.reduce((a, r) => a + r.rating, 0) / reviews.length) * 10) / 10
    : 0;
  const dist = formatDistance(distanceM(position, store));

  return (
    <div className="absolute inset-x-0 bottom-0 z-[560] px-2 pb-2">
      <div className="sheet-up flex max-h-[62%] min-h-[300px] flex-col overflow-hidden rounded-[1.6rem] border border-town-line bg-town-paper shadow-sheet"
        style={{ maxHeight: '520px' }}
      >
        {/* 그랩바 + 닫기 */}
        <div className="relative flex items-center justify-center pb-1 pt-2.5">
          <div className="h-1.5 w-10 rounded-full bg-town-line" />
          <button
            onClick={onClose}
            className="absolute right-3 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-town-cream text-[13px] font-bold text-town-inkSoft"
            aria-label="닫기"
          >
            ✕
          </button>
        </div>

        <div className="no-scrollbar flex-1 overflow-y-auto px-5 pb-5">
          {/* 히어로: 건물 일러스트 */}
          <div
            className="relative mt-1 flex items-end justify-center rounded-2xl pb-0 pt-3"
            style={{ background: `${CATEGORY_COLORS[store.category]}22` }}
          >
            <StoreBuilding category={store.category} label={store.name} size={150} />
            {store.benefit && (
              <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-town-paper px-2.5 py-1 text-[11px] font-extrabold text-town-skyDeep shadow-card">
                <BenefitIcon size={13} /> 톡페이 {store.benefit}
              </span>
            )}
            {store.founded && (
              <span className="absolute right-3 top-3 rounded-full bg-town-sun px-2.5 py-1 text-[10.5px] font-extrabold text-town-bark shadow-card">
                since {store.founded}
              </span>
            )}
          </div>

          {/* 기본 정보 */}
          <div className="mt-3.5">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h2 className="text-[21px] font-extrabold leading-tight">{store.name}</h2>
                <p className="mt-0.5 text-[12.5px] font-bold text-town-inkSoft">
                  {store.category}
                  {store.subCategory ? ` · ${store.subCategory}` : ''} · {dist}
                </p>
              </div>
              <div className="shrink-0 rounded-xl bg-town-cream px-2.5 py-1.5 text-center">
                <p className="text-[15px] font-extrabold leading-none text-town-sunDeep">★ {avg}</p>
                <p className="mt-0.5 text-[9.5px] font-bold text-town-inkSoft">리뷰 {reviews.length}</p>
              </div>
            </div>

            <p className="mt-2 text-[13px] leading-relaxed text-town-ink/90">{store.desc}</p>

            <div className="mt-2 flex flex-wrap gap-1.5">
              {store.tags.map((t) => (
                <span key={t} className="rounded-full bg-town-cream px-2 py-0.5 text-[10.5px] font-bold text-town-inkSoft">
                  #{t}
                </span>
              ))}
            </div>

            <div className="mt-3 flex items-center gap-2 rounded-xl bg-town-cream px-3 py-2.5 text-[12.5px] font-bold text-town-ink">
              <span aria-hidden>🕐</span> {store.hours}
            </div>
          </div>

          {/* 액션: 저장 / 길찾기 / 결제 */}
          <div className="mt-3.5 grid grid-cols-3 gap-2">
            <button
              onClick={() => {
                toggleSaved(store.id);
                toast(saved ? '저장을 해제했어요' : '내 장소에 저장했어요!', 'success');
              }}
              aria-label="매장 저장 토글"
              className={`flex flex-col items-center gap-1 rounded-2xl border py-3 text-[12px] font-extrabold transition active:scale-95 ${
                saved
                  ? 'border-town-coral bg-town-coral/10 text-town-coralDeep'
                  : 'border-town-line bg-town-paper text-town-ink'
              }`}
            >
              <span className="text-[17px]">{saved ? '❤️' : '🤍'}</span>
              {saved ? '저장됨' : '저장'}
            </button>
            <button
              onClick={() => toast('길찾기·이동 연출은 M2에서 열려요! 🚌', 'info')}
              className="flex flex-col items-center gap-1 rounded-2xl border border-town-line bg-town-paper py-3 text-[12px] font-extrabold text-town-ink transition active:scale-95"
            >
              <span className="text-[17px]">🧭</span> 길찾기
            </button>
            <button
              onClick={() => toast('톡페이 결제 시뮬레이션은 M2에서 열려요! 💳', 'info')}
              className="flex flex-col items-center gap-1 rounded-2xl border border-town-line bg-town-paper py-3 text-[12px] font-extrabold text-town-ink transition active:scale-95"
            >
              <span className="text-[17px]">💳</span> 결제
            </button>
          </div>

          {/* 리뷰 (장소 귀속) */}
          <section className="mt-5">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-[14px] font-extrabold">
                주민 리뷰 <span className="text-town-leafDark">{reviews.length}</span>
              </h3>
              <span className="rounded-full bg-town-cream px-2 py-1 text-[10px] font-bold text-town-inkSoft">
                리뷰 작성은 M2에서
              </span>
            </div>
            <ul className="flex flex-col gap-2.5">
              {reviews.map((r) => (
                <li key={r.id} className="rounded-2xl border border-town-line bg-town-cream/60 p-3">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-[12.5px] font-extrabold">
                      <span aria-hidden>{r.flag}</span> {r.author}
                      {r.certified && (
                        <span className="flex items-center gap-0.5 rounded-full bg-town-leaf/15 px-1.5 py-0.5 text-[9.5px] font-extrabold text-town-leafDark">
                          <CertifiedBadge size={11} /> 방문 인증
                        </span>
                      )}
                    </span>
                    <span className="text-[10px] font-bold text-town-inkSoft/70">{r.date}</span>
                  </div>
                  <div className="mt-1">
                    <Stars n={r.rating} />
                  </div>
                  <p className="mt-1 text-[12.5px] leading-relaxed text-town-ink/90">{r.text}</p>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
