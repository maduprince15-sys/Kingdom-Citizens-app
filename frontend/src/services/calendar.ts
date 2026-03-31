import * as Calendar from 'expo-calendar';
import { Platform, Alert } from 'react-native';

export const calendarService = {
  // Request calendar permissions
  async requestPermissions(): Promise<boolean> {
    if (Platform.OS === 'web') {
      console.log('Calendar not supported on web');
      return false;
    }

    try {
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error requesting calendar permissions:', error);
      return false;
    }
  },

  // Get or create Kingdom Citizens calendar
  async getOrCreateCalendar(): Promise<string | undefined> {
    if (Platform.OS === 'web') return undefined;

    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        Alert.alert('Permission Required', 'Please grant calendar access to add events.');
        return undefined;
      }

      // Get existing calendars
      const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
      
      // Look for our app's calendar
      const existingCalendar = calendars.find(cal => cal.title === 'Kingdom Citizens');
      if (existingCalendar) {
        return existingCalendar.id;
      }

      // Create a new calendar for the app
      const defaultCalendarSource = Platform.OS === 'ios'
        ? calendars.find(cal => cal.source?.name === 'iCloud')?.source ||
          calendars.find(cal => cal.source?.name === 'Default')?.source ||
          calendars[0]?.source
        : { isLocalAccount: true, name: 'Kingdom Citizens', type: Calendar.SourceType.LOCAL };

      if (!defaultCalendarSource) {
        console.error('No calendar source available');
        return undefined;
      }

      const newCalendarId = await Calendar.createCalendarAsync({
        title: 'Kingdom Citizens',
        color: '#DAA520',
        entityType: Calendar.EntityTypes.EVENT,
        sourceId: defaultCalendarSource.id,
        source: defaultCalendarSource,
        name: 'Kingdom Citizens Bible Studies',
        ownerAccount: 'personal',
        accessLevel: Calendar.CalendarAccessLevel.OWNER,
      });

      return newCalendarId;
    } catch (error) {
      console.error('Error getting/creating calendar:', error);
      return undefined;
    }
  },

  // Add a study session to the calendar
  async addSessionToCalendar(
    title: string,
    description: string | undefined,
    date: string,
    time: string,
    location: string | undefined,
    scriptureReference: string | undefined
  ): Promise<string | undefined> {
    if (Platform.OS === 'web') {
      Alert.alert('Not Supported', 'Calendar integration is not available on web.');
      return undefined;
    }

    try {
      const calendarId = await this.getOrCreateCalendar();
      if (!calendarId) {
        return undefined;
      }

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

      const startDate = new Date(year, month - 1, day, hours, minutes || 0);
      const endDate = new Date(startDate.getTime() + 90 * 60 * 1000); // 90 minutes duration

      // Build notes
      let notes = '';
      if (scriptureReference) {
        notes += `Scripture: ${scriptureReference}\n\n`;
      }
      if (description) {
        notes += description;
      }

      const eventId = await Calendar.createEventAsync(calendarId, {
        title: `📖 ${title}`,
        startDate,
        endDate,
        location: location || '',
        notes: notes || 'Kingdom Citizens Bible Study Session',
        alarms: [
          { relativeOffset: -60 }, // 1 hour before
          { relativeOffset: -15 }, // 15 minutes before
        ],
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      });

      Alert.alert(
        'Added to Calendar',
        `"${title}" has been added to your Kingdom Citizens calendar.`,
        [{ text: 'OK' }]
      );

      return eventId;
    } catch (error) {
      console.error('Error adding event to calendar:', error);
      Alert.alert('Error', 'Failed to add event to calendar. Please try again.');
      return undefined;
    }
  },

  // Delete an event from calendar
  async removeEventFromCalendar(eventId: string): Promise<boolean> {
    if (Platform.OS === 'web') return false;

    try {
      await Calendar.deleteEventAsync(eventId);
      return true;
    } catch (error) {
      console.error('Error removing event from calendar:', error);
      return false;
    }
  },
};
