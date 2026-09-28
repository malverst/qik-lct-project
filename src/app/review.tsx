import { Redirect, router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useGame } from '@/components/game-provider';
import { PrimaryButton } from '@/components/primary-button';
import { findGoal } from '@/content/goals';
import { reviewPeriod } from '@/domain/period';
import { Spacing } from '@/constants/theme';

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
      setMessage(error);
      return;
    }
    router.replace('/home');
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.lead}>Период {state.period.index}. План сравниваем с тем, что вышло на самом деле.</Text>
        {goal ? (
          <Text style={styles.text}>
            Цель «{goal.name}»: в копилке {state.wallet.savings} из {goal.cost}.
          </Text>
        ) : (
          <Text style={styles.text}>Цель ещё не выбрана.</Text>
        )}
        {review?.lines.map((line) => (
          <View key={line.label} style={styles.card}>
            <Text style={styles.title}>{line.label}</Text>
            <Text style={styles.text}>
              План {line.planned}, вышло {line.actual}
            </Text>
            <Text style={styles.note}>{line.text}</Text>
          </View>
        ))}
        <Text style={styles.note}>{review?.note}</Text>
        {message ? <Text style={styles.error}>{message}</Text> : null}
        <PrimaryButton
          label={busy ? 'Закрываем…' : 'Закрыть период'}
          onPress={onClose}
          disabled={busy || !review?.canClose}
        />
        {!review?.canClose && review?.reason ? <Text style={styles.note}>{review.reason}</Text> : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { padding: Spacing.four, gap: Spacing.three, paddingBottom: Spacing.six },
  lead: { color: '#1F2430', fontSize: 18, lineHeight: 26 },
  card: { borderRadius: 18, backgroundColor: '#F7F7F8', padding: Spacing.three, gap: Spacing.one },
  title: { color: '#1F2430', fontSize: 18, fontWeight: '700' },
  text: { color: '#1F2430', fontSize: 16, lineHeight: 22 },
  note: { color: '#60646C', fontSize: 16, lineHeight: 22 },
  error: { color: '#9A3412', fontSize: 16, lineHeight: 22 },
});
