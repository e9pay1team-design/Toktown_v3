// ─── 데모 컨트롤 패널 (브리프 §5) ─────────────────────────────────
// 평가 시연용 치트 패널. 앱 UI와 시각적으로 분리(프레임 밖).
// M2: 가상 위치 이동 / 지도 클릭 이동 / 비현실적 점프 / 승차 태그 /
//     결제 시뮬레이션 / 날짜 +1 활성. Event Map 토글은 M3.

import { useState, type ReactNode } from 'react';
import { TownLogoMark } from '../../assets/misc';
import { REGIONAL_NPCS, STORES } from '../../data/seed';
import { useVirtualLocation } from '../../mock/location';
import { useVirtualClock, virtualToday } from '../../mock/clock';
import { useToastStore } from '../../store/useToastStore';
import { useDemoStore } from '../../store/useDemoStore';
import { useUiStore } from '../../store/useUiStore';
import { nearestStoreInRadius, tryPayment, tryRideTag } from '../../lib/actions';

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

  const [target, setTarget] = useState('s:1');

  const magpie = REGIONAL_NPCS[0];
  const suspicious = suspiciousUntil > Date.now();

  const moveTo = () => {
    const [kind, id] = target.split(':');
    const spot =
      kind === 's'
        ? STORES.find((s) => s.id === Number(id))
        : magpie.spots.find((s) => s.id === id);
    if (!spot) return;
    const label = 'name' in spot ? spot.name : spot.label;
    teleport({ lat: spot.lat, lng: spot.lng });
    setTab('map');
    requestFlyTo({ lat: spot.lat, lng: spot.lng, zoom: 17 });
    toast(`🚶 ${label}(으)로 이동했어요 (가상 GPS)`, 'success');
  };

  const reset = () => {
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
            평가용 컨트롤 패널 · M2 빌드 · 가상 {virtualToday(dayOffset)} (D+{dayOffset})
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
          <div className="flex items-center justify-between rounded-xl border border-dashed border-town-line bg-town-paper/60 px-3 py-2.5 opacity-60">
            <span className="text-[13px] text-town-inkSoft">Event Map 토글</span>
            <span className="rounded-full bg-town-line px-2 py-0.5 text-[10px] font-bold text-town-inkSoft">
              M3
            </span>
          </div>
          <button onClick={reset} className={`${btn} bg-town-coral text-white`}>
            데모 리셋 (localStorage 초기화)
          </button>
        </Row>
      </div>

      <div className="rounded-2xl border border-town-line bg-town-paper/70 p-3 text-[12px] leading-relaxed text-town-inkSoft">
        <p className="mb-1 font-bold text-town-ink">M2 체험 가이드</p>
        1. 출석 팝업에서 도장 찍기 (+10)
        <br />
        2. <b>미성옥</b> 상세 → 길찾기 → 이동 시작 → <b>승차 태그</b>
        <br />
        3. 도착 후 체크인 + 인증 리뷰 → 톡큰 토스트
        <br />
        4. 🔥 핫플 랭킹에서 순위 상승 확인
        <br />
        5. 결제 시뮬레이션 → 지갑에서 잔액·내역 확인
        <br />
        6. 비현실적 점프 → 체크인 거부 확인
      </div>
    </aside>
  );
}
