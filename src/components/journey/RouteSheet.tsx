// ─── 길찾기 설정 (기획 §6 화면 5) ─────────────────────────────────
// 출발/도착 + 이동수단 탭(대중교통/도보) + 경로 후보(시간/환승/요금)
// + 경로 상세(승하차 안내) + 이동 시작.
// 대중교통 → 승차 태그 대기, 도보 → 즉시 경로 추적.

import { useMemo, useState } from 'react';
import { storeById } from '../../data/seed';
import { buildRoutes, type RouteCandidate, type RouteMode } from '../../lib/routes';
import { useVirtualLocation } from '../../mock/location';
import { useJourneyStore } from '../../store/useJourneyStore';
import { useUiStore } from '../../store/useUiStore';
import { sName, useLang, useT } from '../../i18n';

const VEHICLE_EMOJI = { subway: '🚇', bus: '🚌', walk: '🚶' } as const;

export function RouteSheet({ storeId }: { storeId: number }) {
  const store = storeById(storeId);
  const position = useVirtualLocation((s) => s.position);
  const setRouteSheetFor = useUiStore((s) => s.setRouteSheetFor);
  const startWaitTag = useJourneyStore((s) => s.startWaitTag);
  const startWalk = useJourneyStore((s) => s.startWalk);
  const T = useT();
  const lang = useLang();

  const [mode, setMode] = useState<RouteMode>('transit');
  const [swapped, setSwapped] = useState(false);
  const [selectedId, setSelectedId] = useState('subway');

  const routes = useMemo(() => {
    if (!store) return [];
    const from = swapped ? store : position;
    const to = swapped ? position : store;
    return buildRoutes({ lat: from.lat, lng: from.lng }, { lat: to.lat, lng: to.lng });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store, position, swapped, lang]);

  if (!store) return null;
  const candidates = routes.filter((r) => r.mode === mode);
  const selected: RouteCandidate | undefined =
    candidates.find((r) => r.id === selectedId) ?? candidates[0];

  const close = () => setRouteSheetFor(null);

  const start = () => {
    if (!selected) return;
    close();
    if (selected.mode === 'transit') startWaitTag(selected, store.id);
    else startWalk(selected, store.id);
  };

  const fromLabel = swapped ? sName(store) : T('내 위치', 'My location');
  const toLabel = swapped ? T('내 위치', 'My location') : sName(store);

  return (
    // 하단 탭바(z-800)에 가려지지 않게 pb 로 그 높이만큼 띄운다.
    <div className="pointer-events-none absolute inset-0 z-[570] flex flex-col justify-end px-2 pb-[4.6rem]">
      <div className="sheet-up pointer-events-auto overflow-hidden rounded-[1.6rem] border border-town-line bg-town-paper shadow-sheet">
        <div className="relative flex items-center justify-center pb-1 pt-3">
          <h3 className="text-[15px] font-extrabold">{T('길찾기', 'Directions')}</h3>
          <button
            onClick={close}
            className="absolute right-3 top-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-town-cream text-[13px] font-bold text-town-inkSoft"
            aria-label="길찾기 닫기"
          >
            ✕
          </button>
        </div>

        <div className="px-4 pb-4">
          {/* 출발/도착 + 스왑 */}
          <div className="flex items-center gap-2 rounded-2xl bg-town-cream p-3">
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1.5 truncate text-[13px] font-bold">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-town-skyDeep" /> {fromLabel}
              </p>
              <div className="my-1.5 ml-[4px] h-3 border-l-2 border-dotted border-town-inkSoft/40" />
              <p className="flex items-center gap-1.5 truncate text-[13px] font-bold">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-town-coral" /> {toLabel}
              </p>
            </div>
            <button
              onClick={() => setSwapped(!swapped)}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-town-line bg-town-paper text-[15px] shadow-sm"
              aria-label="출발/도착 바꾸기"
            >
              ⇅
            </button>
          </div>

          {/* 이동수단 탭 */}
          <div className="mt-3 grid grid-cols-2 gap-2 rounded-2xl bg-town-cream p-1.5">
            {(
              [
                ['transit', T('🚇 대중교통', '🚇 Transit')],
                ['walk', T('🚶 도보', '🚶 Walk')],
              ] as const
            ).map(([m, label]) => (
              <button
                key={m}
                onClick={() => {
                  setMode(m);
                  setSelectedId(m === 'transit' ? 'subway' : 'walk');
                }}
                className={`rounded-xl py-2 text-[13px] font-extrabold transition ${
                  mode === m ? 'bg-town-paper shadow-card' : 'text-town-inkSoft'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* 경로 후보 */}
          <div className="mt-3 flex flex-col gap-2">
            {candidates.map((r) => (
              <button
                key={r.id}
                onClick={() => setSelectedId(r.id)}
                className={`rounded-2xl border-2 p-3 text-left transition ${
                  selected?.id === r.id
                    ? 'border-town-leaf bg-town-leaf/5'
                    : 'border-town-line bg-town-paper'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[14px] font-extrabold">
                    {VEHICLE_EMOJI[r.vehicle]} {r.label}
                    <span className="ml-1.5 text-[11px] font-bold text-town-inkSoft">{r.line}</span>
                  </span>
                  <span className="text-[15px] font-extrabold text-town-leafDark">
                    {T(`${r.minutes}분`, `${r.minutes} min`)}
                  </span>
                </div>
                <p className="mt-0.5 text-[11px] font-bold text-town-inkSoft">
                  {T(
                    `환승 ${r.transfers}회 · ${r.fare === 0 ? '무료' : `${r.fare.toLocaleString()}원`}`,
                    `${r.transfers} transfers · ${r.fare === 0 ? 'Free' : `₩${r.fare.toLocaleString()}`}`,
                  )}
                </p>
              </button>
            ))}
          </div>

          {/* 경로 상세 (승하차 안내) */}
          {selected && (
            <div className="mt-3 rounded-2xl bg-town-cream p-3">
              {selected.steps.map((s, i) => (
                <p key={i} className="flex items-center gap-2 py-1 text-[12.5px] font-bold">
                  <span>{s.icon}</span> {s.text}
                </p>
              ))}
            </div>
          )}

          <button
            onClick={start}
            className="mt-3 w-full rounded-2xl bg-town-leafDark py-4 text-[15.5px] font-extrabold text-white shadow-pop transition active:translate-y-[2px] active:shadow-none"
          >
            {T('이동 시작', 'Start Journey')}
          </button>
          {selected?.mode === 'transit' && (
            <p className="mt-2 text-center text-[10.5px] text-town-inkSoft/80">
              {T('이동 시작 후 승차 태그(데모 패널)로 탑승을 감지해요', 'After starting, the ride tag (demo panel) detects boarding')}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
