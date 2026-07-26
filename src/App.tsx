/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { SearchWidget } from './components/SearchWidget';
import { ValuePropositions } from './components/ValuePropositions';
import { PopularRoutes } from './components/PopularRoutes';
import { SuggestedRoutes } from './components/SuggestedRoutes';
import { Footer } from './components/Footer';
import { RideReminderBanner } from './components/RideReminderBanner';

// Modals are loaded on-demand (code-split) since they aren't needed for the
// initial paint — this keeps the first-load JS bundle smaller.
const SearchResultsModal = lazy(() =>
  import('./components/SearchResultsModal').then((m) => ({ default: m.SearchResultsModal }))
);
const RideDetailsModal = lazy(() =>
  import('./components/RideDetailsModal').then((m) => ({ default: m.RideDetailsModal }))
);
const OfferRideModal = lazy(() =>
  import('./components/OfferRideModal').then((m) => ({ default: m.OfferRideModal }))
);
const AuthModal = lazy(() =>
  import('./components/AuthModal').then((m) => ({ default: m.AuthModal }))
);
const MyBookingsModal = lazy(() =>
  import('./components/MyBookingsModal').then((m) => ({ default: m.MyBookingsModal }))
);
const UserProfileModal = lazy(() =>
  import('./components/UserProfileModal').then((m) => ({ default: m.UserProfileModal }))
);
const DriverReviewsModal = lazy(() =>
  import('./components/DriverReviewsModal').then((m) => ({ default: m.DriverReviewsModal }))
);

import { Ride, SearchQuery, Booking, UserProfile, PreferredCommute, Driver } from './types';
import { INITIAL_RIDES } from './data/mockRides';
import {
  checkUpcomingBookingsFor1HourReminder,
  RideNotificationPayload,
} from './utils/notificationService';

