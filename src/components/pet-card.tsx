import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useReducedMotion, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';

import { PetPortrait } from '@/components/pet-portrait';
import { findCoat } from '@/content/pet';
import { Spacing } from '@/constants/theme';
import type { PetState } from '@/types/game';
import { playSound } from '@/utils/sounds';

const STAGE_LABEL = {
  kitten: 'Малыш',
  teen: 'Подросток',
  adult: 'Взрослый',
} as const;

export function PetCard({ pet, canPet = false }: { pet: PetState; canPet?: boolean }) {
  const coat = findCoat(pet.customization.coatColor);
  const portraitSize = pet.stage === 'adult' ? 250 : pet.stage === 'teen' ? 220 : 190;
  const reducedMotion = useReducedMotion();
  const scale = useSharedValue(1);

  function petCat() {
    if (!canPet) return;
    playSound('pet');
    if (reducedMotion) return;
    scale.set(
      withSequence(
        withTiming(0.9, { duration: 140 }),
        withTiming(1.06, { duration: 160 }),
        withTiming(0.92, { duration: 140 }),
        withTiming(1.04, { duration: 150 }),
        withTiming(1, { duration: 180 }),
      ),
    );
  }

  return (
    <View style={styles.card}>
      <Pressable
        accessibilityRole={canPet ? 'button' : 'image'}
        accessibilityLabel={canPet ? `Погладить ${pet.name}` : pet.name}
        disabled={!canPet}
        onPress={petCat}
        style={styles.portrait}>
        <Animated.View style={{ transform: [{ scaleY: scale }] }}>
          <PetPortrait coatColor={pet.customization.coatColor} size={portraitSize} />
        </Animated.View>
      </Pressable>
      <Text style={styles.name}>{pet.name}</Text>
      <Text style={styles.meta}>
        {STAGE_LABEL[pet.stage]} · {coat.label}
      </Text>
      {canPet ? <Text style={styles.hint}>Нажми, чтобы погладить</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    gap: Spacing.two,
  },
  portrait: {
    backgroundColor: 'transparent',
  },
  name: {
    color: '#1F2430',
    fontSize: 32,
    fontWeight: '800',
    textAlign: 'center',
  },
  meta: {
    color: '#60646C',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  hint: {
    color: '#C4622D',
    fontSize: 14,
    fontWeight: '700',
  },
});
