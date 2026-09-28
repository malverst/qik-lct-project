import { Redirect, router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useGame } from '@/components/game-provider';
import { PetCard } from '@/components/pet-card';
import { PrimaryButton } from '@/components/primary-button';
import { MAX_PET_LEVEL } from '@/content/pet';
import { reviewPeriod } from '@/domain/period';
import { Spacing } from '@/constants/theme';
import { playSound } from '@/utils/sounds';

type LevelPerk = {
  title: string;
  stageName: string;
  features: string[];
};

const LEVEL_PERKS: Record<number, LevelPerk> = {
  2: {
    title: 'Финни подрос!',
    stageName: 'Подросток',
    features: [
      'Открылась новая категория дел: «Такси»',
      'Более крупные награды за поездки',
      'Финни стал заметно взрослее и сильнее',
    ],
  },
  3: {
    title: 'Финни стал взрослым!',
    stageName: 'Взрослый кот',
    features: [
      'Открылась категория «Сложные дела»',
      'Самые ценные заказы и маршруты',
      'Финни вырос на максимум',
    ],
  },
};

export default function HomeScreen() {
  const { ready, state, clearGame, acknowledgeLevel } = useGame();
  const [confirmReset, setConfirmReset] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [unlockedLevel, setUnlockedLevel] = useState<number | null>(null);
  const [planPrompt, setPlanPrompt] = useState(true);
  const knownLevelRef = useRef<number | null>(null);

  useEffect(() => {
    if (!state) return;
    if (state.pendingLevel !== null) {
      if (knownLevelRef.current !== null && state.pendingLevel > knownLevelRef.current) playSound('reward');
      setUnlockedLevel(state.pendingLevel);
      knownLevelRef.current = state.pet.level;
      return;
    }
    if (knownLevelRef.current === null) {
      knownLevelRef.current = state.pet.level;
      return;
    }
    if (state.pet.level > knownLevelRef.current) {
      playSound('reward');
      setUnlockedLevel(state.pet.level);
      knownLevelRef.current = state.pet.level;
    }
  }, [state?.pendingLevel, state?.pet.level]);

  if (!ready) return null;
  if (!state) return <Redirect href="/onboarding" />;

  async function onReset() {
    if (!confirmReset) {
      setConfirmReset(true);
      return;
    }
    setResetting(true);
    await clearGame();
  }

  const guideShop = Boolean(state.period.index === 1 && state.period.plan && !state.period.fact.foodBought);
  const plan = state.period.plan;
  const levelPerk = unlockedLevel ? LEVEL_PERKS[unlockedLevel] : null;
  const petText = (text: string) => text.split('Финни').join(state.pet.name);
  const canPet = state.purchasedItemIds.includes('care-brush');
  const showPlanPrompt = !plan && planPrompt;

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <PetCard pet={state.pet} canPet={canPet} />

        <View style={styles.levelCard}>
          <View style={styles.levelHead}>
            <Text style={styles.cardTitle}>Уровень {state.pet.level}</Text>
            <Text style={styles.levelStage}>{stageLabel(state.pet.stage)}</Text>
          </View>
          <View style={styles.levelTrack}>
            <View style={[styles.levelFill, { width: `${Math.min(state.pet.level / MAX_PET_LEVEL, 1) * 100}%` }]} />
          </View>
        </View>

        {plan && reviewPeriod(state)?.canClose ? (
          <PrimaryButton label="Посмотреть итоги" onPress={() => router.push('/review')} />
        ) : null}

        <View style={styles.serviceBox}>
          <Text style={styles.serviceTitle}>Служебная информация</Text>
          <Text style={styles.serviceText}>Игровой период: {state.period.index}</Text>
          {state.profile.isDemo ? <Text style={styles.serviceText}>Демо-профиль: можно пройти 5 периодов без ожидания.</Text> : null}
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/adult')}
            style={({ pressed }) => [styles.serviceButton, pressed && styles.serviceButtonPressed]}>
            <Text style={styles.serviceButtonText}>Раздел взрослого</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={onReset}
            disabled={resetting}
            style={({ pressed }) => [styles.serviceButton, pressed && styles.serviceButtonPressed]}>
            <Text style={styles.serviceButtonText}>
              {resetting ? 'Сбрасываем…' : confirmReset ? 'Точно начать заново' : 'Начать заново'}
            </Text>
          </Pressable>
          {confirmReset ? (
            <Text style={styles.serviceWarning}>Профиль и кот удалятся с этого устройства. Прогресс сбросится.</Text>
          ) : null}
        </View>
      </ScrollView>

      <Modal visible={showPlanPrompt} transparent animationType="fade" onRequestClose={() => setPlanPrompt(false)}>
        <Pressable style={styles.backdrop} onPress={() => setPlanPrompt(false)}>
          <Pressable style={styles.popup} onPress={() => {}}>
            <Text style={styles.popupBadge}>Первый шаг</Text>
            <Text style={styles.popupTitle}>Составь план</Text>
            <Text style={styles.popupSubtitle}>
              Разложи {state.period.startingBudget} монет: на нужное, на желания и на накопления.
            </Text>
            <PrimaryButton
              label="Составить план"
              onPress={() => {
                setPlanPrompt(false);
                router.push('/plan');
              }}
            />
            <PrimaryButton label="Позже" tone="quiet" onPress={() => setPlanPrompt(false)} />
          </Pressable>
        </Pressable>
      </Modal>

      <Modal visible={unlockedLevel != null} transparent animationType="fade" onRequestClose={() => setUnlockedLevel(null)}>
        <Pressable style={styles.backdrop} onPress={() => setUnlockedLevel(null)}>
          <Pressable style={styles.popup} onPress={() => {}}>
            <Text style={styles.popupBadge}>🎉 Новый уровень</Text>
            <Text style={styles.popupTitle}>{levelPerk ? petText(levelPerk.title) : `Уровень ${unlockedLevel}`}</Text>
            <Text style={styles.popupSubtitle}>Стадия роста: {levelPerk?.stageName ?? ''}</Text>
            <View style={styles.perksList}>
              {levelPerk?.features.map((feature) => (
                <Text key={feature} style={styles.perkItem}>
                  • {petText(feature)}
                </Text>
              ))}
            </View>
            <PrimaryButton
              label="Отлично!"
              onPress={async () => {
                setUnlockedLevel(null);
                await acknowledgeLevel();
              }}
            />
          </Pressable>
        </Pressable>
      </Modal>

      {guideShop ? (
        <>
          <View pointerEvents="none" style={styles.guideShade} />
          <View pointerEvents="none" style={styles.guideBubble}>
            <Text style={styles.guideText}>Нажми «Покупки» внизу</Text>
          </View>
        </>
      ) : null}
    </SafeAreaView>
  );
}

