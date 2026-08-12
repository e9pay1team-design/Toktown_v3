// ─── 카테고리별 제네릭 매장 건물 SVG ──────────────────────────────
// 기획 §4: 매장 건물은 카테고리별 제네릭 + 간판에 매장명 표기.
// 지도 마커와 내 마을(M3) 오브젝트가 동일 에셋을 재사용한다.

import type { StoreCategory } from '../types';

export const CATEGORY_COLORS: Record<StoreCategory, string> = {
  국밥: '#F2705E',
  한식: '#7BC47F',
  면: '#F5B942',
  카페: '#D98FB6',
  공연장: '#8B79C9',
};

export const CATEGORY_LABELS: Record<StoreCategory, string> = {
  국밥: '국밥집',
  한식: '한식당',
  면: '면요리',
  카페: '카페',
  공연장: '공연장',
};

interface BuildingProps {
  category: StoreCategory;
  /** 간판 텍스트(매장명). 길면 자동 축약 */
  label: string;
  size?: number;
}

/** 스캘럽(물결) 어닝 */
function Awning({ y, colorA, colorB }: { y: number; colorA: string; colorB: string }) {
  const scallops = [];
  for (let i = 0; i < 6; i++) {
    scallops.push(
      <path
        key={i}
        d={`M${26 + i * 15} ${y + 8} a7.5 7.5 0 0 0 15 0 Z`}
        fill={i % 2 === 0 ? colorA : colorB}
      />,
    );
  }
  return (
    <g>
      <rect x={26} y={y} width={90} height={9} fill={colorA} />
      {Array.from({ length: 6 }, (_, i) => (
        <rect key={i} x={26 + i * 15} y={y} width={15} height={9} fill={i % 2 === 0 ? colorA : colorB} />
      ))}
      {scallops}
    </g>
  );
}

