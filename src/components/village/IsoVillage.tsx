// ─── 아이소메트릭 마을 캔버스 (SVG) ───────────────────────────────
// 클래시 오브 클랜형 잔디 다이아몬드 그리드(브리프 §1). 게임엔진 없이
// SVG 로 구현. 그리드 스냅 배치(탭) + 드래그 이동 + 오브젝트 선택.
// 지도 마커와 동일한 건물/NPC/랜드마크 에셋을 재사용한다.

import { useRef, useState, type PointerEvent } from 'react';
import type { Placement, PlacementKind } from '../../store/useVillageStore';
import { storeById } from '../../data/seed';
import { StoreBuilding } from '../../assets/buildings';
import { LandmarkSvg } from '../../assets/landmarks';
import { MagpieSvg } from '../../assets/npcs';
import { DecorSvg } from '../../assets/decor';
import {
  GRID_COLS,
  GRID_ROWS,
  ISO_VIEW_H,
  ISO_VIEW_W,
  TILE_H,
  TILE_W,
  cellToXY,
  tilePath,
  xyToCell,
} from '../../lib/iso';

/** 오브젝트 렌더 크기 (바닥 중심 앵커 계산용) */
function objectDims(kind: PlacementKind, refId: string): { w: number; h: number } {
  if (kind === 'store') return { w: 80, h: 74 };
  if (kind === 'npc') return { w: 54, h: 54 };
  if (kind === 'landmark') {
    switch (refId) {
      case 'cathedral':
        return { w: 56, h: 59 };
      case 'namsan':
        return { w: 42, h: 67 };
      case 'cheonggyecheon':
        return { w: 62, h: 44 };
      default:
        return { w: 59, h: 56 };
    }
  }
  switch (refId) {
    case 'lamp':
      return { w: 31, h: 57 };
    case 'flower':
      return { w: 52, h: 34 };
    case 'fountain':
      return { w: 52, h: 52 };
    case 'mailbox':
      return { w: 32, h: 52 };
    case 'tree':
      return { w: 52, h: 55 };
    case 'nanta-drum':
      return { w: 44, h: 52 };
    default:
      return { w: 52, h: 39 }; // bench
  }
}

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

interface IsoVillageProps {
  placements: Placement[];
  /** 인벤토리에서 선택한 배치 대기 오브젝트 */
  placing: { kind: PlacementKind; refId: string } | null;
  selectedId: number | null;
  onPlaceAt: (row: number, col: number) => void;
  onSelect: (placementId: number | null) => void;
  onMove: (placementId: number, row: number, col: number) => boolean;
}

