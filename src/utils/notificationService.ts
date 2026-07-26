import { Booking } from '../types';
import { parseRideDepartureDateTime } from './timeUtils';

export interface RideNotificationPayload {
  bookingId: string;
  driverName: string;
  driverPhone: string;
  meetingPoint: string;
  origin: string;
  destination: string;
  departureTime: string;
  date: string;
  timestamp: number;
}

const NOTIFIED_STORAGE_KEY = 'tezzo_notified_ride_reminders';

export function getNotifiedBookingIds(): Set<string> {
  try {
    const raw = localStorage.getItem(NOTIFIED_STORAGE_KEY);
    if (raw) {
      return new Set(JSON.parse(raw));
    }
  } catch (e) {
    // Ignore storage errors
  }
  return new Set();
}

export function saveNotifiedBookingId(bookingId: string) {
  try {
    const set = getNotifiedBookingIds();
    set.add(bookingId);
    localStorage.setItem(NOTIFIED_STORAGE_KEY, JSON.stringify(Array.from(set)));
  } catch (e) {
    // Ignore
  }
}

/**
 * Checks if browser supports native Notification API
 */
export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

/**
 * Gets current notification permission status
 */
export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (!isNotificationSupported()) return 'unsupported';
  return Notification.permission;
}

/**
 * Requests browser notification permission from user
 */
export async function requestNotificationPermission(): Promise<NotificationPermission | 'unsupported'> {
  if (!isNotificationSupported()) return 'unsupported';
  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (e) {
    console.error('Error requesting notification permission:', e);
    return Notification.permission;
  }
}

/**
 * Triggers a local push-style browser notification for a scheduled 1-hour pre-ride alert
 */
export function sendRide1HourNotification(
  booking: Booking,
  isSimulation = false
): RideNotificationPayload {
  const driverName = booking.ride.driver.name;
  const driverPhone = booking.ride.driver.phone || '+91 98765 43210';
  const meetingPoint =
    booking.ride.originDetails || booking.ride.origin || 'Main Pickup Point';
  const origin = booking.ride.origin;
  const destination = booking.ride.destination;
  const departureTime = booking.ride.departureTime;
  const date = booking.ride.date;

  const payload: RideNotificationPayload = {
    bookingId: booking.id,
    driverName,
    driverPhone,
    meetingPoint,
    origin,
    destination,
    departureTime,
    date,
    timestamp: Date.now(),
  };

  const title = isSimulation
    ? `🔔 [Test Alert] 1 Hour Until Ride to ${destination}!`
    : `⏰ 1 Hour Until Departure to ${destination}!`;

  const body = `Driver: ${driverName} (${driverPhone})\nMeeting Point: ${meetingPoint}\nDeparture Time: ${departureTime}`;

  // Fire native Browser Notification if permitted
  if (isNotificationSupported() && Notification.permission === 'granted') {
    try {
      const n = new Notification(title, {
        body,
        icon: booking.ride.driver.avatar || '/favicon.ico',
        tag: `ride-reminder-${booking.id}`,
        requireInteraction: true,
      });

      n.onclick = () => {
        window.focus();
        n.close();
      };
    } catch (e) {
      console.warn('Native notification failed or blocked by iframe context:', e);
    }
  }

  // Mark as notified so we don't repeat automated alerts
  saveNotifiedBookingId(booking.id);

  return payload;
}

/**
 * Evaluates active confirmed bookings and automatically triggers 1-hour pre-ride notification
 * if departure is within 65 minutes (1 hour) and hasn't been notified yet.
 */
export function checkUpcomingBookingsFor1HourReminder(
  bookings: Booking[],
  onTriggerNotification?: (payload: RideNotificationPayload) => void
): RideNotificationPayload[] {
  const notifiedSet = getNotifiedBookingIds();
  const triggeredPayloads: RideNotificationPayload[] = [];
  const now = new Date();

  for (const booking of bookings) {
    if (booking.status === 'cancelled') continue;
    if (notifiedSet.has(booking.id)) continue;

    const departureDt = parseRideDepartureDateTime(booking.ride, now);
    if (!departureDt) {
      // If date is "Today" or "Tomorrow", treat as upcoming
      const dateLower = booking.ride.date.toLowerCase();
      if (dateLower === 'today') {
        // Fallback for relative today rides: trigger if not notified yet
        const payload = sendRide1HourNotification(booking);
        triggeredPayloads.push(payload);
        if (onTriggerNotification) onTriggerNotification(payload);
      }
      continue;
    }

    const diffMinutes = (departureDt.getTime() - now.getTime()) / (1000 * 60);

    // If departure is within 65 minutes (i.e. ~1 hour or less) and hasn't passed more than 15 mins ago
    if (diffMinutes <= 65 && diffMinutes >= -15) {
      const payload = sendRide1HourNotification(booking);
      triggeredPayloads.push(payload);
      if (onTriggerNotification) onTriggerNotification(payload);
    }
  }

  return triggeredPayloads;
}
