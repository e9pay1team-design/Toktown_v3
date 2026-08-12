// ─── 게임 로직 유틸 ───────────────────────────────────────────────

import type { NpcSpot, RegionalNpc } from '../types';

/**
 * NPC 출몰 지점 로테이션: 하루 2지점 랜덤 활성 (기획 §7).
 * 날짜 기반 결정적 선택 — M2의 '날짜 +1' 컨트롤이 dayOffset 을 올리면
 * 지점이 로테이션되는 것을 시연할 수 있다.
 */
export function activeNpcSpots(npc: RegionalNpc, dayOffset = 0): NpcSpot[] {
  const day = Math.floor(Date.now() / 86_400_000) + dayOffset;
  const n = npc.spots.length;
  if (n <= 2) return npc.spots;
  const first = day % n;
  const second = (first + 1 + (day % (n - 1))) % n;
  return [npc.spots[first], npc.spots[second === first ? (second + 1) % n : second]];
}
