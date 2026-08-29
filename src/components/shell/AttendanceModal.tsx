// ─── 출석 체크 팝업 (기획 §6 게임 요소 · R5 개편) ─────────────────
// 여행 중 쓰는 앱이라 7일판 대신 '첫 3일 프로그램': 1·2·3일차 10/20/40
// 톡큰 점진 지급 + 3일 개근 보너스 +50, 이후 출석은 매일 +10.
// 홈 진입 시 가상 '오늘' 미출석이면 표시. 데모 패널 '날짜 +1' 로 시연.

import { useState } from 'react';
import { useVirtualClock, virtualDayIndex, virtualToday } from '../../mock/clock';
import {
  ATTEND_DAILY,
  ATTEND_PROGRAM,
  ATTEND_PROGRAM_BONUS,
  attendRewardAt,
  useEconomyStore,
} from '../../store/useEconomyStore';
import { useToastStore } from '../../store/useToastStore';
import { PawStamp } from '../../assets/journey';
import { tr, useT } from '../../i18n';

export function AttendanceModal() {
  const T = useT();
  const dayOffset = useVirtualClock((s) => s.dayOffset);
  const lastAttendDay = useEconomyStore((s) => s.lastAttendDay);
  const attendStreak = useEconomyStore((s) => s.attendStreak);
  const attendCount = useEconomyStore((s) => s.attendCount);
  const attend = useEconomyStore((s) => s.attend);
  const toast = useToastStore((s) => s.show);

  const today = virtualDayIndex(dayOffset);
  const [dismissedDay, setDismissedDay] = useState<number | null>(null);
  const [stamping, setStamping] = useState(false);

  if (lastAttendDay === today || dismissedDay === today) return null;

  // 오늘 찍으면 몇 번째 출석인지 (3일 프로그램 판정 기준)
  const nextCount = attendCount + 1;
  const nextStreak = lastAttendDay === today - 1 ? attendStreak + 1 : 1;
  const inProgram = nextCount <= ATTEND_PROGRAM.length;
  const todayReward = attendRewardAt(nextCount);

  const stamp = () => {
    if (stamping) return;
    setStamping(true);
    setTimeout(() => {
      const result = attend(today);
      if (result) {
        toast(
          result.bonus > 0
            ? tr(
                `3일 개근 달성! 톡큰 +${result.amount} + 보너스 +${result.bonus} 🎁`,
                `3-day perfect! +${result.amount} Tokken + bonus +${result.bonus} 🎁`,
              )
            : tr(
                `${result.count}일차 출석! 톡큰 +${result.amount}`,
                `Day ${result.count} stamped! +${result.amount} Tokken`,
              ),
          'tokken',
        );
      }
      setStamping(false);
    }, 750);
  };

  return (
    <div className="absolute inset-0 z-[850] flex items-center justify-center bg-town-ink/45 px-8 fade-in">
      <div className="pop-in w-full rounded-[1.6rem] bg-town-paper p-6 text-center shadow-sheet">
        <p className="text-[12px] font-extrabold tracking-wide text-town-leafDark">DAILY STAMP</p>
        <h3 className="mt-1 text-[20px] font-extrabold">
          {inProgram ? T('첫 3일 출석 체크', 'First 3-Day Stamps') : T('오늘의 출석 체크', "Today's Attendance")}
        </h3>
        <p className="mt-1 text-[12px] font-bold text-town-inkSoft">{virtualToday(dayOffset)}</p>

        {/* 3칸 도장판 — 각 칸 아래 보상 표기, 3칸 뒤 개근 보너스 */}
        <div className="mx-auto mt-4 flex w-fit items-center gap-2.5">
          {ATTEND_PROGRAM.map((reward, i) => {
            const filled = i < Math.min(attendCount, ATTEND_PROGRAM.length);
            const isToday = inProgram && i === attendCount;
            return (
              <div key={i} className="flex flex-col items-center gap-1">
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-full border-2 ${
                    filled
                      ? 'border-town-coral bg-town-coral/10'
                      : isToday
                        ? 'animate-pulse border-dashed border-town-coral bg-town-cream'
                        : 'border-town-line bg-town-cream'
                  }`}
                >
                  {filled && <PawStamp size={20} />}
                  {isToday && stamping && (
                    <span className="pop-in">
                      <PawStamp size={20} />
                    </span>
                  )}
                </div>
                <span
                  className={`text-[10px] font-extrabold ${isToday ? 'text-town-coralDeep' : 'text-town-inkSoft/80'}`}
                >
                  +{reward}
                </span>
              </div>
            );
          })}
          <div className="flex flex-col items-center gap-1 pl-1">
            <div
              className={`flex h-11 w-11 items-center justify-center rounded-2xl border-2 text-[19px] ${
                attendCount >= ATTEND_PROGRAM.length
                  ? 'border-town-sunDeep bg-town-sun/25'
                  : 'border-dashed border-town-sunDeep/60 bg-town-cream'
              }`}
            >
              🎁
            </div>
            <span className="text-[10px] font-extrabold text-town-sunDeep">+{ATTEND_PROGRAM_BONUS}</span>
          </div>
        </div>

        <p className="mt-3 text-[12.5px] leading-relaxed text-town-inkSoft">
          {inProgram ? (
            nextCount === ATTEND_PROGRAM.length ? (
              <>
                {T('오늘 찍으면 ', 'Stamp today for the ')}
                <b className="text-town-coralDeep">
                  {T(`개근 보너스 +${ATTEND_PROGRAM_BONUS}`, `perfect bonus +${ATTEND_PROGRAM_BONUS}`)}
                </b>
                {T('까지 한 번에!', ' on top!')}
              </>
            ) : (
              T('여행 첫 3일, 보상이 점점 커져요!', 'First 3 days — rewards grow each day!')
            )
          ) : (
            <>
              <b className="text-town-coralDeep">{T(`${nextStreak}일 연속`, `${nextStreak}-day streak`)}</b>{' '}
              {T(`출석 중 · 매일 +${ATTEND_DAILY} 톡큰`, `going · +${ATTEND_DAILY} Tokken daily`)}
            </>
          )}
        </p>

        <button
          onClick={stamp}
          disabled={stamping}
          className="mt-4 w-full rounded-2xl bg-town-coral py-3.5 text-[15px] font-extrabold text-white shadow-pop transition active:translate-y-[2px] active:shadow-none disabled:opacity-70"
        >
          {stamping
            ? T('쾅...!', 'Stamp...!')
            : T(`출석 도장 찍기 (+${todayReward} 톡큰)`, `Stamp attendance (+${todayReward} Tokken)`)}
        </button>
        <button
          onClick={() => setDismissedDay(today)}
          className="mt-2 w-full py-1.5 text-[12px] font-bold text-town-inkSoft/70"
        >
          {T('오늘은 넘어가기', 'Skip today')}
        </button>
      </div>
    </div>
  );
}
