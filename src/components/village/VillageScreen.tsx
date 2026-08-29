// ─── 내 마을 (기획 §6 화면 9 · M4 걷는 월드 + M5 배치 모드) ───────
// 걷기 모드: 캐릭터 산책·NPC 대화·상호작용. 배치 모드: 캐릭터/주민이
// 잠시 퇴장하고 카메라 패닝 + 오브젝트 드래그 배치, ✓ 확정 / ✕ 보관함.
// 주민증/도감/상점/꾸미기 메뉴 유지.

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type WheelEvent as ReactWheelEvent,
} from 'react';
import { DECOR_ITEMS, DRUMMER_MAGPIE, LANDMARKS, regionalNpcById, storeById } from '../../data/seed';
import { useVirtualClock, virtualDayIndex, virtualNow, virtualToday } from '../../mock/clock';
import { useVillageStore, type PlacementKind } from '../../store/useVillageStore';
import { useCollectionStore } from '../../store/useCollectionStore';
import { useVisitStore } from '../../store/useVisitStore';
import { useProfileStore } from '../../store/useProfileStore';
import { useUiStore } from '../../store/useUiStore';
import { useToastStore } from '../../store/useToastStore';
import { useEconomyStore } from '../../store/useEconomyStore';
import { DAILY_QUESTS, QUEST_ALL_CLEAR_BONUS, useQuestStore } from '../../store/useQuestStore';
import { VillageWorldCanvas, trayMetaFor } from './VillageWorld';
import { DialogueOverlay } from './DialogueOverlay';
import { GROUND_DECOR, type VillageGame, type VInteractTarget } from '../../lib/villageGame';
import { residentNpcs, villageRichness, VILLAGE_NPCS, ZONE_NPCS, zoneInfo, zoneNpcs } from '../../data/villageNpcs';
import {
  CAMP_FIRE_THING_ID,
  CAMP_RESTORE_COST,
  CAMP_SWING_THING_ID,
  CAMP_THING_ID,
  FACILITY_COOLDOWN_MS,
  FACILITY_SALVAGE,
  FALLS_THING_ID,
  nextExpansionCost,
  WRECK_RESTORE_COST,
  WRECK_THING_ID,
  zoneAvailable,
  type VillageZoneId,
} from '../../lib/villageWorld';
import { TokkenCoin } from '../../assets/misc';
import { ShopModal } from './ShopModal';
import { DexModal } from './DexModal';
import { ResidentCardModal } from './ResidentCardModal';
import { DressingModal } from './DressingModal';
import { StoreBuilding } from '../../assets/buildings';
import { LandmarkSvg } from '../../assets/landmarks';
import { RegionalNpcSvg } from '../../assets/npcs';
import { DecorSvg } from '../../assets/decor';
import { decorName, lmName, sName, tr, useLang, useT } from '../../i18n';

interface InvItem {
  kind: PlacementKind;
  refId: string;
  label: string;
  count: number;
}

type VillageModal = 'shop' | 'dex' | 'card' | 'dressing' | null;

/** 보관함 썸네일 — 지도/모달과 같은 SVG 에셋 재사용 */
export function ObjectSvg({ kind, refId }: { kind: PlacementKind; refId: string }) {
  if (kind === 'store') {
    const store = storeById(Number(refId));
    if (!store) return null;
    return <StoreBuilding category={store.category} label={store.name} size={80} />;
  }
  if (kind === 'npc') return <RegionalNpcSvg npcId={refId} size={54} />;
  if (kind === 'landmark') {
    const size = refId === 'namsan' ? 58 : 56;
    return <LandmarkSvg id={refId} size={size} />;
  }
  return <DecorSvg id={refId} size={52} />;
}

interface DialogueData {
  name: string;
  title?: string;
  accent: string;
  lines: string[];
}

function roundedPath(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
  g.beginPath();
  g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + h, r);
  g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r);
  g.arcTo(x, y, x + w, y, r);
  g.closePath();
}

/** 전경 스냅샷 위에 폴라로이드풍 프레임 + 캡션을 얹은 공유용 이미지 */
async function frameVillagePhoto(raw: string, caption: string, sub: string): Promise<string> {
  const img = new Image();
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error('snapshot load failed'));
    img.src = raw;
  });
  const W = 1240;
  const P = 26;
  const photoW = W - P * 2;
  const photoH = Math.round((photoW * img.height) / img.width);
  const capH = 124;
  const H = photoH + P * 2 + capH;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const g = canvas.getContext('2d');
  if (!g) return raw;
  g.fillStyle = '#FFFDF7';
  g.fillRect(0, 0, W, H);
  g.save();
  roundedPath(g, P, P, photoW, photoH, 24);
  g.clip();
  g.drawImage(img, P, P, photoW, photoH);
  g.restore();
  roundedPath(g, P, P, photoW, photoH, 24);
  g.strokeStyle = '#EFE3CE';
  g.lineWidth = 3;
  g.stroke();
  const font = (spec: string) => `${spec} system-ui, -apple-system, 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif`;
  g.textBaseline = 'middle';
  g.fillStyle = '#4A3B32';
  g.font = font('800 40px');
  g.fillText(`🏘️ ${caption}`, P + 8, photoH + P + capH * 0.36);
  g.fillStyle = '#8C7B6E';
  g.font = font('700 25px');
  g.fillText(sub, P + 8, photoH + P + capH * 0.74);
  g.textAlign = 'right';
  g.fillStyle = '#4E9B58';
  g.font = font('800 36px');
  g.fillText('TokTown', W - P - 10, photoH + P + capH * 0.53);
  g.textAlign = 'left';
  return canvas.toDataURL('image/png');
}

