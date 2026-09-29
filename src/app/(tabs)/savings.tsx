import { Image } from 'expo-image';
import { Redirect, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PlanSlider } from '@/components/plan-slider';
import { useGame } from '@/components/game-provider';
import { PrimaryButton } from '@/components/primary-button';
import { GOALS, findGoal, openGoals, type SavingsGoal } from '@/content/goals';
import { reviewPeriod } from '@/domain/period';
import { Spacing } from '@/constants/theme';
import { playSound } from '@/utils/sounds';

const PIGGY_IMAGE = require('../../../assets/images/kopilka-pig.png');

export default function SavingsScreen() {
  const { ready, state, pickGoal, putInSavings, takeFromSavings, buyCurrentGoal, markSavingsIntroSeen } = useGame();
  const [draftGoalId, setDraftGoalId] = useState<string | null>(null);
  const [introOpen, setIntroOpen] = useState(false);
  const [goalsOpen, setGoalsOpen] = useState(false);
  const [saveOpen, setSaveOpen] = useState(false);
  const [takeOpen, setTakeOpen] = useState(false);
  const [saveAmount, setSaveAmount] = useState(0);
  const [takeAmount, setTakeAmount] = useState(0);
  const [confirmTake, setConfirmTake] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [goalReady, setGoalReady] = useState(false);

  useEffect(() => {
    if (!state || state.savingsIntroSeen || state.currentGoalId) return;
    setIntroOpen(true);
  }, [state]);

  const goal = state ? findGoal(state.currentGoalId) : null;
  const saved = state?.wallet.savings ?? 0;
  const funded = Boolean(goal && saved >= goal.cost && !state?.progress.ownedGoalIds.includes(goal.id));

  useEffect(() => {
    if (funded) setGoalReady(true);
  }, [funded, goal?.id]);

  if (!ready) return null;
  if (!state) return <Redirect href="/onboarding" />;
  if (!state.period.plan) return <Redirect href="/plan" />;

  const left = goal ? Math.max(goal.cost - saved, 0) : 0;
  const canSave = goal ? Math.min(state.wallet.coins, left) : 0;
  const progress = goal && goal.cost > 0 ? Math.min(saved / goal.cost, 1) : 0;
  const taking = Math.min(takeAmount, saved);

  const normalGoals = openGoals(state.progress.ownedGoalIds);
  const availableGoals = state.profile.isDemo && normalGoals.length === 0 ? GOALS : normalGoals;

  function showGoalPicker() {
    setDraftGoalId(state?.currentGoalId ?? availableGoals[0]?.id ?? null);
    setGoalsOpen(true);
  }

  function openSave() {
    setSaveAmount(0);
    setMessage(null);
    setSaveOpen(true);
  }

  function openTake() {
    setTakeAmount(0);
    setConfirmTake(false);
    setMessage(null);
    setTakeOpen(true);
  }

  async function onChooseGoal() {
    if (!draftGoalId) return;
    setBusy(true);
    const error = await pickGoal(draftGoalId);
    setBusy(false);
    if (error) {
      setMessage(error);
      return;
    }
    setGoalsOpen(false);
    setMessage(null);
  }

  async function onBuyGoal() {
    setBusy(true);
    const error = await buyCurrentGoal();
    setBusy(false);
    if (error) {
      playSound('error');
      setMessage(error);
      return;
    }
    playSound('buy');
    setGoalReady(false);
    setMessage(null);
  }

  async function onSave() {
    setBusy(true);
    const error = await putInSavings(saveAmount);
    setBusy(false);
    if (error) {
      playSound('error');
      setMessage(error);
      return;
    }
    playSound('coin');
    setSaveOpen(false);
    setMessage(null);
    setSaveAmount(0);
    if (
      state &&
      reviewPeriod({
        ...state,
        period: {
          ...state.period,
          fact: { ...state.period.fact, saved: state.period.fact.saved + saveAmount },
        },
      })?.canClose
    ) {
      router.push('/review');
    }
  }

  async function onTake() {
    if (!confirmTake) {
      setConfirmTake(true);
      return;
    }
    setBusy(true);
    const error = await takeFromSavings(taking);
    setBusy(false);
    setConfirmTake(false);
    if (error) {
      playSound('error');
      setMessage(error);
      return;
    }
    playSound('coin');
    setTakeOpen(false);
    setMessage(null);
    setTakeAmount(0);
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.pictureWrap}>
          <View style={styles.picture}>
            {PIGGY_IMAGE != null ? (
              <Image source={PIGGY_IMAGE} style={styles.pictureImage} contentFit="contain" />
            ) : null}
          </View>
          <View style={styles.piggyCoins}>
            <Text style={styles.piggyValue}>{saved}</Text>
            <Text style={styles.coinIcon}>🪙</Text>
          </View>
        </View>

        {!goal ? (
          <>
            <Text style={styles.lead}>Сначала выбери, на что копим.</Text>
            <PrimaryButton label="Выбрать цель" onPress={showGoalPicker} />
          </>
        ) : (
          <>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Нажми на цель, чтобы изменить её"
              onPress={showGoalPicker}
              style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
              <View style={styles.goalRow}>
                <View style={styles.goalPhoto}>
                  {goal.image != null ? (
                    <Image source={goal.image} style={styles.goalPhotoImage} contentFit="contain" />
                  ) : null}
                </View>
                <View style={styles.goalBody}>
                  <Text style={styles.cardTitle}>{goal.name}</Text>
                  <View style={styles.priceTag}>
                    <Text style={styles.priceValue}>{goal.cost}</Text>
                    <Text style={styles.priceCoin}>🪙</Text>
                  </View>
                </View>
              </View>
              <View style={styles.bar}>
                <View style={[styles.fill, { width: `${progress * 100}%` }]} />
              </View>

            </Pressable>

            <View style={styles.row}>
              <View style={styles.rowButton}>
                <PrimaryButton label="Положить" onPress={openSave} disabled={left === 0} />
              </View>
              <View style={styles.rowButton}>
                <PrimaryButton label="Достать" tone="quiet" onPress={openTake} disabled={saved === 0} />
              </View>
            </View>
            {funded ? <PrimaryButton label="Купить" onPress={onBuyGoal} disabled={busy} /> : null}
          </>
        )}


      </ScrollView>

      <Modal visible={goalReady && funded} transparent animationType="fade">
        <View style={styles.backdrop}>
          <View style={styles.popup}>
            <Text style={styles.popupTitle}>Цель накоплена</Text>
            <Text style={styles.cardText}>
              В копилке хватает на «{goal?.name}». Можно купить её сейчас или оставить монеты и купить позже.
            </Text>
            <PrimaryButton label={busy ? 'Покупаем…' : 'Купить'} onPress={onBuyGoal} disabled={busy} />
            <PrimaryButton label="Позже" tone="quiet" onPress={() => setGoalReady(false)} />
          </View>
        </View>
      </Modal>

      <Modal
        visible={introOpen}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setIntroOpen(false);
        }}>
        <Pressable style={styles.backdrop}>
          <Pressable style={styles.popup} onPress={() => {}}>
            <Image source={PIGGY_IMAGE} style={styles.introImage} contentFit="contain" />
            <Text style={styles.popupTitle}>Это копилка</Text>
            <Text style={styles.cardText}>
              Сюда можно откладывать монеты на большую цель. Они не тратятся сразу и копятся, пока цели не хватит.
            </Text>
            <PrimaryButton
              label="Выбрать цель"
              onPress={async () => {
                await markSavingsIntroSeen();
                setIntroOpen(false);
                showGoalPicker();
              }}
            />
          </Pressable>
        </Pressable>
      </Modal>

      <Modal visible={goalsOpen} transparent animationType="fade" onRequestClose={() => setGoalsOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setGoalsOpen(false)}>
          <Pressable style={styles.popup} onPress={() => {}}>
            <Text style={styles.popupTitle}>{goal ? 'Другая цель' : 'Выбери цель'}</Text>
            <ScrollView style={styles.popupList} contentContainerStyle={styles.popupListContent}>
              {availableGoals.map((item) => {
                const selected = item.id === draftGoalId;
                const tooSmall = saved > item.cost;
                return (
                  <Pressable
                    key={item.id}
                    accessibilityRole="button"
                    accessibilityState={{ selected, disabled: tooSmall }}
                    disabled={tooSmall}
                    onPress={() => setDraftGoalId(item.id)}
                    style={[styles.card, selected && styles.goalOn, tooSmall && styles.goalOff]}>
                    <GoalChoice item={item} note={tooSmall ? 'В копилке уже больше, чем стоит эта цель.' : item.description} />
                  </Pressable>
                );
              })}
            </ScrollView>
            <PrimaryButton label={busy ? 'Сохраняем…' : 'Выбрать'} onPress={onChooseGoal} disabled={busy || !draftGoalId} />
            <PrimaryButton label="Закрыть" tone="quiet" onPress={() => setGoalsOpen(false)} />
          </Pressable>
        </Pressable>
      </Modal>

      <Modal visible={saveOpen} transparent animationType="fade" onRequestClose={() => setSaveOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setSaveOpen(false)}>
          <Pressable style={styles.popup} onPress={() => {}}>
            <Text style={styles.popupTitle}>Положить</Text>
            <Text style={styles.cardText}>
              {canSave === 0 ? 'Свободных монет нет.' : `Можно отложить до ${canSave}.`}
            </Text>
            <PlanSlider
              label="Сколько"
              hint="Монеты уйдут с баланса в копилку."
              value={Math.min(saveAmount, canSave)}
              max={Math.max(canSave, 1)}
              limit={canSave}
              color="#3FA36C"
              onChange={setSaveAmount}
            />
            {message && saveOpen ? <Text style={styles.error}>{message}</Text> : null}
            <PrimaryButton
              label={busy ? 'Сохраняем…' : 'Положить'}
              onPress={onSave}
              disabled={busy || saveAmount <= 0 || canSave === 0}
            />
            <PrimaryButton label="Закрыть" tone="quiet" onPress={() => setSaveOpen(false)} />
          </Pressable>
        </Pressable>
      </Modal>

      <Modal visible={takeOpen} transparent animationType="fade" onRequestClose={() => setTakeOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setTakeOpen(false)}>
          <Pressable style={styles.popup} onPress={() => {}}>
            <Text style={styles.popupTitle}>Достать</Text>
            <Text style={styles.cardText}>В копилке {saved}. Если забрать, до цели станет дальше.</Text>
            <PlanSlider
              label="Сколько"
              hint="Монеты вернутся, цель не купится сама."
              value={taking}
              max={Math.max(saved, 1)}
              limit={saved}
              color="#C4622D"
              onChange={(value) => {
                setTakeAmount(value);
                setConfirmTake(false);
              }}
            />
            {confirmTake ? (
              <Text style={styles.cardText}>
                Забрать {taking}? В копилке останется {saved - taking}.
              </Text>
            ) : null}
            {message && takeOpen ? <Text style={styles.error}>{message}</Text> : null}
            <PrimaryButton
              label={busy ? 'Сохраняем…' : confirmTake ? `Точно достать ${taking}` : 'Достать'}
              onPress={onTake}
              disabled={busy || taking <= 0}
            />
            <PrimaryButton label="Закрыть" tone="quiet" onPress={() => setTakeOpen(false)} />
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

