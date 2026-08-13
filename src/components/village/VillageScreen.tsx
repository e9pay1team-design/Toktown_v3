// ─── 내 마을 (기획 §6 화면 9 · M4 전면 개편) ──────────────────────
// 동물의숲풍 걷는 마을: 2.5D 캔버스 월드 위를 내 캐릭터가 돌아다니고
// 카메라가 따라온다. 뒤쪽은 숲, 앞쪽은 바다. 기본 NPC 는 마을이 풍성해질
// 수록 입주하고, 말을 걸면 대화가 진행된다. 획득물은 보관함에서 꺼내
// 캐릭터 앞 타일에 배치(건물 2×2). 주민증/도감/상점/꾸미기 메뉴 유지.

import { useEffect, useMemo, useRef, useState } from 'react';
import { DECOR_ITEMS, DRUMMER_MAGPIE, LANDMARKS, REGIONAL_NPCS, storeById } from '../../data/seed';
import { useVillageStore, footprintOf, type PlacementKind } from '../../store/useVillageStore';
import { useCollectionStore } from '../../store/useCollectionStore';
import { useVisitStore } from '../../store/useVisitStore';
import { useProfileStore } from '../../store/useProfileStore';
import { useUiStore } from '../../store/useUiStore';
import { useToastStore } from '../../store/useToastStore';
import { VillageWorldCanvas } from './VillageWorld';
import { DialogueOverlay } from './DialogueOverlay';
import type { VillageGame, VInteractTarget } from '../../lib/villageGame';
import { residentNpcs, villageRichness, VILLAGE_NPCS } from '../../data/villageNpcs';
import { ShopModal } from './ShopModal';
import { DexModal } from './DexModal';
import { ResidentCardModal } from './ResidentCardModal';
import { DressingModal } from './DressingModal';
import { StoreBuilding } from '../../assets/buildings';
import { LandmarkSvg } from '../../assets/landmarks';
import { MagpieSvg } from '../../assets/npcs';
import { DecorSvg } from '../../assets/decor';

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

