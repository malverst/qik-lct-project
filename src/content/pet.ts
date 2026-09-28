import type { AccessoryKind, CoatColorId, PetCustomization } from '@/types/game';

export type CoatOption = {
  id: CoatColorId;
  label: string;
  swatch: string;
  /** Файл фото кота этой масти. Пока null — показываем цветной кадр. */
  image: number | null;
};

export type AccessoryOption = {
  id: string;
  kind: AccessoryKind;
  label: string;
  emoji: string;
};

export const STARTING_BUDGET = 100;
export const STARTING_ENERGY = 8;
export const REST_ENERGY = STARTING_ENERGY;
export const STARTING_LEVEL = 1;
export const MAX_PET_LEVEL = 3;
export const LEVEL_THRESHOLDS = [0, 3, 8] as const;
export const STARTING_MOOD = 70;
export const STARTING_HUNGER = 70;
export const MIN_STAT = 0;
export const MAX_STAT = 100;

export const COAT_OPTIONS: CoatOption[] = [
  { id: 'orange', label: 'Рыжий', swatch: '#F4A261', image: require('../../assets/images/orange_cat.png') },
  { id: 'gray', label: 'Серый', swatch: '#8D99AE', image: require('../../assets/images/gray_cat.png') },
  { id: 'white', label: 'Белый', swatch: '#F8F1E7', image: require('../../assets/images/white_cat.png') },
];

export const SHIRT_OPTIONS: AccessoryOption[] = [
  { id: 'none', kind: 'shirt', label: 'Без кофты', emoji: '—' },
  { id: 'stripe', kind: 'shirt', label: 'Полосатая', emoji: '👕' },
  { id: 'star', kind: 'shirt', label: 'Со звёздочкой', emoji: '✨' },
];

export const HAT_OPTIONS: AccessoryOption[] = [
  { id: 'none', kind: 'hat', label: 'Без шляпы', emoji: '—' },
  { id: 'cap', kind: 'hat', label: 'Кепка', emoji: '🧢' },
  { id: 'bow', kind: 'hat', label: 'Бантик', emoji: '🎀' },
];

export const TRINKET_OPTIONS: AccessoryOption[] = [
  { id: 'none', kind: 'trinket', label: 'Без украшения', emoji: '—' },
  { id: 'bell', kind: 'trinket', label: 'Колокольчик', emoji: '🔔' },
  { id: 'scarf', kind: 'trinket', label: 'Шарфик', emoji: '🧣' },
];

export const DEFAULT_CUSTOMIZATION: PetCustomization = {
  coatColor: 'orange',
  shirtId: 'none',
  hatId: 'none',
  trinketId: 'none',
};

export function findCoat(id: CoatColorId): CoatOption {
  return COAT_OPTIONS.find((item) => item.id === id) ?? COAT_OPTIONS[0];
}

export function findAccessory(options: AccessoryOption[], id: string): AccessoryOption {
  return options.find((item) => item.id === id) ?? options[0];
}
