import {
  DEFAULT_CUSTOMIZATION,
  STARTING_BUDGET,
  STARTING_ENERGY,
  STARTING_HUNGER,
  STARTING_LEVEL,
  STARTING_MOOD,
} from '@/content/pet';
import { creditCoins } from '@/domain/economy';
import type { CreatePetInput, GameState, PetCustomization } from '@/types/game';

export const MAX_NAME_LENGTH = 16;

export type CreateGameResult =
  | { ok: true; state: GameState; startLabel: string; startAmount: number }
  | { ok: false; message: string };

function cleanName(value: string): string {
  return value.trim().replace(/\s+/g, ' ');
}

export function isValidName(value: string): boolean {
  const name = cleanName(value);
  return name.length >= 1 && name.length <= MAX_NAME_LENGTH;
}

function createId(): string {
  return `finni-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createGame(input: CreatePetInput): CreateGameResult {
  const petName = cleanName(input.petName);

  if (!isValidName(petName)) {
    return { ok: false, message: 'Дай коту имя: от 1 до 16 букв.' };
  }

  const credited = creditCoins({ coins: 0, savings: 0 }, STARTING_BUDGET, 'start-budget');
  if (!credited.ok) {
    return { ok: false, message: credited.message };
  }

  const customization: PetCustomization = {
    ...DEFAULT_CUSTOMIZATION,
    ...input.customization,
  };

  return {
    ok: true,
    startLabel: credited.change.label,
    startAmount: credited.change.amount,
    state: {
      profile: {
        id: createId(),
        isDemo: false,
      },
      pet: {
        name: petName,
        customization,
        stage: 'kitten',
        level: STARTING_LEVEL,
        growthPoints: 0,
        mood: STARTING_MOOD,
        hunger: STARTING_HUNGER,
        energy: STARTING_ENERGY,
        tasksSinceMeal: 0,
        needsMeal: false,
      },
      wallet: credited.wallet,
      period: {
        index: 1,
        status: 'planning',
        startingBudget: STARTING_BUDGET,
        plan: null,
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
    },
  };
}

export function createDemoGame(input?: CreatePetInput): CreateGameResult {
  const created = createGame({
    petName: input?.petName?.trim() ? input.petName : 'Финни',
    customization: { ...DEFAULT_CUSTOMIZATION, ...input?.customization },
  });
  if (!created.ok) return created;

  return {
    ...created,
    state: {
      ...created.state,
      profile: { ...created.state.profile, isDemo: true },
    },
  };
}
