import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NativeBaseProvider, extendTheme } from 'native-base';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';

import AppNavigator from './src/navigation/AppNavigator';
import ErrorBoundary from './src/components/ErrorBoundary';
import { useUserStore } from './src/store/userStore';

const theme = extendTheme({
  colors: {
    primary: {
      50: '#E3F2FD',
      100: '#BBDEFB',
      200: '#90CAF9',
      300: '#64B5F6',
      400: '#42A5F5',
      500: '#2196F3',
      600: '#1E88E5',
      700: '#1976D2',
      800: '#1565C0',
      900: '#0D47A1',
    },
  },
  config: {
    initialColorMode: 'light',
  },
});

export default function App() {
  const resetScansIfNewMonth = useUserStore((state) => state.resetScansIfNewMonth);

  useEffect(() => {
    // Check if we need to reset scan count for new month
    resetScansIfNewMonth();
  }, []);

  return (
    <GestureHandlerRootView style={styles.container}>
      <NativeBaseProvider theme={theme}>
        <ErrorBoundary>
          <StatusBar style="auto" />
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
});
