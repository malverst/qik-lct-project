import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { useGame } from '@/components/game-provider';
import { PrimaryButton } from '@/components/primary-button';
import { Spacing } from '@/constants/theme';

type StatusInfo = {
  icon: string;
  label: string;
  value: number;
  text: string;
};

export function StatusBar() {
  const { state } = useGame();
  const [help, setHelp] = useState<StatusInfo | null>(null);
  if (!state) return null;

  return (
    <>
      <View style={styles.bar}>
        <StatusChip
          icon="🪙"
          value={state.wallet.coins}
          label="Монеты"
          onPress={() =>
            setHelp({
              icon: '🪙',
              label: 'Монеты',
              value: state.wallet.coins,
              text: 'Монеты — это игровые деньги. Ими платят за еду, желания и откладывают на цель. Настоящих денег здесь нет.',
            })
          }
        />
        <StatusChip
          icon="⚡"
          value={state.pet.energy}
          label="Энергия"
          onPress={() =>
            setHelp({
              icon: '⚡',
              label: 'Энергия',
              value: state.pet.energy,
              text: 'Энергия показывает, сколько дел кот ещё может сделать сейчас. Когда она кончится, коту нужно отдохнуть.',
            })
          }
        />
      </View>
      <Modal visible={help != null} transparent animationType="fade" onRequestClose={() => setHelp(null)}>
        <Pressable style={styles.backdrop} onPress={() => setHelp(null)}>
          <Pressable style={styles.popup} onPress={() => {}}>
            {help ? (
              <>
                <Text style={styles.popupIcon}>{help.icon}</Text>
                <Text style={styles.popupTitle}>{help.label}</Text>
                <Text style={styles.popupValue}>{help.value}</Text>
                <Text style={styles.popupText}>{help.text}</Text>
              </>
            ) : null}
            <PrimaryButton label="Понятно" onPress={() => setHelp(null)} />
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

function StatusChip({
  icon,
  value,
  label,
  onPress,
}: {
  icon: string;
  value: number;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${label}: ${value}`}
      onPress={onPress}
      style={({ pressed }) => [styles.chip, pressed && styles.pressed]}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.value}>{value}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', alignItems: 'center', gap: Spacing.one, marginRight: Spacing.two },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    minHeight: 42,
    backgroundColor: '#FFF6EE',
    borderWidth: 1.5,
    borderColor: '#F0C9A8',
    borderRadius: 24,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
  },
  pressed: { opacity: 0.75 },
  icon: { fontSize: 17, lineHeight: 21 },
  value: { color: '#1F2430', fontSize: 16, fontWeight: '800' },
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
    gap: Spacing.two,
    alignItems: 'center',
  },
  popupIcon: { fontSize: 48, lineHeight: 56 },
  popupTitle: { color: '#1F2430', fontSize: 22, fontWeight: '700' },
  popupValue: { color: '#C4622D', fontSize: 32, fontWeight: '700' },
  popupText: { color: '#1F2430', fontSize: 16, lineHeight: 24, textAlign: 'center' },
});
