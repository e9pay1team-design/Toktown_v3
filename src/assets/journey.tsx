// ─── 이동/지갑 관련 SVG: 차량(지하철·버스), 톡페이 선불카드, 발도장 ─

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

/** 톡페이 선불카드 — 폰에 갖다 대면 충전되는 실물 NFC 카드 */
export function TokpayCardSvg({ size = 96 }: { size?: number }) {
  return (
    <svg width={size} height={size * 0.64} viewBox="0 0 120 77" style={{ display: 'block' }} aria-label="톡페이 선불카드">
      <defs>
        <clipPath id="tokpay-card-clip">
          <rect x={2} y={2} width={116} height={73} rx={11} />
        </clipPath>
      </defs>
      {/* 카드 몸체 + 하단 물결 투톤 */}
      <rect x={2} y={2} width={116} height={73} rx={11} fill="#5EB3CC" />
      <path d="M2 48 Q34 34 62 44 T118 40 L118 77 L2 77 Z" fill="#4EA3BD" clipPath="url(#tokpay-card-clip)" />
      <rect x={2} y={2} width={116} height={73} rx={11} fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth={1.5} />
      {/* 까치 엠블럼 + 워드마크 */}
      <circle cx={22} cy={17} r={9.5} fill="#3B4252" />
      <circle cx={18.4} cy={15.5} r={3} fill="#FFFDF7" />
      <circle cx={25.6} cy={15.5} r={3} fill="#FFFDF7" />
      <circle cx={18.4} cy={15.5} r={1.1} fill="#2B2B33" />
      <circle cx={25.6} cy={15.5} r={1.1} fill="#2B2B33" />
      <path d="M19.5 20.5 L24.5 20.5 L22 24 Z" fill="#F5B942" />
      <text x={37} y={21.5} fontSize={12.5} fontWeight={800} fill="#FFFDF7" fontFamily="system-ui, sans-serif">
        TokPay
      </text>
      {/* IC 칩 */}
      <rect x={13} y={33} width={19} height={14.5} rx={3.5} fill="#FFD66B" />
      <path d="M13 40.2 h19 M22.5 33 v14.5" stroke="#D9A93F" strokeWidth={1.3} />
      {/* NFC 태그 물결 */}
      <path d="M97 31 a9 9 0 0 1 0 16 M103 26 a15 15 0 0 1 0 26" stroke="#FFF8EC" strokeWidth={2.6} fill="none" strokeLinecap="round" />
      <text x={13} y={66} fontSize={8.5} fontWeight={700} fill="#EAF7FB" fontFamily="system-ui, sans-serif">
        선불카드 · 폰 태그 충전
      </text>
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