export function VillageScreen() {
  const nickname = useProfileStore((s) => s.profile?.nickname ?? '주민');
  const placements = useVillageStore((s) => s.placements);
  const decorOwned = useVillageStore((s) => s.decorOwned);
  const place = useVillageStore((s) => s.place);
  const movePlacement = useVillageStore((s) => s.move);
  const removePlacement = useVillageStore((s) => s.remove);
  const recallAllPlacements = useVillageStore((s) => s.recallAll);
  const events = useVisitStore((s) => s.events);
  const dex = useCollectionStore((s) => s.dex);
  const discovered = useCollectionStore((s) => s.landmarks);
  const setTab = useUiStore((s) => s.setTab);
  const selectStore = useUiStore((s) => s.selectStore);
  const requestFlyTo = useUiStore((s) => s.requestFlyTo);
  const toast = useToastStore((s) => s.show);

  const dayOffset = useVirtualClock((s) => s.dayOffset);
  const zonesOwned = useVillageStore((s) => s.zonesOwned);
  const expandZone = useVillageStore((s) => s.expandZone);
  const tokken = useEconomyStore((s) => s.tokken);
  const grantTokken = useEconomyStore((s) => s.grantTokken);
  const wreckRestored = useVillageStore((s) => s.wreckRestored);
  const wreckLastClaimAt = useVillageStore((s) => s.wreckLastClaimAt);
  const restoreWreck = useVillageStore((s) => s.restoreWreck);
  const claimWreck = useVillageStore((s) => s.claimWreck);
  const campRestored = useVillageStore((s) => s.campRestored);
  const campLastClaimAt = useVillageStore((s) => s.campLastClaimAt);
  const restoreCamp = useVillageStore((s) => s.restoreCamp);
  const claimCamp = useVillageStore((s) => s.claimCamp);
  const questProgress = useQuestStore((s) => s.progress);
  const questDay = useQuestStore((s) => s.day);
  const advanceQuest = useQuestStore((s) => s.advance);
  const syncQuestDay = useQuestStore((s) => s.syncDay);
  const [editMode, setEditMode] = useState(false);
  const [confirmingRecall, setConfirmingRecall] = useState(false);
  /** 🏝️ 확장 확인 대상 구역 */
  const [expandTarget, setExpandTarget] = useState<VillageZoneId | null>(null);
  /** 📜 오늘의 미션 패널 */
  const [questOpen, setQuestOpen] = useState(false);
  /** 🚢 난파선 시트 (별보기 언덕 테마 콘텐츠) */
  const [wreckOpen, setWreckOpen] = useState(false);
  /** 🏕️ 캠프촌 시트 (뒷숲 캠프 테마 콘텐츠) */
  const [campOpen, setCampOpen] = useState(false);
  /** 🎁 통합 보상 팝업 (복구 시설이 하나라도 있으면 좌상단 버튼) */
  const [rewardsOpen, setRewardsOpen] = useState(false);
  /** 🎬 폭포 전망 컷신 진행 중 — UI 잠시 숨김 */
  const [cutsceneOn, setCutsceneOn] = useState(false);
  /** 📸 마을 전경 공유 사진 (프레임 합성 완료본) */
  const [villagePhoto, setVillagePhoto] = useState<string | null>(null);
  const [editSel, setEditSel] = useState<{ label: string; isNew: boolean; canRotate: boolean } | null>(null);
  const [interact, setInteract] = useState<VInteractTarget | null>(null);
  /** 좌석(벤치·소파) 앉기 상태 — 게임 엔진 onSitChange 로 동기화 */
  const [sitting, setSitting] = useState(false);
  const [dialogue, setDialogue] = useState<DialogueData | null>(null);
  const [thingSheetId, setThingSheetId] = useState<number | null>(null);
  const [modal, setModal] = useState<VillageModal>(null);
  const gameRef = useRef<VillageGame | null>(null);
  /** 바닥 타일 연속 배치 방향 추적 — 직전에 확정한 타일 위치 */
  const lastTilePlace = useRef<{ refId: string; bx: number; by: number } | null>(null);
  /** 보관함 좌우 드래그 스크롤 상태 — 마우스 전용 (터치는 브라우저 네이티브 pan-x) */
  const trayRef = useRef<HTMLDivElement>(null);
  const trayDrag = useRef<{ x: number; left: number; moved: boolean } | null>(null);
  const T = useT();
  const lang = useLang();

  /* 인증 방문(체크인/인증 리뷰)한 매장 → 건물 보유 */
  const certifiedStoreIds = useMemo(() => {
    const set = new Set<number>();
    for (const e of events) {
      if (e.type === 'checkin' || e.type === 'certReview') set.add(e.storeId);
    }
    return set;
  }, [events]);

  const placedKeys = useMemo(
    () => new Set(placements.map((p) => `${p.kind}:${p.refId}`)),
    [placements],
  );

  /* 인벤토리 = 획득 − 배치됨 (라벨은 앱 언어) */
  const inventory = useMemo<InvItem[]>(() => {
    const items: InvItem[] = [];
    for (const id of certifiedStoreIds) {
      if (!placedKeys.has(`store:${id}`)) {
        const store = storeById(id);
        if (store) items.push({ kind: 'store', refId: String(id), label: sName(store), count: 1 });
      }
    }
    for (const npcId of dex) {
      if (!placedKeys.has(`npc:${npcId}`)) {
        const src = regionalNpcById(npcId);
        items.push({ kind: 'npc', refId: npcId, label: tr(src.name, src.nameEn ?? src.name), count: 1 });
      }
    }
    for (const lmId of discovered) {
      if (!placedKeys.has(`landmark:${lmId}`)) {
        const lm = LANDMARKS.find((l) => l.id === lmId);
        if (lm) items.push({ kind: 'landmark', refId: lmId, label: lmName(lm), count: 1 });
      }
    }
    for (const [decorId, owned] of Object.entries(decorOwned)) {
      const placedCount = placements.filter((p) => p.kind === 'decor' && p.refId === decorId).length;
      const remain = owned - placedCount;
      if (remain > 0) {
        const item = DECOR_ITEMS.find((d) => d.id === decorId);
        if (item) items.push({ kind: 'decor', refId: decorId, label: decorName(item), count: remain });
      }
    }
    return items;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [certifiedStoreIds, dex, discovered, decorOwned, placements, placedKeys, lang]);

  /* 마을 풍성도 → 입주 주민, 새 입주 토스트.
     기본 광장 구성물(preset)과 바닥 타일은 세지 않는다 — 풍성도는
     직접 모아 배치한 오브젝트만 (타일은 값싼 반복 배치라 제외). */
  const userPlacementCount = placements.filter(
    (p) => !p.preset && !(p.kind === 'decor' && GROUND_DECOR.has(p.refId)),
  ).length;
  const richness = villageRichness(userPlacementCount, dex.length, discovered.length);
  const residents = residentNpcs(richness);
  const prevResidents = useRef(residents.length);
  useEffect(() => {
    if (residents.length > prevResidents.current) {
      const fresh = residents[residents.length - 1];
      toast(
        tr(
          `🎉 ${fresh.species} ${fresh.name}이(가) 마을에 입주했어요!`,
          `🎉 ${fresh.nameEn} the ${fresh.speciesEn} moved into your town!`,
        ),
        'success',
      );
    }
    prevResidents.current = residents.length;
  }, [residents.length, residents, toast]);

  const placedNpcCount = placements.filter((p) => p.kind === 'npc').length;
  const zoneResidentCount = zoneNpcs(zonesOwned).length;
  const populationCount = 1 + residents.length + zoneResidentCount + placedNpcCount;
  const nextResident = VILLAGE_NPCS.find((n) => n.unlockAt > richness);

  /* 오늘의 미션 — 가상 '오늘' 동기화 + 남은 개수 배지 */
  const day = virtualDayIndex(dayOffset);
  useEffect(() => {
    syncQuestDay(day);
  }, [day, syncQuestDay]);
  const questFresh = questDay === day;
  const questDoneCount = DAILY_QUESTS.filter((q) => questFresh && (questProgress[q.id] ?? 0) >= q.target).length;
  const questRemaining = DAILY_QUESTS.length - questDoneCount;

  /* 🏝️ 섬 확장 — 팻말 탭 → 확인 모달 → 톡큰 차감 + 구역 개방 + NPC 입주 */
  const expansionCost = nextExpansionCost(zonesOwned.length);
  const handleZoneTap = (zone: VillageZoneId) => {
    if (editMode || zonesOwned.includes(zone)) return;
    if (!zoneAvailable(zone, zonesOwned)) {
      toast(
        tr('⛰️ 구름마루는 양옆 구역을 이은 뒤에 열려요', '⛰️ Cloud Ridge opens after linking both side zones'),
        'info',
      );
      return;
    }
    setExpandTarget(zone);
  };

  const confirmExpand = () => {
    if (!expandTarget) return;
    const info = zoneInfo(expandTarget);
    const npc = expandTarget !== 'base' ? ZONE_NPCS[expandTarget as Exclude<VillageZoneId, 'base'>] : undefined;
    if (!info || !npc) return;
    if (tokken < expansionCost) {
      toast(
        tr(
          `톡큰이 부족해요 (보유 ${tokken} / 필요 ${expansionCost}) — 체크인·미션으로 모아보세요!`,
          `Not enough Tokken (${tokken}/${expansionCost}) — earn more with check-ins and missions!`,
        ),
        'error',
      );
      return;
    }
    grantTokken(-expansionCost, 'expansion', tr(info.name, info.nameEn));
    expandZone(expandTarget);
    setExpandTarget(null);
    toast(
      tr(`${info.emoji} ${info.name} 개방! 섬이 넓어졌어요`, `${info.emoji} ${info.nameEn} unlocked! Your island grew`),
      'success',
    );
    setTimeout(
      () =>
        toast(
          tr(
            `🎉 ${npc.title} ${npc.species} ${npc.name}이(가) 입주했어요!`,
            `🎉 ${npc.nameEn} the ${npc.speciesEn} ${npc.titleEn} moved in!`,
          ),
          'success',
        ),
      900,
    );
  };

  /* 🍀 네잎클로버 수집 (엔진에서 근접 자동 수집) */
  const handleClover = () => {
    advanceQuest('clover', day);
  };

  /* 복구형 시설 공통 — 5시간 쿨다운 남은 시간 계산 */
  const nowVirtual = virtualNow(dayOffset);
  const msLeftOf = (lastAt: number | null) =>
    lastAt === null ? 0 : Math.max(0, FACILITY_COOLDOWN_MS - (nowVirtual - lastAt));
  const leftLabelOf = (ms: number) => {
    const h = Math.floor(ms / 3_600_000);
    const m = Math.ceil((ms % 3_600_000) / 60_000);
    return h > 0 ? tr(`${h}시간 ${m}분`, `${h}h ${m}m`) : tr(`${m}분`, `${m}m`);
  };

  /* 🚢 난파선 — 복구(300 톡큰) → 5시간마다 표류물 수거 */
  const wreckMsLeft = msLeftOf(wreckLastClaimAt);
  const wreckClaimable = wreckRestored && wreckMsLeft <= 0;
  const wreckLeftLabel = leftLabelOf(wreckMsLeft);
  const doRestoreWreck = () => {
    if (tokken < WRECK_RESTORE_COST) {
      toast(
        tr(
          `톡큰이 부족해요 (보유 ${tokken} / 필요 ${WRECK_RESTORE_COST})`,
          `Not enough Tokken (${tokken}/${WRECK_RESTORE_COST})`,
        ),
        'error',
      );
      return;
    }
    grantTokken(-WRECK_RESTORE_COST, 'salvage', tr('난파선 복구', 'Ship restoration'));
    restoreWreck();
    toast(tr('⛵ 범선을 복구했어요! 5시간마다 표류물이 도착해요', '⛵ Ship restored! Salvage arrives every 5h'), 'success');
  };
  const doClaimWreck = () => {
    if (claimWreck(nowVirtual, FACILITY_COOLDOWN_MS)) {
      grantTokken(FACILITY_SALVAGE, 'salvage', tr('표류물 수거', 'Salvage haul'));
      toast(tr(`⚓ 표류물 수거! 톡큰 +${FACILITY_SALVAGE}`, `⚓ Salvage collected! +${FACILITY_SALVAGE} Tokken`), 'tokken');
    } else {
      toast(tr(`다음 표류물까지 ${wreckLeftLabel} 남았어요 🌊`, `Next salvage in ${wreckLeftLabel} 🌊`), 'info');
    }
  };

  /* 🏕️ 캠프촌 — 복구(300 톡큰) → 5시간마다 보급품 수거 */
  const campMsLeft = msLeftOf(campLastClaimAt);
  const campClaimable = campRestored && campMsLeft <= 0;
  const campLeftLabel = leftLabelOf(campMsLeft);
  const doRestoreCamp = () => {
    if (tokken < CAMP_RESTORE_COST) {
      toast(
        tr(
          `톡큰이 부족해요 (보유 ${tokken} / 필요 ${CAMP_RESTORE_COST})`,
          `Not enough Tokken (${tokken}/${CAMP_RESTORE_COST})`,
        ),
        'error',
      );
      return;
    }
    grantTokken(-CAMP_RESTORE_COST, 'salvage', tr('캠프촌 복구', 'Campsite restoration'));
    restoreCamp();
    toast(tr('⛺ 캠프촌을 복구했어요! 5시간마다 보급품이 모여요', '⛺ Campsite restored! Supplies gather every 5h'), 'success');
  };
  const doClaimCamp = () => {
    if (claimCamp(nowVirtual, FACILITY_COOLDOWN_MS)) {
      grantTokken(FACILITY_SALVAGE, 'salvage', tr('캠프 보급품', 'Camp supplies'));
      toast(tr(`🎒 보급품 수거! 톡큰 +${FACILITY_SALVAGE}`, `🎒 Supplies collected! +${FACILITY_SALVAGE} Tokken`), 'tokken');
    } else {
      toast(tr(`다음 보급품까지 ${campLeftLabel} 남았어요 🌲`, `Next supplies in ${campLeftLabel} 🌲`), 'info');
    }
  };

  /* 🎁 통합 보상 — 복구 시설이 하나라도 있으면 좌상단 버튼으로 원격 수거 */
  const anyFacilityRestored = wreckRestored || campRestored;
  const anyClaimable = wreckClaimable || campClaimable;

  /* 🎬 무지개 폭포 — 마을 곳곳을 비추고 전경으로 빠지는 컷신 */
  const startFallsCutscene = () => {
    const g = gameRef.current;
    if (!g) return;
    const stops: { x: number; y: number }[] = [{ x: 35.5, y: 35.5 }];
    for (const p of placements.filter((q) => q.kind === 'landmark' || q.kind === 'store').slice(0, 3)) {
      stops.push({ x: p.bx + p.w / 2, y: p.by + p.h / 2 });
    }
    if (zonesOwned.includes('west')) stops.push({ x: 3, y: 41 });
    if (zonesOwned.includes('north')) stops.push({ x: 46.5, y: 3.5 });
    setInteract(null);
    g.startCutscene(stops, tr('탭하여 건너뛰기', 'Tap to skip'));
  };

  /* 배치 모드 진입/종료 */
  const enterEdit = () => {
    setDialogue(null);
    setThingSheetId(null);
    setInteract(null);
    setEditMode(true);
  };
  const exitEdit = () => {
    setEditMode(false);
    setEditSel(null);
    setConfirmingRecall(false);
    lastTilePlace.current = null;
  };

  /* ✓ 확정 */
  const handleEditCommit = (e: {
    placementId: number | null;
    kind: string;
    refId: string;
    bx: number;
    by: number;
    facing?: 'sw' | 'se';
    variant?: number;
  }) => {
    advanceQuest('decorate', day);
    if (e.placementId === null) {
      place(e.kind as PlacementKind, e.refId, e.bx, e.by, e.facing, e.variant);
      toast(tr('마을에 배치했어요!', 'Placed in your town!'), 'success');
      // 바닥 타일 연속 배치 — 보관함에 같은 타일이 남았으면 진행 방향으로 다음 타일 준비.
      if (e.kind === 'decor' && GROUND_DECOR.has(e.refId)) {
        // 직전 확정 위치 → 이번 위치 벡터가 곧 사용자가 뻗어나가는 방향.
        const prev = lastTilePlace.current;
        let seed = { bx: e.bx + 1, by: e.by };
        if (prev && prev.refId === e.refId) {
          const dx = Math.sign(e.bx - prev.bx);
          const dy = Math.sign(e.by - prev.by);
          if (dx !== 0 || dy !== 0) seed = { bx: e.bx + dx, by: e.by + dy };
        }
        lastTilePlace.current = { refId: e.refId, bx: e.bx, by: e.by };

        const s = useVillageStore.getState();
        const owned = s.decorOwned[e.refId] ?? 0;
        const placedCount = s.placements.filter((p) => p.kind === 'decor' && p.refId === e.refId).length;
        if (owned - placedCount > 0) {
          const item = DECOR_ITEMS.find((d) => d.id === e.refId);
          if (item) {
            gameRef.current?.spawnFromTray(trayMetaFor('decor', e.refId, decorName(item)), seed);
          }
        }
      }
    } else {
      movePlacement(e.placementId, e.bx, e.by, e.facing);
      toast(tr('위치를 옮겼어요', 'Moved'), 'info');
    }
  };

  /* ✕ 보관함 반환 */
  const handleEditReturn = (e: { placementId: number | null }) => {
    if (e.placementId !== null) {
      removePlacement(e.placementId);
      toast(tr('보관함으로 돌려놨어요', 'Returned to storage'), 'info');
    }
  };

  /* 🎒 전체 회수 — 배치된 모든 오브젝트를 보관함으로.
     window.confirm 은 웹 공유 샌드박스(iframe)에서 차단되므로 앱 내 확인 모달을 쓴다. */
  const recallAll = () => {
    if (placements.length === 0) {
      toast(tr('회수할 오브젝트가 없어요', 'Nothing to recall'), 'info');
      return;
    }
    setConfirmingRecall(true);
  };

  /* 📸 마을 사진 찍기 → 저장/공유 */
  const takePhoto = () => {
    const raw = gameRef.current?.captureSnapshot(1200, 800);
    if (!raw) return;
    frameVillagePhoto(
      raw,
      tr(`${nickname}의 마을`, `${nickname}'s Town`),
      tr(
        `주민 ${populationCount}명 · 풍성도 ${richness} · ${virtualToday(dayOffset)}`,
        `${populationCount} residents · richness ${richness} · ${virtualToday(dayOffset)}`,
      ),
    )
      .then(setVillagePhoto)
      .catch(() => toast(tr('사진을 만들지 못했어요', 'Could not create the photo'), 'error'));
  };

  const savePhoto = () => {
    if (!villagePhoto) return;
    try {
      const a = document.createElement('a');
      a.href = villagePhoto;
      a.download = 'toktown-my-village.png';
      document.body.appendChild(a);
      a.click();
      a.remove();
      toast(
        tr('📥 이미지 저장을 시도했어요 — 안 되면 사진을 길게 눌러 저장하세요', '📥 Tried saving — if blocked, long-press the photo'),
        'info',
      );
    } catch {
      toast(tr('이 환경에선 저장이 제한돼요 — 사진을 길게 눌러 저장하세요', 'Saving is limited here — long-press the photo'), 'error');
    }
  };

  const sharePhoto = async () => {
    if (!villagePhoto) return;
    try {
      const blob = await (await fetch(villagePhoto)).blob();
      const file = new File([blob], 'toktown-my-village.png', { type: 'image/png' });
      if (navigator.share && (!navigator.canShare || navigator.canShare({ files: [file] }))) {
        await navigator.share({
          files: [file],
          title: 'TokTown',
          text: tr('내 톡타운 마을이에요! 🏘️', 'My TokTown village! 🏘️'),
        });
        toast(tr('📤 공유했어요!', '📤 Shared!'), 'success');
        return;
      }
      if (navigator.clipboard && typeof ClipboardItem !== 'undefined') {
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
        toast(tr('📋 이미지를 클립보드에 복사했어요', '📋 Image copied to clipboard'), 'success');
        return;
      }
      toast(tr('이 환경에선 공유가 제한돼요 — 저장하기를 이용해 주세요', 'Sharing is limited here — try Save instead'), 'info');
    } catch (e) {
      if ((e as Error)?.name === 'AbortError') return; // 사용자가 공유 시트를 닫음
      toast(tr('공유가 차단됐어요 — 사진을 길게 눌러 저장해 주세요', 'Sharing was blocked — long-press the photo to save'), 'error');
    }
  };

  const doRecallAll = () => {
    const count = placements.length;
    setConfirmingRecall(false);
    gameRef.current?.cancelEdit();
    setEditSel(null);
    recallAllPlacements();
    toast(
      tr(`🎒 오브젝트 ${count}개를 보관함으로 회수했어요`, `🎒 Recalled ${count} object${count === 1 ? '' : 's'} to storage`),
      'success',
    );
  };

  /* 보관함 스트립 스크롤 — 마우스 드래그·세로 휠도 좌우 스크롤로 매끄럽게 */
  const onTrayDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse') return;
    const el = trayRef.current;
    if (!el) return;
    trayDrag.current = { x: e.clientX, left: el.scrollLeft, moved: false };
  };
  const onTrayMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = trayDrag.current;
    const el = trayRef.current;
    if (!d || !el || e.pointerType !== 'mouse') return;
    // 폰 프레임 CSS scale 보정 — 화면 px → 로컬 px.
    const scale = el.offsetWidth ? el.getBoundingClientRect().width / el.offsetWidth : 1;
    const dx = (e.clientX - d.x) / (scale || 1);
    if (!d.moved && Math.abs(dx) > 5) {
      d.moved = true;
      try {
        el.setPointerCapture(e.pointerId);
      } catch {
        /* 일부 환경(합성 이벤트 등)에선 캡처 불가 — 캡처 없이도 동작 */
      }
    }
    if (d.moved) el.scrollLeft = d.left - dx;
  };
  const onTrayUp = () => {
    // click 이벤트가 moved 플래그를 읽은 뒤 해제되도록 다음 틱에 비운다.
    if (trayDrag.current) setTimeout(() => (trayDrag.current = null), 0);
  };
  const onTrayClickCapture = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (trayDrag.current?.moved) {
      e.preventDefault();
      e.stopPropagation(); // 드래그 스크롤 직후의 실수 탭(아이템 스폰) 방지
    }
  };
  const onTrayWheel = (e: ReactWheelEvent<HTMLDivElement>) => {
    const el = trayRef.current;
    if (el && Math.abs(e.deltaY) > Math.abs(e.deltaX)) el.scrollLeft += e.deltaY;
  };

  const openDialogueFor = (target: VInteractTarget) => {
    if (target.kind !== 'npc') return;
    advanceQuest('greet', day);
    // 확장 구역 전문가 주민 (덕구·초롱·바위).
    if (target.id.startsWith('zone-')) {
      const def = Object.values(ZONE_NPCS).find((n) => n.id === target.id);
      if (!def) return;
      setDialogue({
        name: tr(def.name, def.nameEn),
        title: tr(def.title, def.titleEn),
        accent: def.skin.body,
        lines: tr(def.dialogue, def.dialogueEn),
      });
      return;
    }
    if (target.id.startsWith('placed-')) {
      const pid = Number(target.id.slice('placed-'.length));
      const p = placements.find((x) => x.id === pid);
      const drummer = p?.refId === DRUMMER_MAGPIE.id;
      const src = regionalNpcById(p?.refId ?? 'magpie');
      setDialogue({
        name: tr(src.name, src.nameEn ?? src.name),
        title: drummer ? tr('한정 이웃', 'Limited neighbor') : tr('이웃', 'Neighbor'),
        accent: drummer ? '#8A5CF6' : '#4A5568',
        lines: tr(src.lines, src.linesEn ?? src.lines),
      });
      return;
    }
    const def = VILLAGE_NPCS.find((n) => n.id === target.id);
    if (!def) return;
    setDialogue({
      name: tr(def.name, def.nameEn),
      title: tr(def.title, def.titleEn),
      accent: def.skin.body,
      lines: tr(def.dialogue, def.dialogueEn),
    });
  };

  const thingSheet = thingSheetId !== null ? placements.find((p) => p.id === thingSheetId) ?? null : null;
  const thingSheetStore = thingSheet?.kind === 'store' ? storeById(Number(thingSheet.refId)) : undefined;
  const thingSheetLabel = thingSheet
    ? thingSheet.kind === 'store'
      ? thingSheetStore && sName(thingSheetStore)
      : thingSheet.kind === 'landmark'
        ? (() => {
            const lm = LANDMARKS.find((l) => l.id === thingSheet.refId);
            return lm && lmName(lm);
          })()
        : thingSheet.kind === 'npc'
          ? (() => {
              const src = regionalNpcById(thingSheet.refId);
              return tr(src.name, src.nameEn ?? src.name);
            })()
          : (() => {
              const item = DECOR_ITEMS.find((d) => d.id === thingSheet.refId);
              return item && decorName(item);
            })()
    : null;

  const emptyVillage = userPlacementCount === 0 && inventory.length === 0;

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-[#3f9fc8]">
      {/* 월드 캔버스 (전면) */}
      <div className="absolute inset-0">
        <VillageWorldCanvas
          editMode={editMode}
          onInteract={setInteract}
          onEditCommit={handleEditCommit}
          onEditReturn={handleEditReturn}
          onEditSelection={setEditSel}
          onZoneTap={handleZoneTap}
          onClover={handleClover}
          onGame={(g) => {
            gameRef.current = g;
            if (g) {
              g.onSitChange = setSitting;
              g.onCutsceneChange = setCutsceneOn;
            }
          }}
        />
      </div>

      {/* 줌 컨트롤 — 걷기/배치 공통 (휠·핀치로도 가능) */}
      {!cutsceneOn && (
      <div className="absolute right-4 top-1/2 z-20 flex -translate-y-1/2 flex-col gap-1.5">
        <button
          onClick={() => gameRef.current?.zoomBy(1.25)}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-town-line bg-town-paper/95 text-[18px] font-extrabold shadow-sm transition active:scale-95"
          aria-label={T('줌인', 'Zoom in')}
        >
          ＋
        </button>
        <button
          onClick={() => gameRef.current?.zoomBy(0.8)}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-town-line bg-town-paper/95 text-[18px] font-extrabold shadow-sm transition active:scale-95"
          aria-label={T('줌아웃', 'Zoom out')}
        >
          －
        </button>
      </div>
      )}

      {/* 헤더 (컷신 중엔 숨김) */}
      {!cutsceneOn && (
      <header className="pointer-events-none relative z-10 flex items-center justify-between px-4 pt-12">
        {editMode ? (
          <button
            onClick={recallAll}
            className="pointer-events-auto flex h-9 items-center gap-1 rounded-xl border border-town-coral/60 bg-town-paper/95 px-2.5 text-[12px] font-extrabold text-town-coralDeep shadow-sm transition active:scale-95"
            aria-label={T('모든 오브젝트 보관함으로 회수', 'Recall all objects to storage')}
          >
            {T('🎒 전체 회수', '🎒 Recall all')}
          </button>
        ) : anyFacilityRestored ? (
          <button
            onClick={() => setRewardsOpen(true)}
            className="pointer-events-auto relative flex h-9 w-[74px] items-center justify-center gap-1 rounded-xl border border-town-line bg-town-paper/95 text-[12px] font-extrabold shadow-sm transition active:scale-95"
            aria-label={T('시설 보상 모아 받기', 'Collect facility rewards')}
          >
            🎁 {T('보상', 'Rewards')}
            {anyClaimable && (
              <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-town-paper bg-town-coral" />
            )}
          </button>
        ) : (
          // 지도 이동은 하단 탭이 담당 — 타이틀 중앙 유지용 스페이서.
          <span className="w-[74px]" />
        )}
        <div className="rounded-2xl bg-town-paper/90 px-4 py-1.5 text-center shadow-sm backdrop-blur-sm">
          {editMode ? (
            <>
              <h2 className="text-[15px] font-extrabold leading-tight">{T('🔨 배치 모드', '🔨 Edit Mode')}</h2>
              <p className="text-[10px] font-bold text-town-inkSoft">
                {T('주민들은 잠시 자리를 비켜줬어요', 'Residents stepped away for a moment')}
              </p>
            </>
          ) : (
            <>
              <h2 className="text-[15px] font-extrabold leading-tight">
                {T(`${nickname}의 마을`, `${nickname}'s Town`)}
              </h2>
              <p className="text-[10px] font-bold text-town-inkSoft">
                {T(`주민 ${populationCount}명 · 풍성도 ${richness}`, `${populationCount} residents · richness ${richness}`)}
              </p>
            </>
          )}
        </div>
        {editMode ? (
          <button
            onClick={exitEdit}
            className="pointer-events-auto flex h-9 items-center gap-1 rounded-xl bg-town-leafDark px-3 text-[12.5px] font-extrabold text-white shadow-pop"
          >
            {T('완료', 'Done')}
          </button>
        ) : (
          <button
            onClick={takePhoto}
            className="pointer-events-auto flex h-9 items-center gap-1 rounded-xl border border-town-line bg-town-paper/95 px-2.5 shadow-sm transition active:scale-95"
            aria-label={T('마을 사진 찍어 공유', 'Snap and share your town')}
          >
            <span className="text-[14px]">📸</span>
            <span className="text-[12px] font-extrabold">{T('공유', 'Share')}</span>
          </button>
        )}
      </header>
      )}

      {/* 기능 버튼 (걷기 모드) — 5개가 한 줄에 들어가도록 촘촘하게, 줄바꿈 금지 */}
      {!editMode && !cutsceneOn && (
        <div className="pointer-events-none relative z-10 flex justify-center gap-1.5 px-2 py-2">
          {(
            [
              ['card', '🪪', T('주민증', 'ID')],
              ['dex', '📖', T('도감', 'Dex')],
              ['shop', '🏪', T('상점', 'Shop')],
              ['dressing', '🎨', T('꾸미기', 'Style')],
            ] as const
          ).map(([id, emoji, label]) => (
            <button
              key={id}
              onClick={() => setModal(id)}
              className="pointer-events-auto flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full border border-town-line bg-town-paper/95 px-2.5 py-1.5 text-[11.5px] font-extrabold shadow-sm transition active:scale-95"
            >
              <span className="text-[13px]">{emoji}</span> {label}
            </button>
          ))}
          <button
            onClick={() => setQuestOpen(true)}
            className="pointer-events-auto relative flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full border border-town-line bg-town-paper/95 px-2.5 py-1.5 text-[11.5px] font-extrabold shadow-sm transition active:scale-95"
            aria-label={T('오늘의 미션', 'Daily missions')}
          >
            <span className="text-[13px]">📜</span> {T('미션', 'Quest')}
            {questRemaining > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-town-coral px-1 text-[9px] font-extrabold text-white">
                {questRemaining}
              </span>
            )}
          </button>
        </div>
      )}

      {/* 안내 필 */}
      {editMode ? (
        <div className="pointer-events-none relative z-10 mt-2 flex justify-center px-6">
          <p className="rounded-full bg-town-ink/60 px-3 py-1 text-center text-[10.5px] font-bold text-white/95 backdrop-blur-sm">
            {editSel ? (
              <>
                <b className="text-town-sun">{editSel.label}</b>
                {editSel.canRotate
                  ? T(' — 드래그 이동 · ↻ 방향 전환 · ✓ 배치 · ✕ 보관함', ' — drag · ↻ rotate · ✓ place · ✕ storage')
                  : T(' — 끌어서 위치 이동 · ✓ 배치 · ✕ 보관함', ' — drag to move · ✓ place · ✕ storage')}
              </>
            ) : (
              T(
                '빈 곳 드래그 = 카메라 이동 · 오브젝트 탭 = 선택 · 아래 보관함에서 꺼내기',
                'Drag empty space = pan · tap object = select · pull from storage below',
              )
            )}
          </p>
        </div>
      ) : (
        !dialogue && !cutsceneOn && (
          <>
            <div className="pointer-events-none relative z-10 flex justify-center px-6">
              <p className="rounded-full bg-town-ink/55 px-3 py-1 text-[10.5px] font-bold text-white/95 backdrop-blur-sm">
                {emptyVillage
                  ? T(
                      '🕹️ 드래그로 산책 · 지도에서 체크인하면 건물이 생겨요',
                      '🕹️ Drag to stroll · check in on the map to earn buildings',
                    )
                  : T('🕹️ 화면 드래그 또는 방향키(WASD)로 이동', '🕹️ Drag or use arrow keys (WASD) to move')}
              </p>
            </div>
            {nextResident && (
              <div className="pointer-events-none relative z-10 mt-1 flex justify-center px-6">
                <p className="rounded-full bg-town-paper/85 px-3 py-1 text-[10px] font-extrabold text-town-inkSoft shadow-sm">
                  {T(
                    `풍성도 ${nextResident.unlockAt} 달성 시 ${nextResident.species} ${nextResident.name} 입주!`,
                    `${nextResident.nameEn} the ${nextResident.speciesEn} moves in at richness ${nextResident.unlockAt}!`,
                  )}
                </p>
              </div>
            )}
          </>
        )
      )}

      {/* 상호작용 버튼 (걷기 모드) — 좌석(벤치·소파)은 앉기 버튼 동반 */}
      {!editMode && !cutsceneOn && interact && !dialogue && !thingSheet && (
        <div className="absolute inset-x-0 bottom-40 z-20 flex flex-col items-center gap-2">
          {interact.kind === 'thing' && interact.sit && (
            <button
              onClick={() => gameRef.current?.toggleSit(interact.id)}
              className="pop-in flex items-center gap-2 rounded-full border-2 border-town-ink/10 bg-town-leafDark px-4 py-2.5 text-[13px] font-extrabold text-white shadow-card transition active:scale-95"
            >
              🪑 {sitting ? T('일어나기', 'Stand up') : T('앉기', 'Sit down')}
            </button>
          )}
          {!sitting && (
            <button
              onClick={() => {
                if (interact.kind === 'npc') openDialogueFor(interact);
                else if (interact.id === WRECK_THING_ID) setWreckOpen(true);
                else if (
                  interact.id === CAMP_THING_ID ||
                  interact.id === CAMP_FIRE_THING_ID ||
                  interact.id === CAMP_SWING_THING_ID
                )
                  setCampOpen(true);
                else if (interact.id === FALLS_THING_ID) startFallsCutscene();
                else setThingSheetId(interact.id);
              }}
              className="pop-in flex items-center gap-2 rounded-full border-2 border-town-ink/10 bg-town-paper px-4 py-2.5 text-[13px] font-extrabold shadow-card transition active:scale-95"
            >
              {interact.kind === 'npc' ? '💬' : '👀'} {interact.label}
              <span className="rounded-full bg-town-sun px-2 py-0.5 text-[10px]">
                {interact.kind === 'npc' ? T('말 걸기', 'Talk') : T('살펴보기', 'Inspect')}
              </span>
            </button>
          )}
        </div>
      )}

      {/* 대화 오버레이 */}
      {!editMode && dialogue && (
        <DialogueOverlay
          name={dialogue.name}
          title={dialogue.title}
          accent={dialogue.accent}
          lines={dialogue.lines}
          onClose={() => setDialogue(null)}
        />
      )}

      {/* 배치물 살펴보기 시트 (걷기 모드) */}
      {!editMode && thingSheet && (
        <div className="absolute inset-x-4 bottom-40 z-20">
          <div className="sheet-up flex items-center gap-3 rounded-2xl border border-town-line bg-town-paper p-3 shadow-card">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-town-cream">
              <div className="scale-[0.55]">
                <ObjectSvg kind={thingSheet.kind} refId={thingSheet.refId} />
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13.5px] font-extrabold">{thingSheetLabel}</p>
              <p className="text-[10.5px] font-bold text-town-inkSoft">
                {thingSheet.kind === 'store'
                  ? T('인증 방문으로 얻은 건물', 'Building earned by verified visit')
                  : thingSheet.kind === 'landmark'
                    ? T('랜드마크 미니어처', 'Landmark miniature')
                    : thingSheet.kind === 'npc'
                      ? T('우리 마을 이웃', 'Town neighbor')
                      : T('꾸미기 소품', 'Decor item')}
              </p>
            </div>
            <div className="flex shrink-0 gap-1.5">
              {thingSheet.kind === 'store' && (
                <button
                  onClick={() => {
                    const id = Number(thingSheet.refId);
                    const store = storeById(id);
                    setThingSheetId(null);
                    setTab('map');
                    selectStore(id);
                    if (store) requestFlyTo({ lat: store.lat - 0.00085, lng: store.lng, zoom: 17 });
                  }}
                  className="rounded-lg bg-town-leafDark px-2.5 py-2 text-[11px] font-extrabold text-white"
                >
                  {T('매장 보기', 'View store')}
                </button>
              )}
              <button
                onClick={() => {
                  setThingSheetId(null);
                  enterEdit();
                }}
                className="rounded-lg bg-town-sun px-2.5 py-2 text-[11px] font-extrabold text-town-ink"
              >
                {T('🔨 배치', '🔨 Edit')}
              </button>
              <button
                onClick={() => setThingSheetId(null)}
                className="rounded-lg border border-town-line bg-town-paper px-2 py-2 text-[11px] font-bold text-town-inkSoft"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 💰 보유 톡큰 HUD (걷기 모드, 좌측 하단) */}
      {!editMode && !cutsceneOn && (
        <div
          className="absolute bottom-24 left-4 z-20 flex items-center gap-1.5 rounded-full border-2 border-town-line bg-town-paper/95 px-3 py-2 shadow-card"
          aria-label={T('보유 톡큰', 'Tokken balance')}
        >
          <TokkenCoin size={18} />
          <span className="text-[13px] font-extrabold leading-none">{tokken.toLocaleString()}</span>
        </div>
      )}

      {/* 배치 모드 진입 FAB (걷기 모드) */}
      {!editMode && !cutsceneOn && (
        <button
          onClick={enterEdit}
          className="absolute bottom-24 right-4 z-20 flex h-14 w-14 flex-col items-center justify-center rounded-full border-2 border-town-line bg-town-paper text-[20px] shadow-card transition active:scale-95"
          aria-label="배치 모드"
        >
          🎒
          {inventory.length > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-town-coral px-1 text-[10px] font-extrabold text-white">
              {inventory.reduce((n, i) => n + i.count, 0)}
            </span>
          )}
        </button>
      )}

      {/* 배치 모드: 하단 도킹 보관함 */}
      {editMode && (
        <div className="absolute inset-x-0 bottom-16 z-30 px-3 pb-2">
          <div className="rounded-2xl border border-town-line bg-town-paper/95 p-2.5 shadow-card backdrop-blur">
            <p className="mb-1.5 px-1 text-[10.5px] font-extrabold text-town-inkSoft">
              {T('🎒 보관함', '🎒 Storage')}
              {inventory.length > 0 ? T(' · 탭하면 화면 가운데에 꺼내져요', ' · tap to spawn at screen center') : ''}
            </p>
            {inventory.length === 0 ? (
              <p className="px-1 pb-1 text-[11.5px] font-bold text-town-inkSoft/70">
                {T('비어 있어요 — 방문·조우·구매로 오브젝트를 모아보세요', 'Empty — collect objects by visiting, encountering, and shopping')}
              </p>
            ) : (
              <div
                ref={trayRef}
                onPointerDown={onTrayDown}
                onPointerMove={onTrayMove}
                onPointerUp={onTrayUp}
                onPointerCancel={onTrayUp}
                onClickCapture={onTrayClickCapture}
                onWheel={onTrayWheel}
                className="no-scrollbar flex gap-2 overflow-x-auto pb-0.5"
                style={{ touchAction: 'pan-x', overscrollBehaviorX: 'contain', cursor: 'grab' }}
              >
                {inventory.map((item) => (
                  <button
                    key={`${item.kind}:${item.refId}`}
                    onClick={() => gameRef.current?.spawnFromTray(trayMetaFor(item.kind, item.refId, item.label))}
                    className="relative flex w-[76px] shrink-0 flex-col items-center gap-1 rounded-xl border-2 border-town-line bg-town-cream/60 p-1.5 pt-2 transition active:scale-95"
                  >
                    <div className="flex h-11 items-end justify-center overflow-hidden">
                      <div className="scale-[0.52] origin-bottom">
                        <ObjectSvg kind={item.kind} refId={item.refId} />
                      </div>
                    </div>
                    <span className="w-full truncate text-center text-[9.5px] font-extrabold">
                      {item.label}
                    </span>
                    {item.count > 1 && (
                      <span className="absolute -right-1 -top-1 rounded-full bg-town-coral px-1.5 text-[9px] font-extrabold text-white">
                        ×{item.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 전체 회수 확인 모달 (배치 모드) */}
      {editMode && confirmingRecall && (
        <div className="absolute inset-0 z-[870] flex items-center justify-center bg-town-ink/45 px-8 fade-in">
          <div className="pop-in w-full rounded-[1.6rem] bg-town-paper p-5 text-center shadow-sheet">
            <p className="text-[30px]">🎒</p>
            <h3 className="mt-1 text-[17px] font-extrabold">{T('전체 회수', 'Recall All')}</h3>
            <p className="mt-1.5 text-[12.5px] leading-relaxed text-town-inkSoft">
              {T(
                `배치된 오브젝트 ${placements.length}개를 모두 보관함으로 되돌릴까요?`,
                `Return all ${placements.length} placed objects to storage?`,
              )}
              <br />
              {T('획득한 오브젝트는 사라지지 않아요.', 'You will not lose any of them.')}
            </p>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setConfirmingRecall(false)}
                className="w-1/3 rounded-xl border border-town-line bg-town-paper py-3 text-[13px] font-extrabold text-town-inkSoft"
              >
                {T('취소', 'Cancel')}
              </button>
              <button
                onClick={doRecallAll}
                className="flex-1 rounded-xl bg-town-coral py-3 text-[13.5px] font-extrabold text-white shadow-pop transition active:translate-y-[2px] active:shadow-none"
              >
                {T('🎒 전체 회수하기', '🎒 Recall everything')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 📸 마을 사진 모달 — 찰칵 플래시 후 저장/공유 */}
      {villagePhoto && (
        <div className="absolute inset-0 z-[880] flex items-center justify-center bg-town-ink/55 px-4 fade-in">
          <div className="shutter-flash pointer-events-none absolute inset-0 z-10 bg-white" />
          <div className="pop-in w-full rounded-[1.5rem] bg-town-paper p-3 shadow-sheet">
            <img
              src={villagePhoto}
              alt={T('내 마을 전경 사진', 'My village panorama')}
              className="w-full rounded-xl"
            />
            <p className="mt-1.5 text-center text-[10px] font-bold text-town-inkSoft">
              {T(
                '저장이 막힌 환경이면 사진을 길게 눌러 이미지로 저장할 수 있어요',
                'If saving is blocked here, long-press the photo to save it',
              )}
            </p>
            <div className="mt-2 flex gap-2">
              <button
                onClick={() => setVillagePhoto(null)}
                className="w-[76px] rounded-xl border border-town-line bg-town-paper py-3 text-[12.5px] font-extrabold text-town-inkSoft"
              >
                {T('닫기', 'Close')}
              </button>
              <button
                onClick={savePhoto}
                className="flex-1 rounded-xl bg-town-skyDeep py-3 text-[13px] font-extrabold text-white shadow-pop transition active:translate-y-[2px] active:shadow-none"
              >
                📥 {T('저장하기', 'Save')}
              </button>
              <button
                onClick={sharePhoto}
                className="flex-1 rounded-xl bg-town-leafDark py-3 text-[13px] font-extrabold text-white shadow-pop transition active:translate-y-[2px] active:shadow-none"
              >
                📤 {T('공유하기', 'Share')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🏝️ 섬 확장 확인 모달 */}
      {!editMode && expandTarget && expandTarget !== 'base' && (
        <div className="absolute inset-0 z-[860] flex items-center justify-center bg-town-ink/45 px-8 fade-in">
          <div className="pop-in w-full rounded-[1.6rem] bg-town-paper p-5 text-center shadow-sheet">
            {(() => {
              const info = zoneInfo(expandTarget)!;
              const npc = ZONE_NPCS[expandTarget as Exclude<VillageZoneId, 'base'>];
              return (
                <>
                  <p className="text-[34px]">{info.emoji}</p>
                  <h3 className="mt-1 text-[18px] font-extrabold">
                    {T(`${info.name} 확장`, `Expand ${info.nameEn}`)}
                  </h3>
                  <p className="mt-1.5 text-[12.5px] leading-relaxed text-town-inkSoft">
                    {T('섬이 지금 넓이만큼 한 칸 더 커져요.', 'Your island grows by one full zone.')}
                    <br />
                    {T(
                      `${npc.title} ${npc.species} '${npc.name}'이(가) 새 구역에 입주해요!`,
                      `${npc.nameEn} the ${npc.speciesEn} (${npc.titleEn}) moves into the new zone!`,
                    )}
                  </p>
                  <div className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-town-cream px-3 py-2.5">
                    <TokkenCoin size={20} />
                    <span className="text-[15px] font-extrabold">{expansionCost}</span>
                    <span className="text-[11px] font-bold text-town-inkSoft">
                      {T(`· 보유 ${tokken}`, `· you have ${tokken}`)}
                    </span>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => setExpandTarget(null)}
                      className="w-1/3 rounded-xl border border-town-line bg-town-paper py-3 text-[13px] font-extrabold text-town-inkSoft"
                    >
                      {T('취소', 'Cancel')}
                    </button>
                    <button
                      onClick={confirmExpand}
                      className="flex-1 rounded-xl bg-town-leafDark py-3 text-[13.5px] font-extrabold text-white shadow-pop transition active:translate-y-[2px] active:shadow-none"
                    >
                      {T(`🏝️ ${expansionCost} 톡큰으로 확장하기`, `🏝️ Expand for ${expansionCost} Tokken`)}
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* 🏕️ 캠프촌 시트 — 복구(300 톡큰) / 5시간마다 보급품 수거 */}
      {!editMode && campOpen && (
        <div className="absolute inset-0 z-[860] flex items-center justify-center bg-town-ink/45 px-8 fade-in">
          <div className="pop-in w-full rounded-[1.6rem] bg-town-paper p-5 text-center shadow-sheet">
            <p className="text-[34px]">{campRestored ? '⛺' : '🏕️'}</p>
            <h3 className="mt-1 text-[18px] font-extrabold">
              {campRestored ? T('캠프촌', 'Campsite') : T('무너진 캠프촌', 'Ruined Campsite')}
            </h3>
            {campRestored ? (
              <p className="mt-1.5 text-[12.5px] leading-relaxed text-town-inkSoft">
                {campClaimable
                  ? T('모닥불 곁에 보급품이 모여 있어요!', 'Supplies are waiting by the campfire!')
                  : T(`다음 보급품까지 ${campLeftLabel} — 5시간마다 모여요.`, `Next supplies in ${campLeftLabel} — every 5h.`)}
              </p>
            ) : (
              <>
                <p className="mt-1.5 text-[12.5px] leading-relaxed text-town-inkSoft">
                  {T(
                    '비바람에 주저앉은 캠프예요. 복구하면 숲을 오가는 캠퍼들이',
                    'A storm flattened this camp. Restore it and passing campers will',
                  )}
                  <br />
                  {T(`5시간마다 보급품 톡큰 +${FACILITY_SALVAGE}씩 남겨줘요.`, `leave +${FACILITY_SALVAGE} Tokken of supplies every 5h.`)}
                </p>
                <div className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-town-cream px-3 py-2.5">
                  <TokkenCoin size={20} />
                  <span className="text-[15px] font-extrabold">{CAMP_RESTORE_COST}</span>
                  <span className="text-[11px] font-bold text-town-inkSoft">{T(`· 보유 ${tokken}`, `· you have ${tokken}`)}</span>
                </div>
              </>
            )}
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setCampOpen(false)}
                className="w-1/3 rounded-xl border border-town-line bg-town-paper py-3 text-[13px] font-extrabold text-town-inkSoft"
              >
                {T('닫기', 'Close')}
              </button>
              {campRestored ? (
                <button
                  onClick={doClaimCamp}
                  className={`flex-1 rounded-xl py-3 text-[13.5px] font-extrabold shadow-pop transition active:translate-y-[2px] active:shadow-none ${
                    campClaimable ? 'bg-town-leafDark text-white' : 'bg-town-cream text-town-inkSoft'
                  }`}
                >
                  {campClaimable
                    ? T(`🎒 보급품 수거 (+${FACILITY_SALVAGE} 톡큰)`, `🎒 Collect supplies (+${FACILITY_SALVAGE})`)
                    : T(`🌲 ${campLeftLabel} 후 도착`, `🌲 Arrives in ${campLeftLabel}`)}
                </button>
              ) : (
                <button
                  onClick={doRestoreCamp}
                  className="flex-1 rounded-xl bg-town-leafDark py-3 text-[13.5px] font-extrabold text-white shadow-pop transition active:translate-y-[2px] active:shadow-none"
                >
                  {T(`🛠️ ${CAMP_RESTORE_COST} 톡큰으로 복구하기`, `🛠️ Restore for ${CAMP_RESTORE_COST} Tokken`)}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 🎁 통합 보상 팝업 — 캠프촌·난파선 보상을 한 화면에서 */}
      {!editMode && rewardsOpen && (
        <div className="absolute inset-0 z-[860] flex items-center justify-center bg-town-ink/45 px-7 fade-in">
          <div className="pop-in w-full rounded-[1.6rem] bg-town-paper p-5 shadow-sheet">
            <h3 className="text-[17px] font-extrabold">🎁 {T('시설 보상', 'Facility Rewards')}</h3>
            <p className="mt-1 text-[11px] font-bold text-town-inkSoft">
              {T('복구한 시설의 보상을 여기서 모아 받아요 — 5시간마다 충전!', 'Collect from restored facilities here — refills every 5h!')}
            </p>
            <ul className="mt-3 flex flex-col gap-2">
              <li
                className={`flex items-center gap-2.5 rounded-xl border px-3 py-2.5 ${
                  campClaimable ? 'border-town-leaf/60 bg-town-leaf/10' : 'border-town-line bg-town-cream/60'
                }`}
              >
                <span className="text-[20px]">{campRestored ? '⛺' : '🏕️'}</span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[12.5px] font-extrabold">{T('캠프촌', 'Campsite')}</span>
                  <span className="text-[10px] font-bold text-town-inkSoft">
                    {!campRestored
                      ? T('미복구 — 현장에서 복구할 수 있어요', 'Not restored yet — visit to restore')
                      : campClaimable
                        ? T('보급품 도착!', 'Supplies arrived!')
                        : T(`${campLeftLabel} 후 도착`, `in ${campLeftLabel}`)}
                  </span>
                </span>
                {campRestored ? (
                  <button
                    onClick={doClaimCamp}
                    disabled={!campClaimable}
                    className={`shrink-0 rounded-lg px-2.5 py-2 text-[11.5px] font-extrabold ${
                      campClaimable ? 'bg-town-leafDark text-white shadow-pop' : 'bg-town-cream text-town-inkSoft/60'
                    }`}
                  >
                    +{FACILITY_SALVAGE} {T('받기', 'Get')}
                  </button>
                ) : (
                  <span className="shrink-0 rounded-full bg-town-cream px-2 py-0.5 text-[10px] font-extrabold text-town-inkSoft/70">
                    🔒
                  </span>
                )}
              </li>
              <li
                className={`flex items-center gap-2.5 rounded-xl border px-3 py-2.5 ${
                  wreckClaimable ? 'border-town-sky/70 bg-town-sky/10' : 'border-town-line bg-town-cream/60'
                }`}
              >
                <span className="text-[20px]">{wreckRestored ? '⛵' : '🚢'}</span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[12.5px] font-extrabold">{T('난파선', 'Shipwreck')}</span>
                  <span className="text-[10px] font-bold text-town-inkSoft">
                    {!wreckRestored
                      ? T('미복구 — 현장에서 복구할 수 있어요', 'Not restored yet — visit to restore')
                      : wreckClaimable
                        ? T('표류물 도착!', 'Salvage arrived!')
                        : T(`${wreckLeftLabel} 후 도착`, `in ${wreckLeftLabel}`)}
                  </span>
                </span>
                {wreckRestored ? (
                  <button
                    onClick={doClaimWreck}
                    disabled={!wreckClaimable}
                    className={`shrink-0 rounded-lg px-2.5 py-2 text-[11.5px] font-extrabold ${
                      wreckClaimable ? 'bg-town-skyDeep text-white shadow-pop' : 'bg-town-cream text-town-inkSoft/60'
                    }`}
                  >
                    +{FACILITY_SALVAGE} {T('받기', 'Get')}
                  </button>
                ) : (
                  <span className="shrink-0 rounded-full bg-town-cream px-2 py-0.5 text-[10px] font-extrabold text-town-inkSoft/70">
                    🔒
                  </span>
                )}
              </li>
            </ul>
            <button
              onClick={() => setRewardsOpen(false)}
              className="mt-3 w-full rounded-xl bg-town-leafDark py-3 text-[13.5px] font-extrabold text-white shadow-pop transition active:translate-y-[2px] active:shadow-none"
            >
              {T('닫기', 'Close')}
            </button>
          </div>
        </div>
      )}

      {/* 🚢 난파선 시트 — 복구(300 톡큰) / 매일 표류물 수거 */}
      {!editMode && wreckOpen && (
        <div className="absolute inset-0 z-[860] flex items-center justify-center bg-town-ink/45 px-8 fade-in">
          <div className="pop-in w-full rounded-[1.6rem] bg-town-paper p-5 text-center shadow-sheet">
            <p className="text-[34px]">{wreckRestored ? '⛵' : '🚢'}</p>
            <h3 className="mt-1 text-[18px] font-extrabold">
              {wreckRestored ? T('복구된 범선', 'Restored Ship') : T('난파선', 'Shipwreck')}
            </h3>
            {wreckRestored ? (
              <p className="mt-1.5 text-[12.5px] leading-relaxed text-town-inkSoft">
                {wreckClaimable
                  ? T('표류물이 도착해 있어요!', 'Salvage has arrived!')
                  : T(`다음 표류물까지 ${wreckLeftLabel} — 5시간마다 밀려와요.`, `Next salvage in ${wreckLeftLabel} — arrives every 5h.`)}
              </p>
            ) : (
              <>
                <p className="mt-1.5 text-[12.5px] leading-relaxed text-town-inkSoft">
                  {T(
                    '폭풍에 떠밀려온 배예요. 복구하면 바다가 실어오는 표류물을',
                    'A storm washed this ship ashore. Restore it and the sea will',
                  )}
                  <br />
                  {T(`5시간마다 톡큰 +${FACILITY_SALVAGE}씩 가져다줘요.`, `bring +${FACILITY_SALVAGE} Tokken every 5 hours.`)}
                </p>
                <div className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-town-cream px-3 py-2.5">
                  <TokkenCoin size={20} />
                  <span className="text-[15px] font-extrabold">{WRECK_RESTORE_COST}</span>
                  <span className="text-[11px] font-bold text-town-inkSoft">{T(`· 보유 ${tokken}`, `· you have ${tokken}`)}</span>
                </div>
              </>
            )}
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setWreckOpen(false)}
                className="w-1/3 rounded-xl border border-town-line bg-town-paper py-3 text-[13px] font-extrabold text-town-inkSoft"
              >
                {T('닫기', 'Close')}
              </button>
              {wreckRestored ? (
                <button
                  onClick={doClaimWreck}
                  className={`flex-1 rounded-xl py-3 text-[13.5px] font-extrabold shadow-pop transition active:translate-y-[2px] active:shadow-none ${
                    wreckClaimable ? 'bg-town-skyDeep text-white' : 'bg-town-cream text-town-inkSoft'
                  }`}
                >
                  {wreckClaimable
                    ? T(`⚓ 표류물 수거 (+${FACILITY_SALVAGE} 톡큰)`, `⚓ Collect salvage (+${FACILITY_SALVAGE})`)
                    : T(`🌊 ${wreckLeftLabel} 후 도착`, `🌊 Arrives in ${wreckLeftLabel}`)}
                </button>
              ) : (
                <button
                  onClick={doRestoreWreck}
                  className="flex-1 rounded-xl bg-town-leafDark py-3 text-[13.5px] font-extrabold text-white shadow-pop transition active:translate-y-[2px] active:shadow-none"
                >
                  {T(`🛠️ ${WRECK_RESTORE_COST} 톡큰으로 복구하기`, `🛠️ Restore for ${WRECK_RESTORE_COST} Tokken`)}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 📜 오늘의 미션 패널 */}
      {!editMode && questOpen && (
        <div className="absolute inset-0 z-[860] flex items-center justify-center bg-town-ink/45 px-7 fade-in">
          <div className="pop-in w-full rounded-[1.6rem] bg-town-paper p-5 shadow-sheet">
            <div className="flex items-center justify-between">
              <h3 className="text-[17px] font-extrabold">📜 {T('오늘의 미션', 'Daily Missions')}</h3>
              <span className="rounded-full bg-town-cream px-2 py-0.5 text-[10px] font-bold text-town-inkSoft">
                {virtualToday(dayOffset)}
              </span>
            </div>
            <p className="mt-1 text-[11px] font-bold text-town-inkSoft">
              {T('매일 자정에 새로 열려요 — 완료 즉시 톡큰 지급!', 'Refreshes daily — Tokken paid instantly!')}
            </p>
            <ul className="mt-3 flex flex-col gap-2">
              {DAILY_QUESTS.map((q) => {
                const prog = questFresh ? questProgress[q.id] ?? 0 : 0;
                const done = prog >= q.target;
                return (
                  <li
                    key={q.id}
                    className={`flex items-center gap-2.5 rounded-xl border px-3 py-2.5 ${
                      done ? 'border-town-leaf/60 bg-town-leaf/10' : 'border-town-line bg-town-cream/60'
                    }`}
                  >
                    <span className="text-[18px]">{q.emoji}</span>
                    <span className="min-w-0 flex-1">
                      <span className={`block text-[12.5px] font-extrabold ${done ? 'line-through opacity-60' : ''}`}>
                        {T(q.label, q.labelEn)}
                      </span>
                      <span className="text-[10px] font-bold text-town-inkSoft">
                        {done ? T('완료!', 'Done!') : `${prog}/${q.target}`}
                        {q.id === 'clover' && !done && (
                          <> · {T('마을 어딘가에 반짝여요', 'sparkling somewhere in town')}</>
                        )}
                      </span>
                    </span>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-extrabold ${
                        done ? 'bg-town-leafDark text-white' : 'bg-town-sun text-town-ink'
                      }`}
                    >
                      {done ? '✓' : `+${q.reward}`}
                    </span>
                  </li>
                );
              })}
            </ul>
            <p className="mt-2.5 rounded-xl bg-town-cream px-3 py-2 text-center text-[11px] font-extrabold text-town-inkSoft">
              {questRemaining === 0
                ? T('🏅 오늘 미션 올클리어! 내일 또 만나요', '🏅 All clear today! See you tomorrow')
                : T(`3개 모두 완료하면 보너스 +${QUEST_ALL_CLEAR_BONUS} 톡큰!`, `Clear all 3 for +${QUEST_ALL_CLEAR_BONUS} bonus Tokken!`)}
            </p>
            <button
              onClick={() => setQuestOpen(false)}
              className="mt-3 w-full rounded-xl bg-town-leafDark py-3 text-[13.5px] font-extrabold text-white shadow-pop transition active:translate-y-[2px] active:shadow-none"
            >
              {T('닫기', 'Close')}
            </button>
          </div>
        </div>
      )}

      {/* 모달 (걷기 모드) */}
      {!editMode && modal === 'shop' && <ShopModal onClose={() => setModal(null)} />}
      {!editMode && modal === 'dex' && <DexModal onClose={() => setModal(null)} />}
      {!editMode && modal === 'card' && <ResidentCardModal onClose={() => setModal(null)} />}
      {!editMode && modal === 'dressing' && <DressingModal onClose={() => setModal(null)} />}
    </div>
  );
}