function GoalChoice({ item, note }: { item: SavingsGoal; note?: string }) {
  return (
    <View style={styles.choice}>
      <View style={styles.goalRow}>
        <View style={styles.goalPhoto}>
          {item.image != null ? <Image source={item.image} style={styles.goalPhotoImage} contentFit="contain" /> : null}
        </View>
        <View style={styles.goalBody}>
          <Text style={styles.cardTitle}>{item.name}</Text>
          <View style={styles.priceTag}>
            <Text style={styles.priceValue}>{item.cost}</Text>
            <Text style={styles.priceCoin}>🪙</Text>
          </View>
        </View>
      </View>
      {note ? <Text style={styles.goalText}>{note}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  choice: { gap: Spacing.two },
  safe: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { padding: Spacing.four, gap: Spacing.three, paddingBottom: Spacing.six },
  pictureWrap: { gap: Spacing.two },
  picture: {
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pictureImage: { width: '100%', height: '100%' },
  piggyCoins: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
  },
  piggyValue: { color: '#1F2430', fontSize: 32, fontWeight: '700' },
  coinIcon: { fontSize: 28, lineHeight: 34 },
  sectionHead: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  sectionIcon: { fontSize: 22, lineHeight: 28 },
  sectionTitle: { color: '#1F2430', fontSize: 20, fontWeight: '700' },
  goalRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  goalPhoto: {
    width: 72,
    height: 72,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
  },
  goalPhotoImage: { width: '100%', height: '100%' },
  goalBody: { flex: 1, gap: Spacing.two },
  priceTag: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    backgroundColor: '#FFF6EE',
    borderWidth: 1.5,
    borderColor: '#F4A261',
    borderRadius: 14,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
  },
  priceValue: { color: '#C4622D', fontSize: 18, fontWeight: '700' },
  priceCoin: { fontSize: 16, lineHeight: 20 },
  hint: { color: '#8B909A', fontSize: 14, lineHeight: 20 },
  hintIcon: { color: '#8B909A', fontSize: 14 },
  lead: { color: '#1F2430', fontSize: 18, lineHeight: 26 },
  goal: {
    borderRadius: 18,
    backgroundColor: '#F7F7F8',
    padding: Spacing.three,
    gap: Spacing.one,
  },
  goalOn: { borderWidth: 2, borderColor: '#3FA36C', backgroundColor: '#F3FBF6' },
  goalOff: { opacity: 0.5 },
  pressed: { opacity: 0.8 },
  goalHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.two },
  goalName: { flex: 1, color: '#1F2430', fontSize: 18, fontWeight: '700' },
  goalCost: { color: '#1F2430', fontSize: 18, fontWeight: '700' },
  goalText: { color: '#60646C', fontSize: 16, lineHeight: 22 },
  card: {
    borderRadius: 18,
    backgroundColor: '#F7F7F8',
    padding: Spacing.three,
    gap: Spacing.two,
  },
  cardTitle: { color: '#1F2430', fontSize: 18, fontWeight: '700' },
  cardText: { color: '#1F2430', fontSize: 16, lineHeight: 22 },
  bar: { height: 14, borderRadius: 8, backgroundColor: '#E6E8EC', overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: '#3FA36C' },
  row: { flexDirection: 'row', gap: Spacing.two },
  rowButton: { flex: 1 },
  note: { color: '#60646C', fontSize: 16, lineHeight: 22 },
  error: { color: '#9A3412', fontSize: 16, lineHeight: 22 },
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
    maxHeight: '90%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: Spacing.four,
    gap: Spacing.three,
  },
  popupTitle: { color: '#1F2430', fontSize: 22, fontWeight: '800' },
  introImage: { width: '100%', height: 140 },
  popupList: { flexGrow: 0 },
  popupListContent: { gap: Spacing.two },
});
