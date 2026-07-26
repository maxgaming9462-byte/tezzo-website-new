import React, { useState } from 'react';
import { X, Search, SlidersHorizontal, Zap, Car, Clock, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Ride, SearchQuery, Driver } from '../types';
import { RideCard } from './RideCard';
import { isRidePast } from '../utils/timeUtils';

interface SearchResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  query: SearchQuery;
  rides: Ride[];
  onSelectRide: (ride: Ride) => void;
  onUpdateQuery: (query: SearchQuery) => void;
  onOpenDriverReviews?: (driver: Driver, bookingId?: string, rideRoute?: string) => void;
}

export const SearchResultsModal: React.FC<SearchResultsModalProps> = ({
  isOpen,
  onClose,
  query,
  rides,
  onSelectRide,
  onUpdateQuery,
  onOpenDriverReviews,
}) => {
  const [instantOnly, setInstantOnly] = useState(false);
  const [hideDeparted, setHideDeparted] = useState(false);
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'price' | 'time'>('price');
  const [originInput, setOriginInput] = useState(query.origin || 'New Delhi');
  const [destInput, setDestInput] = useState(query.destination || '');

  if (!isOpen) return null;

  // Filter rides matching criteria
  const matchedRides = rides.filter((ride) => {
    const matchOrigin =
      !originInput || ride.origin.toLowerCase().includes(originInput.toLowerCase().trim());
    const matchDest =
      !destInput || ride.destination.toLowerCase().includes(destInput.toLowerCase().trim());
    const matchSeats = ride.seatsAvailable >= (query.passengers || 1);
    const matchInstant = !instantOnly || ride.instantBooking;

    const matchVehicleType =
      vehicleTypeFilter === 'ALL' ||
      (ride.car.type && ride.car.type.toUpperCase() === vehicleTypeFilter.toUpperCase()) ||
      (ride.car.model && ride.car.model.toUpperCase().includes(vehicleTypeFilter.toUpperCase())) ||
      (vehicleTypeFilter === 'EV' &&
        (ride.notes?.toUpperCase().includes('EV') ||
          ride.notes?.toUpperCase().includes('ELECTRIC') ||
          ride.amenities.some((a) => a.toUpperCase().includes('EV'))));

    return matchOrigin && matchDest && matchSeats && matchInstant && matchVehicleType;
  });

  const departedCount = matchedRides.filter((ride) => isRidePast(ride)).length;

  const displayRides = matchedRides.filter((ride) => {
    if (hideDeparted && isRidePast(ride)) return false;
    return true;
  });

  // Sort rides: active rides first, then by selected sort criteria
  const sortedRides = [...displayRides].sort((a, b) => {
    const aPast = isRidePast(a);
    const bPast = isRidePast(b);

    // Always push departed rides below upcoming ones
    if (aPast && !bPast) return 1;
    if (!aPast && bPast) return -1;

    if (sortBy === 'price') {
      return a.price - b.price;
    }
    return a.departureTime.localeCompare(b.departureTime);
  });

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateQuery({
      ...query,
      origin: originInput,
      destination: destInput,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-[var(--color-background)] rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl border border-[var(--color-border)] max-h-[90vh] flex flex-col my-4 animate-in fade-in zoom-in-95 duration-200">
        {/* Header Search Input */}
        <div className="bg-[var(--color-primary)] text-white p-4 sm:p-5 shrink-0 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              <h3 className="font-extrabold text-base sm:text-lg">Available Tezzo Rides</h3>
            </div>
            <button
              onClick={onClose}
              aria-label="Close"
              className="p-1 rounded-full hover:bg-white/20 transition-colors text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleFilterSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-black">
            <input
              type="text"
              value={originInput}
              onChange={(e) => setOriginInput(e.target.value)}
              placeholder="From: New Delhi"
              className="px-3.5 py-2 rounded-xl bg-white text-xs sm:text-sm font-medium border border-[var(--color-outline-variant)] focus:outline-none"
            />
            <input
              type="text"
              value={destInput}
              onChange={(e) => setDestInput(e.target.value)}
              placeholder="To: Gurgaon / Noida / Rohtak"
              className="px-3.5 py-2 rounded-xl bg-white text-xs sm:text-sm font-medium border border-[var(--color-outline-variant)] focus:outline-none"
            />
          </form>
        </div>

        {/* Filter Toolbar */}
        <div className="px-5 py-3 bg-white border-b border-[var(--color-surface-container)] shrink-0 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setInstantOnly(!instantOnly)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold border transition-colors ${
                instantOnly
                  ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]'
                  : 'bg-[var(--color-surface-container-low)] text-[var(--color-on-surface-variant)] border-[var(--color-outline-variant)] hover:bg-[var(--color-border)]'
              }`}
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>Instant Booking</span>
            </button>

            <button
              type="button"
              onClick={() => setHideDeparted(!hideDeparted)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold border transition-colors ${
                hideDeparted
                  ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]'
                  : 'bg-[var(--color-surface-container-low)] text-[var(--color-on-surface-variant)] border-[var(--color-outline-variant)] hover:bg-[var(--color-border)]'
              }`}
            >
              {hideDeparted ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{hideDeparted ? 'Hide Departed' : 'Show Departed'}</span>
            </button>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Vehicle Type Filter Dropdown */}
            <div className="flex items-center gap-1.5 bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)] rounded-xl px-2.5 py-1 text-[var(--color-on-surface)]">
              <Car className="w-3.5 h-3.5 text-[var(--color-primary)]" />
              <span className="font-bold text-[var(--color-on-surface-variant)]">Vehicle:</span>
              <select
                value={vehicleTypeFilter}
                onChange={(e) => setVehicleTypeFilter(e.target.value)}
                className="bg-transparent font-extrabold focus:outline-none cursor-pointer text-[var(--color-on-surface)]"
              >
                <option value="ALL">All Types</option>
                <option value="Sedan">Sedan</option>
                <option value="SUV">SUV</option>
                <option value="EV">EV (Electric)</option>
                <option value="Hatchback">Hatchback</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 text-[var(--color-on-surface-variant)] font-medium">
              <SlidersHorizontal className="w-3.5 h-3.5 text-[var(--color-outline)]" />
              <span>Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'price' | 'time')}
                className="bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)] rounded-xl px-2 py-1 font-bold text-[var(--color-on-surface)]"
              >
                <option value="price">Lowest Price</option>
                <option value="time">Departure Time</option>
              </select>
            </div>
          </div>
        </div>

        {/* Rides List */}
        <div className="p-4 sm:p-6 overflow-y-auto flex flex-col gap-4">
          <div className="text-xs font-bold text-[var(--color-outline)] flex items-center justify-between px-1">
            <span>
              Found {sortedRides.length} ride{sortedRides.length !== 1 ? 's' : ''}{' '}
              {destInput ? `to ${destInput}` : ''}
              {departedCount > 0 && (
                <span className="ml-1 font-normal text-[var(--color-on-surface-variant)]">
                  ({departedCount} departed {hideDeparted ? 'hidden' : 'greyed out'})
                </span>
              )}
            </span>
            <span>Date: {query.date || 'Today'}</span>
          </div>

          {sortedRides.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border border-[var(--color-border)] text-center flex flex-col items-center gap-3 my-4">
              <div className="w-14 h-14 rounded-full bg-[var(--color-surface-container-low)] text-[var(--color-outline)] flex items-center justify-center">
                <Car className="w-7 h-7" />
              </div>
              <h4 className="font-extrabold text-base text-[var(--color-on-surface)]">No matching rides found</h4>
              <p className="text-xs text-[var(--color-on-surface-variant)] max-w-xs">
                {departedCount > 0 && hideDeparted
                  ? 'There are departed rides matching your search. Try toggling "Show Departed" or resetting filters.'
                  : 'Try searching for popular destinations like Gurgaon, Noida, Rohtak, or Jaipur, or clear filters.'}
              </p>
              <button
                onClick={() => {
                  setOriginInput('New Delhi');
                  setDestInput('');
                  setInstantOnly(false);
                  setHideDeparted(false);
                  setVehicleTypeFilter('ALL');
                }}
                className="mt-2 bg-[var(--color-primary)] text-white px-5 py-2 rounded-full text-xs font-bold hover:bg-[var(--color-primary-container)]"
              >
                Reset Search Filters
              </button>
            </div>
          ) : (
            sortedRides.map((ride, index) => (
              <motion.div
                key={ride.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: Math.min(index * 0.05, 0.3) }}
              >
                <RideCard
                  ride={ride}
                  onSelectRide={onSelectRide}
                  onOpenDriverReviews={onOpenDriverReviews}
                />
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
