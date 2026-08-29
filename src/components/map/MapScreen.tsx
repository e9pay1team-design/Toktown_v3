// ─── 지도 홈 (기획 §6 화면 1) ─────────────────────────────────────
// 지도(탑뷰) + 검색바 + 카테고리 칩 + 현재위치/내 마을 전환 버튼 +
// 핫플 랭킹 시트 + 매장 상세 / 검색 / 저장 장소 / 길찾기 / 이동 오버레이.

import { useEffect, useMemo, useState } from 'react';
import type { CategoryChip } from '../../store/useUiStore';
import { useUiStore } from '../../store/useUiStore';
import { useSavedStore } from '../../store/useSavedStore';
import { useProfileStore } from '../../store/useProfileStore';
import { useToastStore } from '../../store/useToastStore';
import { useDemoStore } from '../../store/useDemoStore';
import { useJourneyStore } from '../../store/useJourneyStore';
import { useEventStore } from '../../store/useEventStore';
import { useCollectionStore } from '../../store/useCollectionStore';
import { CHECKIN_RADIUS_M, distanceM, formatDistance, useVirtualLocation } from '../../mock/location';
import { useVirtualClock } from '../../mock/clock';
import { DRUMMER_MAGPIE, LANDMARKS, REGIONAL_NPCS, STORES, TOWN_EVENTS, regionalNpcById, storeById } from '../../data/seed';
import { regionById, regionOfPoint } from '../../data/regions';
import { useRegionStore } from '../../store/useRegionStore';
import { activeNpcSpots } from '../../lib/game';
import { checkLandmarkDiscovery } from '../../lib/actions';
import type { EventBooth } from '../../types';
import { MapView } from './MapView';
import { MapJoystick } from './MapJoystick';
import { EventSheet } from './EventSheet';
import { SearchOverlay } from './SearchOverlay';
import { HotSheet } from './HotSheet';
import { NpcEncounterModal } from './NpcEncounterModal';
import { StoreDetailSheet } from '../store/StoreDetailSheet';
import { SavedPlaces } from '../saved/SavedPlaces';
import { RouteSheet } from '../journey/RouteSheet';
import { JourneyOverlay } from '../journey/JourneyOverlay';
import { lmDesc, lmName, tr, useT } from '../../i18n';

const CHIPS: { id: CategoryChip; label: string; labelEn: string; emoji: string }[] = [
  { id: 'food', label: '맛집', labelEn: 'Food', emoji: '🍚' },
  { id: 'cafe', label: '카페', labelEn: 'Cafe', emoji: '☕' },
  { id: 'saved', label: '저장', labelEn: 'Saved', emoji: '❤️' },
  { id: 'event', label: '이벤트', labelEn: 'Event', emoji: '🎪' },
];

