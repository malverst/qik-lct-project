import { Redirect, router } from 'expo-router';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useGame } from '@/components/game-provider';
import { PrimaryButton } from '@/components/primary-button';
import { MAX_PET_LEVEL } from '@/content/pet';
import { Spacing } from '@/constants/theme';

const BARRIER_ANSWER = '-1';

export default function AdultScreen() {
  const { ready, state, clearGame } = useGame();
  const [verified, setVerified] = useState(false);
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [openTopic, setOpenTopic] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [resetting, setResetting] = useState(false);

  if (!ready) return null;
  if (!state) return <Redirect href="/onboarding" />;

  function checkAnswer() {
    if (answer.trim() !== BARRIER_ANSWER) {
      setError('Попробуй ещё раз. Посчитай 3 − 4.');
      return;
    }
    setError(null);
    setVerified(true);
  }

  async function resetProfile() {
    setResetting(true);
    await clearGame();
    router.replace('/onboarding');
  }

  if (!verified) {
    return (
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <View style={styles.gate}>
          <Text style={styles.title}>Раздел взрослого</Text>
          <Text style={styles.lead}>Реши небольшой пример, чтобы открыть информацию о прогрессе.</Text>
          <Text style={styles.example}>3 − 4 = ?</Text>
          <TextInput
            accessibilityLabel="Ответ на пример"
            keyboardType="numbers-and-punctuation"
            value={answer}
            onChangeText={(value) => {
              const next = value.replace(/[^0-9-]/g, '');
              setAnswer(next.startsWith('-') ? `-${next.replace(/-/g, '')}` : next.replace(/-/g, ''));
              setError(null);
            }}
            style={styles.input}
            placeholder="Ответ"
            placeholderTextColor="#8B909A"
            maxLength={3}
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <PrimaryButton label="Открыть" onPress={checkAnswer} disabled={answer.length === 0} />
          <PrimaryButton label="Назад" tone="quiet" onPress={() => router.back()} />
        </View>
      </SafeAreaView>
    );
  }

  const levelProgress = Math.min(state.pet.level / MAX_PET_LEVEL, 1);
  const periodsProgress = Math.min(state.history.length / 5, 1);
  const goalsProgress = Math.min(state.progress.ownedGoalIds.length / 3, 1);
  const topics = [
    {
      label: 'Планирование',
      done: state.history.length > 0 || Boolean(state.period.plan),
      text: 'Ребёнок заранее делит монеты на нужное, желания и накопления. План не меняется от покупок.',
    },
    {
      label: 'Покупки и платежи',
      done: state.period.fact.foodBought || state.history.length > 0,
      text: 'Покупка списывает монеты сразу и попадает в факт. Так видно, совпали ли траты с планом.',
    },
    {
      label: 'Накопления',
      done: state.wallet.savings > 0 || state.history.some((item) => item.fact.saved > 0),
      text: 'Монеты из кошелька можно отложить в копилку на выбранную цель и при необходимости вернуть.',
    },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>{state.pet.name}</Text>
        <Text style={styles.lead}>Игровой прогресс на этом устройстве. Реальные данные ребёнка не собираются.</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Сейчас</Text>
          <Meter label="Уровень" value={`${state.pet.level} из ${MAX_PET_LEVEL}`} progress={levelProgress} />
          <Meter label="Периоды" value={`${state.history.length} из 5`} progress={periodsProgress} />
          <Meter label="Цели" value={`${state.progress.ownedGoalIds.length} из 3`} progress={goalsProgress} />
          <View style={styles.stageRow}>
            <Text style={styles.stageLabel}>Стадия</Text>
            <Text style={styles.stageValue}>{stageLabel(state.pet.stage)}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Темы</Text>
          <Text style={styles.note}>Нажми на тему, чтобы узнать подробности.</Text>
          {topics.map((topic) => {
            const open = openTopic === topic.label;
            return (
              <Pressable
                key={topic.label}
                accessibilityRole="button"
                accessibilityState={{ expanded: open }}
                onPress={() => setOpenTopic(open ? null : topic.label)}
                style={styles.topicButton}>
                <View style={styles.topicRow}>
                  <View style={[styles.dot, topic.done && styles.dotDone]} />
                  <Text style={styles.topicLabel}>{topic.label}</Text>
                  <Text style={[styles.topicState, topic.done && styles.topicDone]}>{topic.done ? 'есть опыт' : 'в процессе'}</Text>
                </View>
                {open ? <Text style={styles.topicText}>{topic.text}</Text> : null}
              </Pressable>
            );
          })}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>История</Text>
          {state.history.length === 0 ? (
            <Text style={styles.note}>Закрытые периоды появятся здесь.</Text>
          ) : (
            state.history
              .slice()
              .reverse()
              .map((record) => (
                <View key={`${record.index}-${record.goalId}`} style={styles.historyRow}>
                  <Text style={styles.historyTitle}>Период {record.index}</Text>
                  <Text style={styles.note}>Цель: {record.goalName}</Text>
                </View>
              ))
          )}
        </View>

        <View style={styles.dangerCard}>
          <Text style={styles.cardTitle}>Данные профиля</Text>
          <Text style={styles.note}>Сброс удалит локальный профиль, кота и весь игровой прогресс с этого устройства.</Text>
          <PrimaryButton label="Сбросить профиль" tone="danger" onPress={() => setConfirmReset(true)} disabled={resetting} />
        </View>
      </ScrollView>

      <Modal visible={confirmReset} transparent animationType="fade" onRequestClose={() => setConfirmReset(false)}>
        <Pressable style={styles.backdrop} onPress={() => setConfirmReset(false)}>
          <Pressable style={styles.popup} onPress={() => {}}>
            <Text style={styles.popupTitle}>Сбросить профиль?</Text>
            <Text style={styles.lead}>Кот, монеты и прогресс удалятся. Вернуть их нельзя.</Text>
            <PrimaryButton label={resetting ? 'Удаляем…' : 'Сбросить'} tone="danger" onPress={resetProfile} disabled={resetting} />
            <PrimaryButton label="Отменить" tone="quiet" onPress={() => setConfirmReset(false)} disabled={resetting} />
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

function Meter({ label, value, progress }: { label: string; value: string; progress: number }) {
  return (
    <View style={styles.meter}>
      <View style={styles.meterHead}>
        <Text style={styles.meterLabel}>{label}</Text>
        <Text style={styles.meterValue}>{value}</Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${Math.max(progress, 0.04) * 100}%` }]} />
      </View>
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
  gate: { flex: 1, padding: Spacing.four, justifyContent: 'center', gap: Spacing.three },
  kicker: { color: '#C4622D', fontSize: 14, fontWeight: '700', letterSpacing: 0.4, textTransform: 'uppercase' },
  title: { color: '#1F2430', fontSize: 32, fontWeight: '800', lineHeight: 38 },
  lead: { color: '#60646C', fontSize: 16, fontWeight: '500', lineHeight: 22 },
  example: { color: '#C4622D', fontSize: 40, fontWeight: '800', textAlign: 'center' },
  input: {
    alignSelf: 'center',
    width: 160,
    minHeight: 56,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#F0C9A8',
    backgroundColor: '#FFF6EE',
    color: '#1F2430',
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
  },
  error: { color: '#9A3412', fontSize: 15, fontWeight: '600', lineHeight: 20, textAlign: 'center' },
  card: { borderRadius: 18, backgroundColor: '#F7F7F8', padding: Spacing.three, gap: Spacing.three },
  dangerCard: { borderRadius: 18, backgroundColor: '#FFF1F1', padding: Spacing.three, gap: Spacing.two },
  cardTitle: { color: '#1F2430', fontSize: 20, fontWeight: '800' },
  meter: { gap: Spacing.one },
  meterHead: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: Spacing.two },
  meterLabel: { flex: 1, color: '#1F2430', fontSize: 16, fontWeight: '700' },
  meterValue: { flexShrink: 1, color: '#C4622D', fontSize: 16, fontWeight: '800', textAlign: 'right' },
  track: { height: 12, borderRadius: 8, backgroundColor: '#E6E8EC', overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 8, backgroundColor: '#F4A261' },
  stageRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.two },
  stageLabel: { color: '#60646C', fontSize: 15, fontWeight: '600' },
  stageValue: { color: '#1F2430', fontSize: 16, fontWeight: '800' },
  topicButton: { gap: Spacing.two },
  topicRow: { minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  topicText: { color: '#1F2430', fontSize: 15, fontWeight: '500', lineHeight: 21 },
  dot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#D6D8DE' },
  dotDone: { backgroundColor: '#3FA36C' },
  topicLabel: { flex: 1, color: '#1F2430', fontSize: 16, fontWeight: '700' },
  topicState: { color: '#8B909A', fontSize: 14, fontWeight: '600' },
  topicDone: { color: '#2F7A4E' },
  historyRow: { borderTopWidth: 1, borderTopColor: '#E6E8EC', paddingTop: Spacing.two, gap: Spacing.one },
  historyTitle: { color: '#1F2430', fontSize: 17, fontWeight: '800' },
  note: { color: '#60646C', fontSize: 15, fontWeight: '500', lineHeight: 21 },
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
    gap: Spacing.three,
  },
  popupTitle: { color: '#1F2430', fontSize: 24, fontWeight: '800' },
});
