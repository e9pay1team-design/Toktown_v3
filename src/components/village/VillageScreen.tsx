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
import { useVirtualClock, virtualToday } from '../../mock/clock';
import { useVillageStore, type PlacementKind } from '../../store/useVillageStore';
import { useCollectionStore } from '../../store/useCollectionStore';
import { useVisitStore } from '../../store/useVisitStore';
import { useProfileStore } from '../../store/useProfileStore';
import { useUiStore } from '../../store/useUiStore';
import { useToastStore } from '../../store/useToastStore';
import { VillageWorldCanvas, trayMetaFor } from './VillageWorld';
import { DialogueOverlay } from './DialogueOverlay';
import { GROUND_DECOR, type VillageGame, type VInteractTarget } from '../../lib/villageGame';
import { residentNpcs, villageRichness, VILLAGE_NPCS } from '../../data/villageNpcs';
import { ShopModal } from './ShopModal';
import { DexModal } from './DexModal';
import { ResidentCardModal } from './ResidentCardModal';
import { DressingModal } from './DressingModal';
import { StoreBuilding } from '../../assets/buildings';
import { LandmarkSvg } from '../../assets/landmarks';
import { MagpieSvg } from '../../assets/npcs';
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
  if (kind === 'npc') return <MagpieSvg size={54} drummer={refId === 'magpie-drummer'} />;
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
  const [editMode, setEditMode] = useState(false);
  const [confirmingRecall, setConfirmingRecall] = useState(false);
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
  const populationCount = 1 + residents.length + placedNpcCount;
  const nextResident = VILLAGE_NPCS.find((n) => n.unlockAt > richness);

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
  }) => {
    if (e.placementId === null) {
      place(e.kind as PlacementKind, e.refId, e.bx, e.by, e.facing);
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
          onGame={(g) => {
            gameRef.current = g;
            if (g) g.onSitChange = setSitting;
          }}
        />
      </div>

      {/* 헤더 */}
      <header className="pointer-events-none relative z-10 flex items-center justify-between px-4 pt-12">
        {editMode ? (
          <button
            onClick={recallAll}
            className="pointer-events-auto flex h-9 items-center gap-1 rounded-xl border border-town-coral/60 bg-town-paper/95 px-2.5 text-[12px] font-extrabold text-town-coralDeep shadow-sm transition active:scale-95"
            aria-label={T('모든 오브젝트 보관함으로 회수', 'Recall all objects to storage')}
          >
            {T('🎒 전체 회수', '🎒 Recall all')}
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

      {/* 기능 버튼 (걷기 모드) */}
      {!editMode && (
        <div className="pointer-events-none relative z-10 flex justify-center gap-2 px-4 py-2">
          {(
            [
              ['card', '🪪', T('주민증', 'ID Card')],
              ['dex', '📖', T('도감', 'Dex')],
              ['shop', '🏪', T('상점', 'Shop')],
              ['dressing', '🎨', T('꾸미기', 'Style')],
            ] as const
          ).map(([id, emoji, label]) => (
            <button
              key={id}
              onClick={() => setModal(id)}
              className="pointer-events-auto flex items-center gap-1 rounded-full border border-town-line bg-town-paper/95 px-3 py-1.5 text-[12px] font-extrabold shadow-sm transition active:scale-95"
            >
              <span>{emoji}</span> {label}
            </button>
          ))}
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
        !dialogue && (
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
      {!editMode && interact && !dialogue && !thingSheet && (
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

      {/* 배치 모드 진입 FAB (걷기 모드) */}
      {!editMode && (
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

      {/* 모달 (걷기 모드) */}
      {!editMode && modal === 'shop' && <ShopModal onClose={() => setModal(null)} />}
      {!editMode && modal === 'dex' && <DexModal onClose={() => setModal(null)} />}
      {!editMode && modal === 'card' && <ResidentCardModal onClose={() => setModal(null)} />}
      {!editMode && modal === 'dressing' && <DressingModal onClose={() => setModal(null)} />}
    </div>
  );
}
