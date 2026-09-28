import { Redirect } from 'expo-router';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { useGame } from '@/components/game-provider';

export default function IndexScreen() {
  const { ready, state, error } = useGame();

  if (!ready) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#F4A261" />
        <Text style={styles.caption}>Открываем Финни…</Text>
      </View>
    );
  }

  if (error) {
    return <Redirect href="/onboarding" />;
  }

  return <Redirect href={state ? '/home' : '/onboarding'} />;
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    backgroundColor: '#FFFFFF',
  },
  caption: {
    color: '#60646C',
    fontSize: 16,
  },
});
