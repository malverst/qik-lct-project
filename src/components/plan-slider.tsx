import { useRef, useState } from 'react';
import { PanResponder, StyleSheet, Text, View } from 'react-native';

import { Spacing } from '@/constants/theme';

type PlanSliderProps = {
  label: string;
  hint: string;
  value: number;
  max: number;
  limit: number;
  color: string;
  onChange: (value: number) => void;
};

const THUMB = 36;
const TRACK = 16;

export function PlanSlider({ label, hint, value, max, limit, color, onChange }: PlanSliderProps) {
  const [width, setWidth] = useState(0);
  const usable = Math.max(width - THUMB, 1);
  const ratio = max > 0 ? Math.min(Math.max(value / max, 0), 1) : 0;
  const measure = useRef({ usable, max, limit, value, onChange });
  measure.current = { usable, max, limit, value, onChange };
  const drag = useRef({ startX: 0, startValue: 0 });

  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: (event) => {
        drag.current = { startX: event.nativeEvent.pageX, startValue: measure.current.value };
      },
      onPanResponderMove: (event) => {
        const current = measure.current;
        const delta = event.nativeEvent.pageX - drag.current.startX;
        const raw =
          current.max <= 0
            ? 0
            : drag.current.startValue + Math.round((delta / current.usable) * current.max);
        current.onChange(Math.min(Math.max(raw, 0), current.limit));
      },
    }),
  ).current;

  return (
    <View style={styles.card}>
      <View style={styles.head}>
        <View style={[styles.dot, { backgroundColor: color }]} />
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value}</Text>
      </View>
      <Text style={styles.hint}>{hint}</Text>
      <View
        accessibilityRole="adjustable"
        accessibilityLabel={label}
        accessibilityValue={{ min: 0, max, now: value }}
        style={styles.trackHit}
        onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
        {...pan.panHandlers}>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${ratio * 100}%`, backgroundColor: color }]} />
        </View>
        <View style={[styles.thumb, { left: ratio * usable, borderColor: color }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#F7F7F8',
    borderRadius: 18,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.three,
    gap: Spacing.two,
  },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  label: {
    flex: 1,
    color: '#1F2430',
    fontSize: 18,
    fontWeight: '700',
  },
  value: {
    color: '#1F2430',
    fontSize: 22,
    fontWeight: '700',
    minWidth: 40,
    textAlign: 'right',
  },
  hint: {
    color: '#60646C',
    fontSize: 16,
  },
  trackHit: {
    height: 48,
    justifyContent: 'center',
  },
  track: {
    height: TRACK,
    borderRadius: TRACK / 2,
    backgroundColor: '#E0E1E6',
    overflow: 'hidden',
    marginHorizontal: THUMB / 2,
  },
  fill: {
    height: TRACK,
    borderRadius: TRACK / 2,
  },
  thumb: {
    position: 'absolute',
    width: THUMB,
    height: THUMB,
    borderRadius: THUMB / 2,
    backgroundColor: '#FFFFFF',
    borderWidth: 5,
  },
});
