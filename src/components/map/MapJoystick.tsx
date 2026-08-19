// ─── 지도 가상 조이스틱 ───────────────────────────────────────────
// 데모 패널 없이 폰 프레임 안에서 '내 위치'를 옮기는 컨트롤 (기획 §5:
// 모든 정상 조작은 프레임 안에서). 스틱을 기울이면 가상 GPS 가 데모
// 배속(최대 30m/s)으로 연속 이동한다 — 정상 이동으로 기록되므로
// 비현실적 점프 의심 상태도 걷다 보면 해제된다.

import { useEffect, useRef, useState } from 'react';
import { useVirtualLocation } from '../../mock/location';
import { checkLandmarkDiscovery } from '../../lib/actions';

const BASE_PX = 96; // w-24 — 스케일 보정 기준
const STICK_R = 34;
/** 데모 배속 최고 속도 — 명동 도보권을 십수 초에 가로지르는 체감 (요청으로 3배+ 상향) */
const SPEED_MPS = 100;

export function MapJoystick({ onActive }: { onActive: (on: boolean) => void }) {
  const baseRef = useRef<HTMLDivElement>(null);
  const [knob, setKnob] = useState<{ dx: number; dy: number } | null>(null);
  const vec = useRef({ x: 0, y: 0 });
  const raf = useRef(0);
  const lastT = useRef(0);
  const lastDiscover = useRef(0);
  const pointerId = useRef<number | null>(null);

  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  const step = (now: number) => {
    const dt = Math.min(0.06, (now - lastT.current) / 1000);
    lastT.current = now;
    const { x, y } = vec.current;
    if (x !== 0 || y !== 0) {
      const st = useVirtualLocation.getState();
      const lat = st.position.lat;
      // 화면 위(-y)가 북쪽. teleport = 정상 이동 기록 (의심 상태 해제 포함).
      st.teleport({
        lat: lat + (-y * SPEED_MPS * dt) / 111320,
        lng: st.position.lng + (x * SPEED_MPS * dt) / (111320 * Math.cos((lat * Math.PI) / 180)),
      });
      if (now - lastDiscover.current > 900) {
        lastDiscover.current = now;
        checkLandmarkDiscovery();
      }
    }
    raf.current = requestAnimationFrame(step);
  };

  const updateVec = (e: React.PointerEvent) => {
    const el = baseRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const scale = rect.width / BASE_PX; // 폰 프레임 CSS scale 보정
    const dx = (e.clientX - (rect.left + rect.width / 2)) / scale;
    const dy = (e.clientY - (rect.top + rect.height / 2)) / scale;
    const len = Math.hypot(dx, dy);
    const clamped = Math.min(len, STICK_R);
    const nx = len > 1 ? dx / len : 0;
    const ny = len > 1 ? dy / len : 0;
    vec.current = { x: nx * (clamped / STICK_R), y: ny * (clamped / STICK_R) };
    setKnob({ dx: nx * clamped, dy: ny * clamped });
  };

  const end = () => {
    if (pointerId.current === null) return;
    pointerId.current = null;
    vec.current = { x: 0, y: 0 };
    setKnob(null);
    cancelAnimationFrame(raf.current);
    onActive(false);
    // 멈춘 자리에서 랜드마크 발견 판정 한 번 더.
    setTimeout(checkLandmarkDiscovery, 250);
  };

  return (
    <div
      ref={baseRef}
      onPointerDown={(e) => {
        if (pointerId.current !== null) return;
        pointerId.current = e.pointerId;
        baseRef.current?.setPointerCapture(e.pointerId);
        updateVec(e);
        onActive(true);
        lastT.current = performance.now();
        cancelAnimationFrame(raf.current);
        raf.current = requestAnimationFrame(step);
      }}
      onPointerMove={(e) => {
        if (e.pointerId === pointerId.current) updateVec(e);
      }}
      onPointerUp={(e) => {
        if (e.pointerId === pointerId.current) end();
      }}
      onPointerCancel={(e) => {
        if (e.pointerId === pointerId.current) end();
      }}
      className="relative h-24 w-24 rounded-full border-2 border-white/70 bg-town-ink/15 shadow-card backdrop-blur-[2px]"
      style={{ touchAction: 'none' }}
      role="application"
      aria-label="내 위치 이동 조이스틱"
    >
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 flex h-11 w-11 items-center justify-center rounded-full border border-town-line bg-town-paper/95 text-[16px] shadow-card"
        style={{
          transform: knob
            ? `translate(calc(-50% + ${knob.dx}px), calc(-50% + ${knob.dy}px))`
            : 'translate(-50%, -50%)',
        }}
      >
        🚶
      </div>
    </div>
  );
}
