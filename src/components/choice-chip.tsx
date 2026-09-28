import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Spacing } from '@/constants/theme';

type ChoiceChipProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
  emoji?: string;
  swatch?: string;
};

export function ChoiceChip({ label, selected, onPress, emoji, swatch }: ChoiceChipProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [styles.chip, selected && styles.selected, pressed && styles.pressed]}>
      {swatch ? <View style={[styles.swatch, { backgroundColor: swatch }]} /> : null}
      {emoji ? <Text style={styles.emoji}>{emoji}</Text> : null}
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    minHeight: 48,
    minWidth: 108,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E0E1E6',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  selected: {
    borderColor: '#F4A261',
    backgroundColor: '#FFF6EE',
  },
  pressed: {
    opacity: 0.8,
  },
  swatch: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: '#D0D3DA',
  },
  emoji: {
    fontSize: 18,
  },
  label: {
    color: '#1F2430',
    fontSize: 16,
    fontWeight: '600',
  },
});
