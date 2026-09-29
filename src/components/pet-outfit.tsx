import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

import { findAccessory, findCoat, HAT_OPTIONS, SHIRT_OPTIONS, TRINKET_OPTIONS } from '@/content/pet';
import type { PetCustomization } from '@/types/game';

const PLACEHOLDER_TINT = {
  'shirt-stripe': 'rgba(91, 141, 239, 0.38)',
  'shirt-star': 'rgba(244, 162, 97, 0.4)',
  'shirt-warm': 'rgba(196, 98, 45, 0.32)',
  'hat-cap': 'rgba(63, 163, 108, 0.38)',
  'hat-bow': 'rgba(224, 122, 61, 0.4)',
  'hat-crown': 'rgba(232, 184, 74, 0.45)',
  'trinket-bell': 'rgba(232, 184, 74, 0.5)',
  'trinket-scarf': 'rgba(141, 153, 174, 0.42)',
  'trinket-medal': 'rgba(196, 98, 45, 0.4)',
} as const;

type PetOutfitProps = {
  customization: PetCustomization;
  size?: number;
};

export function PetOutfit({ customization, size = 240 }: PetOutfitProps) {
  const coat = findCoat(customization.coatColor);
  const shirt = findAccessory(SHIRT_OPTIONS, customization.shirtId);
  const trinket = findAccessory(TRINKET_OPTIONS, customization.trinketId);
  const hat = findAccessory(HAT_OPTIONS, customization.hatId);

  return (
    <View style={[styles.frame, { width: size, height: size }]} accessibilityRole="image" accessibilityLabel={`${coat.label} кот`}>
      {coat.image != null ? (
        <Image source={coat.image} style={styles.layer} contentFit="contain" />
      ) : (
        <View style={[styles.layer, { backgroundColor: coat.swatch }]} />
      )}
      <OutfitLayer item={shirt} />
      <OutfitLayer item={trinket} />
      <OutfitLayer item={hat} />
    </View>
  );
}

function OutfitLayer({
  item,
  offset,
}: {
  item: ReturnType<typeof findAccessory>;
  offset?: { x: number; y: number; scale?: number };
}) {
  if (item.id === 'none') return null;
  const shift = offset
    ? {
        transform: [
          { translateX: offset.x * 100 },
          { translateY: offset.y * 100 },
          { scale: offset.scale ?? 1 },
        ] as const,
      }
    : null;
  if (item.image != null) {
    return <Image source={item.image} style={[styles.layer, shift]} contentFit="contain" pointerEvents="none" />;
  }

  const tint = PLACEHOLDER_TINT[item.id as keyof typeof PLACEHOLDER_TINT] ?? 'rgba(31, 36, 48, 0.18)';
  return (
    <View pointerEvents="none" style={[styles.layer, styles.placeholder, { backgroundColor: tint }]}>
      <Text style={styles.placeholderText}>
        {item.emoji} {item.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  layer: {
    ...StyleSheet.absoluteFill,
    width: '100%',
    height: '100%',
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
  },
  placeholderText: {
    color: '#1F2430',
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
  },
});
