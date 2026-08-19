// ─── 캐릭터 파츠 에디터 (온보딩 생성 + 마을 꾸미기 공용) ──────────

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
import { useT } from '../../i18n';

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

export function PartsEditor({
  config,
  onChange,
}: {
  config: CharacterConfig;
  onChange: (c: CharacterConfig) => void;
}) {
  const T = useT();
  const [tab, setTab] = useState<'skin' | 'hair' | 'outfit'>('skin');

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-3 gap-2 rounded-2xl bg-town-cream p-1.5">
        {(
          [
            ['skin', T('피부', 'Skin')],
            ['hair', T('헤어', 'Hair')],
            ['outfit', T('의상', 'Outfit')],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`rounded-xl py-2 text-[13.5px] font-extrabold transition ${
              tab === id ? 'bg-town-paper text-town-ink shadow-card' : 'text-town-inkSoft'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex flex-col justify-center gap-5">
        {tab === 'skin' && (
          <Swatch
            colors={SKIN_TONES}
            value={config.skin}
            onPick={(i) => onChange({ ...config, skin: i })}
          />
        )}
        {tab === 'hair' && (
          <>
            <Pills
              items={T<readonly string[]>(HAIR_STYLES, HAIR_STYLES_EN)}
              value={config.hairStyle}
              onPick={(i) => onChange({ ...config, hairStyle: i })}
            />
            <Swatch
              colors={HAIR_COLORS}
              value={config.hairColor}
              onPick={(i) => onChange({ ...config, hairColor: i })}
            />
          </>
        )}
        {tab === 'outfit' && (
          <>
            <Pills
              items={T<readonly string[]>(OUTFITS, OUTFITS_EN)}
              value={config.outfit}
              onPick={(i) => onChange({ ...config, outfit: i })}
            />
            <Swatch
              colors={OUTFIT_COLORS}
              value={config.outfitColor}
              onPick={(i) => onChange({ ...config, outfitColor: i })}
            />
          </>
        )}
      </div>
    </div>
  );
}
