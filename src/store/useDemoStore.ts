// ─── 데모 패널 ↔ 앱 프레임 간 공유 상태 ──────────────────────────

import { create } from 'zustand';

interface DemoState {
  /** '지도 클릭으로 이동' 모드 — 켜져 있으면 다음 지도 클릭이 순간이동 */
  clickTeleportArmed: boolean;
  setClickTeleportArmed: (v: boolean) => void;
}

export const useDemoStore = create<DemoState>((set) => ({
  clickTeleportArmed: false,
  setClickTeleportArmed: (v) => set({ clickTeleportArmed: v }),
}));
