import 'react-native-gesture-handler';

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { GameProvider } from '@/components/game-provider';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
    <GameProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShadowVisible: false,
          headerStyle: { backgroundColor: '#FFFFFF' },
          headerTintColor: '#1F2430',
          contentStyle: { backgroundColor: '#FFFFFF' },
        }}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ title: 'Знакомство', headerBackVisible: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="plan" options={{ title: 'План' }} />
        <Stack.Screen name="review" options={{ title: 'Итоги' }} />
        <Stack.Screen name="adult" options={{ title: 'Для взрослого' }} />
      </Stack>
    </GameProvider>
    </GestureHandlerRootView>
  );
}
