import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { confirmPlan } from '@/domain/budget';
import { createDemoGame, createGame } from '@/domain/game';
import { grantFoodHelp, makePurchase } from '@/domain/purchases';
import { buyGoal, chooseGoal, saveCoins, withdrawSavings } from '@/domain/savings';
import { closePeriod } from '@/domain/period';
import { finishDelivery, restPet } from '@/domain/tasks';
import { equipOutfit } from '@/domain/wardrobe';
import { loadGame, resetGame, saveGame } from '@/storage/game-storage';
import type { BudgetPlan, CreatePetInput, GameState, PetCustomization } from '@/types/game';

type GameContextValue = {
  ready: boolean;
  state: GameState | null;
  error: string | null;
  startGame: (input: CreatePetInput) => Promise<string | null>;
  startDemo: (input: CreatePetInput) => Promise<string | null>;
  lockPlan: (plan: BudgetPlan) => Promise<string | null>;
  buyItem: (itemId: string) => Promise<string | null>;
  helpWithFood: (amount: number) => Promise<string | null>;
  wearOutfit: (outfit: Pick<PetCustomization, 'shirtId' | 'hatId' | 'trinketId'>) => Promise<string | null>;
  pickGoal: (goalId: string) => Promise<string | null>;
  putInSavings: (amount: number) => Promise<string | null>;
  buyCurrentGoal: () => Promise<string | null>;
  takeFromSavings: (amount: number) => Promise<string | null>;
  finishPlay: (orderId: string, routeId: string) => Promise<{
    error: string | null;
    explanation: string | null;
    reward: number;
    needsMeal: boolean;
  }>;
  rest: () => Promise<string | null>;
  finishPeriod: () => Promise<string | null>;
  acknowledgeLevel: () => Promise<void>;
  markSavingsIntroSeen: () => Promise<void>;
  clearGame: () => Promise<void>;
};

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [state, setState] = useState<GameState | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    loadGame()
      .then((saved) => {
        if (!active) return;
        setState(saved);
        setError(null);
      })
      .catch(() => {
        if (!active) return;
        setError('Не получилось открыть сохранение. Можно начать заново.');
      })
      .finally(() => {
        if (active) setReady(true);
      });

    return () => {
      active = false;
    };
  }, []);

  const value = useMemo<GameContextValue>(
    () => ({
      ready,
      state,
      error,
      async startGame(input) {
        const created = createGame(input);
        if (!created.ok) return created.message;

        try {
          await saveGame(created.state);
          setState(created.state);
          setError(null);
          return null;
        } catch {
          return 'Не получилось сохранить игру. Попробуй ещё раз.';
        }
      },
      async startDemo(input) {
        const created = createDemoGame(input);
        if (!created.ok) return created.message;

        try {
          await saveGame(created.state);
          setState(created.state);
          setError(null);
          return null;
        } catch {
          return 'Не получилось открыть демо-профиль. Попробуй ещё раз.';
        }
      },
      async lockPlan(plan) {
        if (!state) return 'Сначала создай кота.';

        const confirmed = confirmPlan(state, plan);
        if (!confirmed.ok) return confirmed.message;

        try {
          await saveGame(confirmed.state);
          setState(confirmed.state);
          setError(null);
          return null;
        } catch {
          return 'Не получилось сохранить план. Попробуй ещё раз.';
        }
      },
      async buyItem(itemId) {
        if (!state) return 'Сначала создай кота.';

        const bought = makePurchase(state, itemId);
        if (!bought.ok) return bought.message;

        try {
          await saveGame(bought.state);
          setState(bought.state);
          setError(null);
          return null;
        } catch {
          return 'Не получилось сохранить покупку. Попробуй ещё раз.';
        }
      },
      async helpWithFood(amount) {
        if (!state) return 'Сначала создай кота.';
        const helped = grantFoodHelp(state, amount);
        if (!helped.ok) return helped.message;
        try {
          await saveGame(helped.state);
          setState(helped.state);
          setError(null);
          return null;
        } catch {
          return 'Не получилось добавить монеты. Попробуй ещё раз.';
        }
      },
      async wearOutfit(outfit) {
        if (!state) return 'Сначала создай кота.';
        const worn = equipOutfit(state, outfit);
        if (!worn.ok) return worn.message;
        try {
          await saveGame(worn.state);
          setState(worn.state);
          setError(null);
          return null;
        } catch {
          return 'Не получилось надеть вещь. Попробуй ещё раз.';
        }
      },
      async pickGoal(goalId) {
        if (!state) return 'Сначала создай кота.';
        const picked = chooseGoal(state, goalId);
        if (!picked.ok) return picked.message;
        try {
          await saveGame(picked.state);
          setState(picked.state);
          setError(null);
          return null;
        } catch {
          return 'Не получилось сохранить цель. Попробуй ещё раз.';
        }
      },
      async putInSavings(amount) {
        if (!state) return 'Сначала создай кота.';
        const saved = saveCoins(state, amount);
        if (!saved.ok) return saved.message;
        try {
          await saveGame(saved.state);
          setState(saved.state);
          setError(null);
          return null;
        } catch {
          return 'Не получилось положить монеты. Попробуй ещё раз.';
        }
      },
      async buyCurrentGoal() {
        if (!state) return 'Сначала создай кота.';
        const bought = buyGoal(state);
        if (!bought.ok) return bought.message;
        try {
          await saveGame(bought.state);
          setState(bought.state);
          setError(null);
          return null;
        } catch {
          return 'Не получилось купить цель. Попробуй ещё раз.';
        }
      },
      async takeFromSavings(amount) {
        if (!state) return 'Сначала создай кота.';
        const taken = withdrawSavings(state, amount);
        if (!taken.ok) return taken.message;
        try {
          await saveGame(taken.state);
          setState(taken.state);
          setError(null);
          return null;
        } catch {
          return 'Не получилось забрать монеты. Попробуй ещё раз.';
        }
      },
      async finishPlay(orderId, routeId) {
        if (!state) return { error: 'Сначала создай кота.', explanation: null, reward: 0, needsMeal: false };
        const answered = finishDelivery(state, orderId, routeId);
        if (!answered.ok) return { error: answered.message, explanation: null, reward: 0, needsMeal: false };
        try {
          await saveGame(answered.state);
          setState(answered.state);
          setError(null);
          return { error: null, explanation: answered.explanation, reward: answered.reward, needsMeal: answered.needsMeal };
        } catch {
          return { error: 'Не получилось сохранить задание. Попробуй ещё раз.', explanation: null, reward: 0, needsMeal: false };
        }
      },
      async rest() {
        if (!state) return 'Сначала создай кота.';
        const rested = restPet(state);
        if (!rested.ok) return rested.message;
        try {
          await saveGame(rested.state);
          setState(rested.state);
          setError(null);
          return null;
        } catch {
          return 'Не получилось сохранить отдых. Попробуй ещё раз.';
        }
      },
      async finishPeriod() {
        if (!state) return 'Сначала создай кота.';
        const closed = closePeriod(state);
        if (!closed.ok) return closed.message;
        try {
          await saveGame(closed.state);
          setState(closed.state);
          setError(null);
          return null;
        } catch {
          return 'Не получилось закрыть период. Попробуй ещё раз.';
        }
      },
      async acknowledgeLevel() {
        if (!state || state.pendingLevel === null) return;
        const next = { ...state, pendingLevel: null };
        await saveGame(next);
        setState(next);
      },
      async markSavingsIntroSeen() {
        if (!state || state.savingsIntroSeen) return;
        const next = { ...state, savingsIntroSeen: true };
        await saveGame(next);
        setState(next);
      },
      async clearGame() {
        await resetGame();
        setState(null);
        setError(null);
      },
    }),
    [error, ready, state],
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const value = useContext(GameContext);
  if (!value) {
    throw new Error('useGame must be used inside GameProvider');
  }
  return value;
}
