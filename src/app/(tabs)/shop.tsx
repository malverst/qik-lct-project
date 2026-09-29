import { Image } from 'expo-image';
import { Redirect } from 'expo-router';
import { useEffect, useState, type ReactNode } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CoinFlash } from '@/components/coin-flash';
import { useGame } from '@/components/game-provider';
import { PrimaryButton } from '@/components/primary-button';
import { PURCHASES, SHOP_GROUPS, type PurchaseGroup, type PurchaseItem } from '@/content/purchases';
import { Spacing } from '@/constants/theme';
import { playSound } from '@/utils/sounds';

export default function ShopScreen() {
  const { ready, state, buyItem, helpWithFood } = useGame();
  const [pending, setPending] = useState<PurchaseItem | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [foodHelp, setFoodHelp] = useState<number | null>(null);
  const [buying, setBuying] = useState(false);
  const [guidePiggy, setGuidePiggy] = useState(false);
  const [openGroup, setOpenGroup] = useState<PurchaseGroup | null>(null);
  const [flash, setFlash] = useState<number | null>(null);

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
      const shortfall = bought.price - (state?.wallet.coins ?? 0);
      const cheapest = Math.min(...PURCHASES.filter((item) => item.group === 'food').map((item) => item.price));
      if (bought.group === 'food' && state?.pet.needsMeal && (state.wallet.coins ?? 0) < cheapest && shortfall > 0) {
        setPending(null);
        setFoodHelp(shortfall);
        return;
      }
      setMessage(error);
      return;
    }
    setMessage(null);
    setFlash(-bought.price);
    if (bought.id.startsWith('food-') && state?.period.index === 1) setGuidePiggy(true);
    setPending(null);
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        {SHOP_GROUPS.map((group) => {
          const items = PURCHASES.filter(
            (item) => item.group === group.id && (item.group === 'food' || !state.purchasedItemIds.includes(item.id)),
          );
          if (items.length === 0) return null;
          const wearable = group.id === 'shirt' || group.id === 'hat' || group.id === 'trinket';
          return (
            <ShopFold
              key={group.id}
              title={group.title}
              open={openGroup === group.id}
              onPress={() => setOpenGroup((current) => (current === group.id ? null : group.id))}>
              {items.map((item) => (
                <View key={item.id} style={styles.card}>
                  {item.image != null ? (
                    <Image
                      source={item.image}
                      style={wearable ? styles.wardrobePhoto : styles.photo}
                      contentFit="contain"
                    />
                  ) : (
                    <View style={styles.photoPlaceholder}>
                      <Text style={styles.placeholderText}>Фото скоро</Text>
                    </View>
                  )}
                  <Text style={styles.name}>{item.name}</Text>
                  <Text style={styles.text}>{item.description}</Text>
                  {item.satiation > 0 ? <Satiation value={item.satiation} /> : null}
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => setPending(item)}
                    style={({ pressed }) => [styles.buy, pressed && styles.pressed]}>
                    <Text style={styles.buyLabel}>Купить</Text>
                    <Text style={styles.price}>🪙 {item.price}</Text>
                  </Pressable>
                </View>
              ))}
            </ShopFold>
          );
        })}
      </ScrollView>
      {flash != null ? <CoinFlash amount={flash} onDone={() => setFlash(null)} /> : null}
      {guidePiggy && !state.currentGoalId ? (
        <>
          <View pointerEvents="none" style={styles.guideShade} />
          <View pointerEvents="none" style={styles.guideBubble}>
            <Text style={styles.guideText}>Копилка хранит монеты на цель. Нажми «Копилка» внизу</Text>
          </View>
        </>
      ) : null}
      <Modal visible={foodHelp != null} transparent animationType="fade">
        <View style={styles.backdrop}>
          <View style={styles.popup}>
            <Text style={styles.popupTitle}>Про еду нельзя забывать</Text>
            <Text style={styles.text}>
              {state.pet.name} уже голоден, а на еду не хватает монет. Еду нужно планировать заранее и всегда оставлять на неё запас.
            </Text>
            <Text style={styles.text}>Сейчас добавим ровно {foodHelp} монет — столько не хватает на эту еду.</Text>
            <PrimaryButton
              label="Понятно"
              disabled={buying}
              onPress={async () => {
                if (foodHelp == null) return;
                setBuying(true);
                const error = await helpWithFood(foodHelp);
                setBuying(false);
                if (error) {
                  setMessage(error);
                  return;
                }
                setFlash(foodHelp);
                setFoodHelp(null);
              }}
            />
          </View>
        </View>
      </Modal>
      <Modal
        visible={message != null}
        transparent
        animationType="fade"
        onRequestClose={() => setMessage(null)}>
        <Pressable style={styles.backdrop} onPress={() => setMessage(null)}>
          <Pressable style={styles.popup} onPress={() => {}}>
            <Text style={styles.popupTitle}>Пока нельзя купить</Text>
            <Text style={styles.text}>{message}</Text>
            <PrimaryButton label="Понятно" onPress={() => setMessage(null)} />
          </Pressable>
        </Pressable>
      </Modal>
      <Modal visible={pending != null && message == null} transparent animationType="fade" onRequestClose={() => setPending(null)}>
        <Pressable style={styles.backdrop} onPress={() => setPending(null)}>
          <Pressable style={styles.popup} onPress={() => {}}>
            <Text style={styles.popupTitle}>Купить {pending?.name}?</Text>
            <Text style={styles.text}>Спишется {pending?.price} монет.</Text>
            {pending && pending.satiation > 0 ? <Satiation value={pending.satiation} /> : null}
            <PrimaryButton label={buying ? 'Покупаем…' : 'Купить'} onPress={confirmBuy} disabled={buying} />
            <PrimaryButton label="Не сейчас" tone="quiet" onPress={() => setPending(null)} />
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

