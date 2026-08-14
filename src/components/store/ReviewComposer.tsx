// ─── 리뷰 작성 시트 (M2) ──────────────────────────────────────────
// 현장 반경(100m) 안 + 정상 이동이면 '방문 인증' 리뷰(+30),
// 밖이면 일반 리뷰(+15). 1인·1장소·1일 1회.

import { useState } from 'react';
import type { Store } from '../../types';
import { submitReview, withinRadius } from '../../lib/actions';
import { isSuspicious, useVirtualLocation } from '../../mock/location';
import { TOKKEN_ECONOMY } from '../../data/seed';
import { CertifiedBadge } from '../../assets/misc';
import { sName, useT } from '../../i18n';

export function ReviewComposer({ store, onClose }: { store: Store; onClose: () => void }) {
  const T = useT();
  const [rating, setRating] = useState<1 | 2 | 3 | 4 | 5>(5);
  const [text, setText] = useState('');
  // 반경/의심 상태 구독 (위치 이동 시 배너 갱신)
  const suspiciousUntil = useVirtualLocation((s) => s.suspiciousUntil);
  useVirtualLocation((s) => s.position);
  const certified = withinRadius(store) && !isSuspicious({ suspiciousUntil });

  const valid = text.trim().length >= 2;

  return (
    <div className="absolute inset-0 z-[860] flex items-end bg-town-ink/40 fade-in">
      <div className="sheet-up w-full rounded-t-[1.6rem] bg-town-paper p-5 pb-7 shadow-sheet">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-[17px] font-extrabold">
            {T(`${store.name} 리뷰 쓰기`, `Review ${sName(store)}`)}
          </h3>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-town-cream text-[13px] font-bold text-town-inkSoft"
            aria-label="리뷰 닫기"
          >
            ✕
          </button>
        </div>

        {/* 인증 상태 배너 */}
        {certified ? (
          <div className="mb-3 flex items-center gap-2 rounded-xl bg-town-leaf/15 px-3 py-2.5 text-[12.5px] font-bold text-town-leafDark">
            <CertifiedBadge size={15} />
            {T(
              `현장 반경 안이에요 — 방문 인증 뱃지 + 톡큰 ${TOKKEN_ECONOMY.certifiedReview} 지급!`,
              `You're on site — verified badge + ${TOKKEN_ECONOMY.certifiedReview} Tokken!`,
            )}
          </div>
        ) : (
          <div className="mb-3 rounded-xl bg-town-cream px-3 py-2.5 text-[12.5px] font-bold text-town-inkSoft">
            {T(
              `현장 반경 밖(또는 이동 검증 실패) — 일반 리뷰로 등록돼요 (톡큰 ${TOKKEN_ECONOMY.review})`,
              `Outside the radius (or movement check failed) — posts as a regular review (${TOKKEN_ECONOMY.review} Tokken)`,
            )}
          </div>
        )}

        {/* 별점 */}
        <div className="mb-3 flex justify-center gap-1.5">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              onClick={() => setRating(n as 1 | 2 | 3 | 4 | 5)}
              className={`text-[30px] transition ${n <= rating ? '' : 'grayscale opacity-35'}`}
              aria-label={`별점 ${n}점`}
            >
              ⭐
            </button>
          ))}
        </div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, 200))}
          placeholder={T('주민들에게 이 장소를 소개해 주세요 (2자 이상)', 'Tell fellow residents about this place (2+ chars)')}
          rows={3}
          className="w-full resize-none rounded-2xl border-2 border-town-line bg-town-cream/50 p-3.5 text-[14px] font-medium outline-none focus:border-town-leaf"
        />

        <button
          onClick={() => {
            if (submitReview(store.id, rating, text.trim())) onClose();
          }}
          disabled={!valid}
          className="mt-3 w-full rounded-2xl bg-town-leafDark py-3.5 text-[15px] font-extrabold text-white shadow-pop transition active:translate-y-[2px] active:shadow-none disabled:bg-town-line disabled:text-town-inkSoft/50 disabled:shadow-none"
        >
          {certified ? T('방문 인증 리뷰 등록하기', 'Post verified review') : T('리뷰 등록하기', 'Post review')}
        </button>
      </div>
    </div>
  );
}
