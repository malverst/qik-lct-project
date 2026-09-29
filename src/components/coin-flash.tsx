import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';

import { playSound } from '@/utils/sounds';

type CoinFlashProps = {
  amount: number;
  onDone: () => void;
};

export function CoinFlash({ amount, onDone }: CoinFlashProps) {
  const gain = amount > 0;
  const opacity = useSharedValue(0);

  useEffect(() => {
    playSound(gain ? 'reward' : 'buy');
    opacity.set(withTiming(1, { duration: 220, easing: Easing.out(Easing.cubic) }));
    const hide = setTimeout(() => {
      opacity.set(withTiming(0, { duration: 360, easing: Easing.in(Easing.cubic) }));
    }, 700);
    const done = setTimeout(onDone, 1100);
    return () => {
      clearTimeout(hide);
      clearTimeout(done);
    };
  }, [amount, gain, onDone, opacity]);

  const fade = useAnimatedStyle(() => ({ opacity: opacity.get() }));
  const color = gain ? '#3FA36C' : '#D4533A';

  return (
    <Animated.View pointerEvents="none" style={[styles.screen, fade]}>
      <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
        <Defs>
          <RadialGradient id="coinGlow" cx="50%" cy="46%" rx="130%" ry="95%">
            <Stop offset="0%" stopColor={color} stopOpacity="0.78" />
            <Stop offset="46%" stopColor={color} stopOpacity="0.5" />
            <Stop offset="100%" stopColor={color} stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#coinGlow)" />
      </Svg>
      <View style={styles.amountRow}>
        <Text style={styles.amount}>
          {gain ? '+' : '−'}
          {Math.abs(amount)}
        </Text>
        <Text style={styles.coin}>🪙</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  screen: {
    ...StyleSheet.absoluteFill,
    zIndex: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  amount: {
    color: '#FFFFFF',
    fontSize: 72,
    fontWeight: '800',
    textShadowColor: 'rgba(31, 36, 48, 0.28)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  coin: { fontSize: 56 },
});
