// ─── 온보딩: 캐릭터 생성 → 닉네임 → 주민증 발급 연출 → 촌장 튜토리얼 ──
// (기획 §6 화면 0) 완료 시 register() 로 주민 등록되어 메인 앱 진입.

import { useMemo, useState } from 'react';
import type { CharacterConfig } from '../../types';
import { CharacterSvg } from '../../assets/CharacterSvg';
import { OwlSvg } from '../../assets/npcs';
import { ResidentStamp, TownLogoMark } from '../../assets/misc';
import {
  HAIR_COLORS,
  HAIR_STYLES,
  OUTFIT_COLORS,
  OUTFITS,
  SKIN_TONES,
} from '../../assets/characterParts';
import { DEFAULT_CHARACTER, useProfileStore } from '../../store/useProfileStore';

type Step = 'welcome' | 'character' | 'nickname' | 'card' | 'tutorial';

const NICK_A = ['총총', '몽글', '반짝', '포근', '씩씩', '두근', '살랑', '쫀득'];
const NICK_B = ['감자', '두부', '솜뭉치', '딸기', '마카롱', '옥수수', '단추', '구름'];

const randomNick = () =>
  `${NICK_A[Math.floor(Math.random() * NICK_A.length)]}${NICK_B[Math.floor(Math.random() * NICK_B.length)]}`;

const randomCharacter = (): CharacterConfig => ({
  skin: Math.floor(Math.random() * SKIN_TONES.length),
  hairStyle: Math.floor(Math.random() * HAIR_STYLES.length),
  hairColor: Math.floor(Math.random() * HAIR_COLORS.length),
  outfit: Math.floor(Math.random() * OUTFITS.length),
  outfitColor: Math.floor(Math.random() * OUTFIT_COLORS.length),
});

export function Onboarding() {
  const register = useProfileStore((s) => s.register);
  const [step, setStep] = useState<Step>('welcome');
  const [config, setConfig] = useState<CharacterConfig>(DEFAULT_CHARACTER);
  const [nickname, setNickname] = useState('');

  return (
    <div className="h-full bg-town-cream">
      {step === 'welcome' && <Welcome onNext={() => setStep('character')} />}
      {step === 'character' && (
        <CharacterCreator config={config} setConfig={setConfig} onNext={() => setStep('nickname')} />
      )}
      {step === 'nickname' && (
        <NicknameStep
          config={config}
          nickname={nickname}
          setNickname={setNickname}
          onBack={() => setStep('character')}
          onNext={() => setStep('card')}
        />
      )}
      {step === 'card' && (
        <CardCeremony config={config} nickname={nickname} onNext={() => setStep('tutorial')} />
      )}
      {step === 'tutorial' && (
        <MayorTutorial onDone={() => register(nickname.trim(), config)} />
      )}
    </div>
  );
}

/* ── 0. 웰컴 ── */
function Welcome({ onNext }: { onNext: () => void }) {
  return (
    <div className="relative flex h-full flex-col items-center justify-center gap-5 px-8 text-center">
      <GrassFooter />
      <div className="pop-in">
        <TownLogoMark size={104} />
      </div>
      <div>
        <p className="text-[13px] font-bold tracking-widest text-town-leafDark">톡페이가 만든 마을</p>
        <h1 className="mt-1 text-[34px] font-extrabold leading-none tracking-tight">
          Tok<span className="text-town-leafDark">Town</span>
        </h1>
        <p className="mt-3 text-[14px] leading-relaxed text-town-inkSoft">
          지도로 발견하고, 다녀오면 마을이 자라나는
          <br />
          당신의 서울 라이프 타운
        </p>
      </div>
      <button
        onClick={onNext}
        className="mt-2 w-full rounded-2xl bg-town-leafDark py-4 text-[16px] font-extrabold text-white shadow-pop transition active:translate-y-[2px] active:shadow-none"
      >
        주민 등록 시작하기
      </button>
      <p className="text-[11.5px] text-town-inkSoft/70">평가용 데모 · 로그인 없이 바로 시작</p>
    </div>
  );
}

