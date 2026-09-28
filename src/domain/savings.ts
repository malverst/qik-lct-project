import { findGoal } from '@/content/goals';
import type { GameState } from '@/types/game';
import { applyGrowthPoints } from '@/domain/pet';

export type SavingsResult =
  | { ok: true; state: GameState }
  | { ok: false; message: string };

function requireActiveGoal(state: GameState): { ok: false; message: string } | { ok: true; goalCost: number } {
  if (state.period.status !== 'active' || !state.period.plan) {
    return { ok: false, message: 'Сначала сохрани план. Потом можно копить.' };
  }
  const goal = findGoal(state.currentGoalId);
  if (!goal) return { ok: false, message: 'Сначала выбери цель.' };
  return { ok: true, goalCost: goal.cost };
}

export function chooseGoal(state: GameState, goalId: string): SavingsResult {
  if (state.period.status !== 'active' || !state.period.plan) {
    return { ok: false, message: 'Сначала сохрани план. Потом можно выбрать цель.' };
  }
  const goal = findGoal(goalId);
  if (!goal) return { ok: false, message: 'Такой цели нет.' };
  if (state.wallet.savings > goal.cost) {
    return { ok: false, message: 'В копилке уже больше, чем стоит эта цель.' };
  }

  return {
    ok: true,
    state: {
      ...state,
      currentGoalId: goal.id,
      period: { ...state.period, goalId: goal.id, plan: { ...state.period.plan } },
    },
  };
}

export function saveCoins(state: GameState, amount: number): SavingsResult {
  const ready = requireActiveGoal(state);
  if (!ready.ok) return ready;
  if (!Number.isInteger(amount) || amount <= 0) {
    return { ok: false, message: 'Можно отложить только целые монеты больше нуля.' };
  }
  if (state.wallet.coins < amount) {
    return {
      ok: false,
      message: `Нужно ${amount} монет, а есть ${state.wallet.coins}. Не хватает ${amount - state.wallet.coins}.`,
    };
  }

  const nextSaved = state.wallet.savings + amount;
  if (nextSaved > ready.goalCost) {
    return { ok: false, message: `До цели осталось ${ready.goalCost - state.wallet.savings}. Больше откладывать не нужно.` };
  }

  const growth = applyGrowthPoints(state.pet, 1);

  return {
    ok: true,
    state: {
      ...state,
      pet: growth.pet,
      wallet: { coins: state.wallet.coins - amount, savings: nextSaved },
      pendingLevel: growth.leveledUp ? growth.pet.level : state.pendingLevel,
      period: {
        ...state.period,
        plan: state.period.plan ? { ...state.period.plan } : null,
        fact: { ...state.period.fact, saved: state.period.fact.saved + amount },
      },
    },
  };
}

export function withdrawSavings(state: GameState, amount: number): SavingsResult {
  const ready = requireActiveGoal(state);
  if (!ready.ok) return ready;
  if (!Number.isInteger(amount) || amount <= 0) {
    return { ok: false, message: 'Можно забрать только целые монеты больше нуля.' };
  }
  if (state.wallet.savings < amount) {
    return { ok: false, message: `В копилке ${state.wallet.savings}. Столько забрать нельзя.` };
  }

  return {
    ok: true,
    state: {
      ...state,
      wallet: { coins: state.wallet.coins + amount, savings: state.wallet.savings - amount },
      period: {
        ...state.period,
        plan: state.period.plan ? { ...state.period.plan } : null,
        fact: { ...state.period.fact, saved: Math.max(0, state.period.fact.saved - amount) },
      },
    },
  };
}
