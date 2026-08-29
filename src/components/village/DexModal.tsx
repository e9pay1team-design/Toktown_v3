// ─── NPC 도감 (기획 §4, MVP 포함) ─────────────────────────────────
// 만난 지역 마스코트 NPC 수집·열람. 미조우 NPC 는 실루엣.
// 개방 지역의 마스코트는 정식 카드, 미개방 지역은 확대 로드맵 티저.

import { DRUMMER_MAGPIE, REGIONAL_NPCS } from '../../data/seed';
import { useCollectionStore } from '../../store/useCollectionStore';
import { MagpieSvg, RegionalNpcSvg, UpcomingNpcSvg } from '../../assets/npcs';
import { useT } from '../../i18n';

/** 전국 확대 티저 (기획 §4 지역 마스코트 예시) — 디자인은 실루엣으로만 노출 */
const UPCOMING = [
  { id: 'seongsu-deer', region: '성수/서울숲', regionEn: 'Seongsu', hint: '커피 든 꽃사슴', hintEn: 'A sika deer holding coffee' },
  { id: 'bukchon-tiger', region: '경복궁/북촌', regionEn: 'Gyeongbokgung', hint: '한옥 지붕 위 아기호랑이', hintEn: 'A tiger cub on a hanok roof' },
  { id: 'busan-gull', region: '부산', regionEn: 'Busan', hint: '서퍼 갈매기', hintEn: 'A surfer seagull' },
  { id: 'jeju-pony', region: '제주', regionEn: 'Jeju', hint: '감귤 문 조랑말', hintEn: 'A pony with a tangerine' },
];

export function DexModal({ onClose }: { onClose: () => void }) {
  const T = useT();
  const dex = useCollectionStore((s) => s.dex);
  const hasDrummer = dex.includes(DRUMMER_MAGPIE.id);

  return (
    <div className="absolute inset-0 z-[860] flex flex-col justify-end bg-town-ink/40 pb-16 fade-in">
      <div className="sheet-up mx-2 mb-1 flex max-h-[80%] flex-col overflow-hidden rounded-[1.6rem] bg-town-paper shadow-sheet">
        <div className="flex items-center justify-between border-b border-town-line px-5 pb-3 pt-4">
          <div>
            <h3 className="text-[16px] font-extrabold">{T('NPC 도감', 'NPC Dex')}</h3>
            <p className="text-[11px] font-bold text-town-inkSoft">
              {T(
                `등록 ${dex.length} · 지역을 여행하며 동물 친구를 모아보세요`,
                `${dex.length} registered · travel around to collect animal friends`,
              )}
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
          {/* 개방 지역 마스코트 — 지역 팩이 열릴 때마다 카드가 늘어난다 */}
          {REGIONAL_NPCS.map((npc, i) => {
            const met = dex.includes(npc.id);
            return (
              <div
                key={npc.id}
                className={`flex items-center gap-3.5 rounded-2xl border-2 p-3.5 ${i > 0 ? 'mt-2.5' : ''} ${
                  met ? 'border-town-leaf bg-town-leaf/5' : 'border-town-line bg-town-cream/50'
                }`}
              >
                <div className={met ? '' : 'opacity-30 brightness-0'}>
                  <RegionalNpcSvg npcId={npc.id} size={76} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-1.5 text-[14.5px] font-extrabold">
                    {met ? T(npc.name, npc.nameEn ?? npc.name) : '???'}
                    <span className="rounded-full bg-town-cream px-2 py-0.5 text-[9.5px] font-bold text-town-inkSoft">
                      📍 {T(npc.region, npc.regionEn ?? npc.region)}
                    </span>
                    {met && (
                      <span className="rounded-full bg-town-leafDark px-1.5 py-0.5 text-[9px] font-extrabold text-white">
                        {T('등록', 'Registered')}
                      </span>
                    )}
                  </p>
                  <p className="mt-1 text-[11.5px] leading-snug text-town-inkSoft">
                    {met
                      ? T(npc.bio, npc.bioEn ?? npc.bio)
                      : T(
                          npc.dexHint ?? '지도 어딘가에서 반짝이는 버블을 찾아 말을 걸어보세요.',
                          npc.dexHintEn ?? 'Find the sparkling bubble on the map and say hi.',
                        )}
                  </p>
                </div>
              </div>
            );
          })}

          {/* 까아미 (이벤트 한정) */}
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
                {hasDrummer ? T(DRUMMER_MAGPIE.name, DRUMMER_MAGPIE.nameEn) : '???'}
                <span className="rounded-full bg-town-lilac/40 px-2 py-0.5 text-[9.5px] font-bold text-[#6B5BAA]">
                  {T('🎪 이벤트 한정', '🎪 Event-limited')}
                </span>
                {hasDrummer && (
                  <span className="rounded-full bg-[#8B79C9] px-1.5 py-0.5 text-[9px] font-extrabold text-white">
                    {T('등록', 'Registered')}
                  </span>
                )}
              </p>
              <p className="mt-1 text-[11.5px] leading-snug text-town-inkSoft">
                {hasDrummer
                  ? T(DRUMMER_MAGPIE.bio, DRUMMER_MAGPIE.bioEn)
                  : T(
                      '콘서트 주간에만 광화문 게이트 앞에 나타난다는 소문이…',
                      'Rumor says it only appears by the Gwanghwamun gate during concert week…',
                    )}
              </p>
            </div>
          </div>

          {/* 전국 확대 티저 */}
          <h4 className="mb-2 mt-5 text-[12px] font-extrabold text-town-inkSoft">
            {T('다른 지역의 친구들 (여행하면 만날 수 있어요)', 'Friends in other regions (meet them by traveling)')}
          </h4>
          <div className="grid grid-cols-1 gap-1.5">
            {UPCOMING.map((u) => (
              <div
                key={u.id}
                className="flex items-center gap-3 rounded-xl border border-dashed border-town-line bg-town-cream/40 px-3 py-2"
              >
                {/* 미조우 — 검은 실루엣만 */}
                <div className="shrink-0 opacity-35 brightness-0">
                  <UpcomingNpcSvg id={u.id} size={52} />
                </div>
                <div className="min-w-0">
                  <p className="text-[12.5px] font-extrabold text-town-inkSoft">
                    ??? <span className="ml-1 rounded-full bg-town-cream px-2 py-0.5 text-[9.5px] font-bold">📍 {T(u.region, u.regionEn)}</span>
                  </p>
                  <p className="mt-0.5 text-[10.5px] text-town-inkSoft/70">{T(u.hint, u.hintEn)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
