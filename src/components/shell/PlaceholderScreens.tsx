// ─── M2/M3 예정 탭의 자리표시 화면 ────────────────────────────────
// 하단 4탭 구조(M1)는 완성하되, 내용은 해당 마일스톤에서 채워진다.

import type { ReactNode } from 'react';
import { OwlSvg, PigeonSvg } from '../../assets/npcs';

function Placeholder({
  npc,
  title,
  desc,
  milestone,
  extra,
}: {
  npc: ReactNode;
  title: string;
  desc: string;
  milestone: string;
  extra?: ReactNode;
}) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 bg-town-cream px-10 pb-24 text-center">
      <div className="char-bob">{npc}</div>
      <h2 className="text-xl font-extrabold">{title}</h2>
      <p className="text-[13.5px] leading-relaxed text-town-inkSoft">{desc}</p>
      {extra}
      <span className="rounded-full bg-town-sun px-3.5 py-1.5 text-[12px] font-extrabold text-town-bark shadow-pop">
        {milestone}에서 열려요!
      </span>
    </div>
  );
}

export function CommunityScreen() {
  return (
    <Placeholder
      npc={<PigeonSvg size={120} />}
      title="커뮤니티"
      desc="지역별 채널에서 주민들과 소통하는 열린 광장. 장소 태그와 자동 번역(번역 보기)이 함께 제공될 예정이에요."
      milestone="M3"
    />
  );
}

export function VillageScreen() {
  return (
    <Placeholder
      npc={<OwlSvg size={120} />}
      title="내 마을"
      desc="현실에서 얻고, 마을에 쌓인다! 인증 방문으로 얻은 매장 건물과 NPC 주민, 랜드마크 미니어처를 잔디 그리드에 배치하는 공간이에요."
      milestone="M3"
      extra={
        <svg width={150} height={80} viewBox="0 0 150 80" aria-hidden>
          <path d="M75 6 L142 40 L75 74 L8 40 Z" fill="#A8D98A" />
          <path d="M75 14 L126 40 L75 66 L24 40 Z" fill="#7BC47F" opacity={0.5} />
          <text x={75} y={45} textAnchor="middle" fontSize={11} fontWeight={700} fill="#3D5A41">
            잔디 그리드 공사 중…
          </text>
        </svg>
      }
    />
  );
}

