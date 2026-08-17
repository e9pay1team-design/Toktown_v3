// ─── Leaflet 지도 뷰 ──────────────────────────────────────────────
// 배경은 코드 내장 일러스트 벡터 지도(data/myeongdongMap)를 캔버스
// 타일로 직접 그린다 — 외부 타일 서버 의존이 없어 웹 공유 샌드박스·
// 오프라인·사내 프록시 어디서나 동일하게 보이고, 톡타운 아트스타일과도
// 맞는다. 매장 POI 아이콘 없음 — 매장 표시는 톡타운 자체 마커가 전담.
// 실서비스 전환 시 네이버/카카오 지도 SDK 로 교체 예정.

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { renderToStaticMarkup } from 'react-dom/server';
import type { Landmark, LatLng, NpcSpot, Store } from '../../types';
import { MAP_CENTER, MAP_ZOOM } from '../../data/seed';
import {
  PARKS,
  PARK_TREES,
  ROADS,
  ROAD_MIN_ZOOM,
  ROAD_WIDTH_M,
  WATER,
  type RoadClass,
} from '../../data/myeongdongMap';
import { StorePin, NpcBubble } from '../../assets/markers';
import { LandmarkSvg } from '../../assets/landmarks';
import { CharacterSvg } from '../../assets/CharacterSvg';
import type { CharacterConfig } from '../../types';
import { lmName, sName, tr, useLang } from '../../i18n';

