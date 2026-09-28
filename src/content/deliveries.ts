export type DeliveryRoute = {
  id: string;
  label: string;
  detail: string;
  energy: number;
};

export type TaxiPassenger = {
  name: string;
  mood: string;
  urgency: string;
};

export type DeliveryOrder = {
  id: string;
  kind?: 'delivery' | 'taxi';
  title: string;
  story: string;
  reward: number;
  routes: [DeliveryRoute, DeliveryRoute];
  passenger?: TaxiPassenger;
};

export const DELIVERIES: DeliveryOrder[] = [
  {
    id: 'note',
    title: 'Записка соседу',
    story: 'Короткий двор. Сосед ждёт у калитки.',
    reward: 6,
    routes: [
      { id: 'yard', label: 'Через двор', detail: 'Близко и спокойно.', energy: 1 },
      { id: 'stairs', label: 'По лестнице', detail: 'Чуть дольше, но без луж.', energy: 2 },
    ],
  },
  {
    id: 'bread',
    title: 'Булочка',
    story: 'Тёплая булочка в дом напротив.',
    reward: 8,
    routes: [
      { id: 'path', label: 'По дорожке', detail: 'Ровная дорога.', energy: 1 },
      { id: 'park', label: 'Через парк', detail: 'Красиво, но дальше.', energy: 2 },
    ],
  },
  {
    id: 'book',
    title: 'Книга',
    story: 'Книга для кота на втором этаже.',
    reward: 12,
    routes: [
      { id: 'lift', label: 'На лифте', detail: 'Быстро.', energy: 2 },
      { id: 'steps', label: 'Пешком вверх', detail: 'Лифт занят.', energy: 3 },
    ],
  },
  {
    id: 'flowers',
    title: 'Цветы',
    story: 'Букет нельзя помять. Дом через улицу.',
    reward: 14,
    routes: [
      { id: 'cross', label: 'По переходу', detail: 'Нужно подождать свет.', energy: 2 },
      { id: 'long', label: 'В обход', detail: 'Дальше, зато тихо.', energy: 3 },
    ],
  },
  {
    id: 'lunch',
    title: 'Обед',
    story: 'Горячий обед. Нести аккуратно.',
    reward: 16,
    routes: [
      { id: 'short', label: 'Короткий путь', detail: 'Есть ступеньки.', energy: 2 },
      { id: 'flat', label: 'Ровная улица', detail: 'Дольше, суп не расплещется.', energy: 3 },
    ],
  },
  {
    id: 'parcel',
    title: 'Большая коробка',
    story: 'Коробка лёгкая, но широкая.',
    reward: 18,
    routes: [
      { id: 'gate', label: 'В ворота', detail: 'Узко, надо боком.', energy: 3 },
      { id: 'yard-long', label: 'Вокруг дома', detail: 'Широко и длинно.', energy: 4 },
    ],
  },
  {
    id: 'rush',
    title: 'Срочное письмо',
    story: 'Письмо нужно до заката. Далеко.',
    reward: 22,
    routes: [
      { id: 'run', label: 'Напрямик', detail: 'Быстро, но устанешь.', energy: 3 },
      { id: 'hill', label: 'Через горку', detail: 'Дальше и круче.', energy: 4 },
    ],
  },
  {
    id: 'city',
    title: 'Посылка в другой район',
    story: 'Самый дальний адрес. Награда больше всех.',
    reward: 28,
    routes: [
      { id: 'bus', label: 'До остановки', detail: 'Часть пути пешком.', energy: 4 },
      { id: 'walk', label: 'Весь путь пешком', detail: 'Очень длинно.', energy: 5 },
    ],
  },
];

export function findDelivery(id: string): DeliveryOrder | null {
  return [...DELIVERIES, ...TAXI_DELIVERIES, ...COMPLEX_DELIVERIES].find((order) => order.id === id) ?? null;
}

export const TAXI_DELIVERIES: DeliveryOrder[] = [
  {
    id: 'taxi-school',
    kind: 'taxi',
    title: 'Поездка в школу',
    story: 'Котёнок торопится на урок математики.',
    reward: 20,
    passenger: {
      name: 'Котёнок Тим',
      mood: 'Спешит и волнуется',
      urgency: 'До звонка 10 минут',
    },
    routes: [
      { id: 'taxi-main', label: 'По главной улице', detail: 'Прямо, но есть пробки.', energy: 3 },
      { id: 'taxi-quiet', label: 'Тихими улицами', detail: 'Дальше, зато спокойнее.', energy: 4 },
    ],
  },
  {
    id: 'taxi-park',
    kind: 'taxi',
    title: 'Поездка в парк',
    story: 'Пассажирка едет на встречу с подругой у фонтана.',
    reward: 24,
    passenger: {
      name: 'Кошечка Мия',
      mood: 'В хорошем настроении',
      urgency: 'Хочет ехать плавно и без кочек',
    },
    routes: [
      { id: 'taxi-bridge', label: 'Через мост', detail: 'Короткий путь с подъёмом.', energy: 3 },
      { id: 'taxi-lake', label: 'Вокруг озера', detail: 'Красиво, но длиннее.', energy: 5 },
    ],
  },
  {
    id: 'taxi-station',
    kind: 'taxi',
    title: 'Поездка на вокзал',
    story: 'Кот с чемоданом едет на дневной поезд.',
    reward: 30,
    passenger: {
      name: 'Дядя Барсик',
      mood: 'С чемоданом и билетом',
      urgency: 'Поезд отходит совсем скоро',
    },
    routes: [
      { id: 'taxi-tunnel', label: 'Через тоннель', detail: 'Быстро, но шумно.', energy: 4 },
      { id: 'taxi-ring', label: 'По кольцевой', detail: 'Ровная, но дальняя дорога.', energy: 6 },
    ],
  },
];

export const COMPLEX_DELIVERIES: DeliveryOrder[] = [
  {
    id: 'complex-three',
    title: 'Три адреса',
    story: 'Нужно развезти три маленькие посылки по одному маршруту.',
    reward: 36,
    routes: [
      { id: 'complex-plan', label: 'Сначала дальний адрес', detail: 'Лучше спланировать путь.', energy: 5 },
      { id: 'complex-near', label: 'Сначала ближний', detail: 'Просто начать, но путь длиннее.', energy: 7 },
    ],
  },
  {
    id: 'complex-fragile',
    title: 'Хрупкая посылка',
    story: 'Посылка важная: дорогу нужно выбрать внимательно.',
    reward: 42,
    routes: [
      { id: 'complex-smooth', label: 'Ровная дорога', detail: 'Дольше, зато безопаснее.', energy: 5 },
      { id: 'complex-fast', label: 'Короткий путь', detail: 'Быстрее, но много кочек.', energy: 6 },
    ],
  },
];
