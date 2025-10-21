import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getPrayerTimes, getNextPrayer, isPrayerTime, formatTime12Hour } from './prayerService';
import type { PrayerTime } from '../types';

const NOTIFICATION_SETTINGS_KEY = 'notification_settings';
const SCHEDULED_NOTIFICATIONS_KEY = 'scheduled_notifications';

interface NotificationSettings {
    enabled: boolean;
    fajr: boolean;
    dhuhr: boolean;
    asr: boolean;
    maghrib: boolean;
    isha: boolean;
    offsetMinutes: number;
    sound: boolean;
    vibrate: boolean;
}

interface ScheduledNotification {
    id: string;
    prayerName: string;
    time: string;
    date: string;
}

const DEFAULT_SETTINGS: NotificationSettings = {
    enabled: true,
    fajr: true,
    dhuhr: true,
    asr: true,
    maghrib: true,
    isha: true,
    offsetMinutes: 15,
    sound: true,
    vibrate: true,
};

/**
 * Initialize notification service
 */
export async function initializeNotifications(): Promise<void> {
    try {
        // Request permissions
        const { status } = await Notifications.requestPermissionsAsync();
        if (status !== 'granted') {
            console.log('Notification permissions not granted');
            return;
        }

        // Set notification handler
        Notifications.setNotificationHandler({
            handleNotification: async () => ({
                shouldShowAlert: true,
                shouldPlaySound: true,
                shouldSetBadge: false,
            }),
        });

        // Check if we need to schedule notifications
        const settings = await getNotificationSettings();
        if (settings.enabled) {
            await schedulePrayerNotifications();
        }
    } catch (error) {
        console.error('Error initializing notifications:', error);
    }
}

/**
 * Get notification settings
 */
export async function getNotificationSettings(): Promise<NotificationSettings> {
    try {
        const settings = await AsyncStorage.getItem(NOTIFICATION_SETTINGS_KEY);
        return settings ? JSON.parse(settings) : DEFAULT_SETTINGS;
    } catch (error) {
        console.error('Error getting notification settings:', error);
        return DEFAULT_SETTINGS;
    }
}

/**
 * Update notification settings
 */
export async function updateNotificationSettings(
    settings: Partial<NotificationSettings>
): Promise<void> {
    try {
        const currentSettings = await getNotificationSettings();
        const newSettings = { ...currentSettings, ...settings };

        await AsyncStorage.setItem(
            NOTIFICATION_SETTINGS_KEY,
            JSON.stringify(newSettings)
        );

        // Reschedule notifications if enabled
        if (newSettings.enabled) {
            await schedulePrayerNotifications();
        } else {
            await cancelAllPrayerNotifications();
        }
    } catch (error) {
        console.error('Error updating notification settings:', error);
    }
}

/**
 * Schedule prayer notifications for the day
 */
export async function schedulePrayerNotifications(): Promise<void> {
    try {
        const settings = await getNotificationSettings();
        if (!settings.enabled) return;

        // Cancel existing notifications
        await cancelAllPrayerNotifications();

        // Get prayer times
        const prayerTimes = await getPrayerTimes();
        const today = new Date().toISOString().split('T')[0];
        const scheduledNotifications: ScheduledNotification[] = [];

        // Schedule each prayer
        const prayers = [
            { name: 'Fajr', enabled: settings.fajr, time: prayerTimes.Fajr },
            { name: 'Dhuhr', enabled: settings.dhuhr, time: prayerTimes.Dhuhr },
            { name: 'Asr', enabled: settings.asr, time: prayerTimes.Asr },
            { name: 'Maghrib', enabled: settings.maghrib, time: prayerTimes.Maghrib },
            { name: 'Isha', enabled: settings.isha, time: prayerTimes.Isha },
        ];

        for (const prayer of prayers) {
            if (!prayer.enabled || !prayer.time) continue;

            const [hours, minutes] = prayer.time.split(':').map(Number);
            const notificationDate = new Date();
            notificationDate.setHours(hours, minutes - settings.offsetMinutes, 0, 0);

            // Skip if time has passed
            if (notificationDate.getTime() < Date.now()) continue;

            const notificationId = `${prayer.name.toLowerCase()}-${today}`;

            await Notifications.scheduleNotificationAsync({
                content: {
                    title: `Time for ${prayer.name} Prayer`,
                    body: `It's time for ${prayer.name} prayer at ${formatTime12Hour(prayer.time)}`,
                    data: { prayerName: prayer.name, time: prayer.time },
                },
                trigger: {
                  type: Notifications.SchedulableTriggerInputTypes.DATE,
                  date: notificationDate,
                },
                identifier: notificationId,
            });

            scheduledNotifications.push({
                id: notificationId,
                prayerName: prayer.name,
                time: prayer.time,
                date: today,
            });
        }

        // Save scheduled notifications
        await AsyncStorage.setItem(
            SCHEDULED_NOTIFICATIONS_KEY,
            JSON.stringify(scheduledNotifications)
        );

        console.log(`Scheduled ${scheduledNotifications.length} prayer notifications`);
    } catch (error) {
        console.error('Error scheduling prayer notifications:', error);
    }
}