export function VillageScreen() {
  const nickname = useProfileStore((s) => s.profile?.nickname ?? '주민');
  const placements = useVillageStore((s) => s.placements);
  const decorOwned = useVillageStore((s) => s.decorOwned);
  const place = useVillageStore((s) => s.place);
  const removePlacement = useVillageStore((s) => s.remove);
  const events = useVisitStore((s) => s.events);
  const dex = useCollectionStore((s) => s.dex);
  const discovered = useCollectionStore((s) => s.landmarks);
  const setTab = useUiStore((s) => s.setTab);
  const selectStore = useUiStore((s) => s.selectStore);
  const requestFlyTo = useUiStore((s) => s.requestFlyTo);
  const toast = useToastStore((s) => s.show);

  const [placing, setPlacing] = useState<{ kind: PlacementKind; refId: string; label: string } | null>(null);
  const [placeTile, setPlaceTile] = useState<{ bx: number; by: number; ok: boolean } | null>(null);
  const [interact, setInteract] = useState<VInteractTarget | null>(null);
  const [dialogue, setDialogue] = useState<DialogueData | null>(null);
  const [thingSheetId, setThingSheetId] = useState<number | null>(null);
  const [trayOpen, setTrayOpen] = useState(false);
  const [modal, setModal] = useState<VillageModal>(null);
  const gameRef = useRef<VillageGame | null>(null);

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

  /* 인벤토리 = 획득 − 배치됨 */
  const inventory = useMemo<InvItem[]>(() => {
    const items: InvItem[] = [];
    for (const id of certifiedStoreIds) {
      if (!placedKeys.has(`store:${id}`)) {
        const store = storeById(id);
        if (store) items.push({ kind: 'store', refId: String(id), label: store.name, count: 1 });
      }
    }
    for (const npcId of dex) {
      if (!placedKeys.has(`npc:${npcId}`)) {
        const name = npcId === DRUMMER_MAGPIE.id ? DRUMMER_MAGPIE.name : REGIONAL_NPCS[0].name;
        items.push({ kind: 'npc', refId: npcId, label: name, count: 1 });
      }
    }
    for (const lmId of discovered) {
      if (!placedKeys.has(`landmark:${lmId}`)) {
        const lm = LANDMARKS.find((l) => l.id === lmId);
        if (lm) items.push({ kind: 'landmark', refId: lmId, label: lm.name, count: 1 });
      }
    }
    for (const [decorId, owned] of Object.entries(decorOwned)) {
      const placedCount = placements.filter((p) => p.kind === 'decor' && p.refId === decorId).length;
      const remain = owned - placedCount;
      if (remain > 0) {
        const item = DECOR_ITEMS.find((d) => d.id === decorId);
        if (item) items.push({ kind: 'decor', refId: decorId, label: item.name, count: remain });
      }
    }
    return items;
  }, [certifiedStoreIds, dex, discovered, decorOwned, placements, placedKeys]);

  /* 마을 풍성도 → 입주 주민, 새 입주 토스트 */
  const richness = villageRichness(placements.length, dex.length, discovered.length);
  const residents = residentNpcs(richness);
  const prevResidents = useRef(residents.length);
  useEffect(() => {
    if (residents.length > prevResidents.current) {
      const fresh = residents[residents.length - 1];
      toast(`🎉 ${fresh.species} ${fresh.name}이(가) 마을에 입주했어요!`, 'success');
    }
    prevResidents.current = residents.length;
  }, [residents.length, residents, toast]);

  const placedNpcCount = placements.filter((p) => p.kind === 'npc').length;
  const populationCount = 1 + residents.length + placedNpcCount;

  /* 다음 입주까지 남은 풍성도 */
  const nextResident = VILLAGE_NPCS.find((n) => n.unlockAt > richness);

  const startPlacing = (item: InvItem) => {
    setTrayOpen(false);
    setThingSheetId(null);
    setDialogue(null);
    setPlacing({ kind: item.kind, refId: item.refId, label: item.label });
  };

  const confirmPlace = () => {
    if (!placing) return;
    const tile = gameRef.current?.getPlacementTile();
    if (!tile?.ok) return;
    place(placing.kind, placing.refId, tile.bx, tile.by);
    toast(`${placing.label}을(를) 마을에 배치했어요!`, 'success');
    setPlacing(null);
  };

  const openDialogueFor = (target: VInteractTarget) => {
    if (target.kind !== 'npc') return;
    if (target.id.startsWith('placed-')) {
      const pid = Number(target.id.slice('placed-'.length));
      const p = placements.find((x) => x.id === pid);
      const drummer = p?.refId === DRUMMER_MAGPIE.id;
      const src = drummer ? DRUMMER_MAGPIE : REGIONAL_NPCS[0];
      setDialogue({
        name: src.name,
        title: drummer ? '한정 이웃' : '이웃',
        accent: drummer ? '#C2503F' : '#4A5568',
        lines: src.lines,
      });
      return;
    }
    const def = VILLAGE_NPCS.find((n) => n.id === target.id);
    if (!def) return;
    setDialogue({
      name: def.name,
      title: def.title,
      accent: def.skin.body,
      lines: def.dialogue,
    });
  };

  const thingSheet = thingSheetId !== null ? placements.find((p) => p.id === thingSheetId) ?? null : null;
  const thingSheetLabel = thingSheet
    ? thingSheet.kind === 'store'
      ? storeById(Number(thingSheet.refId))?.name
      : thingSheet.kind === 'landmark'
        ? LANDMARKS.find((l) => l.id === thingSheet.refId)?.name
        : DECOR_ITEMS.find((d) => d.id === thingSheet.refId)?.name
    : null;

  const emptyVillage = placements.length === 0 && inventory.length === 0;

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-[#3f9fc8]">
      {/* 월드 캔버스 (전면) */}
      <div className="absolute inset-0">
        <VillageWorldCanvas
          placingSize={placing ? footprintOf(placing.kind) : null}
          onInteract={setInteract}
          onPlacementTile={setPlaceTile}
          onGame={(g) => {
            gameRef.current = g;
          }}
        />
      </div>

      {/* 헤더 */}
      <header className="pointer-events-none relative z-10 flex items-center justify-between px-4 pt-12">
        <button
          onClick={() => setTab('map')}
          className="pointer-events-auto flex h-9 items-center gap-1 rounded-xl border border-town-line bg-town-paper/95 px-2.5 text-[12px] font-extrabold shadow-sm"
        >
          🗺️ 지도
        </button>
        <div className="rounded-2xl bg-town-paper/90 px-4 py-1.5 text-center shadow-sm backdrop-blur-sm">
          <h2 className="text-[15px] font-extrabold leading-tight">{nickname}의 마을</h2>
          <p className="text-[10px] font-bold text-town-inkSoft">주민 {populationCount}명 · 풍성도 {richness}</p>
        </div>
        <div className="w-[60px]" />
      </header>

      {/* 기능 버튼 */}
      <div className="pointer-events-none relative z-10 flex justify-center gap-2 px-4 py-2">
        {(
          [
            ['card', '🪪', '주민증'],
            ['dex', '📖', '도감'],
            ['shop', '🏪', '상점'],
            ['dressing', '🎨', '꾸미기'],
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

      {/* 조작 안내 / 빈 마을 가이드 */}
      {!placing && !dialogue && (
        <div className="pointer-events-none relative z-10 flex justify-center px-6">
          <p className="rounded-full bg-town-ink/55 px-3 py-1 text-[10.5px] font-bold text-white/95 backdrop-blur-sm">
            {emptyVillage
              ? '🕹️ 드래그로 산책 · 지도에서 체크인하면 건물이 생겨요'
              : '🕹️ 화면 드래그 또는 방향키(WASD)로 이동'}
          </p>
        </div>
      )}

      {/* 다음 입주 힌트 */}
      {nextResident && !placing && !dialogue && (
        <div className="pointer-events-none relative z-10 mt-1 flex justify-center px-6">
          <p className="rounded-full bg-town-paper/85 px-3 py-1 text-[10px] font-extrabold text-town-inkSoft shadow-sm">
            풍성도 {nextResident.unlockAt} 달성 시 {nextResident.species} <b>{nextResident.name}</b> 입주!
          </p>
        </div>
      )}

      {/* 배치 모드 배너 */}
      {placing && (
        <div className="pointer-events-none relative z-10 flex justify-center px-4 pt-1">
          <div className="pop-in rounded-2xl bg-town-ink/90 px-4 py-2 text-center text-[11.5px] font-bold text-town-paper shadow-card">
            <b className="text-town-sun">{placing.label}</b> 배치 중 — 캐릭터가 바라보는{' '}
            {footprintOf(placing.kind).w > 1 ? '2×2 ' : ''}칸에 표시돼요
          </div>
        </div>
      )}

      {/* 상호작용 버튼 */}
      {interact && !placing && !dialogue && !thingSheet && (
        <div className="absolute inset-x-0 bottom-40 z-20 flex justify-center">
          <button
            onClick={() => {
              if (interact.kind === 'npc') openDialogueFor(interact);
              else setThingSheetId(interact.id);
            }}
            className="pop-in flex items-center gap-2 rounded-full border-2 border-town-ink/10 bg-town-paper px-4 py-2.5 text-[13px] font-extrabold shadow-card transition active:scale-95"
          >
            {interact.kind === 'npc' ? '💬' : '👀'} {interact.label}
            <span className="rounded-full bg-town-sun px-2 py-0.5 text-[10px]">
              {interact.kind === 'npc' ? '말 걸기' : '살펴보기'}
            </span>
          </button>
        </div>
      )}

      {/* 대화 오버레이 */}
      {dialogue && (
        <DialogueOverlay
          name={dialogue.name}
          title={dialogue.title}
          accent={dialogue.accent}
          lines={dialogue.lines}
          onClose={() => setDialogue(null)}
        />
      )}

      {/* 배치물 살펴보기 시트 */}
      {thingSheet && (
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
                {thingSheet.kind === 'store' ? '인증 방문으로 얻은 건물' : thingSheet.kind === 'landmark' ? '랜드마크 미니어처' : '꾸미기 소품'}
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
                  매장 보기
                </button>
              )}
              <button
                onClick={() => {
                  removePlacement(thingSheet.id);
                  setThingSheetId(null);
                  toast('보관함으로 이동했어요', 'info');
                }}
                className="rounded-lg border border-town-line bg-town-paper px-2.5 py-2 text-[11px] font-bold text-town-inkSoft"
              >
                보관
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

      {/* 배치 확정 바 */}
      {placing && (
        <div className="absolute inset-x-4 bottom-24 z-20 flex gap-2">
          <button
            onClick={confirmPlace}
            disabled={!placeTile?.ok}
            className="flex-1 rounded-2xl bg-town-leafDark py-3 text-[14px] font-extrabold text-white shadow-pop transition active:translate-y-[2px] active:shadow-none disabled:bg-town-line disabled:text-town-inkSoft/50 disabled:shadow-none"
          >
            {placeTile?.ok ? '여기에 배치' : '빈 잔디를 향해 서 주세요'}
          </button>
          <button
            onClick={() => setPlacing(null)}
            className="rounded-2xl border border-town-line bg-town-paper px-4 py-3 text-[13px] font-extrabold text-town-inkSoft shadow-sm"
          >
            취소
          </button>
        </div>
      )}

      {/* 보관함 FAB */}
      {!placing && (
        <button
          onClick={() => setTrayOpen(!trayOpen)}
          className="absolute bottom-24 right-4 z-20 flex h-14 w-14 flex-col items-center justify-center rounded-full border-2 border-town-line bg-town-paper text-[20px] shadow-card transition active:scale-95"
          aria-label="보관함"
        >
          🎒
          {inventory.length > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-town-coral px-1 text-[10px] font-extrabold text-white">
              {inventory.reduce((n, i) => n + i.count, 0)}
            </span>
          )}
        </button>
      )}

      {/* 보관함 트레이 */}
      {trayOpen && !placing && (
        <div className="absolute inset-x-0 bottom-16 z-30 px-3 pb-2">
          <div className="sheet-up rounded-2xl border border-town-line bg-town-paper/97 p-2.5 shadow-card backdrop-blur">
            <div className="mb-1.5 flex items-center justify-between px-1">
              <p className="text-[10.5px] font-extrabold text-town-inkSoft">
                보관함 {inventory.length > 0 ? '· 탭해서 배치 시작' : ''}
              </p>
              <button
                onClick={() => setTrayOpen(false)}
                className="flex h-6 w-6 items-center justify-center rounded-full bg-town-cream text-[11px] font-bold text-town-inkSoft"
                aria-label="보관함 닫기"
              >
                ✕
              </button>
            </div>
            {inventory.length === 0 ? (
              <p className="px-1 pb-1 text-[11.5px] font-bold text-town-inkSoft/70">
                비어 있어요 — 방문·조우·구매로 오브젝트를 모아보세요
              </p>
            ) : (
              <div className="no-scrollbar flex gap-2 overflow-x-auto pb-0.5">
                {inventory.map((item) => (
                  <button
                    key={`${item.kind}:${item.refId}`}
                    onClick={() => startPlacing(item)}
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

      {/* 모달 */}
      {modal === 'shop' && <ShopModal onClose={() => setModal(null)} />}
      {modal === 'dex' && <DexModal onClose={() => setModal(null)} />}
      {modal === 'card' && <ResidentCardModal onClose={() => setModal(null)} />}
      {modal === 'dressing' && <DressingModal onClose={() => setModal(null)} />}
    </div>
  );
}
