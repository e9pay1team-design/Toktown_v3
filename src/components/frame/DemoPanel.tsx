// ─── 데모 컨트롤 패널 (브리프 §5) ─────────────────────────────────
// 평가 시연용 치트 패널. 앱 UI와 시각적으로 분리(프레임 밖).
// M2: 가상 위치 이동 / 지도 클릭 이동 / 비현실적 점프 / 승차 태그 /
//     결제 시뮬레이션 / 날짜 +1 활성. Event Map 토글은 M3.

import { useState, type ReactNode } from 'react';
import { TownLogoMark } from '../../assets/misc';
import { LANDMARKS, REGIONAL_NPCS, STORES, TOWN_EVENTS, storeById } from '../../data/seed';
import { useVirtualLocation } from '../../mock/location';
import { useVirtualClock, virtualToday } from '../../mock/clock';
import { useToastStore } from '../../store/useToastStore';
import { useDemoStore } from '../../store/useDemoStore';
import { useUiStore } from '../../store/useUiStore';
import { useEventStore } from '../../store/useEventStore';
import {
  checkLandmarkDiscovery,
  nearestStoreInRadius,
  tryPayment,
  tryRideTag,
} from '../../lib/actions';

const JUMP_TARGET = { lat: 37.5759, lng: 126.9769, label: '광화문' };

function Row({ children }: { children: ReactNode }) {
  return <div className="flex flex-col gap-1.5">{children}</div>;
}

