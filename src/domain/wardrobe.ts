import { HAT_OPTIONS, SHIRT_OPTIONS, TRINKET_OPTIONS } from '@/content/pet';
import type { AccessoryKind, GameState, PetCustomization } from '@/types/game';

const OPTIONS = {
  shirt: SHIRT_OPTIONS,
  hat: HAT_OPTIONS,
  trinket: TRINKET_OPTIONS,
} as const;

const FIELD = {
  shirt: 'shirtId',
  hat: 'hatId',
  trinket: 'trinketId',
} as const;

export type WardrobeResult =
  | { ok: true; state: GameState }
  | { ok: false; message: string };

export function equipAccessory(state: GameState, kind: AccessoryKind, itemId: string): WardrobeResult {
  const option = OPTIONS[kind].find((item) => item.id === itemId);
  if (!option) return { ok: false, message: 'Такой вещи нет.' };
  if (itemId !== 'none' && !state.purchasedItemIds.includes(itemId)) {
    return { ok: false, message: 'Сначала купи эту вещь.' };
  }

  return {
    ok: true,
    state: {
      ...state,
      pet: {
        ...state.pet,
        customization: { ...state.pet.customization, [FIELD[kind]]: itemId },
      },
    },
  };
}

export function equipOutfit(state: GameState, outfit: Pick<PetCustomization, 'shirtId' | 'hatId' | 'trinketId'>): WardrobeResult {
  const shirt = equipAccessory(state, 'shirt', outfit.shirtId);
  if (!shirt.ok) return shirt;
  const hat = equipAccessory(shirt.state, 'hat', outfit.hatId);
  if (!hat.ok) return hat;
  return equipAccessory(hat.state, 'trinket', outfit.trinketId);
}
