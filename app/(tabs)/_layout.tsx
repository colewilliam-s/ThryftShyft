import { Ionicons } from '@expo/vector-icons';
import { ColorValue } from 'react-native';
import { TopTabs } from 'expo-router/js-top-tabs';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../src/theme';

type IconName = keyof typeof Ionicons.glyphMap;

const icon =
  (active: IconName, inactive: IconName) =>
    ({ focused, color }: { focused: boolean; color: ColorValue }) => (
      <Ionicons
        name={focused ? active : inactive}
        size={24}
        color={color as string}
      />
    );


export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.tabBackgroundColor }}
      edges={['top']}
    >
      <TopTabs
        tabBarPosition="bottom"
        screenOptions={{
          swipeEnabled: true,
          animationEnabled: true,
          lazy: false,
          tabBarShowIcon: true,
          tabBarActiveTintColor: colors.tabBarActiveTintColor,
          tabBarInactiveTintColor: colors.tabBarInactiveTintColor,
          tabBarIndicatorStyle: { height: 0 },
          tabBarStyle: {
            backgroundColor: colors.tabBackgroundColor,
            borderTopWidth: 1,
            borderTopColor: colors.borderTopColor,
            paddingBottom: insets.bottom,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontFamily: 'DMSans_500Medium',
            textTransform: 'none',
            margin: 0,
          },
          tabBarItemStyle: {
            paddingVertical: 6,
          },
        }}
      >
        <TopTabs.Screen name="homepage" options={{ title: 'Home', tabBarIcon: icon('home', 'home-outline') }} />
        <TopTabs.Screen name="search" options={{ title: 'Search', tabBarIcon: icon('search', 'search-outline') }} />
        <TopTabs.Screen name="connect" options={{ title: 'Connect', tabBarIcon: icon('chatbubbles', 'chatbubbles-outline') }} />
        <TopTabs.Screen name="list" options={{ title: 'List', tabBarIcon: icon('add-circle', 'add-circle-outline') }} />
        <TopTabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: icon('person', 'person-outline') }} />
      </TopTabs>
    </SafeAreaView>
  );
}