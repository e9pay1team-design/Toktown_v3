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
    case 'gyeongui-line':
      return (
        <svg width={size * 1.16} height={size * 0.8} viewBox="0 0 128 88" style={{ display: 'block' }} aria-label="경의선숲길">
          <ellipse cx={64} cy={82} rx={52} ry={5.5} fill="rgba(74,59,50,0.13)" />
          {/* 잔디 둔덕 */}
          <path d="M6 78 Q10 58 34 56 L94 56 Q118 58 122 78 Z" fill="#CDE3AE" />
          <path d="M6 78 Q10 58 34 56 L94 56 Q118 58 122 78 Z" fill="none" stroke="#B7D398" strokeWidth={2.5} />
          {/* 옛 철길 — 침목 + 두 레일 */}
          <path d="M20 74 h88 M24 68 h80" stroke="#9C8D7B" strokeWidth={3} strokeLinecap="round" />
          <path d="M28 78 l4 -14 M44 78 l4 -14 M60 78 l4 -14 M76 78 l4 -14 M92 78 l4 -14" stroke="#B8A98F" strokeWidth={4} strokeLinecap="round" />
          {/* 나무 2그루 */}
          <rect x={30} y={40} width={5} height={16} rx={2.5} fill="#8A6B52" />
          <circle cx={32.5} cy={32} r={14} fill="#79AE60" />
          <circle cx={27} cy={27} r={8} fill="#8CC073" />
          <rect x={92} y={44} width={5} height={13} rx={2.5} fill="#8A6B52" />
          <circle cx={94.5} cy={36} r={12} fill="#79AE60" />
          <circle cx={90} cy={32} r={7} fill="#8CC073" />
          {/* 산책 가로등 + 꽃 */}
          <path d="M64 56 v-20" stroke="#5B4A3F" strokeWidth={3} strokeLinecap="round" />
          <circle cx={64} cy={33} r={4.5} fill="#FFD66B" stroke="#E8B84B" strokeWidth={1.6} />
          <circle cx={48} cy={60} r={2.6} fill="#F2A7C3" />
          <circle cx={80} cy={61} r={2.6} fill="#FFFDF7" />
          <circle cx={55} cy={63} r={2.2} fill="#FFD66B" />
        </svg>
      );
    case 'busking-stage':
      return (
        <svg width={size * 1.1} height={size * 0.92} viewBox="0 0 122 102" style={{ display: 'block' }} aria-label="홍대 버스킹 무대">
          <ellipse cx={61} cy={96} rx={48} ry={5.5} fill="rgba(74,59,50,0.13)" />
          {/* 조명 폴대 + 알전구 스트링 */}
          <rect x={14} y={26} width={4.5} height={64} rx={2.2} fill="#5B4A3F" />
          <rect x={103} y={26} width={4.5} height={64} rx={2.2} fill="#5B4A3F" />
          <path d="M16 30 Q61 48 105 30" stroke="#8C7B6E" strokeWidth={2} fill="none" />
          {[24, 38, 52, 66, 80, 96].map((x, i) => (
            <circle key={x} cx={x} cy={[33.5, 38.5, 41.5, 41.5, 38.5, 33][i]} r={3.2} fill={i % 2 ? '#FFD66B' : '#F2A7C3'} />
          ))}
          {/* 무대 (나무 데크) */}
          <path d="M20 68 L61 60 L102 68 L102 88 L61 96 L20 88 Z" fill="#C9885A" />
          <path d="M20 68 L61 60 L102 68 L61 76 Z" fill="#D89A6A" />
          <path d="M34 65.5 L34 90.5 M48 63 L48 93 M75 63 L75 93 M89 65.5 L89 90.5" stroke="#B37845" strokeWidth={1.6} />
          {/* 앰프 */}
          <rect x={28} y={48} width={18} height={19} rx={2.5} fill="#3B4252" />
          <circle cx={37} cy={59} r={5} fill="#2B2F3E" stroke="#5B6377" strokeWidth={1.6} />
          <path d="M31 51.5 h12" stroke="#5B6377" strokeWidth={1.8} strokeLinecap="round" />
          {/* 마이크 스탠드 */}
          <path d="M66 68 v-26 l7 -5" stroke="#2B2B33" strokeWidth={2.6} strokeLinecap="round" fill="none" />
          <ellipse cx={75} cy={35.5} rx={4.2} ry={5} fill="#5B5566" />
          {/* 통기타 (세워 둠) */}
          <g transform="rotate(9 88 56)">
            <ellipse cx={88} cy={60} rx={8.5} ry={7} fill="#D89A6A" stroke="#B37845" strokeWidth={1.4} />
            <ellipse cx={88} cy={52.5} rx={6.2} ry={5} fill="#D89A6A" />
            <circle cx={88} cy={56.5} r={2.6} fill="#5B4A3F" />
            <rect x={86.4} y={30} width={3.2} height={24} rx={1.6} fill="#8A6B52" />
            <rect x={85} y={26} width={6} height={5.6} rx={2} fill="#5B4A3F" />
          </g>
          {/* 음표 */}
          <g fill="#5F4FA0" stroke="#5F4FA0">
            <ellipse cx={52} cy={22} rx={3} ry={2.4} transform="rotate(-18 52 22)" stroke="none" />
            <path d="M54.8 21 v-8.5 q3.8 0 4.8 3.6" strokeWidth={1.8} fill="none" strokeLinecap="round" />
          </g>
        </svg>
      );
    case 'geunjeongjeon':
      return (
        <svg width={size * 1.05} height={size} viewBox="0 0 126 120" style={{ display: 'block' }} aria-label="경복궁 근정전">
          <ellipse cx={63} cy={114} rx={52} ry={5.5} fill="rgba(74,59,50,0.13)" />
          {/* 2단 월대 (돌 기단) + 계단 */}
          <rect x={12} y={98} width={102} height={14} rx={3} fill="#E7E3DA" />
          <rect x={22} y={86} width={82} height={14} rx={3} fill="#EFEBE2" />
          <path d="M12 105 h102 M22 93 h82" stroke="#CBC4B4" strokeWidth={1.8} />
          <rect x={54} y={86} width={18} height={26} fill="#D9D2C2" />
          <path d="M54 92 h18 M54 98 h18 M54 105 h18" stroke="#B8AE99" strokeWidth={1.6} />
          {/* 본전 — 붉은 기둥 + 창호 */}
          <rect x={28} y={58} width={70} height={28} rx={2.5} fill="#B95D50" />
          <path d="M38 58 v28 M52 58 v28 M63 58 v28 M74 58 v28 M88 58 v28" stroke="#8B4A40" strokeWidth={2.2} />
          <rect x={55} y={66} width={16} height={20} rx={1.5} fill="#5B4A3F" />
          <path d="M42 66 h8 v12 h-8 Z M76 66 h8 v12 h-8 Z" fill="#F5EFDC" stroke="#8B4A40" strokeWidth={1.2} />
          {/* 팔작지붕 2단 + 취두 */}
          <path d="M14 60 Q34 46 63 46 Q92 46 112 60 Q86 52 63 52 Q40 52 14 60 Z" fill="#4E5A66" />
          <path d="M24 46 Q40 32 63 32 Q86 32 102 46 Q82 38 63 38 Q44 38 24 46 Z" fill="#4E5A66" />
          <path d="M14 60 q-4 -2 -6 -6 M112 60 q4 -2 6 -6 M24 46 q-4 -2 -5 -5 M102 46 q4 -2 5 -5" stroke="#37424D" strokeWidth={2.4} fill="none" strokeLinecap="round" />
          <path d="M24 46 Q40 32 63 32 Q86 32 102 46" stroke="#5D6B78" strokeWidth={2.4} fill="none" />
          <rect x={30} y={29} width={5} height={6} rx={1.5} fill="#37424D" />
          <rect x={91} y={29} width={5} height={6} rx={1.5} fill="#37424D" />
        </svg>
      );
    case 'bukchon-hanok':
      return (
        <svg width={size * 1.16} height={size * 0.86} viewBox="0 0 128 94" style={{ display: 'block' }} aria-label="북촌 한옥마을">
          <ellipse cx={64} cy={88} rx={52} ry={5.5} fill="rgba(74,59,50,0.13)" />
          {/* 뒷집 한옥 */}
          <rect x={64} y={44} width={50} height={38} rx={2.5} fill="#F5EFDC" />
          <path d="M74 54 h10 v14 h-10 Z M96 54 h10 v14 h-10 Z" fill="#C8A87E" stroke="#8A6B52" strokeWidth={1.4} />
          <path d="M58 48 Q89 32 120 48 L120 55 Q89 41 58 55 Z" fill="#5E6470" />
          <path d="M58 48 Q89 32 120 48" stroke="#7A8290" strokeWidth={2.4} fill="none" />
          {/* 앞집 한옥 — 대문 + 창호 */}
          <rect x={10} y={54} width={58} height={30} rx={2.5} fill="#FBF6E8" />
          <path d="M18 62 h11 v14 h-11 Z" fill="#C8A87E" stroke="#8A6B52" strokeWidth={1.4} />
          <path d="M23.5 62 v14 M18 69 h11" stroke="#8A6B52" strokeWidth={1.1} />
          <rect x={40} y={60} width={16} height={24} rx={1.5} fill="#7A5C42" />
          <path d="M48 60 v24 M43 66 h10 M43 74 h10" stroke="#5B4433" strokeWidth={1.4} />
          <circle cx={45.5} cy={71} r={1.3} fill="#D9B45F" />
          <circle cx={50.5} cy={71} r={1.3} fill="#D9B45F" />
          {/* 앞집 기와지붕 (곡선 처마 + 수막새) */}
          <path d="M2 58 Q39 40 76 58 L76 66 Q39 50 2 66 Z" fill="#6B7280" />
          <path d="M2 58 Q39 40 76 58" stroke="#858D9B" strokeWidth={2.6} fill="none" />
          <path d="M16 59.5 q4 -3 8 -0.5 M34 55.5 q4 -3 8 -0.5 M52 56.5 q4 -3 8 -0.5" stroke="#4A515E" strokeWidth={1.8} fill="none" />
          <g fill="#4A515E">
            <circle cx={9} cy={63.5} r={2.4} />
            <circle cx={25} cy={60.5} r={2.4} />
            <circle cx={41} cy={59.5} r={2.4} />
            <circle cx={57} cy={60.5} r={2.4} />
            <circle cx={72} cy={63.5} r={2.4} />
          </g>
          {/* 돌담 */}
          <rect x={78} y={72} width={46} height={12} rx={2} fill="#D9D2C2" />
          <path d="M86 72 v12 M96 72 v12 M106 72 v12 M116 72 v12 M78 78 h46" stroke="#B8AE99" strokeWidth={1.4} />
        </svg>
      );
    case 'seoul-forest':
      return (
        <svg width={size * 1.12} height={size * 0.84} viewBox="0 0 126 94" style={{ display: 'block' }} aria-label="서울숲">
          <ellipse cx={63} cy={88} rx={52} ry={5.5} fill="rgba(74,59,50,0.13)" />
          {/* 잔디 둔덕 */}
          <path d="M6 84 Q12 62 40 60 L92 60 Q116 62 120 84 Z" fill="#CDE3AE" />
          <path d="M6 84 Q12 62 40 60 L92 60 Q116 62 120 84 Z" fill="none" stroke="#B7D398" strokeWidth={2.5} />
          {/* 큰 나무 군락 */}
          <rect x={28} y={42} width={6} height={20} rx={3} fill="#8A6B52" />
          <circle cx={31} cy={32} r={16} fill="#79AE60" />
          <circle cx={24} cy={26} r={9} fill="#8CC073" />
          <rect x={58} y={34} width={7} height={28} rx={3.5} fill="#8A6B52" />
          <circle cx={61.5} cy={22} r={19} fill="#6BA254" />
          <circle cx={54} cy={15} r={10} fill="#82BB68" />
          <rect x={92} y={46} width={5.5} height={16} rx={2.7} fill="#8A6B52" />
          <circle cx={94.7} cy={38} r={13} fill="#79AE60" />
          <circle cx={89} cy={33} r={7.5} fill="#8CC073" />
          {/* 꽃사슴 실루엣 */}
          <g fill="#A9855C">
            <ellipse cx={80} cy={72} rx={10} ry={6.5} />
            <rect x={72.5} y={74} width={2.8} height={8} rx={1.4} />
            <rect x={84} y={74} width={2.8} height={8} rx={1.4} />
            <ellipse cx={90.5} cy={65} rx={4.5} ry={4} />
            <path d="M89 62 q-1.5 -4 -4.5 -5 M92.5 61.5 q1.5 -4 4.5 -4.5" stroke="#8A6B52" strokeWidth={1.7} fill="none" strokeLinecap="round" />
          </g>
          <circle cx={78} cy={69} r={1.1} fill="#FFF3DC" />
          <circle cx={83} cy={71} r={1} fill="#FFF3DC" />
          {/* 들꽃 */}
          <circle cx={22} cy={74} r={2.4} fill="#F2A7C3" />
          <circle cx={44} cy={78} r={2.2} fill="#FFD66B" />
          <circle cx={104} cy={76} r={2.4} fill="#FFFDF7" />
        </svg>
      );
    case 'red-brick':
      return (
        <svg width={size} height={size} viewBox="0 0 120 120" style={{ display: 'block' }} aria-label="붉은벽돌 카페거리">
          <ellipse cx={60} cy={114} rx={46} ry={5.5} fill="rgba(74,59,50,0.13)" />
          {/* 굴뚝 */}
          <rect x={86} y={22} width={13} height={50} rx={2} fill="#A34F42" />
          <rect x={84} y={18} width={17} height={7} rx={2} fill="#8B4038" />
          <path d="M86 32 h13 M86 44 h13 M86 56 h13" stroke="#8B4038" strokeWidth={1.6} />
          <circle cx={93} cy={10} r={4} fill="#E4DCD0" opacity={0.8} />
          <circle cx={98} cy={4} r={2.8} fill="#E4DCD0" opacity={0.55} />
          {/* 공장 본채 — 붉은 벽돌 + 톱니 지붕 */}
          <rect x={16} y={52} width={88} height={58} rx={3} fill="#B95D50" />
          <path d="M16 52 L34 38 L34 52 L52 38 L52 52 L70 38 L70 52 L88 38 L88 52 Z" fill="#A34F42" />
          <path d="M34 38 v14 M52 38 v14 M70 38 v14 M88 38 v14" stroke="#8B4038" strokeWidth={1.6} />
          {/* 벽돌 결 */}
          <path d="M16 64 h88 M16 76 h88 M16 88 h88 M16 100 h88" stroke="#A34F42" strokeWidth={1.5} />
          <path d="M30 52 v12 M58 52 v12 M86 52 v12 M44 64 v12 M72 64 v12 M30 76 v12 M58 76 v12 M86 76 v12 M44 88 v12 M72 88 v12" stroke="#A34F42" strokeWidth={1.5} />
          {/* 아치창 + 카페 문 */}
          <path d="M26 74 v-8 a6 6 0 0 1 12 0 v8 Z" fill="#FFF3DC" stroke="#8B4038" strokeWidth={1.6} />
          <path d="M66 74 v-8 a6 6 0 0 1 12 0 v8 Z" fill="#FFF3DC" stroke="#8B4038" strokeWidth={1.6} />
          <rect x={44} y={82} width={22} height={28} rx={2.5} fill="#3F4550" />
          <rect x={47} y={85} width={16} height={14} rx={1.5} fill="#FFEFC9" />
          {/* 커피잔 간판 */}
          <circle cx={55} cy={70} r={9.5} fill="#FFFDF7" stroke="#8B4038" strokeWidth={2} />
          <path d="M51 67 h6.5 v6 a3.2 3.2 0 0 1 -6.5 0 Z" fill="#9C6B43" />
          <path d="M57.5 68 q3 0 3 2.4 q0 2.4 -3 2.4" stroke="#9C6B43" strokeWidth={1.5} fill="none" />
          <path d="M53 64.5 q1 -1.5 0 -3 M55.8 64.5 q1 -1.5 0 -3" stroke="#9C6B43" strokeWidth={1.2} fill="none" strokeLinecap="round" />
          {/* 담쟁이 */}
          <path d="M16 96 q8 -4 7 -14 q6 6 12 2" stroke="#6BA254" strokeWidth={2.4} fill="none" strokeLinecap="round" />
          <circle cx={22} cy={84} r={2.6} fill="#79AE60" />
          <circle cx={31} cy={86} r={2.2} fill="#8CC073" />
        </svg>
      );
    default:
      return null;
  }
}
