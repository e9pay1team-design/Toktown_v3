// ─── 지갑 (기획 §6 화면 8) ────────────────────────────────────────
// 톡페이 잔액(충전) / 교통 잔액(톡페이 → 교통 이동 충전, 와우패스 방식) /
// Tokken 잔액·획득 내역 / Town Key 연동 상태.

import {
  TOKKEN_REASON_EMOJI,
  TOKKEN_REASON_LABEL,
  useEconomyStore,
} from '../../store/useEconomyStore';
import { useToastStore } from '../../store/useToastStore';
import { mockTokpay } from '../../mock/payment';
import { TokkenCoin } from '../../assets/misc';
import { TownKeyringSvg } from '../../assets/journey';

const won = (n: number) => `${n.toLocaleString()}원`;

export function WalletScreen() {
  const eco = useEconomyStore();
  const toast = useToastStore((s) => s.show);

  return (
    <div className="flex h-full flex-col bg-town-cream">
      <header className="px-5 pb-3 pt-12">
        <h2 className="text-[22px] font-extrabold">지갑</h2>
        <p className="text-[12px] font-bold text-town-inkSoft">톡페이 · Town Key · 톡큰</p>
      </header>

      <div className="no-scrollbar flex-1 overflow-y-auto px-4 pb-28">
        {/* 톡페이 잔액 */}
        <section className="rounded-2xl border border-town-line bg-town-paper p-4 shadow-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11.5px] font-extrabold text-town-inkSoft">톡페이 잔액</p>
              <p className="mt-1 text-[24px] font-extrabold leading-none">{won(eco.tokpayBalance)}</p>
            </div>
            <button
              onClick={() => {
                eco.chargeTokpay(mockTokpay.CHARGE_UNIT);
                toast(`톡페이 ${won(mockTokpay.CHARGE_UNIT)} 충전 완료 (시뮬레이션)`, 'success');
              }}
              className="rounded-xl bg-town-skyDeep px-3.5 py-2.5 text-[12.5px] font-extrabold text-white shadow-pop transition active:translate-y-[2px] active:shadow-none"
            >
              + {won(mockTokpay.CHARGE_UNIT)} 충전
            </button>
          </div>
        </section>

        {/* Town Key + 교통 잔액 */}
        <section className="mt-3 rounded-2xl border border-town-line bg-town-paper p-4 shadow-card">
          <div className="flex items-center gap-4">
            <TownKeyringSvg size={64} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <p className="text-[13.5px] font-extrabold">Town Key</p>
                <span className="rounded-full bg-town-leaf/15 px-2 py-0.5 text-[9.5px] font-extrabold text-town-leafDark">
                  계정 연동됨 ✓
                </span>
              </div>
              <p className="mt-0.5 text-[11px] leading-snug text-town-inkSoft">
                키링형 교통카드 · 승차 태그 시 톡큰 적립
              </p>
              <p className="mt-2 text-[11.5px] font-extrabold text-town-inkSoft">교통 잔액</p>
              <p className="text-[20px] font-extrabold leading-tight">{won(eco.transitBalance)}</p>
            </div>
          </div>
          <button
            onClick={() => {
              if (eco.transferToTransit(mockTokpay.TRANSFER_UNIT)) {
                toast(`톡페이 → 교통 잔액 ${won(mockTokpay.TRANSFER_UNIT)} 이동 완료`, 'success');
              } else {
                toast('톡페이 잔액이 부족해요. 먼저 충전하세요!', 'error');
              }
            }}
            className="mt-3 w-full rounded-xl bg-town-leafDark py-3 text-[13px] font-extrabold text-white shadow-pop transition active:translate-y-[2px] active:shadow-none"
          >
            톡페이 → 교통 잔액 {won(mockTokpay.TRANSFER_UNIT)} 이동
          </button>
          <p className="mt-2 text-center text-[10px] text-town-inkSoft/70">
            앱 내 선불 잔액 → 교통 잔액 즉시 충전 방식 (기획 §3.4)
          </p>
        </section>

        {/* Tokken */}
        <section className="mt-3 rounded-2xl border border-town-line bg-town-paper p-4 shadow-card">
          <div className="flex items-center justify-between">
            <p className="text-[11.5px] font-extrabold text-town-inkSoft">톡큰 잔액</p>
            <span className="rounded-full bg-town-cream px-2 py-0.5 text-[10px] font-bold text-town-inkSoft">
              현금 구매 없음 · 활동으로만 획득
            </span>
          </div>
          <p className="mt-1 flex items-center gap-2 text-[24px] font-extrabold leading-none">
            <TokkenCoin size={24} /> {eco.tokken.toLocaleString()}
          </p>

          <h4 className="mb-1.5 mt-4 text-[12px] font-extrabold text-town-inkSoft">획득 내역</h4>
          {eco.history.length === 0 ? (
            <p className="rounded-xl bg-town-cream px-3 py-3 text-center text-[12px] font-bold text-town-inkSoft">
              아직 내역이 없어요. 체크인·리뷰·결제로 톡큰을 모아보세요!
            </p>
          ) : (
            <ul className="flex flex-col">
              {eco.history.slice(0, 15).map((h) => (
                <li key={h.id} className="flex items-center gap-2.5 border-b border-town-line/60 py-2 last:border-0">
                  <span className="text-[16px]">{TOKKEN_REASON_EMOJI[h.reason]}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[12.5px] font-bold">
                      {TOKKEN_REASON_LABEL[h.reason]}
                      {h.detail ? ` · ${h.detail}` : ''}
                    </span>
                    <span className="text-[10px] text-town-inkSoft/70">
                      {new Date(h.ts).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </span>
                  <span className="shrink-0 text-[13.5px] font-extrabold text-town-leafDark">
                    +{h.amount}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
