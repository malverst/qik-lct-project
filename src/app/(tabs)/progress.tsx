import { Redirect } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useGame } from '@/components/game-provider';
import { MAX_PET_LEVEL } from '@/content/pet';
import { Spacing } from '@/constants/theme';

export default function ProgressScreen() {
  const { ready, state } = useGame();

  if (!ready) return null;
  if (!state) return <Redirect href="/onboarding" />;
  if (!state.period.plan && state.history.length === 0) {
    return <Redirect href="/plan" />;
  }

  const progress = Math.min(state.pet.level / MAX_PET_LEVEL, 1);
  const stage = stageLabel(state.pet.stage);

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <Text style={styles.heroIcon}>🌱</Text>
          <Text style={styles.heroTitle}>Растём вместе</Text>
          <Text style={styles.heroText}>
            {state.pet.name} растёт от дел, покупок и монет в копилке.
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.stack}>
            <Text style={styles.title}>Уровень {state.pet.level}</Text>
            <Text style={styles.stage}>{stage}</Text>
          </View>
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${progress * 100}%` }]} />
          </View>
          <Text style={styles.note}>
            {state.pet.level < MAX_PET_LEVEL
              ? 'Новые дела, покупки и накопления поднимают уровень.'
              : `${state.pet.name} достиг максимального уровня.`}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>Что уже открыто</Text>
          <ProgressLine done={state.pet.level >= 1} text="Кот-курьер" />
          <ProgressLine done={state.pet.level >= 2} text="Такси" />
          <ProgressLine done={state.pet.level >= 3} text="Сложные дела" />
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>История периодов</Text>
          {state.history.length === 0 ? (
            <Text style={styles.note}>Когда цель периода будет собрана, здесь появится его итог.</Text>
          ) : (
            state.history
              .slice()
              .reverse()
              .map((record) => (
                <View key={`${record.index}-${record.goalId}`} style={styles.historyItem}>
                  <View style={styles.stack}>
                    <Text style={styles.historyTitle}>Период {record.index}</Text>
                    <Text style={styles.goalPrice}>🎯 {record.goalName}</Text>
                  </View>
                  <Text style={styles.historyText}>
                    План: 🪙 {record.plan.mandatory} нужное · 🪙 {record.plan.optional} желания · 🪙 {record.plan.savings} накопления
                  </Text>
                  <Text style={styles.historyText}>
                    Факт: {record.fact.mandatorySpent} · {record.fact.optionalSpent} · {record.fact.saved}
                  </Text>
                </View>
              ))
          )}
        </View>

        <View style={styles.noteBox}>
          <Text style={styles.noteBoxTitle}>Подсказка</Text>
          <Text style={styles.noteBoxText}>Сравнивай план и факт: так проще заметить, что получилось хорошо, а что можно изменить в следующий раз.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function ProgressLine({ done, text }: { done: boolean; text: string }) {
  return (
    <View style={styles.progressLine}>
      <Text style={styles.progressIcon}>{done ? '✓' : '🔒'}</Text>
      <Text style={[styles.progressText, !done && styles.lockedText]}>{text}</Text>
    </View>
  );
}

function stageLabel(stage: 'kitten' | 'teen' | 'adult'): string {
  if (stage === 'adult') return 'Взрослый';
  if (stage === 'teen') return 'Подросток';
  return 'Малыш';
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { padding: Spacing.four, gap: Spacing.three, paddingBottom: Spacing.six },
  hero: {
    alignItems: 'center',
    gap: Spacing.one,
    paddingVertical: Spacing.two,
  },
  heroIcon: { fontSize: 42, lineHeight: 50 },
  heroTitle: { color: '#1F2430', fontSize: 24, fontWeight: '700' },
  heroText: { color: '#60646C', fontSize: 15, lineHeight: 21, textAlign: 'center' },
  card: { borderRadius: 18, backgroundColor: '#F7F7F8', padding: Spacing.three, gap: Spacing.two },
  row: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: Spacing.two },
  stack: { gap: Spacing.one },
  title: { color: '#1F2430', fontSize: 20, fontWeight: '800', flexShrink: 1 },
  stage: { color: '#C4622D', fontSize: 16, fontWeight: '800', flexShrink: 1 },
  track: { height: 16, borderRadius: 8, backgroundColor: '#E6E8EC', overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 8, backgroundColor: '#F4A261' },
  note: { color: '#60646C', fontSize: 15, lineHeight: 21 },
  progressLine: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, minHeight: 40 },
  progressIcon: { width: 24, color: '#3FA36C', fontSize: 20, fontWeight: '700', textAlign: 'center' },
  progressText: { flex: 1, flexShrink: 1, color: '#1F2430', fontSize: 16, fontWeight: '600' },
  lockedText: { color: '#8B909A' },
  historyItem: { borderTopWidth: 1, borderTopColor: '#E6E8EC', paddingTop: Spacing.two, gap: Spacing.one },
  historyTitle: { color: '#1F2430', fontSize: 17, fontWeight: '800' },
  goalPrice: { color: '#C4622D', fontSize: 15, fontWeight: '700', flexShrink: 1 },
  historyText: { color: '#60646C', fontSize: 14, fontWeight: '500', lineHeight: 20 },
  noteBox: { borderRadius: 18, backgroundColor: '#FFF6EE', padding: Spacing.three, gap: Spacing.one },
  noteBoxTitle: { color: '#C4622D', fontSize: 16, fontWeight: '700' },
  noteBoxText: { color: '#1F2430', fontSize: 15, lineHeight: 21 },
});
