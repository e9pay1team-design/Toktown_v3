// ─── 내 마을 월드 캔버스 (React ↔ 엔진 브리지) ────────────────────
// 월드는 1회 생성해 재사용하고, 스토어 상태(배치·도감·프로필)가 바뀔
// 때마다 엔진에 흘려보낸다. 렌더/입력/AI 는 VillageGame 이 rAF 로 돌고,
// React 는 캔버스 생명주기·데이터 동기화·배치 모드 토글만 담당한다.

import { useEffect, useMemo, useRef } from 'react';
import {
  buildVillageWorld,
  FALLS_THING_ID,
  FALLS_VIEW_TILE,
  nextExpansionCost,
  pickCloverTile,
  vidx,
  vinBounds,
  WRECK_THING_ID,
  WRECK_TILE,
  zoneAvailable,
  type VillageZoneId,
} from '../../lib/villageWorld';
import {
  GROUND_DECOR,
  VillageGame,
  type EditMeta,
  type LockedZoneSign,
  type PlacedThing,
  type VillagerDef,
  type VInteractTarget,
} from '../../lib/villageGame';
import { CATEGORY_SKINS, CATEGORY_EMOJI, type VCharSkin } from '../../lib/villageDraw';
import { regionalNpcSkin, residentNpcs, villageRichness, zoneNpcs, ZONE_INFO } from '../../data/villageNpcs';
import { DECOR_ITEMS, LANDMARKS, regionalNpcById, storeById } from '../../data/seed';
import { SKIN_TONES, HAIR_COLORS, OUTFIT_COLORS, shade } from '../../assets/characterParts';
import { wardrobeById } from '../../data/wardrobe';
import { useVillageStore, footprintOf, type Placement, type PlacementKind } from '../../store/useVillageStore';
import { useCollectionStore } from '../../store/useCollectionStore';
import { useProfileStore } from '../../store/useProfileStore';
import { useQuestStore } from '../../store/useQuestStore';
import { useVirtualClock, virtualDayIndex } from '../../mock/clock';
import { decorName, lmName, sName, tr, useLang } from '../../i18n';

/** 소유 구역 조합별 월드 캐시 — 같은 조합이면 항상 동일한 월드 */
const worldCache = new Map<string, ReturnType<typeof buildVillageWorld>>();
function worldFor(zones: readonly VillageZoneId[]): ReturnType<typeof buildVillageWorld> {
  const key = [...zones].sort().join(',');
  let w = worldCache.get(key);
  if (!w) {
    w = buildVillageWorld(zones);
    worldCache.set(key, w);
  }
  return w;
}

export function playerSkinFromProfile(): VCharSkin {
  const profile = useProfileStore.getState().profile;
  const c = profile?.character ?? { skin: 0, hairStyle: 0, hairColor: 0, outfit: 0, outfitColor: 0 };
  const fur = SKIN_TONES[c.skin] ?? SKIN_TONES[0];
  // 워드로브 장착 파츠 — 치비 캔버스에는 색/형태 힌트로 반영.
  const top = wardrobeById(c.top);
  const bottom = wardrobeById(c.bottom);
  const shoes = wardrobeById(c.shoes);
  const paint = wardrobeById(c.facePaint);
  const premium = wardrobeById(c.premiumHair)?.id.replace('hair-', '') as VCharSkin['premiumHair'];
  const body = top ? top.color : OUTFIT_COLORS[c.outfitColor] ?? OUTFIT_COLORS[0];
  return {
    body,
    bodyDark: shade(body, 0.22),
    fur,
    furDark: shade(fur, 0.18),
    hair: HAIR_COLORS[c.hairColor] ?? HAIR_COLORS[0],
    hairStyle: c.hairStyle,
    ear: 'none',
    premiumHair: premium,
    outfitKind: c.outfit,
    topId: top?.id,
    topAccent: top?.accent,
    bottomId: bottom?.id,
    bottomColor: bottom?.color,
    bottomAccent: bottom?.accent,
    shoeColor: shoes?.color,
    faceColor: paint?.color,
    faceAccent: paint?.accent,
  };
}

