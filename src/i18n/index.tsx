// ─── 언어 모드 (한/영 전환) ───────────────────────────────────────
// 외국인 대상 서비스 전제 — 앱 전역 UI·콘텐츠를 KO/EN 으로 전환한다.
// UI 문자열은 tr()/useT() 인라인 페어, 시드 콘텐츠는 *En 필드를 참조.
// 리뷰·커뮤니티 글(UGC)은 앱 언어와 일치하는 쪽을 기본 표시하고
// '원문/번역 보기' 토글을 제공한다. 데모 컨트롤 패널(평가용)은 한국어 유지.

import { useMemo } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { DecorItem, Landmark, Store, StoreCategory } from '../types';

export type Lang = 'ko' | 'en';

interface LangState {
  lang: Lang;
  setLang: (lang: Lang) => void;
}

export const useLangStore = create<LangState>()(
  persist((set) => ({ lang: 'ko', setLang: (lang) => set({ lang }) }), {
    name: 'toktown:lang',
  }),
);

/** 비 React 컨텍스트(토스트·액션)용 — 호출 시점 언어로 선택 */
export function tr<V>(ko: V, en: V): V {
  return useLangStore.getState().lang === 'en' ? en : ko;
}

/** React 컴포넌트용 — 언어 변경을 구독하는 선택 함수 */
export function useT(): <V>(ko: V, en: V) => V {
  const lang = useLangStore((s) => s.lang);
  return useMemo(() => {
    return function pick<V>(ko: V, en: V): V {
      return lang === 'en' ? en : ko;
    };
  }, [lang]);
}

export function useLang(): Lang {
  return useLangStore((s) => s.lang);
}

/* ── 시드 콘텐츠 로컬라이즈 접근자 ─────────────────────────────── */

export const CATEGORY_EN: Record<StoreCategory, string> = {
  국밥: 'Gukbap',
  한식: 'Korean',
  면: 'Noodles',
  카페: 'Cafe',
  공연장: 'Theater',
};

export const catLabel = (c: StoreCategory): string => tr(c, CATEGORY_EN[c]);
export const sName = (s: Store): string => tr(s.name, s.nameEn ?? s.name);
export const sSub = (s: Store): string | undefined => tr(s.subCategory, s.subCategoryEn ?? s.subCategory);
export const sHours = (s: Store): string => tr(s.hours, s.hoursEn ?? s.hours);
export const sBenefit = (s: Store): string | undefined => tr(s.benefit, s.benefitEn ?? s.benefit);
export const sDesc = (s: Store): string => tr(s.desc, s.descEn ?? s.desc);
export const sTags = (s: Store): string[] => tr(s.tags, s.tagsEn ?? s.tags);
export const sTips = (s: Store): string[] => tr(s.tips ?? [], s.tipsEn ?? s.tips ?? []);
export const sWaitingPartner = (s: Store): string =>
  tr(s.waitingPartner ?? '', s.waitingPartnerEn ?? s.waitingPartner ?? '');
export const lmName = (l: Landmark): string => tr(l.name, l.nameEn ?? l.name);
export const lmDesc = (l: Landmark): string => tr(l.desc, l.descEn ?? l.desc);
export const decorName = (d: DecorItem): string => tr(d.name, d.nameEn ?? d.name);

/** 상태바 영역(노치 옆) 전역 언어 토글 — 온보딩부터 노출 */
export function LangToggle() {
  const lang = useLangStore((s) => s.lang);
  const setLang = useLangStore((s) => s.setLang);
  return (
    <div
      className="absolute right-3 top-3 z-[840] flex items-center overflow-hidden rounded-full border border-town-line bg-town-paper/90 shadow-sm backdrop-blur-sm"
      role="group"
      aria-label="언어 선택 / Language"
    >
      {(['ko', 'en'] as const).map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          aria-pressed={lang === l}
          className={`px-2.5 py-1 text-[10.5px] font-extrabold transition ${
            lang === l ? 'bg-town-ink text-town-paper' : 'text-town-inkSoft'
          }`}
        >
          {l === 'ko' ? '한' : 'EN'}
        </button>
      ))}
    </div>
  );
}
