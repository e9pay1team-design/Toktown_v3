// ─── NPC SVG (동물형 치비) ────────────────────────────────────────
// 지역 마스코트: 까치 '까미' (쇼핑백 든 까치, 명동)
// 기본 NPC: 촌장 부엉(올빼미)/우체부 구구(비둘기)/상점주인 달수(수달)/소식통 여울(여우)

interface NpcProps {
  size?: number;
}

const blush = (x: number, y: number) => (
  <circle cx={x} cy={y} r={4.6} fill="#FF9D9D" opacity={0.5} />
);

/** 명동 까치 '까미' — 쇼핑백 든 까치 (drummer: 이벤트 한정 '드러머 까미') */
export function MagpieSvg({ size = 96, drummer = false }: NpcProps & { drummer?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" style={{ display: 'block' }} aria-label={drummer ? '드러머 까미' : '까치 까미'}>
      <ellipse cx={58} cy={112} rx={30} ry={5.5} fill="rgba(74,59,50,0.14)" />
      {/* 꼬리 */}
      <g transform="rotate(28 24 96)">
        <rect x={6} y={90} width={38} height={11} rx={5.5} fill="#3B4252" />
        <rect x={6} y={90} width={14} height={11} rx={5.5} fill="#7BA7D9" />
      </g>
      {/* 몸통 */}
      <ellipse cx={58} cy={66} rx={35} ry={40} fill="#3B4252" />
      {/* 배 */}
      <ellipse cx={58} cy={82} rx={21} ry={23} fill="#FFFDF7" />
      {/* 얼굴 흰 볼 */}
      <ellipse cx={45} cy={52} rx={12} ry={10} fill="#FFFDF7" />
      <ellipse cx={71} cy={52} rx={12} ry={10} fill="#FFFDF7" />
      {/* 눈 */}
      <circle cx={45} cy={50} r={3.6} fill="#2B2B33" />
      <circle cx={71} cy={50} r={3.6} fill="#2B2B33" />
      <circle cx={46.3} cy={48.8} r={1.2} fill="#fff" />
      <circle cx={72.3} cy={48.8} r={1.2} fill="#fff" />
      {blush(38, 60)}
      {blush(78, 60)}
      {/* 부리 */}
      <path d="M53 56 L63 56 L58 64 Z" fill="#F5B942" />
      {/* 왼 날개 (파란 포인트) */}
      <ellipse cx={28} cy={72} rx={10} ry={17} fill="#3B4252" transform="rotate(14 28 72)" />
      <ellipse cx={27} cy={78} rx={6} ry={9} fill="#7BA7D9" transform="rotate(14 27 78)" />
      {/* 오른 날개 + (쇼핑백 | 드럼스틱) */}
      <ellipse cx={88} cy={72} rx={10} ry={17} fill="#3B4252" transform="rotate(-14 88 72)" />
      {!drummer && (
        <g>
          <path d="M88 84 q4 -8 12 -6" stroke="#F2705E" strokeWidth={3} fill="none" strokeLinecap="round" />
          <rect x={92} y={84} width={22} height={24} rx={5} fill="#FF8B7B" />
          <path d="M97 84 q4 -9 12 0" stroke="#F2705E" strokeWidth={3} fill="none" />
          <circle cx={103} cy={96} r={4} fill="#FFFDF7" opacity={0.8} />
        </g>
      )}
      {drummer && (
        <g>
          {/* 머리띠 */}
          <path d="M26 36 q34 -14 68 0 l-1 7 q-33 -12 -66 0 Z" fill="#F2705E" />
          <path d="M90 38 l12 -6 l-3 10 Z" fill="#F2705E" />
          {/* 드럼스틱 */}
          <g transform="rotate(-38 96 84)">
            <rect x={94} y={64} width={5} height={26} rx={2.5} fill="#CE9F6C" />
            <circle cx={96.5} cy={62} r={4.6} fill="#8A6B52" />
          </g>
          {/* 음표 */}
          <text x={18} y={30} fontSize={13} fill="#8B79C9">♪</text>
          <text x={100} y={22} fontSize={11} fill="#F2705E">♫</text>
        </g>
      )}
      {/* 발 */}
      <path d="M46 104 l-3 7 M46 104 l3 7" stroke="#F5B942" strokeWidth={3.4} strokeLinecap="round" />
      <path d="M66 104 l-3 7 M66 104 l3 7" stroke="#F5B942" strokeWidth={3.4} strokeLinecap="round" />
    </svg>
  );
}

