import React from 'react';
import { Compass, Sparkles, MapPin, ArrowRight, Calendar, Clock, Star, ShieldCheck, ChevronRight, History } from 'lucide-react';
import { motion } from 'motion/react';
import { Booking, Ride } from '../types';
import { calculateCO2Savings } from '../utils/co2Utils';

interface SuggestedRoutesProps {
  bookings: Booking[];
  rides: Ride[];
  onSelectRide: (ride: Ride) => void;
  onSearchRoute: (destination: string) => void;
}

export const SuggestedRoutes: React.FC<SuggestedRoutesProps> = ({
  bookings,
  rides,
  onSelectRide,
  onSearchRoute,
}) => {
  // Extract active non-cancelled bookings
  const activeBookings = bookings.filter((b) => b.status !== 'cancelled');

  // Collect destination frequencies from user bookings
  const destinationCounts: Record<string, number> = {};
  const bookedRideIds = new Set<string>();

  activeBookings.forEach((b) => {
    bookedRideIds.add(b.ride.id);
    const dest = b.ride.destination.trim();
    destinationCounts[dest] = (destinationCounts[dest] || 0) + 1;
  });

  // Find most frequent destinations
  const topDestinations = Object.entries(destinationCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([dest]) => dest);

  // Dynamic recommendation algorithm:
  // 1. If user has bookings, filter rides matching top destinations or origins not already full.
  // 2. If no bookings, pick top available rides with best ratings / eco savings.
  let suggestedRides: { ride: Ride; reason: string }[] = [];

  if (activeBookings.length > 0) {
    // Recommendation 1: Rides matching booked destinations
    rides.forEach((ride) => {
      if (ride.seatsAvailable > 0) {
        const destMatch = topDestinations.some((d) =>
          ride.destination.toLowerCase().includes(d.toLowerCase())
        );
        if (destMatch) {
          suggestedRides.push({
            ride,
            reason: `Based on your recent trip to ${ride.destination}`,
          });
        }
      }
    });

    // Recommendation 2: High rated drivers or other routes if list is short
    if (suggestedRides.length < 3) {
      rides.forEach((ride) => {
        if (
          ride.seatsAvailable > 0 &&
          !suggestedRides.some((sr) => sr.ride.id === ride.id)
        ) {
          if (ride.driver.rating >= 4.8) {
            suggestedRides.push({
              ride,
              reason: `Top rated driver (${ride.driver.rating.toFixed(1)}★) on popular route`,
            });
          }
        }
      });
    }
  } else {
    // Default fallback recommendations when user has no bookings yet
    const sampleDestinations = ['Gurgaon', 'Noida', 'Jaipur', 'Rohtak'];
    sampleDestinations.forEach((dest) => {
      const matchingRide = rides.find(
        (r) =>
          r.destination.toLowerCase().includes(dest.toLowerCase()) &&
          r.seatsAvailable > 0
      );
      if (matchingRide && suggestedRides.length < 3) {
        suggestedRides.push({
          ride: matchingRide,
          reason: `Popular daily commuter pick to ${dest}`,
        });
      }
    });
  }

  // Deduplicate and cap at 3 recommendations
  const uniqueSuggested = suggestedRides.reduce<{ ride: Ride; reason: string }[]>(
    (acc, current) => {
      if (!acc.some((item) => item.ride.id === current.ride.id)) {
        acc.push(current);
      }
      return acc;
    },
    []
  ).slice(0, 3);

  return (
    <section className="px-4 sm:px-6 py-8 sm:py-12 bg-[#f6fff4] border-y border-[#bdcabd]/60">
      <div className="max-w-[1120px] mx-auto flex flex-col gap-6">
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-[#006a3b] font-extrabold text-xs tracking-wider uppercase">
              <Sparkles className="w-4 h-4 fill-[#8af9b1]" />
              <span>Smart Travel Engine</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1b1b1b] tracking-tight mt-1">
              Suggested Routes For You
            </h2>
            <p className="text-sm text-[#3e4a40] mt-0.5">
              {activeBookings.length > 0
                ? `Personalized recommendations dynamically tailored to your ${activeBookings.length} past trip(s)`
                : 'Commuter picks curated based on top travel patterns from New Delhi'}
            </p>
          </div>

          {activeBookings.length > 0 && (
            <div className="flex items-center gap-2 bg-white px-3.5 py-1.5 rounded-full border border-[#a3e6b7] text-xs text-[#006a3b] font-bold shadow-2xs self-start sm:self-auto">
              <History className="w-4 h-4 text-[#006a3b]" />
              <span>
                Frequent Destination:{' '}
                <span className="underline decoration-[#8af9b1] font-black">
                  {topDestinations[0] || 'Gurgaon'}
                </span>
              </span>
            </div>
          )}
        </div>

        {/* Recommendations Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {uniqueSuggested.map(({ ride, reason }, index) => {
            const co2Info = calculateCO2Savings(ride, 1);
            return (
              <motion.div
                key={ride.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.08 }}
                className="bg-white rounded-2xl border border-[#bdcabd] p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between gap-4 relative group"
              >
                {/* Tag Banner */}
                <div className="flex items-center justify-between gap-2 border-b border-[#eeeeee] pb-3">
                  <span className="text-[11px] font-extrabold text-[#006a3b] bg-[#eefcf2] px-2.5 py-1 rounded-full border border-[#a3e6b7] flex items-center gap-1.5 truncate">
                    <Sparkles className="w-3 h-3 text-[#006a3b] shrink-0" />
                    <span className="truncate">{reason}</span>
                  </span>
                  <span className="text-xs font-black text-[#006a3b] shrink-0">
                    ₹{ride.price}
                  </span>
                </div>

                {/* Route Header */}
                <div>
                  <div className="flex items-center justify-between text-base font-extrabold text-[#1b1b1b]">
                    <span>{ride.origin}</span>
                    <ArrowRight className="w-4 h-4 text-[#006a3b]" />
                    <span>{ride.destination}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-[#6e7a6f] mt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-[#006a3b]" />
                      {ride.date}
                    </span>
                    <span className="flex items-center gap-1 font-semibold text-[#1b1b1b]">
                      <Clock className="w-3.5 h-3.5 text-[#006a3b]" />
                      {ride.departureTime}
                    </span>
                  </div>
                </div>

                {/* Driver Info & Car */}
                <div className="flex items-center justify-between bg-[#f9fbf9] p-3 rounded-xl border border-[#e2e2e2]">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={ride.driver.avatar}
                      alt={ride.driver.name}
                      className="w-9 h-9 rounded-full object-cover border border-[#006a3b]"
                    />
                    <div>
                      <div className="flex items-center gap-1">
                        <span className="font-bold text-xs text-[#1b1b1b]">
                          {ride.driver.name}
                        </span>
                        {ride.driver.verified && (
                          <ShieldCheck className="w-3.5 h-3.5 text-[#006a3b]" />
                        )}
                      </div>
                      <span className="text-[11px] text-[#7a5900] font-extrabold flex items-center gap-1">
                        <Star className="w-3 h-3 fill-[#fdce6c]" />
                        {ride.driver.rating.toFixed(1)} ({ride.driver.reviewsCount})
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[11px] bg-[#006a3b]/10 text-[#006a3b] px-2 py-0.5 rounded-full font-bold block">
                      {ride.seatsAvailable} seat(s) left
                    </span>
                    <span className="text-[10px] text-[#2d5a3e] font-semibold mt-0.5 block">
                      ~{co2Info.co2SavedKg} kg CO₂ saved
                    </span>
                  </div>
                </div>

                {/* Action Button */}
                <button
                  onClick={() => onSelectRide(ride)}
                  className="w-full bg-[#006a3b] hover:bg-[#00864c] text-white font-bold text-xs py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs group-hover:bg-[#00864c]"
                >
                  <span>Book Recommended Trip</span>
                  <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
