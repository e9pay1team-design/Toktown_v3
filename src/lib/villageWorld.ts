// ─── 내 마을 월드 모델 (V1 프로토타입 이식 + R5 섬 확장) ──────────
// 기본 섬은 26×26 해안 마을. R5: 좌표계를 52×52 로 넓혀 정사각형 4개가
// 마름모로 붙는 확장형 섬이 됐다 — base(우하단, 시작 구역)에 west(좌상단),
// north(우상단), peak(꼭대기)를 톡큰으로 사서 잇는다. 소유하지 않은 구역은
// Void 지형(렌더 생략·통행 불가)이고, 해안선/뒷숲 벽은 소유 구역의 합집합
// 경계를 따라 다시 감긴다. 지형·고정 소품은 타일 해시로 결정적으로 생성돼
// 확장 후에도 기존 구역 모습이 그대로 유지된다.

/** 아이소메트릭 2:1 투영 — 타일 화면 폭/높이(px) */
export const TW = 64;
export const TH = 32;

/** 확장 구역 한 변 (기존 기본 섬 크기) */
export const VZ = 26;
/** 전체 좌표계 = 2×2 구역 */
export const VW = VZ * 2;
export const VH = VZ * 2;

const SEED = 20260813;

// ─── 확장 구역 ────────────────────────────────────────────────────

/** base = 우하단 시작 구역. west = 화면 좌상단, north = 화면 우상단,
    peak = 꼭대기(둘 다 산 뒤) — 아이소메트릭에서 -x 가 좌상, -y 가 우상. */
export type VillageZoneId = 'base' | 'west' | 'north' | 'peak';

export const ZONE_IDS: readonly VillageZoneId[] = ['base', 'west', 'north', 'peak'];

/** 구역 원점(타일 사각형 좌상단) */
export function zoneOrigin(zone: VillageZoneId): { x0: number; y0: number } {
  switch (zone) {
    case 'base':
      return { x0: VZ, y0: VZ };
    case 'west':
      return { x0: 0, y0: VZ };
    case 'north':
      return { x0: VZ, y0: 0 };
    case 'peak':
      return { x0: 0, y0: 0 };
  }
}

export function zoneOfTile(tx: number, ty: number): VillageZoneId {
  if (tx < VZ && ty < VZ) return 'peak';
  if (tx < VZ) return 'west';
  if (ty < VZ) return 'north';
  return 'base';
}

/** 확장 비용 — 순서 기준(방향 무관): 첫 200, 둘째 500, 마지막 800 톡큰 */
export const ZONE_EXPANSION_COSTS = [200, 500, 800] as const;

/** 다음 확장 비용 (ownedCount = base 포함 현재 소유 구역 수) */
export function nextExpansionCost(ownedCount: number): number {
  return ZONE_EXPANSION_COSTS[Math.min(ownedCount - 1, ZONE_EXPANSION_COSTS.length - 1)];
}

/** 구역 구매 가능 여부 — 양옆(west·north)은 언제든, 꼭대기는 양옆을 이은 뒤 */
export function zoneAvailable(zone: VillageZoneId, owned: readonly VillageZoneId[]): boolean {
  if (zone === 'base' || owned.includes(zone)) return false;
  if (zone === 'peak') return owned.includes('west') && owned.includes('north');
  return true;
}

// ─── 투영/지형 기본 ───────────────────────────────────────────────

export function toScreen(x: number, y: number): { sx: number; sy: number } {
  return { sx: (x - y) * (TW / 2), sy: (x + y) * (TH / 2) };
}

export function toWorld(sx: number, sy: number): { x: number; y: number } {
  const a = sx / (TW / 2);
  const b = sy / (TH / 2);
  return { x: (b + a) / 2, y: (b - a) / 2 };
}

export const VT = {
  Water: 0,
  Sand: 1,
  Grass: 2,
  GrassDark: 3,
  Path: 4,
  /** 미소유 구역 — 렌더 생략, 통행 불가 */
  Void: 5,
} as const;
export type VTerrainId = (typeof VT)[keyof typeof VT];

