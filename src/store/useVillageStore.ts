// ─── 내 마을 스토어: 배치 + 소품 보유 ─────────────────────────────
// 원칙(기획 §4): "현실에서 얻고, 마을에 쌓인다" — 획득은 자동(방문/조우/
// 발견/구매), 배치는 수동. M4 개편: 마을이 걷는 월드가 되면서 배치가
// 타일 풋프린트(bx,by,w,h)를 갖는다. 배치 가능 여부 판정은 월드를 아는
// 엔진(villageGame)이 하고, 스토어는 기록만 담당한다.
// 기본 광장(돌바닥 21장 + 가로등 4개)도 일반 배치물로 시작한다 —
// 회수하면 보관함에 들어가고, 걷어낸 자리는 잔디가 드러난다.

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DEFAULT_LAMP_TILES, VZ, defaultPlazaTiles, type VillageZoneId } from '../lib/villageWorld';

export type PlacementKind = 'store' | 'npc' | 'landmark' | 'decor';

/** kind 별 풋프린트 크기 — 건물류는 2×2(기획 요구: 최소 2×2) */
export function footprintOf(kind: PlacementKind): { w: number; h: number } {
  if (kind === 'store' || kind === 'landmark') return { w: 2, h: 2 };
  return { w: 1, h: 1 };
}

export interface Placement {
  id: number;
  kind: PlacementKind;
  /** storeId(number)·npcId·landmarkId·decorId 문자열 표현 */
  refId: string;
  /** 풋프린트 좌상단 타일 */
  bx: number;
  by: number;
  w: number;
  h: number;
  /** 건물 방향 — sw(좌측 하단, 기본) | se(우측 하단) */
  facing?: 'sw' | 'se';
  /** 기본 마을 구성물(광장 돌바닥·가로등) — 풍성도 계산에서 제외 */
  preset?: boolean;
}

interface VillageState {
  placements: Placement[];
  /** 상점에서 구매한 소품 수량 (+ 기본 지급분) */
  decorOwned: Record<string, number>;
  /** 소유한 섬 구역 — base 는 항상 포함 (R5 섬 확장) */
  zonesOwned: VillageZoneId[];

  place: (kind: PlacementKind, refId: string, bx: number, by: number, facing?: 'sw' | 'se') => void;
  move: (placementId: number, bx: number, by: number, facing?: 'sw' | 'se') => void;
  remove: (placementId: number) => void;
  /** 배치된 모든 오브젝트를 보관함으로 회수 (획득물은 유지) */
  recallAll: () => void;
  buyDecor: (decorId: string) => void;
  /** 섬 구역 확장 — 비용 차감은 호출부(useEconomyStore.spendTokken)에서 */
  expandZone: (zone: VillageZoneId) => void;
}

let placementSeq = Date.now() % 1_000_000;

/** 기본 마을 구성 — 광장 돌바닥 21장 + 가로등 4개.
    일반 배치물이라 개별 회수·전체 회수·재배치가 모두 가능하다. */
function defaultVillagePlacements(): Placement[] {
  const spots = [
    ...defaultPlazaTiles().map(({ bx, by }) => ({ refId: 'plaza-tile', bx, by })),
    ...DEFAULT_LAMP_TILES.map(({ bx, by }) => ({ refId: 'lamp', bx, by })),
  ];
  return spots.map((s) => ({ id: ++placementSeq, kind: 'decor' as const, w: 1, h: 1, preset: true, ...s }));
}

/** 기본 배치물만큼 소품도 기본 지급 — 회수하면 보관함 수량으로 그대로 잡힌다. */
function defaultDecorOwned(): Record<string, number> {
  return { 'plaza-tile': defaultPlazaTiles().length, lamp: DEFAULT_LAMP_TILES.length };
}

