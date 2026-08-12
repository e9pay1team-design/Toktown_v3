// ─── 내 마을 (기획 §6 화면 9) ─────────────────────────────────────
// 아이소메트릭 마을 뷰 + 인벤토리 트레이(획득 오브젝트) + 배치/드래그 +
// 캐릭터 꾸미기 / Tokken 상점 / NPC 도감 / 주민증.
// "현실에서 얻고, 마을에 쌓인다" — 획득 자동, 배치 수동.

import { useMemo, useState } from 'react';
import { DECOR_ITEMS, DRUMMER_MAGPIE, LANDMARKS, REGIONAL_NPCS, storeById } from '../../data/seed';
import { useVillageStore, type PlacementKind } from '../../store/useVillageStore';
import { useCollectionStore } from '../../store/useCollectionStore';
import { useVisitStore } from '../../store/useVisitStore';
import { useProfileStore } from '../../store/useProfileStore';
import { useUiStore } from '../../store/useUiStore';
import { useToastStore } from '../../store/useToastStore';
import { IsoVillage, ObjectSvg } from './IsoVillage';
import { ShopModal } from './ShopModal';
import { DexModal } from './DexModal';
import { ResidentCardModal } from './ResidentCardModal';
import { DressingModal } from './DressingModal';
import { OwlSvg } from '../../assets/npcs';

interface InvItem {
  kind: PlacementKind;
  refId: string;
  label: string;
  count: number;
}

type VillageModal = 'shop' | 'dex' | 'card' | 'dressing' | null;

