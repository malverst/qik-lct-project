import type { CoinReason, Wallet } from '@/types/game';

export type CoinChange = {
  amount: number;
  reason: CoinReason;
  label: string;
};

export type CreditResult =
  | { ok: true; wallet: Wallet; change: CoinChange }
  | { ok: false; message: string };

const REASON_LABEL: Record<CoinReason, string> = {
  'start-budget': 'Стартовые монеты',
  purchase: 'Покупка',
  task: 'Задание',
  'food-help': 'Запас на еду',
};

export type DebitResult =
  | { ok: true; wallet: Wallet; change: CoinChange }
  | { ok: false; message: string };

export function debitCoins(wallet: Wallet, amount: number, reason: CoinReason, label: string): DebitResult {
  if (!Number.isInteger(amount) || amount <= 0) {
    return { ok: false, message: 'Можно списать только целые монеты больше нуля.' };
  }

  if (wallet.coins < amount) {
    return {
      ok: false,
      message: `Нужно ${amount} монет, а есть ${wallet.coins}. Не хватает ${amount - wallet.coins}.`,
    };
  }

  return {
    ok: true,
    wallet: { ...wallet, coins: wallet.coins - amount },
    change: { amount, reason, label },
  };
}

export function creditCoins(wallet: Wallet, amount: number, reason: CoinReason): CreditResult {
  if (!Number.isInteger(amount) || amount <= 0) {
    return { ok: false, message: 'Можно начислить только целые монеты больше нуля.' };
  }

  return {
    ok: true,
    wallet: { ...wallet, coins: wallet.coins + amount },
    change: { amount, reason, label: REASON_LABEL[reason] },
  };
}