export function MapScreen() {
  const activeTab = useUiStore((s) => s.activeTab);
  const selectedStoreId = useUiStore((s) => s.selectedStoreId);
  const selectStore = useUiStore((s) => s.selectStore);
  const categoryFilter = useUiStore((s) => s.categoryFilter);
  const setCategoryFilter = useUiStore((s) => s.setCategoryFilter);
  const searchOpen = useUiStore((s) => s.searchOpen);
  const setSearchOpen = useUiStore((s) => s.setSearchOpen);
  const savedListOpen = useUiStore((s) => s.savedListOpen);
  const setSavedListOpen = useUiStore((s) => s.setSavedListOpen);
  const routeSheetFor = useUiStore((s) => s.routeSheetFor);
  const setRouteSheetFor = useUiStore((s) => s.setRouteSheetFor);
  const setHotSheetOpen = useUiStore((s) => s.setHotSheetOpen);
  const flyTo = useUiStore((s) => s.flyTo);
  const requestFlyTo = useUiStore((s) => s.requestFlyTo);

  const savedIds = useSavedStore((s) => s.savedIds);
  const character = useProfileStore((s) => s.profile?.character);
  const position = useVirtualLocation((s) => s.position);
  const teleport = useVirtualLocation((s) => s.teleport);
  const toast = useToastStore((s) => s.show);
  const dayOffset = useVirtualClock((s) => s.dayOffset);
  const clickTeleportArmed = useDemoStore((s) => s.clickTeleportArmed);
  const setClickTeleportArmed = useDemoStore((s) => s.setClickTeleportArmed);
  const journeyPhase = useJourneyStore((s) => s.phase);
  const journeyRoute = useJourneyStore((s) => s.route);
  const activeEventId = useEventStore((s) => s.activeEventId);
  const dex = useCollectionStore((s) => s.dex);
  const [encounterNpcId, setEncounterNpcId] = useState<string | null>(null);
  const [joyActive, setJoyActive] = useState(false);
  const [eventSheetOpen, setEventSheetOpen] = useState(false);
  const T = useT();

  const regionId = useRegionStore((s) => s.regionId);
  const setRegion = useRegionStore((s) => s.setRegion);
  const region = regionById(regionId);
  const activeEvent = TOWN_EVENTS.find((e) => e.id === activeEventId) ?? null;

  /* 부스/게이트 길찾기 — 시트를 닫고 지도 이동 + 도보 안내 토스트 */
  const guideToBooth = (booth: EventBooth) => {
    setEventSheetOpen(false);
    requestFlyTo({ lat: booth.lat, lng: booth.lng, zoom: 17 });
    const d = distanceM(position, booth);
    toast(
      tr(
        `🧭 ${booth.name}까지 ${formatDistance(d)} · 도보 약 ${Math.max(1, Math.ceil(d / 67))}분`,
        `🧭 ${booth.nameEn ?? booth.name}: ${formatDistance(d)} · ~${Math.max(1, Math.ceil(d / 67))} min walk`,
      ),
      'info',
    );
  };

  const npcSpots = useMemo(() => {
    // 모든 지역 마스코트의 활성 지점 — 마커는 전 지역에 존재하고,
    // 카메라(지역 한계)가 현재 지역의 마커만 보여준다.
    const spots = REGIONAL_NPCS.flatMap((npc) =>
      activeNpcSpots(npc, dayOffset).map((s) => ({ ...s, npcId: npc.id })),
    );
    if (activeEvent) spots.push({ ...DRUMMER_MAGPIE.spot, npcId: DRUMMER_MAGPIE.id, variant: 'drummer' as const });
    return spots;
  }, [dayOffset, activeEvent]);

  const filteredStores = useMemo(() => {
    switch (categoryFilter) {
      case 'food':
        return STORES.filter((s) => ['국밥', '한식', '면'].includes(s.category));
      case 'cafe':
        return STORES.filter((s) => s.category === '카페');
      case 'event':
        return STORES.filter((s) => s.category === '공연장');
      case 'saved':
        return STORES.filter((s) => savedIds.includes(s.id));
      default:
        return STORES;
    }
  }, [categoryFilter, savedIds]);

  /* 지도 탭을 벗어나면 지도 위 오버레이 정리 */
  useEffect(() => {
    if (activeTab !== 'map') {
      setSearchOpen(false);
      setSavedListOpen(false);
      setRouteSheetFor(null);
      setHotSheetOpen(false);
      setEventSheetOpen(false);
      selectStore(null);
    }
  }, [activeTab, setSearchOpen, setSavedListOpen, setRouteSheetFor, setHotSheetOpen, selectStore]);

  const openStore = (id: number) => {
    const store = storeById(id);
    if (!store) return;
    // 다른 지역 매장(검색·저장 목록 진입) → 카메라 지역을 먼저 전환
    const storeRegion = regionOfPoint(store);
    if (storeRegion.id !== regionId) setRegion(storeRegion.id);
    selectStore(id);
    // 상세 시트가 하단을 덮으므로 마커가 위쪽에 보이도록 남쪽 오프셋
    requestFlyTo({ lat: store.lat - 0.00085, lng: store.lng, zoom: 17 });
  };

  if (!character) return null;

  return (
    <div className="absolute inset-0">
      {/* 지도 */}
      <div className="absolute inset-0 z-0">
        <MapView
          region={region}
          stores={filteredStores}
          savedIds={savedIds}
          selectedStoreId={selectedStoreId}
          npcSpots={npcSpots}
          landmarks={LANDMARKS}
          myPosition={position}
          character={character}
          flyTo={flyTo}
          routeLine={journeyPhase !== 'idle' && journeyRoute ? journeyRoute.polyline : null}
          follow={journeyPhase === 'riding' || joyActive}
          eventCircle={
            activeEvent
              ? { lat: activeEvent.venue.lat, lng: activeEvent.venue.lng, radiusM: activeEvent.radiusM }
              : null
          }
          eventBooths={activeEvent ? activeEvent.booths : null}
          onBoothClick={(booth) =>
            toast(
              tr(
                `${booth.emoji} ${booth.name} — ${booth.hours} · ${booth.info}`,
                `${booth.emoji} ${booth.nameEn ?? booth.name} — ${booth.hoursEn ?? booth.hours} · ${booth.infoEn ?? booth.info}`,
              ),
              'info',
            )
          }
          onStoreClick={openStore}
          onNpcClick={(spot) => {
            const npcId = spot.npcId ?? (spot.variant === 'drummer' ? DRUMMER_MAGPIE.id : 'magpie');
            const npc = regionalNpcById(npcId);
            const npcName = tr(npc.name, npc.nameEn ?? npc.name);
            const spotLabel = tr(spot.label, spot.labelEn ?? spot.label);
            const emoji = npc.species === '고양이' ? '🐈' : '🐦';
            const dist = distanceM(position, spot);
            if (dist > CHECKIN_RADIUS_M) {
              toast(
                tr(
                  `${emoji} ${npcName}이(가) ${spotLabel}에 있어요 — ${formatDistance(dist)} 더 가까이 가야 만날 수 있어요`,
                  `${emoji} ${npcName} is at ${spotLabel} — get ${formatDistance(dist)} closer to meet`,
                ),
                'info',
              );
              return;
            }
            if (dex.includes(npcId)) {
              const lines = tr(npc.lines, npc.linesEn ?? npc.lines);
              toast(`${emoji} ${npcName}: "${lines[Math.floor(Math.random() * lines.length)]}"`, 'info');
              return;
            }
            setEncounterNpcId(npcId);
          }}
          onLandmarkClick={(lm) => toast(`📍 ${lmName(lm)} — ${lmDesc(lm)}`, 'info')}
          onMapClick={(latlng) => {
            if (clickTeleportArmed) {
              teleport(latlng);
              setClickTeleportArmed(false);
              toast(tr('🚶 내 위치를 이동했어요 (가상 GPS)', '🚶 Moved my location (virtual GPS)'), 'success');
              setTimeout(checkLandmarkDiscovery, 400);
            } else {
              selectStore(null);
            }
          }}
        />
      </div>

      {/* 지도 클릭 이동 모드 안내 */}
      {clickTeleportArmed && (
        <div className="pointer-events-none absolute inset-x-0 top-24 z-[520] flex justify-center">
          <span className="pop-in rounded-full bg-town-ink/90 px-4 py-2 text-[12px] font-bold text-town-paper shadow-card">
            {T('🎯 지도를 클릭하면 내 위치가 이동해요', '🎯 Click the map to move your location')}
          </span>
        </div>
      )}

      {/* 상단: 검색바 + 카테고리 칩 (이동 중에는 배너와 겹치지 않게 숨김) */}
      {journeyPhase !== 'riding' && (
        <div className="pointer-events-none absolute inset-x-0 top-0 z-[500] px-4 pt-11">
          <button
            onClick={() => setSearchOpen(true)}
            className="pointer-events-auto flex w-full items-center gap-2.5 rounded-2xl border border-town-line bg-town-paper px-4 py-3 text-left shadow-card"
          >
            <svg width={18} height={18} viewBox="0 0 24 24" aria-hidden>
              <circle cx={10.5} cy={10.5} r={6.5} fill="none" stroke="#8C7B6E" strokeWidth={2.6} />
              <line x1={15.5} y1={15.5} x2={21} y2={21} stroke="#8C7B6E" strokeWidth={2.6} strokeLinecap="round" />
            </svg>
            <span className="text-[14px] font-medium text-town-inkSoft/70">
              {T('매장, 음식, 장소 검색', 'Search stores, food, places')}
            </span>
          </button>

          <div className="mt-2.5 flex gap-2">
            {CHIPS.map((chip) => {
              const active = categoryFilter === chip.id;
              return (
                <button
                  key={chip.id}
                  onClick={() => setCategoryFilter(active ? null : chip.id)}
                  aria-label={`${chip.label} 필터`}
                  className={`pointer-events-auto flex items-center gap-1 rounded-full px-3 py-1.5 text-[12.5px] font-bold shadow-card transition ${
                    active
                      ? 'bg-town-ink text-town-paper'
                      : 'border border-town-line bg-town-paper text-town-ink'
                  }`}
                >
                  <span className="text-[11px]">{chip.emoji}</span>
                  {T(chip.label, chip.labelEn)}
                </button>
              );
            })}
          </div>

          {/* Event Map 활성 배너 — 탭하면 이벤트 상세 시트 */}
          {activeEvent && (
            <button
              onClick={() => setEventSheetOpen(true)}
              className="pop-in pointer-events-auto mt-2 flex w-full items-center gap-2 rounded-2xl border-2 border-[#8B79C9] bg-[#F3F0FC] px-3.5 py-2.5 text-left shadow-card"
            >
              <span className="text-[18px]">🎪</span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[12.5px] font-extrabold text-[#5F4FA0]">
                  {T(`${activeEvent.title} 진행 중`, `${activeEvent.titleEn ?? activeEvent.title} is live`)}
                </span>
                <span className="block truncate text-[10px] font-bold text-[#8B79C9]">
                  {T(
                    `안내·부스 위치·운영시간 · 반경 ${activeEvent.radiusM}m 한정 혜택`,
                    `Notices · booths · hours · benefits within ${activeEvent.radiusM}m`,
                  )}
                </span>
              </span>
              <span className="shrink-0 text-[11px] font-extrabold text-[#8B79C9]">
                {T('자세히 →', 'Details →')}
              </span>
            </button>
          )}
        </div>
      )}

      {/* 우측 플로팅: 현재위치 (내 마을 이동은 하단 탭이 담당) */}
      <div className="absolute bottom-40 right-4 z-[500] flex flex-col gap-2.5">
        <button
          onClick={() => requestFlyTo({ ...position, zoom: 17 })}
          className="flex h-12 w-12 items-center justify-center rounded-2xl border border-town-line bg-town-paper shadow-card transition active:scale-95"
          aria-label="현재 위치로"
          title="현재 위치"
        >
          <svg width={22} height={22} viewBox="0 0 32 32" aria-hidden>
            <circle cx={16} cy={16} r={6} fill="#5EB3CC" />
            <circle cx={16} cy={16} r={2.6} fill="#FFFDF7" />
            <path d="M16 2 v6 M16 24 v6 M2 16 h6 M24 16 h6" stroke="#5EB3CC" strokeWidth={2.8} strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* 좌측 하단: 가상 위치 조이스틱 (이동 중에는 숨김) */}
      {journeyPhase === 'idle' && (
        <div className="absolute bottom-40 left-4 z-[500]">
          <MapJoystick onActive={setJoyActive} />
        </div>
      )}

      {/* 저장 필터 시 목록 열기 버튼 */}
      {categoryFilter === 'saved' && (
        <button
          onClick={() => setSavedListOpen(true)}
          className="pop-in absolute bottom-24 left-1/2 z-[500] -translate-x-1/2 rounded-full bg-town-ink px-5 py-2.5 text-[13px] font-bold text-town-paper shadow-card"
        >
          {T(`❤️ 저장 목록 보기 (${savedIds.length})`, `❤️ View saved places (${savedIds.length})`)}
        </button>
      )}

      {/* 핫플 랭킹 (이동 중·저장 필터 중에는 필 숨김) */}
      {journeyPhase === 'idle' && categoryFilter !== 'saved' && <HotSheet onPick={openStore} />}

      {/* 오버레이들 */}
      {eventSheetOpen && activeEvent && (
        <EventSheet event={activeEvent} onClose={() => setEventSheetOpen(false)} onGuide={guideToBooth} />
      )}
      {selectedStoreId !== null && (
        <StoreDetailSheet storeId={selectedStoreId} onClose={() => selectStore(null)} />
      )}
      {routeSheetFor !== null && <RouteSheet storeId={routeSheetFor} />}
      <JourneyOverlay />
      {searchOpen && <SearchOverlay onPick={openStore} />}
      {savedListOpen && <SavedPlaces onPick={openStore} />}
      {encounterNpcId && (
        <NpcEncounterModal npcId={encounterNpcId} onClose={() => setEncounterNpcId(null)} />
      )}
    </div>
  );
}