export function StoreBuilding({ category, label, size = 110 }: BuildingProps) {
  const sign = label.length > 8 ? `${label.slice(0, 7)}…` : label;

  return (
    <svg
      width={size}
      height={(size * 130) / 140}
      viewBox="0 0 140 130"
      style={{ display: 'block' }}
      aria-label={`${label} 건물`}
    >
      <ellipse cx={70} cy={122} rx={52} ry={6.5} fill="rgba(74,59,50,0.13)" />
      {category === '국밥' && (
        <g>
          <rect x={26} y={54} width={88} height={64} rx={6} fill="#FFF3DC" />
          {/* 한옥풍 기와지붕 */}
          <path d="M10 58 Q16 34 38 32 H102 Q124 34 130 58 Q112 50 70 50 Q28 50 10 58 Z" fill="#8A6B52" />
          <path d="M22 52 Q46 45 70 45 Q94 45 118 52" stroke="#6E523C" strokeWidth={3} fill="none" />
          {/* 간판 */}
          <rect x={38} y={60} width={64} height={17} rx={4} fill="#5B4A3F" />
          <text x={70} y={72.5} textAnchor="middle" fontSize={11} fontWeight={700} fill="#FFF3DC">{sign}</text>
          {/* 문 + 포렴 */}
          <rect x={58} y={88} width={24} height={30} rx={3} fill="#8A6B52" />
          <path d="M58 88 h24 v10 l-4 4 l-4 -4 l-4 4 l-4 -4 l-4 4 l-4 -4 Z" fill="#4E9B58" />
          {/* 김 나는 뚝배기 창 */}
          <rect x={32} y={88} width={18} height={16} rx={3} fill="#FFE9BF" />
          <path d="M38 100 a4 3 0 0 0 8 0 Z" fill="#3B3B3B" />
          <path d="M39 96 q1 -3 0 -5 M43 96 q1 -3 0 -5" stroke="#B9AFA0" strokeWidth={1.6} fill="none" strokeLinecap="round" />
          {/* 홍등 */}
          <line x1={104} y1={54} x2={104} y2={60} stroke="#6E523C" strokeWidth={2} />
          <ellipse cx={104} cy={68} rx={7} ry={8.5} fill="#F2705E" />
          <rect x={101} y={59} width={6} height={3} rx={1.5} fill="#FFD66B" />
        </g>
      )}
      {category === '한식' && (
        <g>
          <rect x={26} y={54} width={88} height={64} rx={6} fill="#FDF2E0" />
          <path d="M10 58 Q16 34 38 32 H102 Q124 34 130 58 Q112 50 70 50 Q28 50 10 58 Z" fill="#4E9B58" />
          <path d="M22 52 Q46 45 70 45 Q94 45 118 52" stroke="#3D7A46" strokeWidth={3} fill="none" />
          <rect x={38} y={60} width={64} height={17} rx={4} fill="#3D5A41" />
          <text x={70} y={72.5} textAnchor="middle" fontSize={11} fontWeight={700} fill="#FDF2E0">{sign}</text>
          <rect x={58} y={88} width={24} height={30} rx={3} fill="#8A6B52" />
          <rect x={62} y={92} width={16} height={10} rx={2} fill="#FFE9BF" />
          {/* 창문 2개 */}
          <rect x={32} y={88} width={17} height={15} rx={3} fill="#FFE9BF" />
          <rect x={91} y={88} width={17} height={15} rx={3} fill="#FFE9BF" />
          <path d="M32 95 h17 M40 88 v15 M91 95 h17 M99 88 v15" stroke="#D8B98E" strokeWidth={1.6} />
        </g>
      )}
      {category === '면' && (
        <g>
          <rect x={26} y={48} width={88} height={70} rx={6} fill="#FFF8EC" />
          <rect x={20} y={36} width={100} height={14} rx={7} fill="#E8A54B" />
          <Awning y={50} colorA="#FFD66B" colorB="#FFF8EC" />
          <rect x={40} y={68} width={60} height={16} rx={4} fill="#B25B38" />
          <text x={70} y={80} textAnchor="middle" fontSize={11} fontWeight={700} fill="#FFF8EC">{sign}</text>
          <rect x={58} y={90} width={24} height={28} rx={3} fill="#B25B38" />
          {/* 면 그릇 창 */}
          <rect x={30} y={90} width={20} height={17} rx={3} fill="#FFE9BF" />
          <path d="M35 100 a5 3.4 0 0 0 10 0 Z" fill="#F2705E" />
          <path d="M36 99 q0 -5 2 -7 M40 99 q0 -5 0 -7 M44 99 q0 -5 -2 -7" stroke="#F5B942" strokeWidth={1.6} fill="none" />
          <line x1={46} y1={88} x2={40} y2={97} stroke="#8A6B52" strokeWidth={1.8} />
        </g>
      )}
      {category === '카페' && (
        <g>
          <rect x={26} y={48} width={88} height={70} rx={6} fill="#EAF6EF" />
          <rect x={22} y={38} width={96} height={12} rx={6} fill="#D98FB6" />
          <Awning y={48} colorA="#F2A7C3" colorB="#FFFDF7" />
          {/* 큰 창 */}
          <rect x={32} y={68} width={40} height={30} rx={5} fill="#FFF8EC" />
          <path d="M32 83 h40 M52 68 v30" stroke="#D8CDB9" strokeWidth={1.8} />
          {/* 커피잔 간판 */}
          <circle cx={94} cy={78} r={12} fill="#FFFDF7" stroke="#D98FB6" strokeWidth={2.4} />
          <path d="M88 76 h9 v6 a4.5 4.5 0 0 1 -9 0 Z" fill="#8A6B52" />
          <path d="M97 77 a3 3 0 0 1 0 5" stroke="#8A6B52" strokeWidth={1.8} fill="none" />
          <path d="M90 73 q1 -2 0 -4 M94 73 q1 -2 0 -4" stroke="#B9AFA0" strokeWidth={1.4} fill="none" strokeLinecap="round" />
          {/* 문 */}
          <rect x={82} y={94} width={22} height={24} rx={3} fill="#D98FB6" />
          <circle cx={99} cy={106} r={1.8} fill="#FFF8EC" />
          <text x={52} y={112} textAnchor="middle" fontSize={10.5} fontWeight={700} fill="#8C7B6E">{sign}</text>
        </g>
      )}
      {category === '공연장' && (
        <g>
          <rect x={24} y={50} width={92} height={68} rx={6} fill="#B95D50" />
          <rect x={18} y={36} width={104} height={18} rx={9} fill="#8B4A40" />
          {/* 마퀴 전광판 */}
          <rect x={30} y={58} width={80} height={20} rx={5} fill="#FFF8EC" />
          <text x={70} y={72} textAnchor="middle" fontSize={11} fontWeight={800} fill="#8B4A40">{sign}</text>
          {Array.from({ length: 7 }, (_, i) => (
            <circle key={i} cx={34 + i * 12} cy={44.5} r={2.6} fill={i % 2 === 0 ? '#FFD66B' : '#FFF3DC'} />
          ))}
          {/* 커튼 입구 */}
          <path d="M52 118 v-24 a18 16 0 0 1 36 0 v24 Z" fill="#5E3A34" />
          <path d="M54 94 q4 12 2 24 h8 q-4 -14 -2 -26 Z" fill="#F2705E" />
          <path d="M86 94 q-4 12 -2 24 h-8 q4 -14 2 -26 Z" fill="#F2705E" />
          <circle cx={70} cy={104} r={4} fill="#FFD66B" />
        </g>
      )}
    </svg>
  );
}