/* ── 1. 캐릭터 커스터마이징 ── */
function CharacterCreator({
  config,
  setConfig,
  onNext,
}: {
  config: CharacterConfig;
  setConfig: (c: CharacterConfig) => void;
  onNext: () => void;
}) {
  const [tab, setTab] = useState<'skin' | 'hair' | 'outfit'>('skin');

  const Swatch = ({
    colors,
    value,
    onPick,
  }: {
    colors: string[];
    value: number;
    onPick: (i: number) => void;
  }) => (
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

  const Pills = ({
    items,
    value,
    onPick,
  }: {
    items: readonly string[];
    value: number;
    onPick: (i: number) => void;
  }) => (
    <div className="flex flex-wrap justify-center gap-2">
      {items.map((label, i) => (
        <button
          key={label}
          onClick={() => onPick(i)}
          className={`rounded-full px-4 py-2 text-[13px] font-bold transition ${
            value === i
              ? 'bg-town-leafDark text-white shadow-pop'
              : 'bg-town-paper text-town-inkSoft border border-town-line'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );

  return (
    <div className="flex h-full flex-col">
      <header className="px-6 pb-2 pt-12 text-center">
        <p className="text-[12px] font-bold text-town-leafDark">주민 등록 1/2</p>
        <h2 className="text-[22px] font-extrabold">나만의 주민 만들기</h2>
      </header>

      {/* 미리보기 */}
      <div className="relative mx-auto mt-2 flex h-[240px] w-[240px] items-center justify-center rounded-full bg-gradient-to-b from-[#D8F0DA] to-[#BFE5C4]">
        <div className="char-bob">
          <CharacterSvg config={config} size={185} />
        </div>
        <button
          onClick={() => setConfig(randomCharacter())}
          className="absolute -right-1 bottom-3 flex h-12 w-12 items-center justify-center rounded-full bg-town-sun text-[22px] shadow-pop transition active:translate-y-[2px] active:shadow-none"
          aria-label="랜덤 캐릭터"
          title="랜덤!"
        >
          🎲
        </button>
      </div>

      {/* 파츠 패널 */}
      <div className="mt-4 flex flex-1 flex-col rounded-t-[2rem] border-t border-town-line bg-town-paper px-5 pb-5 pt-4 shadow-sheet">
        <div className="mb-4 grid grid-cols-3 gap-2 rounded-2xl bg-town-cream p-1.5">
          {(
            [
              ['skin', '피부'],
              ['hair', '헤어'],
              ['outfit', '의상'],
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

        <div className="flex flex-1 flex-col justify-center gap-5">
          {tab === 'skin' && (
            <Swatch
              colors={SKIN_TONES}
              value={config.skin}
              onPick={(i) => setConfig({ ...config, skin: i })}
            />
          )}
          {tab === 'hair' && (
            <>
              <Pills
                items={HAIR_STYLES}
                value={config.hairStyle}
                onPick={(i) => setConfig({ ...config, hairStyle: i })}
              />
              <Swatch
                colors={HAIR_COLORS}
                value={config.hairColor}
                onPick={(i) => setConfig({ ...config, hairColor: i })}
              />
            </>
          )}
          {tab === 'outfit' && (
            <>
              <Pills
                items={OUTFITS}
                value={config.outfit}
                onPick={(i) => setConfig({ ...config, outfit: i })}
              />
              <Swatch
                colors={OUTFIT_COLORS}
                value={config.outfitColor}
                onPick={(i) => setConfig({ ...config, outfitColor: i })}
              />
            </>
          )}
        </div>

        <button
          onClick={onNext}
          className="rounded-2xl bg-town-leafDark py-4 text-[16px] font-extrabold text-white shadow-pop transition active:translate-y-[2px] active:shadow-none"
        >
          다음
        </button>
      </div>
    </div>
  );
}

/* ── 2. 닉네임 ── */
function NicknameStep({
  config,
  nickname,
  setNickname,
  onBack,
  onNext,
}: {
  config: CharacterConfig;
  nickname: string;
  setNickname: (n: string) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const valid = nickname.trim().length >= 1 && nickname.trim().length <= 10;

  return (
    <div className="flex h-full flex-col px-6">
      <header className="pb-2 pt-12 text-center">
        <p className="text-[12px] font-bold text-town-leafDark">주민 등록 2/2</p>
        <h2 className="text-[22px] font-extrabold">뭐라고 불러드릴까요?</h2>
      </header>

      <div className="mx-auto mt-3">
        <CharacterSvg config={config} size={150} />
      </div>

      <div className="mt-6">
        <div className="flex items-center gap-2 rounded-2xl border-2 border-town-line bg-town-paper px-4 py-3.5 focus-within:border-town-leaf">
          <input
            value={nickname}
            onChange={(e) => setNickname(e.target.value.slice(0, 10))}
            placeholder="닉네임 (1~10자)"
            className="w-full bg-transparent text-[16px] font-bold outline-none placeholder:font-medium placeholder:text-town-inkSoft/50"
            maxLength={10}
            autoFocus
          />
          <span className="shrink-0 text-[11px] font-bold text-town-inkSoft/60">
            {nickname.trim().length}/10
          </span>
        </div>
        <button
          onClick={() => setNickname(randomNick())}
          className="mt-3 w-full rounded-xl border border-dashed border-town-leaf bg-town-leaf/10 py-2.5 text-[13px] font-bold text-town-leafDark"
        >
          🎲 랜덤 닉네임 추천
        </button>
      </div>

      <div className="mt-auto flex gap-2 pb-8">
        <button
          onClick={onBack}
          className="w-1/3 rounded-2xl border border-town-line bg-town-paper py-4 text-[15px] font-extrabold text-town-inkSoft"
        >
          이전
        </button>
        <button
          onClick={onNext}
          disabled={!valid}
          className="flex-1 rounded-2xl bg-town-leafDark py-4 text-[16px] font-extrabold text-white shadow-pop transition active:translate-y-[2px] active:shadow-none disabled:bg-town-line disabled:text-town-inkSoft/50 disabled:shadow-none"
        >
          주민증 발급받기
        </button>
      </div>
    </div>
  );
}

/* ── 3. 주민증 발급 연출 ── */
function CardCeremony({
  config,
  nickname,
  onNext,
}: {
  config: CharacterConfig;
  nickname: string;
  onNext: () => void;
}) {
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const residentNo = useMemo(
    () => `MD-${String(Math.floor(Math.random() * 9000) + 1000)}`,
    [],
  );
  const confetti = useMemo(
    () =>
      Array.from({ length: 36 }, (_, i) => ({
        left: Math.random() * 100,
        delay: Math.random() * 0.9,
        duration: 2.2 + Math.random() * 1.6,
        size: 7 + Math.random() * 7,
        color: ['#FF8B7B', '#FFD66B', '#7BC47F', '#8ED1E1', '#C7B9F2', '#F2A7C3'][i % 6],
        round: i % 3 === 0,
      })),
    [],
  );

  return (
    <div className="relative flex h-full flex-col items-center justify-center overflow-hidden bg-[#3D5A41] px-7">
      {/* 컨페티 */}
      {confetti.map((c, i) => (
        <span
          key={i}
          className="confetti pointer-events-none absolute top-0"
          style={{
            left: `${c.left}%`,
            width: c.size,
            height: c.size * (c.round ? 1 : 0.55),
            background: c.color,
            borderRadius: c.round ? '50%' : 2,
            animationDelay: `${c.delay}s`,
            animationDuration: `${c.duration}s`,
          }}
        />
      ))}

      <p className="fade-in mb-5 text-center text-[15px] font-bold text-town-cream/90">
        🎉 주민 등록 완료!
      </p>

      {/* 주민증 카드 */}
      <div className="card-reveal relative w-full rounded-[1.6rem] bg-town-paper p-5 shadow-[0_20px_50px_rgba(0,0,0,0.35)]">
        <div className="flex items-center justify-between border-b-2 border-dashed border-town-line pb-3">
          <div className="flex items-center gap-2">
            <TownLogoMark size={30} />
            <span className="text-[14px] font-extrabold tracking-wide">톡타운 주민증</span>
          </div>
          <span className="rounded-full bg-town-leaf/15 px-2.5 py-1 text-[10.5px] font-extrabold text-town-leafDark">
            RESIDENT CARD
          </span>
        </div>

        <div className="mt-4 flex items-center gap-4">
          <div className="overflow-hidden rounded-2xl border-2 border-town-line bg-[#EAF6EF]">
            <CharacterSvg config={config} size={104} bust />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[22px] font-extrabold leading-tight">{nickname.trim()}</p>
            <p className="mt-0.5 text-[12px] font-bold text-town-inkSoft">
              명동 도보권 주민 · {residentNo}
            </p>
            <div className="mt-2.5 space-y-1 text-[11.5px] text-town-inkSoft">
              <p>
                <b className="text-town-ink">발급일</b> {today}
              </p>
              <p>
                <b className="text-town-ink">발급처</b> 톡타운 명동 주민센터
              </p>
            </div>
          </div>
        </div>

        {/* 도장 */}
        <div className="stamp-in absolute -right-2 -top-4">
          <ResidentStamp size={76} />
        </div>

        <p className="mt-4 rounded-xl bg-town-cream px-3 py-2 text-center text-[11px] leading-snug text-town-inkSoft">
          이 증서는 {nickname.trim()} 님이 톡타운의 정식 주민임을 증명합니다
        </p>
      </div>

      <button
        onClick={onNext}
        className="pop-in mt-8 w-full rounded-2xl bg-town-sun py-4 text-[16px] font-extrabold text-town-bark shadow-pop transition active:translate-y-[2px] active:shadow-none"
        style={{ animationDelay: '1.2s', animationFillMode: 'backwards' }}
      >
        톡타운 입장하기
      </button>
    </div>
  );
}

/* ── 4. 촌장 튜토리얼 ── */
const TUTORIAL_LINES = [
  '어서 오게, 새 주민! 나는 톡타운의 촌장 부엉이라네. 부엉.',
  '톡타운에선 지도로 진짜 로컬 맛집을 찾고, 다녀온 기록이 전부 자네의 마을에 쌓인다네.',
  '매장에 다녀오면 건물을, 골목의 동물 친구를 만나면 새 이웃을 얻지. 톡큰도 두둑하게!',
  '아래 4개의 탭 — 지도·커뮤니티·내 마을·지갑만 기억하면 된다네. 그럼, 즐거운 마을 생활을!',
];

function MayorTutorial({ onDone }: { onDone: () => void }) {
  const [idx, setIdx] = useState(0);
  const last = idx === TUTORIAL_LINES.length - 1;

  return (
    <div
      className="relative flex h-full cursor-pointer flex-col items-center justify-end pb-16"
      onClick={() => (last ? onDone() : setIdx(idx + 1))}
    >
      <GrassFooter />
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDone();
        }}
        className="absolute right-5 top-12 z-10 rounded-full bg-town-paper/80 px-3 py-1.5 text-[12px] font-bold text-town-inkSoft"
      >
        건너뛰기
      </button>

      <div className="char-bob z-10 mb-2">
        <OwlSvg size={168} />
      </div>

      {/* 말풍선 */}
      <div className="z-10 mx-6 mb-6 w-[calc(100%-3rem)] rounded-[1.4rem] border-2 border-town-line bg-town-paper p-5 shadow-card">
        <p className="mb-1 text-[12px] font-extrabold text-town-leafDark">촌장 부엉</p>
        <p key={idx} className="fade-in min-h-[72px] text-[15px] font-medium leading-relaxed">
          {TUTORIAL_LINES[idx]}
        </p>
        <div className="mt-2 flex items-center justify-between">
          <div className="flex gap-1.5">
            {TUTORIAL_LINES.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 w-1.5 rounded-full ${i <= idx ? 'bg-town-leafDark' : 'bg-town-line'}`}
              />
            ))}
          </div>
          <span className="text-[12px] font-bold text-town-inkSoft">
            {last ? '탭해서 시작하기 →' : '탭해서 계속 →'}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ── 공용: 잔디 풋터 ── */
function GrassFooter() {
  return (
    <svg
      className="pointer-events-none absolute bottom-0 left-0 w-full"
      height={120}
      viewBox="0 0 390 120"
      preserveAspectRatio="none"
      aria-hidden
    >
      <path d="M0 55 Q65 30 130 50 Q195 70 260 45 Q325 25 390 50 L390 120 L0 120 Z" fill="#A8D98A" />
      <path d="M0 80 Q98 58 195 75 Q292 92 390 72 L390 120 L0 120 Z" fill="#7BC47F" />
      <circle cx={60} cy={92} r={7} fill="#FFD66B" />
      <circle cx={60} cy={92} r={3} fill="#F2705E" />
      <circle cx={320} cy={98} r={6} fill="#F2A7C3" />
      <circle cx={320} cy={98} r={2.5} fill="#FFFDF7" />
      <path d="M140 100 q3 -12 8 -14 M148 100 q0 -8 -2 -14" stroke="#4E9B58" strokeWidth={3} fill="none" strokeLinecap="round" />
    </svg>
  );
}
