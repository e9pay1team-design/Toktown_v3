// ─── 내 마을 월드 캔버스 (React ↔ 엔진 브리지) ────────────────────
// 월드는 1회 생성해 재사용하고, 스토어 상태(배치·도감·프로필)가 바뀔
// 때마다 엔진에 흘려보낸다. 렌더/입력/AI 는 VillageGame 이 rAF 로 돌고,
// React 는 캔버스 생명주기·데이터 동기화·배치 모드 토글만 담당한다.

import { useEffect, useMemo, useRef } from 'react';
import { buildVillageWorld } from '../../lib/villageWorld';
import {
  GROUND_DECOR,
  VillageGame,
  type EditMeta,
  type PlacedThing,
  type VillagerDef,
  type VInteractTarget,
} from '../../lib/villageGame';
import { CATEGORY_SKINS, CATEGORY_EMOJI, type VCharSkin } from '../../lib/villageDraw';
import { magpieSkin, residentNpcs, villageRichness } from '../../data/villageNpcs';
import { DECOR_ITEMS, DRUMMER_MAGPIE, LANDMARKS, REGIONAL_NPCS, storeById } from '../../data/seed';
import { SKIN_TONES, HAIR_COLORS, OUTFIT_COLORS, shade } from '../../assets/characterParts';
import { wardrobeById } from '../../data/wardrobe';
import { useVillageStore, footprintOf, type Placement, type PlacementKind } from '../../store/useVillageStore';
import { useCollectionStore } from '../../store/useCollectionStore';
import { useProfileStore } from '../../store/useProfileStore';
import { decorName, lmName, sName, tr, useLang } from '../../i18n';

/** 모듈 수준 월드 — 시드 고정이라 세션 내 항상 동일 */
const WORLD = buildVillageWorld();

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
    bottomColor: bottom?.color,
    shoeColor: shoes?.color,
    faceColor: paint?.color,
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
        // 상점의 '단풍나무'는 숲 나무와 다른 단풍 팔레트로 그린다.
        decorType: p.refId === 'tree' ? 'maple' : p.refId,
        // 1×1 소품은 히트박스 없음 — 캐릭터/주민이 끼지 않는다.
        blocking: false,
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
        label: tr(src.name, src.nameEn ?? src.name),
        npcSkin: magpieSkin(drummer),
        blocking: false,
      });
    }
  }
  return things;
}

function villagersFromState(placements: Placement[], dexCount: number, lmCount: number): VillagerDef[] {
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
      x: WORLD.plaza.tx + 0.5 + n.anchorOffset.x,
      y: WORLD.plaza.ty + 0.5 + n.anchorOffset.y,
    },
    radius: 3.2,
    chatter: tr(n.chatter, n.chatterEn),
  }));
  // 배치된 특수 NPC(까미 계열) — 배치 지점 주변을 배회.
  for (const p of placements) {
    if (p.kind !== 'npc') continue;
    const drummer = p.refId === DRUMMER_MAGPIE.id;
    const src = drummer ? DRUMMER_MAGPIE : REGIONAL_NPCS[0];
    defs.push({
      id: `placed-${p.id}`,
      name: tr(src.name, src.nameEn ?? src.name),
      skin: magpieSkin(drummer),
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
  }) => void;
  onEditReturn: (e: { placementId: number | null }) => void;
  onEditSelection: (sel: { label: string; isNew: boolean; canRotate: boolean } | null) => void;
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
  const lang = useLang();

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

  // 데이터 동기화 — 언어 변경 시 캔버스 라벨·말풍선도 갱신.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const things = useMemo(() => thingsFromPlacements(placements), [placements, lang]);
  const villagers = useMemo(
    () => villagersFromState(placements, dex.length, landmarks.length),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [placements, dex.length, landmarks.length, lang],
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
