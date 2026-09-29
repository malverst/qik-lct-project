import { MAX_STAT } from '@/content/pet';
import { PURCHASES, findPurchase } from '@/content/purchases';
import { creditCoins, debitCoins } from '@/domain/economy';
import { applyGrowthPoints, feedPet } from '@/domain/pet';
import type { GameState } from '@/types/game';

export type PurchaseResult =
  | { ok: true; state: GameState; label: string; amount: number; leveledUp: boolean; satiation: number }
  | { ok: false; message: string; foodHelp?: number };

export function grantFoodHelp(state: GameState, amount: number): PurchaseResult {
  const help = creditCoins(state.wallet, amount, 'food-help');
  if (!help.ok) return help;
  return {
    ok: true,
    label: 'Запас на еду',
    amount,
    leveledUp: false,
    satiation: 0,
    state: { ...state, wallet: help.wallet },
  };
}

export function makePurchase(state: GameState, itemId: string): PurchaseResult {
  if (state.period.status !== 'active' || !state.period.plan) {
    return { ok: false, message: 'Сначала сохрани план. Потом можно покупать.' };
  }

  const item = findPurchase(itemId);
  if (!item) return { ok: false, message: 'Такой покупки нет.' };
  if (item.wearable && state.purchasedItemIds.includes(item.id)) {
    return { ok: false, message: 'Эта вещь уже куплена. Её можно надеть в гардеробе.' };
  }
  if ((item.id === 'care-brush' || item.id === 'toy-ball') && state.purchasedItemIds.includes(item.id)) {
    return { ok: false, message: 'Это уже куплено.' };
  }

  const paid = debitCoins(state.wallet, item.price, 'purchase', item.name);
  if (!paid.ok) {
    const cheapestFood = PURCHASES.filter((entry) => entry.group === 'food').reduce(
      (lowest, entry) => Math.min(lowest, entry.price),
      item.price,
    );
    if (item.group === 'food' && state.pet.needsMeal && state.wallet.coins < cheapestFood) {
      return { ok: false, message: paid.message, foodHelp: item.price - state.wallet.coins };
    }
    return paid;
  }

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
      pendingLevel: state.pendingLevel,
      period: {
        ...state.period,
        plan: { ...state.period.plan },
        fact,
      },
    },
  };
}
