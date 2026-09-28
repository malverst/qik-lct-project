export type SavingsGoal = {
  id: string;
  name: string;
  cost: number;
  description: string;
  image: number | null;
};

export const GOALS: SavingsGoal[] = [
  {
    id: 'console',
    name: 'Игровая приставка',
    cost: 150,
    description: 'Можно играть вечером.',
    image: require('../../assets/images/gamestation.png'),
  },
  {
    id: 'house',
    name: 'Большой дом',
    cost: 250,
    description: 'Просторный дом для кота.',
    image: require('../../assets/images/big_house.png'),
  },
  {
    id: 'rare-item',
    name: 'Редкий предмет',
    cost: 400,
    description: 'Особая вещь для питомца.',
    image: null,
  },
];

export function findGoal(id: string | null): SavingsGoal | null {
  if (!id) return null;
  return GOALS.find((goal) => goal.id === id) ?? null;
}

export function openGoals(ownedIds: string[]): SavingsGoal[] {
  return GOALS.filter((goal) => !ownedIds.includes(goal.id));
}
