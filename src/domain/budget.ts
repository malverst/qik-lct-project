import type { BudgetPlan, GameState } from '@/types/game';

export type BudgetCheck =
  | { ok: true; plan: BudgetPlan; total: number; left: number }
  | { ok: false; message: string };

export function planTotal(plan: BudgetPlan): number {
  return plan.mandatory + plan.optional + plan.savings;
}

export function validatePlan(plan: BudgetPlan, budget: number): BudgetCheck {
  const parts = [plan.mandatory, plan.optional, plan.savings];
  if (parts.some((value) => !Number.isInteger(value) || value < 0)) {
    return { ok: false, message: 'Можно указать только целые монеты, не меньше нуля.' };
  }

  const total = planTotal(plan);
  if (total > budget) {
    return {
      ok: false,
      message: `В плане ${total} монет, а доступно ${budget}. Убери ${total - budget}.`,
    };
  }

  return { ok: true, plan: { ...plan }, total, left: budget - total };
}

export type ConfirmPlanResult =
  | { ok: true; state: GameState }
  | { ok: false; message: string };

export function confirmPlan(state: GameState, plan: BudgetPlan): ConfirmPlanResult {
  if (state.period.status !== 'planning' || state.period.plan) {
    return { ok: false, message: 'План уже сохранён. Его нельзя тихо поменять.' };
  }

  const checked = validatePlan(plan, state.period.startingBudget);
  if (!checked.ok) return checked;

  return {
    ok: true,
    state: {
      ...state,
      wallet: { ...state.wallet },
      period: {
        ...state.period,
        status: 'active',
        plan: checked.plan,
      },
    },
  };
}
