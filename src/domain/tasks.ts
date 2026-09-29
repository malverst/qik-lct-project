import { REST_ENERGY } from '@/content/pet';
import { findDelivery } from '@/content/deliveries';
import { STARTING_ENERGY } from '@/content/pet';
import { creditCoins } from '@/domain/economy';
import { applyGrowthPoints } from '@/domain/pet';
import type { GameState } from '@/types/game';

export type TaskPlayResult =
  | { ok: true; state: GameState; explanation: string; reward: number; needsMeal: boolean }
  | { ok: false; message: string };

export const REST_COOLDOWN_MS = 12 * 60 * 60 * 1000;

export function finishDelivery(state: GameState, orderId: string, routeId: string): TaskPlayResult {
  if (state.period.status !== 'active' || !state.period.plan) {
    return { ok: false, message: `Сначала сохрани план. Потом ${state.pet.name} может разносить заказы.` };
  }
  if (state.pet.needsMeal) {
    return { ok: false, message: `${state.pet.name} проголодался. Сначала покорми его, потом можно брать новый заказ.` };
  }

  const order = findDelivery(orderId);
  if (!order) return { ok: false, message: 'Такого заказа нет.' };
  const route = order.routes.find((item) => item.id === routeId);
  if (!route) return { ok: false, message: 'Такой дороги нет.' };

  if (state.pet.energy < route.energy) {
    return {
      ok: false,
      message: `На эту дорогу нужно ${route.energy} энергии, а есть ${state.pet.energy}. Можно выбрать короче или отдохнуть.`,
    };
  }

  const tasksSinceMeal = state.pet.tasksSinceMeal + 1;
  const needsMeal = tasksSinceMeal >= 3;

  const paid = creditCoins(state.wallet, order.reward, 'task');
  if (!paid.ok) return paid;

  const actionLabel = order.kind === 'taxi' ? 'Поездка завершена' : `${order.title} донесено`;
  const routeAction = order.kind === 'taxi' ? 'маршрутом' : 'дорогой';

  const growth = applyGrowthPoints(state.pet, 1);

  return {
    ok: true,
    reward: order.reward,
    explanation: `${actionLabel} ${routeAction} «${route.label}». Потрачено ${route.energy} энергии. В кошельке +${order.reward}.`,
    needsMeal,
    state: {
      ...state,
      wallet: paid.wallet,
      pet: {
        ...growth.pet,
        energy: state.pet.energy - route.energy,
        hunger: Math.max(0, state.pet.hunger - 10),
        tasksSinceMeal,
        needsMeal,
      },
      pendingLevel: state.pendingLevel,
    },
  };
}

export function restPet(state: GameState, now = Date.now()): TaskPlayResult {
  if (!state.profile.isDemo && state.restAvailableAt !== null && state.restAvailableAt > now) {
    const hours = Math.ceil((state.restAvailableAt - now) / (60 * 60 * 1000));
    return { ok: false, message: `Отдых будет доступен через ${hours} ч.` };
  }
  if (state.pet.energy >= STARTING_ENERGY) {
    return { ok: false, message: `${state.pet.name} уже бодрый. Можно брать заказ.` };
  }

  return {
    ok: true,
    reward: 0,
    explanation: `${state.pet.name} поспал. Энергия снова полная.`,
    needsMeal: state.pet.needsMeal,
    state: {
      ...state,
      pet: { ...state.pet, energy: REST_ENERGY },
      restAvailableAt: state.profile.isDemo ? null : now + REST_COOLDOWN_MS,
    },
  };
}
