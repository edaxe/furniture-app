import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import ScanScreen from '../screens/ScanScreen';
import ResultsScreen from '../screens/ResultsScreen';
import DetectionFailedScreen from '../screens/DetectionFailedScreen';
import ListsScreen from '../screens/ListsScreen';
import RoomDetailScreen from '../screens/RoomDetailScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import { useOnboardingStore } from '../store/onboardingStore';

import {
  RootTabParamList,
  ScanStackParamList,
  ListsStackParamList,
} from './types';

const Tab = createBottomTabNavigator<RootTabParamList>();
const ScanStack = createNativeStackNavigator<ScanStackParamList>();
const ListsStack = createNativeStackNavigator<ListsStackParamList>();

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
          title: 'Results',
          headerBackTitle: 'Back',
        }}
      />
      <ScanStack.Screen
        name="DetectionFailed"
        component={DetectionFailedScreen}
        options={{
          headerShown: true,
          title: 'Detection Failed',
          headerBackTitle: 'Back',
        }}
      />
    </ScanStack.Navigator>
  );
}

function ListsStackNavigator() {
  return (
    <ListsStack.Navigator>
      <ListsStack.Screen
        name="ListsHome"
        component={ListsScreen}
        options={{
          title: 'My Lists',
        }}
      />
      <ListsStack.Screen
        name="RoomDetail"
        component={RoomDetailScreen}
        options={({ route }) => ({
          title: route.params.roomName,
          headerBackTitle: 'Lists',
        })}
      />
    </ListsStack.Navigator>
  );
}

function MainAppNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Scan') {
            iconName = focused ? 'camera' : 'camera-outline';
          } else if (route.name === 'Lists') {
            iconName = focused ? 'list' : 'list-outline';
          } else {
            iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
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
          tabBarLabel: 'My Lists',
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
