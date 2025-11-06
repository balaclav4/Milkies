import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  TextInput,
  Switch,
  Divider,
  List,
} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import ApiService from '../services/api';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export default function SettingsScreen() {
  const [apiUrl, setApiUrl] = useState('http://localhost:5000/api');
  const [apiConnected, setApiConnected] = useState(false);
  const [testing, setTesting] = useState(false);

  // Notification settings
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [pumpReminders, setPumpReminders] = useState(false);
  const [reminderInterval, setReminderInterval] = useState('3');

  useEffect(() => {
    loadSettings();
    checkPermissions();
  }, []);

  const loadSettings = async () => {
    try {
      const savedUrl = await AsyncStorage.getItem('api_base_url');
      if (savedUrl) {
        setApiUrl(savedUrl);
      }

      const notifEnabled = await AsyncStorage.getItem('notifications_enabled');
      setNotificationsEnabled(notifEnabled === 'true');

      const pumpRem = await AsyncStorage.getItem('pump_reminders');
      setPumpReminders(pumpRem === 'true');

      const interval = await AsyncStorage.getItem('reminder_interval');
      if (interval) {
        setReminderInterval(interval);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const checkPermissions = async () => {
    const { status } = await Notifications.getPermissionsAsync();
    setNotificationsEnabled(status === 'granted');
  };

  const testConnection = async () => {
    try {
      setTesting(true);
      const health = await ApiService.healthCheck();

      if (health.success) {
        setApiConnected(true);
        Alert.alert('Success', 'Connected to API server!');
      }
    } catch (error) {
      setApiConnected(false);
      Alert.alert(
        'Connection Failed',
        'Could not connect to API server. Please check the URL and ensure the server is running.'
      );
    } finally {
      setTesting(false);
    }
  };

  const saveApiUrl = async () => {
    try {
      await AsyncStorage.setItem('api_base_url', apiUrl);
      ApiService.setBaseUrl(apiUrl);
      Alert.alert('Success', 'API URL saved!');
      testConnection();
    } catch (error) {
      Alert.alert('Error', 'Failed to save API URL');
    }
  };

  const requestNotificationPermissions = async () => {
    const { status } = await Notifications.requestPermissionsAsync();

    if (status === 'granted') {
      setNotificationsEnabled(true);
      await AsyncStorage.setItem('notifications_enabled', 'true');
      Alert.alert('Success', 'Notifications enabled!');
    } else {
      setNotificationsEnabled(false);
      Alert.alert('Permission Denied', 'Please enable notifications in your device settings.');
    }
  };

  const togglePumpReminders = async (value) => {
    setPumpReminders(value);
    await AsyncStorage.setItem('pump_reminders', value.toString());

    if (value) {
      await schedulePumpReminders();
    } else {
      await Notifications.cancelAllScheduledNotificationsAsync();
    }
  };

  const schedulePumpReminders = async () => {
    // Cancel existing notifications
    await Notifications.cancelAllScheduledNotificationsAsync();

    const interval = parseInt(reminderInterval);
    const hours = [6, 9, 12, 15, 18, 21]; // Default pump times

    for (const hour of hours) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🍼 Time to Pump!',
          body: 'Remember to track your pumping session in Milkies',
          sound: true,
        },
        trigger: {
          hour,
          minute: 0,
          repeats: true,
        },
      });
    }

    Alert.alert('Success', 'Pump reminders scheduled!');
  };

  const saveReminderInterval = async () => {
    await AsyncStorage.setItem('reminder_interval', reminderInterval);
    if (pumpReminders) {
      await schedulePumpReminders();
    }
  };

  const clearCache = async () => {
    Alert.alert(
      'Clear Cache',
      'This will clear all locally stored data. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              const keys = await AsyncStorage.getAllKeys();
              const dataKeys = keys.filter(key => key.startsWith('cached_'));
              await AsyncStorage.multiRemove(dataKeys);
              Alert.alert('Success', 'Cache cleared!');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear cache');
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* API Settings */}
      <Card style={styles.card} mode="elevated">
        <Card.Content>
          <Title>API Server Settings</Title>
          <Divider style={styles.divider} />

          <Paragraph style={styles.helpText}>
            Enter the URL of your Milk Tracker API server. For local development, use your
            computer's IP address (not localhost).
          </Paragraph>

          <TextInput
            label="API Base URL"
            value={apiUrl}
            onChangeText={setApiUrl}
            mode="outlined"
            style={styles.input}
            placeholder="http://192.168.1.100:5000/api"
          />

          <View style={styles.buttonRow}>
            <Button
              mode="outlined"
              onPress={testConnection}
              loading={testing}
              style={styles.button}
            >
              Test Connection
            </Button>
            <Button
              mode="contained"
              onPress={saveApiUrl}
              style={styles.button}
            >
              Save URL
            </Button>
          </View>

          {apiConnected && (
            <Paragraph style={styles.successText}>
              ✅ Connected to API server
            </Paragraph>
          )}
        </Card.Content>
      </Card>

      {/* Notification Settings */}
      <Card style={styles.card} mode="elevated">
        <Card.Content>
          <Title>Notifications</Title>
          <Divider style={styles.divider} />

          <List.Item
            title="Enable Notifications"
            description="Receive pump reminders and alerts"
            left={() => <List.Icon icon="bell" />}
            right={() => (
              <Switch
                value={notificationsEnabled}
                onValueChange={requestNotificationPermissions}
              />
            )}
          />

          <Divider />

          <List.Item
            title="Pump Reminders"
            description="Get reminded to pump throughout the day"
            left={() => <List.Icon icon="alarm" />}
            right={() => (
              <Switch
                value={pumpReminders}
                onValueChange={togglePumpReminders}
                disabled={!notificationsEnabled}
              />
            )}
          />

          {pumpReminders && (
            <>
              <Divider style={styles.divider} />
              <Paragraph>Reminder Interval (hours)</Paragraph>
              <TextInput
                value={reminderInterval}
                onChangeText={setReminderInterval}
                mode="outlined"
                keyboardType="number-pad"
                style={styles.input}
              />
              <Button mode="outlined" onPress={saveReminderInterval}>
                Update Interval
              </Button>
            </>
          )}
        </Card.Content>
      </Card>

      {/* Data Management */}
      <Card style={styles.card} mode="elevated">
        <Card.Content>
          <Title>Data Management</Title>
          <Divider style={styles.divider} />

          <Button
            mode="outlined"
            icon="delete"
            onPress={clearCache}
            style={styles.actionButton}
          >
            Clear Cache
          </Button>

          <Paragraph style={styles.helpText}>
            Clear locally cached data to free up space. This won't affect your data on the server.
          </Paragraph>
        </Card.Content>
      </Card>

      {/* About */}
      <Card style={styles.card} mode="elevated">
        <Card.Content>
          <Title>About Milkies</Title>
          <Divider style={styles.divider} />

          <Paragraph style={styles.aboutText}>
            <Text style={{ fontWeight: 'bold' }}>Milkies</Text> - Breastfeeding & Pumping Tracker
          </Paragraph>
          <Paragraph style={styles.aboutText}>Version 1.0.0</Paragraph>
          <Paragraph style={styles.aboutText}>
            Track your pumping sessions and baby's feeding to optimize your milk supply.
          </Paragraph>

          <Divider style={styles.divider} />

          <Paragraph style={styles.helpText}>
            💡 <Text style={{ fontWeight: 'bold' }}>Tips:</Text>
          </Paragraph>
          <Paragraph style={styles.helpText}>
            • Track consistently for best insights
          </Paragraph>
          <Paragraph style={styles.helpText}>
            • Aim for 3-5 oz daily surplus for freezer stash
          </Paragraph>
          <Paragraph style={styles.helpText}>
            • Export your data regularly for backups
          </Paragraph>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  card: {
    margin: 16,
  },
  divider: {
    marginVertical: 12,
  },
  helpText: {
    marginVertical: 8,
    color: '#6b7280',
    fontSize: 14,
  },
  input: {
    marginVertical: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  button: {
    flex: 1,
  },
  successText: {
    color: '#10b981',
    marginTop: 8,
    fontWeight: 'bold',
  },
  actionButton: {
    marginVertical: 8,
  },
  aboutText: {
    marginVertical: 4,
  },
});
