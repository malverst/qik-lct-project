import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useReducedMotion, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import { PetOutfit } from '@/components/pet-outfit';
import { findCoat } from '@/content/pet';
import { Spacing } from '@/constants/theme';
import type { PetState } from '@/types/game';
import { playSound } from '@/utils/sounds';

const STAGE_LABEL = {
  kitten: 'Малыш',
  teen: 'Подросток',
  adult: 'Взрослый',
} as const;

const GOAL_SCENERY = {
  console: { source: require('../../assets/images/gamestation.png'), style: 'console' },
  house: { source: require('../../assets/images/big_house.png'), style: 'house' },
  'rare-item': { source: require('../../assets/images/kolokolchik.png'), style: 'bell' },
} as const;

export function PetCard({
  pet,
  canPet = false,
  onWardrobe,
  ownedGoalIds = [],
}: {
  pet: PetState;
  canPet?: boolean;
  onWardrobe?: () => void;
  ownedGoalIds?: string[];
}) {
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
      <View style={styles.stage}>
      {ownedGoalIds.includes('house') ? (
        <Image source={GOAL_SCENERY.house.source} style={styles.house} contentFit="contain" />
      ) : null}
      <Pressable
        accessibilityRole={canPet ? 'button' : 'image'}
        accessibilityLabel={canPet ? `Погладить ${pet.name}` : pet.name}
        disabled={!canPet}
        onPress={petCat}
        style={styles.portrait}>
        <Animated.View style={{ transform: [{ scaleY: scale }] }}>
          <PetOutfit customization={pet.customization} size={portraitSize} />
        </Animated.View>
      </Pressable>
      {ownedGoalIds.includes('console') ? (
        <Image source={GOAL_SCENERY.console.source} style={styles.console} contentFit="contain" />
      ) : null}
      {ownedGoalIds.includes('rare-item') ? (
        <Image source={GOAL_SCENERY['rare-item'].source} style={styles.goalBell} contentFit="contain" />
      ) : null}
      {onWardrobe ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Гардероб"
          onPress={onWardrobe}
          style={({ pressed }) => [styles.wardrobe, pressed && styles.pressed]}>
          <HangerIcon />
        </Pressable>
      ) : null}
      </View>
      <Text style={styles.name}>{pet.name}</Text>
      <Text style={styles.meta}>
        {STAGE_LABEL[pet.stage]} · {coat.label}
      </Text>
      {canPet ? <Text style={styles.hint}>Нажми, чтобы погладить</Text> : null}
    </View>
  );
}

function HangerIcon() {
  return (
    <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 7.2a1.6 1.6 0 1 0-1.5-2.1"
        stroke="#C4622D"
        strokeWidth={2}
        strokeLinecap="round"
      />
      <Path
        d="M12 7.2 4.2 13.2a2 2 0 0 0 1.2 3.6h13.2a2 2 0 0 0 1.2-3.6L12 7.2Z"
        stroke="#C4622D"
        strokeWidth={2}
        strokeLinejoin="round"
      />
    </Svg>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    gap: Spacing.two,
  },
  stage: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-end',
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
  wardrobe: {
    position: 'absolute',
    right: 0,
    top: '42%',
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFF6EE',
    borderWidth: 1.5,
    borderColor: '#F4A261',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.75 },
  house: {
    position: 'absolute',
    width: '150%',
    height: '130%',
    bottom: 0,
    zIndex: -1,
  },
  console: {
    position: 'absolute',
    left: -8,
    bottom: 0,
    width: 124,
    height: 98,
  },
  goalBell: {
    position: 'absolute',
    right: 8,
    bottom: 0,
    width: 46,
    height: 46,
  },
});
