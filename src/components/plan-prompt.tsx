import { router, usePathname } from 'expo-router';
import { useEffect, useState } from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';

import { useGame } from '@/components/game-provider';
import { PrimaryButton } from '@/components/primary-button';
import { Spacing } from '@/constants/theme';

export function PlanPrompt() {
  const { state } = useGame();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const onHome = pathname === '/home' || pathname === '/(tabs)/home';
  const needsPlan = Boolean(state && !state.period.plan);

  useEffect(() => {
    if (needsPlan && onHome) setOpen(true);
    if (!needsPlan) setOpen(false);
  }, [needsPlan, onHome, state?.period.index]);

  const visible = open && onHome;

  if (!state) return null;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.backdrop}>
        <View style={styles.popup}>
          <Text style={styles.badge}>{state.period.index === 1 ? 'Первый шаг' : `Период ${state.period.index}`}</Text>
          <Text style={styles.title}>Составь план</Text>
          <Text style={styles.subtitle}>
            Разложи {state.period.startingBudget} монет: на нужное, на желания и на накопления.
          </Text>
          <PrimaryButton
            label="Составить план"
            onPress={() => {
              setOpen(false);
              router.push('/plan');
            }}
          />
        </View>
      </View>
    </Modal>
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
  subtitle: { color: '#60646C', fontSize: 15, fontWeight: '600', lineHeight: 22 },
});
