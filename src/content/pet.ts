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
  /** Картинка 1:1 поверх кота. null — полупрозрачная заглушка. */
  image: number | null;
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
  { id: 'none', kind: 'shirt', label: 'Без кофты', emoji: '—', image: null },
  { id: 'shirt-stripe', kind: 'shirt', label: 'Полосатая', emoji: '👕', image: require('../../assets/images/polosataya-kofta.png') },
  { id: 'shirt-star', kind: 'shirt', label: 'Со звездой', emoji: '✨', image: require('../../assets/images/star-kofta.png') },
  { id: 'shirt-warm', kind: 'shirt', label: 'Тёплая', emoji: '🧥', image: require('../../assets/images/warm-kofta.png') },
];

export const HAT_OPTIONS: AccessoryOption[] = [
  { id: 'none', kind: 'hat', label: 'Без шляпы', emoji: '—', image: null },
  { id: 'hat-cap', kind: 'hat', label: 'Кепка', emoji: '🧢', image: require('../../assets/images/kepka.png') },
  { id: 'hat-bow', kind: 'hat', label: 'Бантик', emoji: '🎀', image: require('../../assets/images/bantik.png') },
  { id: 'hat-crown', kind: 'hat', label: 'Корона', emoji: '👑', image: require('../../assets/images/crown.png') },
];

export const TRINKET_OPTIONS: AccessoryOption[] = [
  { id: 'none', kind: 'trinket', label: 'Без украшения', emoji: '—', image: null },
  { id: 'trinket-bell', kind: 'trinket', label: 'Колокольчик', emoji: '🔔', image: require('../../assets/images/kolokolchik.png') },
  { id: 'trinket-scarf', kind: 'trinket', label: 'Шарфик', emoji: '🧣', image: require('../../assets/images/sharf.png') },
  { id: 'trinket-medal', kind: 'trinket', label: 'Медаль', emoji: '🏅', image: require('../../assets/images/medal.png') },
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
