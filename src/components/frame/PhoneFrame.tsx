// ─── 모바일 프레임 (390×844) + 프레임 밖 데모 패널 ────────────────
// 데스크톱 브라우저에서 열어도 중앙 모바일 프레임 안에 앱이 렌더링.
// 화면이 작으면 전체를 비율 축소한다.

import { type ReactNode, useEffect, useState } from 'react';

const SCREEN_W = 390;
const SCREEN_H = 844;
const BEZEL = 11;

export function PhoneFrame({ children, panel }: { children: ReactNode; panel: ReactNode }) {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const update = () => {
      const totalH = SCREEN_H + BEZEL * 2 + 40;
      const totalW = SCREEN_W + BEZEL * 2 + 340; // 패널 폭 여유 포함
      setScale(Math.min(1, window.innerHeight / totalH, window.innerWidth / totalW));
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return (
    <div className="flex h-screen items-center justify-center">
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
        <div className="w-[280px] shrink-0">{panel}</div>
      </div>
    </div>
  );
}
