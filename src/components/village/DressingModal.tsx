// ─── 캐릭터 꾸미기 (기획 §6 화면 9) ───────────────────────────────
// 온보딩과 동일한 파츠 에디터 재사용. 변경 즉시 적용(지도 마커·주민증 반영).

import { useProfileStore } from '../../store/useProfileStore';
import { useToastStore } from '../../store/useToastStore';
import { CharacterSvg } from '../../assets/CharacterSvg';
import { PartsEditor } from '../character/PartsEditor';

export function DressingModal({ onClose }: { onClose: () => void }) {
  const profile = useProfileStore((s) => s.profile);
  const updateCharacter = useProfileStore((s) => s.updateCharacter);
  const toast = useToastStore((s) => s.show);

  if (!profile) return null;

  return (
    <div className="absolute inset-0 z-[860] flex flex-col justify-end bg-town-ink/40 pb-16 fade-in">
      <div className="sheet-up mx-2 mb-1 flex max-h-[82%] flex-col overflow-hidden rounded-[1.6rem] bg-town-paper shadow-sheet">
        <div className="flex items-center justify-between border-b border-town-line px-5 pb-3 pt-4">
          <div>
            <h3 className="text-[16px] font-extrabold">캐릭터 꾸미기</h3>
            <p className="text-[11px] font-bold text-town-inkSoft">변경 사항은 즉시 적용돼요</p>
          </div>
          <button
            onClick={() => {
              toast('새 스타일이 적용됐어요! ✨', 'success');
              onClose();
            }}
            className="rounded-xl bg-town-leafDark px-3.5 py-2 text-[12.5px] font-extrabold text-white shadow-pop transition active:translate-y-[1px] active:shadow-none"
          >
            완료
          </button>
        </div>

        <div className="no-scrollbar flex-1 overflow-y-auto px-5 pb-8 pt-3">
          <div className="mx-auto flex h-[170px] w-[170px] items-center justify-center rounded-full bg-gradient-to-b from-[#D8F0DA] to-[#BFE5C4]">
            <div className="char-bob">
              <CharacterSvg config={profile.character} size={132} />
            </div>
          </div>
          <div className="mt-4">
            <PartsEditor config={profile.character} onChange={updateCharacter} />
          </div>
        </div>
      </div>
    </div>
  );
}
