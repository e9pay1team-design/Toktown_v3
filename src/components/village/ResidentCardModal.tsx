// ─── 주민증 (기획 §6 게임 요소, MVP 포함) ─────────────────────────
// 프로필: 캐릭터 + 닉네임 + 방문 지역 뱃지 + 활동 요약.

import { useMemo } from 'react';
import { useProfileStore } from '../../store/useProfileStore';
import { useVisitStore } from '../../store/useVisitStore';
import { useCollectionStore } from '../../store/useCollectionStore';
import { useEconomyStore } from '../../store/useEconomyStore';
import { CharacterSvg } from '../../assets/CharacterSvg';
import { ResidentStamp, TokkenCoin, TownLogoMark } from '../../assets/misc';

const REGIONS = ['명동', '홍대', '성수', '부산', '제주'];

export function ResidentCardModal({ onClose }: { onClose: () => void }) {
  const profile = useProfileStore((s) => s.profile);
  const events = useVisitStore((s) => s.events);
  const dex = useCollectionStore((s) => s.dex);
  const landmarks = useCollectionStore((s) => s.landmarks);
  const tokken = useEconomyStore((s) => s.tokken);

  const visitedStoreCount = useMemo(() => {
    const set = new Set<number>();
    for (const e of events) {
      if (e.type === 'checkin' || e.type === 'certReview') set.add(e.storeId);
    }
    return set.size;
  }, [events]);

  const residentNo = useMemo(() => {
    if (!profile) return 'MD-0000';
    let h = 0;
    for (const ch of profile.nickname) h = (h * 31 + ch.charCodeAt(0)) % 9000;
    return `MD-${String(h + 1000)}`;
  }, [profile]);

  if (!profile) return null;
  const myeongdongActive = visitedStoreCount > 0 || landmarks.length > 0;

  return (
    <div className="absolute inset-0 z-[860] flex items-center justify-center bg-town-ink/50 px-7 fade-in" onClick={onClose}>
      <div className="pop-in w-full" onClick={(e) => e.stopPropagation()}>
        <div className="relative rounded-[1.6rem] bg-town-paper p-5 shadow-sheet">
          <div className="flex items-center justify-between border-b-2 border-dashed border-town-line pb-3">
            <div className="flex items-center gap-2">
              <TownLogoMark size={30} />
              <span className="text-[14px] font-extrabold tracking-wide">톡타운 주민증</span>
            </div>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-town-cream text-[13px] font-bold text-town-inkSoft"
              aria-label="주민증 닫기"
            >
              ✕
            </button>
          </div>

          <div className="mt-4 flex items-center gap-4">
            <div className="overflow-hidden rounded-2xl border-2 border-town-line bg-[#EAF6EF]">
              <CharacterSvg config={profile.character} size={100} bust />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[20px] font-extrabold leading-tight">{profile.nickname}</p>
              <p className="mt-0.5 text-[11.5px] font-bold text-town-inkSoft">
                명동 도보권 주민 · {residentNo}
              </p>
              <p className="mt-1.5 text-[11px] text-town-inkSoft">
                <b className="text-town-ink">주민 등록일</b> {profile.residentSince}
              </p>
            </div>
          </div>

          {/* 활동 요약 */}
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            <div className="rounded-xl bg-town-cream px-1 py-2.5">
              <p className="text-[16px] font-extrabold leading-none">{visitedStoreCount}</p>
              <p className="mt-1 text-[9.5px] font-bold text-town-inkSoft">인증 방문 매장</p>
            </div>
            <div className="rounded-xl bg-town-cream px-1 py-2.5">
              <p className="text-[16px] font-extrabold leading-none">{dex.length}</p>
              <p className="mt-1 text-[9.5px] font-bold text-town-inkSoft">도감 등록</p>
            </div>
            <div className="rounded-xl bg-town-cream px-1 py-2.5">
              <p className="flex items-center justify-center gap-1 text-[16px] font-extrabold leading-none">
                <TokkenCoin size={14} /> {tokken}
              </p>
              <p className="mt-1 text-[9.5px] font-bold text-town-inkSoft">보유 톡큰</p>
            </div>
          </div>

          {/* 방문 지역 뱃지 */}
          <p className="mb-1.5 mt-4 text-[11px] font-extrabold text-town-inkSoft">방문 지역 뱃지</p>
          <div className="flex flex-wrap gap-1.5">
            {REGIONS.map((r) => {
              const active = r === '명동' && myeongdongActive;
              return (
                <span
                  key={r}
                  className={`rounded-full px-2.5 py-1 text-[10.5px] font-extrabold ${
                    active
                      ? 'bg-town-leafDark text-white shadow-pop'
                      : 'bg-town-line text-town-inkSoft/60'
                  }`}
                >
                  {active ? '🏅 ' : ''}
                  {r}
                </span>
              );
            })}
          </div>

          <div className="absolute -right-1 top-10 opacity-90">
            <ResidentStamp size={62} />
          </div>
        </div>
      </div>
    </div>
  );
}