export function VillageScreen() {
  const nickname = useProfileStore((s) => s.profile?.nickname ?? '주민');
  const placements = useVillageStore((s) => s.placements);
  const decorOwned = useVillageStore((s) => s.decorOwned);
  const place = useVillageStore((s) => s.place);
  const move = useVillageStore((s) => s.move);
  const removePlacement = useVillageStore((s) => s.remove);
  const events = useVisitStore((s) => s.events);
  const dex = useCollectionStore((s) => s.dex);
  const discovered = useCollectionStore((s) => s.landmarks);
  const setTab = useUiStore((s) => s.setTab);
  const selectStore = useUiStore((s) => s.selectStore);
  const requestFlyTo = useUiStore((s) => s.requestFlyTo);
  const toast = useToastStore((s) => s.show);

  const [placing, setPlacing] = useState<{ kind: PlacementKind; refId: string; label: string } | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [modal, setModal] = useState<VillageModal>(null);

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

  const selected = placements.find((p) => p.id === selectedId) ?? null;
  const selectedLabel = selected
    ? selected.kind === 'store'
      ? storeById(Number(selected.refId))?.name
      : selected.kind === 'npc'
        ? selected.refId === DRUMMER_MAGPIE.id
          ? DRUMMER_MAGPIE.name
          : REGIONAL_NPCS[0].name
        : selected.kind === 'landmark'
          ? LANDMARKS.find((l) => l.id === selected.refId)?.name
          : DECOR_ITEMS.find((d) => d.id === selected.refId)?.name
    : null;

  const emptyVillage = placements.length === 0 && inventory.length === 0;

  return (
    <div className="flex h-full flex-col bg-gradient-to-b from-[#FDF6E9] to-[#E8F4E3]">
      {/* 헤더 */}
      <header className="flex items-center justify-between px-4 pb-1 pt-12">
        <button
          onClick={() => setTab('map')}
          className="flex h-9 items-center gap-1 rounded-xl border border-town-line bg-town-paper px-2.5 text-[12px] font-extrabold shadow-sm"
        >
          🗺️ 지도
        </button>
        <div className="text-center">
          <h2 className="text-[17px] font-extrabold leading-tight">{nickname}의 마을</h2>
          <p className="text-[10.5px] font-bold text-town-inkSoft">명동 도보권 · 주민 1명</p>
        </div>
        <div className="w-[60px]" />
      </header>

      {/* 기능 버튼 */}
      <div className="flex justify-center gap-2 px-4 py-2">
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
            className="flex items-center gap-1 rounded-full border border-town-line bg-town-paper px-3 py-1.5 text-[12px] font-extrabold shadow-sm transition active:scale-95"
          >
            <span>{emoji}</span> {label}
          </button>
        ))}
      </div>

      {/* 배치 모드 배너 */}
      {placing && (
        <div className="pointer-events-none absolute inset-x-0 top-[150px] z-20 flex justify-center">
          <div className="pointer-events-auto pop-in flex items-center gap-2 rounded-full bg-town-ink/90 px-4 py-2 text-[12px] font-bold text-town-paper shadow-card">
            <span>
              <b className="text-town-sun">{placing.label}</b> — 빈 타일을 탭해 배치
            </span>
            <button
              onClick={() => setPlacing(null)}
              className="rounded-full bg-town-paper/20 px-2 py-0.5 text-[11px]"
            >
              취소
            </button>
          </div>
        </div>
      )}

      {/* 마을 캔버스 */}
      <div className="min-h-0 flex-1 px-1">
        <IsoVillage
          placements={placements}
          placing={placing}
          selectedId={selectedId}
          onPlaceAt={(row, col) => {
            if (!placing) return;
            if (place(placing.kind, placing.refId, row, col)) {
              toast(`${placing.label}을(를) 마을에 배치했어요!`, 'success');
              setPlacing(null);
            }
          }}
          onSelect={setSelectedId}
          onMove={(id, row, col) => move(id, row, col)}
        />
      </div>

      {/* 빈 마을 가이드 */}
      {emptyVillage && (
        <div className="pointer-events-none absolute inset-x-8 top-1/2 z-10 -translate-y-1/3">
          <div className="rounded-2xl border-2 border-dashed border-town-leaf bg-town-paper/90 p-4 text-center shadow-card">
            <div className="mx-auto w-fit">
              <OwlSvg size={88} />
            </div>
            <p className="mt-1 text-[13.5px] font-extrabold">아직 마을이 비어 있다네!</p>
            <p className="mt-1 text-[12px] leading-relaxed text-town-inkSoft">
              지도에서 <b>체크인·인증 리뷰</b>를 하면 매장 건물을,
              <br />
              골목의 <b>동물 친구</b>를 만나면 이웃을 얻는다네.
            </p>
          </div>
        </div>
      )}

      {/* 선택된 오브젝트 액션 */}
      {selected && !placing && (
        <div className="absolute inset-x-4 bottom-40 z-20">
          <div className="sheet-up flex items-center gap-3 rounded-2xl border border-town-line bg-town-paper p-3 shadow-card">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-town-cream">
              <div className="scale-[0.55]">
                <ObjectSvg kind={selected.kind} refId={selected.refId} />
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13.5px] font-extrabold">{selectedLabel}</p>
              <p className="text-[10.5px] font-bold text-town-inkSoft">끌어서 이동할 수 있어요</p>
            </div>
            <div className="flex shrink-0 gap-1.5">
              {selected.kind === 'store' && (
                <button
                  onClick={() => {
                    const id = Number(selected.refId);
                    const store = storeById(id);
                    setSelectedId(null);
                    setTab('map');
                    selectStore(id);
                    if (store) requestFlyTo({ lat: store.lat - 0.00085, lng: store.lng, zoom: 17 });
                  }}
                  className="rounded-lg bg-town-leafDark px-2.5 py-2 text-[11px] font-extrabold text-white"
                >
                  매장 보기
                </button>
              )}
              {selected.kind === 'npc' && (
                <button
                  onClick={() => {
                    const npc = selected.refId === DRUMMER_MAGPIE.id ? DRUMMER_MAGPIE : REGIONAL_NPCS[0];
                    toast(`🐦 ${npc.name}: "${npc.lines[Math.floor(Math.random() * npc.lines.length)]}"`, 'info');
                  }}
                  className="rounded-lg bg-town-sky px-2.5 py-2 text-[11px] font-extrabold text-town-ink"
                >
                  대사
                </button>
              )}
              <button
                onClick={() => {
                  removePlacement(selected.id);
                  setSelectedId(null);
                  toast('보관함으로 이동했어요', 'info');
                }}
                className="rounded-lg border border-town-line bg-town-paper px-2.5 py-2 text-[11px] font-bold text-town-inkSoft"
              >
                보관
              </button>
              <button
                onClick={() => setSelectedId(null)}
                className="rounded-lg border border-town-line bg-town-paper px-2 py-2 text-[11px] font-bold text-town-inkSoft"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 인벤토리 트레이 */}
      <div className="absolute inset-x-0 bottom-16 z-10 px-3 pb-2">
        <div className="rounded-2xl border border-town-line bg-town-paper/95 p-2.5 shadow-card backdrop-blur">
          <p className="mb-1.5 px-1 text-[10.5px] font-extrabold text-town-inkSoft">
            보관함 {inventory.length > 0 ? `· 탭해서 배치` : ''}
          </p>
          {inventory.length === 0 ? (
            <p className="px-1 pb-1 text-[11.5px] font-bold text-town-inkSoft/70">
              비어 있어요 — 방문·조우·구매로 오브젝트를 모아보세요
            </p>
          ) : (
            <div className="no-scrollbar flex gap-2 overflow-x-auto pb-0.5">
              {inventory.map((item) => (
                <button
                  key={`${item.kind}:${item.refId}`}
                  onClick={() => {
                    setSelectedId(null);
                    setPlacing(item);
                  }}
                  className={`relative flex w-[76px] shrink-0 flex-col items-center gap-1 rounded-xl border-2 p-1.5 pt-2 transition ${
                    placing?.refId === item.refId && placing?.kind === item.kind
                      ? 'border-town-sun bg-town-sun/15'
                      : 'border-town-line bg-town-cream/60'
                  }`}
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

      {/* 모달 */}
      {modal === 'shop' && <ShopModal onClose={() => setModal(null)} />}
      {modal === 'dex' && <DexModal onClose={() => setModal(null)} />}
      {modal === 'card' && <ResidentCardModal onClose={() => setModal(null)} />}
      {modal === 'dressing' && <DressingModal onClose={() => setModal(null)} />}
    </div>
  );
}
