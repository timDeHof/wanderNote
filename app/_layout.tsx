import { ErrorBoundary } from '@/components/ErrorBoundary';
import { AuthProvider } from '@/context/AuthContext';
import { LogsProvider } from '@/context/LogsContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { useFonts } from 'expo-font';
import { SplashScreen, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';


// Prevent auto-hiding the splash screen
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useFrameworkReady();

  const [fontsLoaded, fontError] = useFonts({
    'Poppins-Regular': require('@/assets/fonts/Poppins-Regular.ttf'),
    'Poppins-Medium': require('@/assets/fonts/Poppins-Medium.ttf'),
    'Poppins-SemiBold': require('@/assets/fonts/Poppins-SemiBold.ttf'),
    'Poppins-Bold': require('@/assets/fonts/Poppins-Bold.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      if (fontError) {
        console.error('Failed to load fonts:', fontError);
      }
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  // Return null until fonts are loaded
  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <LogsProvider>
            <StatusBar style="auto" />
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(auth)" options={{ headerShown: false }} />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="+not-found" options={{ title: 'Oops!' }} />
            </Stack>
          </LogsProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
