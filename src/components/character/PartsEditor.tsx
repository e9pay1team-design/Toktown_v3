// ─── 캐릭터 파츠 에디터 (온보딩 생성 + 마을 꾸미기 공용) ──────────
// 기본 파츠(피부/헤어/의상)는 무료. market 모드(마을 꾸미기)에서는
// 워드로브 구매 전용 파츠를 미리보기(행 탭) → 구매(가격 버튼)로
// 확인하고 살 수 있다. 미리보기는 저장되지 않는 임시 착용.

import { useState } from 'react';
import type { CharacterConfig } from '../../types';
import {
  HAIR_COLORS,
  HAIR_STYLES,
  HAIR_STYLES_EN,
  OUTFIT_COLORS,
  OUTFITS,
  OUTFITS_EN,
  SKIN_TONES,
} from '../../assets/characterParts';
import { CAT_SLOT, wardrobeByCat, type WardrobeCat } from '../../data/wardrobe';
import { useEconomyStore } from '../../store/useEconomyStore';
import { useProfileStore } from '../../store/useProfileStore';
import { useToastStore } from '../../store/useToastStore';
import { TokkenCoin } from '../../assets/misc';
import { tr, useT } from '../../i18n';

function Swatch({
  colors,
  value,
  onPick,
}: {
  colors: string[];
  value: number;
  onPick: (i: number) => void;
}) {
  return (
    <div className="flex flex-wrap justify-center gap-3">
      {colors.map((c, i) => (
        <button
          key={c}
          onClick={() => onPick(i)}
          className={`h-11 w-11 rounded-full border-4 transition ${
            value === i ? 'scale-110 border-town-ink' : 'border-white'
          }`}
          style={{ background: c }}
          aria-label={`색상 ${i + 1}`}
        />
      ))}
    </div>
  );
}

