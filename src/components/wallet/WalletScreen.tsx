// ─── 지갑 (기획 §6 화면 8) ────────────────────────────────────────
// 톡페이 잔액(충전) / 교통 잔액(폰 태그로 톡페이 → 선불카드 즉시 충전) /
// Tokken 잔액·획득 내역 / 톡페이 선불카드 연동 상태.

import {
  TOKKEN_REASON_EMOJI,
  TOKKEN_REASON_LABEL,
  TOKKEN_REASON_LABEL_EN,
  useEconomyStore,
} from '../../store/useEconomyStore';
import { useToastStore } from '../../store/useToastStore';
import { mockTokpay } from '../../mock/payment';
import { TokkenCoin } from '../../assets/misc';
import { TokpayCardSvg } from '../../assets/journey';
import { tr, useT } from '../../i18n';

export function WalletScreen() {
  const eco = useEconomyStore();
  const toast = useToastStore((s) => s.show);
  const T = useT();
  const won = (n: number) => T(`${n.toLocaleString()}원`, `₩${n.toLocaleString()}`);

  return (
    <div className="flex h-full flex-col bg-town-cream">
      <header className="px-5 pb-3 pt-12">
        <h2 className="text-[22px] font-extrabold">{T('지갑', 'Wallet')}</h2>
        <p className="text-[12px] font-bold text-town-inkSoft">
          {T('톡페이 · 선불카드 · 톡큰', 'TokPay · Prepaid Card · Tokken')}
        </p>
      </header>

      <div className="no-scrollbar flex-1 overflow-y-auto px-4 pb-28">
        {/* 톡페이 잔액 */}
        <section className="rounded-2xl border border-town-line bg-town-paper p-4 shadow-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11.5px] font-extrabold text-town-inkSoft">{T('톡페이 잔액', 'TokPay balance')}</p>
              <p className="mt-1 text-[24px] font-extrabold leading-none">{won(eco.tokpayBalance)}</p>
            </div>
            <button
              onClick={() => {
                eco.chargeTokpay(mockTokpay.CHARGE_UNIT);
                toast(
                  tr(
                    `톡페이 ${mockTokpay.CHARGE_UNIT.toLocaleString()}원 충전 완료 (시뮬레이션)`,
                    `Charged ₩${mockTokpay.CHARGE_UNIT.toLocaleString()} to TokPay (simulated)`,
                  ),
                  'success',
                );
              }}
              className="rounded-xl bg-town-skyDeep px-3.5 py-2.5 text-[12.5px] font-extrabold text-white shadow-pop transition active:translate-y-[2px] active:shadow-none"
            >
              {T(`+ ${won(mockTokpay.CHARGE_UNIT)} 충전`, `Top up ${won(mockTokpay.CHARGE_UNIT)}`)}
            </button>
          </div>
        </section>

        {/* 톡페이 선불카드 + 교통 잔액 */}
        <section className="mt-3 rounded-2xl border border-town-line bg-town-paper p-4 shadow-card">
          <div className="flex items-center gap-4">
            <TokpayCardSvg size={92} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <p className="text-[13.5px] font-extrabold">{T('톡페이 선불카드', 'TokPay Prepaid Card')}</p>
                <span className="rounded-full bg-town-leaf/15 px-2 py-0.5 text-[9.5px] font-extrabold text-town-leafDark">
                  {T('계정 연동됨 ✓', 'Linked ✓')}
                </span>
              </div>
              <p className="mt-0.5 text-[11px] leading-snug text-town-inkSoft">
                {T('핸드폰에 갖다 대면 충전 · 승차 태그 시 톡큰 적립', 'Tap your phone to top up · earn Tokken on ride tags')}
              </p>
              <p className="mt-2 text-[11.5px] font-extrabold text-town-inkSoft">{T('교통 잔액', 'Transit balance')}</p>
              <p className="text-[20px] font-extrabold leading-tight">{won(eco.transitBalance)}</p>
            </div>
          </div>
          <button
            onClick={() => {
              if (eco.transferToTransit(mockTokpay.TRANSFER_UNIT)) {
                toast(
                  tr(
                    `📳 선불카드에 ${mockTokpay.TRANSFER_UNIT.toLocaleString()}원 충전 완료 (톡페이 차감)`,
                    `📳 Topped up ₩${mockTokpay.TRANSFER_UNIT.toLocaleString()} to the card (from TokPay)`,
                  ),
                  'success',
                );
              } else {
                toast(tr('톡페이 잔액이 부족해요. 먼저 충전하세요!', 'Not enough TokPay balance — top up first!'), 'error');
              }
            }}
            className="mt-3 w-full rounded-xl bg-town-leafDark py-3 text-[13px] font-extrabold text-white shadow-pop transition active:translate-y-[2px] active:shadow-none"
          >
            {T(`📳 폰에 갖다 대고 ${won(mockTokpay.TRANSFER_UNIT)} 충전`, `📳 Tap phone to top up ${won(mockTokpay.TRANSFER_UNIT)}`)}
          </button>
          <p className="mt-2 text-center text-[10px] text-town-inkSoft/70">
            {T(
              '폰 NFC 태그 → 톡페이 잔액에서 선불카드로 즉시 충전 (기획 §3.4)',
              'Phone NFC tap → instant top-up from TokPay balance (spec §3.4)',
            )}
          </p>
        </section>

        {/* Tokken */}
        <section className="mt-3 rounded-2xl border border-town-line bg-town-paper p-4 shadow-card">
          <div className="flex items-center justify-between">
            <p className="text-[11.5px] font-extrabold text-town-inkSoft">{T('톡큰 잔액', 'Tokken balance')}</p>
            <span className="rounded-full bg-town-cream px-2 py-0.5 text-[10px] font-bold text-town-inkSoft">
              {T('현금 구매 없음 · 활동으로만 획득', 'No cash purchase · earned by activity')}
            </span>
          </div>
          <p className="mt-1 flex items-center gap-2 text-[24px] font-extrabold leading-none">
            <TokkenCoin size={24} /> {eco.tokken.toLocaleString()}
          </p>

          <h4 className="mb-1.5 mt-4 text-[12px] font-extrabold text-town-inkSoft">{T('획득 내역', 'History')}</h4>
          {eco.history.length === 0 ? (
            <p className="rounded-xl bg-town-cream px-3 py-3 text-center text-[12px] font-bold text-town-inkSoft">
              {T('아직 내역이 없어요. 체크인·리뷰·결제로 톡큰을 모아보세요!', 'Nothing yet — earn Tokken with check-ins, reviews, and payments!')}
            </p>
          ) : (
            <ul className="flex flex-col">
              {eco.history.slice(0, 15).map((h) => (
                <li key={h.id} className="flex items-center gap-2.5 border-b border-town-line/60 py-2 last:border-0">
                  <span className="text-[16px]">{TOKKEN_REASON_EMOJI[h.reason]}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[12.5px] font-bold">
                      {T(TOKKEN_REASON_LABEL[h.reason], TOKKEN_REASON_LABEL_EN[h.reason])}
                      {h.detail ? ` · ${h.detail}` : ''}
                    </span>
                    <span className="text-[10px] text-town-inkSoft/70">
                      {new Date(h.ts).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </span>
                  <span
                    className={`shrink-0 text-[13.5px] font-extrabold ${h.amount < 0 ? 'text-town-coralDeep' : 'text-town-leafDark'}`}
                  >
                    {h.amount < 0 ? h.amount : `+${h.amount}`}
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
