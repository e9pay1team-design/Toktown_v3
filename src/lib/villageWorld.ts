// ─── 내 마을 월드 모델 (V1 프로토타입 이식) ───────────────────────
// 26×26 타일의 해안 마을. 뒤쪽(좌상단 x=0 변, 우상단 y=0 변)은 숲으로
// 막혀 있고, 앞쪽(좌하단 y=H 변, 우하단 x=W 변)은 잔잔한 바다가 감싼다.
// 지형·고정 소품은 고정 시드로 결정적으로 생성되고, 건물/소품 배치는
// useVillageStore 의 동적 데이터가 얹힌다.

/** 아이소메트릭 2:1 투영 — 타일 화면 폭/높이(px) */
export const TW = 64;
export const TH = 32;

export const VW = 26;
export const VH = 26;

const SEED = 20260813;

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
} as const;
export type VTerrainId = (typeof VT)[keyof typeof VT];

export type VPropType = 'tree' | 'pine' | 'bush' | 'flower' | 'rock' | 'lamp';

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
  /** 정적 충돌: 물·숲·고정 소품 */
  blocked: Uint8Array;
  props: VProp[];
  /** 육지와 맞닿은 물 타일 — 파도 거품 애니메이션 대상 */
  shore: Int32Array;
  spawn: { x: number; y: number };
  /** 광장 중심 타일 */
  plaza: { tx: number; ty: number };
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

const PLAZA = { tx: 9, ty: 9, r: 2.35 };

export function isVillagePlaza(tx: number, ty: number): boolean {
  return Math.hypot(tx + 0.5 - (PLAZA.tx + 0.5), ty + 0.5 - (PLAZA.ty + 0.5)) < PLAZA.r;
}

/** 광장 돌바닥 타일의 decor refId — 기본 지급·회수 가능 오브젝트 */
export const STONE_TILE = 'stone-tile';

/** 기본 광장 돌바닥 타일 21칸 — 최초 시드 배치(useVillageStore)가 사용 */
export const DEFAULT_PLAZA_TILES: { tx: number; ty: number }[] = (() => {
  const tiles: { tx: number; ty: number }[] = [];
  for (let ty = 0; ty < VH; ty++) {
    for (let tx = 0; tx < VW; tx++) {
      if (isVillagePlaza(tx, ty)) tiles.push({ tx, ty });
    }
  }
  return tiles;
})();

/** 기본 가로등 4개 자리 — 최초 시드 배치(useVillageStore)가 사용 */
export const DEFAULT_LAMP_SPOTS: { tx: number; ty: number }[] = [
  { tx: PLAZA.tx - 2, ty: PLAZA.ty },
  { tx: PLAZA.tx + 2, ty: PLAZA.ty - 2 },
  { tx: PLAZA.tx, ty: PLAZA.ty + 2 },
  { tx: PLAZA.tx + 2, ty: PLAZA.ty + 2 },
];

function isDefaultLampSpot(tx: number, ty: number): boolean {
  return DEFAULT_LAMP_SPOTS.some((s) => s.tx === tx && s.ty === ty);
}