interface MapViewProps {
  stores: Store[];
  savedIds: number[];
  selectedStoreId: number | null;
  npcSpots: NpcSpot[];
  landmarks: Landmark[];
  myPosition: LatLng;
  character: CharacterConfig;
  flyTo: (LatLng & { zoom?: number; seq: number }) | null;
  /** 이동 중 경로 폴리라인 (M2) */
  routeLine: LatLng[] | null;
  /** 이동 중 카메라가 내 캐릭터를 따라감 (M2) */
  follow: boolean;
  /** Event Map 활성 시 혜택 반경 오버레이 (M3) */
  eventCircle: (LatLng & { radiusM: number }) | null;
  onStoreClick: (id: number) => void;
  onNpcClick: (spot: NpcSpot) => void;
  onLandmarkClick: (lm: Landmark) => void;
  onMapClick: (latlng: LatLng) => void;
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

const npcIcon = (drummer: boolean) =>
  L.divIcon({
    className: 'toktown-marker',
    html: `<div class="npc-bounce">${renderToStaticMarkup(<NpcBubble drummer={drummer} />)}</div>`,
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

// ── 일러스트 벡터 지도 타일 렌더 ──────────────────────────────────
const TILE_D = 256;
const lngToPx = (lng: number, z: number) => ((lng + 180) / 360) * TILE_D * 2 ** z;
const latToPx = (lat: number, z: number) => {
  const r = (lat * Math.PI) / 180;
  return ((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2) * TILE_D * 2 ** z;
};

const ROAD_CASING: Record<RoadClass, string> = {
  major: '#DFCFB0',
  mid: '#DFCFB0',
  minor: '#E3D6BB',
  ped: '#E6DAC1',
};
const ROAD_FILL: Record<RoadClass, string> = {
  major: '#FFF6E3',
  mid: '#FFFCF3',
  minor: '#FFFCF3',
  ped: '#F7EFDD',
};

function drawIllustratedTile(g: CanvasRenderingContext2D, coords: L.Coords, w: number, h: number): void {
  // 1) 종이 질감 바탕.
  g.fillStyle = '#EFF2E3';
  g.fillRect(0, 0, w, h);
  let s = (coords.x * 73856093) ^ (coords.y * 19349663) ^ (coords.z * 83492791);
  const rnd = () => {
    s = (Math.imul(s, 1664525) + 1013904223) | 0;
    return ((s >>> 8) & 0xffff) / 0x10000;
  };
  for (let i = 0; i < 6; i++) {
    const r = 26 + rnd() * 52;
    const cx = r + rnd() * Math.max(1, w - r * 2);
    const cy = r + rnd() * Math.max(1, h - r * 2);
    g.fillStyle = i % 2 ? 'rgba(214,226,190,0.35)' : 'rgba(233,239,216,0.5)';
    g.beginPath();
    g.ellipse(cx, cy, r, r * (0.55 + rnd() * 0.45), rnd() * Math.PI, 0, Math.PI * 2);
    g.fill();
  }
  g.fillStyle = 'rgba(148,170,120,0.13)';
  for (let i = 0; i < 36; i++) {
    g.fillRect(4 + rnd() * (w - 8), 4 + rnd() * (h - 8), 2, 2);
  }

  // 2) 벡터 지리 — 타일마다 전체 지오메트리를 그린다(캔버스가 알아서 클립;
  //    경계를 넘는 선분도 이웃 타일과 이어져 보인다). 데이터가 작아 저렴하다.
  const z = coords.z;
  const ox = coords.x * TILE_D;
  const oy = coords.y * TILE_D;
  const mpp = (156543.03392 * Math.cos((37.5636 * Math.PI) / 180)) / 2 ** z;
  const px = (m: number, min = 1) => Math.max(min, m / mpp);
  const tracePath = (pts: [number, number][], close = false) => {
    g.beginPath();
    pts.forEach(([lat, lng], i) => {
      const x = lngToPx(lng, z) - ox;
      const y = latToPx(lat, z) - oy;
      if (i === 0) g.moveTo(x, y);
      else g.lineTo(x, y);
    });
    if (close) g.closePath();
  };
  g.lineJoin = 'round';
  g.lineCap = 'round';

  // 공원·녹지.
  for (const poly of PARKS) {
    tracePath(poly, true);
    g.fillStyle = '#CDE3AE';
    g.fill();
    g.strokeStyle = '#B7D398';
    g.lineWidth = px(3, 1);
    g.stroke();
  }

  // 청계천.
  for (const stream of WATER) {
    tracePath(stream);
    g.strokeStyle = '#7FB0C4';
    g.lineWidth = px(20, 3.4);
    g.stroke();
    tracePath(stream);
    g.strokeStyle = '#A5D3E2';
    g.lineWidth = px(15, 2.2);
    g.stroke();
  }

  // 도로 — 케이싱 전체 → 채움 전체 순서로 그려야 교차로가 자연스럽다.
  const visible = ROADS.filter((way) => z >= ROAD_MIN_ZOOM[way.c]);
  for (const way of visible) {
    tracePath(way.p);
    g.strokeStyle = ROAD_CASING[way.c];
    g.lineWidth = px(way.w ?? ROAD_WIDTH_M[way.c]) + px(2.4, 1.4);
    g.stroke();
  }
  for (const way of visible) {
    tracePath(way.p);
    g.strokeStyle = ROAD_FILL[way.c];
    g.lineWidth = px(way.w ?? ROAD_WIDTH_M[way.c]);
    g.stroke();
  }

  // 남산 숲 나무 (확대 시).
  if (z >= 15) {
    const r = Math.max(3, px(9));
    for (const [lat, lng] of PARK_TREES) {
      const x = lngToPx(lng, z) - ox;
      const y = latToPx(lat, z) - oy;
      if (x < -30 || y < -30 || x > w + 30 || y > h + 30) continue;
      g.fillStyle = 'rgba(74,59,50,0.12)';
      g.beginPath();
      g.ellipse(x, y + r * 0.9, r * 0.9, r * 0.32, 0, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = '#79AE60';
      g.beginPath();
      g.arc(x, y, r, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = '#8CC073';
      g.beginPath();
      g.arc(x - r * 0.28, y - r * 0.3, r * 0.55, 0, Math.PI * 2);
      g.fill();
    }
  }
}

const IllustratedTileLayer = L.GridLayer.extend({
  createTile(this: L.GridLayer, coords: L.Coords): HTMLElement {
    const size = this.getTileSize();
    const tile = document.createElement('canvas');
    // 레티나 선명도: 캔버스 해상도 2배, CSS 크기는 Leaflet 이 관리.
    tile.width = size.x * 2;
    tile.height = size.y * 2;
    const g = tile.getContext('2d');
    if (g) {
      g.scale(2, 2);
      drawIllustratedTile(g, coords, size.x, size.y);
    }
    return tile;
  },
}) as unknown as new (options?: L.GridLayerOptions) => L.GridLayer;

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
  const routeLayerRef = useRef<L.LayerGroup | null>(null);
  const myMarkerRef = useRef<L.Marker | null>(null);
  // 최신 콜백을 이벤트 핸들러에서 참조하기 위한 ref
  const cbRef = useRef(props);
  cbRef.current = props;
  // 언어 변경 시 마커 툴팁·라벨 재생성
  const lang = useLang();

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

    // 일러스트 벡터 지도 — 외부 타일 서버 없이 항상 그려진다.
    new IllustratedTileLayer({ zIndex: 1 }).addTo(map);

    map.on('click', (e) => cbRef.current.onMapClick({ lat: e.latlng.lat, lng: e.latlng.lng }));

    storeLayerRef.current = L.layerGroup().addTo(map);
    npcLayerRef.current = L.layerGroup().addTo(map);
    landmarkLayerRef.current = L.layerGroup().addTo(map);
    routeLayerRef.current = L.layerGroup().addTo(map);
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
      marker.bindTooltip(sName(store), {
        direction: 'top',
        offset: [0, -44],
        className: 'toktown-tooltip',
      });
      marker.on('click', () => cbRef.current.onStoreClick(store.id));
      layer.addLayer(marker);
    }
  }, [props.stores, props.savedIds, props.selectedStoreId, lang]);

  /* NPC 마커 (지역 한정 출몰) */
  useEffect(() => {
    const layer = npcLayerRef.current;
    if (!layer) return;
    layer.clearLayers();
    for (const spot of props.npcSpots) {
      const drummer = spot.variant === 'drummer';
      const marker = L.marker([spot.lat, spot.lng], {
        icon: npcIcon(drummer),
        zIndexOffset: drummer ? 600 : 500,
      });
      marker.bindTooltip(
        `${tr(drummer ? '드러머 까미 🎪' : '까치 까미', drummer ? 'Drummer Kkami 🎪' : 'Kkami the Magpie')} · ${tr(spot.label, spot.labelEn ?? spot.label)}`,
        {
          direction: 'top',
          offset: [0, -56],
          className: 'toktown-tooltip',
        },
      );
      marker.on('click', () => cbRef.current.onNpcClick(spot));
      layer.addLayer(marker);
    }
  }, [props.npcSpots, lang]);

  /* Event Map 혜택 반경 */
  const eventLayerRef = useRef<L.Circle | null>(null);
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    eventLayerRef.current?.remove();
    eventLayerRef.current = null;
    if (!props.eventCircle) return;
    eventLayerRef.current = L.circle([props.eventCircle.lat, props.eventCircle.lng], {
      radius: props.eventCircle.radiusM,
      color: '#8B79C9',
      weight: 2.5,
      dashArray: '6 8',
      fillColor: '#8B79C9',
      fillOpacity: 0.08,
    }).addTo(map);
  }, [props.eventCircle]);