/**
 * Cancel all prayer notifications
 */
export async function cancelAllPrayerNotifications(): Promise<void> {
    try {
        const scheduledNotifications = await AsyncStorage.getItem(
            SCHEDULED_NOTIFICATIONS_KEY
        );

        if (scheduledNotifications) {
            const notifications: ScheduledNotification[] = JSON.parse(scheduledNotifications);

            for (const notification of notifications) {
                await Notifications.cancelScheduledNotificationAsync(notification.id);
            }
        }

        await AsyncStorage.removeItem(SCHEDULED_NOTIFICATIONS_KEY);
        console.log('Cancelled all prayer notifications');
    } catch (error) {
        console.error('Error cancelling notifications:', error);
    }
}

/**
 * Check if it's time for any prayer and show notification
 */
export async function checkAndShowPrayerNotifications(): Promise<void> {
    try {
        const settings = await getNotificationSettings();
        if (!settings.enabled) return;

        const prayerTimes = await getPrayerTimes();
        const prayers = [
            { name: 'Fajr', enabled: settings.fajr, time: prayerTimes.Fajr },
            { name: 'Dhuhr', enabled: settings.dhuhr, time: prayerTimes.Dhuhr },
            { name: 'Asr', enabled: settings.asr, time: prayerTimes.Asr },
            { name: 'Maghrib', enabled: settings.maghrib, time: prayerTimes.Maghrib },
            { name: 'Isha', enabled: settings.isha, time: prayerTimes.Isha },
        ];

        for (const prayer of prayers) {
            if (!prayer.enabled || !prayer.time) continue;

            if (isPrayerTime(prayer.time, settings.offsetMinutes)) {
                const notificationId = `immediate-${prayer.name.toLowerCase()}-${Date.now()}`;

                await Notifications.scheduleNotificationAsync({
                    content: {
                        title: `Time for ${prayer.name} Prayer`,
                        body: `It's time for ${prayer.name} prayer at ${formatTime12Hour(prayer.time)}`,
                        data: { prayerName: prayer.name, time: prayer.time },
                    },
                    trigger: null, // Show immediately
                    identifier: notificationId,
                });

                // Only show one notification at a time
                break;
            }
        }
    } catch (error) {
        console.error('Error checking prayer notifications:', error);
    }
}

/**
 * Show a test notification
 */
export async function showTestNotification(): Promise<void> {
    try {
        await Notifications.scheduleNotificationAsync({
            content: {
                title: 'Test Notification',
                body: 'This is a test notification from QuranPulse',
                data: { type: 'test' },
            },
            trigger: null, // Show immediately
            identifier: `test-${Date.now()}`,
        });
    } catch (error) {
        console.error('Error showing test notification:', error);
    }
}

/**
 * Schedule daily notification refresh
 * This will reschedule notifications for the next day
 */
export async function scheduleDailyRefresh(): Promise<void> {
    try {
        // Schedule for midnight (next day)
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 5, 0, 0); // 12:05 AM

        await Notifications.scheduleNotificationAsync({
            content: {
                title: 'Prayer Notifications Updated',
                body: 'Prayer times have been updated for today',
                data: { type: 'daily-refresh' },
            },
            trigger: {
              type: Notifications.SchedulableTriggerInputTypes.DATE,
              date: tomorrow,
            },
            identifier: 'daily-refresh',
        });

        console.log('Scheduled daily notification refresh for', tomorrow);
    } catch (error) {
        console.error('Error scheduling daily refresh:', error);
    }
}

/**
 * Get scheduled notifications list
 */
export async function getScheduledNotifications(): Promise<ScheduledNotification[]> {
    try {
        const scheduledNotifications = await AsyncStorage.getItem(
            SCHEDULED_NOTIFICATIONS_KEY
        );

        return scheduledNotifications ? JSON.parse(scheduledNotifications) : [];
    } catch (error) {
        console.error('Error getting scheduled notifications:', error);
        return [];
    }
}

/**
 * Check if notifications are enabled
 */
export async function areNotificationsEnabled(): Promise<boolean> {
    try {
        const settings = await getNotificationSettings();
        return settings.enabled;
    } catch (error) {
        console.error('Error checking notification status:', error);
        return false;
    }
}