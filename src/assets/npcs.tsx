// ─── NPC SVG (동물형 치비) ────────────────────────────────────────
// 지역 마스코트: 까치 '까미' (쇼핑백 든 까치, 명동)
// 기본 NPC: 촌장 부엉(올빼미)/우체부 구구(비둘기)/상점주인 달수(수달)/소식통 여울(여우)

interface NpcProps {
  size?: number;
}

const blush = (x: number, y: number) => (
  <circle cx={x} cy={y} r={4.6} fill="#FF9D9D" opacity={0.5} />
);

/** 명동 까치 '까미' — 쇼핑백 든 까치 (drummer: 이벤트 한정 '까아미' — 콘서트 팬 자아) */
export function MagpieSvg({ size = 96, drummer = false }: NpcProps & { drummer?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" style={{ display: 'block' }} aria-label={drummer ? '까아미' : '까치 까미'}>
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
          {/* 보라 반다나 (콘서트 주간 한정) */}
          <path d="M26 36 q34 -14 68 0 l-1 7 q-33 -12 -66 0 Z" fill="#8A5CF6" />
          <path d="M90 38 l12 -6 l-3 10 Z" fill="#8A5CF6" />
          {/* 응원봉 */}
          <g transform="rotate(-32 96 84)">
            <rect x={94} y={68} width={5} height={24} rx={2.5} fill="#4A3B32" />
            <circle cx={96.5} cy={61} r={9} fill="#C7B9F2" opacity={0.55} />
            <circle cx={96.5} cy={61} r={6} fill="#B48CFF" />
            <circle cx={94.2} cy={58.6} r={2} fill="#fff" opacity={0.9} />
          </g>
          {/* 반짝임 */}
          <path d="M18 24 l1.7 4 l4 1.7 l-4 1.7 l-1.7 4 l-1.7 -4 l-4 -1.7 l4 -1.7 Z" fill="#B48CFF" />
          <path d="M104 14 l1.2 2.9 l2.9 1.2 l-2.9 1.2 l-1.2 2.9 l-1.2 -2.9 l-2.9 -1.2 l2.9 -1.2 Z" fill="#C7B9F2" />
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

/** 전국 확대 로드맵 NPC — 도감에선 실루엣으로만 노출 (미조우 티저).
    까미와 같은 조형 문법(그림자·홍조·눈 하이라이트·소품을 실제로 든 팔·발)으로
    완성해 두고, 실루엣 상태에서도 외곽(기타 넥·뿔·서프보드 등)이 읽히게 잡는다. */
/** 지역/이벤트 NPC 초상 — npcId 로 통일 조회 (조우 모달·도감 공용) */
export function RegionalNpcSvg({ npcId, size = 96 }: { npcId: string; size?: number }) {
  if (npcId === 'magpie') return <MagpieSvg size={size} />;
  if (npcId === 'magpie-kkaami') return <MagpieSvg size={size} drummer />;
  return <UpcomingNpcSvg id={npcId} size={size} />;
}

export function UpcomingNpcSvg({ id, size = 76 }: { id: string; size?: number }) {
  switch (id) {
    case 'hongdae-cat': // 기타 멘 인디 고양이 — 비니 + 통기타 버스킹
      return (
        <svg width={size} height={size} viewBox="0 0 120 120" style={{ display: 'block' }} aria-label="홍대 인디 고양이 기냥">
          <ellipse cx={58} cy={112} rx={30} ry={5.5} fill="rgba(74,59,50,0.14)" />
          {/* 꼬리 */}
          <path d="M30 92 q-15 -3 -11 -19" stroke="#5B5566" strokeWidth={8.5} fill="none" strokeLinecap="round" />
          <circle cx={19.5} cy={72.5} r={4.2} fill="#524B5E" />
          {/* 귀 */}
          <path d="M34 40 L26 18 L48 30 Z" fill="#5B5566" />
          <path d="M36 36 L31 23 L44 29 Z" fill="#E8B4C8" />
          <path d="M86 40 L94 18 L72 30 Z" fill="#5B5566" />
          <path d="M84 36 L89 23 L76 29 Z" fill="#E8B4C8" />
          {/* 몸통 + 배 + 주둥이 */}
          <ellipse cx={60} cy={64} rx={33} ry={38} fill="#6B6377" />
          <ellipse cx={60} cy={84} rx={19} ry={19} fill="#FFFDF7" />
          <ellipse cx={60} cy={61} rx={12} ry={8} fill="#FFFDF7" />
          {/* 인디 비니 (폼폼) */}
          <path d="M38 33 a22 15 0 0 1 44 0 Z" fill="#3B4252" />
          <rect x={36} y={30.5} width={48} height={7} rx={3.5} fill="#2B2F3E" />
          <circle cx={60} cy={17} r={4.5} fill="#F2705E" />
          {/* 눈 + 코 + ω 입 */}
          <circle cx={46} cy={52} r={3.6} fill="#2B2B33" />
          <circle cx={74} cy={52} r={3.6} fill="#2B2B33" />
          <circle cx={47.3} cy={50.8} r={1.2} fill="#fff" />
          <circle cx={75.3} cy={50.8} r={1.2} fill="#fff" />
          <path d="M57.6 57.5 h4.8 l-2.4 3.4 Z" fill="#E8899B" />
          <path d="M55.5 63 q2.3 2.6 4.5 0 q2.3 2.6 4.5 0" stroke="#2B2B33" strokeWidth={2} fill="none" strokeLinecap="round" />
          {/* 수염 */}
          <path d="M32 58 h-10 M33 63 h-9 M88 58 h10 M87 63 h9" stroke="#8B8496" strokeWidth={1.7} strokeLinecap="round" />
          {blush(38, 61)}
          {blush(82, 61)}
          {/* 발 */}
          <ellipse cx={46} cy={105} rx={8.5} ry={5.5} fill="#5B5566" />
          <ellipse cx={72} cy={105} rx={8.5} ry={5.5} fill="#5B5566" />
          {/* 어깨끈 → 통기타 (울림통·로제트·브리지·프렛·헤드 튜닝페그·줄) */}
          <path d="M38 56 Q56 74 78 84" stroke="#F2705E" strokeWidth={4.5} fill="none" strokeLinecap="round" />
          <g transform="rotate(18 84 88)">
            <ellipse cx={84} cy={92} rx={13.5} ry={11} fill="#D89A6A" />
            <ellipse cx={84} cy={80} rx={10} ry={7.5} fill="#D89A6A" />
            <ellipse cx={84} cy={92} rx={13.5} ry={11} fill="none" stroke="#B37845" strokeWidth={1.5} />
            <circle cx={84} cy={86} r={4.2} fill="#5B4A3F" />
            <circle cx={84} cy={86} r={5.7} fill="none" stroke="#8A6B52" strokeWidth={1.2} />
            <rect x={78.5} y={95.5} width={11} height={3} rx={1.5} fill="#8A6B52" />
            <rect x={81.2} y={44} width={5.6} height={38} rx={2.4} fill="#8A6B52" />
            <path d="M81.6 52 h4.8 M81.6 59 h4.8 M81.6 66 h4.8 M81.6 73 h4.8" stroke="#5B4A3F" strokeWidth={1.2} />
            <rect x={78.8} y={34} width={10.4} height={10.5} rx={3} fill="#5B4A3F" />
            <circle cx={77.5} cy={37} r={1.6} fill="#F5B942" />
            <circle cx={77.5} cy={41.5} r={1.6} fill="#F5B942" />
            <circle cx={90.5} cy={37} r={1.6} fill="#F5B942" />
            <circle cx={90.5} cy={41.5} r={1.6} fill="#F5B942" />
            <path d="M82.6 44.5 v49 M84 44.5 v50 M85.4 44.5 v49" stroke="#FFF3DC" strokeWidth={0.9} />
          </g>
          {/* 팔 — 오른팔은 줄 위, 왼팔은 옆 */}
          <ellipse cx={87} cy={72} rx={7} ry={12} fill="#6B6377" transform="rotate(-24 87 72)" />
          <circle cx={90} cy={82} r={4} fill="#FFFDF7" />
          <ellipse cx={32} cy={72} rx={8} ry={14} fill="#6B6377" transform="rotate(14 32 72)" />
          <circle cx={30} cy={84} r={4} fill="#FFFDF7" />
          {/* 음표 */}
          <g fill="#5B5566" stroke="#5B5566">
            <ellipse cx={20} cy={32} rx={3} ry={2.4} transform="rotate(-20 20 32)" stroke="none" />
            <path d="M22.8 31 v-9 q4 0 5 4" strokeWidth={1.8} fill="none" strokeLinecap="round" />
            <ellipse cx={31} cy={19} rx={2.3} ry={1.9} transform="rotate(-20 31 19)" stroke="none" />
            <path d="M33.1 18.2 v-7" strokeWidth={1.6} fill="none" strokeLinecap="round" />
          </g>
        </svg>
      );
    case 'seongsu-deer': // 커피 든 꽃사슴 — 서울숲 잎사귀 + 아이스 아메리카노
      return (
        <svg width={size} height={size} viewBox="0 0 120 120" style={{ display: 'block' }} aria-label="성수 꽃사슴 실루엣">
          <ellipse cx={60} cy={112} rx={30} ry={5.5} fill="rgba(74,59,50,0.14)" />
          {/* 가지 뻗은 뿔 (벨벳 팁) */}
          <path d="M44 28 q-6 -16 -18 -18 M38 20 q-8 -3 -13 1" stroke="#8A6B52" strokeWidth={5} fill="none" strokeLinecap="round" />
          <path d="M76 28 q6 -16 18 -18 M82 20 q8 -3 13 1" stroke="#8A6B52" strokeWidth={5} fill="none" strokeLinecap="round" />
          <circle cx={26} cy={10} r={2.6} fill="#A98467" />
          <circle cx={25} cy={21} r={2.4} fill="#A98467" />
          <circle cx={94} cy={10} r={2.6} fill="#A98467" />
          <circle cx={95} cy={21} r={2.4} fill="#A98467" />
          {/* 귀 */}
          <path d="M38 34 L28 22 L50 27 Z" fill="#C89B66" />
          <path d="M39 31 L33 24 L47 27 Z" fill="#EFD3B8" />
          <path d="M82 34 L92 22 L70 27 Z" fill="#C89B66" />
          <path d="M81 31 L87 24 L73 27 Z" fill="#EFD3B8" />
          {/* 서울숲 잎사귀 (귀 옆) */}
          <path d="M78 24 q4 -6 2 -10" stroke="#4E9B58" strokeWidth={2} fill="none" strokeLinecap="round" />
          <ellipse cx={83} cy={15} rx={4.2} ry={2.4} fill="#6BBF73" transform="rotate(28 83 15)" />
          <ellipse cx={77} cy={11} rx={3.6} ry={2.1} fill="#6BBF73" transform="rotate(-22 77 11)" />
          {/* 몸통 + 가슴 */}
          <ellipse cx={60} cy={64} rx={31} ry={37} fill="#C89B66" />
          <ellipse cx={60} cy={85} rx={18} ry={18} fill="#FFF3DC" />
          {/* 꽃사슴 점무늬 */}
          <g fill="#FFF3DC" opacity={0.92}>
            <circle cx={40} cy={44} r={2.5} />
            <circle cx={35} cy={56} r={2.1} />
            <circle cx={44} cy={64} r={1.9} />
            <circle cx={80} cy={44} r={2.5} />
            <circle cx={85} cy={56} r={2.1} />
            <circle cx={76} cy={64} r={1.9} />
          </g>
          {/* 주둥이 + 눈 (속눈썹) */}
          <ellipse cx={60} cy={62} rx={12} ry={8.5} fill="#EFD3B8" />
          <ellipse cx={60} cy={59} rx={4} ry={3} fill="#5B4A3F" />
          <path d="M60 62 v3 M60 65 q-4 4 -8 1 M60 65 q4 4 8 1" stroke="#5B4A3F" strokeWidth={1.9} fill="none" strokeLinecap="round" />
          <circle cx={47} cy={52} r={3.5} fill="#2B2B33" />
          <circle cx={73} cy={52} r={3.5} fill="#2B2B33" />
          <circle cx={48.3} cy={50.8} r={1.2} fill="#fff" />
          <circle cx={74.3} cy={50.8} r={1.2} fill="#fff" />
          <path d="M43.6 49.4 l-3 -2 M76.4 49.4 l3 -2" stroke="#2B2B33" strokeWidth={1.6} strokeLinecap="round" />
          {blush(39, 60)}
          {blush(81, 60)}
          {/* 다리 + 발굽 */}
          <rect x={44} y={98} width={10} height={11} rx={5} fill="#B98A5F" />
          <rect x={44} y={105} width={10} height={5.5} rx={2.5} fill="#6B5138" />
          <rect x={66} y={98} width={10} height={11} rx={5} fill="#B98A5F" />
          <rect x={66} y={105} width={10} height={5.5} rx={2.5} fill="#6B5138" />
          {/* 왼팔 + 컵 든 오른팔 + 아이스 아메리카노 */}
          <ellipse cx={33} cy={74} rx={7.5} ry={13} fill="#B98A5F" transform="rotate(16 33 74)" />
          <ellipse cx={85} cy={68} rx={7} ry={11.5} fill="#B98A5F" transform="rotate(-30 85 68)" />
          <g transform="rotate(-6 94 62)">
            <path d="M86 54 h17 l-2.2 20 h-12.6 Z" fill="#EAF6F4" />
            <path d="M87.6 60 h13.8 l-1.5 12.5 h-10.8 Z" fill="#9C6B43" opacity={0.85} />
            <rect x={89} y={61.5} width={4.6} height={4.6} rx={1.2} fill="#FFFDF7" opacity={0.75} transform="rotate(14 91.3 63.8)" />
            <rect x={95} y={65} width={4.2} height={4.2} rx={1.2} fill="#FFFDF7" opacity={0.75} transform="rotate(-12 97.1 67.1)" />
            <rect x={84} y={50} width={21} height={5} rx={2.5} fill="#4FB9A8" />
            <path d="M94 50 l3 -11" stroke="#4FB9A8" strokeWidth={3.4} strokeLinecap="round" />
          </g>
          <path d="M104 44 l1.4 3.2 l3.2 1.4 l-3.2 1.4 l-1.4 3.2 l-1.4 -3.2 l-3.2 -1.4 l3.2 -1.4 Z" fill="#4FB9A8" opacity={0.7} />
        </svg>
      );
    case 'bukchon-tiger': // 한옥 지붕 위 아기호랑이 — 색동 배자 + 기와 수막새
      return (
        <svg width={size} height={size} viewBox="0 0 120 120" style={{ display: 'block' }} aria-label="북촌 아기호랑이 실루엣">
          <ellipse cx={60} cy={114} rx={38} ry={5} fill="rgba(74,59,50,0.14)" />
          {/* 기와 지붕 — 용마루 하이라이트 + 처마 수막새 */}
          <path d="M10 104 Q60 86 110 104 L110 113 Q60 95 10 113 Z" fill="#5E6470" />
          <path d="M10 104 Q60 86 110 104" stroke="#7A8290" strokeWidth={3} fill="none" />
          <path d="M30 105.5 q5 -4 10 -1 M52 102 q5 -4 10 -1 M74 102.5 q5 -4 10 -1" stroke="#3F4550" strokeWidth={2.2} fill="none" />
          <g fill="#3F4550">
            <circle cx={22} cy={110.6} r={3} />
            <circle cx={41} cy={107.5} r={3} />
            <circle cx={60} cy={106.5} r={3} />
            <circle cx={79} cy={107.5} r={3} />
            <circle cx={98} cy={110.6} r={3} />
          </g>
          <g fill="#7A8290">
            <circle cx={22} cy={110.6} r={1.1} />
            <circle cx={41} cy={107.5} r={1.1} />
            <circle cx={60} cy={106.5} r={1.1} />
            <circle cx={79} cy={107.5} r={1.1} />
            <circle cx={98} cy={110.6} r={1.1} />
          </g>
          {/* 꼬리 (고리 무늬) */}
          <path d="M86 82 q13 -2 11 -15" stroke="#F0A055" strokeWidth={8} fill="none" strokeLinecap="round" />
          <circle cx={96.5} cy={64.5} r={4.4} fill="#4A3B32" />
          <path d="M93 75 l6.5 -3" stroke="#4A3B32" strokeWidth={3} strokeLinecap="round" />
          {/* 귀 */}
          <path d="M38 32 L32 14 L52 24 Z" fill="#E8944B" />
          <path d="M40 28 L36 18 L48 24 Z" fill="#FFF3DC" />
          <path d="M82 32 L88 14 L68 24 Z" fill="#E8944B" />
          <path d="M80 28 L84 18 L72 24 Z" fill="#FFF3DC" />
          {/* 몸통 + 이마 줄무늬 */}
          <ellipse cx={60} cy={60} rx={30} ry={33} fill="#F0A055" />
          <path d="M52 26 q2 5 -1 8 M68 26 q-2 5 1 8 M60 24 v7.5" stroke="#4A3B32" strokeWidth={3.6} fill="none" strokeLinecap="round" />
          {/* 옆구리 줄무늬 */}
          <path d="M32 44 q7 3 5 10 M30 58 q7 2 6 9 M88 44 q-7 3 -5 10 M90 58 q-7 2 -6 9" stroke="#4A3B32" strokeWidth={4} fill="none" strokeLinecap="round" />
          {/* 주둥이 + 코 + 입 + 수염 */}
          <ellipse cx={60} cy={62} rx={13} ry={9.5} fill="#FFF3DC" />
          <ellipse cx={60} cy={58.5} rx={3.8} ry={3} fill="#C2503F" />
          <path d="M60 61.5 v3.5 M60 65 q-4 4 -8 1 M60 65 q4 4 8 1" stroke="#4A3B32" strokeWidth={2.2} fill="none" strokeLinecap="round" />
          <path d="M45 60 h-10 M46 64 h-9 M75 60 h10 M74 64 h9" stroke="#E8C79E" strokeWidth={1.7} strokeLinecap="round" />
          {/* 눈 */}
          <circle cx={48} cy={50} r={3.6} fill="#2B2B33" />
          <circle cx={72} cy={50} r={3.6} fill="#2B2B33" />
          <circle cx={49.3} cy={48.8} r={1.2} fill="#fff" />
          <circle cx={73.3} cy={48.8} r={1.2} fill="#fff" />
          {blush(40, 58)}
          {blush(80, 58)}
          {/* 색동 배자 깃 */}
          <path d="M46 72 q14 8 28 0 l-1.5 6.5 q-12.5 7.5 -25 0 Z" fill="#F2705E" />
          <path d="M46.8 75.5 q13.2 7 26.4 0" stroke="#FFD66B" strokeWidth={2.2} fill="none" />
          <path d="M47.4 78.3 q12.6 6.6 25.2 0" stroke="#7BC47F" strokeWidth={2.2} fill="none" />
          {/* 뒷다리(웅크림) + 앞발 */}
          <ellipse cx={38} cy={87} rx={10.5} ry={11.5} fill="#E8944B" />
          <ellipse cx={82} cy={87} rx={10.5} ry={11.5} fill="#E8944B" />
          <path d="M31 82 q5 2 4 8 M89 82 q-5 2 -4 8" stroke="#4A3B32" strokeWidth={3.5} fill="none" strokeLinecap="round" />
          <rect x={47.5} y={80} width={9.5} height={19} rx={4.75} fill="#F0A055" />
          <rect x={63} y={80} width={9.5} height={19} rx={4.75} fill="#F0A055" />
          <ellipse cx={52.2} cy={98.5} rx={5.2} ry={3.6} fill="#FFF3DC" />
          <ellipse cx={67.8} cy={98.5} rx={5.2} ry={3.6} fill="#FFF3DC" />
          <path d="M50.4 96.8 v3.4 M54 96.8 v3.4 M66 96.8 v3.4 M69.6 96.8 v3.4" stroke="#D9A06B" strokeWidth={1.4} strokeLinecap="round" />
        </svg>
      );
    case 'busan-gull': // 서퍼 갈매기 — 이마 선글라스 + 서프보드
      return (
        <svg width={size} height={size} viewBox="0 0 120 120" style={{ display: 'block' }} aria-label="부산 서퍼 갈매기 실루엣">
          <ellipse cx={62} cy={113} rx={34} ry={5} fill="rgba(74,59,50,0.14)" />
          {/* 파도 */}
          <path d="M14 98 q6 -5 12 0" stroke="#5EB3CC" strokeWidth={3} fill="none" strokeLinecap="round" />
          <circle cx={21} cy={88} r={1.7} fill="#5EB3CC" opacity={0.7} />
          {/* 서프보드 (스트라이프 + 림) */}
          <g transform="rotate(-10 84 78)">
            <ellipse cx={84} cy={78} rx={11} ry={35} fill="#5EB3CC" />
            <ellipse cx={84} cy={78} rx={11} ry={35} fill="none" stroke="#3E93AC" strokeWidth={2.2} />
            <path d="M84 46 v64" stroke="#FFF3DC" strokeWidth={3.2} />
            <path d="M78.5 52 q5.5 -3 11 0" stroke="#3E93AC" strokeWidth={2} fill="none" strokeLinecap="round" />
          </g>
          {/* 몸 + 머리 */}
          <ellipse cx={50} cy={68} rx={26} ry={31} fill="#FFFDF7" />
          <circle cx={50} cy={42} r={18.5} fill="#FFFDF7" />
          {/* 눈 + 부리 (허링걸 레드 스팟) */}
          <circle cx={43} cy={41} r={3.4} fill="#2B2B33" />
          <circle cx={58} cy={41} r={3.4} fill="#2B2B33" />
          <circle cx={44.2} cy={39.8} r={1.1} fill="#fff" />
          <circle cx={59.2} cy={39.8} r={1.1} fill="#fff" />
          <path d="M44 48.5 L58 48.5 L51 57 Z" fill="#F5A03C" />
          <circle cx={53.5} cy={52.5} r={1.2} fill="#E85B4B" />
          {blush(35, 48)}
          {blush(65, 48)}
          {/* 이마에 올린 선글라스 */}
          <rect x={35} y={25} width={10} height={7} rx={3.4} fill="#2B2B33" />
          <rect x={50} y={25} width={10} height={7} rx={3.4} fill="#2B2B33" />
          <path d="M45 28.5 h5" stroke="#2B2B33" strokeWidth={2} strokeLinecap="round" />
          <path d="M35 28.5 l-7 3 M60 28.5 l7 3" stroke="#2B2B33" strokeWidth={2.2} strokeLinecap="round" />
          {/* 접은 날개 (회색 덮깃 + 검은 깃끝) — 오른 날개는 보드를 감싼다 */}
          <ellipse cx={28} cy={70} rx={8.5} ry={15} fill="#C9D2DC" transform="rotate(16 28 70)" />
          <ellipse cx={24.5} cy={82} rx={4.5} ry={7} fill="#3B4252" transform="rotate(24 24.5 82)" />
          <ellipse cx={72} cy={68} rx={8.5} ry={15} fill="#C9D2DC" transform="rotate(-32 72 68)" />
          <ellipse cx={78} cy={79} rx={4.5} ry={7} fill="#3B4252" transform="rotate(-36 78 79)" />
          {/* 물갈퀴 발 */}
          <path d="M42 97 l-2 8 M56 97 l2 8" stroke="#F5A03C" strokeWidth={3.4} strokeLinecap="round" />
          <path d="M40 105 l-4 5 M40 105 l0 6 M40 105 l4 5" stroke="#F5A03C" strokeWidth={2.6} strokeLinecap="round" />
          <path d="M58 105 l-4 5 M58 105 l0 6 M58 105 l4 5" stroke="#F5A03C" strokeWidth={2.6} strokeLinecap="round" />
          <circle cx={104} cy={56} r={1.8} fill="#5EB3CC" opacity={0.7} />
        </svg>
      );
    case 'jeju-pony': // 감귤 문 조랑말 — 갈기 + 유채꽃 + 발굽
      return (
        <svg width={size} height={size} viewBox="0 0 120 120" style={{ display: 'block' }} aria-label="제주 조랑말 실루엣">
          <ellipse cx={60} cy={112} rx={30} ry={5.5} fill="rgba(74,59,50,0.14)" />
          {/* 꼬리 */}
          <path d="M90 84 q14 4 12 20" stroke="#4A3B32" strokeWidth={7} fill="none" strokeLinecap="round" />
          <path d="M91.5 86.5 q11 3.5 9.8 16" stroke="#6B5A4C" strokeWidth={2} fill="none" strokeLinecap="round" />
          {/* 귀 */}
          <path d="M40 30 L36 14 L52 22 Z" fill="#8A6B52" />
          <path d="M42 27 L39 17 L49 22 Z" fill="#D9C4A8" />
          <path d="M80 30 L84 14 L68 22 Z" fill="#8A6B52" />
          <path d="M78 27 L81 17 L71 22 Z" fill="#D9C4A8" />
          {/* 앞머리 갈기 + 옆 갈기 */}
          <path d="M60 13 q-15 2 -19 15 q9.5 -7 19 -7 q9.5 0 19 7 q-4 -13 -19 -15 Z" fill="#4A3B32" />
          <path d="M52 19 q6 -3.6 14 -1.8" stroke="#6B5A4C" strokeWidth={2.2} fill="none" strokeLinecap="round" />
          <path d="M34 32 q-9 14 -3 29 q4.5 -2 6.5 -6 q-4.5 -11 3.5 -21 Z" fill="#4A3B32" />
          {/* 몸통 */}
          <ellipse cx={60} cy={64} rx={31} ry={36} fill="#8A6B52" />
          {/* 주둥이 + 콧구멍 */}
          <ellipse cx={60} cy={78} rx={17} ry={13} fill="#D9C4A8" />
          <ellipse cx={52} cy={73} rx={2.3} ry={3} fill="#6B5138" />
          <ellipse cx={68} cy={73} rx={2.3} ry={3} fill="#6B5138" />
          {/* 눈 (속눈썹) + 홍조 */}
          <circle cx={46} cy={54} r={3.6} fill="#2B2B33" />
          <circle cx={74} cy={54} r={3.6} fill="#2B2B33" />
          <circle cx={47.3} cy={52.8} r={1.2} fill="#fff" />
          <circle cx={75.3} cy={52.8} r={1.2} fill="#fff" />
          <path d="M42.6 51.4 l-3 -2 M77.4 51.4 l3 -2" stroke="#2B2B33" strokeWidth={1.6} strokeLinecap="round" />
          {blush(36, 62)}
          {blush(84, 62)}
          {/* 입에 문 감귤 (꼭지 잎 + 하이라이트 + 무는 입꼬리) */}
          <circle cx={60} cy={86} r={8.5} fill="#F5A03C" />
          <path d="M52.6 89 a8.5 8.5 0 0 0 14.8 0 q-7.4 3.4 -14.8 0 Z" fill="#E8883C" />
          <circle cx={57} cy={83} r={1.6} fill="#FFD9A8" />
          <circle cx={60} cy={77.6} r={1.5} fill="#4E9B58" />
          <ellipse cx={65.5} cy={75.5} rx={4.2} ry={2.3} fill="#4E9B58" transform="rotate(26 65.5 75.5)" />
          <path d="M52.5 80 q2.5 2 5 1.5 M67.5 80 q-2.5 2 -5 1.5" stroke="#6B5138" strokeWidth={2} fill="none" strokeLinecap="round" />
          {/* 유채꽃 (귀 옆) */}
          <g>
            <circle cx={86} cy={20.5} r={2.7} fill="#FFD66B" />
            <circle cx={89.5} cy={24} r={2.7} fill="#FFD66B" />
            <circle cx={86} cy={27.5} r={2.7} fill="#FFD66B" />
            <circle cx={82.5} cy={24} r={2.7} fill="#FFD66B" />
            <circle cx={86} cy={24} r={2} fill="#E8A63C" />
          </g>
          {/* 다리 + 발굽 */}
          <rect x={44} y={98} width={10} height={11} rx={5} fill="#8A6B52" />
          <rect x={44} y={105} width={10} height={5.5} rx={2.5} fill="#4A3B32" />
          <rect x={66} y={98} width={10} height={11} rx={5} fill="#8A6B52" />
          <rect x={66} y={105} width={10} height={5.5} rx={2.5} fill="#4A3B32" />
        </svg>
      );
    default:
      return null;
  }
}
