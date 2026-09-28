export type PurchaseKind = 'mandatory' | 'optional';

export type PurchaseItem = {
  id: string;
  name: string;
  kind: PurchaseKind;
  price: number;
  description: string;
  effect: string;
  hungerGain: number;
  satiation: number;
  image: number | null;
};

export const PURCHASES: PurchaseItem[] = [
  {
    id: 'food-bowl',
    name: 'Миска еды',
    kind: 'mandatory',
    price: 20,
    description: 'Обычная еда на сегодня.',
    effect: 'Кот становится сытее.',
    hungerGain: 30,
    satiation: 2,
    image: require('../../assets/images/miska.png'),
  },
  {
    id: 'food-premium',
    name: 'Сытный обед',
    kind: 'mandatory',
    price: 28,
    description: 'Порция побольше на сегодня.',
    effect: 'Финни дольше не голоден.',
    hungerGain: 40,
    satiation: 4,
    image: require('../../assets/images/miska.png'),
  },
  {
    id: 'food-deluxe',
    name: 'Праздничный ужин',
    kind: 'mandatory',
    price: 50,
    description: 'Самая большая порция.',
    effect: 'Финни получает максимум сытости.',
    hungerGain: 50,
    satiation: 5,
    image: require('../../assets/images/miska.png'),
  },
  {
    id: 'care-brush',
    name: 'Расчёска',
    kind: 'mandatory',
    price: 15,
    description: 'Купи чтобы кота можно было гладить',
    effect: 'После покупки нажми на кота дома.',
    hungerGain: 0,
    satiation: 0,
    image: require('../../assets/images/raschestka.png'),
  },
];

export function findPurchase(id: string): PurchaseItem | null {
  return PURCHASES.find((item) => item.id === id) ?? null;
}
