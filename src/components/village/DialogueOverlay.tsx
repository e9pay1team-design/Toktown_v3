// ─── NPC 대화 오버레이 (동물의숲풍) ───────────────────────────────
// 이름표가 달린 말풍선 카드 + 타자기 연출. 탭하면 다음 줄, 마지막 줄
// 에서 닫기. 진행 중 탭하면 그 줄을 즉시 완성한다.

import { useEffect, useRef, useState } from 'react';

interface DialogueOverlayProps {
  name: string;
  title?: string;
  /** 이름표 색 */
  accent?: string;
  lines: string[];
  onClose: () => void;
}

export function DialogueOverlay({ name, title, accent = '#7BA55C', lines, onClose }: DialogueOverlayProps) {
  const [step, setStep] = useState(0);
  const [shown, setShown] = useState(0);
  const timer = useRef<number | null>(null);

  const line = lines[Math.min(step, lines.length - 1)] ?? '';
  const done = shown >= line.length;
  const last = step >= lines.length - 1;

  useEffect(() => {
    setShown(0);
    if (timer.current) window.clearInterval(timer.current);
    timer.current = window.setInterval(() => {
      setShown((v) => {
        if (v + 1 >= line.length && timer.current) window.clearInterval(timer.current);
        return v + 1;
      });
    }, 26);
    return () => {
      if (timer.current) window.clearInterval(timer.current);
    };
  }, [step, line.length]);

  const advance = () => {
    if (!done) {
      if (timer.current) window.clearInterval(timer.current);
      setShown(line.length);
      return;
    }
    if (last) onClose();
    else setStep((v) => v + 1);
  };

  return (
    <div className="absolute inset-x-3 bottom-36 z-30 fade-in" role="dialog" aria-label={`${name} 대화`}>
      <button onClick={advance} className="block w-full text-left">
        <div className="relative rounded-[1.4rem] border-[3px] bg-town-paper/97 p-4 pb-3.5 shadow-card" style={{ borderColor: accent }}>
          {/* 이름표 */}
          <span
            className="absolute -top-3.5 left-4 rounded-full px-3 py-1 text-[12px] font-extrabold text-white shadow-sm"
            style={{ background: accent }}
          >
            {name}
            {title && <span className="ml-1 opacity-80 text-[10px]">{title}</span>}
          </span>
          <p className="min-h-[44px] pt-1.5 text-[14px] font-bold leading-relaxed text-town-ink">
            {line.slice(0, shown)}
            {!done && <span className="opacity-40">▏</span>}
          </p>
          <div className="mt-1 flex items-center justify-between">
            <span className="text-[10px] font-bold text-town-inkSoft/70">
              {step + 1} / {lines.length}
            </span>
            <span className="bob text-[12px] font-extrabold" style={{ color: accent }}>
              {done ? (last ? '닫기 ✕' : '다음 ▾') : '…'}
            </span>
          </div>
        </div>
      </button>
    </div>
  );
}