export function IsoVillage({
  placements,
  placing,
  selectedId,
  onPlaceAt,
  onSelect,
  onMove,
}: IsoVillageProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [drag, setDrag] = useState<{
    placementId: number;
    cell: { row: number; col: number } | null;
    moved: boolean;
  } | null>(null);

  /** 클라이언트 좌표 → SVG 좌표 */
  const toSvgPoint = (clientX: number, clientY: number) => {
    const svg = svgRef.current;
    if (!svg) return null;
    const pt = svg.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;
    const ctm = svg.getScreenCTM();
    if (!ctm) return null;
    return pt.matrixTransform(ctm.inverse());
  };

  const cellAt = (clientX: number, clientY: number) => {
    const p = toSvgPoint(clientX, clientY);
    return p ? xyToCell(p.x, p.y) : null;
  };

  const occupied = (row: number, col: number, exceptId?: number) =>
    placements.some((p) => p.row === row && p.col === col && p.id !== exceptId);

  /* 배경 클릭: 배치 모드면 배치, 아니면 선택 해제 */
  const handleCanvasClick = (e: PointerEvent<SVGSVGElement>) => {
    if (drag?.moved) return;
    const cell = cellAt(e.clientX, e.clientY);
    if (placing) {
      if (cell && !occupied(cell.row, cell.col)) onPlaceAt(cell.row, cell.col);
      return;
    }
    if (!cell || !placements.some((p) => p.row === cell.row && p.col === cell.col)) {
      onSelect(null);
    }
  };

  /* 오브젝트 드래그 */
  const handleObjectDown = (e: PointerEvent, placement: Placement) => {
    if (placing) return;
    e.stopPropagation();
    (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
    setDrag({ placementId: placement.id, cell: null, moved: false });
  };

  const handlePointerMove = (e: PointerEvent<SVGSVGElement>) => {
    if (!drag) return;
    const cell = cellAt(e.clientX, e.clientY);
    setDrag((d) => (d ? { ...d, cell, moved: true } : d));
  };

  const handlePointerUp = () => {
    if (!drag) return;
    const { placementId, cell, moved } = drag;
    setDrag(null);
    if (!moved) {
      onSelect(placementId);
      return;
    }
    if (cell && !occupied(cell.row, cell.col, placementId)) {
      onMove(placementId, cell.row, cell.col);
    }
  };

  /* 렌더 위치: 드래그 중이면 스냅 셀로 미리보기 */
  const renderPos = (p: Placement) => {
    if (drag?.placementId === p.id && drag.cell) return drag.cell;
    return { row: p.row, col: p.col };
  };

  const sorted = [...placements].sort((a, b) => {
    const pa = renderPos(a);
    const pb = renderPos(b);
    return pa.row + pa.col - (pb.row + pb.col) || pa.row - pb.row;
  });

  /* 그리드 외곽 다이아몬드 (땅 두께 연출) */
  const corner = (r: number, c: number) => cellToXY(r, c);
  const top = corner(0, 0);
  const right = corner(0, GRID_COLS - 1);
  const bottom = corner(GRID_ROWS - 1, GRID_COLS - 1);
  const left = corner(GRID_ROWS - 1, 0);
  const outline = `M${top.x} ${top.y - TILE_H / 2} L${right.x + TILE_W / 2} ${right.y} L${bottom.x} ${bottom.y + TILE_H / 2} L${left.x - TILE_W / 2} ${left.y} Z`;

  const tiles = [];
  for (let r = 0; r < GRID_ROWS; r++) {
    for (let c = 0; c < GRID_COLS; c++) {
      const { x, y } = cellToXY(r, c);
      const isOccupied = occupied(r, c);
      const placeable = placing && !isOccupied;
      const isDragTarget =
        drag?.cell && drag.cell.row === r && drag.cell.col === c;
      tiles.push(
        <g key={`${r}-${c}`}>
          <path
            d={tilePath(x, y)}
            fill={(r + c) % 2 === 0 ? '#A8D98A' : '#9BD07C'}
            stroke="#8FC46F"
            strokeWidth={1}
          />
          {placeable && (
            <path d={tilePath(x, y, 5)} fill="#FFF8EC" opacity={0.5} className="tile-blink" />
          )}
          {isDragTarget && (
            <path
              d={tilePath(x, y, 3)}
              fill={occupied(r, c, drag.placementId) ? '#F2705E' : '#FFD66B'}
              opacity={0.55}
            />
          )}
        </g>,
      );
    }
  }

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${ISO_VIEW_W} ${ISO_VIEW_H}`}
      className="h-full w-full"
      style={{ touchAction: 'none' }}
      onClick={handleCanvasClick}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      {/* 하늘/배경 장식 */}
      <circle cx={82} cy={64} r={26} fill="#FFF3DC" opacity={0.8} />
      <circle cx={104} cy={70} r={18} fill="#FFF3DC" opacity={0.6} />
      <circle cx={540} cy={44} r={20} fill="#FFF3DC" opacity={0.7} />
      {/* 땅 두께 */}
      <path d={outline} transform="translate(0 10)" fill="#7BA55C" />
      <path d={outline} transform="translate(0 5)" fill="#8FBF6C" />
      {tiles}
      {/* 수풀 장식 (그리드 밖) */}
      <ellipse cx={ORNAMENT_L.x} cy={ORNAMENT_L.y} rx={20} ry={10} fill="#7BC47F" />
      <ellipse cx={ORNAMENT_L.x - 14} cy={ORNAMENT_L.y + 4} rx={12} ry={7} fill="#8FCB77" />
      <ellipse cx={ORNAMENT_R.x} cy={ORNAMENT_R.y} rx={22} ry={11} fill="#7BC47F" />
      <ellipse cx={ORNAMENT_R.x + 16} cy={ORNAMENT_R.y + 5} rx={13} ry={7} fill="#8FCB77" />

      {/* 오브젝트 (painter's order) */}
      {sorted.map((p) => {
        const pos = renderPos(p);
        const { x, y } = cellToXY(pos.row, pos.col);
        const { w, h } = objectDims(p.kind, p.refId);
        const selected = selectedId === p.id;
        const dragging = drag?.placementId === p.id && drag.moved;
        return (
          <g key={p.id}>
            {selected && (
              <path d={tilePath(x, y, 2)} fill="#FFD66B" opacity={0.55} className="tile-blink" />
            )}
            <g
              transform={`translate(${x - w / 2} ${y + TILE_H / 2 - 4 - h})`}
              onPointerDown={(e) => handleObjectDown(e, p)}
              style={{ cursor: 'grab', opacity: dragging ? 0.85 : 1 }}
            >
              <ObjectSvg kind={p.kind} refId={p.refId} />
            </g>
          </g>
        );
      })}
    </svg>
  );
}

const ORNAMENT_L = { x: 60, y: 356 };
const ORNAMENT_R = { x: 552, y: 330 };