/** 보관함 아이템 → 엔진 편집 메타 (렌더 정보 포함) */
export function trayMetaFor(kind: PlacementKind, refId: string, label: string): EditMeta {
  const { w, h } = footprintOf(kind);
  if (kind === 'store') {
    const store = storeById(Number(refId));
    return {
      kind,
      refId,
      w,
      h,
      label,
      emoji: store ? CATEGORY_EMOJI[store.category] : '🏪',
      skin: store ? CATEGORY_SKINS[store.category] : undefined,
      cat: store?.category,
      facing: 'sw',
    };
  }
  if (kind === 'landmark') return { kind, refId, w, h, label, lmId: refId, facing: 'sw' };
  if (kind === 'npc')
    return { kind, refId, w, h, label, npcSkin: regionalNpcSkin(refId) };
  // 상점 '꽃 화단'(flower)은 야생 들꽃(flower)과 다른 플랜터 박스로 그린다.
  return { kind, refId, w, h, label, decorType: refId === 'tree' ? 'maple' : refId === 'flower' ? 'flowerbed' : refId };
}

function thingsFromPlacements(placements: Placement[]): PlacedThing[] {
  const things: PlacedThing[] = [];
  for (const p of placements) {
    if (p.kind === 'store') {
      const store = storeById(Number(p.refId));
      if (!store) continue;
      things.push({
        id: p.id,
        kind: 'store',
        bx: p.bx,
        by: p.by,
        w: p.w,
        h: p.h,
        label: sName(store),
        emoji: CATEGORY_EMOJI[store.category],
        skin: CATEGORY_SKINS[store.category],
        cat: store.category,
        facing: p.facing,
        blocking: true,
      });
    } else if (p.kind === 'landmark') {
      const lm = LANDMARKS.find((l) => l.id === p.refId);
      things.push({
        id: p.id,
        kind: 'landmark',
        bx: p.bx,
        by: p.by,
        w: p.w,
        h: p.h,
        label: lm ? lmName(lm) : p.refId,
        lmId: p.refId,
        facing: p.facing,
        blocking: true,
      });
    } else if (p.kind === 'decor') {
      const item = DECOR_ITEMS.find((d) => d.id === p.refId);
      things.push({
        id: p.id,
        kind: 'decor',
        bx: p.bx,
        by: p.by,
        w: p.w,
        h: p.h,
        label: item ? decorName(item) : p.refId,
        // 상점의 '단풍나무'는 숲 나무와, '꽃 화단'은 야생 들꽃과 다르게 그린다.
        decorType: p.refId === 'tree' ? 'maple' : p.refId === 'flower' ? 'flowerbed' : p.refId,
        variant: p.variant,
        // 1×1 소품은 히트박스 없음 — 캐릭터/주민이 끼지 않는다.
        blocking: false,
      });
    } else if (p.kind === 'npc') {
      const src = regionalNpcById(p.refId);
      // 걷기 모드에선 배회 주민으로 그려지고, 배치 모드에서만 정적 표시.
      things.push({
        id: p.id,
        kind: 'npc',
        bx: p.bx,
        by: p.by,
        w: p.w,
        h: p.h,
        label: tr(src.name, src.nameEn ?? src.name),
        npcSkin: regionalNpcSkin(p.refId),
        blocking: false,
      });
    }
  }
  return things;
}

/** 구역 테마 합성 배치물 (R6) — 스토어에 없는 고정 상호작용물.
    음수 id 라 편집 모드에서 선택·이동·회수되지 않는다. */
function zoneSyntheticThings(zones: readonly VillageZoneId[], wreckRestored: boolean): PlacedThing[] {
  const things: PlacedThing[] = [];
  if (zones.includes('north')) {
    things.push({
      id: WRECK_THING_ID,
      kind: 'decor',
      bx: WRECK_TILE.bx,
      by: WRECK_TILE.by,
      w: WRECK_TILE.w,
      h: WRECK_TILE.h,
      label: wreckRestored ? tr('복구된 범선', 'Restored Ship') : tr('난파선', 'Shipwreck'),
      decorType: wreckRestored ? 'shipwreck-fixed' : 'shipwreck',
      blocking: true,
    });
  }
  if (zones.includes('peak')) {
    things.push({
      id: FALLS_THING_ID,
      kind: 'decor',
      bx: FALLS_VIEW_TILE.bx,
      by: FALLS_VIEW_TILE.by,
      w: 1,
      h: 1,
      label: tr('무지개 폭포', 'Rainbow Falls'),
      decorType: 'falls-view',
      blocking: false,
    });
  }
  return things;
}