  /* 랜드마크 오버레이 */
  useEffect(() => {
    const layer = landmarkLayerRef.current;
    if (!layer) return;
    layer.clearLayers();
    for (const lm of props.landmarks) {
      const marker = L.marker([lm.lat, lm.lng], { icon: landmarkIcon(lm), zIndexOffset: 50 });
      marker.bindTooltip(lmName(lm), {
        direction: 'bottom',
        offset: [0, 6],
        permanent: true,
        className: 'landmark-label',
      });
      marker.on('click', () => cbRef.current.onLandmarkClick(lm));
      layer.addLayer(marker);
    }
  }, [props.landmarks, lang]);

  /* 내 캐릭터 — 마커는 캐릭터 변경 시에만 재생성, 위치는 setLatLng 로 갱신
     (이동 중 프레임 단위 갱신이 있어 재생성하면 DOM 부하가 큼) */
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (myMarkerRef.current) myMarkerRef.current.remove();
    myMarkerRef.current = L.marker([props.myPosition.lat, props.myPosition.lng], {
      icon: myIcon(props.character),
      zIndexOffset: 1000,
      interactive: false,
    }).addTo(map);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.character]);

  useEffect(() => {
    const map = mapRef.current;
    myMarkerRef.current?.setLatLng([props.myPosition.lat, props.myPosition.lng]);
    if (map && props.follow) {
      map.panTo([props.myPosition.lat, props.myPosition.lng], { animate: false });
    }
  }, [props.myPosition, props.follow]);

  /* 이동 경로 폴리라인 */
  useEffect(() => {
    const layer = routeLayerRef.current;
    if (!layer) return;
    layer.clearLayers();
    if (!props.routeLine || props.routeLine.length < 2) return;
    const pts = props.routeLine.map((p) => [p.lat, p.lng]) as [number, number][];
    layer.addLayer(
      L.polyline(pts, { color: '#FFFDF7', weight: 9, opacity: 0.9, lineCap: 'round' }),
    );
    layer.addLayer(
      L.polyline(pts, {
        color: '#4E9B58',
        weight: 5,
        opacity: 0.95,
        dashArray: '1 10',
        lineCap: 'round',
      }),
    );
    const end = pts[pts.length - 1];
    layer.addLayer(
      L.marker(end, {
        icon: L.divIcon({
          className: 'toktown-marker',
          html: '<div style="font-size:22px;filter:drop-shadow(0 2px 2px rgba(74,59,50,.3))">🏁</div>',
          iconSize: [24, 24],
          iconAnchor: [4, 22],
        }),
        interactive: false,
      }),
    );
  }, [props.routeLine]);

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
