// ─── 매장 상세 (기획 §6 화면 4) ───────────────────────────────────
// 바텀 시트: 건물 일러스트, 이름/카테고리/영업시간, 톡페이 혜택 뱃지,
// 버튼(저장/길찾기/결제) + 체크인(발도장) + 리뷰 작성/목록(인증 뱃지).
// 번역 보기·태그된 커뮤니티 글은 M3에서 활성화.

import { useMemo, useState } from 'react';
import { TOWN_EVENTS, reviewsByStore, storeById } from '../../data/seed';
import { useEventStore } from '../../store/useEventStore';
import { StoreBuilding, CATEGORY_COLORS } from '../../assets/buildings';
import { BenefitIcon, CertifiedBadge } from '../../assets/misc';
import { PawStamp } from '../../assets/journey';
import { CharacterSvg } from '../../assets/CharacterSvg';
import { useSavedStore } from '../../store/useSavedStore';
import { useToastStore } from '../../store/useToastStore';
import { useVisitStore } from '../../store/useVisitStore';
import { useProfileStore } from '../../store/useProfileStore';
import { useUiStore } from '../../store/useUiStore';
import { distanceM, formatDistance, useVirtualLocation, CHECKIN_RADIUS_M } from '../../mock/location';
import { useVirtualClock, virtualDayIndex } from '../../mock/clock';
import { today, tryCheckin, tryPayment } from '../../lib/actions';
import { ReviewComposer } from './ReviewComposer';
import { catLabel, sBenefit, sDesc, sHours, sName, sSub, sTags, tr, useLang, useT } from '../../i18n';

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
  const seedReviews = useMemo(() => reviewsByStore(storeId), [storeId]);
  const savedIds = useSavedStore((s) => s.savedIds);
  const toggleSaved = useSavedStore((s) => s.toggle);
  const toast = useToastStore((s) => s.show);
  const position = useVirtualLocation((s) => s.position);
  const dayOffset = useVirtualClock((s) => s.dayOffset);
  const myReviews = useVisitStore((s) => s.myReviews);
  const events = useVisitStore((s) => s.events);
  const recordSave = useVisitStore((s) => s.recordSave);
  const profile = useProfileStore((s) => s.profile);
  const setRouteSheetFor = useUiStore((s) => s.setRouteSheetFor);
  const activeEventId = useEventStore((s) => s.activeEventId);
  const [composing, setComposing] = useState(false);
  const T = useT();
  const lang = useLang();

  if (!store) return null;

  /* Event Map 활성 + 거점 반경 내 매장이면 한정 혜택 노출 */
  const activeEvent = TOWN_EVENTS.find((e) => e.id === activeEventId) ?? null;
  const eventVenue = activeEvent ? storeById(activeEvent.venueStoreId) : null;
  const inEventZone =
    activeEvent && eventVenue ? distanceM(store, eventVenue) <= activeEvent.radiusM : false;
  const saved = savedIds.includes(store.id);
  const myStoreReviews = myReviews.filter((r) => r.storeId === store.id);
  const reviewCount = seedReviews.length + myStoreReviews.length;
  const ratingSum =
    seedReviews.reduce((a, r) => a + r.rating, 0) + myStoreReviews.reduce((a, r) => a + r.rating, 0);
  const avg = reviewCount ? Math.round((ratingSum / reviewCount) * 10) / 10 : 0;

  const dist = distanceM(position, store);
  const within = dist <= CHECKIN_RADIUS_M;
  const day = virtualDayIndex(dayOffset);
  const checkedToday = events.some(
    (e) => e.type === 'checkin' && e.storeId === store.id && e.day === day,
  );

  return (
    <>
    <div className="pointer-events-none absolute inset-0 z-[560] flex flex-col justify-end px-2 pb-2">
      <div
        className="sheet-up pointer-events-auto flex min-h-[300px] flex-col overflow-hidden rounded-[1.6rem] border border-town-line bg-town-paper shadow-sheet"
        style={{ maxHeight: '540px' }}
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
            <StoreBuilding category={store.category} label={sName(store)} size={150} />
            {sBenefit(store) && (
              <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-town-paper px-2.5 py-1 text-[11px] font-extrabold text-town-skyDeep shadow-card">
                <BenefitIcon size={13} /> {T(`톡페이 ${store.benefit}`, `TokPay ${sBenefit(store)}`)}
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
                <h2 className="text-[21px] font-extrabold leading-tight">{sName(store)}</h2>
                <p className="mt-0.5 flex items-center gap-1.5 text-[12.5px] font-bold text-town-inkSoft">
                  {catLabel(store.category)}
                  {sSub(store) ? ` · ${sSub(store)}` : ''} · {formatDistance(dist)}
                  {within && (
                    <span className="rounded-full bg-town-leaf/15 px-1.5 py-0.5 text-[9.5px] font-extrabold text-town-leafDark">
                      {T('인증 반경 안 ✓', 'In range ✓')}
                    </span>
                  )}
                </p>
              </div>
              <div className="shrink-0 rounded-xl bg-town-cream px-2.5 py-1.5 text-center">
                <p className="text-[15px] font-extrabold leading-none text-town-sunDeep">★ {avg}</p>
                <p className="mt-0.5 text-[9.5px] font-bold text-town-inkSoft">
                  {T(`리뷰 ${reviewCount}`, `${reviewCount} reviews`)}
                </p>
              </div>
            </div>

            <p className="mt-2 text-[13px] leading-relaxed text-town-ink/90">{sDesc(store)}</p>

            <div className="mt-2 flex flex-wrap gap-1.5">
              {sTags(store).map((t) => (
                <span key={t} className="rounded-full bg-town-cream px-2 py-0.5 text-[10.5px] font-bold text-town-inkSoft">
                  #{t}
                </span>
              ))}
            </div>

            <div className="mt-3 flex items-center gap-2 rounded-xl bg-town-cream px-3 py-2.5 text-[12.5px] font-bold text-town-ink">
              <span aria-hidden>🕐</span> {sHours(store)}
            </div>

            {inEventZone && activeEvent && (
              <div className="mt-2 rounded-xl border-2 border-[#8B79C9] bg-[#F3F0FC] px-3 py-2.5">
                <p className="text-[12px] font-extrabold text-[#5F4FA0]">
                  {T(`🎪 ${activeEvent.title} 한정 혜택`, `🎪 ${activeEvent.titleEn ?? activeEvent.title} benefit`)}
                </p>
                <p className="mt-0.5 text-[11.5px] font-bold leading-snug text-[#8B79C9]">
                  {T(activeEvent.benefit, activeEvent.benefitEn ?? activeEvent.benefit)}
                </p>
              </div>
            )}
          </div>

          {/* 액션: 저장 / 길찾기 / 결제 */}
          <div className="mt-3.5 grid grid-cols-3 gap-2">
            <button
              onClick={() => {
                toggleSaved(store.id);
                if (!saved) {
                  recordSave(store.id, today());
                  toast(tr('내 장소에 저장했어요!', 'Saved to my places!'), 'success');
                } else {
                  toast(tr('저장을 해제했어요', 'Removed from saved'), 'info');
                }
              }}
              aria-label="매장 저장 토글"
              className={`flex flex-col items-center gap-1 rounded-2xl border py-3 text-[12px] font-extrabold transition active:scale-95 ${
                saved
                  ? 'border-town-coral bg-town-coral/10 text-town-coralDeep'
                  : 'border-town-line bg-town-paper text-town-ink'
              }`}
            >
              <span className="text-[17px]">{saved ? '❤️' : '🤍'}</span>
              {saved ? T('저장됨', 'Saved') : T('저장', 'Save')}
            </button>
            <button
              onClick={() => {
                onClose();
                setRouteSheetFor(store.id);
              }}
              className="flex flex-col items-center gap-1 rounded-2xl border border-town-line bg-town-paper py-3 text-[12px] font-extrabold text-town-ink transition active:scale-95"
            >
              <span className="text-[17px]">🧭</span> {T('길찾기', 'Directions')}
            </button>
            <button
              onClick={() => tryPayment(store)}
              className="flex flex-col items-center gap-1 rounded-2xl border border-town-line bg-town-paper py-3 text-[12px] font-extrabold text-town-ink transition active:scale-95"
            >
              <span className="text-[17px]">💳</span> {T('결제', 'Pay')}
            </button>
          </div>

          {/* 체크인 CTA */}
          <button
            onClick={() => tryCheckin(store.id)}
            disabled={checkedToday}
            className={`mt-2 flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-[14.5px] font-extrabold shadow-pop transition active:translate-y-[2px] active:shadow-none disabled:shadow-none ${
              checkedToday
                ? 'bg-town-line text-town-inkSoft'
                : within
                  ? 'bg-town-coral text-white'
                  : 'bg-town-cream text-town-inkSoft'
            }`}
          >
            <PawStamp size={19} />
            {checkedToday
              ? T('오늘 발도장 완료!', 'Checked in today!')
              : within
                ? T('발도장 체크인 (+10 톡큰)', 'Paw-stamp check-in (+10 Tokken)')
                : T(`체크인은 ${CHECKIN_RADIUS_M}m 이내에서`, `Check-in within ${CHECKIN_RADIUS_M}m`)}
          </button>

          {/* 리뷰 (장소 귀속) */}
          <section className="mt-5">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-[14px] font-extrabold">
                {T('주민 리뷰', 'Resident Reviews')} <span className="text-town-leafDark">{reviewCount}</span>
              </h3>
              <button
                onClick={() => setComposing(true)}
                className="rounded-full bg-town-leafDark px-3 py-1.5 text-[11.5px] font-extrabold text-white shadow-pop transition active:translate-y-[1px] active:shadow-none"
              >
                {T('✏️ 리뷰 쓰기', '✏️ Write review')}
              </button>
            </div>
            <ul className="flex flex-col gap-2.5">
              {myStoreReviews.map((r) => (
                <li key={r.id} className="rounded-2xl border-2 border-town-leaf/40 bg-town-leaf/5 p-3">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-[12.5px] font-extrabold">
                      {profile && (
                        <span className="inline-block overflow-hidden rounded-full border border-town-line bg-[#EAF6EF]">
                          <CharacterSvg config={profile.character} size={22} bust shadow={false} />
                        </span>
                      )}
                      {profile?.nickname}
                      <span className="rounded-full bg-town-leafDark px-1.5 py-0.5 text-[9px] font-extrabold text-white">
                        {T('나', 'Me')}
                      </span>
                      {r.certified && (
                        <span className="flex items-center gap-0.5 rounded-full bg-town-leaf/15 px-1.5 py-0.5 text-[9.5px] font-extrabold text-town-leafDark">
                          <CertifiedBadge size={11} /> {T('방문 인증', 'Verified visit')}
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="mt-1">
                    <Stars n={r.rating} />
                  </div>
                  <p className="mt-1 text-[12.5px] leading-relaxed text-town-ink/90">{r.text}</p>
                </li>
              ))}
              {seedReviews.map((r) => (
                <li key={r.id} className="rounded-2xl border border-town-line bg-town-cream/60 p-3">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-[12.5px] font-extrabold">
                      <span aria-hidden>{r.flag}</span> {r.author}
                      {r.certified && (
                        <span className="flex items-center gap-0.5 rounded-full bg-town-leaf/15 px-1.5 py-0.5 text-[9.5px] font-extrabold text-town-leafDark">
                          <CertifiedBadge size={11} /> {T('방문 인증', 'Verified visit')}
                        </span>
                      )}
                    </span>
                    <span className="text-[10px] font-bold text-town-inkSoft/70">{r.date}</span>
                  </div>
                  <div className="mt-1">
                    <Stars n={r.rating} />
                  </div>
                  {/* 앱 언어와 일치하는 쪽을 기본 표시 (원문 ≠ 앱 언어면 번역 페어) */}
                  <p className="mt-1 text-[12.5px] leading-relaxed text-town-ink/90">
                    {r.lang === lang ? r.text : r.translated}
                  </p>
                  {r.lang !== lang && (
                    <p className="mt-1 text-[10px] font-bold text-town-skyDeep">
                      {T('🌐 자동 번역됨', '🌐 Auto-translated')}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>

    </div>
    {composing && <ReviewComposer store={store} onClose={() => setComposing(false)} />}
    </>
  );
}