function Pills({
  items,
  value,
  onPick,
}: {
  items: readonly string[];
  value: number;
  onPick: (i: number) => void;
}) {
  return (
    <div className="flex flex-wrap justify-center gap-2">
      {items.map((label, i) => (
        <button
          key={label}
          onClick={() => onPick(i)}
          className={`rounded-full px-4 py-2 text-[13px] font-bold transition ${
            value === i
              ? 'bg-town-leafDark text-white shadow-pop'
              : 'border border-town-line bg-town-paper text-town-inkSoft'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

/** 구매 전용 파츠 목록 — 행 탭 = 미리보기(미보유)/장착(보유), 가격 버튼 = 구매 */
function MarketList({
  cat,
  config,
  onChange,
  previewId,
  onPreview,
}: {
  cat: WardrobeCat;
  config: CharacterConfig;
  onChange: (c: CharacterConfig) => void;
  previewId: string | null;
  onPreview: (slot: string, id: string | null) => void;
}) {
  const T = useT();
  const tokken = useEconomyStore((s) => s.tokken);
  const spendTokken = useEconomyStore((s) => s.spendTokken);
  const owned = useProfileStore((s) => s.wardrobeOwned);
  const ownWardrobe = useProfileStore((s) => s.ownWardrobe);
  const toast = useToastStore((s) => s.show);

  const slot = CAT_SLOT[cat];
  const equipped = config[slot] ?? null;
  const items = wardrobeByCat(cat);

  const equip = (id: string | null) => {
    onPreview(slot, null);
    onChange({ ...config, [slot]: id });
  };

  const buy = (item: (typeof items)[number]) => {
    if (!spendTokken(item.price)) {
      toast(tr('톡큰이 부족해요! 체크인·결제로 모아보세요', 'Not enough Tokken! Earn more with check-ins and payments'), 'error');
      return;
    }
    ownWardrobe(item.id);
    equip(item.id);
    toast(tr(`${item.name} 구매 완료! 바로 장착했어요`, `Bought ${item.nameEn}! Equipped right away`), 'tokken');
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={() => equip(null)}
        className={`flex items-center justify-between rounded-xl border px-3.5 py-2.5 text-[13px] font-bold transition ${
          equipped === null
            ? 'border-town-leafDark bg-town-leaf/15 text-town-leafDark'
            : 'border-town-line bg-town-paper text-town-inkSoft'
        }`}
      >
        <span>{T('기본 (무료)', 'Default (free)')}</span>
        {equipped === null && <span className="text-[11px] font-extrabold">{T('장착 중', 'Equipped')}</span>}
      </button>
      {items.map((item) => {
        const has = owned.includes(item.id);
        const isOn = equipped === item.id;
        const isPreview = previewId === item.id;
        return (
          <div
            key={item.id}
            role="button"
            tabIndex={0}
            onClick={() => {
              if (has) equip(isOn ? null : item.id);
              else onPreview(slot, isPreview ? null : item.id);
            }}
            aria-label={`${item.name} ${has ? '장착' : '미리보기'}`}
            className={`flex cursor-pointer items-center justify-between rounded-xl border px-3.5 py-2.5 text-[13px] font-bold transition active:scale-[0.98] ${
              isOn
                ? 'border-town-leafDark bg-town-leaf/15 text-town-leafDark'
                : isPreview
                  ? 'border-town-skyDeep bg-town-sky/15'
                  : 'border-town-line bg-town-paper'
            }`}
          >
            <span className="flex min-w-0 items-center gap-2">
              <span className="inline-block h-4 w-4 shrink-0 rounded-full border border-black/10" style={{ background: item.color }} />
              <span className="truncate">{T(item.name, item.nameEn)}</span>
              {isPreview && (
                <span className="shrink-0 rounded-full bg-town-skyDeep px-2 py-0.5 text-[9.5px] font-extrabold text-white">
                  {T('👀 미리보기', '👀 Preview')}
                </span>
              )}
            </span>
            {has ? (
              <span className={`shrink-0 text-[11px] font-extrabold ${isOn ? '' : 'text-town-inkSoft'}`}>
                {isOn ? T('장착 중', 'Equipped') : T('보유 · 장착하기', 'Owned · Equip')}
              </span>
            ) : (
              <span className="flex shrink-0 items-center gap-1.5">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onPreview(slot, isPreview ? null : item.id);
                  }}
                  aria-label={`${item.name} 미리보기 버튼`}
                  className={`rounded-lg px-2 py-1 text-[11.5px] font-extrabold transition active:scale-95 ${
                    isPreview
                      ? 'bg-town-skyDeep text-white'
                      : 'border border-town-skyDeep/50 bg-town-sky/10 text-town-skyDeep'
                  }`}
                >
                  👀 {isPreview ? T('해제', 'Stop') : T('미리보기', 'Try on')}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    buy(item);
                  }}
                  aria-label={`${item.name} 구매`}
                  className={`flex items-center gap-1 rounded-lg px-2 py-1 text-[12px] font-extrabold transition active:scale-95 ${
                    tokken >= item.price ? 'bg-town-leafDark text-white' : 'bg-town-line text-town-inkSoft/60'
                  }`}
                >
                  <TokkenCoin size={13} /> {item.price}
                </button>
              </span>
            )}
          </div>
        );
      })}
      <p className="text-center text-[10px] font-bold text-town-inkSoft/70">
        {T('항목을 누르면 위 캐릭터에 미리 입혀볼 수 있어요', 'Tap an item to try it on the preview above')}
      </p>
    </div>
  );
}

export function PartsEditor({
  config,
  onChange,
  market = false,
  onPreviewChange,
}: {
  config: CharacterConfig;
  onChange: (c: CharacterConfig) => void;
  /** 워드로브 구매 섹션 노출 (마을 꾸미기 전용) */
  market?: boolean;
  /** 미리보기 임시 착용 상태 전달 — null 이면 실제 장착 상태 그대로 */
  onPreviewChange?: (c: CharacterConfig | null) => void;
}) {
  const T = useT();
  const tokken = useEconomyStore((s) => s.tokken);
  const [tab, setTab] = useState<'skin' | 'hair' | 'top' | 'bottom' | 'shoes' | 'face' | 'outfit'>('skin');
  const [preview, setPreview] = useState<{ slot: string; id: string } | null>(null);

  const emitPreview = (slot: string, id: string | null) => {
    const next = id ? { slot, id } : null;
    setPreview(next);
    onPreviewChange?.(next ? ({ ...config, [next.slot]: next.id } as CharacterConfig) : null);
  };

  const change = (c: CharacterConfig) => {
    // 실제 파츠를 바꾸면 미리보기는 해제.
    if (preview) emitPreview(preview.slot, null);
    onChange(c);
  };

  const switchTab = (id: typeof tab) => {
    if (preview) emitPreview(preview.slot, null);
    setTab(id);
  };

  const tabs = market
    ? ([
        ['skin', T('피부', 'Skin')],
        ['hair', T('헤어', 'Hair')],
        ['top', T('상의', 'Top')],
        ['bottom', T('하의', 'Bottom')],
        ['shoes', T('신발', 'Shoes')],
        ['face', T('페이스', 'Face')],
      ] as const)
    : ([
        ['skin', T('피부', 'Skin')],
        ['hair', T('헤어', 'Hair')],
        ['outfit', T('의상', 'Outfit')],
      ] as const);

  const marketProps = { config, onChange: change, previewId: preview?.id ?? null, onPreview: emitPreview };

  return (
    <div className={market ? 'flex min-h-0 flex-1 flex-col gap-3' : 'flex flex-col gap-4'}>
      {market && (
        <div className="flex items-center justify-between rounded-xl bg-town-cream px-3.5 py-2">
          <span className="text-[11.5px] font-extrabold text-town-inkSoft">
            {T('내 톡큰 — 구매 파츠는 1회 구매 후 영구 보유', 'My Tokken — bought parts are yours forever')}
          </span>
          <span className="flex shrink-0 items-center gap-1 text-[14px] font-extrabold">
            <TokkenCoin size={16} /> {tokken.toLocaleString()}
          </span>
        </div>
      )}
      <div className={`grid gap-1.5 rounded-2xl bg-town-cream p-1.5 ${market ? 'grid-cols-6' : 'grid-cols-3'}`}>
        {tabs.map(([id, label]) => (
          <button
            key={id}
            onClick={() => switchTab(id)}
            className={`rounded-xl py-2 font-extrabold transition ${market ? 'text-[11.5px]' : 'text-[13.5px]'} ${
              tab === id ? 'bg-town-paper text-town-ink shadow-card' : 'text-town-inkSoft'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className={market ? 'no-scrollbar min-h-0 flex-1 overflow-y-auto' : ''}>
      <div className="flex flex-col justify-center gap-5 pb-6">
        {tab === 'skin' && (
          <Swatch
            colors={SKIN_TONES}
            value={config.skin}
            onPick={(i) => change({ ...config, skin: i })}
          />
        )}
        {tab === 'hair' && (
          <>
            <Pills
              items={T<readonly string[]>(HAIR_STYLES, HAIR_STYLES_EN)}
              value={config.premiumHair ? -1 : config.hairStyle}
              onPick={(i) => change({ ...config, hairStyle: i, premiumHair: null })}
            />
            <Swatch
              colors={HAIR_COLORS}
              value={config.hairColor}
              onPick={(i) => change({ ...config, hairColor: i })}
            />
            {market && (
              <div>
                <p className="mb-2 text-[11.5px] font-extrabold text-town-inkSoft">{T('구매 스타일', 'Premium styles')}</p>
                <MarketList cat="hair" {...marketProps} />
              </div>
            )}
          </>
        )}
        {(tab === 'outfit' || tab === 'top') && (
          <>
            <Pills
              items={T<readonly string[]>(OUTFITS, OUTFITS_EN)}
              value={config.top ? -1 : config.outfit}
              onPick={(i) => change({ ...config, outfit: i, top: null })}
            />
            <Swatch
              colors={OUTFIT_COLORS}
              value={config.outfitColor}
              onPick={(i) => change({ ...config, outfitColor: i })}
            />
            {market && (
              <div>
                <p className="mb-2 text-[11.5px] font-extrabold text-town-inkSoft">{T('구매 전용 상의', 'Premium tops')}</p>
                <MarketList cat="top" {...marketProps} />
              </div>
            )}
          </>
        )}
        {tab === 'bottom' && <MarketList cat="bottom" {...marketProps} />}
        {tab === 'shoes' && <MarketList cat="shoes" {...marketProps} />}
        {tab === 'face' && <MarketList cat="face" {...marketProps} />}
      </div>
      </div>
    </div>
  );
}
