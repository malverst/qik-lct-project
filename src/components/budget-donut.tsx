import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { Spacing } from '@/constants/theme';
import type { BudgetPlan } from '@/types/game';

export const PLAN_COLORS = {
  mandatory: '#E07A3D',
  optional: '#5B8DEF',
  savings: '#3FA36C',
  left: '#E7E8EC',
} as const;

type BudgetDonutProps = {
  plan: BudgetPlan;
  budget: number;
};

const SIZE = 220;
const STROKE = 28;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function BudgetDonut({ plan, budget }: BudgetDonutProps) {
  const slices = [
    { value: plan.mandatory, color: PLAN_COLORS.mandatory },
    { value: plan.optional, color: PLAN_COLORS.optional },
    { value: plan.savings, color: PLAN_COLORS.savings },
  ];
  const used = slices.reduce((sum, slice) => sum + slice.value, 0);
  const left = Math.max(budget - used, 0);
  let offset = 0;

  return (
    <View style={styles.wrap}>
      <Svg width={SIZE} height={SIZE}>
        <Circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          stroke={PLAN_COLORS.left}
          strokeWidth={STROKE}
          fill="none"
        />
        {budget > 0
          ? slices.map((slice) => {
              if (slice.value <= 0) return null;
              const length = (slice.value / budget) * CIRCUMFERENCE;
              const dashOffset = CIRCUMFERENCE - offset;
              offset += length;
              return (
                <Circle
                  key={slice.color}
                  cx={SIZE / 2}
                  cy={SIZE / 2}
                  r={RADIUS}
                  stroke={slice.color}
                  strokeWidth={STROKE}
                  fill="none"
                  strokeDasharray={`${length} ${CIRCUMFERENCE - length}`}
                  strokeDashoffset={dashOffset}
                  strokeLinecap="butt"
                  rotation={-90}
                  origin={`${SIZE / 2}, ${SIZE / 2}`}
                />
              );
            })
          : null}
      </Svg>
      <View style={styles.center} pointerEvents="none">
        <Text style={styles.used}>{used}</Text>
        <Text style={styles.caption}>из {budget}</Text>
        <Text style={styles.left}>{left === 0 ? 'всё разложено' : `свободно ${left}`}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignSelf: 'center',
    width: SIZE,
    height: SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    position: 'absolute',
    left: STROKE + 8,
    right: STROKE + 8,
    top: STROKE + 8,
    bottom: STROKE + 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  used: {
    color: '#1F2430',
    fontSize: 40,
    fontWeight: '800',
    lineHeight: 44,
    textAlign: 'center',
  },
  caption: {
    color: '#60646C',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  left: {
    marginTop: Spacing.one,
    color: '#1F2430',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});