export type VPropType =
  | 'tree'
  | 'pine'
  | 'bush'
  | 'flower'
  | 'rock'
  | 'lamp'
  | 'darktree'
  | 'darkpine'
  | 'tent'
  | 'campfire'
  | 'woodswing'
  | 'stump'
  | 'telescope'
  | 'falls-mountain'
  | 'ridgehill';

export interface VProp {
  id: string;
  type: VPropType;
  x: number;
  y: number;
  blocking: boolean;
  /** 개체 변형 시드 0..1 */
  v: number;
}

export interface VillageWorld {
  terrain: Uint8Array;
  /** 정적 충돌: 물·숲·고정 소품 + 미소유 구역 */
  blocked: Uint8Array;
  props: VProp[];
  /** 육지와 맞닿은 물 타일 — 파도 거품 애니메이션 대상 */
  shore: Int32Array;
  spawn: { x: number; y: number };
  /** 광장 중심 타일 */
  plaza: { tx: number; ty: number };
  /** 이 월드를 만든 소유 구역 집합 */
  zones: VillageZoneId[];
  /** 소유 구역을 감싸는 타일 사각형 — 카메라 클램프·스냅샷 프레이밍용 */
  bounds: { x0: number; y0: number; x1: number; y1: number };
}

export function vidx(tx: number, ty: number): number {
  return ty * VW + tx;
}

export function vinBounds(tx: number, ty: number): boolean {
  return tx >= 0 && ty >= 0 && tx < VW && ty < VH;
}

