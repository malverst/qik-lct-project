import { Redirect, router } from 'expo-router';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useGame } from '@/components/game-provider';
import { PetCard } from '@/components/pet-card';
import { PlanPrompt } from '@/components/plan-prompt';
import { PetOutfit } from '@/components/pet-outfit';
import { PrimaryButton } from '@/components/primary-button';
import { HAT_OPTIONS, MAX_PET_LEVEL, SHIRT_OPTIONS, TRINKET_OPTIONS, type AccessoryOption } from '@/content/pet';
import type { PetCustomization } from '@/types/game';
import { Spacing } from '@/constants/theme';

export default function HomeScreen() {
  const { ready, state, clearGame, wearOutfit } = useGame();
  const [confirmReset, setConfirmReset] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [wardrobeOpen, setWardrobeOpen] = useState(false);
  const [draft, setDraft] = useState<PetCustomization | null>(null);
  const [applying, setApplying] = useState(false);

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
  const canPet = state.purchasedItemIds.includes('care-brush');

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <PetCard
          pet={state.pet}
          canPet={canPet}
          ownedGoalIds={state.progress.ownedGoalIds}
          onWardrobe={() => {
            setDraft(state.pet.customization);
            setWardrobeOpen(true);
          }}
        />

        <View style={styles.levelCard}>
          <View style={styles.levelHead}>
            <Text style={styles.cardTitle}>Уровень {state.pet.level}</Text>
            <Text style={styles.levelStage}>{stageLabel(state.pet.stage)}</Text>
          </View>
          <View style={styles.levelTrack}>
            <View style={[styles.levelFill, { width: `${Math.min(state.pet.level / MAX_PET_LEVEL, 1) * 100}%` }]} />
          </View>
        </View>

        {plan ? (
          <View style={styles.spendCard}>
            <Text style={styles.planHeading}>План периода {state.period.index}</Text>
            <SpendRow icon="🍎" actual={state.period.fact.mandatorySpent} planned={plan.mandatory} label="Нужное" color="#E07A3D" />
            <SpendRow icon="🎮" actual={state.period.fact.optionalSpent} planned={plan.optional} label="Желания" color="#5B8DEF" />
            <SpendRow icon="🏦" actual={state.period.fact.saved} planned={plan.savings} label="Накопления" color="#3FA36C" />
          </View>
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

      <PlanPrompt />

      <Modal
        visible={wardrobeOpen && draft != null}
        transparent
        animationType="fade"
        onRequestClose={() => setWardrobeOpen(false)}>
        <View style={styles.backdrop}>
          <View style={styles.popup}>
            <Text style={styles.popupTitle}>Гардероб</Text>
            <View style={styles.wardrobeStage}>
              {draft ? <PetOutfit customization={draft} size={240} /> : null}
              <WardrobeArrow
                title="Шляпки"
                place="hat"
                options={HAT_OPTIONS}
                selected={draft?.hatId ?? 'none'}
                owned={state.purchasedItemIds}
                disabled={applying}
                onChange={(id) => setDraft((current) => (current ? { ...current, hatId: id } : current))}
              />
              <WardrobeArrow
                title="Аксессуары"
                place="trinket"
                options={TRINKET_OPTIONS}
                selected={draft?.trinketId ?? 'none'}
                owned={state.purchasedItemIds}
                disabled={applying}
                onChange={(id) => setDraft((current) => (current ? { ...current, trinketId: id } : current))}
              />
              <WardrobeArrow
                title="Кофточки"
                place="shirt"
                options={SHIRT_OPTIONS}
                selected={draft?.shirtId ?? 'none'}
                owned={state.purchasedItemIds}
                disabled={applying}
                onChange={(id) => setDraft((current) => (current ? { ...current, shirtId: id } : current))}
              />
            </View>
            <PrimaryButton
              label={applying ? 'Надеваем…' : 'Применить'}
              disabled={applying || draft == null}
              onPress={async () => {
                if (!draft) return;
                setApplying(true);
                const error = await wearOutfit({
                  hatId: draft.hatId,
                  trinketId: draft.trinketId,
                  shirtId: draft.shirtId,
                });
                setApplying(false);
                if (!error) setWardrobeOpen(false);
              }}
            />
          </View>
        </View>
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

function WardrobeArrow({
  title,
  place,
  options,
  selected,
  owned,
  disabled,
  onChange,
}: {
  title: string;
  place: 'hat' | 'trinket' | 'shirt';
  options: AccessoryOption[];
  selected: string;
  owned: string[];
  disabled: boolean;
  onChange: (id: string) => void;
}) {
  const available = options.filter((item) => item.id === 'none' || owned.includes(item.id));
  const index = Math.max(
    0,
    available.findIndex((item) => item.id === selected),
  );
  const current = available[index] ?? available[0];

  function step(direction: -1 | 1) {
    if (available.length === 0) return;
    const next = (index + direction + available.length) % available.length;
    onChange(available[next].id);
  }

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${title}: назад. Сейчас ${current.label}`}
        disabled={disabled || available.length < 2}
        onPress={() => step(-1)}
        style={({ pressed }) => [styles.arrow, styles.arrowLeft, styles[place], pressed && styles.serviceButtonPressed]}>
        <Text style={styles.arrowText}>‹</Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${title}: вперёд. Сейчас ${current.label}`}
        disabled={disabled || available.length < 2}
        onPress={() => step(1)}
        style={({ pressed }) => [styles.arrow, styles.arrowRight, styles[place], pressed && styles.serviceButtonPressed]}>
        <Text style={styles.arrowText}>›</Text>
      </Pressable>
    </>
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
    <View style={styles.spendRow} accessibilityLabel={`${label}: ${actual} из ${planned}`}>
      <View style={styles.spendHead}>
        <Text style={styles.spendIcon}>{icon}</Text>
        <Text style={styles.spendLabel}>{label}</Text>
        <Text style={styles.spendValue}>
          {actual}/{planned}
        </Text>
      </View>
      <View style={styles.spendTrack}>
        <View style={[styles.spendFill, { width: `${progress * 100}%`, backgroundColor: color }]} />
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
  spendCard: {
    borderRadius: 18,
    backgroundColor: '#FFF8F3',
    padding: Spacing.three,
    gap: Spacing.two,
  },
  planHeading: { color: '#1F2430', fontSize: 20, fontWeight: '800' },
  spendRow: { gap: Spacing.one },
  spendHead: { minHeight: 36, flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  spendIcon: { fontSize: 24, width: 32, textAlign: 'center' },
  spendLabel: { flex: 1, color: '#1F2430', fontSize: 17, fontWeight: '700' },
  spendValue: { color: '#1F2430', fontSize: 20, fontWeight: '800' },
  spendTrack: { height: 16, borderRadius: 8, backgroundColor: '#F0E4D8', overflow: 'hidden' },
  spendFill: { height: '100%', borderRadius: 8 },
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
  summary: { gap: Spacing.one },
  summaryLine: { color: '#1F2430', fontSize: 22, fontWeight: '800' },
  wardrobeStage: {
    height: 240,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrow: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFF6EE',
    borderWidth: 1.5,
    borderColor: '#F4A261',
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowLeft: { left: 0 },
  arrowRight: { right: 0 },
  hat: { top: 8 },
  trinket: { top: 98 },
  shirt: { top: 168 },
  arrowText: { color: '#C4622D', fontSize: 28, lineHeight: 32, fontWeight: '700' },
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
