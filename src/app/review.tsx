import { Image } from 'expo-image';
import { Redirect, router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useGame } from '@/components/game-provider';
import { PrimaryButton } from '@/components/primary-button';
import { findGoal } from '@/content/goals';
import { reviewPeriod } from '@/domain/period';
import { Spacing } from '@/constants/theme';
import { playSound } from '@/utils/sounds';

const ICONS: Record<string, string> = {
  Нужное: '🍎',
  Желания: '🎮',
  Накопления: '🏦',
};

export default function ReviewScreen() {
  const { ready, state, finishPeriod } = useGame();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  if (!ready) return null;
  if (!state) return <Redirect href="/onboarding" />;
  if (!state.period.plan) return <Redirect href="/plan" />;

  const review = reviewPeriod(state);
  const goal = findGoal(state.currentGoalId);

  async function onClose() {
    setBusy(true);
    const error = await finishPeriod();
    setBusy(false);
    if (error) {
      playSound('error');
      setMessage(error);
      return;
    }
    playSound('reward');
    router.replace('/home');
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Период {state.period.index}</Text>

        {goal ? (
          <View style={styles.goalCard}>
            {goal.image != null ? <Image source={goal.image} style={styles.goalImage} contentFit="contain" /> : null}
            <Text style={styles.goalName}>{goal.name}</Text>
            <Text style={styles.goalCost}>
              {state.wallet.savings}/{goal.cost} 🪙
            </Text>
          </View>
        ) : null}

        {review ? (
          <View style={styles.scoreCard}>
            <Text style={styles.score}>{review.score}</Text>
            <Text style={styles.grade}>{review.grade}</Text>
            <Text style={styles.note}>{review.note}</Text>
          </View>
        ) : null}

        <View style={styles.card}>
          {review?.lines.map((line) => (
            <View key={line.label} style={styles.line}>
              <View style={styles.row}>
                <Text style={styles.icon}>{ICONS[line.label] ?? '•'}</Text>
                <View style={styles.lineText}>
                  <Text style={styles.label}>{line.label}</Text>
                  <Text style={styles.note}>{line.text}</Text>
                </View>
                <Text style={styles.value}>
                  {line.actual}/{line.planned}
                </Text>
              </View>
              <Text style={styles.advice}>{line.advice}</Text>
            </View>
          ))}
        </View>

        {message ? <Text style={styles.error}>{message}</Text> : null}
        <PrimaryButton
          label={busy ? 'Закрываем…' : 'Новый период'}
          onPress={onClose}
          disabled={busy || !review?.canClose}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { padding: Spacing.four, gap: Spacing.three, paddingBottom: Spacing.six },
  kicker: { color: '#C4622D', fontSize: 14, fontWeight: '700', letterSpacing: 0.4, textTransform: 'uppercase' },
  title: { color: '#1F2430', fontSize: 32, fontWeight: '800', lineHeight: 38 },
  goalCard: {
    alignItems: 'center',
    gap: Spacing.two,
    borderRadius: 24,
    backgroundColor: '#FFF8F3',
    padding: Spacing.three,
  },
  goalImage: { width: '100%', height: 140 },
  goalName: { color: '#1F2430', fontSize: 22, fontWeight: '800', textAlign: 'center' },
  goalCost: { color: '#C4622D', fontSize: 20, fontWeight: '800' },
  card: { borderRadius: 18, backgroundColor: '#F7F7F8', padding: Spacing.three, gap: Spacing.two },
  scoreCard: { alignItems: 'center', gap: Spacing.one, paddingVertical: Spacing.two },
  score: { color: '#C4622D', fontSize: 48, fontWeight: '800', lineHeight: 52 },
  grade: { color: '#1F2430', fontSize: 22, fontWeight: '800' },
  note: { color: '#1F2430', fontSize: 15, fontWeight: '600', lineHeight: 20 },
  line: { gap: Spacing.one },
  lineText: { flex: 1, gap: 2 },
  advice: { color: '#1F2430', fontSize: 15, fontWeight: '500', lineHeight: 20 },
  row: { minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  icon: { width: 32, fontSize: 24, textAlign: 'center' },
  label: { color: '#1F2430', fontSize: 17, fontWeight: '800' },
  value: { color: '#1F2430', fontSize: 22, fontWeight: '800' },
  error: { color: '#9A3412', fontSize: 16, fontWeight: '700', lineHeight: 22 },
});
