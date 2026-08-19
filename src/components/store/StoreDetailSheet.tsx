// ─── 매장 상세 (기획 §6 화면 4) ───────────────────────────────────
// 바텀 시트: 건물 일러스트, 이름/카테고리/영업시간, 실시간 웨이팅(대기
// 서비스 연동 목업), 톡페이 혜택 뱃지, 🌏 외국인 방문 팁, 버튼(저장/
// 길찾기/결제/공유) + 체크인(발도장) + 리뷰 작성·수정·삭제(인증 뱃지).

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Store } from '../../types';
import { TOWN_EVENTS, reviewsByStore, storeById } from '../../data/seed';
import { waitingInfo } from '../../mock/waiting';
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
import { catLabel, sBenefit, sDesc, sHours, sName, sSub, sTags, sTips, sWaitingPartner, tr, useLang, useT } from '../../i18n';

/** 매장 공유 시트 — 링크 복사·기기 공유는 실제 시도, 앱 버튼은 데모 연출 */
function ShareSheet({
  store,
  avg,
  reviewCount,
  onClose,
}: {
  store: Store;
  avg: number;
  reviewCount: number;
  onClose: () => void;
}) {
  const toast = useToastStore((s) => s.show);
  const T = useT();
  const url = `https://toktown-v3.vercel.app/?store=${store.id}`;
  const shareText = tr(
    `${store.name} — 톡타운 주민 인증 장소 ⭐${avg} (리뷰 ${reviewCount})${store.benefit ? ` · 톡페이 ${store.benefit}` : ''}`,
    `${sName(store)} — TokTown resident-approved spot ⭐${avg} (${reviewCount} reviews)${sBenefit(store) ? ` · TokPay ${sBenefit(store)}` : ''}`,
  );

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(`${shareText}\n${url}`);
      toast(tr('🔗 링크를 복사했어요 — 어디든 붙여넣어 보세요', '🔗 Link copied — paste it anywhere'), 'success');
    } catch {
      toast(tr('이 환경에선 복사가 제한돼요 — 링크를 길게 눌러 복사하세요', 'Copying is limited here — long-press the link to copy'), 'error');
    }
  };

  const deviceShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: 'TokTown', text: shareText, url });
        toast(tr('📤 공유했어요!', '📤 Shared!'), 'success');
        return;
      }
      await copyLink();
    } catch (e) {
      if ((e as Error)?.name === 'AbortError') return; // 사용자가 시트를 닫음
      toast(tr('이 환경에선 기기 공유가 제한돼요 — 링크 복사를 이용하세요', 'System share is limited here — use Copy link'), 'info');
    }
  };

  const mockShare = (app: string) =>
    toast(tr(`📤 ${app} 공유 연출이에요 — 데모라 실제 전송은 안 돼요`, `📤 ${app} share (demo visual only — nothing is sent)`), 'info');

  const apps: { key: string; label: string; labelEn: string; icon: ReactNode }[] = [
    {
      key: 'kakao',
      label: '카카오톡',
      labelEn: 'KakaoTalk',
      icon: (
        <svg width={44} height={44} viewBox="0 0 44 44" aria-hidden>
          <rect width={44} height={44} rx={13} fill="#FEE500" />
          <path d="M22 11 C14.8 11 9 15.6 9 21.2 c0 3.6 2.4 6.7 6 8.5 l-1.4 5.2 5.6-3.5 c0.9 0.1 1.8 0.2 2.8 0.2 7.2 0 13-4.6 13-10.4 S29.2 11 22 11 Z" fill="#3B1E1E" />
        </svg>
      ),
    },
    {
      key: 'message',
      label: '메시지',
      labelEn: 'Messages',
      icon: (
        <svg width={44} height={44} viewBox="0 0 44 44" aria-hidden>
          <rect width={44} height={44} rx={13} fill="#5DC15E" />
          <path d="M22 10.5 c-7.5 0-13 4.7-13 10.5 0 3.4 1.9 6.4 5 8.3 L12.6 34 l6-3.1 c1.1 0.2 2.2 0.3 3.4 0.3 7.5 0 13-4.7 13-10.5 S29.5 10.5 22 10.5 Z" fill="#fff" />
        </svg>
      ),
    },
    {
      key: 'story',
      label: '스토리',
      labelEn: 'Story',
      icon: (
        <svg width={44} height={44} viewBox="0 0 44 44" aria-hidden>
          <defs>
            <linearGradient id="share-insta" x1="0" y1="1" x2="1" y2="0">
              <stop offset="0" stopColor="#FBAD50" />
              <stop offset="0.5" stopColor="#E14E86" />
              <stop offset="1" stopColor="#8A5CF6" />
            </linearGradient>
          </defs>
          <rect width={44} height={44} rx={13} fill="url(#share-insta)" />
          <rect x={11} y={11} width={22} height={22} rx={7} fill="none" stroke="#fff" strokeWidth={2.6} />
          <circle cx={22} cy={22} r={5.4} fill="none" stroke="#fff" strokeWidth={2.6} />
          <circle cx={28.6} cy={15.4} r={1.7} fill="#fff" />
        </svg>
      ),
    },
    {
      key: 'more',
      label: '더보기',
      labelEn: 'More',
      icon: (
        <svg width={44} height={44} viewBox="0 0 44 44" aria-hidden>
          <rect width={44} height={44} rx={13} fill="#E9E2D4" />
          <circle cx={14} cy={22} r={2.6} fill="#8C7B6E" />
          <circle cx={22} cy={22} r={2.6} fill="#8C7B6E" />
          <circle cx={30} cy={22} r={2.6} fill="#8C7B6E" />
        </svg>
      ),
    },
  ];

  return (
    <div className="absolute inset-0 z-[870] flex flex-col justify-end bg-town-ink/40 fade-in" onClick={onClose}>
      <div
        className="sheet-up mx-2 mb-2 rounded-[1.6rem] bg-town-paper p-5 shadow-sheet"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-[16px] font-extrabold">{T('이 장소 공유하기', 'Share this place')}</h3>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-town-cream text-[13px] font-bold text-town-inkSoft"
            aria-label="공유 닫기"
          >
            ✕
          </button>
        </div>

        {/* 공유 미리보기 카드 */}
        <div className="flex items-center gap-3 rounded-2xl border border-town-line bg-town-cream/60 p-3">
          <div className="flex h-16 w-16 shrink-0 items-end justify-center overflow-hidden rounded-xl bg-town-paper">
            <div className="origin-bottom scale-[0.42]">
              <StoreBuilding category={store.category} label={sName(store)} size={150} />
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[14px] font-extrabold">{sName(store)}</p>
            <p className="text-[11px] font-bold text-town-inkSoft">
              {catLabel(store.category)} · ★ {avg} · {T(`리뷰 ${reviewCount}`, `${reviewCount} reviews`)}
            </p>
            <p className="mt-0.5 truncate text-[10px] font-bold text-town-skyDeep">{url}</p>
          </div>
        </div>

        {/* 공유 대상 앱 (데모 연출) */}
        <div className="mt-3.5 flex justify-around">
          {apps.map((a) => (
            <button
              key={a.key}
              onClick={() => mockShare(T(a.label, a.labelEn))}
              className="flex w-16 flex-col items-center gap-1.5 transition active:scale-95"
            >
              {a.icon}
              <span className="text-[10px] font-bold text-town-inkSoft">{T(a.label, a.labelEn)}</span>
            </button>
          ))}
        </div>

        <div className="mt-3.5 flex gap-2">
          <button
            onClick={copyLink}
            className="flex-1 rounded-xl bg-town-ink py-3 text-[13px] font-extrabold text-town-paper shadow-pop transition active:translate-y-[2px] active:shadow-none"
          >
            🔗 {T('링크 복사', 'Copy link')}
          </button>
          <button
            onClick={deviceShare}
            className="flex-1 rounded-xl bg-town-leafDark py-3 text-[13px] font-extrabold text-white shadow-pop transition active:translate-y-[2px] active:shadow-none"
          >
            📤 {T('기기 공유 시트', 'System share')}
          </button>
        </div>
      </div>
    </div>
  );
}

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
  const deleteReview = useVisitStore((s) => s.deleteReview);
  const profile = useProfileStore((s) => s.profile);
  const setRouteSheetFor = useUiStore((s) => s.setRouteSheetFor);
  const activeEventId = useEventStore((s) => s.activeEventId);
  const [composing, setComposing] = useState(false);
  /** 수정 대상 리뷰 id — null 이면 새 리뷰 작성 */
  const [editingReviewId, setEditingReviewId] = useState<number | null>(null);
  /** 리뷰 삭제 2단계 확인 (3초 뒤 자동 해제) */
  const [armedDelete, setArmedDelete] = useState<number | null>(null);
  const [sharing, setSharing] = useState(false);
  const T = useT();
  const lang = useLang();

  // 실시간 웨이팅 — 20초마다 재계산 (연동 목업, 5분 슬롯 단위로 천천히 변함)
  const [waitTick, setWaitTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setWaitTick((n) => n + 1), 20_000);
    return () => clearInterval(t);
  }, []);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const waiting = useMemo(() => (store ? waitingInfo(store) : null), [store, waitTick]);

  if (!store) return null;

  /* Event Map 활성 + 거점 반경 내 매장이면 한정 혜택 노출 */
  const activeEvent = TOWN_EVENTS.find((e) => e.id === activeEventId) ?? null;
  const inEventZone = activeEvent ? distanceM(store, activeEvent.venue) <= activeEvent.radiusM : false;
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

            {/* 실시간 웨이팅 — 대기 서비스 연동 목업 */}
            {waiting && (
              <div
                className={`mt-2 flex items-center gap-2 rounded-xl px-3 py-2.5 text-[12.5px] font-bold ${
                  waiting.level === 0
                    ? 'bg-town-leaf/15 text-town-leafDark'
                    : waiting.level === 1
                      ? 'bg-town-sun/40 text-town-bark'
                      : 'bg-town-coral/10 text-town-coralDeep'
                }`}
                aria-label="실시간 웨이팅 정보"
              >
                <span
                  className={`h-2 w-2 shrink-0 animate-pulse rounded-full ${
                    waiting.level === 0 ? 'bg-town-leafDark' : waiting.level === 1 ? 'bg-town-sunDeep' : 'bg-town-coralDeep'
                  }`}
                />
                <span className="min-w-0 flex-1">
                  {waiting.teams === 0
                    ? T('지금 바로 입장 가능 · 웨이팅 없음', 'Walk right in — no wait now')
                    : T(
                        `지금 웨이팅 ${waiting.teams}팀 · 예상 ${waiting.estMinutes}분`,
                        `${waiting.teams} team${waiting.teams === 1 ? '' : 's'} waiting · ~${waiting.estMinutes} min`,
                      )}
                </span>
                <span className="shrink-0 rounded-full bg-town-paper px-2 py-0.5 text-[9.5px] font-extrabold text-town-inkSoft">
                  {sWaitingPartner(store)} {T('연동', 'live')}
                </span>
              </div>
            )}

            {/* 🌏 외국인 방문 팁 */}
            {sTips(store).length > 0 && (
              <div className="mt-2 rounded-xl border border-town-sky bg-[#EAF4F8] px-3 py-2.5">
                <p className="text-[11px] font-extrabold text-town-skyDeep">
                  🌏 {T('방문 팁 — 외국인 주민 가이드', 'Visitor Tips for Internationals')}
                </p>
                <ul className="mt-1.5 flex flex-col gap-1">
                  {sTips(store).map((tip) => (
                    <li key={tip} className="flex gap-1.5 text-[12px] font-medium leading-snug text-town-ink/90">
                      <span className="shrink-0 text-town-skyDeep">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

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

          {/* 액션: 저장 / 길찾기 / 결제 / 공유 */}
          <div className="mt-3.5 grid grid-cols-4 gap-2">
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
            <button
              onClick={() => setSharing(true)}
              aria-label="매장 공유"
              className="flex flex-col items-center gap-1 rounded-2xl border border-town-line bg-town-paper py-3 text-[12px] font-extrabold text-town-ink transition active:scale-95"
            >
              <span className="text-[17px]">📤</span> {T('공유', 'Share')}
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
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex min-w-0 items-center gap-1.5 text-[12.5px] font-extrabold">
                      {profile && (
                        <span className="inline-block shrink-0 overflow-hidden rounded-full border border-town-line bg-[#EAF6EF]">
                          <CharacterSvg config={profile.character} size={22} bust shadow={false} />
                        </span>
                      )}
                      {profile?.nickname}
                      <span className="shrink-0 rounded-full bg-town-leafDark px-1.5 py-0.5 text-[9px] font-extrabold text-white">
                        {T('나', 'Me')}
                      </span>
                      {r.certified && (
                        <span className="flex shrink-0 items-center gap-0.5 rounded-full bg-town-leaf/15 px-1.5 py-0.5 text-[9.5px] font-extrabold text-town-leafDark">
                          <CertifiedBadge size={11} /> {T('방문 인증', 'Verified visit')}
                        </span>
                      )}
                    </span>
                    {/* 내 리뷰 관리 — 수정 / 삭제(2단계 확인) */}
                    <span className="flex shrink-0 gap-1">
                      <button
                        onClick={() => {
                          setEditingReviewId(r.id);
                          setComposing(true);
                        }}
                        aria-label="리뷰 수정"
                        className="rounded-full border border-town-line bg-town-paper px-2 py-0.5 text-[10.5px] font-extrabold text-town-inkSoft transition active:scale-95"
                      >
                        ✏️ {T('수정', 'Edit')}
                      </button>
                      <button
                        onClick={() => {
                          if (armedDelete === r.id) {
                            setArmedDelete(null);
                            deleteReview(r.id);
                            toast(
                              tr('리뷰를 삭제했어요 — 방문 기록은 유지돼요', 'Review deleted — visit history stays'),
                              'info',
                            );
                          } else {
                            setArmedDelete(r.id);
                            setTimeout(() => setArmedDelete((v) => (v === r.id ? null : v)), 3000);
                          }
                        }}
                        aria-label="리뷰 삭제"
                        className={`rounded-full px-2 py-0.5 text-[10.5px] font-extrabold transition active:scale-95 ${
                          armedDelete === r.id
                            ? 'animate-pulse bg-town-coralDeep text-white'
                            : 'border border-town-line bg-town-paper text-town-inkSoft'
                        }`}
                      >
                        {armedDelete === r.id ? T('한 번 더!', 'Again!') : `🗑️ ${T('삭제', 'Delete')}`}
                      </button>
                    </span>
                  </div>
                  <div className="mt-1">
                    <Stars n={r.rating} />
                    {r.edited && (
                      <span className="ml-1.5 text-[9.5px] font-bold text-town-inkSoft/70">
                        {T('(수정됨)', '(edited)')}
                      </span>
                    )}
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
    {sharing && (
      <ShareSheet store={store} avg={avg} reviewCount={reviewCount} onClose={() => setSharing(false)} />
    )}
    {composing && (
      <ReviewComposer
        store={store}
        editing={editingReviewId !== null ? myReviews.find((r) => r.id === editingReviewId) : undefined}
        onClose={() => {
          setComposing(false);
          setEditingReviewId(null);
        }}
      />
    )}
    </>
  );
}
