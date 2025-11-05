import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

class NotificationService {
  async requestPermissions() {
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  }

  async checkPermissions() {
    const { status } = await Notifications.getPermissionsAsync();
    return status === 'granted';
  }

  async schedulePumpReminder(hour, minute = 0) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🍼 Time to Pump!',
        body: 'Remember to track your pumping session in Milkies',
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: {
        hour,
        minute,
        repeats: true,
      },
    });
  }

  async scheduleDailyPumpReminders() {
    // Clear existing notifications
    await this.cancelAllNotifications();

    // Default pump times: 6am, 9am, 12pm, 3pm, 6pm, 9pm
    const pumpTimes = [6, 9, 12, 15, 18, 21];

    for (const hour of pumpTimes) {
      await this.schedulePumpReminder(hour);
    }

    await AsyncStorage.setItem('pump_reminders_scheduled', 'true');
  }

  async scheduleCustomReminder(title, body, triggerDate) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: true,
      },
      trigger: triggerDate,
    });
  }

  async sendLocalNotification(title, body) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: true,
      },
      trigger: null, // Send immediately
    });
  }

  async cancelAllNotifications() {
    await Notifications.cancelAllScheduledNotificationsAsync();
    await AsyncStorage.setItem('pump_reminders_scheduled', 'false');
  }

  async cancelNotification(notificationId) {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  }

  // Get all scheduled notifications
  async getScheduledNotifications() {
    return await Notifications.getAllScheduledNotificationsAsync();
  }

  // Daily goal notification
  async sendDailyGoalNotification(currentAmount, goalAmount) {
    if (currentAmount >= goalAmount) {
      await this.sendLocalNotification(
        '🎉 Daily Goal Achieved!',
        `You've pumped ${currentAmount} oz today. Great job!`
      );
    }
  }

  // Low supply alert
  async sendLowSupplyAlert(currentAmount, averageAmount) {
    if (currentAmount < averageAmount * 0.7) {
      await this.sendLocalNotification(
        '⚠️ Supply Alert',
        'Your pumping output is below average today. Consider adding an extra session.'
      );
    }
  }

  // Milestone notifications
  async sendMilestoneNotification(totalOunces) {
    const milestones = [100, 250, 500, 1000, 2000];

    for (const milestone of milestones) {
      if (Math.abs(totalOunces - milestone) < 5) {
        await this.sendLocalNotification(
          '🏆 Milestone Achieved!',
          `You've pumped ${milestone} total ounces! Amazing work!`
        );
        break;
      }
    }
  }
}

export default new NotificationService();
