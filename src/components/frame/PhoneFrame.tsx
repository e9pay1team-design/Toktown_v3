// ─── 모바일 프레임 (390×844) + 프레임 밖 데모 패널 ────────────────
// 데스크톱 브라우저에서 열어도 중앙 모바일 프레임 안에 앱이 렌더링.
// 화면이 작으면 전체를 비율 축소한다.
// 데모 패널은 우상단 🎛️ 토글로 숨길 수 있다 — 좁은 화면(모바일)에선
// 기본 숨김이라 폰 조작에 걸리적거리지 않는다. 선택은 기억된다.

import { type ReactNode, useEffect, useState } from 'react';

const SCREEN_W = 390;
const SCREEN_H = 844;
const BEZEL = 11;
const PANEL_PREF_KEY = 'toktown:demo-panel';

function initialPanelOpen(): boolean {
  try {
    const saved = localStorage.getItem(PANEL_PREF_KEY);
    if (saved === '1') return true;
    if (saved === '0') return false;
  } catch {
    /* 저장 불가 환경 — 화면 폭 기준 기본값 */
  }
  return window.innerWidth >= 900;
}

export function PhoneFrame({ children, panel }: { children: ReactNode; panel: ReactNode }) {
  const [scale, setScale] = useState(1);
  const [panelOpen, setPanelOpen] = useState(initialPanelOpen);

  useEffect(() => {
    const update = () => {
      const totalH = SCREEN_H + BEZEL * 2 + 40;
      const totalW = SCREEN_W + BEZEL * 2 + (panelOpen ? 340 : 28); // 패널 폭 여유 포함
      setScale(Math.min(1, window.innerHeight / totalH, window.innerWidth / totalW));
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [panelOpen]);

  const togglePanel = () =>
    setPanelOpen((v) => {
      const next = !v;
      try {
        localStorage.setItem(PANEL_PREF_KEY, next ? '1' : '0');
      } catch {
        /* noop */
      }
      return next;
    });

  return (
    <div className="relative flex h-screen items-center justify-center">
      <div
        className="flex items-center gap-10"
        style={{ transform: `scale(${scale})`, transformOrigin: 'center' }}
      >
        {/* 폰 목업 */}
        <div
          className="relative shrink-0 rounded-[3.2rem] bg-[#43403c] shadow-[0_24px_60px_rgba(60,50,40,0.35)]"
          style={{ padding: BEZEL }}
        >
          {/* 사이드 버튼 */}
          <div className="absolute -left-[3px] top-40 h-16 w-[3px] rounded-l bg-[#2e2b28]" />
          <div className="absolute -right-[3px] top-52 h-24 w-[3px] rounded-r bg-[#2e2b28]" />
          <div
            className="relative overflow-hidden rounded-[2.55rem] bg-town-cream"
            style={{ width: SCREEN_W, height: SCREEN_H }}
          >
            {children}
            {/* 노치 (다이내믹 아일랜드) */}
            <div className="pointer-events-none absolute left-1/2 top-3 z-[999] h-[24px] w-[108px] -translate-x-1/2 rounded-full bg-[#2e2b28]" />
          </div>
        </div>
        {/* 데모 컨트롤 패널 (프레임 밖) */}
        {panelOpen && <div className="w-[280px] shrink-0">{panel}</div>}
      </div>

      {/* 패널 토글 — 스케일 밖 뷰포트 고정 */}
      <button
        onClick={togglePanel}
        aria-label={panelOpen ? '데모 패널 숨기기' : '데모 패널 열기'}
        className="fixed right-3 top-3 z-[1200] rounded-full border border-town-line bg-town-paper/95 px-3 py-2 text-[12px] font-extrabold text-town-ink shadow-card transition active:scale-95"
      >
        {panelOpen ? '🎛️ 패널 숨기기' : '🎛️ 데모 패널'}
      </button>
    </div>
  );
}
