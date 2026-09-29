import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { useGame } from '@/components/game-provider';
import { Spacing } from '@/constants/theme';
import { reviewPeriod } from '@/domain/period';

export function PeriodComplete() {
  const { state } = useGame();
  const [dismissedPeriod, setDismissedPeriod] = useState<number | null>(null);
  const review = state ? reviewPeriod(state) : null;
  const open = Boolean(review?.canClose && state && dismissedPeriod !== state.period.index);
  const plan = state?.period.plan;

  useEffect(() => {
    if (state && dismissedPeriod !== null && dismissedPeriod !== state.period.index) setDismissedPeriod(null);
  }, [dismissedPeriod, state]);

  if (!state || !open) return null;

  function showReview() {
    setDismissedPeriod(state?.period.index ?? null);
    router.push('/review');
  }

  return (
    <Modal visible transparent animationType="none" statusBarTranslucent navigationBarTranslucent onRequestClose={showReview}>
      <View style={styles.backdrop}>
        <View style={styles.popup}>
          <Text style={styles.badge}>Период {state.period.index}</Text>
          <Text style={styles.title}>План выполнен</Text>
          {plan ? (
            <View style={styles.summary}>
              <SpendRow icon="🍎" actual={state.period.fact.mandatorySpent} planned={plan.mandatory} label="Нужное" color="#E07A3D" />
              <SpendRow icon="🎮" actual={state.period.fact.optionalSpent} planned={plan.optional} label="Желания" color="#5B8DEF" />
              <SpendRow icon="🏦" actual={state.period.fact.saved} planned={plan.savings} label="Накопления" color="#3FA36C" />
            </View>
          ) : null}
          <Pressable accessibilityRole="button" onPress={showReview} style={styles.button}>
            <Text style={styles.buttonText}>Смотреть итоги</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

function SpendRow({
  icon,
  actual,
  planned,
  label,
  color,
}: {
  icon: string;
  actual: number;
  planned: number;
  label: string;
  color: string;
}) {
  const progress = planned > 0 ? Math.min(actual / planned, 1) : actual > 0 ? 1 : 0;

  return (
    <View style={styles.row} accessibilityLabel={`${label}: ${actual} из ${planned}`}>
      <View style={styles.head}>
        <Text style={styles.icon}>{icon}</Text>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>
          {actual}/{planned}
        </Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${progress * 100}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(31, 36, 48, 0.45)',
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
    gap: Spacing.two,
  },
  badge: { color: '#C4622D', fontSize: 14, fontWeight: '700', textTransform: 'uppercase' },
  title: { color: '#1F2430', fontSize: 22, fontWeight: '700' },
  summary: { gap: Spacing.two },
  row: { gap: Spacing.one },
  head: { minHeight: 36, flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  icon: { fontSize: 24, width: 32, textAlign: 'center' },
  label: { flex: 1, color: '#1F2430', fontSize: 17, fontWeight: '700' },
  value: { color: '#1F2430', fontSize: 20, fontWeight: '800' },
  track: { height: 16, borderRadius: 8, backgroundColor: '#F0E4D8', overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 8 },
  button: {
    minHeight: 52,
    borderRadius: 16,
    backgroundColor: '#F4A261',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
  },
  buttonText: { color: '#1F2430', fontSize: 18, fontWeight: '700' },
});
