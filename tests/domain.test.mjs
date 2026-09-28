import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import test from 'node:test';

const require = createRequire(import.meta.url);
require.extensions['.png'] = (module, filename) => {
  module.exports = filename;
};
require.extensions['.wav'] = (module, filename) => {
  module.exports = filename;
};

const { validatePlan } = await import('../src/domain/budget.ts');
const { debitCoins } = await import('../src/domain/economy.ts');
const { closePeriod } = await import('../src/domain/period.ts');
const { feedPet } = await import('../src/domain/pet.ts');
const { chooseGoal, saveCoins, withdrawSavings } = await import('../src/domain/savings.ts');
const { finishDelivery } = await import('../src/domain/tasks.ts');
const { createDemoGame } = await import('../src/domain/game.ts');

function makeState(overrides = {}) {
  return {
    profile: { id: 'test', isDemo: false },
    pet: {
      name: 'Финни',
      customization: { coatColor: 'gray', shirtId: 'none', hatId: 'none', trinketId: 'none' },
      stage: 'kitten',
      level: 1,
      growthPoints: 0,
      mood: 70,
      hunger: 70,
      energy: 8,
      tasksSinceMeal: 0,
      needsMeal: false,
    },
    wallet: { coins: 100, savings: 0 },
    period: {
      index: 1,
      status: 'active',
      startingBudget: 100,
      plan: { mandatory: 40, optional: 20, savings: 40 },
      fact: { mandatorySpent: 0, optionalSpent: 0, saved: 0, foodBought: false },
      goalId: null,
    },
    currentGoalId: null,
    progress: { doneTaskIds: [], ownedGoalIds: [] },
    history: [],
    purchasedItemIds: [],
    savingsIntroSeen: false,
    restAvailableAt: null,
    pendingLevel: null,
    ...overrides,
  };
}

test('не допускает отрицательный баланс', () => {
  const result = debitCoins({ coins: 10, savings: 0 }, 11, 'purchase', 'Еда');
  assert.equal(result.ok, false);
});

test('план не превышает доступный бюджет', () => {
  const result = validatePlan({ mandatory: 50, optional: 30, savings: 21 }, 100);
  assert.equal(result.ok, false);
});

test('копилка сохраняет цель, кладёт и достаёт монеты', () => {
  const picked = chooseGoal(makeState(), 'console');
  assert.equal(picked.ok, true);
  if (!picked.ok) return;

  const saved = saveCoins(picked.state, 40);
  assert.equal(saved.ok, true);
  if (!saved.ok) return;
  assert.deepEqual(saved.state.wallet, { coins: 60, savings: 40 });

  const taken = withdrawSavings(saved.state, 10);
  assert.equal(taken.ok, true);
  if (!taken.ok) return;
  assert.deepEqual(taken.state.wallet, { coins: 70, savings: 30 });
});

test('еда насыщает, но не повышает уровень', () => {
  const result = feedPet(makeState().pet, 30);
  assert.equal(result.pet.level, 1);
  assert.equal(result.pet.stage, 'kitten');
  assert.equal(result.leveledUp, false);
  assert.equal(result.pet.hunger, 100);
  assert.equal(result.pet.needsMeal, false);
});

test('три доставки требуют кормления, четвёртая блокируется', () => {
  let state = makeState();
  const deliveries = [
    ['note', 'yard'],
    ['bread', 'path'],
    ['book', 'lift'],
  ];

  for (const [orderId, routeId] of deliveries) {
    const result = finishDelivery(state, orderId, routeId);
    assert.equal(result.ok, true);
    if (!result.ok) return;
    state = result.state;
  }

  assert.equal(state.pet.tasksSinceMeal, 3);
  assert.equal(state.pet.needsMeal, true);
  const blocked = finishDelivery(state, 'flowers', 'cross');
  assert.equal(blocked.ok, false);
});

test('закрытие периода сохраняет историю и открывает следующий', () => {
  const base = makeState();
  const state = makeState({
    wallet: { coins: 40, savings: 150 },
    currentGoalId: 'console',
    period: {
      ...base.period,
      fact: { mandatorySpent: 20, optionalSpent: 10, saved: 40, foodBought: true },
    },
  });
  const result = closePeriod(state);
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(result.state.period.index, 2);
  assert.equal(result.state.period.status, 'planning');
  assert.equal(result.state.wallet.savings, 0);
  assert.equal(result.state.history.length, 1);
});

test('демо-профиль помечен как демо', () => {
  const result = createDemoGame();
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(result.state.profile.isDemo, true);
  assert.equal(result.state.pet.name, 'Финни');
});
