import { useEffect, useRef, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { useGame } from '@/components/game-provider';
import { Spacing } from '@/constants/theme';
import { playSound } from '@/utils/sounds';

type LevelPerk = {
  title: string;
  stageName: string;
  features: string[];
};

const LEVEL_PERKS: Record<number, LevelPerk> = {
  2: {
    title: '{name} подрос!',
    stageName: 'Подросток',
    features: [
      'Открылась новая категория дел: «Такси»',
      'Более крупные награды за поездки',
      '{name} стал заметно взрослее и сильнее',
    ],
  },
  3: {
    title: '{name} стал взрослым!',
    stageName: 'Взрослый кот',
    features: [
      'Открылась категория «Сложные дела»',
      'Самые ценные заказы и маршруты',
      '{name} вырос на максимум',
    ],
  },
};

export function LevelUp() {
  const { state, acknowledgeLevel } = useGame();
  const [level, setLevel] = useState<number | null>(null);
  const knownLevel = useRef<number | null>(null);

  useEffect(() => {
    if (!state) return;
    if (knownLevel.current === null) {
      knownLevel.current = state.pet.level;
      return;
    }
    if (state.pet.level > knownLevel.current && level == null) {
      playSound('reward');
      setLevel(state.pet.level);
      knownLevel.current = state.pet.level;
    }
  }, [level, state]);

  if (!state || level == null) return null;

  const perk = LEVEL_PERKS[level];
  const petText = (text: string) => text.split('{name}').join(state.pet.name);

  async function close() {
    setLevel(null);
    await acknowledgeLevel();
  }

  return (
    <Modal visible transparent animationType="none" statusBarTranslucent navigationBarTranslucent onRequestClose={close}>
      <View style={styles.backdrop}>
        <View style={styles.popup}>
          <Text style={styles.badge}>Новый уровень</Text>
          <Text style={styles.title}>{perk ? petText(perk.title) : `Уровень ${level}`}</Text>
          <Text style={styles.subtitle}>Стадия роста: {perk?.stageName ?? ''}</Text>
          <View style={styles.list}>
            {perk?.features.map((feature) => (
              <Text key={feature} style={styles.item}>
                • {petText(feature)}
              </Text>
            ))}
          </View>
          <Pressable accessibilityRole="button" onPress={close} style={styles.button}>
            <Text style={styles.buttonText}>Отлично!</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(31, 36, 48, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.four,
  },
  popup: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: Spacing.four,
    gap: Spacing.two,
  },
  badge: { color: '#C4622D', fontSize: 14, fontWeight: '700', textTransform: 'uppercase' },
  title: { color: '#1F2430', fontSize: 22, fontWeight: '700' },
  subtitle: { color: '#60646C', fontSize: 15, fontWeight: '600' },
  list: { gap: 6, marginVertical: Spacing.one },
  item: { color: '#1F2430', fontSize: 15, lineHeight: 21 },
  button: {
    minHeight: 52,
    borderRadius: 16,
    backgroundColor: '#F4A261',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
  },
  buttonText: { color: '#1F2430', fontSize: 18, fontWeight: '700' },
});
