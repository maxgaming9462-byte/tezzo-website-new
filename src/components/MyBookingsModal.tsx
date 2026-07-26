import React, { useState, useEffect } from 'react';
import {
  X,
  Car,
  Calendar,
  MapPin,
  CheckCircle2,
  Phone,
  Mail,
  Ban,
  AlertTriangle,
  RotateCcw,
  Leaf,
  Route,
  MessageSquare,
  TrendingUp,
  BarChart2,
  Bell,
  Clock,
  ShieldCheck,
  Star,
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Booking, Driver } from '../types';
import { calculateCO2Savings, estimateRideDistanceKm } from '../utils/co2Utils';
import { DriverChatModal } from './DriverChatModal';
import {
  getNotificationPermission,
  requestNotificationPermission,
  sendRide1HourNotification,
  RideNotificationPayload,
} from '../utils/notificationService';
import { hasUserReviewedBooking } from '../utils/reviewService';

interface MyBookingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookings: Booking[];
  onCancelBooking: (bookingId: string) => void;
  onSimulateNotification?: (payload: RideNotificationPayload) => void;
  onOpenDriverReviews?: (driver: Driver, bookingId?: string, rideRoute?: string) => void;
}

export const MyBookingsModal: React.FC<MyBookingsModalProps> = ({
  isOpen,
  onClose,
  bookings,
  onCancelBooking,
  onSimulateNotification,
  onOpenDriverReviews,
}) => {
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [activeChatBooking, setActiveChatBooking] = useState<Booking | null>(null);
  const [notifPerm, setNotifPerm] = useState<NotificationPermission | 'unsupported'>('default');

  useEffect(() => {
    setNotifPerm(getNotificationPermission());
  }, []);

  const handleRequestPerm = async () => {
    const perm = await requestNotificationPermission();
    setNotifPerm(perm);
  };

  const handleTriggerTestReminder = (booking: Booking) => {
    const payload = sendRide1HourNotification(booking, true);
    if (onSimulateNotification) {
      onSimulateNotification(payload);
    }
  };

  if (!isOpen) return null;

  const activeBookings = bookings.filter((b) => b.status !== 'cancelled');

  const totalKm = activeBookings.reduce((sum, b) => {
    return sum + estimateRideDistanceKm(b.ride);
  }, 0);

  const totalCO2Kg = activeBookings.reduce((sum, b) => {
    const savings = calculateCO2Savings(b.ride, b.seatsBooked);
    return sum + savings.co2SavedKg;
  }, 0);

  const roundedCO2 = Math.round(totalCO2Kg * 10) / 10;

  const monthlyCo2Data = [
    { month: 'Mar', co2: 12.4 },
    { month: 'Apr', co2: 18.2 },
    { month: 'May', co2: 24.5 },
    { month: 'Jun', co2: 31.0 },
    { month: 'Jul', co2: Math.max(38.5, Math.round((38.5 + roundedCO2) * 10) / 10) },
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[var(--color-on-surface)] text-white px-3 py-1.5 rounded-xl text-xs shadow-lg border border-[var(--color-on-surface-variant)]">
          <p className="font-extrabold text-[var(--color-accent-mint)]">{`${label}: ${payload[0].value} kg CO₂`}</p>
          <p className="text-[10px] text-gray-300">Emissions saved</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-[var(--color-border)] max-h-[85vh] flex flex-col my-8 animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-[var(--color-primary)] text-white p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Car className="w-5 h-5" />
            <h3 className="font-bold text-lg">My Booked Trips</h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1 rounded-full hover:bg-white/20 transition-colors text-white cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex flex-col gap-4">
          {/* Summary Card for Active Bookings */}
          {bookings.length > 0 && (
            <div className="bg-gradient-to-br from-[var(--color-success-bg-soft)] to-[#e2f8e9] border border-[var(--color-primary-light)] rounded-2xl p-4 shadow-xs flex flex-col gap-2">
              <div className="flex items-center justify-between pb-2 border-b border-[var(--color-primary-light)]/50">
                <div className="flex items-center gap-1.5 text-[var(--color-primary)] font-extrabold text-xs">
                  <Leaf className="w-4 h-4 fill-[var(--color-primary)]/20" />
                  <span>Your Green Impact Summary</span>
                </div>
                <span className="text-[11px] font-semibold text-[#2d5a3e] bg-[var(--color-primary)]/10 px-2.5 py-0.5 rounded-full border border-[var(--color-primary)]/20">
                  {activeBookings.length} Active {activeBookings.length === 1 ? 'Trip' : 'Trips'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="bg-white/90 p-3 rounded-xl border border-[var(--color-primary-light)]/60 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center shrink-0">
                    <Route className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] text-[var(--color-outline)] block font-medium">Distance Traveled</span>
                    <span className="text-base font-extrabold text-[var(--color-on-surface)]">{totalKm} km</span>
                  </div>
                </div>

                <div className="bg-white/90 p-3 rounded-xl border border-[var(--color-primary-light)]/60 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center shrink-0">
                    <Leaf className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] text-[var(--color-outline)] block font-medium">CO₂ Saved</span>
                    <span className="text-base font-extrabold text-[var(--color-primary)]">{roundedCO2} kg</span>
                  </div>
                </div>
              </div>

              {/* CO2 Savings Trend Chart */}
              <div className="mt-2 pt-3 border-t border-[var(--color-primary-light)]/50">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--color-primary)]">
                    <BarChart2 className="w-3.5 h-3.5" />
                    <span>Monthly CO₂ Savings Trend (kg)</span>
                  </div>
                  <span className="text-[10px] text-[var(--color-primary)] font-extrabold bg-white/80 px-2 py-0.5 rounded-md border border-[var(--color-primary-light)] flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 text-[var(--color-primary)]" />
                    +24% vs last mo
                  </span>
                </div>

                <div className="h-32 w-full bg-white/90 p-2.5 rounded-xl border border-[var(--color-primary-light)]/60">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlyCo2Data} margin={{ top: 8, right: 8, left: -22, bottom: 0 }}>
                      <defs>
                        <linearGradient id="co2Gradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0.05} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2f8e9" />
                      <XAxis
                        dataKey="month"
                        tick={{ fontSize: 10, fill: 'var(--color-outline)', fontWeight: 600 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 10, fill: 'var(--color-outline)', fontWeight: 600 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Area
                        type="monotone"
                        dataKey="co2"
                        stroke="var(--color-primary)"
                        strokeWidth={2.5}
                        fillOpacity={1}
                        fill="url(#co2Gradient)"
                        activeDot={{ r: 5, fill: 'var(--color-primary)', stroke: '#ffffff', strokeWidth: 2 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* Push Notification Service Banner */}
          <div className="bg-[var(--color-on-surface)] text-white rounded-2xl p-4 border border-[var(--color-primary)] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-[var(--color-primary)] text-[var(--color-accent-mint)] flex items-center justify-center shrink-0 mt-0.5">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-extrabold text-sm text-white">
                    1-Hour Pre-Ride Push Reminders
                  </h4>
                  {notifPerm === 'granted' ? (
                    <span className="text-[10px] bg-[var(--color-primary)] text-[var(--color-accent-mint)] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> Active
                    </span>
                  ) : (
                    <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded-md">
                      Setup Needed
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-300 mt-0.5">
                  Sends browser push alerts 1 hour before departure with driver's phone & meeting point location.
                </p>
              </div>
            </div>

            {notifPerm !== 'granted' ? (
              <button
                type="button"
                onClick={handleRequestPerm}
                className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-container)] text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer shadow-2xs"
              >
                <Bell className="w-3.5 h-3.5 text-[var(--color-accent-mint)]" />
                <span>Enable Alerts</span>
              </button>
            ) : (
              <span className="text-xs font-bold text-[var(--color-accent-mint)] bg-[var(--color-primary)]/40 px-3 py-1.5 rounded-xl border border-[var(--color-primary)] shrink-0 text-center">
                Reminders Enabled
              </span>
            )}
          </div>

          {bookings.length === 0 ? (
            <div className="text-center py-12 flex flex-col items-center justify-center gap-3">
              <div className="w-16 h-16 rounded-full bg-[var(--color-surface-container-low)] text-[var(--color-outline)] flex items-center justify-center">
                <Car className="w-8 h-8" />
              </div>
              <p className="font-bold text-base text-[var(--color-on-surface)]">No trips booked yet</p>
              <p className="text-xs text-[var(--color-on-surface-variant)] max-w-xs">
                Search for rides from New Delhi to Gurgaon, Noida, Rohtak, Jaipur or Chandigarh and book your seat!
              </p>
            </div>
          ) : (
            bookings.map((booking) => {
              const isCancelled = booking.status === 'cancelled';
              const isConfirmingCancel = cancellingId === booking.id;

              return (
                <div
                  key={booking.id}
                  className={`border p-5 rounded-2xl shadow-xs flex flex-col gap-3 relative transition-all ${
                    isCancelled
                      ? 'bg-[#f8f8f8] border-[var(--color-border)] opacity-80'
                      : 'bg-white border-[var(--color-outline-variant)]'
                  }`}
                >
                  <div className="flex items-center justify-between border-b border-[var(--color-surface-container)] pb-3">
                    <div className="flex items-center gap-2">
                      {isCancelled ? (
                        <span className="bg-[var(--color-error-bg)] text-red-700 font-extrabold text-xs px-2.5 py-1 rounded-full border border-red-200 flex items-center gap-1">
                          <Ban className="w-3.5 h-3.5 text-red-600" />
                          Cancelled
                        </span>
                      ) : (
                        <span className="bg-[var(--color-success-bg)] text-[var(--color-primary)] font-extrabold text-xs px-2.5 py-1 rounded-full border border-[var(--color-outline-variant)] flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 fill-[var(--color-accent-mint)]" />
                          Confirmed
                        </span>
                      )}
                      <span className="text-xs text-[var(--color-outline)]">{booking.bookingDate}</span>
                    </div>
                    <span
                      className={`font-extrabold text-base ${
                        isCancelled ? 'text-[var(--color-outline)] line-through' : 'text-[var(--color-primary)]'
                      }`}
                    >
                      ₹{booking.totalPrice}
                    </span>
                  </div>

                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={booking.ride.driver.avatar}
                        alt={booking.ride.driver.name}
                        className={`w-10 h-10 rounded-full object-cover border ${
                          isCancelled ? 'border-gray-300 grayscale' : 'border-[var(--color-primary)]'
                        }`}
                      />
                      <div>
                        <h4 className="font-bold text-sm text-[var(--color-on-surface)]">
                          {booking.ride.driver.name}
                        </h4>
                        <p className="text-xs text-[var(--color-on-surface-variant)]">{booking.ride.car.model}</p>
                      </div>
                    </div>

                    <div className="text-right text-xs text-[var(--color-on-surface-variant)]">
                      <span className="font-bold">{booking.seatsBooked} Seat(s)</span>
                      <span className="block text-[var(--color-outline)]">{booking.ride.departureTime}</span>
                    </div>
                  </div>

                  <div className="bg-[var(--color-background)] p-3 rounded-xl border border-[var(--color-surface-container)] text-xs flex flex-col gap-1.5">
                    <div className="flex items-center justify-between font-bold text-[var(--color-on-surface)]">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-[var(--color-primary)]" /> {booking.ride.origin}
                      </span>
                      <span>→</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-[var(--color-primary)]" /> {booking.ride.destination}
                      </span>
                    </div>
                    {booking.ride.originDetails && (
                      <div className="text-[11px] text-[var(--color-primary)] font-semibold bg-[var(--color-success-bg-soft)] px-2.5 py-1 rounded-lg border border-[var(--color-primary-light)]/60 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[var(--color-primary)] shrink-0" />
                        <span>Meeting Point: {booking.ride.originDetails}</span>
                      </div>
                    )}
                    <div className="text-[var(--color-outline)] flex items-center justify-between pt-1 border-t border-[var(--color-surface-container)]">
                      <span>
                        <Calendar className="inline w-3 h-3" /> {booking.ride.date}
                      </span>
                      <span>Vehicle: {booking.ride.car.plateNumber}</span>
                    </div>
                  </div>

                  {!isCancelled && (
                    <div className="flex items-center justify-between text-xs text-[var(--color-on-surface-variant)] bg-[var(--color-success-bg)] px-3 py-2 rounded-lg border border-[var(--color-outline-variant)]">
                      <span className="flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-[var(--color-primary)]" />{' '}
                        {booking.ride.driver.phone || '+91 98765 43210'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5 text-[var(--color-primary)]" /> {booking.passengerEmail}
                      </span>
                    </div>
                  )}

                  {/* Cancel Action Section */}
                  {isCancelled ? (
                    <div className="p-2.5 bg-[var(--color-surface-container-low)] rounded-xl text-xs text-[var(--color-outline)] border border-[var(--color-border)] flex items-center justify-between">
                      <span>Booking cancelled. Seats returned to ride pool.</span>
                    </div>
                  ) : isConfirmingCancel ? (
                    <div className="p-3 bg-[var(--color-error-bg)] border border-red-200 rounded-xl flex flex-col gap-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-red-800">
                        <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                        <span>Cancel booking for {booking.seatsBooked} seat(s)?</span>
                      </div>
                      <p className="text-[11px] text-red-700">
                        This action will cancel your reservation and restore {booking.seatsBooked} seat(s) to the available ride list.
                      </p>
                      <div className="flex items-center justify-end gap-2 mt-1">
                        <button
                          type="button"
                          onClick={() => setCancellingId(null)}
                          className="px-3 py-1.5 rounded-lg bg-white border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                        >
                          Keep Booking
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            onCancelBooking(booking.id);
                            setCancellingId(null);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors"
                        >
                          Yes, Cancel Ride
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
                      {onOpenDriverReviews && (
                        <button
                          type="button"
                          onClick={() =>
                            onOpenDriverReviews(
                              booking.ride.driver,
                              booking.id,
                              `${booking.ride.origin} → ${booking.ride.destination}`
                            )
                          }
                          className="text-xs font-bold text-amber-800 hover:bg-amber-100 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-300 transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
                          title="Rate and leave a review for this driver"
                        >
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                          <span>
                            {hasUserReviewedBooking(booking.id) ? '★ Reviewed' : 'Rate Driver'}
                          </span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleTriggerTestReminder(booking)}
                        className="text-xs font-bold text-[var(--color-on-surface)] hover:bg-gray-100 bg-[var(--color-surface-container-low)] px-3 py-1.5 rounded-lg border border-[var(--color-outline-variant)] transition-colors flex items-center gap-1 cursor-pointer"
                        title="Simulate 1-hour pre-ride push notification with driver contact & meeting point"
                      >
                        <Bell className="w-3.5 h-3.5 text-[var(--color-primary)]" />
                        <span>Test 1-Hr Reminder</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveChatBooking(booking)}
                        className="text-xs font-bold text-[var(--color-primary)] hover:bg-[var(--color-success-bg-soft)] bg-[var(--color-success-bg)] px-3 py-1.5 rounded-lg border border-[var(--color-primary-light)] transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-[var(--color-primary)]" />
                        Message Driver
                      </button>
                      <button
                        type="button"
                        onClick={() => setCancellingId(booking.id)}
                        className="text-xs font-bold text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg border border-red-200 transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Ban className="w-3.5 h-3.5" />
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {activeChatBooking && (
        <DriverChatModal
          isOpen={!!activeChatBooking}
          onClose={() => setActiveChatBooking(null)}
          driver={activeChatBooking.ride.driver}
          ride={activeChatBooking.ride}
          user={{
            name: activeChatBooking.passengerName,
            email: activeChatBooking.passengerEmail,
            phone: activeChatBooking.passengerPhone,
            avatar: '',
            verified: false,
            bio: '',
          }}
        />
      )}
    </div>
  );
};

