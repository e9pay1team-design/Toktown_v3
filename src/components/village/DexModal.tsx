// ─── NPC 도감 (기획 §4, MVP 포함) ─────────────────────────────────
// 만난 지역 마스코트 NPC 수집·열람. 미조우 NPC 는 실루엣.
// 다른 지역 NPC 는 전국 확대 로드맵 티저로 노출.

import { DRUMMER_MAGPIE, REGIONAL_NPCS } from '../../data/seed';
import { useCollectionStore } from '../../store/useCollectionStore';
import { MagpieSvg } from '../../assets/npcs';

/** 전국 확대 티저 (기획 §4 지역 마스코트 예시) */
const UPCOMING = [
  { region: '홍대', hint: '기타 멘 인디 고양이' },
  { region: '성수/서울숲', hint: '커피 든 꽃사슴' },
  { region: '경복궁/북촌', hint: '한옥 지붕 위 아기호랑이' },
  { region: '부산', hint: '서퍼 갈매기' },
  { region: '제주', hint: '감귤 문 조랑말' },
];

export function DexModal({ onClose }: { onClose: () => void }) {
  const dex = useCollectionStore((s) => s.dex);
  const magpie = REGIONAL_NPCS[0];
  const hasMagpie = dex.includes(magpie.id);
  const hasDrummer = dex.includes(DRUMMER_MAGPIE.id);

  return (
    <div className="absolute inset-0 z-[860] flex flex-col justify-end bg-town-ink/40 pb-16 fade-in">
      <div className="sheet-up mx-2 mb-1 flex max-h-[80%] flex-col overflow-hidden rounded-[1.6rem] bg-town-paper shadow-sheet">
        <div className="flex items-center justify-between border-b border-town-line px-5 pb-3 pt-4">
          <div>
            <h3 className="text-[16px] font-extrabold">NPC 도감</h3>
            <p className="text-[11px] font-bold text-town-inkSoft">
              등록 {dex.length} · 지역을 여행하며 동물 친구를 모아보세요
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-town-cream text-[13px] font-bold text-town-inkSoft"
            aria-label="도감 닫기"
          >
            ✕
          </button>
        </div>

        <div className="no-scrollbar flex-1 overflow-y-auto p-4 pb-8">
          {/* 명동 까미 */}
          <div
            className={`flex items-center gap-3.5 rounded-2xl border-2 p-3.5 ${
              hasMagpie ? 'border-town-leaf bg-town-leaf/5' : 'border-town-line bg-town-cream/50'
            }`}
          >
            <div className={hasMagpie ? '' : 'opacity-30 brightness-0'}>
              <MagpieSvg size={76} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1.5 text-[14.5px] font-extrabold">
                {hasMagpie ? magpie.name : '???'}
                <span className="rounded-full bg-town-cream px-2 py-0.5 text-[9.5px] font-bold text-town-inkSoft">
                  📍 {magpie.region}
                </span>
                {hasMagpie && (
                  <span className="rounded-full bg-town-leafDark px-1.5 py-0.5 text-[9px] font-extrabold text-white">
                    등록
                  </span>
                )}
              </p>
              <p className="mt-1 text-[11.5px] leading-snug text-town-inkSoft">
                {hasMagpie
                  ? magpie.bio
                  : '명동 어딘가에서 반짝이는 버블을 찾아 말을 걸어보세요. 하루마다 출몰 지점이 바뀌어요.'}
              </p>
            </div>
          </div>

          {/* 드러머 까미 (이벤트 한정) */}
          <div
            className={`mt-2.5 flex items-center gap-3.5 rounded-2xl border-2 p-3.5 ${
              hasDrummer ? 'border-[#8B79C9] bg-town-lilac/10' : 'border-dashed border-town-line bg-town-cream/40'
            }`}
          >
            <div className={hasDrummer ? '' : 'opacity-30 brightness-0'}>
              <MagpieSvg size={76} drummer />
            </div>
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1.5 text-[14.5px] font-extrabold">
                {hasDrummer ? DRUMMER_MAGPIE.name : '???'}
                <span className="rounded-full bg-town-lilac/40 px-2 py-0.5 text-[9.5px] font-bold text-[#6B5BAA]">
                  🎪 이벤트 한정
                </span>
                {hasDrummer && (
                  <span className="rounded-full bg-[#8B79C9] px-1.5 py-0.5 text-[9px] font-extrabold text-white">
                    등록
                  </span>
                )}
              </p>
              <p className="mt-1 text-[11.5px] leading-snug text-town-inkSoft">
                {hasDrummer
                  ? DRUMMER_MAGPIE.bio
                  : '난타 스페셜 위크 기간에만 극장 앞에 나타난다는 소문이…'}
              </p>
            </div>
          </div>

          {/* 전국 확대 티저 */}
          <h4 className="mb-2 mt-5 text-[12px] font-extrabold text-town-inkSoft">
            다른 지역의 친구들 (여행하면 만날 수 있어요)
          </h4>
          <div className="grid grid-cols-1 gap-1.5">
            {UPCOMING.map((u) => (
              <div
                key={u.region}
                className="flex items-center gap-3 rounded-xl border border-dashed border-town-line bg-town-cream/40 px-3 py-2.5"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-town-line text-[16px] font-extrabold text-town-inkSoft/60">
                  ?
                </span>
                <div>
                  <p className="text-[12.5px] font-extrabold text-town-inkSoft">📍 {u.region}</p>
                  <p className="text-[10.5px] text-town-inkSoft/70">{u.hint} — 프로토타입 이후 확대</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
