// ─── 톡페이 결제/잔액 목업 ────────────────────────────────────────
// 실제 PG·계좌 연동 없음. 인터페이스(TokpayApi)를 분리해 두어
// 실서비스 전환 시 이 구현만 실 API 클라이언트로 교체하면 된다.

import type { Store, StoreCategory } from '../types';

/** 카테고리별 결제 금액 목업 (원) */
const MOCK_PRICES: Record<StoreCategory, number> = {
  국밥: 11000,
  한식: 15000,
  면: 12000,
  카페: 6500,
  공연장: 30000,
};

export interface PaymentResult {
  ok: boolean;
  amount: number;
  message: string;
}

export interface TokpayApi {
  /** 매장 결제 시뮬레이션 — 성공 시 결제 금액 반환 */
  payAtStore(store: Store, balance: number): PaymentResult;
  /** 톡페이 잔액 충전 금액 단위 */
  readonly CHARGE_UNIT: number;
  /** 톡페이 잔액 → 교통 잔액 이동 단위 (와우패스 검증 방식) */
  readonly TRANSFER_UNIT: number;
}

export const mockTokpay: TokpayApi = {
  CHARGE_UNIT: 10000,
  TRANSFER_UNIT: 5000,
  payAtStore(store, balance) {
    const amount = MOCK_PRICES[store.category];
    if (balance < amount) {
      return { ok: false, amount, message: '톡페이 잔액이 부족해요. 지갑에서 충전하세요!' };
    }
    return { ok: true, amount, message: `${store.name}에서 ${amount.toLocaleString()}원 결제 완료` };
  },
};

export const priceOf = (store: Store) => MOCK_PRICES[store.category];
