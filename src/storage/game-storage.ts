import AsyncStorage from '@react-native-async-storage/async-storage';

import { levelForStage, stageForLevel } from '@/domain/pet';
import type { GameState } from '@/types/game';

const STORAGE_KEY = 'finni.game.v1';

function isGameState(value: unknown): value is GameState {
  if (!value || typeof value !== 'object') return false;
  const state = value as Partial<GameState>;
  return Boolean(
    state.profile &&
      state.pet &&
      state.wallet &&
      typeof state.wallet.coins === 'number' &&
      state.period,
  );
}

export async function loadGame(): Promise<GameState | null> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!isGameState(parsed)) return null;
    parsed.period.fact.foodBought = Boolean(parsed.period.fact.foodBought);
    if (!parsed.progress || !Array.isArray(parsed.progress.doneTaskIds)) {
      parsed.progress = { doneTaskIds: [], ownedGoalIds: [] };
    }
    if (!Array.isArray(parsed.progress.ownedGoalIds)) parsed.progress.ownedGoalIds = [];
    if (!Array.isArray(parsed.history)) parsed.history = [];
    if (typeof parsed.pet.level !== 'number') parsed.pet.level = levelForStage(parsed.pet.stage);
    parsed.pet.stage = stageForLevel(parsed.pet.level);
    if (typeof parsed.pet.growthPoints !== 'number') parsed.pet.growthPoints = Math.max(0, parsed.pet.level - 1);
    if (typeof parsed.pet.tasksSinceMeal !== 'number') parsed.pet.tasksSinceMeal = 0;
    if (typeof parsed.pet.needsMeal !== 'boolean') parsed.pet.needsMeal = false;
    if (!Array.isArray(parsed.purchasedItemIds)) parsed.purchasedItemIds = [];
    if (typeof parsed.savingsIntroSeen !== 'boolean') parsed.savingsIntroSeen = false;
    if (typeof parsed.restAvailableAt !== 'number' && parsed.restAvailableAt !== null) parsed.restAvailableAt = null;
    if (typeof parsed.pendingLevel !== 'number') parsed.pendingLevel = null;
    return parsed;
  } catch {
    return null;
  }
}

export async function saveGame(state: GameState): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export async function resetGame(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY);
}