/** 촌장 '부엉' — 올빼미 */
export function OwlSvg({ size = 96 }: NpcProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" style={{ display: 'block' }} aria-label="촌장 부엉">
      <ellipse cx={60} cy={112} rx={30} ry={5.5} fill="rgba(74,59,50,0.14)" />
      {/* 귀깃 */}
      <path d="M30 26 l6 -14 l10 12 Z" fill="#8A6B52" />
      <path d="M90 26 l-6 -14 l-10 12 Z" fill="#8A6B52" />
      {/* 몸 */}
      <ellipse cx={60} cy={64} rx={37} ry={42} fill="#A9836A" />
      {/* 가슴 깃털 */}
      <ellipse cx={60} cy={84} rx={22} ry={22} fill="#EAD9BF" />
      <path d="M50 76 l5 6 l5 -6 l5 6 l5 -6" stroke="#CDB694" strokeWidth={2.4} fill="none" strokeLinecap="round" />
      <path d="M50 88 l5 6 l5 -6 l5 6 l5 -6" stroke="#CDB694" strokeWidth={2.4} fill="none" strokeLinecap="round" />
      {/* 얼굴판 */}
      <circle cx={44} cy={48} r={16} fill="#EAD9BF" />
      <circle cx={76} cy={48} r={16} fill="#EAD9BF" />
      {/* 안경 */}
      <circle cx={44} cy={48} r={11} fill="none" stroke="#5B4A3F" strokeWidth={2.6} />
      <circle cx={76} cy={48} r={11} fill="none" stroke="#5B4A3F" strokeWidth={2.6} />
      <line x1={55} y1={48} x2={65} y2={48} stroke="#5B4A3F" strokeWidth={2.6} />
      {/* 눈 */}
      <circle cx={44} cy={48} r={5} fill="#2B2B33" />
      <circle cx={76} cy={48} r={5} fill="#2B2B33" />
      <circle cx={45.6} cy={46.4} r={1.6} fill="#fff" />
      <circle cx={77.6} cy={46.4} r={1.6} fill="#fff" />
      {/* 부리 */}
      <path d="M55 56 L65 56 L60 66 Z" fill="#F5B942" />
      {/* 날개 */}
      <ellipse cx={26} cy={70} rx={9} ry={18} fill="#8A6B52" transform="rotate(10 26 70)" />
      <ellipse cx={94} cy={70} rx={9} ry={18} fill="#8A6B52" transform="rotate(-10 94 70)" />
      {/* 촌장 목도리 */}
      <path d="M38 96 q22 12 44 0 l-2 8 q-20 10 -40 0 Z" fill="#7BC47F" />
      {/* 발 */}
      <path d="M48 106 l-3 7 M48 106 l3 7" stroke="#F5B942" strokeWidth={3.4} strokeLinecap="round" />
      <path d="M72 106 l-3 7 M72 106 l3 7" stroke="#F5B942" strokeWidth={3.4} strokeLinecap="round" />
    </svg>
  );
}