export function DemoPanel() {
  const teleport = useVirtualLocation((s) => s.teleport);
  const jump = useVirtualLocation((s) => s.jump);
  const suspiciousUntil = useVirtualLocation((s) => s.suspiciousUntil);
  const dayOffset = useVirtualClock((s) => s.dayOffset);
  const addDay = useVirtualClock((s) => s.addDay);
  const toast = useToastStore((s) => s.show);
  const clickTeleportArmed = useDemoStore((s) => s.clickTeleportArmed);
  const setClickTeleportArmed = useDemoStore((s) => s.setClickTeleportArmed);
  const requestFlyTo = useUiStore((s) => s.requestFlyTo);
  const setTab = useUiStore((s) => s.setTab);
  const activeEventId = useEventStore((s) => s.activeEventId);
  const toggleEvent = useEventStore((s) => s.toggleEvent);

  const [target, setTarget] = useState('s:1');

  const magpie = REGIONAL_NPCS[0];
  const suspicious = suspiciousUntil > Date.now();
  const nantaEvent = TOWN_EVENTS[0];
  const eventOn = activeEventId === nantaEvent.id;

  const moveTo = () => {
    const [kind, id] = target.split(':');
    const spot =
      kind === 's'
        ? STORES.find((s) => s.id === Number(id))
        : kind === 'l'
          ? LANDMARKS.find((l) => l.id === id)
          : magpie.spots.find((s) => s.id === id);
    if (!spot) return;
    const label = 'name' in spot ? spot.name : spot.label;
    teleport({ lat: spot.lat, lng: spot.lng });
    setTab('map');
    requestFlyTo({ lat: spot.lat, lng: spot.lng, zoom: 17 });
    toast(`🚶 ${label}(으)로 이동했어요 (가상 GPS)`, 'success');
    setTimeout(checkLandmarkDiscovery, 400);
  };

  const reset = () => {
    if (!window.confirm('모든 데모 데이터(캐릭터·마을·톡큰)가 초기화됩니다. 계속할까요?')) return;
    Object.keys(localStorage)
      .filter((k) => k.startsWith('toktown:'))
      .forEach((k) => localStorage.removeItem(k));
    location.reload();
  };

  const btn =
    'rounded-xl px-3 py-2.5 text-[12.5px] font-bold shadow-pop transition active:translate-y-[2px] active:shadow-none';

  return (
    <aside className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <TownLogoMark size={44} />
        <div>
          <h1 className="text-lg font-extrabold leading-tight">TokTown 데모</h1>
          <p className="text-[12px] text-town-inkSoft">
            평가용 컨트롤 패널 · M3 빌드 · 가상 {virtualToday(dayOffset)} (D+{dayOffset})
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-town-line bg-town-paper p-3 shadow-card">
        <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-town-inkSoft">
          가상 위치
        </p>
        <Row>
          <div className="flex gap-1.5">
            <select
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              className="min-w-0 flex-1 rounded-xl border border-town-line bg-town-cream px-2 py-2 text-[12.5px] font-bold outline-none"
              aria-label="이동할 위치 선택"
            >
              <optgroup label="매장">
                {STORES.map((s) => (
                  <option key={s.id} value={`s:${s.id}`}>
                    {s.name}
                  </option>
                ))}
              </optgroup>
              <optgroup label="까치 출몰 지점">
                {magpie.spots.map((s) => (
                  <option key={s.id} value={`n:${s.id}`}>
                    {s.label}
                  </option>
                ))}
              </optgroup>
              <optgroup label="랜드마크 (최초 방문 시 미니어처)">
                {LANDMARKS.map((l) => (
                  <option key={l.id} value={`l:${l.id}`}>
                    {l.name}
                  </option>
                ))}
              </optgroup>
            </select>
            <button onClick={moveTo} className={`${btn} bg-town-leafDark text-white`}>
              이동
            </button>
          </div>
          <button
            onClick={() => {
              setClickTeleportArmed(!clickTeleportArmed);
              setTab('map');
            }}
            className={`${btn} ${
              clickTeleportArmed
                ? 'bg-town-sun text-town-bark'
                : 'border border-town-line bg-town-paper text-town-ink shadow-none'
            }`}
          >
            {clickTeleportArmed ? '🎯 지도 클릭 대기 중… (끄기)' : '지도 클릭으로 이동'}
          </button>
          <button
            onClick={() => {
              jump(JUMP_TARGET);
              setTab('map');
              requestFlyTo({ ...JUMP_TARGET, zoom: 16 });
              toast(`🚨 ${JUMP_TARGET.label}(으)로 비현실적 점프! 잠시 체크인·인증이 거부돼요`, 'error');
            }}
            className={`${btn} bg-town-coral text-white`}
          >
            🚨 비현실적 점프 재현
          </button>
          {suspicious && (
            <p className="rounded-lg bg-town-coral/10 px-2 py-1.5 text-[11px] font-bold text-town-coralDeep">
              이동속도 검증 실패 상태 — 정상 이동을 하면 해제돼요
            </p>
          )}
        </Row>
      </div>

      <div className="rounded-2xl border border-town-line bg-town-paper p-3 shadow-card">
        <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-town-inkSoft">
          시연 컨트롤
        </p>
        <Row>
          <button onClick={() => tryRideTag()} className={`${btn} bg-town-skyDeep text-white`}>
            📳 승차 태그
          </button>
          <button
            onClick={() => {
              const store = nearestStoreInRadius();
              if (!store) {
                toast('반경 100m 안에 매장이 없어요. 먼저 매장으로 이동하세요!', 'error');
                return;
              }
              tryPayment(store);
            }}
            className={`${btn} bg-town-sunDeep text-white`}
          >
            💳 결제 시뮬레이션 (현재 위치 매장)
          </button>
          <button
            onClick={() => {
              addDay();
              toast('📅 가상 날짜 +1 — 출석·NPC 로테이션·랭킹 감쇠가 갱신돼요', 'info');
            }}
            className={`${btn} bg-town-lilac text-town-ink`}
          >
            📅 날짜 +1
          </button>
          <button
            onClick={() => {
              const nowOn = toggleEvent(nantaEvent.id);
              if (nowOn) {
                const venue = storeById(nantaEvent.venueStoreId);
                setTab('map');
                if (venue) requestFlyTo({ lat: venue.lat, lng: venue.lng, zoom: 16 });
                toast(`🎪 ${nantaEvent.title} 활성화! 극장 반경 한정 혜택 + 한정 NPC 출몰`, 'success');
              } else {
                toast('Event Map을 종료했어요', 'info');
              }
            }}
            className={`${btn} ${
              eventOn
                ? 'bg-[#8B79C9] text-white'
                : 'border-2 border-[#C7B9F2] bg-[#F3F0FC] text-[#5F4FA0] shadow-none'
            }`}
          >
            {eventOn ? '🎪 Event Map 진행 중 (끄기)' : '🎪 Event Map 토글 (난타 위크)'}
          </button>
          <button onClick={reset} className={`${btn} bg-town-coral text-white`}>
            데모 리셋 (localStorage 초기화)
          </button>
        </Row>
      </div>

      <div className="rounded-2xl border border-town-line bg-town-paper/70 p-3 text-[12px] leading-relaxed text-town-inkSoft">
        <p className="mb-1 font-bold text-town-ink">5분 데모 시나리오 (브리프 §8)</p>
        1. 온보딩 → 캐릭터 → 주민증 발급
        <br />
        2. <b>미성옥</b> 검색 → 길찾기 → <b>승차 태그</b> → 도착
        <br />
        3. 체크인 + 인증 리뷰 → 톡큰 → 🔥 핫플 상승
        <br />
        4. <b>명동성당</b>으로 이동 → 까치 조우 → 도감 등록
        <br />
        5. 내 마을 → 미성옥 건물 + 까치 배치 → 상점 구매
        <br />
        6. 커뮤니티 <b>번역 보기</b> → 🎪 Event Map → 한정 혜택
      </div>
    </aside>
  );
}
