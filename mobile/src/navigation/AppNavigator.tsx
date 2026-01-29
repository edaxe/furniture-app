import React from 'react';
import { View, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

import ScanScreen from '../screens/ScanScreen';
import ResultsScreen from '../screens/ResultsScreen';
import DetectionFailedScreen from '../screens/DetectionFailedScreen';
import ListsScreen from '../screens/ListsScreen';
import RoomDetailScreen from '../screens/RoomDetailScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import { useOnboardingStore } from '../store/onboardingStore';
import { colors, typography, fontFamily, spacing, borderRadius } from '../theme';

import {
  RootTabParamList,
  ScanStackParamList,
  ListsStackParamList,
} from './types';

const Tab = createBottomTabNavigator<RootTabParamList>();
const ScanStack = createNativeStackNavigator<ScanStackParamList>();
const ListsStack = createNativeStackNavigator<ListsStackParamList>();

const screenOptions = {
  headerStyle: {
    backgroundColor: colors.background.primary,
  },
  headerTitleStyle: {
    fontFamily: fontFamily.semiBold,
    fontSize: 17,
    color: colors.text.primary,
  },
  headerTintColor: colors.text.primary,
  headerShadowVisible: false,
  headerBackTitleStyle: {
    fontFamily: fontFamily.regular,
    fontSize: 15,
  },
};

function ScanStackNavigator() {
  return (
    <ScanStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <ScanStack.Screen name="ScanHome" component={ScanScreen} />
      <ScanStack.Screen
        name="Results"
        component={ResultsScreen}
        options={{
          headerShown: true,
          title: 'Scan Results',
          headerBackTitle: 'Back',
          ...screenOptions,
        }}
      />
      <ScanStack.Screen
        name="DetectionFailed"
        component={DetectionFailedScreen}
        options={{
          headerShown: true,
          title: '',
          headerBackTitle: 'Back',
          ...screenOptions,
        }}
      />
    </ScanStack.Navigator>
  );
}

function ListsStackNavigator() {
  return (
    <ListsStack.Navigator screenOptions={screenOptions}>
      <ListsStack.Screen
        name="ListsHome"
        component={ListsScreen}
        options={{
          headerShown: false,
        }}
      />
      <ListsStack.Screen
        name="RoomDetail"
        component={RoomDetailScreen}
        options={({ route }) => ({
          title: route.params.roomName,
          headerBackTitle: 'Back',
        })}
      />
    </ListsStack.Navigator>
  );
}

function MainAppNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color }) => {
          let iconName: keyof typeof Ionicons.glyphMap;
          const size = 24;

          if (route.name === 'Scan') {
            iconName = focused ? 'scan' : 'scan-outline';
          } else if (route.name === 'Lists') {
            iconName = focused ? 'bookmark' : 'bookmark-outline';
          } else {
            iconName = 'help-outline';
          }

          return (
            <View style={{
              alignItems: 'center',
              justifyContent: 'center',
              paddingTop: 6,
            }}>
              <Ionicons name={iconName} size={size} color={color} />
              {focused && (
                <View style={{
                  width: 4,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: colors.accent[500],
                  marginTop: 4,
                }} />
              )}
            </View>
          );
        },
        tabBarActiveTintColor: colors.text.primary,
        tabBarInactiveTintColor: colors.neutral[400],
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontFamily: fontFamily.medium,
          fontSize: 11,
          marginTop: 2,
        },
        tabBarStyle: {
          backgroundColor: colors.background.primary,
          borderTopWidth: 0,
          elevation: 0,
          shadowColor: colors.text.primary,
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.05,
          shadowRadius: 12,
          height: Platform.OS === 'ios' ? 88 : 64,
          paddingBottom: Platform.OS === 'ios' ? 28 : 8,
          paddingTop: 8,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen
        name="Scan"
        component={ScanStackNavigator}
        options={{
          tabBarLabel: 'Scan',
        }}
      />
      <Tab.Screen
        name="Lists"
        component={ListsStackNavigator}
        options={{
          tabBarLabel: 'Saved',
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const hasCompletedOnboarding = useOnboardingStore(
    (state) => state.hasCompletedOnboarding
  );

  if (!hasCompletedOnboarding) {
    return <OnboardingScreen />;
  }

  return (
    <NavigationContainer>
      <MainAppNavigator />
    </NavigationContainer>
  );
}
