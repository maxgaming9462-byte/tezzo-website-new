import React, { useState } from 'react';
import { X, Star, ShieldCheck, Zap, Car, Calendar, Clock, MapPin, Check, CheckCircle2, AlertTriangle, Mail, Send, Leaf, MessageSquare, Heart, Tag, VolumeX, Music, Users, Briefcase, Package, Sparkles, Calculator, Fuel, TrendingDown, Percent, Coins, Receipt, PieChart, ChevronDown, ChevronUp } from 'lucide-react';
import { Ride, Booking, UserProfile, Driver } from '../types';
import { isRidePast } from '../utils/timeUtils';
import { sendBookingConfirmationEmail, EmailReceipt } from '../utils/emailService';
import { calculateCO2Savings } from '../utils/co2Utils';
import { DriverChatModal } from './DriverChatModal';
import { getDriverStats } from '../utils/reviewService';

interface RideDetailsModalProps {
  ride: Ride | null;
  onClose: () => void;
  user: UserProfile | null;
  onOpenAuth: () => void;
  onConfirmBooking: (booking: Booking) => void;
  onUpdateProfile?: (updatedUser: UserProfile) => void;
  onOpenDriverReviews?: (driver: Driver, bookingId?: string, rideRoute?: string) => void;
}

export const RideDetailsModal: React.FC<RideDetailsModalProps> = ({
  ride,
  onClose,
  user,
  onOpenAuth,
  onConfirmBooking,
  onUpdateProfile,
  onOpenDriverReviews,
}) => {
  const [seats, setSeats] = useState(1);
  const [passengerName, setPassengerName] = useState(user ? user.name : '');
  const [passengerEmail, setPassengerEmail] = useState(user ? user.email : '');
  const [passengerPhone, setPassengerPhone] = useState(user ? user.phone : '');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [emailReceipt, setEmailReceipt] = useState<EmailReceipt | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showCostSplitTool, setShowCostSplitTool] = useState(true);
  const [activeCostTab, setActiveCostTab] = useState<'split' | 'taxiComparison'>('split');

  if (!ride) return null;

  const isPast = isRidePast(ride);
  const totalPrice = ride.price * seats;
  const co2Savings = calculateCO2Savings(ride, seats);

  const isDriverFavorited =
    user?.favoriteDrivers?.some(
      (d) => d.name.toLowerCase() === ride.driver.name.toLowerCase()
    ) || false;

  const handleToggleFavorite = () => {
    if (!user) {
      onOpenAuth();
      return;
    }
    const currentFavorites = user.favoriteDrivers || [];
    let updatedFavorites: Driver[];

    if (isDriverFavorited) {
      updatedFavorites = currentFavorites.filter(
        (d) => d.name.toLowerCase() !== ride.driver.name.toLowerCase()
      );
    } else {
      updatedFavorites = [...currentFavorites, ride.driver];
    }

    if (onUpdateProfile) {
      onUpdateProfile({
        ...user,
        favoriteDrivers: updatedFavorites,
      });
    }
  };

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isPast) return;
    if (!user) {
      onOpenAuth();
      return;
    }

    if (seats > ride.seatsAvailable) {
      setBookingError(`Only ${ride.seatsAvailable} seat(s) left on this ride.`);
      return;
    }

    const newBooking: Booking = {
      id: `book-${Date.now()}`,
      ride,
      seatsBooked: seats,
      totalPrice,
      status: 'confirmed',
      bookingDate: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      passengerName: passengerName || user.name,
      passengerEmail: passengerEmail || user.email,
      passengerPhone: passengerPhone || user.phone,
    };

    setBookingError(null);
    setIsBooking(true);
    try {
      // Simulate sending email
      const receipt = await sendBookingConfirmationEmail(newBooking);
      setEmailReceipt(receipt);

      onConfirmBooking(newBooking);
      setIsSuccess(true);
    } catch (err) {
      console.error('Booking failed:', err);
      setBookingError('Something went wrong while confirming your booking. Please try again.');
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-[var(--color-border)] animate-in fade-in zoom-in-95 duration-200 my-8">
        {/* Header Bar */}
        <div className="bg-[var(--color-primary)] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-lg">Trip Details</h3>
            {ride.instantBooking && (
              <span className="bg-[var(--color-accent-mint)] text-[#00210f] text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Zap className="w-3 h-3 fill-[#00210f]" />
                Instant
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1 rounded-full hover:bg-white/20 transition-colors text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-8 text-center flex flex-col items-center justify-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[var(--color-success-bg)] border-2 border-[var(--color-primary)] text-[var(--color-primary)] flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 fill-[var(--color-accent-mint)]" />
            </div>
            <h3 className="text-2xl font-extrabold text-[var(--color-on-surface)]">Seat Booked Successfully!</h3>
            <p className="text-sm text-[var(--color-on-surface-variant)] max-w-sm">
              Your carpool with <strong className="text-[var(--color-on-surface)]">{ride.driver.name}</strong> from{' '}
              <strong className="text-[var(--color-on-surface)]">{ride.origin}</strong> to{' '}
              <strong className="text-[var(--color-on-surface)]">{ride.destination}</strong> is confirmed.
            </p>
            <div className="bg-[var(--color-surface-container-low)] p-4 rounded-xl w-full text-left text-xs text-[var(--color-on-surface-variant)] flex flex-col gap-1.5 border border-[var(--color-border)]">
              <div><strong>Driver Contact:</strong> {ride.driver.phone || '+91 98765 43210'}</div>
              <div><strong>Pickup Location:</strong> {ride.originDetails || ride.origin}</div>
              <div><strong>Vehicle:</strong> {ride.car.model} ({ride.car.plateNumber})</div>
            </div>

            {/* Mock Email Confirmation Badge */}
            {emailReceipt && (
              <div className="bg-[#f0f9ff] border border-[#bae6fd] p-4 rounded-xl w-full text-left text-xs text-[#0369a1] flex flex-col gap-1.5">
                <div className="flex items-center gap-1.5 font-bold text-[#0284c7]">
                  <Mail className="w-4 h-4 text-[#0284c7]" />
                  <span>Confirmation Email Sent!</span>
                  <span className="ml-auto text-[10px] bg-[#e0f2fe] px-2 py-0.5 rounded-full font-mono text-[#0369a1]">
                    {emailReceipt.sentAt}
                  </span>
                </div>
                <div>
                  <strong>To:</strong> {emailReceipt.recipient}
                </div>
                <div>
                  <strong>Subject:</strong> {emailReceipt.subject}
                </div>
                <div className="mt-1 p-2 bg-white rounded-lg border border-[#e0f2fe] text-[#334155] italic">
                  "{emailReceipt.bodyPreview}"
                </div>
              </div>
            )}
            <div className="flex flex-col gap-2 w-full mt-2">
              <button
                type="button"
                onClick={() => setIsChatOpen(true)}
                className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-container)] text-white font-bold px-6 py-3 rounded-full text-sm transition-colors w-full flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Message Driver to Coordinate Pick-Up</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="bg-[var(--color-surface-container-low)] hover:bg-[var(--color-border)] text-[var(--color-on-surface-variant)] font-bold px-6 py-3 rounded-full text-sm transition-colors w-full border border-[var(--color-outline-variant)] cursor-pointer"
              >
                Done & View My Bookings
              </button>
            </div>
          </div>
        ) : (
          <div className="p-6 flex flex-col gap-6 max-h-[80vh] overflow-y-auto">
            {/* Driver Profile Summary */}
            <div className="flex items-center justify-between gap-3 p-4 rounded-2xl bg-[var(--color-success-bg)] border border-[var(--color-outline-variant)]">
              <div className="flex items-center gap-3">
                <img
                  src={ride.driver.avatar}
                  alt={ride.driver.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-[var(--color-primary)]"
                />
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h4 className="font-bold text-base text-[var(--color-on-surface)]">{ride.driver.name}</h4>
                    {ride.driver.verified && (
                      <span
                        className="inline-flex items-center gap-1 bg-[var(--color-success-bg-soft)] text-[var(--color-primary)] border border-[var(--color-primary-light)] text-[11px] font-extrabold px-2 py-0.5 rounded-full shadow-2xs"
                        title="Verified Driver ID & License"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-[var(--color-primary)] fill-[var(--color-accent-mint)]" />
                        <span>Verified Driver</span>
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      onOpenDriverReviews &&
                      onOpenDriverReviews(
                        ride.driver,
                        undefined,
                        `${ride.origin} → ${ride.destination}`
                      )
                    }
                    className="flex items-center gap-1.5 text-xs text-[var(--color-on-surface-variant)] mt-0.5 hover:bg-[var(--color-success-bg-soft)] px-2 py-0.5 rounded-lg border border-transparent hover:border-[var(--color-primary-light)] transition-all cursor-pointer group text-left"
                    title="Click to view driver reviews & ratings"
                  >
                    {(() => {
                      const stats = getDriverStats(
                        ride.driver.name,
                        ride.driver.rating,
                        ride.driver.reviewsCount
                      );
                      return (
                        <>
                          <span className="flex items-center gap-1 font-bold text-[var(--color-warning-text)] group-hover:text-[var(--color-primary)]">
                            <Star className="w-3.5 h-3.5 fill-[var(--color-secondary-container)] text-[var(--color-warning-text)]" />{' '}
                            {stats.averageRating.toFixed(1)}
                          </span>
                          <span>•</span>
                          <span className="underline decoration-dotted group-hover:text-[var(--color-primary)] font-semibold">
                            {stats.totalCount} reviews
                          </span>
                        </>
                      );
                    })()}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleToggleFavorite}
                  className={`px-3 py-2 rounded-full font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs border ${
                    isDriverFavorited
                      ? 'bg-rose-50 text-rose-700 border-rose-300 hover:bg-rose-100'
                      : 'bg-white text-[var(--color-on-surface-variant)] border-[var(--color-outline-variant)] hover:bg-gray-50'
                  }`}
                  title={isDriverFavorited ? 'Remove from Favorite Drivers' : 'Save as Favorite Driver'}
                >
                  <Heart
                    className={`w-3.5 h-3.5 ${
                      isDriverFavorited ? 'text-rose-600 fill-rose-600' : 'text-[var(--color-outline)]'
                    }`}
                  />
                  <span className="hidden sm:inline">
                    {isDriverFavorited ? 'Favorited' : 'Favorite Driver'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsChatOpen(true)}
                  className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-container)] text-white font-bold text-xs px-3.5 py-2 rounded-full transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Message Driver</span>
                  <span className="sm:hidden">Message</span>
                </button>
              </div>
            </div>

            {/* Itinerary Timeline */}
            <div className="bg-[var(--color-background)] p-4 rounded-2xl border border-[var(--color-surface-container)] flex flex-col gap-4">
              <div className="flex items-center justify-between text-xs font-semibold text-[var(--color-outline)] border-b border-[var(--color-surface-container)] pb-2">
                <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {ride.date}</span>
                <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> Duration: {ride.duration}</span>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex flex-col items-center mt-1">
                  <div className="w-3 h-3 rounded-full border-2 border-[var(--color-primary)] bg-white"></div>
                  <div className="w-0.5 h-10 bg-[var(--color-outline-variant)] my-0.5"></div>
                  <div className="w-3 h-3 rounded-full bg-[var(--color-primary)]"></div>
                </div>

                <div className="flex flex-col gap-4 flex-1">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-base text-[var(--color-on-surface)]">{ride.departureTime}</span>
                      <span className="font-bold text-sm text-[var(--color-primary)]">{ride.origin}</span>
                    </div>
                    <p className="text-xs text-[var(--color-outline)] mt-0.5 flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {ride.originDetails || ride.origin}
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-base text-[var(--color-on-surface)]">{ride.arrivalTime}</span>
                      <span className="font-bold text-sm text-[var(--color-primary)]">{ride.destination}</span>
                    </div>
                    <p className="text-xs text-[var(--color-outline)] mt-0.5 flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {ride.destinationDetails || ride.destination}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Vehicle & Rules */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-[var(--color-surface-container-low)] border border-[var(--color-border)] flex flex-col gap-1">
                <span className="text-xs text-[var(--color-outline)] font-medium flex items-center gap-1">
                  <Car className="w-3.5 h-3.5" /> Vehicle
                </span>
                <span className="text-sm font-bold text-[var(--color-on-surface)]">{ride.car.model}</span>
                <span className="text-xs text-[var(--color-on-surface-variant)]">{ride.car.plateNumber}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-[var(--color-surface-container-low)] border border-[var(--color-border)] flex flex-col gap-1">
                <span className="text-xs text-[var(--color-outline)] font-medium">Seats Left</span>
                <span className="text-sm font-bold text-[var(--color-warning-text)]">{ride.seatsAvailable} available</span>
                <span className="text-xs text-[var(--color-on-surface-variant)]">₹{ride.price} per seat</span>
              </div>
            </div>

            {/* Eco Impact / CO2 Savings Card */}
            <div className="bg-[var(--color-success-bg-soft)] border border-[var(--color-primary-light)] p-3.5 rounded-2xl flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Leaf className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-[var(--color-primary)] text-sm">
                      ~{co2Savings.co2SavedKg} kg CO₂ Saved
                    </span>
                    <span className="bg-[var(--color-primary)]/10 text-[var(--color-primary)] font-extrabold px-2 py-0.5 rounded-full text-[10px] border border-[var(--color-primary)]/20">
                      Green Carpool 🌱
                    </span>
                  </div>
                  <p className="text-[#2d5a3e] text-xs mt-0.5">
                    Sharing this ~{co2Savings.distanceKm} km ride saves emissions equal to ~{co2Savings.treesEquivalent} tree-day(s) of CO₂ absorption.
                  </p>
                </div>
              </div>
            </div>

            {/* Interactive Cost-Split Breakdown Tool */}
            {(() => {
              const fuelContribution = Math.round(totalPrice * 0.60);
              const tollContribution = Math.round(totalPrice * 0.25);
              const maintContribution = Math.max(0, totalPrice - fuelContribution - tollContribution);
              const estPrivateTaxiCost = Math.round(totalPrice * 3.5);
              const savingsAmount = Math.max(0, estPrivateTaxiCost - totalPrice);
              const savingsPercent = estPrivateTaxiCost > 0 ? Math.round((savingsAmount / estPrivateTaxiCost) * 100) : 71;

              return (
                <div className="bg-[var(--color-on-surface)] text-white rounded-2xl p-4 border border-[var(--color-primary)] shadow-md space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-[var(--color-primary)] text-[var(--color-accent-mint)] flex items-center justify-center font-bold shrink-0">
                        <Calculator className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-sm text-white flex items-center gap-1.5 flex-wrap">
                          <span>Cost-Split & Taxi Comparison</span>
                          <span className="text-[10px] bg-[var(--color-primary)] text-[var(--color-accent-mint)] px-2 py-0.5 rounded-full font-bold border border-[var(--color-primary-light)]/30">
                            Fair Share
                          </span>
                        </h4>
                        <p className="text-[11px] text-gray-300">
                          Breakdown of your ₹{totalPrice} contribution ({seats} {seats === 1 ? 'seat' : 'seats'})
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowCostSplitTool(!showCostSplitTool)}
                      className="text-xs font-bold text-[var(--color-accent-mint)] hover:text-white flex items-center gap-1 bg-[#282828] px-2.5 py-1.5 rounded-xl border border-[var(--color-on-surface-variant)] cursor-pointer shrink-0 transition-colors"
                    >
                      <span>{showCostSplitTool ? 'Hide' : 'Show Tool'}</span>
                      {showCostSplitTool ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {showCostSplitTool && (
                    <div className="space-y-3 pt-2 border-t border-[#333333] text-xs">
                      {/* Sub-Tabs: Cost Breakdown vs Taxi Comparison */}
                      <div className="flex bg-[#282828] p-1 rounded-xl gap-1">
                        <button
                          type="button"
                          onClick={() => setActiveCostTab('split')}
                          className={`flex-1 py-1.5 rounded-lg font-bold text-center transition-all cursor-pointer flex items-center justify-center gap-1 text-[11px] ${
                            activeCostTab === 'split'
                              ? 'bg-[var(--color-primary)] text-white shadow-2xs border border-[var(--color-primary-light)]/40'
                              : 'text-gray-300 hover:text-white'
                          }`}
                        >
                          <PieChart className="w-3.5 h-3.5 text-[var(--color-accent-mint)]" />
                          <span>Fuel & Expenses Split</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveCostTab('taxiComparison')}
                          className={`flex-1 py-1.5 rounded-lg font-bold text-center transition-all cursor-pointer flex items-center justify-center gap-1 text-[11px] ${
                            activeCostTab === 'taxiComparison'
                              ? 'bg-[var(--color-primary)] text-white shadow-2xs border border-[var(--color-primary-light)]/40'
                              : 'text-gray-300 hover:text-white'
                          }`}
                        >
                          <TrendingDown className="w-3.5 h-3.5 text-amber-300" />
                          <span>vs Private Taxi ({savingsPercent}% Off)</span>
                        </button>
                      </div>

                      {activeCostTab === 'split' ? (
                        <div className="space-y-3 bg-[#242424] p-3 rounded-xl border border-[#333333]">
                          {/* Segmented Cost Bar */}
                          <div className="space-y-1.5">
                            <div className="flex justify-between text-[11px] font-bold text-gray-300">
                              <span>Allocation of ₹{totalPrice}</span>
                              <span className="text-[var(--color-accent-mint)] font-extrabold">100% Non-Profit Shared</span>
                            </div>
                            <div className="h-3.5 w-full bg-[var(--color-on-surface)] rounded-full overflow-hidden flex gap-0.5 p-0.5 border border-[var(--color-on-surface-variant)]">
                              <div className="bg-[var(--color-primary)] h-full rounded-l-full" style={{ width: '60%' }} title="Fuel Share 60%" />
                              <div className="bg-amber-500 h-full" style={{ width: '25%' }} title="Tolls & Fastag 25%" />
                              <div className="bg-slate-400 h-full rounded-r-full" style={{ width: '15%' }} title="Maintenance 15%" />
                            </div>
                          </div>

                          {/* Detailed Item Grid */}
                          <div className="grid grid-cols-3 gap-2 text-[11px]">
                            <div className="bg-[var(--color-on-surface)] p-2.5 rounded-xl border border-[var(--color-on-surface-variant)] space-y-0.5">
                              <div className="flex items-center gap-1 text-[var(--color-accent-mint)] font-bold">
                                <Fuel className="w-3.5 h-3.5" />
                                <span>Fuel Share</span>
                              </div>
                              <p className="font-extrabold text-white text-sm">₹{fuelContribution}</p>
                              <span className="text-[9.5px] text-gray-400 block">60% Petrol/Diesel</span>
                            </div>

                            <div className="bg-[var(--color-on-surface)] p-2.5 rounded-xl border border-[var(--color-on-surface-variant)] space-y-0.5">
                              <div className="flex items-center gap-1 text-amber-300 font-bold">
                                <Receipt className="w-3.5 h-3.5" />
                                <span>Tolls & Fastag</span>
                              </div>
                              <p className="font-extrabold text-white text-sm">₹{tollContribution}</p>
                              <span className="text-[9.5px] text-gray-400 block">25% Toll Plazas</span>
                            </div>

                            <div className="bg-[var(--color-on-surface)] p-2.5 rounded-xl border border-[var(--color-on-surface-variant)] space-y-0.5">
                              <div className="flex items-center gap-1 text-slate-300 font-bold">
                                <Car className="w-3.5 h-3.5" />
                                <span>Maintenance</span>
                              </div>
                              <p className="font-extrabold text-white text-sm">₹{maintContribution}</p>
                              <span className="text-[9.5px] text-gray-400 block">15% Servicing/Tires</span>
                            </div>
                          </div>

                          <div className="bg-[var(--color-on-surface)] p-2 rounded-lg border border-[var(--color-on-surface-variant)] text-[10.5px] text-gray-300 flex items-center gap-1.5">
                            <ShieldCheck className="w-4 h-4 text-[var(--color-accent-mint)] shrink-0" />
                            <span>Your contribution directly covers driver out-of-pocket costs without commercial taxi surcharges.</span>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2.5 bg-[#242424] p-3 rounded-xl border border-[#333333]">
                          <div className="flex items-center justify-between bg-[var(--color-on-surface)] p-3 rounded-xl border border-[var(--color-on-surface-variant)]">
                            <div className="space-y-0.5">
                              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Private Taxi (Solo Cab)</span>
                              <span className="font-extrabold text-red-400 text-base line-through">₹{estPrivateTaxiCost}</span>
                              <span className="text-[10px] text-gray-400 block">Uber/Ola sedan booking</span>
                            </div>
                            <div className="text-right space-y-0.5">
                              <span className="text-[10px] text-[var(--color-accent-mint)] font-bold uppercase tracking-wider block">Tezzo Shared Carpool</span>
                              <span className="font-extrabold text-[var(--color-accent-mint)] text-lg">₹{totalPrice}</span>
                              <span className="text-[10px] text-emerald-300 font-bold block">For {seats} {seats === 1 ? 'seat' : 'seats'}</span>
                            </div>
                          </div>

                          <div className="bg-[var(--color-primary)]/40 border border-[var(--color-primary)] p-2.5 rounded-xl flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              <Coins className="w-4 h-4 text-amber-300 shrink-0" />
                              <span className="font-bold text-white">Your Pocket Savings:</span>
                            </div>
                            <span className="font-extrabold text-amber-300 text-sm bg-black/40 px-2.5 py-1 rounded-lg border border-amber-300/30">
                              Save ₹{savingsAmount} ({savingsPercent}% cheaper!)
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Notes / Amenities */}
            {ride.notes && (
              <div className="text-xs text-[var(--color-on-surface-variant)] bg-[#fffdea] p-3.5 rounded-xl border border-[var(--color-secondary-container)]">
                <strong className="text-[var(--color-on-secondary-container)] block mb-1">Driver Note:</strong>
                "{ride.notes}"
              </div>
            )}

            {/* Ride Tags & Preferences */}
            {((ride.tags && ride.tags.length > 0) || (ride.amenities && ride.amenities.length > 0)) && (
              <div className="space-y-2">
                <span className="text-xs font-bold text-[var(--color-on-surface)] flex items-center gap-1.5 uppercase tracking-wider">
                  <Tag className="w-3.5 h-3.5 text-[var(--color-primary)]" />
                  Ride Tags & Preferences
                </span>
                
                <div className="flex flex-wrap gap-1.5">
                  {/* Custom Tag Badges */}
                  {ride.tags?.map((tag, idx) => {
                    let badgeStyle = 'bg-[#f0fdf4] text-[var(--color-primary)] border-[var(--color-primary-light)]';
                    let TagIcon = Sparkles;

                    const lower = tag.toLowerCase();
                    if (lower.includes('quiet')) {
                      badgeStyle = 'bg-slate-100 text-slate-800 border-slate-300';
                      TagIcon = VolumeX;
                    } else if (lower.includes('music')) {
                      badgeStyle = 'bg-purple-50 text-purple-800 border-purple-200';
                      TagIcon = Music;
                    } else if (lower.includes('female')) {
                      badgeStyle = 'bg-pink-50 text-pink-800 border-pink-200';
                      TagIcon = Users;
                    } else if (lower.includes('ev') || lower.includes('electric')) {
                      badgeStyle = 'bg-emerald-50 text-emerald-800 border-emerald-300';
                      TagIcon = Zap;
                    } else if (lower.includes('work') || lower.includes('punctual')) {
                      badgeStyle = 'bg-indigo-50 text-indigo-800 border-indigo-200';
                      TagIcon = Briefcase;
                    } else if (lower.includes('luggage') || lower.includes('boot')) {
                      badgeStyle = 'bg-blue-50 text-blue-800 border-blue-200';
                      TagIcon = Package;
                    }

                    return (
                      <span
                        key={`tag-${idx}`}
                        className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg border shadow-2xs ${badgeStyle}`}
                      >
                        <TagIcon className="w-3.5 h-3.5" />
                        <span>{tag}</span>
                      </span>
                    );
                  })}

                  {/* Amenities Badges */}
                  {ride.amenities.map((item, idx) => (
                    <span
                      key={`amenity-${idx}`}
                      className="inline-flex items-center gap-1 bg-[var(--color-surface-container)] text-[var(--color-on-surface)] text-xs font-semibold px-2.5 py-1 rounded-lg border border-[var(--color-border)]"
                    >
                      <Check className="w-3 h-3 text-[var(--color-primary)]" />
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Booking Form */}
            {isPast ? (
              <div className="pt-4 border-t border-[var(--color-surface-container)] flex flex-col gap-4">
                <div className="p-4 bg-[var(--color-error-bg)] border border-red-200 rounded-2xl flex items-center gap-3 text-xs text-red-800 font-medium">
                  <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
                  <div>
                    <strong className="block text-red-900 font-bold">This ride has departed</strong>
                    The scheduled departure time ({ride.departureTime}) on {ride.date} has already passed.
                  </div>
                </div>

                <button
                  disabled
                  className="w-full bg-[var(--color-border)] text-[var(--color-outline)] font-bold py-4 rounded-full text-base border border-[var(--color-outline-variant)] cursor-not-allowed"
                >
                  Departure Time Passed
                </button>
              </div>
            ) : (
              <form onSubmit={handleBook} className="pt-4 border-t border-[var(--color-surface-container)] flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-[var(--color-on-surface)]">Number of Seats:</label>
                  <div className="flex items-center gap-3 bg-[var(--color-surface-container-low)] p-1.5 rounded-full border border-[var(--color-border)]">
                    <button
                      type="button"
                      onClick={() => setSeats(Math.max(1, seats - 1))}
                      className="w-8 h-8 rounded-full bg-white shadow-xs text-bold text-[var(--color-on-surface)] hover:bg-[var(--color-surface-container)]"
                    >
                      -
                    </button>
                    <span className="font-bold text-sm px-2">{seats}</span>
                    <button
                      type="button"
                      onClick={() => setSeats(Math.min(ride.seatsAvailable, seats + 1))}
                      className="w-8 h-8 rounded-full bg-white shadow-xs text-bold text-[var(--color-on-surface)] hover:bg-[var(--color-surface-container)]"
                    >
                      +
                    </button>
                  </div>
                </div>

                {!user && (
                  <div className="p-3 bg-[var(--color-error-bg)] border border-red-200 rounded-xl text-xs text-red-700">
                    Please <strong>Sign up / Log in</strong> first to complete your booking reservation.
                  </div>
                )}

                {user && (
                  <div className="flex flex-col gap-3">
                    <input
                      type="text"
                      required
                      value={passengerName}
                      onChange={(e) => setPassengerName(e.target.value)}
                      placeholder="Passenger Full Name"
                      className="w-full px-4 py-3 rounded-xl bg-[var(--color-surface-container-low)] border border-[var(--color-border)] text-sm"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="tel"
                        required
                        value={passengerPhone}
                        onChange={(e) => setPassengerPhone(e.target.value)}
                        placeholder="Phone Number"
                        className="w-full px-4 py-3 rounded-xl bg-[var(--color-surface-container-low)] border border-[var(--color-border)] text-sm"
                      />
                      <input
                        type="email"
                        required
                        value={passengerEmail}
                        onChange={(e) => setPassengerEmail(e.target.value)}
                        placeholder="Email"
                        className="w-full px-4 py-3 rounded-xl bg-[var(--color-surface-container-low)] border border-[var(--color-border)] text-sm"
                      />
                    </div>
                  </div>
                )}

                {/* Price Breakdown */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-[var(--color-success-bg)] border border-[var(--color-outline-variant)] mt-1">
                  <div>
                    <span className="text-xs text-[var(--color-on-surface-variant)] block">Total Booking Fare</span>
                    <span className="text-xs text-[var(--color-outline)]">
                      ₹{ride.price} × {seats} seat(s)
                    </span>
                  </div>
                  <span className="text-2xl font-extrabold text-[var(--color-primary)]">₹{totalPrice}</span>
                </div>

                {bookingError && (
                  <p role="alert" className="text-sm text-red-600 bg-[var(--color-error-bg)] border border-red-200 rounded-lg px-3 py-2">
                    {bookingError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isBooking}
                  aria-busy={isBooking}
                  className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-container)] disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-4 rounded-full text-base transition-colors shadow-md cursor-pointer"
                >
                  {isBooking
                    ? 'Confirming…'
                    : user
                    ? 'Confirm & Book Seat'
                    : 'Log In to Book'}
                </button>
              </form>
            )}
          </div>
        )}
      </div>

      {/* Driver Chat Modal */}
      <DriverChatModal
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        driver={ride.driver}
        ride={ride}
        user={user}
        onOpenAuth={onOpenAuth}
      />
    </div>
  );
};
