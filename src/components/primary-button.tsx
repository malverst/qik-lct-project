import { Pressable, StyleSheet, Text } from 'react-native';

import { Spacing } from '@/constants/theme';

type PrimaryButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  tone?: 'primary' | 'quiet' | 'danger';
};

export function PrimaryButton({ label, onPress, disabled, tone = 'primary' }: PrimaryButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        tone === 'quiet' && styles.quiet,
        tone === 'danger' && styles.danger,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
      ]}>
      <Text style={[styles.label, tone === 'quiet' && styles.quietLabel, tone === 'danger' && styles.dangerLabel]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 52,
    borderRadius: 16,
    backgroundColor: '#F4A261',
    borderWidth: 1,
    borderColor: '#E98E4B',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
    shadowColor: '#C4622D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  quiet: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E0E1E6',
    shadowOpacity: 0,
    elevation: 0,
  },
  danger: {
    backgroundColor: '#E24B4B',
    borderColor: '#C93A3A',
    shadowColor: '#9A3412',
  },
  disabled: {
    opacity: 0.45,
  },
  pressed: {
    opacity: 0.78,
    transform: [{ scale: 0.98 }],
  },
  label: {
    color: '#1F2430',
    fontSize: 18,
    fontWeight: '700',
  },
  quietLabel: {
    color: '#1F2430',
  },
  dangerLabel: {
    color: '#FFFFFF',
  },
});
