import React from 'react';
import { Star, ShieldCheck, Zap, User, Car, Clock, ArrowRight, AlertCircle, Leaf, CheckCircle2 } from 'lucide-react';
import { Ride, Driver } from '../types';
import { isRidePast } from '../utils/timeUtils';
import { calculateCO2Savings } from '../utils/co2Utils';
import { getDriverStats } from '../utils/reviewService';

interface RideCardProps {
  ride: Ride;
  onSelectRide: (ride: Ride) => void;
  onOpenDriverReviews?: (driver: Driver, bookingId?: string, rideRoute?: string) => void;
}

export const RideCard: React.FC<RideCardProps> = ({
  ride,
  onSelectRide,
  onOpenDriverReviews,
}) => {
  const isPast = isRidePast(ride);
  const driverStats = getDriverStats(
    ride.driver.name,
    ride.driver.rating,
    ride.driver.reviewsCount
  );

  return (
    <div
      className={`rounded-2xl p-5 sm:p-6 border transition-all flex flex-col justify-between gap-5 group ${
        isPast
          ? 'bg-[var(--color-surface-container-low)] border-[var(--color-outline-variant)] opacity-75 grayscale-[20%]'
          : 'bg-white border-[var(--color-border)] shadow-xs hover:shadow-md'
      }`}
    >
      {/* Driver Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[var(--color-surface-container)]">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={ride.driver.avatar}
              alt={ride.driver.name}
              className={`w-11 h-11 rounded-full object-cover border-2 ${
                isPast ? 'border-[var(--color-outline)]' : 'border-[var(--color-primary)]'
              }`}
            />
            {ride.driver.verified && (
              <ShieldCheck
                className={`w-4 h-4 absolute -bottom-1 -right-1 bg-white rounded-full ${
                  isPast ? 'text-[var(--color-outline)] fill-[var(--color-surface-container)]' : 'text-[var(--color-primary)] fill-[var(--color-accent-mint)]'
                }`}
              />
            )}
          </div>
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <h4 className="font-bold text-sm text-[var(--color-on-surface)]">{ride.driver.name}</h4>
              {ride.driver.verified && (
                <span
                  className="inline-flex items-center gap-1 bg-[var(--color-success-bg-soft)] text-[var(--color-primary)] border border-[var(--color-primary-light)] text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                  title="Verified Driver"
                >
                  <CheckCircle2 className="w-3 h-3 text-[var(--color-primary)] fill-[var(--color-accent-mint)]" />
                  <span>Verified Driver</span>
                </span>
              )}
              {isPast && (
                <span className="bg-[var(--color-border)] text-[var(--color-outline)] border border-[var(--color-outline-variant)] text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 text-[var(--color-outline)]" />
                  DEPARTED
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-[var(--color-on-surface-variant)] mt-0.5">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onOpenDriverReviews) {
                    onOpenDriverReviews(
                      ride.driver,
                      undefined,
                      `${ride.origin} → ${ride.destination}`
                    );
                  }
                }}
                className="flex items-center gap-1 font-extrabold text-[var(--color-warning-text)] hover:text-[var(--color-primary)] hover:bg-[var(--color-success-bg-soft)] px-1.5 py-0.5 rounded-md border border-transparent hover:border-[var(--color-primary-light)] transition-all cursor-pointer"
                title="Click to view driver ratings and reviews"
              >
                <Star className="w-3.5 h-3.5 fill-[var(--color-secondary-container)] text-[var(--color-warning-text)]" />
                <span>{driverStats.averageRating.toFixed(1)}</span>
                <span className="text-[10px] text-[var(--color-outline)] underline font-semibold ml-0.5">
                  ({driverStats.totalCount})
                </span>
              </button>
              <span>•</span>
              <span>{ride.driver.ridesCompleted} rides</span>
            </div>
          </div>
        </div>

        {isPast ? (
          <span className="inline-flex items-center gap-1 bg-[var(--color-border)] text-[var(--color-outline)] border border-[var(--color-outline-variant)] text-xs font-semibold px-2.5 py-1 rounded-full">
            <Clock className="w-3.5 h-3.5" />
            Departed
          </span>
        ) : ride.instantBooking ? (
          <span className="inline-flex items-center gap-1 bg-[var(--color-success-bg)] text-[var(--color-primary)] border border-[var(--color-outline-variant)] text-xs font-semibold px-2.5 py-1 rounded-full">
            <Zap className="w-3.5 h-3.5 fill-[var(--color-primary)]" />
            Instant
          </span>
        ) : null}
      </div>

      {/* Route & Timing */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-3 flex-1">
          {/* Origin */}
          <div className="flex items-start gap-3">
            <div className="flex flex-col items-center mt-1">
              <div
                className={`w-3 h-3 rounded-full border-2 bg-white ${
                  isPast ? 'border-[var(--color-outline)]' : 'border-[var(--color-primary)]'
                }`}
              ></div>
              <div className="w-0.5 h-8 bg-[var(--color-outline-variant)] my-0.5"></div>
              <div
                className={`w-3 h-3 rounded-full ${
                  isPast ? 'bg-[var(--color-outline)]' : 'bg-[var(--color-primary)]'
                }`}
              ></div>
            </div>
            <div className="flex flex-col gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`font-bold text-sm ${
                      isPast ? 'text-[var(--color-outline)] line-through' : 'text-[var(--color-on-surface)]'
                    }`}
                  >
                    {ride.departureTime}
                  </span>
                  <span className="font-bold text-sm text-[var(--color-on-surface)]">{ride.origin}</span>
                </div>
                {ride.originDetails && (
                  <p className="text-xs text-[var(--color-outline)] truncate max-w-xs">{ride.originDetails}</p>
                )}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-[var(--color-on-surface)]">{ride.arrivalTime}</span>
                  <span className="font-bold text-sm text-[var(--color-on-surface)]">{ride.destination}</span>
                </div>
                {ride.destinationDetails && (
                  <p className="text-xs text-[var(--color-outline)] truncate max-w-xs">
                    {ride.destinationDetails}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Price & Duration */}
        <div className="text-right flex flex-col justify-between items-end">
          <div>
            <span
              className={`text-2xl font-extrabold ${
                isPast ? 'text-[var(--color-outline)]' : 'text-[var(--color-primary)]'
              }`}
            >
              ₹{ride.price}
            </span>
            <span className="text-xs text-[var(--color-outline)] block">per seat</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-[var(--color-on-surface-variant)] font-medium bg-[var(--color-surface-container)] px-2.5 py-1 rounded-md mt-2">
            <Clock className="w-3.5 h-3.5" />
            <span>{ride.duration}</span>
          </div>
        </div>
      </div>

      {/* Ride Tags Badges */}
      {ride.tags && ride.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 my-2">
          {ride.tags.slice(0, 3).map((tag, idx) => (
            <span
              key={idx}
              className="text-[10px] bg-[#f0fdf4] text-[var(--color-primary)] border border-[var(--color-primary-light)]/80 font-bold px-2 py-0.5 rounded-md"
            >
              🏷️ {tag}
            </span>
          ))}
          {ride.tags.length > 3 && (
            <span className="text-[10px] bg-gray-100 text-[var(--color-outline)] font-semibold px-1.5 py-0.5 rounded-md">
              +{ride.tags.length - 3} more
            </span>
          )}
        </div>
      )}

      {/* Vehicle info & Action */}
      <div className="flex items-center justify-between pt-3 border-t border-[var(--color-surface-container)]">
        <div className="flex items-center gap-2 text-xs text-[var(--color-on-surface-variant)] font-medium flex-wrap">
          <Car className="w-4 h-4 text-[var(--color-outline)]" />
          <span>{ride.car.model}</span>
          {ride.car.type && (
            <span className="bg-[var(--color-surface-container-low)] text-[var(--color-on-surface-variant)] border border-[var(--color-outline-variant)] font-bold text-[10px] px-2 py-0.5 rounded-md uppercase tracking-wider">
              {ride.car.type}
            </span>
          )}
          <span className="text-[var(--color-outline-variant)]">•</span>
          <span className="text-[var(--color-primary)] font-bold inline-flex items-center gap-1 bg-[var(--color-success-bg-soft)] px-2 py-0.5 rounded-full text-[11px] border border-[var(--color-primary-light)]/50">
            <Leaf className="w-3 h-3 text-[var(--color-primary)]" />
            ~{calculateCO2Savings(ride, 1).co2SavedKg} kg CO₂
          </span>
        </div>

        <div className="flex items-center gap-3">
          {!isPast && (
            <span className="text-xs font-semibold text-[var(--color-warning-text)] bg-[#ffdea2]/40 px-2.5 py-1 rounded-full flex items-center gap-1">
              <User className="w-3.5 h-3.5" />
              {ride.seatsAvailable} seat{ride.seatsAvailable > 1 ? 's' : ''} left
            </span>
          )}

          {isPast ? (
            <button
              disabled
              className="bg-[var(--color-border)] text-[var(--color-outline)] font-bold text-xs px-4 py-2 rounded-full cursor-not-allowed border border-[var(--color-outline-variant)]"
            >
              Passed
            </button>
          ) : (
            <button
              onClick={() => onSelectRide(ride)}
              className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-container)] text-white font-semibold text-xs px-4 py-2 rounded-full transition-all flex items-center gap-1 cursor-pointer"
            >
              <span>Book</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

