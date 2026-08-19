// ─── NPC 조우 연출 (기획 §4: 만나면 도감 등록) ────────────────────
// 반경 안에서 미등록 NPC 를 탭하면 등장. 등록 시 톡큰 + 마을 입주 가능.

import { useMemo } from 'react';
import { DRUMMER_MAGPIE, REGIONAL_NPCS } from '../../data/seed';
import { registerNpcEncounter } from '../../lib/actions';
import { MagpieSvg } from '../../assets/npcs';
import { useT } from '../../i18n';

export function NpcEncounterModal({ npcId, onClose }: { npcId: string; onClose: () => void }) {
  const T = useT();
  const isDrummer = npcId === DRUMMER_MAGPIE.id;
  const npc = isDrummer ? DRUMMER_MAGPIE : REGIONAL_NPCS[0];
  const lines = T(npc.lines, npc.linesEn ?? npc.lines);
  const lineIdx = useMemo(() => Math.floor(Math.random() * npc.lines.length), [npc]);
  const line = lines[lineIdx] ?? lines[0];

  return (
    <div className="absolute inset-0 z-[860] flex items-center justify-center bg-town-ink/55 px-8 fade-in">
      <div className="pop-in w-full rounded-[1.6rem] bg-town-paper p-6 text-center shadow-sheet">
        <p className="text-[12px] font-extrabold tracking-widest text-town-sunDeep">
          {T('✨ 새로운 만남 ✨', '✨ A New Encounter ✨')}
        </p>
        <div className="char-bob mx-auto mt-2 w-fit">
          <MagpieSvg size={130} drummer={isDrummer} />
        </div>
        <h3 className="mt-2 text-[20px] font-extrabold">
          {T(npc.name, npc.nameEn ?? npc.name)}
          <span className="ml-1.5 align-middle text-[10.5px] font-bold text-town-inkSoft">
            {T(npc.species, npc.speciesEn ?? npc.species)} · {T(npc.region, npc.regionEn ?? npc.region)}
          </span>
        </h3>
        {isDrummer && (
          <span className="mt-1 inline-block rounded-full bg-town-lilac/40 px-2.5 py-1 text-[10px] font-extrabold text-[#6B5BAA]">
            {T('🎪 이벤트 한정 NPC', '🎪 Event-limited NPC')}
          </span>
        )}
        <div className="mt-3 rounded-2xl border-2 border-town-line bg-town-cream/60 px-4 py-3">
          <p className="text-[13.5px] font-medium leading-relaxed">"{line}"</p>
        </div>
        <button
          onClick={() => {
            registerNpcEncounter(npcId);
            onClose();
          }}
          className="mt-4 w-full rounded-2xl bg-town-sunDeep py-3.5 text-[15px] font-extrabold text-white shadow-pop transition active:translate-y-[2px] active:shadow-none"
        >
          {T('📖 도감에 등록하기 (+20 톡큰)', '📖 Add to Dex (+20 Tokken)')}
        </button>
        <button
          onClick={onClose}
          className="mt-2 w-full py-1.5 text-[12px] font-bold text-town-inkSoft/70"
        >
          {T('다음에 만나기', 'Maybe next time')}
        </button>
      </div>
    </div>
  );
}
