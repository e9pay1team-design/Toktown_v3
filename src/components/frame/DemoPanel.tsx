// ─── 데모 컨트롤 패널 (브리프 §5) ─────────────────────────────────
// 평가 시연용 치트 패널. 앱 UI와 시각적으로 분리(프레임 밖).
// M1: 리셋만 활성. 나머지 컨트롤은 해당 마일스톤에서 활성화된다.

import { TownLogoMark } from '../../assets/misc';

function UpcomingRow({ label, milestone }: { label: string; milestone: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-dashed border-town-line bg-town-paper/60 px-3 py-2.5 opacity-60">
      <span className="text-[13px] text-town-inkSoft">{label}</span>
      <span className="rounded-full bg-town-line px-2 py-0.5 text-[10px] font-bold text-town-inkSoft">
        {milestone}
      </span>
    </div>
  );
}

export function DemoPanel() {
  const reset = () => {
    Object.keys(localStorage)
      .filter((k) => k.startsWith('toktown:'))
      .forEach((k) => localStorage.removeItem(k));
    location.reload();
  };

  return (
    <aside className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <TownLogoMark size={44} />
        <div>
          <h1 className="text-lg font-extrabold leading-tight">TokTown 데모</h1>
          <p className="text-[12px] text-town-inkSoft">평가용 컨트롤 패널 · M1 빌드</p>
        </div>
      </div>

      <div className="rounded-2xl border border-town-line bg-town-paper p-3 shadow-card">
        <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-town-inkSoft">
          시연 컨트롤
        </p>
        <div className="flex flex-col gap-2">
          <UpcomingRow label="가상 위치 이동" milestone="M2" />
          <UpcomingRow label="승차 태그 (탑승 연출)" milestone="M2" />
          <UpcomingRow label="결제 시뮬레이션" milestone="M2" />
          <UpcomingRow label="날짜 +1 (출석·NPC 로테이션)" milestone="M2" />
          <UpcomingRow label="Event Map 토글" milestone="M3" />
          <button
            onClick={reset}
            className="mt-1 rounded-xl bg-town-coral px-3 py-2.5 text-[13px] font-bold text-white shadow-pop transition active:translate-y-[2px] active:shadow-none"
          >
            데모 리셋 (localStorage 초기화)
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-town-line bg-town-paper/70 p-3 text-[12px] leading-relaxed text-town-inkSoft">
        <p className="mb-1 font-bold text-town-ink">M1 체험 가이드</p>
        1. 온보딩에서 캐릭터 만들기 → 주민증 발급
        <br />
        2. 지도에서 매장·NPC·랜드마크 마커 탐색
        <br />
        3. 검색으로 <b>미성옥</b> 찾기 → 상세 → 저장
        <br />
        4. 칩 <b>저장</b> → 저장 목록 확인
      </div>
    </aside>
  );
}