/** 우체부 '구구' — 비둘기 */
export function PigeonSvg({ size = 96 }: NpcProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" style={{ display: 'block' }} aria-label="우체부 구구">
      <ellipse cx={60} cy={112} rx={30} ry={5.5} fill="rgba(74,59,50,0.14)" />
      {/* 몸 */}
      <ellipse cx={60} cy={66} rx={35} ry={40} fill="#C3CBD8" />
      <ellipse cx={60} cy={82} rx={20} ry={22} fill="#FFFDF7" />
      {/* 목 광택 */}
      <path d="M46 62 q14 10 28 0 l-2 8 q-12 8 -24 0 Z" fill="#9FD4B8" opacity={0.7} />
      {/* 눈 */}
      <circle cx={46} cy={50} r={3.4} fill="#2B2B33" />
      <circle cx={74} cy={50} r={3.4} fill="#2B2B33" />
      <circle cx={47.2} cy={48.8} r={1.1} fill="#fff" />
      <circle cx={75.2} cy={48.8} r={1.1} fill="#fff" />
      {blush(38, 58)}
      {blush(82, 58)}
      {/* 부리 */}
      <path d="M54 55 L66 55 L60 63 Z" fill="#F5B942" />
      {/* 우체부 모자 */}
      <path d="M34 34 a26 18 0 0 1 52 0 Z" fill="#F2705E" />
      <rect x={30} y={32} width={60} height={7} rx={3.5} fill="#D95A4A" />
      <circle cx={60} cy={20} r={4} fill="#FFD66B" />
      {/* 날개 */}
      <ellipse cx={27} cy={72} rx={10} ry={17} fill="#AEB8C9" transform="rotate(12 27 72)" />
      <ellipse cx={93} cy={72} rx={10} ry={17} fill="#AEB8C9" transform="rotate(-12 93 72)" />
      {/* 편지 */}
      <g transform="rotate(-8 97 92)">
        <rect x={86} y={84} width={24} height={17} rx={3} fill="#FFF8EC" stroke="#E8C87F" strokeWidth={2} />
        <path d="M86 86 l12 8 l12 -8" stroke="#E8C87F" strokeWidth={2} fill="none" />
      </g>
      {/* 발 */}
      <path d="M48 105 l-3 7 M48 105 l3 7" stroke="#F2705E" strokeWidth={3.4} strokeLinecap="round" />
      <path d="M68 105 l-3 7 M68 105 l3 7" stroke="#F2705E" strokeWidth={3.4} strokeLinecap="round" />
    </svg>
  );
}

/** 상점 주인 '달수' — 수달 */
export function OtterSvg({ size = 96 }: NpcProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" style={{ display: 'block' }} aria-label="상점주인 달수">
      <ellipse cx={60} cy={112} rx={30} ry={5.5} fill="rgba(74,59,50,0.14)" />
      {/* 꼬리 */}
      <path d="M88 96 q18 4 22 -12 q-2 18 -16 20 Z" fill="#8F6B4E" />
      {/* 귀 */}
      <circle cx={34} cy={26} r={8} fill="#A98467" />
      <circle cx={86} cy={26} r={8} fill="#A98467" />
      <circle cx={34} cy={26} r={4} fill="#E9D3B8" />
      <circle cx={86} cy={26} r={4} fill="#E9D3B8" />
      {/* 몸 */}
      <ellipse cx={60} cy={64} rx={36} ry={41} fill="#A98467" />
      {/* 얼굴/배 밝은 부분 */}
      <ellipse cx={60} cy={58} rx={22} ry={16} fill="#E9D3B8" />
      <ellipse cx={60} cy={88} rx={20} ry={18} fill="#E9D3B8" />
      {/* 눈 */}
      <circle cx={44} cy={46} r={3.6} fill="#2B2B33" />
      <circle cx={76} cy={46} r={3.6} fill="#2B2B33" />
      <circle cx={45.3} cy={44.8} r={1.2} fill="#fff" />
      <circle cx={77.3} cy={44.8} r={1.2} fill="#fff" />
      {blush(36, 55)}
      {blush(84, 55)}
      {/* 코+입 */}
      <ellipse cx={60} cy={54} rx={5} ry={3.6} fill="#5B4A3F" />
      <path d="M60 58 v4 M60 62 q-5 5 -9 1 M60 62 q5 5 9 1" stroke="#5B4A3F" strokeWidth={2} fill="none" strokeLinecap="round" />
      {/* 수염 */}
      <path d="M34 52 h-10 M35 57 h-9 M86 52 h10 M85 57 h9" stroke="#8F6B4E" strokeWidth={1.8} strokeLinecap="round" />
      {/* 앞치마 */}
      <path d="M42 78 h36 v20 q-18 10 -36 0 Z" fill="#7BC47F" />
      <rect x={42} y={78} width={36} height={6} rx={3} fill="#4E9B58" />
      <circle cx={60} cy={92} r={6} fill="#FFD66B" />
      <text x={60} y={95.5} textAnchor="middle" fontSize={8} fontWeight={800} fill="#8A6B52">T</text>
      {/* 팔 + 조개 */}
      <ellipse cx={26} cy={74} rx={8} ry={13} fill="#8F6B4E" transform="rotate(16 26 74)" />
      <ellipse cx={94} cy={74} rx={8} ry={13} fill="#8F6B4E" transform="rotate(-16 94 74)" />
      <path d="M96 88 a9 9 0 0 1 18 0 Z" fill="#F2A7C3" transform="rotate(-14 105 88)" />
      {/* 발 */}
      <ellipse cx={48} cy={108} rx={9} ry={5.5} fill="#8F6B4E" />
      <ellipse cx={72} cy={108} rx={9} ry={5.5} fill="#8F6B4E" />
    </svg>
  );
}

