import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const notificationService = {
  // Register for push notifications
  async registerForPushNotifications() {
    let token: string | undefined;

    if (Platform.OS === 'web') {
      console.log('Push notifications not supported on web');
      return undefined;
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Failed to get push token for push notification!');
        return undefined;
      }

      try {
        token = (await Notifications.getExpoPushTokenAsync()).data;
        await AsyncStorage.setItem('pushToken', token);
      } catch (error) {
        console.error('Error getting push token:', error);
      }
    } else {
      console.log('Must use physical device for Push Notifications');
    }

    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#DAA520',
      });
    }

    return token;
  },

  // Schedule a local notification
  async scheduleLocalNotification(
    title: string,
    body: string,
    data?: Record<string, any>,
    trigger?: Notifications.NotificationTriggerInput
  ) {
    try {
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: data || {},
          sound: true,
        },
        trigger: trigger || null, // null means immediately
      });
      return id;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      return undefined;
    }
  },

  // Schedule notification for a session
  async scheduleSessionReminder(
    sessionId: string,
    title: string,
    date: string,
    time: string,
    minutesBefore: number = 60
  ) {
    try {
      // Parse the date and time
      const [year, month, day] = date.split('-').map(Number);
      const [timeStr] = time.split(' ');
      let [hours, minutes] = timeStr.split(':').map(Number);
      
      // Handle AM/PM
      if (time.toLowerCase().includes('pm') && hours !== 12) {
        hours += 12;
      } else if (time.toLowerCase().includes('am') && hours === 12) {
        hours = 0;
      }

      const sessionDate = new Date(year, month - 1, day, hours, minutes);
      const reminderDate = new Date(sessionDate.getTime() - minutesBefore * 60 * 1000);

      // Don't schedule if the reminder time has passed
      if (reminderDate <= new Date()) {
        console.log('Reminder time has already passed');
        return undefined;
      }

      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Upcoming Bible Study',
          body: `"${title}" starts in ${minutesBefore} minutes`,
          data: { sessionId, type: 'session_reminder' },
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: reminderDate,
        },
      });

      // Store the notification ID for later cancellation
      const storedReminders = await AsyncStorage.getItem('sessionReminders');
      const reminders = storedReminders ? JSON.parse(storedReminders) : {};
      reminders[sessionId] = id;
      await AsyncStorage.setItem('sessionReminders', JSON.stringify(reminders));

      return id;
    } catch (error) {
      console.error('Error scheduling session reminder:', error);
      return undefined;
    }
  },

  // Cancel a scheduled notification
  async cancelNotification(notificationId: string) {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch (error) {
      console.error('Error cancelling notification:', error);
    }
  },

  // Cancel session reminder
  async cancelSessionReminder(sessionId: string) {
    try {
      const storedReminders = await AsyncStorage.getItem('sessionReminders');
      if (storedReminders) {
        const reminders = JSON.parse(storedReminders);
        if (reminders[sessionId]) {
          await this.cancelNotification(reminders[sessionId]);
          delete reminders[sessionId];
          await AsyncStorage.setItem('sessionReminders', JSON.stringify(reminders));
        }
      }
    } catch (error) {
      console.error('Error cancelling session reminder:', error);
    }
  },

  // Notify about new prayer request
  async notifyNewPrayer(title: string, requestedBy: string, isAnonymous: boolean) {
    return this.scheduleLocalNotification(
      'New Prayer Request',
      isAnonymous ? `A new prayer request: "${title}"` : `${requestedBy} needs prayer: "${title}"`,
      { type: 'new_prayer' }
    );
  },

  // Notify about new announcement
  async notifyNewAnnouncement(title: string, authorName: string) {
    return this.scheduleLocalNotification(
      'New Announcement',
      `${authorName}: ${title}`,
      { type: 'new_announcement' }
    );
  },

  // Cancel all notifications
  async cancelAllNotifications() {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      await AsyncStorage.removeItem('sessionReminders');
    } catch (error) {
      console.error('Error cancelling all notifications:', error);
    }
  },

  // Get all scheduled notifications
  async getScheduledNotifications() {
    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error getting scheduled notifications:', error);
      return [];
    }
  },
};
