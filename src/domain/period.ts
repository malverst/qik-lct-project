import { STARTING_BUDGET, STARTING_ENERGY } from '@/content/pet';
import { findGoal } from '@/content/goals';
import { creditCoins } from '@/domain/economy';
import type { GameState, Period, PeriodRecord } from '@/types/game';

export const PERIOD_LIMIT = 5;

export type ClosedPeriod = PeriodRecord;

export type PeriodReview = {
  lines: { label: string; planned: number; actual: number; text: string; advice: string }[];
  score: number;
  grade: string;
  note: string;
  canClose: boolean;
  reason: string | null;
};

function gapText(label: string, planned: number, actual: number, more: string, less: string, same: string): string {
  const delta = actual - planned;
  if (delta > 0) return `${more} на ${delta}.`;
  if (delta < 0) return `${less} на ${-delta}.`;
  return same;
}

function lineAdvice(label: string, planned: number, actual: number, covered: number): string {
  const delta = actual - planned;
  if (delta > 0 && covered >= delta) {
    if (label === 'Нужное') return `План на еду выполнен. Ещё ${delta} монет ты заработал сам и потратил на кота.`;
    if (label === 'Желания') return `План на желания выполнен. Ещё ${delta} монет ты заработал сам.`;
    return `План накоплений выполнен. Ещё ${delta} монет ты заработал сам и отложил.`;
  }
  if (delta === 0) return 'Здесь план и факт совпали.';
  if (delta > 0) {
    const extra = delta - covered;
    if (label === 'Нужное') {
      return `На еду ушло на ${extra} больше, чем было в плане и в заработке. В следующий план оставь больше на нужное.`;
    }
    if (label === 'Желания') {
      return `Желания вышли за план на ${extra}. В следующий раз заложи на них больше или купи меньше игрушек и одежды.`;
    }
    return `В копилке на ${extra} больше, чем было в плане и в заработке.`;
  }
  const missing = -delta;
  if (label === 'Нужное') {
    return `На еду ушло на ${missing} меньше плана. В следующий раз заложи меньше на нужное или купи еду посытнее.`;
  }
  if (label === 'Желания') {
    return `На желания ушло на ${missing} меньше плана. В следующий раз заложи меньше или купи то, что хотелось.`;
  }
  return `В копилке на ${missing} меньше плана. В следующий раз заложи меньше на накопления или отложи монеты раньше покупок.`;
}

function planScore(lines: { planned: number; actual: number; covered: number }[]): number {
  if (lines.length === 0) return 100;
  const matches = lines.map((line) => {
    const counted = line.actual - line.covered;
    const scale = Math.max(line.planned, counted, 1);
    return Math.max(0, 1 - Math.abs(counted - line.planned) / scale);
  });
  return Math.round((matches.reduce((sum, match) => sum + match, 0) / matches.length) * 100);
}

export function reviewPeriod(state: GameState): PeriodReview | null {
  const plan = state.period.plan;
  if (!plan || state.period.status !== 'active') return null;
  const fact = state.period.fact;
  const used = fact.mandatorySpent + fact.optionalSpent + fact.saved;
  const planned = plan.mandatory + plan.optional + plan.savings;
  const ready = used >= planned;
  const earnedExtra = Math.max(0, state.wallet.coins + used - state.period.startingBudget);
  const overs = [
    { label: 'Нужное', planned: plan.mandatory, actual: fact.mandatorySpent },
    { label: 'Накопления', planned: plan.savings, actual: fact.saved },
    { label: 'Желания', planned: plan.optional, actual: fact.optionalSpent },
  ];
  let extraLeft = earnedExtra;
  const coveredByLabel = new Map<string, number>();
  for (const line of overs) {
    const over = Math.max(0, line.actual - line.planned);
    const covered = Math.min(over, extraLeft);
    coveredByLabel.set(line.label, covered);
    extraLeft -= covered;
  }
  const lines = [
    {
      label: 'Нужное',
      planned: plan.mandatory,
      actual: fact.mandatorySpent,
      text: gapText('Нужное', plan.mandatory, fact.mandatorySpent, 'Больше плана', 'Меньше плана', 'Как в плане'),
      advice: lineAdvice('Нужное', plan.mandatory, fact.mandatorySpent, coveredByLabel.get('Нужное') ?? 0),
    },
    {
      label: 'Желания',
      planned: plan.optional,
      actual: fact.optionalSpent,
      text: gapText('Желания', plan.optional, fact.optionalSpent, 'Больше плана', 'Меньше плана', 'Как в плане'),
      advice: lineAdvice('Желания', plan.optional, fact.optionalSpent, coveredByLabel.get('Желания') ?? 0),
    },
    {
      label: 'Накопления',
      planned: plan.savings,
      actual: fact.saved,
      text: gapText('Копилка', plan.savings, fact.saved, 'Больше плана', 'Меньше плана', 'Как в плане'),
      advice: lineAdvice('Накопления', plan.savings, fact.saved, coveredByLabel.get('Накопления') ?? 0),
    },
  ];
  const score = planScore(
    lines.map((line) => ({ ...line, covered: coveredByLabel.get(line.label) ?? 0 })),
  );
  const grade = score >= 85 ? 'Отлично' : score >= 60 ? 'Хорошо' : 'Можно точнее';
  const bonus = earnedExtra > 0 ? ` Ещё ${earnedExtra} монет ты заработал сам: они не входили в план.` : '';

  return {
    canClose: ready,
    reason: ready ? null : `Осталось распределить ${planned - used}.`,
    score,
    grade,
    note: score === 100 ? `План выполнен.${bonus}` : `Совпадение с планом: ${score} из 100.${bonus}`,
    lines,
  };
}

export type ClosePeriodResult =
  | { ok: true; state: GameState; note: string }
  | { ok: false; message: string };

export function closePeriod(state: GameState): ClosePeriodResult {
  const review = reviewPeriod(state);
  if (!review) return { ok: false, message: 'Сначала сохрани план.' };
  if (!review.canClose || !state.period.plan) {
    return { ok: false, message: review.reason ?? 'План ещё не выполнен.' };
  }
  if (state.period.index >= PERIOD_LIMIT) {
    return { ok: false, message: 'Это последний период. Новый пока не открывается.' };
  }

  const goal = findGoal(state.currentGoalId);
  const note = `Период ${state.period.index} закрыт.`;
  const nextCoins = creditCoins(
    { coins: state.wallet.coins, savings: state.wallet.savings },
    STARTING_BUDGET,
    'start-budget',
  );
  if (!nextCoins.ok) return nextCoins;
  const closed: ClosedPeriod = {
    index: state.period.index,
    plan: { ...state.period.plan },
    fact: { ...state.period.fact },
    goalId: goal?.id ?? 'none',
    goalName: goal?.name ?? 'Без цели',
    note,
  };
  const next: Period = {
    index: state.period.index + 1,
    status: 'planning',
    startingBudget: nextCoins.wallet.coins,
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
      wallet: nextCoins.wallet,
      period: next,
      currentGoalId: state.currentGoalId,
      progress: state.progress,
      history: [...state.history, closed],
    },
  };
}
