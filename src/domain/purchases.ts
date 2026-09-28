import { MAX_STAT } from '@/content/pet';
import { findPurchase } from '@/content/purchases';
import { debitCoins } from '@/domain/economy';
import { applyGrowthPoints, feedPet } from '@/domain/pet';
import type { GameState } from '@/types/game';

export type PurchaseResult =
  | { ok: true; state: GameState; label: string; amount: number; leveledUp: boolean; satiation: number }
  | { ok: false; message: string };

export function makePurchase(state: GameState, itemId: string): PurchaseResult {
  if (state.period.status !== 'active' || !state.period.plan) {
    return { ok: false, message: 'Сначала сохрани план. Потом можно покупать.' };
  }

  const item = findPurchase(itemId);
  if (!item) return { ok: false, message: 'Такой покупки нет.' };

  const paid = debitCoins(state.wallet, item.price, 'purchase', item.name);
  if (!paid.ok) return paid;

  const fact = { ...state.period.fact };
  if (item.kind === 'mandatory') fact.mandatorySpent += item.price;
  else fact.optionalSpent += item.price;
  const isFood = item.id.startsWith('food-');
  if (isFood) fact.foodBought = true;

  const growth = isFood ? feedPet(state.pet, item.hungerGain) : applyGrowthPoints(state.pet, 1);

  return {
    ok: true,
    label: item.name,
    amount: item.price,
    leveledUp: growth.leveledUp,
    satiation: item.satiation,
    state: {
      ...state,
      wallet: paid.wallet,
      pet: growth.pet,
      purchasedItemIds: state.purchasedItemIds.includes(item.id)
        ? state.purchasedItemIds
        : [...state.purchasedItemIds, item.id],
      pendingLevel: growth.leveledUp ? growth.pet.level : state.pendingLevel,
      period: {
        ...state.period,
        plan: { ...state.period.plan },
        fact,
      },
    },
  };
}
