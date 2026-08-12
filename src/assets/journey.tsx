// ─── 이동/지갑 관련 SVG: 차량(지하철·버스), Town Key 키링, 발도장 ──

/** 지하철 차량 (탑승 연출용) */
export function SubwaySvg({ width = 220 }: { width?: number }) {
  return (
    <svg width={width} height={(width * 110) / 260} viewBox="0 0 260 110" style={{ display: 'block' }} aria-label="지하철">
      {/* 차체 */}
      <rect x={10} y={18} width={240} height={70} rx={18} fill="#8ED1E1" />
      <rect x={10} y={18} width={240} height={16} rx={8} fill="#5EB3CC" />
      {/* 창문 + 승객(내 캐릭터 자리) */}
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x={26 + i * 58} y={40} width={40} height={26} rx={7} fill="#FFF8EC" />
      ))}
      {/* 문 */}
      <rect x={118} y={40} width={26} height={48} rx={5} fill="#D3EEF5" stroke="#5EB3CC" strokeWidth={2} />
      <line x1={131} y1={42} x2={131} y2={86} stroke="#5EB3CC" strokeWidth={2} />
      {/* 전조등 + 라인 표시 */}
      <circle cx={244} cy={62} r={6} fill="#FFD66B" />
      <rect x={20} y={70} width={230} height={5} rx={2.5} fill="#5EB3CC" opacity={0.5} />
      {/* 바퀴 */}
      <circle cx={54} cy={92} r={10} fill="#4A3B32" />
      <circle cx={130} cy={92} r={10} fill="#4A3B32" />
      <circle cx={206} cy={92} r={10} fill="#4A3B32" />
      <circle cx={54} cy={92} r={4} fill="#8C7B6E" />
      <circle cx={130} cy={92} r={4} fill="#8C7B6E" />
      <circle cx={206} cy={92} r={4} fill="#8C7B6E" />
    </svg>
  );
}

/** 버스 차량 (탑승 연출용) */
export function BusSvg({ width = 200 }: { width?: number }) {
  return (
    <svg width={width} height={(width * 110) / 230} viewBox="0 0 230 110" style={{ display: 'block' }} aria-label="버스">
      <rect x={10} y={12} width={210} height={76} rx={16} fill="#7BC47F" />
      <rect x={10} y={12} width={210} height={20} rx={10} fill="#4E9B58" />
      {[0, 1, 2].map((i) => (
        <rect key={i} x={24 + i * 52} y={38} width={38} height={24} rx={6} fill="#FFF8EC" />
      ))}
      {/* 앞문 */}
      <rect x={178} y={38} width={30} height={50} rx={6} fill="#D8F0DA" stroke="#4E9B58" strokeWidth={2} />
      {/* 번호판 */}
      <rect x={88} y={68} width={54} height={14} rx={7} fill="#FFF8EC" />
      <text x={115} y={79} textAnchor="middle" fontSize={11} fontWeight={800} fill="#3D5A41">0212</text>
      <circle cx={214} cy={58} r={5} fill="#FFD66B" />
      <circle cx={52} cy={92} r={10} fill="#4A3B32" />
      <circle cx={172} cy={92} r={10} fill="#4A3B32" />
      <circle cx={52} cy={92} r={4} fill="#8C7B6E" />
      <circle cx={172} cy={92} r={4} fill="#8C7B6E" />
    </svg>
  );
}

/** Town Key — 까치 캐릭터 키링형 교통카드 */
export function TownKeyringSvg({ size = 84 }: { size?: number }) {
  return (
    <svg width={size} height={size * 1.18} viewBox="0 0 100 118" style={{ display: 'block' }} aria-label="Town Key 키링">
      {/* 고리 + 스트랩 */}
      <circle cx={50} cy={12} r={9} fill="none" stroke="#B8862B" strokeWidth={4} />
      <path d="M46 20 h8 l3 14 h-14 Z" fill="#F2705E" />
      {/* 까치 얼굴 참 */}
      <ellipse cx={50} cy={64} rx={34} ry={32} fill="#3B4252" />
      <ellipse cx={38} cy={58} rx={11} ry={9.5} fill="#FFFDF7" />
      <ellipse cx={62} cy={58} rx={11} ry={9.5} fill="#FFFDF7" />
      <circle cx={38} cy={57} r={3.2} fill="#2B2B33" />
      <circle cx={62} cy={57} r={3.2} fill="#2B2B33" />
      <circle cx={39.1} cy={55.9} r={1.1} fill="#fff" />
      <circle cx={63.1} cy={55.9} r={1.1} fill="#fff" />
      <path d="M45 64 L55 64 L50 71 Z" fill="#F5B942" />
      <circle cx={31} cy={68} r={4} fill="#FF9D9D" opacity={0.55} />
      <circle cx={69} cy={68} r={4} fill="#FF9D9D" opacity={0.55} />
      {/* 교통칩 태그 */}
      <rect x={30} y={92} width={40} height={20} rx={6} fill="#5EB3CC" />
      <rect x={35} y={98} width={12} height={8} rx={2} fill="#FFD66B" />
      <path d="M56 96 a7 7 0 0 1 0 12 M60 94 a10 10 0 0 1 0 16" stroke="#FFF8EC" strokeWidth={2.2} fill="none" strokeLinecap="round" />
    </svg>
  );
}

/** 발도장 (체크인 스탬프) */
export function PawStamp({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" style={{ display: 'inline-block', verticalAlign: '-0.2em' }} aria-label="발도장">
      <ellipse cx={20} cy={26} rx={9} ry={7.5} fill="#F2705E" />
      <circle cx={10} cy={18} r={4} fill="#F2705E" />
      <circle cx={17} cy={13} r={4} fill="#F2705E" />
      <circle cx={24} cy={13} r={4} fill="#F2705E" />
      <circle cx={30} cy={18} r={4} fill="#F2705E" />
    </svg>
  );
}
