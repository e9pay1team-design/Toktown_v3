// ─── 랜드마크 미니어처 SVG ────────────────────────────────────────
// 실물 외형 모티브의 톡타운 스타일 단순화 디자인 (기획 §4).
// 지도 오버레이와 내 마을(M3) 미니어처가 동일 에셋을 재사용한다.

interface LandmarkProps {
  id: string;
  size?: number;
}

export function LandmarkSvg({ id, size = 90 }: LandmarkProps) {
  switch (id) {
    case 'cathedral':
      return (
        <svg width={size} height={size * 1.05} viewBox="0 0 120 126" style={{ display: 'block' }} aria-label="명동성당">
          <ellipse cx={60} cy={119} rx={42} ry={5.5} fill="rgba(74,59,50,0.13)" />
          {/* 본당 */}
          <rect x={22} y={72} width={76} height={46} rx={4} fill="#C17A5B" />
          <path d="M22 74 Q60 60 98 74 L98 82 Q60 70 22 82 Z" fill="#A56247" />
          {/* 첨탑 */}
          <rect x={44} y={38} width={32} height={80} rx={4} fill="#CE8763" />
          <path d="M40 42 L60 8 L80 42 Z" fill="#7E8CA3" />
          <line x1={60} y1={8} x2={60} y2={0} stroke="#5B4A3F" strokeWidth={2.6} />
          <line x1={55} y1={3.5} x2={65} y2={3.5} stroke="#5B4A3F" strokeWidth={2.6} />
          {/* 장미창 + 아치문 */}
          <circle cx={60} cy={54} r={7.5} fill="#FFF3DC" stroke="#8A5A40" strokeWidth={2} />
          <path d="M60 47 v14 M53 54 h14 M55 49 l10 10 M65 49 l-10 10" stroke="#8A5A40" strokeWidth={1.4} />
          <path d="M52 118 v-22 a8 9 0 0 1 16 0 v22 Z" fill="#6E4A36" />
          {/* 측면 아치창 */}
          <path d="M30 112 v-14 a5 6 0 0 1 10 0 v14 Z" fill="#FFF3DC" />
          <path d="M80 112 v-14 a5 6 0 0 1 10 0 v14 Z" fill="#FFF3DC" />
        </svg>
      );
    case 'namsan':
      return (
        <svg width={size * 0.72} height={size * 1.15} viewBox="0 0 86 138" style={{ display: 'block' }} aria-label="남산타워">
          <ellipse cx={43} cy={131} rx={30} ry={5} fill="rgba(74,59,50,0.13)" />
          {/* 산 */}
          <path d="M4 132 Q22 106 43 108 Q64 106 82 132 Z" fill="#7BC47F" />
          <path d="M18 122 q6 -10 12 0 M52 120 q6 -10 12 0" stroke="#4E9B58" strokeWidth={2.4} fill="none" strokeLinecap="round" />
          {/* 타워 기둥 */}
          <path d="M37 112 L40 44 H46 L49 112 Z" fill="#E7E3DA" />
          {/* 전망대 */}
          <rect x={28} y={30} width={30} height={16} rx={7} fill="#FFF8EC" stroke="#CBC4B4" strokeWidth={2} />
          <rect x={28} y={38} width={30} height={5} rx={2.5} fill="#5EB3CC" />
          <rect x={31} y={24} width={24} height={8} rx={4} fill="#E7E3DA" />
          {/* 안테나 */}
          <rect x={41} y={4} width={4} height={22} rx={2} fill="#F2705E" />
          <circle cx={43} cy={4} r={3} fill="#FFD66B" />
        </svg>
      );
    case 'cheonggyecheon':
      return (
        <svg width={size * 1.1} height={size * 0.78} viewBox="0 0 132 94" style={{ display: 'block' }} aria-label="청계천">
          <ellipse cx={66} cy={88} rx={52} ry={5} fill="rgba(74,59,50,0.13)" />
          {/* 물길 */}
          <path d="M6 66 Q36 52 66 62 Q96 72 126 58 L126 80 Q96 92 66 82 Q36 74 6 84 Z" fill="#8ED1E1" />
          <path d="M18 70 q6 -4 12 0 M58 68 q6 -4 12 0 M96 64 q6 -4 12 0" stroke="#FFFDF7" strokeWidth={2.6} fill="none" strokeLinecap="round" />
          {/* 돌다리 */}
          <path d="M38 62 h56 v10 h-56 Z" fill="#CBC4B4" />
          <path d="M46 72 v-6 a6 6 0 0 1 12 0 v6 M74 72 v-6 a6 6 0 0 1 12 0 v6" fill="#FFF8EC" />
          <rect x={36} y={56} width={60} height={7} rx={3.5} fill="#E7E3DA" />
          {/* 갈대 */}
          <path d="M16 64 q-2 -12 4 -18 M22 66 q2 -10 -2 -16 M112 58 q2 -12 -4 -18 M106 60 q-2 -10 2 -16" stroke="#4E9B58" strokeWidth={2.6} fill="none" strokeLinecap="round" />
          <ellipse cx={20} cy={44} rx={3} ry={6} fill="#C9A227" transform="rotate(12 20 44)" />
          <ellipse cx={108} cy={38} rx={3} ry={6} fill="#C9A227" transform="rotate(-12 108 38)" />
        </svg>
      );
    case 'gwanghwamun':
      return (
        <svg width={size * 1.05} height={size} viewBox="0 0 126 120" style={{ display: 'block' }} aria-label="광화문">
          <ellipse cx={63} cy={113} rx={50} ry={5.5} fill="rgba(74,59,50,0.13)" />
          {/* 석축 */}
          <rect x={14} y={72} width={98} height={40} rx={4} fill="#E7E3DA" />
          <path d="M14 84 h98 M14 98 h98 M40 72 v40 M86 72 v40 M63 84 v28" stroke="#CBC4B4" strokeWidth={2} />
          {/* 홍예문 3개 */}
          <path d="M52 112 v-18 a11 12 0 0 1 22 0 v18 Z" fill="#5B4A3F" />
          <path d="M24 112 v-13 a8 9 0 0 1 16 0 v13 Z" fill="#5B4A3F" />
          <path d="M86 112 v-13 a8 9 0 0 1 16 0 v13 Z" fill="#5B4A3F" />
          {/* 2층 누각 */}
          <rect x={34} y={52} width={58} height={16} rx={3} fill="#B95D50" />
          <path d="M34 56 h58 M42 52 v16 M54 52 v16 M66 52 v16 M78 52 v16" stroke="#8B4A40" strokeWidth={1.8} />
          {/* 팔작지붕 2단 */}
          <path d="M18 54 Q30 40 63 40 Q96 40 108 54 Q84 48 63 48 Q42 48 18 54 Z" fill="#5E8C61" />
          <path d="M28 40 Q38 28 63 28 Q88 28 98 40 Q80 34 63 34 Q46 34 28 40 Z" fill="#5E8C61" />
          <path d="M18 54 q-4 -2 -6 -6 M108 54 q4 -2 6 -6 M28 40 q-4 -2 -5 -5 M98 40 q4 -2 5 -5" stroke="#3D5A41" strokeWidth={2.4} fill="none" strokeLinecap="round" />
        </svg>
      );
    default:
      return null;
  }
}
