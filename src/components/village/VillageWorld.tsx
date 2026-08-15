// ─── 내 마을 월드 캔버스 (React ↔ 엔진 브리지) ────────────────────
// 월드는 1회 생성해 재사용하고, 스토어 상태(배치·도감·프로필)가 바뀔
// 때마다 엔진에 흘려보낸다. 렌더/입력/AI 는 VillageGame 이 rAF 로 돌고,
// React 는 캔버스 생명주기·데이터 동기화·배치 모드 토글만 담당한다.

import { useEffect, useMemo, useRef } from 'react';
import { buildVillageWorld, STONE_TILE } from '../../lib/villageWorld';
import {
  VillageGame,
  type EditMeta,
  type PlacedThing,
  type VillagerDef,
  type VInteractTarget,
} from '../../lib/villageGame';
import { CATEGORY_SKINS, CATEGORY_EMOJI, type VCharSkin } from '../../lib/villageDraw';
import { magpieSkin, residentNpcs, richnessPlacementCount, villageRichness } from '../../data/villageNpcs';
import { DECOR_ITEMS, DRUMMER_MAGPIE, LANDMARKS, REGIONAL_NPCS, storeById } from '../../data/seed';
import { SKIN_TONES, HAIR_COLORS, OUTFIT_COLORS, shade } from '../../assets/characterParts';
import { useVillageStore, footprintOf, type Placement, type PlacementKind } from '../../store/useVillageStore';
import { useCollectionStore } from '../../store/useCollectionStore';
import { useProfileStore } from '../../store/useProfileStore';

/** 모듈 수준 월드 — 시드 고정이라 세션 내 항상 동일 */
const WORLD = buildVillageWorld();

export function playerSkinFromProfile(): VCharSkin {
  const profile = useProfileStore.getState().profile;
  const c = profile?.character ?? { skin: 0, hairStyle: 0, hairColor: 0, outfit: 0, outfitColor: 0 };
  const fur = SKIN_TONES[c.skin] ?? SKIN_TONES[0];
  const body = OUTFIT_COLORS[c.outfitColor] ?? OUTFIT_COLORS[0];
  return {
    body,
    bodyDark: shade(body, 0.22),
    fur,
    furDark: shade(fur, 0.18),
    hair: HAIR_COLORS[c.hairColor] ?? HAIR_COLORS[0],
    hairStyle: c.hairStyle,
    ear: 'none',
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
    };
  }
  if (kind === 'landmark') return { kind, refId, w, h, label, lmId: refId };
  if (kind === 'npc')
    return { kind, refId, w, h, label, npcSkin: magpieSkin(refId === DRUMMER_MAGPIE.id) };
  return { kind, refId, w, h, label, decorType: refId === 'tree' ? 'maple' : refId };
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
        label: store.name,
        emoji: CATEGORY_EMOJI[store.category],
        skin: CATEGORY_SKINS[store.category],
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
        label: lm?.name ?? p.refId,
        lmId: p.refId,
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
        label: item?.name ?? p.refId,
        // 상점의 '단풍나무'는 숲 나무와 다른 단풍 팔레트로 그린다.
        decorType: p.refId === 'tree' ? 'maple' : p.refId,
        // 꽃밭·돌바닥 타일은 밟고 지나갈 수 있다.
        blocking: p.refId !== 'flower' && p.refId !== STONE_TILE,
      });
    } else if (p.kind === 'npc') {
      const drummer = p.refId === DRUMMER_MAGPIE.id;
      const src = drummer ? DRUMMER_MAGPIE : REGIONAL_NPCS[0];
      // 걷기 모드에선 배회 주민으로 그려지고, 배치 모드에서만 정적 표시.
      things.push({
        id: p.id,
        kind: 'npc',
        bx: p.bx,
        by: p.by,
        w: p.w,
        h: p.h,
        label: src.name,
        npcSkin: magpieSkin(drummer),
        blocking: false,
      });
    }
  }
  return things;
}

function villagersFromState(placements: Placement[], dexCount: number, lmCount: number): VillagerDef[] {
  const richness = villageRichness(richnessPlacementCount(placements), dexCount, lmCount);
  const defs: VillagerDef[] = residentNpcs(richness).map((n) => ({
    id: n.id,
    name: n.name,
    skin: n.skin,
    anchor: {
      x: WORLD.plaza.tx + 0.5 + n.anchorOffset.x,
      y: WORLD.plaza.ty + 0.5 + n.anchorOffset.y,
    },
    radius: 3.2,
    chatter: n.chatter,
  }));
  // 배치된 특수 NPC(까미 계열) — 배치 지점 주변을 배회.
  for (const p of placements) {
    if (p.kind !== 'npc') continue;
    const drummer = p.refId === DRUMMER_MAGPIE.id;
    const src = drummer ? DRUMMER_MAGPIE : REGIONAL_NPCS[0];
    defs.push({
      id: `placed-${p.id}`,
      name: src.name,
      skin: magpieSkin(drummer),
      anchor: { x: p.bx + 0.5, y: p.by + 0.5 },
      radius: 2.6,
      chatter: src.lines,
    });
  }
  return defs;
}

interface VillageWorldProps {
  editMode: boolean;
  onInteract: (target: VInteractTarget | null) => void;
  onEditCommit: (e: { placementId: number | null; kind: string; refId: string; bx: number; by: number }) => void;
  onEditReturn: (e: { placementId: number | null }) => void;
  onEditSelection: (sel: { label: string; isNew: boolean } | null) => void;
  /** 부모가 spawnFromTray 등을 호출할 수 있게 게임 인스턴스를 넘긴다 */
  onGame: (game: VillageGame | null) => void;
}

export function VillageWorldCanvas({
  editMode,
  onInteract,
  onEditCommit,
  onEditReturn,
  onEditSelection,
  onGame,
}: VillageWorldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<VillageGame | null>(null);

  const placements = useVillageStore((s) => s.placements);
  const dex = useCollectionStore((s) => s.dex);
  const landmarks = useCollectionStore((s) => s.landmarks);
  const profile = useProfileStore((s) => s.profile);

  const hooksRef = useRef({ onInteract, onEditCommit, onEditReturn, onEditSelection });
  hooksRef.current = { onInteract, onEditCommit, onEditReturn, onEditSelection };

  // 게임 생명주기 (마운트 1회).
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const game = new VillageGame(
      canvas,
      WORLD,
      {
        onInteractChange: (t) => hooksRef.current.onInteract(t),
        onEditCommit: (e) => hooksRef.current.onEditCommit(e),
        onEditReturn: (e) => hooksRef.current.onEditReturn(e),
        onEditSelection: (s) => hooksRef.current.onEditSelection(s),
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

  // 데이터 동기화.
  const things = useMemo(() => thingsFromPlacements(placements), [placements]);
  const villagers = useMemo(
    () => villagersFromState(placements, dex.length, landmarks.length),
    [placements, dex.length, landmarks.length],
  );

  useEffect(() => {
    gameRef.current?.setThings(things);
  }, [things]);

  useEffect(() => {
    gameRef.current?.setVillagers(villagers);
  }, [villagers]);

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
