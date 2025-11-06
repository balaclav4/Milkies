import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Provider as PaperProvider, MD3LightTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { View, Text } from 'react-native';

import PumpingScreen from './src/screens/PumpingScreen';
import FeedingScreen from './src/screens/FeedingScreen';
import StatsScreen from './src/screens/StatsScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import ApiService from './src/services/api';

const Tab = createBottomTabNavigator();

const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#9333ea',
    secondary: '#ec4899',
    tertiary: '#10b981',
  },
};

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [apiConnected, setApiConnected] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Load saved API URL
        await ApiService.loadSavedBaseUrl();

        // Check API connection
        const health = await ApiService.healthCheck();
        if (health.success) {
          setApiConnected(true);
        }
      } catch (error) {
        console.log('API not connected on startup:', error);
        setApiConnected(false);
      } finally {
        setIsReady(true);
      }
    }

    prepare();
  }, []);

  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading Milkies...</Text>
      </View>
    );
  }

  return (
    <PaperProvider theme={theme}>
      <NavigationContainer>
        <StatusBar style="auto" />
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              let iconName;

              if (route.name === 'Pumping') {
                iconName = 'bottle-tonic';
              } else if (route.name === 'Feeding') {
                iconName = 'baby-bottle';
              } else if (route.name === 'Stats') {
                iconName = 'chart-line';
              } else if (route.name === 'Settings') {
                iconName = 'cog';
              }

              return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: '#9333ea',
            tabBarInactiveTintColor: 'gray',
            headerStyle: {
              backgroundColor: '#9333ea',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          })}
        >
          <Tab.Screen
            name="Pumping"
            component={PumpingScreen}
            options={{ title: 'My Pumping' }}
          />
          <Tab.Screen
            name="Feeding"
            component={FeedingScreen}
            options={{ title: "Baby's Feeding" }}
          />
          <Tab.Screen
            name="Stats"
            component={StatsScreen}
            options={{ title: 'Statistics' }}
          />
          <Tab.Screen
            name="Settings"
            component={SettingsScreen}
            options={{ title: 'Settings' }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}
