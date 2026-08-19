// ─── 이벤트 상세 시트 (Event Map) ─────────────────────────────────
// 이벤트 배너를 누르면 열리는 안내 화면: 대표 이미지(코드 SVG) +
// 기본 안내·유의사항(도로 통제 등) + 부스 위치·운영시간·이용정보 +
// 부스/게이트 길찾기(지도 이동). 부스는 지도에도 마커로 표시된다.

import type { EventBooth, TownEvent } from '../../types';
import { tr, useT } from '../../i18n';

/** 대표 이미지 — 광장 야외 콘서트 일러스트 (문루 실루엣 + 무대 + 보랏빛 응원봉 물결) */
function EventArt() {
  return (
    <svg
      viewBox="0 0 400 190"
      role="img"
      aria-label="광화문 콘서트 대표 이미지"
      style={{ display: 'block', width: '100%', height: 'auto' }}
    >
      <defs>
        <linearGradient id="ev-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#171B3F" />
          <stop offset="0.62" stopColor="#3A2E6E" />
          <stop offset="1" stopColor="#6C4FB8" />
        </linearGradient>
        <radialGradient id="ev-glow" cx="0.5" cy="1" r="0.9">
          <stop offset="0" stopColor="rgba(178,140,255,0.55)" />
          <stop offset="1" stopColor="rgba(178,140,255,0)" />
        </radialGradient>
      </defs>
      <rect width={400} height={190} fill="url(#ev-sky)" />
      {[
        [30, 26], [84, 14], [140, 32], [206, 12], [258, 28], [318, 16], [366, 34], [58, 48], [230, 44],
      ].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={i % 3 === 0 ? 1.9 : 1.3} fill="#FFF0C2" opacity={0.85} />
      ))}
      <rect x={0} y={70} width={400} height={120} fill="url(#ev-glow)" />

      {/* 문루 실루엣 (2단 기와 지붕 + 석축 3문) */}
      <g fill="#0F1230">
        <rect x={128} y={104} width={144} height={40} rx={3} />
        <path d="M118 104 h164 l-10 -8 h-144 Z" />
        <path d="M130 84 q70 -14 140 0 l6 12 h-152 Z" />
        <path d="M142 68 q58 -12 116 0 l6 10 h-128 Z" />
        <path d="M136 84 q-8 -4 -12 -10 M264 84 q8 -4 12 -10 M148 68 q-7 -3 -10 -8 M252 68 q7 -3 10 -8" stroke="#0F1230" strokeWidth={5} fill="none" strokeLinecap="round" />
      </g>
      {[152, 188, 224].map((x) => (
        <path key={x} d={`M${x} 144 v-18 q12 -12 24 0 v18 Z`} fill="#2A2450" />
      ))}

      {/* 무대 트러스 + 스포트라이트 */}
      <g>
        <rect x={26} y={96} width={86} height={8} rx={3} fill="#1B1E42" />
        <rect x={30} y={104} width={7} height={44} fill="#1B1E42" />
        <rect x={100} y={104} width={7} height={44} fill="#1B1E42" />
        <rect x={22} y={142} width={94} height={12} rx={3} fill="#241F4E" />
        <path d="M48 104 L20 168 L84 168 Z" fill="rgba(200,170,255,0.20)" />
        <path d="M88 104 L64 168 L128 168 Z" fill="rgba(255,214,140,0.16)" />
        <circle cx={48} cy={101} r={4.4} fill="#FFD66B" />
        <circle cx={88} cy={101} r={4.4} fill="#C7B9F2" />
      </g>
      <path d="M310 96 L282 176 L352 176 Z" fill="rgba(200,170,255,0.16)" />
      <circle cx={310} cy={94} r={4.2} fill="#C7B9F2" />

      {/* 관중 실루엣 + 보라 응원봉 물결 */}
      {Array.from({ length: 26 }, (_, i) => {
        const x = 12 + i * 15 + (i % 3) * 2;
        const y = 172 + (i % 2) * 6;
        return <circle key={`c${i}`} cx={x} cy={y} r={7} fill="#141232" />;
      })}
      {Array.from({ length: 18 }, (_, i) => {
        const x = 20 + i * 21 + (i % 4) * 3;
        const y = 166 + (i % 2) * 7;
        return (
          <g key={`l${i}`}>
            <rect x={x - 1.2} y={y - 12} width={2.4} height={9} rx={1.2} fill="#4A3B62" transform={`rotate(${(i % 5) * 6 - 12} ${x} ${y})`} />
            <circle cx={x + ((i % 5) * 6 - 12) * -0.2} cy={y - 14} r={3.6} fill="#B48CFF" opacity={0.95} />
            <circle cx={x + ((i % 5) * 6 - 12) * -0.2} cy={y - 14} r={6.2} fill="#B48CFF" opacity={0.22} />
          </g>
        );
      })}
    </svg>
  );
}