export const useVillageStore = create<VillageState>()(
  persist(
    (set) => ({
      placements: defaultVillagePlacements(),
      decorOwned: defaultDecorOwned(),
      zonesOwned: ['base'],

      place: (kind, refId, bx, by, facing) => {
        const { w, h } = footprintOf(kind);
        set((s) => ({
          placements: [...s.placements, { id: ++placementSeq, kind, refId, bx, by, w, h, facing }],
        }));
      },

      move: (placementId, bx, by, facing) =>
        set((s) => ({
          placements: s.placements.map((p) =>
            p.id === placementId ? { ...p, bx, by, facing: facing ?? p.facing } : p,
          ),
        })),

      remove: (placementId) =>
        set((s) => ({ placements: s.placements.filter((p) => p.id !== placementId) })),

      recallAll: () => set({ placements: [] }),

      buyDecor: (decorId) =>
        set((s) => ({
          decorOwned: { ...s.decorOwned, [decorId]: (s.decorOwned[decorId] ?? 0) + 1 },
        })),

      expandZone: (zone) =>
        set((s) => ({
          zonesOwned: s.zonesOwned.includes(zone) ? s.zonesOwned : [...s.zonesOwned, zone],
        })),
    }),
    {
      name: 'toktown:village',
      version: 5,
      migrate: (persisted: unknown, version: number) => {
        let state = persisted as VillageState;
        if (version < 3) {
          // v1(8×8 아이소 그리드 row/col) → v2(26×26 월드 풋프린트):
          // 좌표계가 달라 배치는 초기화한다. 획득물은 방문/수집/소품 스토어에서
          // 파생되므로 아무것도 잃지 않고 보관함으로 돌아간다.
          const prev = version < 2 ? [] : state.placements ?? [];
          // v3-①: '기본 초록 타일' 폐지 — 배치·보유 모두 제거.
          const kept = prev.filter((p) => !(p.kind === 'decor' && p.refId === 'grass-tile'));
          const decorOwned = { ...(state.decorOwned ?? {}) };
          delete decorOwned['grass-tile'];
          // v3-②: 광장 돌바닥 21장·가로등 4개가 지형/고정 소품에서 기본 배치물로
          // 전환. 기존 배치가 이미 차지한 칸의 몫은 지도 대신 보관함으로 들어간다.
          for (const p of kept) placementSeq = Math.max(placementSeq, p.id);
          const occupied = new Set<string>();
          for (const p of kept) {
            for (let ty = p.by; ty < p.by + p.h; ty++) {
              for (let tx = p.bx; tx < p.bx + p.w; tx++) occupied.add(`${tx},${ty}`);
            }
          }
          // 기본 배치물은 현재(52×52) 좌표로 생성되므로, 아래 v5 시프트(+VZ)와
          // 상쇄되도록 옛(26×26) 좌표계로 되돌려 놓는다.
          const seeded = defaultVillagePlacements()
            .map((p) => ({ ...p, bx: p.bx - VZ, by: p.by - VZ }))
            .filter((p) => !occupied.has(`${p.bx},${p.by}`));
          for (const [id, n] of Object.entries(defaultDecorOwned())) {
            decorOwned[id] = (decorOwned[id] ?? 0) + n;
          }
          state = { ...state, placements: [...seeded, ...kept], decorOwned };
        }
        // v4: 이벤트 NPC id 개편 — 배치된 '드러머 까미'를 '까아미'로 통합.
        state = {
          ...state,
          placements: (state.placements ?? []).map((p) =>
            p.kind === 'npc' && p.refId === 'magpie-drummer' ? { ...p, refId: 'magpie-kkaami' } : p,
          ),
        };
        // v5: 섬 확장 — 좌표계가 52×52 로 넓어지고 기본 섬이 우하단 구역
        // (base, +VZ 오프셋)으로 이동. 기존 배치를 그대로 시프트한다.
        if (version < 5) {
          state = {
            ...state,
            placements: (state.placements ?? []).map((p) => ({ ...p, bx: p.bx + VZ, by: p.by + VZ })),
            zonesOwned: ['base'],
          };
        }
        return { ...state, zonesOwned: state.zonesOwned ?? ['base'] };
      },
    },
  ),
);
