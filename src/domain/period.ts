import { STARTING_BUDGET, STARTING_ENERGY } from '@/content/pet';
import { findGoal } from '@/content/goals';
import type { GameState, Period, PeriodRecord } from '@/types/game';

export const PERIOD_LIMIT = 5;

export type ClosedPeriod = PeriodRecord;

export type PeriodReview = {
  lines: { label: string; planned: number; actual: number; text: string }[];
  note: string;
  canClose: boolean;
  reason: string | null;
};

function gapText(label: string, planned: number, actual: number, more: string, less: string, same: string): string {
  const delta = actual - planned;
  if (delta > 0) return `${label}: ${more} на ${delta}.`;
  if (delta < 0) return `${label}: ${less} на ${-delta}.`;
  return `${label}: ${same}.`;
}

export function reviewPeriod(state: GameState): PeriodReview | null {
  const plan = state.period.plan;
  if (!plan || state.period.status !== 'active') return null;
  const fact = state.period.fact;
  const goal = findGoal(state.currentGoalId);
  const ready = Boolean(goal && state.wallet.savings >= goal.cost);

  return {
    canClose: ready,
    reason: ready ? null : goal ? `До «${goal.name}» ещё ${goal.cost - state.wallet.savings}.` : 'Сначала выбери цель.',
    note: ready
      ? 'Цель собрана. Можно закрыть период и составить новый план.'
      : 'Период закроется, когда в копилке хватит на цель.',
    lines: [
      {
        label: 'Нужное',
        planned: plan.mandatory,
        actual: fact.mandatorySpent,
        text: gapText('Нужное', plan.mandatory, fact.mandatorySpent, 'потрачено больше плана', 'потрачено меньше плана', 'как в плане'),
      },
      {
        label: 'Желания',
        planned: plan.optional,
        actual: fact.optionalSpent,
        text: gapText('Желания', plan.optional, fact.optionalSpent, 'потрачено больше плана', 'потрачено меньше плана', 'как в плане'),
      },
      {
        label: 'Накопления',
        planned: plan.savings,
        actual: fact.saved,
        text: gapText('Копилка', plan.savings, fact.saved, 'отложено больше плана', 'отложено меньше плана', 'как в плане'),
      },
    ],
  };
}

export type ClosePeriodResult =
  | { ok: true; state: GameState; note: string }
  | { ok: false; message: string };

export function closePeriod(state: GameState): ClosePeriodResult {
  const review = reviewPeriod(state);
  if (!review) return { ok: false, message: 'Сначала сохрани план.' };
  if (!review.canClose || !state.period.plan || !state.currentGoalId) {
    return { ok: false, message: review.reason ?? 'Цель ещё не собрана.' };
  }
  if (state.period.index >= PERIOD_LIMIT) {
    return { ok: false, message: 'Это последний период. Новый пока не открывается.' };
  }

  const goal = findGoal(state.currentGoalId);
  if (!goal) return { ok: false, message: 'Такой цели нет.' };

  const note = `Период ${state.period.index} закрыт. Цель «${goal.name}» собрана.`;
  const closed: ClosedPeriod = {
    index: state.period.index,
    plan: { ...state.period.plan },
    fact: { ...state.period.fact },
    goalId: goal.id,
    goalName: goal.name,
    note,
  };
  const next: Period = {
    index: state.period.index + 1,
    status: 'planning',
    startingBudget: STARTING_BUDGET,
    plan: null,
    fact: { mandatorySpent: 0, optionalSpent: 0, saved: 0, foodBought: false },
    goalId: null,
  };

  return {
    ok: true,
    note,
    state: {
      ...state,
      pet: { ...state.pet, energy: STARTING_ENERGY },
      wallet: { coins: state.wallet.coins, savings: state.wallet.savings - goal.cost },
      period: next,
      currentGoalId: null,
      progress: {
        ...state.progress,
        ownedGoalIds: state.progress.ownedGoalIds.includes(goal.id)
          ? state.progress.ownedGoalIds
          : [...state.progress.ownedGoalIds, goal.id],
      },
      history: [...state.history, closed],
    },
  };
}