/** 소식통(미식가) '여울' — 여우 */
export function FoxSvg({ size = 96 }: NpcProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" style={{ display: 'block' }} aria-label="소식통 여울">
      <ellipse cx={60} cy={112} rx={30} ry={5.5} fill="rgba(74,59,50,0.14)" />
      {/* 꼬리 */}
      <path d="M90 92 q22 0 24 -20 q6 24 -16 30 Z" fill="#F2A65E" />
      <path d="M108 78 q4 -4 6 -6 q2 10 -6 14 Z" fill="#FFFDF7" />
      {/* 귀 */}
      <path d="M28 34 L34 8 L52 24 Z" fill="#F2A65E" />
      <path d="M92 34 L86 8 L68 24 Z" fill="#F2A65E" />
      <path d="M34 28 L37 15 L46 23 Z" fill="#5B4A3F" />
      <path d="M86 28 L83 15 L74 23 Z" fill="#5B4A3F" />
      {/* 몸 */}
      <ellipse cx={60} cy={64} rx={36} ry={41} fill="#F2A65E" />
      {/* 주둥이/배 */}
      <ellipse cx={60} cy={60} rx={20} ry={14} fill="#FFFDF7" />
      <ellipse cx={60} cy={90} rx={19} ry={16} fill="#FFFDF7" />
      {/* 행복한 눈 (미식가) */}
      <path d="M38 48 q6 -6 12 0" stroke="#2B2B33" strokeWidth={3} fill="none" strokeLinecap="round" />
      <path d="M70 48 q6 -6 12 0" stroke="#2B2B33" strokeWidth={3} fill="none" strokeLinecap="round" />
      {blush(34, 56)}
      {blush(86, 56)}
      {/* 코+입 */}
      <ellipse cx={60} cy={56} rx={4.4} ry={3.4} fill="#5B4A3F" />
      <path d="M60 60 v3 M60 63 q-5 5 -9 1 M60 63 q5 5 9 1" stroke="#5B4A3F" strokeWidth={2} fill="none" strokeLinecap="round" />
      {/* 스카프 */}
      <path d="M40 76 q20 11 40 0 l-2 8 q-18 9 -36 0 Z" fill="#FF8B7B" />
      {/* 팔 + 숟가락 */}
      <ellipse cx={26} cy={76} rx={8} ry={13} fill="#E08F49" transform="rotate(16 26 76)" />
      <ellipse cx={94} cy={76} rx={8} ry={13} fill="#E08F49" transform="rotate(-16 94 76)" />
      <g transform="rotate(-24 100 86)">
        <rect x={98} y={80} width={4.4} height={22} rx={2.2} fill="#C9CFD8" />
        <ellipse cx={100.2} cy={77} rx={6.4} ry={8} fill="#E4E9F0" />
      </g>
      {/* 발 */}
      <ellipse cx={48} cy={108} rx={9} ry={5.5} fill="#E08F49" />
      <ellipse cx={72} cy={108} rx={9} ry={5.5} fill="#E08F49" />
    </svg>
  );
}

export function BasicNpcSvg({ role, size = 96 }: { role: string; size?: number }) {
  switch (role) {
    case 'mayor':
      return <OwlSvg size={size} />;
    case 'postman':
      return <PigeonSvg size={size} />;
    case 'shopkeeper':
      return <OtterSvg size={size} />;
    case 'gourmet':
      return <FoxSvg size={size} />;
    default:
      return <MagpieSvg size={size} />;
  }
}
