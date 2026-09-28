import { LEVEL_THRESHOLDS, MAX_PET_LEVEL, MAX_STAT } from '@/content/pet';
import type { PetStage, PetState } from '@/types/game';

export type FeedResult = {
  pet: PetState;
  leveledUp: boolean;
};

export function stageForLevel(level: number): PetStage {
  if (level >= 3) return 'adult';
  if (level >= 2) return 'teen';
  return 'kitten';
}

export function levelForStage(stage: PetStage): number {
  if (stage === 'adult') return 3;
  if (stage === 'teen') return 2;
  return 1;
}

export function feedPet(pet: PetState, hungerGain: number): FeedResult {
  return {
    leveledUp: false,
    pet: {
      ...pet,
      hunger: Math.min(MAX_STAT, pet.hunger + hungerGain),
      tasksSinceMeal: 0,
      needsMeal: false,
    },
  };
}

export function applyGrowthPoints(pet: PetState, points: number): FeedResult {
  const growthPoints = Math.max(0, pet.growthPoints + points);
  const nextLevel = Math.min(
    MAX_PET_LEVEL,
    LEVEL_THRESHOLDS.reduce((level, threshold, index) => (growthPoints >= threshold ? index + 1 : level), 1),
  );
  return {
    leveledUp: nextLevel > pet.level,
    pet: { ...pet, growthPoints, level: nextLevel, stage: stageForLevel(nextLevel) },
  };
}
