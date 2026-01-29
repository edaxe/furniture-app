import React, { useEffect, useCallback } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NativeBaseProvider, extendTheme } from 'native-base';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';

import AppNavigator from './src/navigation/AppNavigator';
import ErrorBoundary from './src/components/ErrorBoundary';
import { useUserStore } from './src/store/userStore';
import { colors } from './src/theme';

// Keep splash screen visible while loading fonts
SplashScreen.preventAutoHideAsync();

const theme = extendTheme({
  colors: {
    primary: {
      50: '#FDF5F3',
      100: '#F9E8E3',
      200: '#F3D1C7',
      300: '#E9B3A1',
      400: '#D9927A',
      500: '#C4785A',
      600: '#B06647',
      700: '#93533B',
      800: '#7A4534',
      900: '#663B2E',
    },
    success: {
      50: '#F2F7F4',
      100: '#E4EFE8',
      200: '#C9DFD1',
      300: '#A3C8B3',
      400: '#7AAF93',
      500: '#5A8A6A',
      600: '#476F55',
      700: '#3A5945',
      800: '#304839',
      900: '#283C30',
    },
    error: {
      50: '#FDF5F4',
      100: '#FCE8E6',
      200: '#F9D0CC',
      300: '#F3ABA4',
      400: '#E88178',
      500: '#D4574A',
      600: '#BC4439',
      700: '#9D382F',
      800: '#82312A',
      900: '#6D2E27',
    },
  },
  config: {
    initialColorMode: 'light',
  },
});

export default function App() {
  const resetScansIfNewMonth = useUserStore((state) => state.resetScansIfNewMonth);

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    resetScansIfNewMonth();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.accent[500]} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.container} onLayout={onLayoutRootView}>
      <NativeBaseProvider theme={theme}>
        <ErrorBoundary>
          <StatusBar style="dark" />
          <AppNavigator />
        </ErrorBoundary>
      </NativeBaseProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.primary,
  },
});
