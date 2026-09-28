import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

import { findCoat } from '@/content/pet';
import type { CoatColorId } from '@/types/game';

type PetPortraitProps = {
  coatColor: CoatColorId;
  size?: number;
};

export function PetPortrait({ coatColor, size = 220 }: PetPortraitProps) {
  const coat = findCoat(coatColor);

  return (
    <View
      style={[
        styles.frame,
        { width: size, height: size },
        coat.image == null && { backgroundColor: coat.swatch },
      ]}
      accessibilityRole="image"
      accessibilityLabel={`${coat.label} кот`}>
      {coat.image != null ? (
        <Image source={coat.image} style={styles.image} contentFit="contain" />
      ) : (
        <Text style={styles.placeholder}>Фото скоро</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    color: '#1F2430',
    fontSize: 16,
    fontWeight: '700',
  },
});
