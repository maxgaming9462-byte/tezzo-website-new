import { DriverReview } from '../types';
import { INITIAL_DRIVER_REVIEWS } from '../data/initialReviews';

const REVIEWS_STORAGE_KEY = 'tezzo_driver_reviews_v1';

/**
 * Get all reviews from localStorage or initial dataset
 */
export function getAllReviews(): DriverReview[] {
  try {
    const stored = localStorage.getItem(REVIEWS_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to load reviews from localStorage', e);
  }
  return INITIAL_DRIVER_REVIEWS;
}

/**
 * Get all reviews specifically for a driver
 */
export function getDriverReviews(driverName: string): DriverReview[] {
  const all = getAllReviews();
  return all.filter(
    (r) => r.driverName.toLowerCase().trim() === driverName.toLowerCase().trim()
  );
}

/**
 * Calculates the average rating and review count for a driver
 */
export function getDriverStats(
  driverName: string,
  baseRating = 4.8,
  baseCount = 50
): { averageRating: number; totalCount: number; reviews: DriverReview[] } {
  const reviews = getDriverReviews(driverName);
  if (reviews.length === 0) {
    return { averageRating: baseRating, totalCount: baseCount, reviews: [] };
  }

  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  const userAvg = sum / reviews.length;

  // Weighted average blending initial base reputation and actual reviews
  const totalCount = Math.max(baseCount, reviews.length);
  const averageRating = Number(userAvg.toFixed(1));

  return { averageRating, totalCount, reviews };
}

/**
 * Add a new driver review
 */
export function addDriverReview(review: Omit<DriverReview, 'id' | 'date'>): DriverReview {
  const newReview: DriverReview = {
    ...review,
    id: `rev-${Date.now()}`,
    date: 'Just now',
  };

  const current = getAllReviews();
  const updated = [newReview, ...current];

  try {
    localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save review to localStorage', e);
  }

  return newReview;
}

/**
 * Check if a booking or user has already reviewed a driver
 */
export function hasUserReviewedBooking(bookingId: string): boolean {
  const all = getAllReviews();
  return all.some((r) => r.bookingId === bookingId);
}
