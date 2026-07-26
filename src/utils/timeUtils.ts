import { Ride } from '../types';

/**
 * Parses the departure date and time of a ride.
 * Returns a Date object representing the scheduled departure, or null if unparseable.
 */
export function parseRideDepartureDateTime(ride: Ride, refDate: Date = new Date()): Date | null {
  const dateStr = ride.date.trim();
  let departureDate = new Date(refDate);

  if (dateStr.toLowerCase() === 'today') {
    // Departure is scheduled for today
  } else if (dateStr.toLowerCase() === 'tomorrow') {
    departureDate.setDate(departureDate.getDate() + 1);
  } else if (dateStr.toLowerCase() === 'yesterday') {
    departureDate.setDate(departureDate.getDate() - 1);
  } else {
    // Attempt parsing as standard date string e.g. YYYY-MM-DD
    const parsed = new Date(dateStr);
    if (!isNaN(parsed.getTime())) {
      departureDate = parsed;
    } else {
      // For general textual dates like "This Weekend", treat as future date
      return null;
    }
  }

  // Parse time e.g., "08:30 AM", "09:15 PM", "14:30"
  const timeStr = ride.departureTime.trim();

  // Match 12-hour format e.g. "08:30 AM" or "9:15PM"
  const match12 = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (match12) {
    let h = parseInt(match12[1], 10);
    const m = parseInt(match12[2], 10);
    const ampm = match12[3].toUpperCase();
    if (ampm === 'PM' && h < 12) h += 12;
    if (ampm === 'AM' && h === 12) h = 0;
    departureDate.setHours(h, m, 0, 0);
    return departureDate;
  }

  // Match 24-hour format e.g. "18:30"
  const match24 = timeStr.match(/^(\d{1,2}):(\d{2})$/);
  if (match24) {
    const h = parseInt(match24[1], 10);
    const m = parseInt(match24[2], 10);
    departureDate.setHours(h, m, 0, 0);
    return departureDate;
  }

  return null;
}

/**
 * Determines whether a ride's departure time is within the next 24 hours.
 */
export function isTripWithinNext24Hours(ride: Ride, refDate: Date = new Date()): boolean {
  if (ride.date.toLowerCase() === 'yesterday') return false;

  const dateLower = ride.date.toLowerCase();
  if (dateLower === 'today' || dateLower === 'tomorrow') {
    return true;
  }

  const departureDt = parseRideDepartureDateTime(ride, refDate);
  if (!departureDt) {
    return false;
  }

  const nowMs = refDate.getTime();
  const depMs = departureDt.getTime();
  const diffHours = (depMs - nowMs) / (1000 * 60 * 60);

  return diffHours >= -2 && diffHours <= 24;
}

/**
 * Determines whether a ride's departure time has already passed.
 */
export function isRidePast(ride: Ride, refDate: Date = new Date()): boolean {
  if (ride.date.toLowerCase() === 'yesterday') return true;

  const dt = parseRideDepartureDateTime(ride, refDate);
  if (!dt) return false;

  return refDate.getTime() > dt.getTime();
}
