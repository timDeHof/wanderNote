import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import Colors from '@/utils/colors';
import { Redirect, Tabs } from 'expo-router';
import { Home, MapPin, Plus, Settings, User } from 'lucide-react-native';

export default function TabLayout() {
  const { theme } = useTheme();
  const { user } = useAuth();

  // If there's no authenticated user, redirect to the login page
  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  const tabBarActiveTintColor = Colors[theme].primary;
  const tabBarInactiveTintColor = Colors[theme].textSecondary;
  const tabBarStyle = {
    backgroundColor: Colors[theme].background,
    borderTopColor: Colors[theme].border,
    paddingBottom: 8,
    paddingTop: 8,
    height: 60,
  };

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor,
        tabBarInactiveTintColor,
        tabBarStyle,
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontFamily: 'Poppins-Medium',
          fontSize: 12,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: 'Map',
          tabBarIcon: ({ color, size }) => <MapPin color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          title: 'Add',
          tabBarIcon: ({ color, size }) => <Plus color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => <Settings color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