function villagersFromState(
  placements: Placement[],
  dexCount: number,
  lmCount: number,
  zones: readonly VillageZoneId[],
  plaza: { tx: number; ty: number },
): VillagerDef[] {
  // 기본 광장 구성물(preset)·바닥 타일은 풍성도에 세지 않는다 — VillageScreen 과 같은 규칙.
  const richness = villageRichness(
    placements.filter((p) => !p.preset && !(p.kind === 'decor' && GROUND_DECOR.has(p.refId))).length,
    dexCount,
    lmCount,
  );
  const defs: VillagerDef[] = residentNpcs(richness).map((n) => ({
    id: n.id,
    name: tr(n.name, n.nameEn),
    skin: n.skin,
    anchor: {
      x: plaza.tx + 0.5 + n.anchorOffset.x,
      y: plaza.ty + 0.5 + n.anchorOffset.y,
    },
    radius: 3.2,
    chatter: tr(n.chatter, n.chatterEn),
  }));
  // 확장 구역 전문가 주민 (덕구·초롱·바위) — 자기 구역을 배회.
  for (const n of zoneNpcs(zones)) {
    defs.push({
      id: n.id,
      name: tr(n.name, n.nameEn),
      skin: n.skin,
      anchor: { x: n.anchor.x + 0.5, y: n.anchor.y + 0.5 },
      radius: 4,
      chatter: tr(n.chatter, n.chatterEn),
    });
  }
  // 배치된 특수 NPC(까미·기냥 등) — 배치 지점 주변을 배회.
  for (const p of placements) {
    if (p.kind !== 'npc') continue;
    const src = regionalNpcById(p.refId);
    defs.push({
      id: `placed-${p.id}`,
      name: tr(src.name, src.nameEn ?? src.name),
      skin: regionalNpcSkin(p.refId),
      anchor: { x: p.bx + 0.5, y: p.by + 0.5 },
      radius: 2.6,
      chatter: tr(src.lines, src.linesEn ?? src.lines),
    });
  }
  return defs;
}

interface VillageWorldProps {
  editMode: boolean;
  onInteract: (target: VInteractTarget | null) => void;
  onEditCommit: (e: {
    placementId: number | null;
    kind: string;
    refId: string;
    bx: number;
    by: number;
    facing?: 'sw' | 'se';
    variant?: number;
  }) => void;
  onEditReturn: (e: { placementId: number | null }) => void;
  onEditSelection: (sel: { label: string; isNew: boolean; canRotate: boolean } | null) => void;
  /** 미소유 구역 팻말 탭 — 확장 확인 모달을 연다 */
  onZoneTap: (zone: VillageZoneId) => void;
  /** 오늘의 네잎클로버 수집 */
  onClover: () => void;
  /** 부모가 spawnFromTray 등을 호출할 수 있게 게임 인스턴스를 넘긴다 */
  onGame: (game: VillageGame | null) => void;
}

