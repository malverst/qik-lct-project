import { Redirect, router } from 'expo-router';
import { useEffect, useState, type ReactNode } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { LockKeyhole } from 'lucide-react-native';

import { useGame } from '@/components/game-provider';
import { PrimaryButton } from '@/components/primary-button';
import { COMPLEX_DELIVERIES, DELIVERIES, TAXI_DELIVERIES, type DeliveryOrder, type DeliveryRoute } from '@/content/deliveries';
import { Spacing } from '@/constants/theme';
import { playSound } from '@/utils/sounds';

const STEPS: string[] = ['🏠', '🌳', '🛣️', '🚪'];
const TAXI_STEPS: string[] = ['🚖', '🚦', '🛣️', '🏁'];

function getSteps(kind?: 'delivery' | 'taxi'): string[] {
  return kind === 'taxi' ? TAXI_STEPS : STEPS;
}

function getPrefix(kind?: 'delivery' | 'taxi') {
  return kind === 'taxi' ? '🚕 ' : '📦 ';
}
const OPEN_EASE = Easing.bezier(0.23, 1, 0.32, 1);

function RoundChevron() {
  return (
    <Svg width={32} height={32} viewBox="0 0 32 32">
      <Circle cx={16} cy={16} r={13} fill="#FFF6EE" stroke="#C4622D" strokeWidth={2.5} />
      <Path
        d="M10 14.2 L16 20 L22 14.2"
        fill="none"
        stroke="#C4622D"
        strokeWidth={2.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function TaskFold({
  title,
  open,
  locked = false,
  onPress,
  children,
}: {
  title: string;
  open: boolean;
  locked?: boolean;
  onPress: () => void;
  children: ReactNode;
}) {
  const progress = useSharedValue(open && !locked ? 1 : 0);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    progress.set(withTiming(open && !locked ? 1 : 0, { duration: 420, easing: OPEN_EASE }));
  }, [locked, open, progress]);

  const bodyStyle = useAnimatedStyle(() => ({
    height: height === 0 ? 0 : progress.get() * height,
    opacity: progress.get(),
  }));
  const arrowStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${progress.get() * 180}deg` }],
  }));

  return (
    <View>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        onPress={onPress}
        style={[styles.category, locked && styles.categoryLocked]}>
        <Text style={styles.title}>{title}</Text>
        {locked ? <LockKeyhole size={25} color="#8B909A" strokeWidth={2.8} /> : <Animated.View style={arrowStyle}><RoundChevron /></Animated.View>}
      </Pressable>
      <Animated.View style={[styles.fold, bodyStyle]} pointerEvents={locked ? 'none' : 'auto'}>
        <View
          style={styles.foldInner}
          onLayout={(event) => {
            const next = event.nativeEvent.layout.height;
            if (next > 0 && next !== height) setHeight(next);
          }}>
          {children}
        </View>
      </Animated.View>
    </View>
  );
}

export default function TasksScreen() {
  const { ready, state, finishPlay, rest } = useGame();
  const [order, setOrder] = useState<DeliveryOrder | null>(null);
  const [route, setRoute] = useState<DeliveryRoute | null>(null);
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [energyHelp, setEnergyHelp] = useState<string | null>(null);
  const [levelHelp, setLevelHelp] = useState<string | null>(null);
  const [mealHelp, setMealHelp] = useState(false);
  const [openCategory, setOpenCategory] = useState<'courier' | 'taxi' | 'complex' | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const restLeft =
    state && !state.profile.isDemo && state.restAvailableAt !== null ? Math.max(0, state.restAvailableAt - now) : 0;
  const restCooling = restLeft > 0;
  const restLabel = busy ? 'Отдыхаем…' : restCooling ? `Отдых через ${formatCooldown(restLeft)}` : 'Отдохнуть';

  useEffect(() => {
    if (!state || state.profile.isDemo || state.restAvailableAt === null || state.restAvailableAt <= Date.now()) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [state]);

  useEffect(() => {
    if (!route) return;
    const steps = getSteps(order?.kind);
    if (step >= steps.length - 1) return;
    const timer = setTimeout(() => setStep((value) => value + 1), order?.kind === 'taxi' ? 550 : 700);
    return () => clearTimeout(timer);
  }, [order?.kind, route, step]);

  if (!ready) return null;
  if (!state) return <Redirect href="/onboarding" />;
  if (!state.period.plan) return <Redirect href="/plan" />;

  const game = state;
  const energy = state.pet.energy;
  const currentSteps = getSteps(order?.kind);
  const arrived = route != null && step >= currentSteps.length - 1;

  function openOrder(next: DeliveryOrder) {
    if (game.pet.needsMeal) {
      setMealHelp(true);
      return;
    }
    const can = next.routes.some((item) => item.energy <= energy);
    if (!can) {
      setEnergyHelp(`На «${next.title}» нужно хотя бы ${next.routes[0].energy} энергии, а есть ${energy}. Финни может отдохнуть.`);
      return;
    }
    setMessage(null);
    setOrder(next);
    setRoute(null);
    setStep(0);
  }

  function startRoute(next: DeliveryRoute) {
    if (energy < next.energy) {
      setEnergyHelp(`Дорога «${next.label}» просит ${next.energy} энергии, а есть ${energy}. Возьми короче или отдохни.`);
      return;
    }
    setMessage(null);
    setRoute(next);
    setStep(0);
  }

  async function complete() {
    if (!order || !route) return;
    setBusy(true);
    const finished = await finishPlay(order.id, route.id);
    setBusy(false);
    if (finished.error) {
      playSound('error');
      setMessage(finished.error);
      return;
    }
    playSound('reward');
    setMessage(finished.explanation);
    if (finished.needsMeal) setMealHelp(true);
    setOrder(null);
    setRoute(null);
    setStep(0);
  }

  async function onRest() {
    setBusy(true);
    const error = await rest();
    setBusy(false);
    if (error) playSound('error');
    else playSound('rest');
    setMessage(error ?? 'Финни поспал. Энергия снова полная.');
  }

  function toggleCategory(category: 'courier' | 'taxi' | 'complex', requiredLevel?: number) {
    if (requiredLevel && game.pet.level < requiredLevel) {
      setLevelHelp(`Эта категория откроется на ${requiredLevel} уровне.`);
      return;
    }
    setOpenCategory((current) => (current === category ? null : category));
  }

  function renderOrders(orders: DeliveryOrder[]) {
    return orders.map((item) => {
      const cheap = item.routes[0].energy;
      const locked = energy < cheap || game.pet.needsMeal;
      const prefix = getPrefix(item.kind);
      return (
        <Pressable
          key={item.id}
          accessibilityRole="button"
          onPress={() => openOrder(item)}
          style={({ pressed }) => [styles.card, locked && styles.locked, pressed && styles.pressed]}>
          <View style={styles.row}>
            <Text style={styles.title}>
              {prefix}
              {item.title}
            </Text>
            <View style={styles.badgeRow}>
              <View style={styles.costBadge}>
                <Text style={styles.badgeIcon}>⚡</Text>
                <Text style={styles.badgeText}>{item.routes[0].energy}-{item.routes[1].energy}</Text>
              </View>
              <View style={styles.rewardBadge}>
                <Text style={styles.badgeIcon}>🪙</Text>
                <Text style={styles.reward}>{item.reward}</Text>
              </View>
            </View>
          </View>
          <Text style={styles.description}>{item.story}</Text>
          <View style={styles.metaRow}>
            <Text style={styles.meta}>
              {item.kind === 'taxi' ? 'Маршрут на выбор: 2 варианта' : 'Путь на выбор: 2 варианта'}
              {game.pet.needsMeal ? ' · Сначала покорми Финни' : locked && energy < cheap ? ' · Мало энергии' : ''}
            </Text>
          </View>
        </Pressable>
      );
    });
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <PrimaryButton
          label={restLabel}
          tone={restCooling || energy >= 8 ? 'quiet' : 'primary'}
          onPress={onRest}
          disabled={busy || restCooling || energy >= 8}
        />

        {!order ? (
          <>
            <TaskFold
              title="Кот-курьер"
              open={openCategory === 'courier'}
              onPress={() => toggleCategory('courier')}>
              {renderOrders(DELIVERIES)}
            </TaskFold>
            <TaskFold
              title="Такси"
              open={openCategory === 'taxi'}
              locked={game.pet.level < 2}
              onPress={() => toggleCategory('taxi', 2)}>
              {renderOrders(TAXI_DELIVERIES)}
            </TaskFold>
            <TaskFold
              title="Сложные дела"
              open={openCategory === 'complex'}
              locked={game.pet.level < 3}
              onPress={() => toggleCategory('complex', 3)}>
              {renderOrders(COMPLEX_DELIVERIES)}
            </TaskFold>
          </>
        ) : (
          <View style={styles.card}>
            <Text style={styles.title}>
              {getPrefix(order.kind)}
              {order.title}
            </Text>
            <Text style={styles.description}>{order.story}</Text>
            {order.passenger ? (
              <View style={styles.passengerBox}>
                <Text style={styles.passengerTitle}>Пассажир: {order.passenger.name}</Text>
                <Text style={styles.passengerText}>Настроение: {order.passenger.mood}</Text>
                <Text style={styles.passengerText}>Пожелание: {order.passenger.urgency}</Text>
              </View>
            ) : null}
            <View style={styles.rewardInline}>
              <Text style={styles.badgeIcon}>🪙</Text>
              <Text style={styles.reward}>Награда: {order.reward} монет</Text>
            </View>
            {!route ? (
              <>
                <Text style={styles.description}>
                  {order.kind === 'taxi'
                    ? 'Выбери маршрут поездки. Быстрый тратит меньше времени, спокойный бережёт силы.'
                    : 'Выбери дорогу. От неё зависит, сколько энергии уйдёт.'}
                </Text>
                {order.routes.map((item) => (
                  <Pressable
                    key={item.id}
                    accessibilityRole="button"
                    onPress={() => startRoute(item)}
                    style={({ pressed }) => [styles.route, energy < item.energy && styles.locked, pressed && styles.pressed]}>
                    <View style={styles.row}>
                      <Text style={styles.title}>{item.label}</Text>
                      <View style={styles.costBadge}>
                        <Text style={styles.badgeIcon}>⚡</Text>
                        <Text style={styles.badgeText}>{item.energy}</Text>
                      </View>
                    </View>
                    <Text style={styles.description}>{item.detail}</Text>
                  </Pressable>
                ))}
              </>
            ) : (
              <>
                <View style={styles.track}>
                  {currentSteps.map((mark: string, index: number) => (
                    <Text key={`${mark}-${index}`} style={[styles.step, index === step && styles.stepNow, index < step && styles.stepDone]}>
                      {index === step ? (order.kind === 'taxi' ? '🚖' : '🐈') : mark}
                    </Text>
                  ))}
                </View>
                <Text style={styles.description}>
                  {arrived
                    ? order.kind === 'taxi'
                      ? `Пассажир доставлен на место. Маршрут «${route.label}» пройден.`
                      : `Финни у двери. Дорога «${route.label}» пройдена.`
                    : order.kind === 'taxi'
                      ? 'Финни везёт пассажира по городу…'
                      : 'Финни несёт заказ…'}
                </Text>
                {arrived ? (
                  <PrimaryButton
                    label={busy ? 'Считаем…' : order.kind === 'taxi' ? 'Завершить поездку' : 'Отдать заказ'}
                    onPress={complete}
                    disabled={busy}
                  />
                ) : null}
              </>
            )}
            <PrimaryButton
              label={order.kind === 'taxi' ? 'К заказам такси' : 'К заказам'}
              tone="quiet"
              onPress={() => {
                setOrder(null);
                setRoute(null);
                setStep(0);
              }}
            />
          </View>
        )}
        {message ? <Text style={styles.note}>{message}</Text> : null}
      </ScrollView>
      <Modal visible={energyHelp != null} transparent animationType="fade" onRequestClose={() => setEnergyHelp(null)}>
        <Pressable style={styles.backdrop} onPress={() => setEnergyHelp(null)}>
          <Pressable style={styles.popup} onPress={() => {}}>
            <Text style={styles.popupTitle}>Мало энергии</Text>
            <Text style={styles.text}>{energyHelp}</Text>
            <PrimaryButton label="Понятно" onPress={() => setEnergyHelp(null)} />
          </Pressable>
        </Pressable>
      </Modal>
      <Modal visible={levelHelp != null} transparent animationType="fade" onRequestClose={() => setLevelHelp(null)}>
        <Pressable style={styles.backdrop} onPress={() => setLevelHelp(null)}>
          <Pressable style={styles.popup} onPress={() => {}}>
            <Text style={styles.popupTitle}>Новая категория пока закрыта</Text>
            <Text style={styles.text}>{levelHelp}</Text>
            <PrimaryButton label="Понятно" onPress={() => setLevelHelp(null)} />
          </Pressable>
        </Pressable>
      </Modal>
      <Modal visible={mealHelp} transparent animationType="fade" onRequestClose={() => setMealHelp(false)}>
        <Pressable style={styles.backdrop} onPress={() => setMealHelp(false)}>
          <Pressable style={styles.popup} onPress={() => {}}>
            <Text style={styles.popupTitle}>Финни проголодался</Text>
            <Text style={styles.text}>После трёх заказов пора покормить кота. Пока он голоден, новые дела закрыты.</Text>
            <PrimaryButton
              label="Купить еду"
              onPress={() => {
                setMealHelp(false);
                router.push('/shop');
              }}
            />
            <PrimaryButton label="Позже" tone="quiet" onPress={() => setMealHelp(false)} />
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

function formatCooldown(ms: number): string {
  const total = Math.ceil(ms / 1000);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { padding: Spacing.four, gap: Spacing.three, paddingBottom: Spacing.six },
  lead: { color: '#1F2430', fontSize: 18, lineHeight: 26 },
  category: {
    minHeight: 56,
    borderRadius: 18,
    backgroundColor: '#FFF6EE',
    borderWidth: 1.5,
    borderColor: '#F4A261',
    padding: Spacing.three,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  categoryLocked: { backgroundColor: '#F0F0F3', borderColor: '#D6D8DE' },
  fold: { overflow: 'hidden' },
  foldInner: { position: 'absolute', left: 0, right: 0, top: 0, gap: Spacing.three, paddingTop: Spacing.two },
  card: {
    borderRadius: 18,
    backgroundColor: '#F7F7F8',
    padding: Spacing.three,
    gap: Spacing.two,
  },
  locked: { opacity: 0.55 },
  pressed: { opacity: 0.8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: Spacing.two },
  title: { flex: 1, color: '#1F2430', fontSize: 18, fontWeight: '700' },
  text: { color: '#1F2430', fontSize: 16, lineHeight: 22 },
  description: { color: '#4F5560', fontSize: 14, lineHeight: 19 },
  reward: { color: '#C4622D', fontSize: 18, fontWeight: '700' },
  meta: { color: '#60646C', fontSize: 15, lineHeight: 20 },
  note: { color: '#1F2430', fontSize: 16, lineHeight: 22 },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.one },
  costBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: '#FFF1E5',
    borderRadius: 12,
    paddingHorizontal: Spacing.two,
    paddingVertical: 2,
  },
  rewardBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: '#FFF6EE',
    borderRadius: 12,
    paddingHorizontal: Spacing.two,
    paddingVertical: 2,
  },
  badgeIcon: { fontSize: 14 },
  badgeText: { color: '#C4622D', fontSize: 14, fontWeight: '700' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.one },
  passengerBox: {
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F0D9C4',
    padding: Spacing.two,
    gap: 2,
  },
  passengerTitle: { color: '#1F2430', fontSize: 15, fontWeight: '700' },
  passengerText: { color: '#60646C', fontSize: 14, lineHeight: 18 },
  rewardInline: { flexDirection: 'row', alignItems: 'center', gap: Spacing.one },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(31, 36, 48, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.four,
  },
  popup: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: Spacing.four,
    gap: Spacing.three,
  },
  popupTitle: { color: '#1F2430', fontSize: 22, fontWeight: '700' },
  route: {
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    padding: Spacing.three,
    gap: Spacing.one,
  },
  track: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF6EE',
    borderRadius: 18,
    padding: Spacing.three,
  },
  step: { fontSize: 28, opacity: 0.35 },
  stepNow: { fontSize: 36, opacity: 1 },
  stepDone: { opacity: 1 },
});