interface EventSheetProps {
  event: TownEvent;
  onClose: () => void;
  /** 부스/게이트 길찾기 — 지도 이동은 부모(MapScreen)가 담당 */
  onGuide: (booth: EventBooth) => void;
}

export function EventSheet({ event, onClose, onGuide }: EventSheetProps) {
  const T = useT();

  return (
    <div className="pointer-events-none absolute inset-0 z-[580] flex flex-col justify-end px-2 pb-2">
      <div
        className="sheet-up pointer-events-auto flex flex-col overflow-hidden rounded-[1.6rem] border-2 border-[#8B79C9] bg-town-paper shadow-sheet"
        style={{ maxHeight: '560px' }}
      >
        <div className="relative">
          <EventArt />
          <button
            onClick={onClose}
            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-town-paper/90 text-[13px] font-bold text-town-inkSoft"
            aria-label="이벤트 상세 닫기"
          >
            ✕
          </button>
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#171B3F] to-transparent px-4 pb-2.5 pt-6">
            <p className="text-[17px] font-extrabold text-white">🎪 {tr(event.title, event.titleEn ?? event.title)}</p>
            <p className="text-[11px] font-bold text-[#D9CBFF]">
              📍 {tr(event.venue.label, event.venue.labelEn ?? event.venue.label)} · {tr(event.period, event.periodEn ?? event.period)}
            </p>
          </div>
        </div>

        <div className="no-scrollbar flex-1 overflow-y-auto px-4 pb-5 pt-3">
          {/* 혜택 요약 */}
          <div className="rounded-xl border border-town-leaf/40 bg-town-leaf/10 px-3 py-2.5 text-[12px] font-bold leading-snug text-town-leafDark">
            🎁 {tr(event.benefit, event.benefitEn ?? event.benefit)}
          </div>

          {/* 기본 안내·유의사항 */}
          <section className="mt-3">
            <h3 className="text-[13.5px] font-extrabold">⚠️ {T('기본 안내 · 유의사항', 'Notices & Restrictions')}</h3>
            <ul className="mt-1.5 flex flex-col gap-1.5 rounded-xl bg-town-cream/70 p-3">
              {tr(event.notices, event.noticesEn ?? event.notices).map((n) => (
                <li key={n} className="flex gap-1.5 text-[12px] font-medium leading-snug text-town-ink/90">
                  <span className="shrink-0 text-town-coralDeep">·</span>
                  <span>{n}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* 부스 위치 · 운영시간 · 이용정보 · 길찾기 */}
          <section className="mt-3.5">
            <h3 className="text-[13.5px] font-extrabold">
              🗺️ {T('부스 · 게이트 안내', 'Booths & Gates')}
              <span className="ml-1.5 text-[10.5px] font-bold text-town-inkSoft">
                {T('(지도에도 표시돼요)', '(also shown on the map)')}
              </span>
            </h3>
            <ul className="mt-1.5 flex flex-col gap-2">
              {event.booths.map((b) => (
                <li key={b.id} className="flex items-start gap-2.5 rounded-2xl border border-town-line bg-town-paper p-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-[#C7B9F2] bg-[#F3F0FC] text-[16px]">
                    {b.emoji}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-extrabold">{tr(b.name, b.nameEn ?? b.name)}</p>
                    <p className="mt-0.5 text-[10.5px] font-extrabold text-town-inkSoft">
                      🕐 {tr(b.hours, b.hoursEn ?? b.hours)}
                    </p>
                    <p className="mt-0.5 text-[11.5px] font-medium leading-snug text-town-ink/85">
                      {tr(b.info, b.infoEn ?? b.info)}
                    </p>
                  </div>
                  <button
                    onClick={() => onGuide(b)}
                    aria-label={`${b.name} 길찾기`}
                    className="shrink-0 rounded-xl bg-[#8B79C9] px-2.5 py-2 text-[11px] font-extrabold text-white shadow-pop transition active:translate-y-[1px] active:shadow-none"
                  >
                    🧭 {T('길찾기', 'Guide')}
                  </button>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