function mulberry32(a: number): () => number {
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** 타일별 고정 해시 — 지형 변주용 */
export function vtileHash(tx: number, ty: number): number {
  let h = (tx * 374761393 + ty * 668265263) ^ SEED;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

/** 앞쪽 바다 깊이 — 물결치는 해안선 */
function seaDepthAt(along: number): number {
  return 2.1 + 0.9 * Math.sin(along * 0.55 + 1.3) + 0.5 * Math.sin(along * 1.21 + 4.2);
}

/** 뒤쪽 숲 두께 */
function forestDepthAt(along: number): number {
  return 2.2 + 0.8 * Math.sin(along * 0.47 + 0.6) + 0.5 * Math.sin(along * 1.07 + 2.9);
}

const PLAZA = { tx: VZ + 9, ty: VZ + 9, r: 2.35 };

export function isVillagePlaza(tx: number, ty: number): boolean {
  return Math.hypot(tx + 0.5 - (PLAZA.tx + 0.5), ty + 0.5 - (PLAZA.ty + 0.5)) < PLAZA.r;
}

export function buildVillageWorld(zonesIn: readonly VillageZoneId[] = ['base']): VillageWorld {
  const zones = ZONE_IDS.filter((z) => z === 'base' || zonesIn.includes(z));
  const ownedZone = new Set(zones);
  const owned = (tx: number, ty: number): boolean =>
    vinBounds(tx, ty) && ownedZone.has(zoneOfTile(tx, ty));

  const terrain = new Uint8Array(VW * VH);
  const blocked = new Uint8Array(VW * VH);
  const rng = mulberry32(SEED);
  const props: VProp[] = [];
  let pid = 0;

  const addProp = (type: VPropType, x: number, y: number, blocking: boolean, v = rng()) => {
    props.push({ id: `vp${pid++}`, type, x, y, blocking, v });
    const tx = Math.floor(x);
    const ty = Math.floor(y);
    if (blocking && vinBounds(tx, ty)) blocked[vidx(tx, ty)] = 1;
  };

  // 소유 합집합 경계까지의 거리 — 구역이 사분면 정렬이라 해석적으로 구한다.
  // front(+x/+y) 쪽 경계에 바다가, back(-x/-y) 쪽 경계에 숲이 감긴다.
  const frontXEnd = (tx: number, ty: number) => (tx < VZ && !owned(VZ, ty) ? VZ - 1 : VW - 1);
  const frontYEnd = (tx: number, ty: number) => (ty < VZ && !owned(tx, VZ) ? VZ - 1 : VH - 1);
  const backXStart = (tx: number, ty: number) => (tx >= VZ && !owned(VZ - 1, ty) ? VZ : 0);
  const backYStart = (tx: number, ty: number) => (ty >= VZ && !owned(tx, VZ - 1) ? VZ : 0);

  // 1. 지형: 소유 구역의 앞쪽 경계에 바다 + 모래사장, 나머지 잔디.
  for (let ty = 0; ty < VH; ty++) {
    for (let tx = 0; tx < VW; tx++) {
      if (!owned(tx, ty)) {
        terrain[vidx(tx, ty)] = VT.Void;
        blocked[vidx(tx, ty)] = 1;
        continue;
      }
      const fx = frontXEnd(tx, ty) - tx;
      const fy = frontYEnd(tx, ty) - ty;
      const frontDist = Math.min(fx, fy);
      const along = frontDist === fx ? ty : tx;
      const sea = seaDepthAt(along);
      const zone = zoneOfTile(tx, ty);
      // 구역 변주(R6): 별보기 언덕은 모래모래한 지형(넓고 들쭉날쭉한 백사장
      // + 내륙 모래 얼룩), 뒷숲 캠프는 잔디가 짙다.
      const sandBand =
        zone === 'north'
          ? sea + 6.8 + (vtileHash(tx + 21, ty + 13) - 0.5) * 2.6
          : sea + 1.4;
      const darkBias = zone === 'west' ? 0.7 : 0.82;
      let t: VTerrainId;
      if (frontDist < sea) t = VT.Water;
      else if (frontDist < sandBand) t = VT.Sand;
      else if (zone === 'north' && vtileHash(tx + 3, ty + 9) > 0.88) t = VT.Sand;
      else t = vtileHash(tx, ty) > darkBias ? VT.GrassDark : VT.Grass;
      terrain[vidx(tx, ty)] = t;
    }
  }

  // 광장 돌바닥·가로등은 지형/고정 소품이 아니라 '회수 가능한 기본 배치물'
  // 이다(useVillageStore 기본 상태, defaultPlazaTiles/DEFAULT_LAMP_TILES).
  // 걷어내면 아래 잔디가 드러난다.

  // 물은 못 걷는다.
  for (let i = 0; i < terrain.length; i++) {
    if (terrain[i] === VT.Water) blocked[i] = 1;
  }

  // 2. 뒤쪽 숲 벽: 소유 합집합의 뒤쪽(-x/-y) 경계를 나무로 막는다.
  //    벽 안쪽으로 갈수록 드문드문 — 숲 가장자리의 자연스러운 밀도 감쇠.
  for (let ty = 0; ty < VH; ty++) {
    for (let tx = 0; tx < VW; tx++) {
      const i = vidx(tx, ty);
      if (terrain[i] === VT.Water || terrain[i] === VT.Void) continue;
      const zone = zoneOfTile(tx, ty);
      // 구름마루 폭포 산 자리는 나무 대신 산이 선다.
      if (
        zone === 'peak' &&
        tx >= PEAK_FALLS_RECT.x0 && tx < PEAK_FALLS_RECT.x1 &&
        ty >= PEAK_FALLS_RECT.y0 && ty < PEAK_FALLS_RECT.y1
      ) {
        continue;
      }
      // 개간 포켓 — 캠프촌(서쪽 끝)·난파선 포구(동쪽 끝)는 숲을 치운다.
      if (
        ownedZone.has('west') &&
        tx >= CAMP_RECT.x0 && tx < CAMP_RECT.x1 &&
        ty >= CAMP_RECT.y0 && ty < CAMP_RECT.y1
      ) {
        continue;
      }
      if (
        ownedZone.has('north') &&
        tx >= NORTH_POCKET_RECT.x0 && tx < NORTH_POCKET_RECT.x1 &&
        ty >= NORTH_POCKET_RECT.y0 && ty < NORTH_POCKET_RECT.y1
      ) {
        continue;
      }
      const bxd = tx - backXStart(tx, ty);
      const byd = ty - backYStart(tx, ty);
      const backDist = Math.min(bxd, byd);
      const along = backDist === bxd ? ty : tx;
      const depth = forestDepthAt(along);
      const cx = tx + 0.35 + vtileHash(tx, ty) * 0.3;
      const cy = ty + 0.35 + vtileHash(ty, tx) * 0.3;
      // 뒷숲 캠프(west)는 침엽 위주의 어두운 숲, 구름마루(peak)는 언덕
      // 능선이 섞여 폭포 산에서 산맥이 이어지는 느낌으로 변주.
      const dark = zone === 'west';
      const ridge = zone === 'peak';
      if (backDist < depth) {
        // 숲 벽 본체 — 전부 블로킹.
        if (ridge && vtileHash(tx + 5, ty + 11) < 0.34) {
          addProp('ridgehill', cx, cy, true, vtileHash(tx, ty));
        } else {
          const pineBias = dark ? 0.62 : ridge ? 0.72 : 0.35;
          const pine = vtileHash(tx + 7, ty + 3) < pineBias;
          const kind = dark ? (pine ? 'darkpine' : 'darktree') : pine ? 'pine' : 'tree';
          addProp(kind as VPropType, cx, cy, true, vtileHash(tx, ty));
        }
      } else if (backDist < depth + 1.6 && vtileHash(tx + 11, ty + 5) < 0.3) {
        // 가장자리 감쇠 지대 — 구름마루는 낮은 언덕이 드문드문 이어진다.
        const kind = ridge ? 'ridgehill' : dark ? 'darktree' : 'tree';
        addProp(kind as VPropType, cx, cy, true, vtileHash(tx + 3, ty));
      }
    }
  }

  // 2.5 구역 테마 고정물 (R6) — 전부 가장자리 개간 포켓에 몰아 배치해
  // 마을 가운데 동선을 막지 않는다.
  // 뒷숲 캠프(서쪽 끝): 텐트·모닥불·나무 그네·그루터기 캠프촌.
  if (ownedZone.has('west')) {
    const camp: Array<[VPropType, number, number, boolean]> = [
      ['tent', 1.6, 39.4, true],
      ['campfire', 3.6, 41.1, true],
      ['woodswing', 1.7, 43.2, true],
      ['stump', 4.5, 39.2, true],
      ['stump', 3.4, 43.9, false],
    ];
    for (const [type, cx, cy, blockIt] of camp) {
      const i = vidx(Math.floor(cx), Math.floor(cy));
      if (!blocked[i] && terrain[i] !== VT.Water) addProp(type, cx, cy, blockIt, vtileHash(Math.floor(cx), Math.floor(cy)));
    }
  }
  // 구름마루: 폭포 산 — 영역을 통째로 막고 산 아트 하나를 세운다.
  if (ownedZone.has('peak')) {
    for (let ty = PEAK_FALLS_RECT.y0; ty < PEAK_FALLS_RECT.y1; ty++) {
      for (let tx = PEAK_FALLS_RECT.x0; tx < PEAK_FALLS_RECT.x1; tx++) {
        blocked[vidx(tx, ty)] = 1;
      }
    }
    props.push({
      id: `vp${pid++}`,
      type: 'falls-mountain',
      x: (PEAK_FALLS_RECT.x0 + PEAK_FALLS_RECT.x1) / 2,
      y: (PEAK_FALLS_RECT.y0 + PEAK_FALLS_RECT.y1) / 2 + 0.4,
      blocking: false,
      v: 0.5,
    });
  }
  // 별보기 언덕(동쪽 끝 포켓): 백사장 망원경 포인트 — 난파선 곁.
  if (ownedZone.has('north')) {
    const i = vidx(44, 4);
    if (!blocked[i] && terrain[i] !== VT.Water) addProp('telescope', 44.6, 4.6, false, 0.3);
  }

  // 3. 잔여 지면에 수풀·꽃·바위 산포 — 타일 해시 기반이라 확장으로 월드를
  //    다시 지어도 기존 구역 배치가 흔들리지 않는다. 광장 원판은 비워 둔다.
  for (let ty = 0; ty < VH; ty++) {
    for (let tx = 0; tx < VW; tx++) {
      const i = vidx(tx, ty);
      const t = terrain[i];
      if (blocked[i] || t === VT.Water || t === VT.Void) continue;
      if (isVillagePlaza(tx, ty)) continue;
      // 난파선 풋프린트 주변 모래엔 바위·솔을 두지 않는다 (합성 배치물 자리).
      if (
        ownedZone.has('north') &&
        tx >= WRECK_TILE.bx - 1 && tx < WRECK_TILE.bx + WRECK_TILE.w + 1 &&
        ty >= WRECK_TILE.by - 1 && ty < WRECK_TILE.by + WRECK_TILE.h + 1
      ) {
        continue;
      }
      const roll = vtileHash(tx + 17, ty + 29);
      const cx = tx + 0.5;
      const cy = ty + 0.5;
      if (t === VT.Sand) {
        if (roll < 0.05) addProp('rock', cx, cy, true, vtileHash(tx + 5, ty + 1));
        else if (roll < 0.08) addProp('pine', cx, cy, true, vtileHash(tx + 9, ty + 2));
        continue;
      }
      // 잔디(초록 타일) 위에는 이동을 막는 돌·수풀을 두지 않는다 —
      // 노는 공간과 배치 공간을 넓게, 장식은 비충돌 꽃만.
      const centerDist = Math.hypot(tx - PLAZA.tx, ty - PLAZA.ty);
      if (centerDist < 4) {
        if (roll < 0.1) addProp('flower', cx, cy, false, vtileHash(tx + 13, ty + 7));
        continue;
      }
      if (roll < 0.135) addProp('flower', cx, cy, false, vtileHash(tx + 13, ty + 7));
    }
  }

  // 4. 파도 거품 대상 해안 타일 (Void 는 육지가 아니다).
  const shore: number[] = [];
  for (let ty = 0; ty < VH; ty++) {
    for (let tx = 0; tx < VW; tx++) {
      if (terrain[vidx(tx, ty)] !== VT.Water) continue;
      const touchesLand = [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
        [1, 1],
        [-1, -1],
        [1, -1],
        [-1, 1],
      ].some(([dx, dy]) => {
        const nx = tx + dx;
        const ny = ty + dy;
        if (!vinBounds(nx, ny)) return false;
        const nt = terrain[vidx(nx, ny)];
        return nt !== VT.Water && nt !== VT.Void;
      });
      if (touchesLand) shore.push(vidx(tx, ty));
    }
  }

  // 소유 구역 타일 사각형.
  const bounds = {
    x0: ownedZone.has('west') || ownedZone.has('peak') ? 0 : VZ,
    y0: ownedZone.has('north') || ownedZone.has('peak') ? 0 : VZ,
    x1: VW,
    y1: VH,
  };

  return {
    terrain,
    blocked,
    props,
    shore: Int32Array.from(shore),
    spawn: { x: PLAZA.tx + 0.5, y: PLAZA.ty + 3.5 },
    plaza: { tx: PLAZA.tx, ty: PLAZA.ty },
    zones,
    bounds,
  };
}

/** 기본 광장 돌바닥 타일 자리 — 광장 원판 21칸. 회수 가능한 기본 배치물의 시드. */
export function defaultPlazaTiles(): { bx: number; by: number }[] {
  const tiles: { bx: number; by: number }[] = [];
  for (let ty = 0; ty < VH; ty++) {
    for (let tx = 0; tx < VW; tx++) {
      if (isVillagePlaza(tx, ty)) tiles.push({ bx: tx, by: ty });
    }
  }
  return tiles;
}

/** 기본 가로등 4개 자리 (밤 조명 포인트) — 역시 회수 가능한 기본 배치물 */
export const DEFAULT_LAMP_TILES: ReadonlyArray<{ bx: number; by: number }> = [
  { bx: PLAZA.tx - 2, by: PLAZA.ty },
  { bx: PLAZA.tx + 2, by: PLAZA.ty - 2 },
  { bx: PLAZA.tx, by: PLAZA.ty + 2 },
  { bx: PLAZA.tx + 2, by: PLAZA.ty + 2 },
];

// ─── 구역 테마 고정물 (R6) ────────────────────────────────────────

/** 별보기 언덕 — 맨 우측(동쪽 끝) 숲을 치운 포켓에 난파선·망원경을 몬다 */
export const WRECK_TILE = { bx: 46, by: 1, w: 2, h: 2 } as const;
export const WRECK_THING_ID = -101;
export const WRECK_RESTORE_COST = 300;
/** 표류물 — 5시간마다 15 톡큰 */
export const WRECK_SALVAGE = 15;
export const WRECK_COOLDOWN_MS = 5 * 60 * 60 * 1000;
/** 별보기 언덕 동쪽 끝 개간 포켓 (숲 벽 생략 영역) */
export const NORTH_POCKET_RECT = { x0: 43, y0: 0, x1: 51, y1: 7 } as const;
/** 구름마루 폭포 전망 지점 (상호작용 → 마을 전경 컷신) */
export const FALLS_VIEW_TILE = { bx: 4, by: 7 } as const;
export const FALLS_THING_ID = -102;
/** 구름마루 폭포 산 — 맨 위 꼭짓점 숲을 치우고 그 자리에 선다 */
export const PEAK_FALLS_RECT = { x0: 0, y0: 0, x1: 7, y1: 7 } as const;
/** 뒷숲 캠프 — 맨 좌측(서쪽 끝) 숲을 치운 개간 포켓 */
export const CAMP_RECT = { x0: 0, y0: 37, x1: 7, y1: 45 } as const;

/** 오늘의 네잎클로버 타일 — 소유 구역의 걷을 수 있는 잔디 중 하루 고정 랜덤.
    occupied(동적 배치 풋프린트)를 빼서 건물 밑에 숨지 않게 한다. */
export function pickCloverTile(
  world: VillageWorld,
  day: number,
  occupied?: ReadonlySet<number>,
): { tx: number; ty: number } | null {
  const candidates: number[] = [];
  for (let i = 0; i < world.terrain.length; i++) {
    const t = world.terrain[i];
    if ((t === VT.Grass || t === VT.GrassDark) && !world.blocked[i] && !occupied?.has(i)) {
      candidates.push(i);
    }
  }
  if (candidates.length === 0) return null;
  let h = (day * 2654435761) ^ 0x9e3779b9;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  const idx = ((h ^ (h >>> 16)) >>> 0) % candidates.length;
  const i = candidates[idx];
  return { tx: i % VW, ty: Math.floor(i / VW) };
}

export interface PlaceOpts {
  /** 건물 방향 — 문 앞 보행 칸 판정에 사용 (기본 sw = 좌측 하단) */
  doorFacing?: 'sw' | 'se';
  /** 문 앞 판정 전용 점유 집합 — 걸을 수 있는 바닥 타일을 뺀 것. 없으면 occupiedDyn 사용 */
  doorOccupied?: Set<number>;
}

/** 동적 배치의 풋프린트가 이 자리(bx,by,w,h)에 들어갈 수 있는가 */
export function canPlaceFootprint(
  world: VillageWorld,
  occupiedDyn: Set<number>,
  bx: number,
  by: number,
  w: number,
  h: number,
  opts: PlaceOpts = {},
): boolean {
  for (let ty = by; ty < by + h; ty++) {
    for (let tx = bx; tx < bx + w; tx++) {
      if (!vinBounds(tx, ty)) return false;
      const i = vidx(tx, ty);
      const t = world.terrain[i];
      if (t !== VT.Grass && t !== VT.GrassDark) return false;
      if (world.blocked[i] || occupiedDyn.has(i)) return false;
    }
  }
  // 건물(2칸 이상)은 문 앞 한 칸이 걸을 수 있어야 입장 연출이 산다.
  // 바닥 타일처럼 걸을 수 있는 배치물은 문 앞을 막은 것으로 치지 않는다.
  if (w >= 2) {
    const se = opts.doorFacing === 'se';
    const doorTx = se ? bx + w : bx + Math.floor(w / 2);
    const doorTy = se ? by + Math.floor(h / 2) : by + h;
    if (!vinBounds(doorTx, doorTy)) return false;
    const di = vidx(doorTx, doorTy);
    const doorOcc = opts.doorOccupied ?? occupiedDyn;
    if (world.blocked[di] || doorOcc.has(di) || world.terrain[di] === VT.Water) return false;
  }
  return true;
}
