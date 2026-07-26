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
          ? 'bg-[#f3f3f3] border-[#bdcabd] opacity-75 grayscale-[20%]'
          : 'bg-white border-[#e2e2e2] shadow-xs hover:shadow-md'
      }`}
    >
      {/* Driver Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#eeeeee]">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={ride.driver.avatar}
              alt={ride.driver.name}
              className={`w-11 h-11 rounded-full object-cover border-2 ${
                isPast ? 'border-[#6e7a6f]' : 'border-[#006a3b]'
              }`}
            />
            {ride.driver.verified && (
              <ShieldCheck
                className={`w-4 h-4 absolute -bottom-1 -right-1 bg-white rounded-full ${
                  isPast ? 'text-[#6e7a6f] fill-[#eeeeee]' : 'text-[#006a3b] fill-[#8af9b1]'
                }`}
              />
            )}
          </div>
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <h4 className="font-bold text-sm text-[#1b1b1b]">{ride.driver.name}</h4>
              {ride.driver.verified && (
                <span
                  className="inline-flex items-center gap-1 bg-[#eefcf2] text-[#006a3b] border border-[#a3e6b7] text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                  title="Verified Driver"
                >
                  <CheckCircle2 className="w-3 h-3 text-[#006a3b] fill-[#8af9b1]" />
                  <span>Verified Driver</span>
                </span>
              )}
              {isPast && (
                <span className="bg-[#e2e2e2] text-[#6e7a6f] border border-[#bdcabd] text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 text-[#6e7a6f]" />
                  DEPARTED
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-[#3e4a40] mt-0.5">
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
                className="flex items-center gap-1 font-extrabold text-[#7a5900] hover:text-[#006a3b] hover:bg-[#eefcf2] px-1.5 py-0.5 rounded-md border border-transparent hover:border-[#a3e6b7] transition-all cursor-pointer"
                title="Click to view driver ratings and reviews"
              >
                <Star className="w-3.5 h-3.5 fill-[#fdce6c] text-[#7a5900]" />
                <span>{driverStats.averageRating.toFixed(1)}</span>
                <span className="text-[10px] text-[#6e7a6f] underline font-semibold ml-0.5">
                  ({driverStats.totalCount})
                </span>
              </button>
              <span>•</span>
              <span>{ride.driver.ridesCompleted} rides</span>
            </div>
          </div>
        </div>

        {isPast ? (
          <span className="inline-flex items-center gap-1 bg-[#e2e2e2] text-[#6e7a6f] border border-[#bdcabd] text-xs font-semibold px-2.5 py-1 rounded-full">
            <Clock className="w-3.5 h-3.5" />
            Departed
          </span>
        ) : ride.instantBooking ? (
          <span className="inline-flex items-center gap-1 bg-[#f6fff4] text-[#006a3b] border border-[#bdcabd] text-xs font-semibold px-2.5 py-1 rounded-full">
            <Zap className="w-3.5 h-3.5 fill-[#006a3b]" />
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
                  isPast ? 'border-[#6e7a6f]' : 'border-[#006a3b]'
                }`}
              ></div>
              <div className="w-0.5 h-8 bg-[#bdcabd] my-0.5"></div>
              <div
                className={`w-3 h-3 rounded-full ${
                  isPast ? 'bg-[#6e7a6f]' : 'bg-[#006a3b]'
                }`}
              ></div>
            </div>
            <div className="flex flex-col gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`font-bold text-sm ${
                      isPast ? 'text-[#6e7a6f] line-through' : 'text-[#1b1b1b]'
                    }`}
                  >
                    {ride.departureTime}
                  </span>
                  <span className="font-bold text-sm text-[#1b1b1b]">{ride.origin}</span>
                </div>
                {ride.originDetails && (
                  <p className="text-xs text-[#6e7a6f] truncate max-w-xs">{ride.originDetails}</p>
                )}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-[#1b1b1b]">{ride.arrivalTime}</span>
                  <span className="font-bold text-sm text-[#1b1b1b]">{ride.destination}</span>
                </div>
                {ride.destinationDetails && (
                  <p className="text-xs text-[#6e7a6f] truncate max-w-xs">
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
                isPast ? 'text-[#6e7a6f]' : 'text-[#006a3b]'
              }`}
            >
              ₹{ride.price}
            </span>
            <span className="text-xs text-[#6e7a6f] block">per seat</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-[#3e4a40] font-medium bg-[#eeeeee] px-2.5 py-1 rounded-md mt-2">
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
              className="text-[10px] bg-[#f0fdf4] text-[#006a3b] border border-[#a3e6b7]/80 font-bold px-2 py-0.5 rounded-md"
            >
              🏷️ {tag}
            </span>
          ))}
          {ride.tags.length > 3 && (
            <span className="text-[10px] bg-gray-100 text-[#6e7a6f] font-semibold px-1.5 py-0.5 rounded-md">
              +{ride.tags.length - 3} more
            </span>
          )}
        </div>
      )}

      {/* Vehicle info & Action */}
      <div className="flex items-center justify-between pt-3 border-t border-[#eeeeee]">
        <div className="flex items-center gap-2 text-xs text-[#3e4a40] font-medium flex-wrap">
          <Car className="w-4 h-4 text-[#6e7a6f]" />
          <span>{ride.car.model}</span>
          {ride.car.type && (
            <span className="bg-[#f3f3f3] text-[#3e4a40] border border-[#bdcabd] font-bold text-[10px] px-2 py-0.5 rounded-md uppercase tracking-wider">
              {ride.car.type}
            </span>
          )}
          <span className="text-[#bdcabd]">•</span>
          <span className="text-[#006a3b] font-bold inline-flex items-center gap-1 bg-[#eefcf2] px-2 py-0.5 rounded-full text-[11px] border border-[#a3e6b7]/50">
            <Leaf className="w-3 h-3 text-[#006a3b]" />
            ~{calculateCO2Savings(ride, 1).co2SavedKg} kg CO₂
          </span>
        </div>

        <div className="flex items-center gap-3">
          {!isPast && (
            <span className="text-xs font-semibold text-[#7a5900] bg-[#ffdea2]/40 px-2.5 py-1 rounded-full flex items-center gap-1">
              <User className="w-3.5 h-3.5" />
              {ride.seatsAvailable} seat{ride.seatsAvailable > 1 ? 's' : ''} left
            </span>
          )}

          {isPast ? (
            <button
              disabled
              className="bg-[#e2e2e2] text-[#6e7a6f] font-bold text-xs px-4 py-2 rounded-full cursor-not-allowed border border-[#bdcabd]"
            >
              Passed
            </button>
          ) : (
            <button
              onClick={() => onSelectRide(ride)}
              className="bg-[#006a3b] hover:bg-[#00864c] text-white font-semibold text-xs px-4 py-2 rounded-full transition-all flex items-center gap-1 cursor-pointer"
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

