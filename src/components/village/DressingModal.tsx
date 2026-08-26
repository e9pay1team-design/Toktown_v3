// ─── 캐릭터 꾸미기 (기획 §6 화면 9) ───────────────────────────────
// 온보딩과 동일한 파츠 에디터 재사용. 변경 즉시 적용(지도 마커·주민증 반영).

import { useRef, useState } from 'react';
import type { CharacterConfig } from '../../types';
import { useProfileStore } from '../../store/useProfileStore';
import { useToastStore } from '../../store/useToastStore';
import { CharacterSvg } from '../../assets/CharacterSvg';
import { PartsEditor } from '../character/PartsEditor';
import { tr, useT } from '../../i18n';

export function DressingModal({ onClose }: { onClose: () => void }) {
  const T = useT();
  const profile = useProfileStore((s) => s.profile);
  const updateCharacter = useProfileStore((s) => s.updateCharacter);
  const toast = useToastStore((s) => s.show);
  /** 구매 전 미리보기 임시 착용 (저장 안 됨) */
  const [previewCfg, setPreviewCfg] = useState<CharacterConfig | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // 목록을 내려 보다가 미리보기를 켜면, 착용 모습이 보이도록 아바타로 스크롤.
  const handlePreview = (c: CharacterConfig | null) => {
    setPreviewCfg(c);
    if (c) scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!profile) return null;

  return (
    <div className="absolute inset-0 z-[860] flex flex-col justify-end bg-town-ink/40 pb-16 fade-in">
      <div className="sheet-up mx-2 mb-1 flex max-h-[82%] flex-col overflow-hidden rounded-[1.6rem] bg-town-paper shadow-sheet">
        <div className="flex items-center justify-between border-b border-town-line px-5 pb-3 pt-4">
          <div>
            <h3 className="text-[16px] font-extrabold">{T('캐릭터 꾸미기', 'Style Your Character')}</h3>
            <p className="text-[11px] font-bold text-town-inkSoft">{T('변경 사항은 즉시 적용돼요', 'Changes apply instantly')}</p>
          </div>
          <button
            onClick={() => {
              toast(tr('새 스타일이 적용됐어요! ✨', 'New style applied! ✨'), 'success');
              onClose();
            }}
            className="rounded-xl bg-town-leafDark px-3.5 py-2 text-[12.5px] font-extrabold text-white shadow-pop transition active:translate-y-[1px] active:shadow-none"
          >
            {T('완료', 'Done')}
          </button>
        </div>

        <div ref={scrollRef} className="no-scrollbar flex-1 overflow-y-auto px-5 pb-8 pt-3">
          <div className="relative mx-auto h-[170px] w-[170px]">
            <div className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-b from-[#D8F0DA] to-[#BFE5C4]">
              <div className="char-bob">
                <CharacterSvg config={previewCfg ?? profile.character} size={132} />
              </div>
            </div>
            {previewCfg && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-town-skyDeep px-2.5 py-1 text-[10px] font-extrabold text-white shadow-pop">
                {T('👀 구매 전 미리보기', '👀 Preview before buying')}
              </span>
            )}
          </div>
          <div className="mt-4">
            <PartsEditor
              config={profile.character}
              onChange={updateCharacter}
              market
              onPreviewChange={handlePreview}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
