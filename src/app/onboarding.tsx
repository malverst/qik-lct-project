import { Redirect, router } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ChoiceChip } from '@/components/choice-chip';
import { useGame } from '@/components/game-provider';
import { PetPortrait } from '@/components/pet-portrait';
import { PrimaryButton } from '@/components/primary-button';
import { COAT_OPTIONS, DEFAULT_CUSTOMIZATION } from '@/content/pet';
import { MAX_NAME_LENGTH } from '@/domain/game';
import { Spacing } from '@/constants/theme';
import type { CoatColorId, PetCustomization } from '@/types/game';

export default function OnboardingScreen() {
  const { ready, state, startGame, startDemo } = useGame();
  const [petName, setPetName] = useState('Финни');
  const [customization, setCustomization] = useState<PetCustomization>(DEFAULT_CUSTOMIZATION);
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  if (ready && state) {
    return <Redirect href="/home" />;
  }

  async function onStart() {
    setSaving(true);
    const error = await startGame({ petName, customization });
    setSaving(false);
    if (error) {
      setMessage(error);
      return;
    }
    router.replace('/home');
  }

  async function onDemo() {
    setSaving(true);
    const error = await startDemo();
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
        <Text style={styles.kicker}>Знакомство</Text>
        <Text style={styles.title}>Новый кот</Text>
        <PetPortrait coatColor={customization.coatColor} />
        <Text style={styles.lead}>Назови кота и выбери цвет шерсти.</Text>

        <Field label="Как зовут кота?">
          <TextInput
            value={petName}
            onChangeText={setPetName}
            maxLength={MAX_NAME_LENGTH}
            placeholder="Финни"
            placeholderTextColor="#8B909A"
            style={styles.input}
            autoCorrect={false}
          />
        </Field>

        <ChoiceGroup title="Шерсть">
          {COAT_OPTIONS.map((item) => (
            <ChoiceChip
              key={item.id}
              label={item.label}
              swatch={item.swatch}
              selected={customization.coatColor === item.id}
              onPress={() => setCoat(item.id)}
            />
          ))}
        </ChoiceGroup>

        {message ? <Text style={styles.error}>{message}</Text> : null}
        <PrimaryButton label={saving ? 'Сохраняем…' : 'Начать'} onPress={onStart} disabled={saving} />
        <PrimaryButton label="Открыть демо-профиль" tone="quiet" onPress={onDemo} disabled={saving} />
      </ScrollView>
    </SafeAreaView>
  );

  function setCoat(coatColor: CoatColorId) {
    setCustomization((current) => ({ ...current, coatColor }));
  }
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      {children}
    </View>
  );
}

function ChoiceGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{title}</Text>
      <View style={styles.row}>{children}</View>
    </View>
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
  kicker: {
    color: '#C4622D',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  title: {
    color: '#1F2430',
    fontSize: 32,
    fontWeight: '800',
    lineHeight: 38,
  },
  lead: {
    color: '#60646C',
    fontSize: 17,
    fontWeight: '500',
    lineHeight: 24,
  },
  field: {
    gap: Spacing.two,
  },
  label: {
    color: '#1F2430',
    fontSize: 18,
    fontWeight: '700',
  },
  input: {
    minHeight: 52,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E0E1E6',
    paddingHorizontal: Spacing.three,
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2430',
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  error: {
    color: '#9A3412',
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
  },
});
