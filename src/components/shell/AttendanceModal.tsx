// ─── 출석 체크 팝업 (기획 §6 게임 요소, MVP 포함) ─────────────────
// 홈 진입 시 가상 '오늘' 미출석이면 표시. 도장 찍기 → 톡큰 +10.
// 데모 패널 '날짜 +1' 로 다음 날 출석을 바로 시연할 수 있다.

import { useState } from 'react';
import { useVirtualClock, virtualDayIndex, virtualToday } from '../../mock/clock';
import { useEconomyStore } from '../../store/useEconomyStore';
import { useToastStore } from '../../store/useToastStore';
import { PawStamp } from '../../assets/journey';
import { TOKKEN_ECONOMY } from '../../data/seed';

export function AttendanceModal() {
  const dayOffset = useVirtualClock((s) => s.dayOffset);
  const lastAttendDay = useEconomyStore((s) => s.lastAttendDay);
  const attendStreak = useEconomyStore((s) => s.attendStreak);
  const attend = useEconomyStore((s) => s.attend);
  const toast = useToastStore((s) => s.show);

  const today = virtualDayIndex(dayOffset);
  const [dismissedDay, setDismissedDay] = useState<number | null>(null);
  const [stamping, setStamping] = useState(false);

  if (lastAttendDay === today || dismissedDay === today) return null;

  // 오늘 찍으면 이어질 연속 일수
  const nextStreak = lastAttendDay === today - 1 ? attendStreak + 1 : 1;
  const filledBefore = (nextStreak - 1) % 7;

  const stamp = () => {
    if (stamping) return;
    setStamping(true);
    setTimeout(() => {
      const result = attend(today);
      if (result) {
        toast(`${result.streak}일 연속 출석! 톡큰 +${result.amount}`, 'tokken');
      }
      setStamping(false);
    }, 750);
  };

  return (
    <div className="absolute inset-0 z-[850] flex items-center justify-center bg-town-ink/45 px-8 fade-in">
      <div className="pop-in w-full rounded-[1.6rem] bg-town-paper p-6 text-center shadow-sheet">
        <p className="text-[12px] font-extrabold tracking-wide text-town-leafDark">DAILY STAMP</p>
        <h3 className="mt-1 text-[20px] font-extrabold">오늘의 출석 체크</h3>
        <p className="mt-1 text-[12px] font-bold text-town-inkSoft">{virtualToday(dayOffset)}</p>

        {/* 7칸 도장판 */}
        <div className="mx-auto mt-4 grid w-fit grid-cols-7 gap-2">
          {Array.from({ length: 7 }, (_, i) => {
            const filled = i < filledBefore;
            const isToday = i === filledBefore;
            return (
              <div
                key={i}
                className={`flex h-9 w-9 items-center justify-center rounded-full border-2 ${
                  filled
                    ? 'border-town-coral bg-town-coral/10'
                    : isToday
                      ? 'animate-pulse border-dashed border-town-coral bg-town-cream'
                      : 'border-town-line bg-town-cream'
                }`}
              >
                {filled && <PawStamp size={18} />}
                {isToday && stamping && (
                  <span className="pop-in">
                    <PawStamp size={18} />
                  </span>
                )}
              </div>
            );
          })}
        </div>

        <p className="mt-3 text-[12.5px] leading-relaxed text-town-inkSoft">
          {nextStreak > 1 ? (
            <>
              <b className="text-town-coralDeep">{nextStreak}일 연속</b> 출석 도전 중!
            </>
          ) : (
            '오늘도 톡타운에 온 걸 환영해요!'
          )}
        </p>

        <button
          onClick={stamp}
          disabled={stamping}
          className="mt-4 w-full rounded-2xl bg-town-coral py-3.5 text-[15px] font-extrabold text-white shadow-pop transition active:translate-y-[2px] active:shadow-none disabled:opacity-70"
        >
          {stamping ? '쾅...!' : `출석 도장 찍기 (+${TOKKEN_ECONOMY.attendance} 톡큰)`}
        </button>
        <button
          onClick={() => setDismissedDay(today)}
          className="mt-2 w-full py-1.5 text-[12px] font-bold text-town-inkSoft/70"
        >
          오늘은 넘어가기
        </button>
      </div>
    </div>
  );
}
