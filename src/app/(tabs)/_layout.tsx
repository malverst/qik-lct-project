import { Tabs } from 'expo-router';
import { House, ListChecks, PiggyBank, ShoppingBag, TrendingUp } from 'lucide-react-native';

import { useGame } from '@/components/game-provider';
import { StatusBar } from '@/components/status-bar';

export default function TabsLayout() {
  const { state } = useGame();
  const showMoneyTabs = Boolean(state?.period.plan);

  return (
    <Tabs
      screenOptions={{
        headerShadowVisible: false,
        headerStyle: { backgroundColor: '#FFFFFF' },
        headerTintColor: '#1F2430',
        headerTitleStyle: { fontSize: 20, fontWeight: '800' },
        tabBarActiveTintColor: '#C4622D',
        tabBarInactiveTintColor: '#8B909A',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#F0E4D8',
          borderTopWidth: 1,
          height: 72,
          paddingTop: 6,
        },
        tabBarLabelStyle: { fontSize: 12, fontWeight: '700', paddingBottom: 3 },
        headerRight: () => <StatusBar />,
      }}>
      <Tabs.Screen
        name="home"
        options={{
          title: 'Дом',
          tabBarIcon: ({ color, size }) => <House color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="shop"
        options={{
          title: 'Покупки',
          href: showMoneyTabs ? undefined : null,
          tabBarIcon: ({ color, size }) => <ShoppingBag color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="savings"
        options={{
          title: 'Копилка',
          href: showMoneyTabs ? undefined : null,
          tabBarIcon: ({ color, size }) => <PiggyBank color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="tasks"
        options={{
          title: 'Дела',
          href: showMoneyTabs ? undefined : null,
          tabBarIcon: ({ color, size }) => <ListChecks color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: 'Прогресс',
          href: showMoneyTabs ? undefined : null,
          tabBarIcon: ({ color, size }) => <TrendingUp color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
