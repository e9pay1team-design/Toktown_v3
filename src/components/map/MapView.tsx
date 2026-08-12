// ─── Leaflet 지도 뷰 ──────────────────────────────────────────────
// 기본 타일은 깔끔하게 유지(길찾기 정확성 우선)하고, 핵심 오브젝트만
// 톡타운 아트스타일 SVG 로 오버레이한다 (기획 §3.1 이중 공간).
// ⚠ 지도 타일: Leaflet + OpenStreetMap (API 키 불필요, 영어 지도).
//   실서비스 전환 시 네이버/카카오 지도 SDK 로 교체 예정.

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { renderToStaticMarkup } from 'react-dom/server';
import type { Landmark, LatLng, NpcSpot, Store } from '../../types';
import { MAP_CENTER, MAP_ZOOM } from '../../data/seed';
import { StorePin, NpcBubble } from '../../assets/markers';
import { LandmarkSvg } from '../../assets/landmarks';
import { CharacterSvg } from '../../assets/CharacterSvg';
import type { CharacterConfig } from '../../types';

interface MapViewProps {
  stores: Store[];
  savedIds: number[];
  selectedStoreId: number | null;
  npcSpots: NpcSpot[];
  landmarks: Landmark[];
  myPosition: LatLng;
  character: CharacterConfig;
  flyTo: (LatLng & { zoom?: number; seq: number }) | null;
  onStoreClick: (id: number) => void;
  onNpcClick: (spot: NpcSpot) => void;
  onLandmarkClick: (lm: Landmark) => void;
  onMapClick: () => void;
}

/** 매장 핀 divIcon */
function storeIcon(store: Store, saved: boolean, selected: boolean): L.DivIcon {
  const w = selected ? 52 : 40;
  const h = (w * 54) / 44;
  return L.divIcon({
    className: 'toktown-marker',
    html: renderToStaticMarkup(
      <StorePin category={store.category} saved={saved} selected={selected} />,
    ),
    iconSize: [w, h],
    iconAnchor: [w / 2, h * 0.93],
  });
}

const npcIcon = () =>
  L.divIcon({
    className: 'toktown-marker',
    html: `<div class="npc-bounce">${renderToStaticMarkup(<NpcBubble />)}</div>`,
    iconSize: [52, 60],
    iconAnchor: [26, 57],
  });

/** 랜드마크별 렌더 크기 — LandmarkSvg 내부 비율(id별 상이)과 일치해야 함 */
const LANDMARK_SIZE: Record<string, [number, number]> = {
  cathedral: [58, 61],
  namsan: [46, 74],
  cheonggyecheon: [64, 45],
  gwanghwamun: [61, 58],
};

function landmarkIcon(lm: Landmark): L.DivIcon {
  const [w, h] = LANDMARK_SIZE[lm.id] ?? [56, 56];
  return L.divIcon({
    className: 'toktown-marker',
    html: renderToStaticMarkup(<LandmarkSvg id={lm.id} size={lm.id === 'namsan' ? 64 : 58} />),
    iconSize: [w, h],
    iconAnchor: [w / 2, h - 3],
  });
}

function myIcon(character: CharacterConfig): L.DivIcon {
  const char = renderToStaticMarkup(<CharacterSvg config={character} size={58} shadow={false} />);
  return L.divIcon({
    className: 'toktown-marker',
    html:
      `<div style="position:relative;width:64px;height:78px">` +
      `<div class="ring-pulse" style="position:absolute;left:9px;bottom:0;width:46px;height:19px;border-radius:50%;background:rgba(94,179,204,.30);border:2.5px solid #5EB3CC"></div>` +
      `<div class="char-bob" style="position:absolute;left:9px;bottom:7px">${char}</div>` +
      `</div>`,
    iconSize: [64, 78],
    iconAnchor: [32, 72],
  });
}

export function MapView(props: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const storeLayerRef = useRef<L.LayerGroup | null>(null);
  const npcLayerRef = useRef<L.LayerGroup | null>(null);
  const landmarkLayerRef = useRef<L.LayerGroup | null>(null);
  const myMarkerRef = useRef<L.Marker | null>(null);
  // 최신 콜백을 이벤트 핸들러에서 참조하기 위한 ref
  const cbRef = useRef(props);
  cbRef.current = props;

  /* 지도 초기화 (1회) */
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const map = L.map(el, {
      center: [MAP_CENTER.lat, MAP_CENTER.lng],
      zoom: MAP_ZOOM,
      zoomControl: false,
      minZoom: 13,
      maxZoom: 19,
      maxBounds: L.latLngBounds([37.51, 126.9], [37.62, 127.05]),
      maxBoundsViscosity: 0.8,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap',
    }).addTo(map);

    map.on('click', () => cbRef.current.onMapClick());

    storeLayerRef.current = L.layerGroup().addTo(map);
    npcLayerRef.current = L.layerGroup().addTo(map);
    landmarkLayerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  /* 매장 마커 */
  useEffect(() => {
    const layer = storeLayerRef.current;
    if (!layer) return;
    layer.clearLayers();
    for (const store of props.stores) {
      const selected = props.selectedStoreId === store.id;
      const marker = L.marker([store.lat, store.lng], {
        icon: storeIcon(store, props.savedIds.includes(store.id), selected),
        zIndexOffset: selected ? 800 : 100,
      });
      marker.bindTooltip(store.name, {
        direction: 'top',
        offset: [0, -44],
        className: 'toktown-tooltip',
      });
      marker.on('click', () => cbRef.current.onStoreClick(store.id));
      layer.addLayer(marker);
    }
  }, [props.stores, props.savedIds, props.selectedStoreId]);

  /* NPC 마커 (지역 한정 출몰) */
  useEffect(() => {
    const layer = npcLayerRef.current;
    if (!layer) return;
    layer.clearLayers();
    for (const spot of props.npcSpots) {
      const marker = L.marker([spot.lat, spot.lng], { icon: npcIcon(), zIndexOffset: 500 });
      marker.bindTooltip(`까치 까미 · ${spot.label}`, {
        direction: 'top',
        offset: [0, -56],
        className: 'toktown-tooltip',
      });
      marker.on('click', () => cbRef.current.onNpcClick(spot));
      layer.addLayer(marker);
    }
  }, [props.npcSpots]);

  /* 랜드마크 오버레이 */
  useEffect(() => {
    const layer = landmarkLayerRef.current;
    if (!layer) return;
    layer.clearLayers();
    for (const lm of props.landmarks) {
      const marker = L.marker([lm.lat, lm.lng], { icon: landmarkIcon(lm), zIndexOffset: 50 });
      marker.bindTooltip(lm.name, {
        direction: 'bottom',
        offset: [0, 6],
        permanent: true,
        className: 'landmark-label',
      });
      marker.on('click', () => cbRef.current.onLandmarkClick(lm));
      layer.addLayer(marker);
    }
  }, [props.landmarks]);

  /* 내 캐릭터 */
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (myMarkerRef.current) myMarkerRef.current.remove();
    myMarkerRef.current = L.marker([props.myPosition.lat, props.myPosition.lng], {
      icon: myIcon(props.character),
      zIndexOffset: 1000,
      interactive: false,
    }).addTo(map);
  }, [props.myPosition, props.character]);

  /* 카메라 이동 요청 */
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !props.flyTo) return;
    map.flyTo([props.flyTo.lat, props.flyTo.lng], props.flyTo.zoom ?? map.getZoom(), {
      duration: 0.8,
    });
  }, [props.flyTo]);

  return <div ref={containerRef} className="h-full w-full" />;
}