export function buildVillageWorld(): VillageWorld {
  const terrain = new Uint8Array(VW * VH);
  const blocked = new Uint8Array(VW * VH);
  const rng = mulberry32(SEED);
  const props: VProp[] = [];
  let pid = 0;

  const addProp = (type: VPropType, x: number, y: number, blocking: boolean, v = rng()) => {
    const tx = Math.floor(x);
    const ty = Math.floor(y);
    // 기본 가로등 시드 자리는 정적 소품 없이 비워 둔다. (v 의 rng 소비는
    // 그대로 일어나므로 기존 세이브의 소품 배치 결정성이 유지된다.)
    if (isDefaultLampSpot(tx, ty)) return;
    props.push({ id: `vp${pid++}`, type, x, y, blocking, v });
    if (blocking && vinBounds(tx, ty)) blocked[vidx(tx, ty)] = 1;
  };

  // 1. 지형: 앞쪽(x=W·y=H 변) 바다 + 모래사장, 나머지 잔디.
  for (let ty = 0; ty < VH; ty++) {
    for (let tx = 0; tx < VW; tx++) {
      const frontDist = Math.min(VW - 1 - tx, VH - 1 - ty);
      const along = frontDist === VW - 1 - tx ? ty : tx;
      const sea = seaDepthAt(along);
      let t: VTerrainId;
      if (frontDist < sea) t = VT.Water;
      else if (frontDist < sea + 1.4) t = VT.Sand;
      else t = vtileHash(tx, ty) > 0.82 ? VT.GrassDark : VT.Grass;
      terrain[vidx(tx, ty)] = t;
    }
  }

  // 2. 광장 돌바닥은 지형이 아니라 회수 가능한 동적 배치물이다 —
  //    useVillageStore 가 DEFAULT_PLAZA_TILES 로 시드하고, 엔진이
  //    바닥 오버레이(VT.Path)로 그린다. 기저 지형은 잔디로 남는다.

  // 물은 못 걷는다.
  for (let i = 0; i < terrain.length; i++) {
    if (terrain[i] === VT.Water) blocked[i] = 1;
  }

  // 3. 뒤쪽 숲 벽: 좌상단(x=0 변)·우상단(y=0 변)을 나무로 막는다.
  //    벽 안쪽으로 갈수록 드문드문 — 숲 가장자리의 자연스러운 밀도 감쇠.
  for (let ty = 0; ty < VH; ty++) {
    for (let tx = 0; tx < VW; tx++) {
      const i = vidx(tx, ty);
      if (terrain[i] === VT.Water || terrain[i] === VT.Path) continue;
      const backDist = Math.min(tx, ty);
      const along = backDist === tx ? ty : tx;
      const depth = forestDepthAt(along);
      const cx = tx + 0.35 + vtileHash(tx, ty) * 0.3;
      const cy = ty + 0.35 + vtileHash(ty, tx) * 0.3;
      if (backDist < depth) {
        // 숲 벽 본체 — 전부 블로킹.
        const pine = vtileHash(tx + 7, ty + 3) < 0.35;
        addProp(pine ? 'pine' : 'tree', cx, cy, true, vtileHash(tx, ty));
      } else if (backDist < depth + 1.6 && vtileHash(tx + 11, ty + 5) < 0.3) {
        // 가장자리 감쇠 지대.
        addProp('tree', cx, cy, true, vtileHash(tx + 3, ty));
      }
    }
  }

  // 4. 기본 가로등 4개도 이제 회수 가능한 동적 배치물(DEFAULT_LAMP_SPOTS 시드).
  //    기존 세이브의 소품 배치 결정성 유지를 위해 이전 가로등 변주 롤만 소비한다.
  for (let i = 0; i < DEFAULT_LAMP_SPOTS.length; i++) rng();

  // 5. 잔여 지면에 수풀·꽃·바위 산포.
  for (let ty = 0; ty < VH; ty++) {
    for (let tx = 0; tx < VW; tx++) {
      const i = vidx(tx, ty);
      const t = terrain[i];
      if (blocked[i] || t === VT.Water || t === VT.Path) continue;
      if (isVillagePlaza(tx, ty)) continue;
      const roll = rng();
      const cx = tx + 0.5;
      const cy = ty + 0.5;
      if (t === VT.Sand) {
        if (roll < 0.05) addProp('rock', cx, cy, true);
        else if (roll < 0.08) addProp('pine', cx, cy, true);
        continue;
      }
      // 중심부는 비워 두고(배치 공간), 외곽으로 갈수록 조금씩.
      const centerDist = Math.hypot(tx - PLAZA.tx, ty - PLAZA.ty);
      if (centerDist < 4) {
        if (roll < 0.1) addProp('flower', cx, cy, false);
        continue;
      }
      if (roll < 0.045) addProp('bush', cx, cy, true);
      else if (roll < 0.135) addProp('flower', cx, cy, false);
      else if (roll < 0.155) addProp('rock', cx, cy, true);
    }
  }

  // 6. 파도 거품 대상 해안 타일.
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
        return vinBounds(nx, ny) && terrain[vidx(nx, ny)] !== VT.Water;
      });
      if (touchesLand) shore.push(vidx(tx, ty));
    }
  }

  return {
    terrain,
    blocked,
    props,
    shore: Int32Array.from(shore),
    spawn: { x: PLAZA.tx + 0.5, y: PLAZA.ty + 3.5 },
    plaza: { tx: PLAZA.tx, ty: PLAZA.ty },
  };
}

/** 배치 판정용 아이템 구분 — floor: 광장 돌바닥 타일, small: 1×1 소품·NPC, building: 2×2 건물·랜드마크 */
export type FootprintItem = 'floor' | 'small' | 'building';

/**
 * 동적 배치의 풋프린트가 이 자리(bx,by,w,h)에 들어갈 수 있는가.
 * occupiedDyn 은 다른 오브젝트 점유(돌바닥 타일 제외), floor 는 돌바닥
 * 타일이 깔린 칸. 소형(1×1) 오브젝트만 돌바닥 위 배치를 허용한다 —
 * 건물·랜드마크는 광장 밖 맨 잔디에만.
 */
export function canPlaceFootprint(
  world: VillageWorld,
  occupiedDyn: Set<number>,
  bx: number,
  by: number,
  w: number,
  h: number,
  opts?: { floor?: Set<number>; item?: FootprintItem },
): boolean {
  const floor = opts?.floor;
  const item = opts?.item ?? (w >= 2 || h >= 2 ? 'building' : 'small');
  for (let ty = by; ty < by + h; ty++) {
    for (let tx = bx; tx < bx + w; tx++) {
      if (!vinBounds(tx, ty)) return false;
      const i = vidx(tx, ty);
      const t = world.terrain[i];
      const grassy = t === VT.Grass || t === VT.GrassDark;
      const onFloor = floor?.has(i) ?? false;
      if (item === 'small') {
        if (!grassy && !onFloor) return false;
      } else {
        // 돌바닥 타일 자신·건물류 — 다른 타일이 깔리지 않은 맨 잔디에만.
        if (!grassy || onFloor) return false;
      }
      if (world.blocked[i] || occupiedDyn.has(i)) return false;
    }
  }
  // 건물(2칸 이상)은 문 앞 한 칸이 걸을 수 있어야 입장 연출이 산다.
  if (w >= 2) {
    const doorTx = bx + Math.floor(w / 2);
    const doorTy = by + h;
    if (!vinBounds(doorTx, doorTy)) return false;
    const di = vidx(doorTx, doorTy);
    if (world.blocked[di] || occupiedDyn.has(di) || world.terrain[di] === VT.Water) return false;
  }
  return true;
}