export function VillageWorldCanvas({
  editMode,
  onInteract,
  onEditCommit,
  onEditReturn,
  onEditSelection,
  onZoneTap,
  onClover,
  onGame,
}: VillageWorldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<VillageGame | null>(null);

  const placements = useVillageStore((s) => s.placements);
  const zonesOwned = useVillageStore((s) => s.zonesOwned);
  const wreckRestored = useVillageStore((s) => s.wreckRestored);
  const dex = useCollectionStore((s) => s.dex);
  const landmarks = useCollectionStore((s) => s.landmarks);
  const profile = useProfileStore((s) => s.profile);
  const dayOffset = useVirtualClock((s) => s.dayOffset);
  const questDay = useQuestStore((s) => s.day);
  const cloverProgress = useQuestStore((s) => s.progress.clover);
  const lang = useLang();

  const world = useMemo(() => worldFor(zonesOwned), [zonesOwned]);

  const hooksRef = useRef({ onInteract, onEditCommit, onEditReturn, onEditSelection, onZoneTap, onClover });
  hooksRef.current = { onInteract, onEditCommit, onEditReturn, onEditSelection, onZoneTap, onClover };

  // 게임 생명주기 (마운트 1회).
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const game = new VillageGame(
      canvas,
      world,
      {
        onInteractChange: (t) => hooksRef.current.onInteract(t),
        onEditCommit: (e) => hooksRef.current.onEditCommit(e),
        onEditReturn: (e) => hooksRef.current.onEditReturn(e),
        onEditSelection: (s) => hooksRef.current.onEditSelection(s),
        onZoneTap: (z) => hooksRef.current.onZoneTap(z),
        onClover: () => hooksRef.current.onClover(),
      },
      playerSkinFromProfile(),
    );
    gameRef.current = game;
    onGame(game);
    game.start();

    const ro = new ResizeObserver(() => game.resize());
    ro.observe(canvas);
    return () => {
      ro.disconnect();
      game.stop();
      gameRef.current = null;
      onGame(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 섬 확장 → 월드 교체.
  useEffect(() => {
    gameRef.current?.setWorld(world);
  }, [world]);

  // 데이터 동기화 — 언어 변경 시 캔버스 라벨·말풍선도 갱신.
  const things = useMemo(
    () => [...thingsFromPlacements(placements), ...zoneSyntheticThings(zonesOwned, wreckRestored)],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [placements, zonesOwned, wreckRestored, lang],
  );
  const villagers = useMemo(
    () => villagersFromState(placements, dex.length, landmarks.length, zonesOwned, world.plaza),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [placements, dex.length, landmarks.length, zonesOwned, world, lang],
  );

  // 미소유 구역 팻말 (i18n 포함).
  const lockedSigns = useMemo<LockedZoneSign[]>(() => {
    const cost = nextExpansionCost(zonesOwned.length);
    return ZONE_INFO.filter((z) => !zonesOwned.includes(z.zone)).map((z) => {
      const available = zoneAvailable(z.zone, zonesOwned);
      return {
        zone: z.zone,
        available,
        title: `${z.emoji} ${tr(z.name, z.nameEn)}`,
        sub: available
          ? tr(`🔒 ${cost} 톡큰으로 확장`, `🔒 Expand · ${cost} Tokken`)
          : tr('양옆 구역을 이은 뒤 열려요', 'Link both side zones first'),
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zonesOwned, lang]);

  // 오늘의 네잎클로버 — 아직 못 찾았으면 소유 구역 어딘가에 스폰.
  const day = virtualDayIndex(dayOffset);
  const cloverFound = questDay === day && cloverProgress >= 1;
  const cloverTile = useMemo(() => {
    if (cloverFound) return null;
    const occupied = new Set<number>();
    for (const p of placements) {
      for (let ty = p.by; ty < p.by + p.h; ty++) {
        for (let tx = p.bx; tx < p.bx + p.w; tx++) {
          if (vinBounds(tx, ty)) occupied.add(vidx(tx, ty));
        }
      }
    }
    return pickCloverTile(world, day, occupied);
  }, [world, day, cloverFound, placements]);

  useEffect(() => {
    gameRef.current?.setThings(things);
  }, [things]);

  useEffect(() => {
    gameRef.current?.setVillagers(villagers);
  }, [villagers]);

  useEffect(() => {
    gameRef.current?.setLockedZones(lockedSigns);
  }, [lockedSigns]);

  useEffect(() => {
    gameRef.current?.setClover(cloverTile);
  }, [cloverTile]);

  useEffect(() => {
    gameRef.current?.setPlayerSkin(playerSkinFromProfile());
  }, [profile]);

  useEffect(() => {
    gameRef.current?.setEditMode(editMode);
  }, [editMode]);

  return (
    <canvas
      ref={canvasRef}
      className="h-full w-full"
      style={{ touchAction: 'none', display: 'block' }}
      aria-label="내 마을"
    />
  );
}