function stageLabel(stage: 'kitten' | 'teen' | 'adult'): string {
  if (stage === 'adult') return 'Взрослый';
  if (stage === 'teen') return 'Подросток';
  return 'Малыш';
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    padding: Spacing.four,
    gap: Spacing.four,
    paddingBottom: Spacing.six,
  },
  card: {
    borderRadius: 18,
    backgroundColor: '#F7F7F8',
    padding: Spacing.three,
    gap: Spacing.two,
  },
  levelCard: {
    borderRadius: 18,
    backgroundColor: 'transparent',
    paddingHorizontal: Spacing.one,
    paddingVertical: Spacing.two,
    gap: Spacing.two,
  },
  levelHead: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: Spacing.two },
  levelStage: { flexShrink: 1, color: '#C4622D', fontSize: 16, fontWeight: '700', textAlign: 'right' },
  levelTrack: { height: 16, borderRadius: 8, backgroundColor: '#F0D9C4', overflow: 'hidden' },
  levelFill: { height: '100%', borderRadius: 8, backgroundColor: '#F4A261' },
  cardTitle: {
    flexShrink: 1,
    color: '#1F2430',
    fontSize: 18,
    fontWeight: '800',
  },
  cardText: {
    color: '#1F2430',
    fontSize: 16,
    lineHeight: 22,
  },
  planRows: { gap: Spacing.two },
  planRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  planLabel: { color: '#1F2430', fontSize: 16, fontWeight: '600' },
  planCost: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  coinIcon: { fontSize: 16 },
  planValue: { color: '#C4622D', fontSize: 17, fontWeight: '700' },
  serviceBox: {
    marginTop: Spacing.two,
    paddingTop: Spacing.three,
    borderTopWidth: 1,
    borderTopColor: '#EBECEF',
    gap: Spacing.two,
  },
  serviceTitle: { color: '#8B909A', fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  serviceText: { color: '#8B909A', fontSize: 14 },
  serviceButton: {
    alignSelf: 'flex-start',
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.two,
    borderRadius: 10,
    backgroundColor: '#F5F5F7',
  },
  serviceButtonPressed: { opacity: 0.7 },
  serviceButtonText: { color: '#8B909A', fontSize: 13, fontWeight: '600' },
  serviceWarning: { color: '#B45309', fontSize: 12, lineHeight: 16 },
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
  popupBadge: { color: '#C4622D', fontSize: 14, fontWeight: '700', textTransform: 'uppercase' },
  popupTitle: { color: '#1F2430', fontSize: 22, fontWeight: '700' },
  popupSubtitle: { color: '#60646C', fontSize: 15, fontWeight: '600' },
  perksList: { gap: 6, marginVertical: Spacing.one },
  perkItem: { color: '#1F2430', fontSize: 15, lineHeight: 21 },
  note: {
    color: '#60646C',
    fontSize: 16,
    lineHeight: 22,
  },
  guideShade: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(31, 36, 48, 0.55)',
  },
  guideBubble: {
    position: 'absolute',
    right: Spacing.four,
    bottom: Spacing.three,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: Spacing.three,
  },
  guideText: {
    color: '#1F2430',
    fontSize: 16,
    fontWeight: '700',
  },
});
