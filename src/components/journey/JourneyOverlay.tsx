// ─── 이동 중 화면 (기획 §6 화면 6) ────────────────────────────────
// waitTag: 승차 태그 대기 카드 (폴백 트리거 구조)
// boarding: 수단별 탑승 애니메이션 (출발 → 도착 안내)
// riding: 실지도 경로 추적 (캐릭터가 폴리라인을 따라 이동) + 하차 알림
// arrived: 도착 모달 → 체크인·리뷰 유도

import { useEffect, useRef } from 'react';
import { storeById } from '../../data/seed';
import { useJourneyStore } from '../../store/useJourneyStore';
import { useUiStore } from '../../store/useUiStore';
import { useToastStore } from '../../store/useToastStore';
import { useVirtualLocation } from '../../mock/location';
import { pointAlong } from '../../lib/routes';
import { tryRideTag, withinRadius } from '../../lib/actions';
import { BusSvg, SubwaySvg } from '../../assets/journey';
import { TownKeyringSvg } from '../../assets/journey';

const RIDE_MS = { transit: 12000, walk: 9000 } as const;

export function JourneyOverlay() {
  const journey = useJourneyStore();
  const phase = journey.phase;

  /* boarding → 2.8초 후 자동으로 경로 추적 시작 */
  useEffect(() => {
    if (phase !== 'boarding') return;
    const t = setTimeout(() => useJourneyStore.getState().startRiding(), 2800);
    return () => clearTimeout(t);
  }, [phase]);

  /* riding: RAF 로 폴리라인 따라 캐릭터 이동 */
  const rafRef = useRef(0);
  useEffect(() => {
    if (phase !== 'riding' || !journey.route) return;
    const route = journey.route;
    const duration = RIDE_MS[route.mode];
    const startedAt = performance.now();
    const startProgress = useJourneyStore.getState().progress;
    let alerted = false;

    const tick = (now: number) => {
      const p = Math.min(1, startProgress + ((now - startedAt) / duration) * (1 - startProgress));
      useJourneyStore.getState().setProgress(p);
      useVirtualLocation.getState().trace(pointAlong(route.polyline, p));
      if (route.mode === 'transit' && !alerted && p >= 0.85) {
        alerted = true;
        useToastStore.getState().show(`🔔 곧 ${route.alightAt} — 하차 준비하세요!`, 'info');
      }
      if (p >= 1) {
        useJourneyStore.getState().arrive();
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  if (phase === 'idle' || !journey.route) return null;
  const route = journey.route;
  const store = journey.destStoreId ? storeById(journey.destStoreId) : null;

  return (
    <>
      {/* ── 승차 태그 대기 ── */}
      {phase === 'waitTag' && (
        <div className="pointer-events-none absolute inset-0 z-[610] flex flex-col justify-end px-3 pb-24">
          <div className="sheet-up pointer-events-auto rounded-[1.6rem] border-2 border-town-sky bg-town-paper p-5 shadow-sheet">
            <div className="flex items-center gap-4">
              <div className="char-bob shrink-0">
                <TownKeyringSvg size={58} />
              </div>
              <div className="min-w-0">
                <p className="text-[15px] font-extrabold">승차 태그를 기다리고 있어요</p>
                <p className="mt-1 text-[12px] leading-snug text-town-inkSoft">
                  {route.boardAt}에서 <b>{route.line}</b> 탑승 —
                  Town Key·선불카드를 단말기에 태그하세요
                </p>
              </div>
            </div>
            <div className="mt-3.5 flex gap-2">
              <button
                onClick={() => useJourneyStore.getState().reset()}
                className="w-1/3 rounded-xl border border-town-line bg-town-paper py-3 text-[13px] font-extrabold text-town-inkSoft"
              >
                취소
              </button>
              <button
                onClick={() => tryRideTag()}
                className="flex-1 rounded-xl bg-town-skyDeep py-3 text-[13.5px] font-extrabold text-white shadow-pop transition active:translate-y-[2px] active:shadow-none"
              >
                📳 승차 태그 시뮬레이션
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 탑승 애니메이션 (수단별) ── */}
      {phase === 'boarding' && (
        <div className="absolute inset-0 z-[860] flex flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-[#BFE3EC] to-[#E8F4E9] fade-in">
          {/* 구름 */}
          <div className="cloud-drift absolute left-0 top-16 text-[36px] opacity-70">☁️</div>
          <div className="cloud-drift absolute left-0 top-36 text-[26px] opacity-50" style={{ animationDelay: '-6s' }}>☁️</div>

          <p className="mb-1 text-[13px] font-extrabold text-town-inkSoft">
            {route.vehicle === 'subway' ? '지하철 탑승!' : '버스 탑승!'}
          </p>
          <div className="flex items-center gap-2 text-[15px] font-extrabold">
            <span className="rounded-full bg-town-paper px-3 py-1 shadow-card">{route.boardAt}</span>
            <span className="text-town-inkSoft">→</span>
            <span className="rounded-full bg-town-sun px-3 py-1 text-town-bark shadow-card">{route.alightAt}</span>
          </div>

          <div className="vehicle-ride mt-8">
            {route.vehicle === 'subway' ? <SubwaySvg width={236} /> : <BusSvg width={216} />}
          </div>
          {/* 도로/레일 */}
          <div className="mt-1 h-[5px] w-64 overflow-hidden rounded-full bg-town-ink/15">
            <div className="road-dash h-full w-[200%]" />
          </div>

          <p className="mt-6 animate-pulse text-[13px] font-bold text-town-inkSoft">
            {route.line} · 이동 중…
          </p>
        </div>
      )}

      {/* ── 경로 추적 배너 ── */}
      {phase === 'riding' && (
        <div className="pointer-events-none absolute inset-x-0 top-0 z-[600] px-4 pt-11">
          <div
            className={`pointer-events-auto rounded-2xl border-2 p-3.5 shadow-card transition-colors ${
              journey.alightSoon
                ? 'border-town-coral bg-[#FFF1EC]'
                : 'border-town-line bg-town-paper'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className="text-[22px]">
                {route.vehicle === 'subway' ? '🚇' : route.vehicle === 'bus' ? '🚌' : '🚶'}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13.5px] font-extrabold">
                  {journey.alightSoon
                    ? `곧 ${route.alightAt} — 하차 준비!`
                    : route.mode === 'walk'
                      ? `${store?.name ?? '목적지'}까지 걷는 중`
                      : `${route.line} 탑승 중 · ${route.alightAt} 하차 예정`}
                </p>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-town-line">
                  <div
                    className={`h-full rounded-full transition-[width] duration-150 ${
                      journey.alightSoon ? 'bg-town-coral' : 'bg-town-leafDark'
                    }`}
                    style={{ width: `${Math.round(journey.progress * 100)}%` }}
                  />
                </div>
              </div>
              <button
                onClick={() => useJourneyStore.getState().reset()}
                className="shrink-0 rounded-full bg-town-cream px-2.5 py-1 text-[11px] font-bold text-town-inkSoft"
              >
                중단
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 도착 ── */}
      {phase === 'arrived' && store && (
        <div className="absolute inset-0 z-[860] flex items-center justify-center bg-town-ink/45 px-8 fade-in">
          <div className="pop-in w-full rounded-[1.6rem] bg-town-paper p-6 text-center shadow-sheet">
            <p className="text-[38px]">🎉</p>
            <h3 className="mt-1 text-[19px] font-extrabold">{store.name} 도착!</h3>
            <p className="mt-1.5 text-[12.5px] leading-relaxed text-town-inkSoft">
              {withinRadius(store)
                ? '지금 발도장을 찍고 인증 리뷰를 남기면 톡큰이 더 쏠쏠해요.'
                : '이동을 마쳤어요. 다음 목적지로 떠나볼까요?'}
            </p>
            <div className="mt-4 flex flex-col gap-2">
              {withinRadius(store) && (
                <button
                  onClick={() => {
                    useJourneyStore.getState().reset();
                    useUiStore.getState().selectStore(store.id);
                    useUiStore.getState().requestFlyTo({ lat: store.lat - 0.00085, lng: store.lng, zoom: 17 });
                  }}
                  className="rounded-2xl bg-town-coral py-3.5 text-[14.5px] font-extrabold text-white shadow-pop transition active:translate-y-[2px] active:shadow-none"
                >
                  👣 체크인·리뷰 하러 가기
                </button>
              )}
              <button
                onClick={() => useJourneyStore.getState().reset()}
                className="rounded-2xl border border-town-line bg-town-paper py-3 text-[13px] font-extrabold text-town-inkSoft"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
