import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  X,
  PlusCircle,
  User,
  Car,
  Shield,
  Search,
  CheckCircle2,
  Bell,
  Clock,
  ArrowRight,
  ChevronRight,
  Calendar,
  Bookmark,
} from 'lucide-react';
import { UserProfile, Booking } from '../types';
import { isTripWithinNext24Hours } from '../utils/timeUtils';

interface HeaderProps {
  onOpenAuth: () => void;
  onOpenOfferRide: () => void;
  onOpenSearch: () => void;
  onOpenMyBookings: () => void;
  onOpenProfile?: () => void;
  user: UserProfile | null;
  onSignOut: () => void;
  bookings?: Booking[];
}

export const Header: React.FC<HeaderProps> = ({
  onOpenAuth,
  onOpenOfferRide,
  onOpenSearch,
  onOpenMyBookings,
  onOpenProfile,
  user,
  onSignOut,
  bookings = [],
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  // Close notification popover on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const upcomingTrips = bookings.filter(
    (b) => b.status === 'confirmed' && isTripWithinNext24Hours(b.ride)
  );

  const logoUrl =
    'https://lh3.googleusercontent.com/aida/AP1WRLsHr6JcZPgbzSlUhEaO44gdrIXq2Qdkl2Y73tCpcjtuuKNFYrRSRmzqlQipzf-tnLuYVOx4NGaZsCD8sRGh6jbPKOh3miHNQRMKiybtQQRiwZL4vMrBTco-9j9pWTPVBHAj_3ckWl6qxKNEP2C9Ev4aMSyV7lsLBiJ5WvaT6btJW8xC77PhJOE1K-hRFrXm73bA1YLcwMaEvyOBkU5QdyIAr8rhALKMbSi-Ruhcwp4nUFNvgfZiAZxqNw';

  return (
    <>
      <header className="fixed top-0 left-0 w-full z-40 bg-white/95 backdrop-blur-md shadow-sm border-b border-[#eeeeee]">
        <div className="flex justify-between items-center w-full px-4 sm:px-6 py-3.5 max-w-[1120px] mx-auto">
          {/* Logo */}
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-2 text-left focus:outline-none group cursor-pointer"
          >
            <img
              src={logoUrl}
              alt="Tezzo Logo"
              className="h-8 sm:h-9 w-auto object-contain transition-transform group-hover:scale-105"
            />
          </button>

          {/* Desktop & Mobile Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={onOpenOfferRide}
              className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-[#006a3b] bg-[#f6fff4] hover:bg-[#e2f7df] border border-[#bdcabd] px-3 py-2 rounded-full transition-colors cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Offer a ride</span>
            </button>

            {/* Notification Bell Indicator for 24h Trips */}
            <div className="relative" ref={notificationRef}>
              <button
                type="button"
                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                className="relative p-2 rounded-full hover:bg-[#eeeeee] transition-colors text-[#1b1b1b] focus:outline-none cursor-pointer flex items-center justify-center"
                title="Upcoming Trips (Next 24 Hours)"
                aria-label="Upcoming Trips Notifications"
              >
                <Bell className="w-5 h-5 text-[#1b1b1b]" />

                {upcomingTrips.length > 0 && (
                  <>
                    <span className="absolute top-1 right-1 flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#006a3b]"></span>
                    </span>
                    <span className="absolute -top-1 -right-1 bg-[#006a3b] text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-white shadow-2xs">
                      {upcomingTrips.length}
                    </span>
                  </>
                )}
              </button>

              {/* Dropdown Popover */}
              {isNotificationOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-88 bg-white rounded-2xl shadow-xl border border-[#bdcabd] p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between pb-3 border-b border-[#eeeeee]">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-[#f6fff4] text-[#006a3b] border border-[#a3e6b7] flex items-center justify-center shrink-0">
                        <Bell className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-[#1b1b1b]">Upcoming Trips</h4>
                        <p className="text-[10px] text-[#6e7a6f]">Next 24 Hours Schedule</p>
                      </div>
                    </div>
                    {upcomingTrips.length > 0 && (
                      <span className="bg-[#f6fff4] text-[#006a3b] border border-[#a3e6b7] text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                        {upcomingTrips.length} Active
                      </span>
                    )}
                  </div>

                  <div className="py-2 flex flex-col gap-2 max-h-64 overflow-y-auto">
                    {upcomingTrips.length === 0 ? (
                      <div className="py-6 text-center flex flex-col items-center justify-center gap-2 text-[#6e7a6f]">
                        <CheckCircle2 className="w-8 h-8 text-[#006a3b]/40" />
                        <p className="text-xs font-semibold text-[#1b1b1b]">No trips in the next 24 hours</p>
                        <p className="text-[11px]">Ready for your next journey? Search rides now.</p>
                        <button
                          type="button"
                          onClick={() => {
                            setIsNotificationOpen(false);
                            onOpenSearch();
                          }}
                          className="mt-1 text-xs font-bold text-[#006a3b] hover:underline cursor-pointer"
                        >
                          Search Rides Now →
                        </button>
                      </div>
                    ) : (
                      upcomingTrips.map((b) => (
                        <div
                          key={b.id}
                          className="bg-[#f6fff4] border border-[#a3e6b7] p-3 rounded-xl flex flex-col gap-2 transition-all hover:bg-[#eefcf2]"
                        >
                          <div className="flex items-center justify-between text-xs font-bold text-[#1b1b1b]">
                            <div className="flex items-center gap-1.5">
                              <span>{b.ride.origin}</span>
                              <ArrowRight className="w-3 h-3 text-[#006a3b]" />
                              <span>{b.ride.destination}</span>
                            </div>
                            <span className="bg-white text-[#006a3b] font-black text-[11px] px-2 py-0.5 rounded-full border border-[#a3e6b7]">
                              {b.ride.departureTime}
                            </span>
                          </div>

                          <div className="flex flex-col gap-1 text-[11px] text-[#3e4a40]">
                            <div className="flex items-center justify-between">
                              <span className="flex items-center gap-1 font-semibold">
                                <Calendar className="w-3 h-3 text-[#006a3b]" /> {b.ride.date}
                              </span>
                              <span>Driver: {b.ride.driver.name} ({b.ride.driver.phone || '+91 98765 43210'})</span>
                            </div>
                            {b.ride.originDetails && (
                              <div className="text-[10px] text-[#006a3b] font-bold bg-white px-2 py-0.5 rounded-md border border-[#a3e6b7]">
                                Meeting Point: {b.ride.originDetails}
                              </div>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              setIsNotificationOpen(false);
                              onOpenMyBookings();
                            }}
                            className="w-full bg-[#006a3b] hover:bg-[#00864c] text-white text-xs font-bold py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer mt-1"
                          >
                            <span>View Ticket & Details</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>

                  {upcomingTrips.length > 0 && (
                    <div className="pt-2 border-t border-[#eeeeee] flex justify-center">
                      <button
                        type="button"
                        onClick={() => {
                          setIsNotificationOpen(false);
                          onOpenMyBookings();
                        }}
                        className="text-xs font-bold text-[#006a3b] hover:underline cursor-pointer"
                      >
                        Manage All My Bookings
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {user ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={onOpenProfile || onOpenMyBookings}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#f6fff4] hover:bg-[#eefcf2] border border-[#a3e6b7] text-xs font-bold text-[#006a3b] transition-colors cursor-pointer shadow-2xs"
                  title="View Profile & Preferred Commutes"
                >
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-6 h-6 rounded-full object-cover border border-[#006a3b]"
                  />
                  <span className="hidden md:inline max-w-[110px] truncate">{user.name}</span>
                  <Bookmark className="w-3.5 h-3.5 text-[#006a3b]" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="text-sm font-semibold text-[#006a3b] hover:text-[#00864c] transition-colors px-2 py-1 cursor-pointer"
              >
                Sign up
              </button>
            )}

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-[#1b1b1b] p-2 rounded-full hover:bg-[#eeeeee] transition-colors focus:outline-none cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Drawer */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-xs sm:max-w-sm bg-white h-full shadow-2xl p-6 flex flex-col justify-between animate-in slide-in-from-right duration-200">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-[#eeeeee]">
                <img src={logoUrl} alt="Tezzo" className="h-8 object-contain" />
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-1.5 rounded-full hover:bg-[#eeeeee] text-[#1b1b1b] cursor-pointer"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Upcoming Trip Alert Banner in Mobile Drawer */}
              {upcomingTrips.length > 0 && (
                <div
                  onClick={() => {
                    setIsMenuOpen(false);
                    onOpenMyBookings();
                  }}
                  className="mt-4 p-3 bg-[#f6fff4] border border-[#a3e6b7] rounded-xl flex items-center justify-between gap-2 cursor-pointer hover:bg-[#eefcf2] transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-[#006a3b] text-white flex items-center justify-center shrink-0">
                      <Bell className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-extrabold text-xs text-[#006a3b] block">
                        {upcomingTrips.length} Upcoming Trip (24h)
                      </span>
                      <span className="text-[11px] text-[#3e4a40]">
                        {upcomingTrips[0].ride.origin} → {upcomingTrips[0].ride.destination} (
                        {upcomingTrips[0].ride.departureTime})
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#006a3b]" />
                </div>
              )}

              {user && (
                <div className="my-4 p-3.5 bg-[#f6fff4] border border-[#bdcabd] rounded-xl flex items-center gap-3">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-10 h-10 rounded-full object-cover border-2 border-[#006a3b]"
                  />
                  <div>
                    <div className="flex items-center gap-1">
                      <span className="font-bold text-sm text-[#1b1b1b]">{user.name}</span>
                      <CheckCircle2 className="w-4 h-4 text-[#006a3b] fill-[#8af9b1]" />
                    </div>
                    <span className="text-xs text-[#3e4a40]">Verified Tezzo Member</span>
                  </div>
                </div>
              )}

              <nav className="mt-2 flex flex-col gap-1">
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    onOpenSearch();
                  }}
                  className="flex items-center gap-3 w-full text-left px-4 py-3 rounded-xl hover:bg-[#f3f3f3] font-medium text-sm text-[#1b1b1b] cursor-pointer"
                >
                  <Search className="w-5 h-5 text-[#006a3b]" />
                  <span>Search Rides</span>
                </button>

                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    onOpenOfferRide();
                  }}
                  className="flex items-center gap-3 w-full text-left px-4 py-3 rounded-xl hover:bg-[#f3f3f3] font-medium text-sm text-[#1b1b1b] cursor-pointer"
                >
                  <PlusCircle className="w-5 h-5 text-[#006a3b]" />
                  <span>Offer a Ride</span>
                </button>

                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    onOpenMyBookings();
                  }}
                  className="flex items-center gap-3 w-full text-left px-4 py-3 rounded-xl hover:bg-[#f3f3f3] font-medium text-sm text-[#1b1b1b] cursor-pointer"
                >
                  <Car className="w-5 h-5 text-[#006a3b]" />
                  <span>My Bookings</span>
                </button>

                {onOpenProfile && (
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      onOpenProfile();
                    }}
                    className="flex items-center gap-3 w-full text-left px-4 py-3 rounded-xl hover:bg-[#f3f3f3] font-medium text-sm text-[#1b1b1b] cursor-pointer"
                  >
                    <Bookmark className="w-5 h-5 text-[#006a3b]" />
                    <span>Preferred Commutes & Profile</span>
                  </button>
                )}

                <div className="my-2 border-t border-[#eeeeee]"></div>

                <a
                  href="#how-it-works"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 w-full text-left px-4 py-3 rounded-xl hover:bg-[#f3f3f3] font-medium text-sm text-[#3e4a40]"
                >
                  <Shield className="w-5 h-5 text-[#7a5900]" />
                  <span>Trust & Safety</span>
                </a>
              </nav>
            </div>

            <div className="pt-4 border-t border-[#eeeeee]">
              {user ? (
                <button
                  onClick={() => {
                    onSignOut();
                    setIsMenuOpen(false);
                  }}
                  className="w-full py-3 rounded-full bg-[#f3f3f3] text-red-600 font-semibold text-sm hover:bg-red-50 transition-colors cursor-pointer"
                >
                  Log Out
                </button>
              ) : (
                <button
                  onClick={() => {
                    onOpenAuth();
                    setIsMenuOpen(false);
                  }}
                  className="w-full py-3 rounded-full bg-[#006a3b] hover:bg-[#00864c] text-white font-semibold text-sm transition-colors cursor-pointer"
                >
                  Sign up / Log in
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
