import { Image } from 'expo-image';
import { Redirect } from 'expo-router';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useGame } from '@/components/game-provider';
import { PrimaryButton } from '@/components/primary-button';
import { PURCHASES, type PurchaseItem } from '@/content/purchases';
import { Spacing } from '@/constants/theme';
import { playSound } from '@/utils/sounds';

export default function ShopScreen() {
  const { ready, state, buyItem } = useGame();
  const [pending, setPending] = useState<PurchaseItem | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [buying, setBuying] = useState(false);
  const [guidePiggy, setGuidePiggy] = useState(false);

  if (!ready) return null;
  if (!state) return <Redirect href="/onboarding" />;
  if (!state.period.plan) return <Redirect href="/plan" />;

  async function confirmBuy() {
    if (!pending) return;
    const bought = pending;
    setBuying(true);
    const error = await buyItem(bought.id);
    setBuying(false);
    if (error) {
      playSound('error');
      setMessage(error);
      setPending(null);
      return;
    }
    playSound('buy');
    const boughtFood = bought.id.startsWith('food-');
    setMessage(
      boughtFood
        ? `${state?.pet.name ?? 'Кот'} поел. Сытость: ${bought.satiation} из 5.`
        : 'Покупка сохранена. Теперь кота можно гладить дома.',
    );
    if (boughtFood && state?.period.index === 1) setGuidePiggy(true);
    setPending(null);
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.kicker}>Магазин</Text>
        <Text style={styles.title}>Покупки</Text>
        <Text style={styles.lead}>Еда кормит кота. Расчёска открывает поглаживание.</Text>
        {PURCHASES.map((item) => (
          <View key={item.id} style={styles.card}>
            {item.image != null ? (
              <Image source={item.image} style={styles.photo} contentFit="contain" />
            ) : (
              <View style={styles.photoPlaceholder}>
                <Text style={styles.placeholderText}>Фото скоро</Text>
              </View>
            )}
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.text}>{item.description}</Text>
            <Text style={styles.effect}>{item.effect}</Text>
            {item.satiation > 0 ? <Satiation value={item.satiation} price={item.price} /> : null}
            <Pressable
              accessibilityRole="button"
              onPress={() => setPending(item)}
              style={({ pressed }) => [styles.buy, pressed && styles.pressed]}>
              <Text style={styles.buyLabel}>Купить</Text>
              <Text style={styles.price}>🪙 {item.price}</Text>
            </Pressable>
          </View>
        ))}
        {message ? <Text style={styles.note}>{message}</Text> : null}
      </ScrollView>
      {guidePiggy && !state.currentGoalId ? (
        <>
          <View pointerEvents="none" style={styles.guideShade} />
          <View pointerEvents="none" style={styles.guideBubble}>
            <Text style={styles.guideText}>Копилка хранит монеты на цель. Нажми «Копилка» внизу</Text>
          </View>
        </>
      ) : null}
      <Modal visible={pending != null} transparent animationType="fade" onRequestClose={() => setPending(null)}>
        <Pressable style={styles.backdrop} onPress={() => setPending(null)}>
          <Pressable style={styles.popup} onPress={() => {}}>
            <Text style={styles.popupTitle}>Купить {pending?.name}?</Text>
            <Text style={styles.text}>Спишется {pending?.price} монет. План при этом не изменится.</Text>
            {pending && pending.satiation > 0 ? <Satiation value={pending.satiation} price={pending.price} /> : null}
            <PrimaryButton label={buying ? 'Покупаем…' : 'Купить'} onPress={confirmBuy} disabled={buying} />
            <PrimaryButton label="Не сейчас" tone="quiet" onPress={() => setPending(null)} />
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

function Satiation({ value, price }: { value: number; price: number }) {
  return (
    <View style={styles.satiation}>
      <View style={styles.satiationHead}>
        <Text style={styles.satiationLabel}>Насыщение</Text>
        <Text style={styles.satiationValue}>{value} из 5</Text>
      </View>
      <View style={styles.dots}>
        {Array.from({ length: 5 }, (_, index) => (
          <View key={index} style={[styles.dot, index < value && styles.dotOn]} />
        ))}
      </View>
      <Text style={styles.deal}>
        {price} монет · {Math.round((price / value) * 10) / 10} за единицу сытости
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { padding: Spacing.four, gap: Spacing.three, paddingBottom: Spacing.six },
  kicker: { color: '#C4622D', fontSize: 14, fontWeight: '700', letterSpacing: 0.4, textTransform: 'uppercase' },
  title: { color: '#1F2430', fontSize: 30, fontWeight: '800' },
  lead: { color: '#60646C', fontSize: 16, fontWeight: '500', lineHeight: 22 },
  card: {
    borderRadius: 18,
    backgroundColor: '#FFF8F3',
    borderWidth: 1,
    borderColor: '#F3E4D6',
    padding: Spacing.three,
    gap: Spacing.two,
  },
  photo: { width: '100%', height: 140 },
  photoPlaceholder: {
    height: 140,
    borderRadius: 16,
    backgroundColor: '#F7F7F8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: { color: '#60646C', fontSize: 16, fontWeight: '700' },
  name: { color: '#1F2430', fontSize: 22, fontWeight: '800' },
  text: { color: '#1F2430', fontSize: 16, fontWeight: '600', lineHeight: 22 },
  effect: { color: '#60646C', fontSize: 15, fontWeight: '500', lineHeight: 21 },
  satiation: { gap: Spacing.one },
  satiationHead: { flexDirection: 'row', justifyContent: 'space-between', gap: Spacing.two },
  satiationLabel: { color: '#1F2430', fontSize: 15, fontWeight: '700' },
  satiationValue: { color: '#C4622D', fontSize: 15, fontWeight: '800' },
  dots: { flexDirection: 'row', gap: 6 },
  dot: { flex: 1, height: 10, borderRadius: 6, backgroundColor: '#E7E0D8' },
  dotOn: { backgroundColor: '#F4A261' },
  deal: { color: '#8B909A', fontSize: 13, fontWeight: '600' },
  buy: {
    minHeight: 52,
    borderRadius: 16,
    backgroundColor: '#F4A261',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.three,
  },
  pressed: { opacity: 0.8 },
  buyLabel: { color: '#1F2430', fontSize: 18, fontWeight: '800' },
  price: { color: '#1F2430', fontSize: 18, fontWeight: '800' },
  note: { color: '#1F2430', fontSize: 16, fontWeight: '600', lineHeight: 22 },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(31, 36, 48, 0.4)',
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
    gap: Spacing.three,
  },
  popupTitle: { color: '#1F2430', fontSize: 22, fontWeight: '800' },
  guideShade: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(31, 36, 48, 0.55)',
  },
  guideBubble: {
    position: 'absolute',
    left: Spacing.four,
    right: Spacing.four,
    bottom: Spacing.three,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: Spacing.three,
  },
  guideText: { color: '#1F2430', fontSize: 16, fontWeight: '700', lineHeight: 22 },
});
