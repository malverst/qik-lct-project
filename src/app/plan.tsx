import { Redirect, router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BudgetDonut, PLAN_COLORS } from '@/components/budget-donut';
import { useGame } from '@/components/game-provider';
import { PlanSlider } from '@/components/plan-slider';
import { PrimaryButton } from '@/components/primary-button';
import { validatePlan } from '@/domain/budget';
import { Spacing } from '@/constants/theme';
import type { BudgetPlan } from '@/types/game';

const EMPTY_PLAN: BudgetPlan = { mandatory: 0, optional: 0, savings: 0 };

export default function PlanScreen() {
  const { ready, state, lockPlan } = useGame();
  const [plan, setPlan] = useState<BudgetPlan>(EMPTY_PLAN);
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [budgetHelp, setBudgetHelp] = useState(false);
  const [leftoverWarning, setLeftoverWarning] = useState(false);

  const budget = state?.period.startingBudget ?? 0;
  const checked = useMemo(() => validatePlan(plan, budget), [budget, plan]);

  if (!ready) return null;
  if (!state) return <Redirect href="/onboarding" />;
  if (state.period.plan) return <Redirect href="/home" />;

  function change(key: keyof BudgetPlan, value: number) {
    setPlan((current) => ({ ...current, [key]: value }));
    setMessage(null);
  }

  async function onConfirm() {
    if (!checked.ok || checked.left > 0) {
      setLeftoverWarning(true);
      return;
    }

    setSaving(true);
    const error = await lockPlan(plan);
    setSaving(false);
    if (error) {
      setMessage(error);
      return;
    }
    router.replace('/home');
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.lead}>
          Распредели свой{' '}
          <Text style={styles.budgetWord} onPress={() => setBudgetHelp(true)}>
            бюджет
            <Text style={styles.infoMark}> ⓘ</Text>
          </Text>
          . Двигай ползунки — круг покажет результат.
        </Text>

        <Modal visible={budgetHelp} transparent animationType="fade" onRequestClose={() => setBudgetHelp(false)}>
          <Pressable style={styles.backdrop} onPress={() => setBudgetHelp(false)}>
            <Pressable style={styles.popup} onPress={() => {}}>
              <Text style={styles.popupTitle}>Бюджет</Text>
              <Text style={styles.popupText}>
                Бюджет — это все монеты, которые есть сейчас. Их нужно заранее разложить: на нужное, на желания и на накопления.
              </Text>
              <PrimaryButton label="Понятно" onPress={() => setBudgetHelp(false)} />
            </Pressable>
          </Pressable>
        </Modal>

        <BudgetDonut plan={plan} budget={budget} />

        <PlanSlider
          label="Нужное"
          hint="Еда и уход за котом"
          color={PLAN_COLORS.mandatory}
          value={plan.mandatory}
          max={budget}
          limit={budget - plan.optional - plan.savings}
          onChange={(value) => change('mandatory', value)}
        />
        <PlanSlider
          label="Желания"
          hint="Одежда, игрушки и развлечения"
          color={PLAN_COLORS.optional}
          value={plan.optional}
          max={budget}
          limit={budget - plan.mandatory - plan.savings}
          onChange={(value) => change('optional', value)}
        />
        <PlanSlider
          label="Накопления"
          hint="Монеты на будущую цель"
          color={PLAN_COLORS.savings}
          value={plan.savings}
          max={budget}
          limit={budget - plan.mandatory - plan.optional}
          onChange={(value) => change('savings', value)}
        />

        {message ? <Text style={styles.error}>{message}</Text> : null}
        <PrimaryButton label={saving ? 'Сохраняем…' : 'Готово'} onPress={onConfirm} disabled={saving} />

        <Modal
          visible={leftoverWarning}
          transparent
          animationType="fade"
          onRequestClose={() => setLeftoverWarning(false)}>
          <Pressable style={styles.backdrop} onPress={() => setLeftoverWarning(false)}>
            <Pressable style={styles.popup} onPress={() => {}}>
              <Text style={styles.popupTitle}>Не все монеты разложены</Text>
              <Text style={styles.popupText}>
                {checked.ok
                  ? `Свободно ещё ${checked.left}. Разложи их по ползункам, и тогда план можно сохранить.`
                  : checked.message}
              </Text>
              <PrimaryButton label="Понятно" onPress={() => setLeftoverWarning(false)} />
            </Pressable>
          </Pressable>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    padding: Spacing.four,
    gap: Spacing.three,
    paddingBottom: Spacing.six,
  },
  lead: {
    color: '#1F2430',
    fontSize: 18,
    lineHeight: 28,
  },
  budgetWord: {
    color: '#C4622D',
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  infoMark: {
    color: '#C4622D',
    fontWeight: '700',
  },
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
  popupTitle: {
    color: '#1F2430',
    fontSize: 22,
    fontWeight: '700',
  },
  popupText: {
    color: '#1F2430',
    fontSize: 16,
    lineHeight: 24,
  },
  error: {
    color: '#9A3412',
    fontSize: 16,
    lineHeight: 22,
  },
});