function ShopFold({
  title,
  open,
  onPress,
  children,
}: {
  title: string;
  open: boolean;
  onPress: () => void;
  children: ReactNode;
}) {
  const [height, setHeight] = useState(0);
  const progress = useSharedValue(open ? 1 : 0);

  useEffect(() => {
    progress.set(withTiming(open ? 1 : 0, { duration: 420, easing: Easing.out(Easing.cubic) }));
  }, [open, progress]);

  const bodyStyle = useAnimatedStyle(() => ({
    height: height === 0 ? 0 : progress.get() * height,
    opacity: progress.get(),
  }));
  const arrowStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${progress.get() * 180}deg` }],
  }));

  return (
    <View>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        onPress={onPress}
        style={styles.category}>
        <Text style={styles.categoryTitle}>{title}</Text>
        <Animated.View style={arrowStyle}>
          <Text style={styles.arrow}>⌄</Text>
        </Animated.View>
      </Pressable>
      <Animated.View style={[styles.fold, bodyStyle]}>
        <View
          style={styles.foldInner}
          onLayout={(event) => {
            const next = event.nativeEvent.layout.height;
            if (next > 0 && next !== height) setHeight(next);
          }}>
          {children}
        </View>
      </Animated.View>
    </View>
  );
}

function Satiation({ value }: { value: number }) {
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

    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { padding: Spacing.four, gap: Spacing.four, paddingBottom: Spacing.six },
  category: {
    minHeight: 56,
    borderRadius: 18,
    backgroundColor: '#FFF6EE',
    borderWidth: 1.5,
    borderColor: '#F4A261',
    padding: Spacing.three,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  categoryTitle: { flex: 1, color: '#1F2430', fontSize: 18, fontWeight: '800' },
  arrow: { color: '#C4622D', fontSize: 28, lineHeight: 28, fontWeight: '700' },
  fold: { overflow: 'hidden' },
  foldInner: { position: 'absolute', left: 0, right: 0, top: 0, gap: Spacing.two, paddingTop: Spacing.two },
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
  wardrobePhoto: { width: '100%', height: 230 },
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
  error: { color: '#9A3412', fontSize: 16, fontWeight: '700', lineHeight: 22 },
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
