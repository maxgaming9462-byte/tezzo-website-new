import { Ride } from '../types';

/**
 * Known approximate road distances (in km) for top popular routes from New Delhi.
 */
const ROUTE_DISTANCES_KM: Record<string, number> = {
  'gurgaon': 32,
  'noida': 25,
  'rohtak': 75,
  'jaipur': 280,
  'chandigarh': 245,
};

/**
 * Average CO2 saved per passenger-km by sharing an existing car trip instead of driving separately.
 * Standard benchmark: ~120 grams (0.12 kg) CO2 saved per km per passenger.
 */
const CO2_SAVED_KG_PER_KM = 0.12;

/**
 * Calculates estimated distance in km for a given ride based on origin/destination or duration.
 */
export function estimateRideDistanceKm(ride: Ride): number {
  const destLower = ride.destination.toLowerCase().trim();
  const originLower = ride.origin.toLowerCase().trim();

  // Match predefined routes
  for (const [routeKey, dist] of Object.entries(ROUTE_DISTANCES_KM)) {
    if (destLower.includes(routeKey) || originLower.includes(routeKey)) {
      return dist;
    }
  }

  // Fallback estimate based on duration string (e.g. "45 mins", "1h 30m", "4h 00m")
  const durationStr = ride.duration.toLowerCase();
  let totalMinutes = 45; // default fallback

  const hourMatch = durationStr.match(/(\d+)\s*h/);
  const minMatch = durationStr.match(/(\d+)\s*m/);

  if (hourMatch || minMatch) {
    const hours = hourMatch ? parseInt(hourMatch[1], 10) : 0;
    const mins = minMatch ? parseInt(minMatch[1], 10) : 0;
    totalMinutes = hours * 60 + mins;
  }

  // Assuming an average urban/highway speed of ~50 km/h
  return Math.round((totalMinutes / 60) * 50);
}

export interface CO2CalculationResult {
  distanceKm: number;
  co2SavedKg: number;
  treesEquivalent: number;
}

/**
 * Calculates estimated CO2 emissions saved in kg for a given ride and number of seats booked.
 */
export function calculateCO2Savings(ride: Ride, seatsBooked: number = 1): CO2CalculationResult {
  const distanceKm = estimateRideDistanceKm(ride);
  const co2SavedKg = Math.round(distanceKm * CO2_SAVED_KG_PER_KM * seatsBooked * 10) / 10;
  
  // 1 tree absorbs ~0.06 kg CO2 per day (~22 kg/year)
  const treesEquivalent = Math.max(1, Math.round((co2SavedKg / 0.1) * 10) / 10);

  return {
    distanceKm,
    co2SavedKg,
    treesEquivalent,
  };
}