export default function App() {
  // Application State
  const [rides, setRides] = useState<Ride[]>(INITIAL_RIDES);
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('tezzo_user_profile');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // Ignore error
    }
    return {
      name: 'Priya Sharma',
      email: 'priya.sharma@tezzo.com',
      phone: '+91 98765 43210',
      avatar:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
      verified: true,
      bio: 'Tezzo member & active carpooler.',
      preferredCommutes: [
        {
          id: 'pref-1',
          title: 'Daily Work Commute',
          origin: 'New Delhi',
          destination: 'Gurgaon',
          passengers: 1,
          isDefault: true,
        },
        {
          id: 'pref-2',
          title: 'Weekend Getaway',
          origin: 'New Delhi',
          destination: 'Jaipur',
          passengers: 2,
          isDefault: false,
        },
      ],
      favoriteDrivers: [
        {
          name: 'Rajesh Kumar',
          avatar:
            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
          rating: 4.9,
          reviewsCount: 124,
          ridesCompleted: 180,
          verified: true,
        },
      ],
    };
  });

  const [bookings, setBookings] = useState<Booking[]>([
    {
      id: 'booking-upcoming-1',
      ride: INITIAL_RIDES[0],
      seatsBooked: 1,
      totalPrice: 120,
      status: 'confirmed',
      bookingDate: 'Today',
      passengerName: 'Priya Sharma',
      passengerEmail: 'priya.sharma@tezzo.com',
      passengerPhone: '+91 98765 43210',
    },
  ]);

  // Modal Control States
  const [searchQuery, setSearchQuery] = useState<SearchQuery>({
    origin: 'New Delhi',
    destination: '',
    date: 'Today',
    passengers: 1,
  });

  const [isSearchResultsOpen, setIsSearchResultsOpen] = useState(false);
  const [selectedRide, setSelectedRide] = useState<Ride | null>(null);
  const [isOfferRideOpen, setIsOfferRideOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isMyBookingsOpen, setIsMyBookingsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [activeNotificationPayload, setActiveNotificationPayload] =
    useState<RideNotificationPayload | null>(null);

  // Driver Reviews Modal state
  const [reviewModalState, setReviewModalState] = useState<{
    isOpen: boolean;
    driver: Driver | null;
    bookingId?: string;
    rideRoute?: string;
  }>({
    isOpen: false,
    driver: null,
  });

  const handleOpenDriverReviews = (
    driver: Driver,
    bookingId?: string,
    rideRoute?: string
  ) => {
    setReviewModalState({
      isOpen: true,
      driver,
      bookingId,
      rideRoute,
    });
  };

  // Periodic Background Check for 1-hour pre-ride alerts
  useEffect(() => {
    const checkReminders = () => {
      checkUpcomingBookingsFor1HourReminder(bookings, (payload) => {
        setActiveNotificationPayload(payload);
      });
    };

    // Run on initial mount
    checkReminders();

    // Check every 25 seconds
    const interval = setInterval(checkReminders, 25000);
    return () => clearInterval(interval);
  }, [bookings]);

  // Handlers
  const handleUpdateProfile = (updatedUser: UserProfile) => {
    setUser(updatedUser);
    try {
      localStorage.setItem('tezzo_user_profile', JSON.stringify(updatedUser));
    } catch (e) {
      // Ignore
    }
  };

  const handleSavePreferredCommute = (newCommute: PreferredCommute) => {
    if (!user) {
      setIsAuthOpen(true);
      return;
    }
    const currentCommutes = user.preferredCommutes || [];
    // Check if route already exists
    const existsIndex = currentCommutes.findIndex(
      (c) =>
        c.origin.toLowerCase() === newCommute.origin.toLowerCase() &&
        c.destination.toLowerCase() === newCommute.destination.toLowerCase()
    );

    let updatedList = [...currentCommutes];
    if (existsIndex >= 0) {
      updatedList[existsIndex] = { ...updatedList[existsIndex], ...newCommute };
    } else {
      updatedList.push(newCommute);
    }

    handleUpdateProfile({
      ...user,
      preferredCommutes: updatedList,
    });
  };

  // Handlers
  const handleSearchSubmit = (query: SearchQuery) => {
    setSearchQuery(query);
    setIsSearchResultsOpen(true);
  };

  const handlePopularRouteSelect = (destination: string) => {
    const query: SearchQuery = {
      origin: 'New Delhi',
      destination,
      date: destination === 'Rohtak' || destination === 'Jaipur' ? 'Tomorrow' : 'Today',
      passengers: 1,
    };
    setSearchQuery(query);
    setIsSearchResultsOpen(true);
  };

  const handleSelectRide = (ride: Ride) => {
    setSelectedRide(ride);
  };

  const handleConfirmBooking = (newBooking: Booking) => {
    setBookings((prev) => [newBooking, ...prev]);

    // Decrease available seats for booked ride
    setRides((prevRides) =>
      prevRides.map((r) =>
        r.id === newBooking.ride.id
          ? {
              ...r,
              seatsAvailable: Math.max(0, r.seatsAvailable - newBooking.seatsBooked),
            }
          : r
      )
    );
  };

  const handleCancelBooking = (bookingId: string) => {
    const targetBooking = bookings.find((b) => b.id === bookingId);
    if (!targetBooking || targetBooking.status === 'cancelled') return;

    // Restore available seats to the corresponding ride
    setRides((prevRides) =>
      prevRides.map((r) =>
        r.id === targetBooking.ride.id
          ? {
              ...r,
              seatsAvailable: Math.min(r.seatsTotal, r.seatsAvailable + targetBooking.seatsBooked),
            }
          : r
      )
    );

    // Update booking status to cancelled
    setBookings((prevBookings) =>
      prevBookings.map((b) => (b.id === bookingId ? { ...b, status: 'cancelled' } : b))
    );
  };

  const handlePublishRide = (newRide: Ride) => {
    setRides((prev) => [newRide, ...prev]);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-background)] text-[var(--color-on-surface)] selection:bg-[#00864c] selection:text-white">
      {/* Fixed Navigation Header */}
      <Header
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenOfferRide={() => setIsOfferRideOpen(true)}
        onOpenSearch={() => {
          setSearchQuery({ origin: 'New Delhi', destination: '', date: 'Today', passengers: 1 });
          setIsSearchResultsOpen(true);
        }}
        onOpenMyBookings={() => setIsMyBookingsOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        user={user}
        onSignOut={() => setUser(null)}
        bookings={bookings}
      />

      {/* Main Page Layout */}
      <main className="pt-20 flex-1 flex flex-col">
        {/* Story First Hero Banner */}
        <HeroSection />

        {/* Search Widget */}
        <SearchWidget
          onSearch={handleSearchSubmit}
          user={user}
          onOpenProfile={() => setIsProfileOpen(true)}
          onSavePreferredCommute={handleSavePreferredCommute}
        />

        {/* Value Propositions Cards */}
        <ValuePropositions />

        {/* Suggested Routes Based on Booking History */}
        <SuggestedRoutes
          bookings={bookings}
          rides={rides}
          onSelectRide={handleSelectRide}
          onSearchRoute={handlePopularRouteSelect}
        />

        {/* Popular Community Routes */}
        <PopularRoutes onSelectRoute={handlePopularRouteSelect} />
      </main>

      {/* Footer */}
      <Footer />

      {/* Modals & Drawers — mounted only when needed so their code chunk
          loads on-demand instead of blocking the initial page render. */}
      <Suspense fallback={null}>
        {isSearchResultsOpen && (
          <SearchResultsModal
            isOpen={isSearchResultsOpen}
            onClose={() => setIsSearchResultsOpen(false)}
            query={searchQuery}
            rides={rides}
            onSelectRide={handleSelectRide}
            onUpdateQuery={(updated) => setSearchQuery(updated)}
            onOpenDriverReviews={handleOpenDriverReviews}
          />
        )}

        {selectedRide && (
          <RideDetailsModal
            ride={selectedRide}
            onClose={() => setSelectedRide(null)}
            user={user}
            onOpenAuth={() => setIsAuthOpen(true)}
            onConfirmBooking={handleConfirmBooking}
            onUpdateProfile={handleUpdateProfile}
            onOpenDriverReviews={handleOpenDriverReviews}
          />
        )}

        {isOfferRideOpen && (
          <OfferRideModal
            isOpen={isOfferRideOpen}
            onClose={() => setIsOfferRideOpen(false)}
            user={user}
            onOpenAuth={() => setIsAuthOpen(true)}
            onPublishRide={handlePublishRide}
          />
        )}

        {isAuthOpen && (
          <AuthModal
            isOpen={isAuthOpen}
            onClose={() => setIsAuthOpen(false)}
            onLoginSuccess={(loggedInUser) => setUser(loggedInUser)}
          />
        )}

        {isMyBookingsOpen && (
          <MyBookingsModal
            isOpen={isMyBookingsOpen}
            onClose={() => setIsMyBookingsOpen(false)}
            bookings={bookings}
            onCancelBooking={handleCancelBooking}
            onSimulateNotification={(payload) => setActiveNotificationPayload(payload)}
            onOpenDriverReviews={handleOpenDriverReviews}
          />
        )}

        {isProfileOpen && (
          <UserProfileModal
            isOpen={isProfileOpen}
            onClose={() => setIsProfileOpen(false)}
            user={user}
            onUpdateProfile={handleUpdateProfile}
            onSelectCommuteForSearch={handleSearchSubmit}
            onOpenDriverReviews={handleOpenDriverReviews}
          />
        )}

        {reviewModalState.driver && (
          <DriverReviewsModal
            isOpen={reviewModalState.isOpen}
            onClose={() => setReviewModalState({ isOpen: false, driver: null })}
            driver={reviewModalState.driver}
            user={user}
            onOpenAuth={() => setIsAuthOpen(true)}
            bookingId={reviewModalState.bookingId}
            rideRoute={reviewModalState.rideRoute}
          />
        )}
      </Suspense>

      {/* Reminder banner stays outside Suspense — it's tiny and controls its
          own visibility via the payload prop. */}
      <RideReminderBanner
        payload={activeNotificationPayload}
        onClose={() => setActiveNotificationPayload(null)}
        onOpenMyBookings={() => setIsMyBookingsOpen(true)}
      />
    </div>
  );
}
