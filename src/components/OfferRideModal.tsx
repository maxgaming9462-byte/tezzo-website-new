import React, { useState } from 'react';
import { X, PlusCircle, CheckCircle2 } from 'lucide-react';
import { Ride, UserProfile } from '../types';

interface OfferRideModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
  onOpenAuth: () => void;
  onPublishRide: (ride: Ride) => void;
}

export const OfferRideModal: React.FC<OfferRideModalProps> = ({
  isOpen,
  onClose,
  user,
  onOpenAuth,
  onPublishRide,
}) => {
  const [origin, setOrigin] = useState('New Delhi');
  const [originDetails, setOriginDetails] = useState('');
  const [destination, setDestination] = useState('');
  const [destinationDetails, setDestinationDetails] = useState('');
  const [date, setDate] = useState('Today');
  const [departureTime, setDepartureTime] = useState('09:00 AM');
  const [price, setPrice] = useState(150);
  const [seats, setSeats] = useState(3);
  const [carModel, setCarModel] = useState('Honda City');
  const [carType, setCarType] = useState<'Sedan' | 'SUV' | 'EV' | 'Hatchback'>('Sedan');
  const [plateNumber, setPlateNumber] = useState('DL 01 AB 9999');
  const [notes, setNotes] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([
    'Quiet Ride',
    'No Smoking',
    'Work Friendly',
  ]);
  const [published, setPublished] = useState(false);

  const AVAILABLE_RIDE_TAGS = [
    'Quiet Ride',
    'Music Allowed',
    'No Smoking',
    'Female Only',
    'Pet Friendly',
    'Work Friendly',
    'Spacious Boot',
    'Punctual Departure',
  ];

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      onOpenAuth();
      return;
    }

    const newRide: Ride = {
      id: `ride-custom-${Date.now()}`,
      origin: origin || 'New Delhi',
      originDetails: originDetails || origin,
      destination: destination || 'Gurgaon',
      destinationDetails: destinationDetails || destination,
      date,
      departureTime,
      arrivalTime: '10:00 AM',
      duration: '1h 00m',
      price: Number(price),
      seatsTotal: Number(seats),
      seatsAvailable: Number(seats),
      driver: {
        name: user.name,
        avatar: user.avatar,
        rating: 5.0,
        reviewsCount: 1,
        ridesCompleted: 1,
        verified: user.verified,
        phone: user.phone,
        memberSince: '2024',
      },
      car: {
        model: carModel,
        color: 'White',
        plateNumber: plateNumber,
        type: carType,
      },
      instantBooking: true,
      amenities: ['AC', 'Music', 'Sanitized'],
      tags: selectedTags,
      notes,
    };

    onPublishRide(newRide);
    setPublished(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-[var(--color-border)] my-8 animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-[var(--color-primary)] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PlusCircle className="w-5 h-5" />
            <h3 className="font-bold text-lg">Offer a Ride</h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1 rounded-full hover:bg-white/20 transition-colors text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {published ? (
          <div className="p-8 text-center flex flex-col items-center justify-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[var(--color-success-bg)] border-2 border-[var(--color-primary)] text-[var(--color-primary)] flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 fill-[var(--color-accent-mint)]" />
            </div>
            <h3 className="text-2xl font-extrabold text-[var(--color-on-surface)]">Ride Published!</h3>
            <p className="text-sm text-[var(--color-on-surface-variant)]">
              Your trip from <strong className="text-[var(--color-on-surface)]">{origin}</strong> to{' '}
              <strong className="text-[var(--color-on-surface)]">{destination}</strong> is now live. Passengers can book seats immediately!
            </p>
            <button
              onClick={() => {
                setPublished(false);
                onClose();
              }}
              className="mt-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-container)] text-white font-semibold px-8 py-3 rounded-full text-sm transition-colors w-full"
            >
              Back to Home
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4 max-h-[80vh] overflow-y-auto">
            {!user ? (
              <div className="p-4 bg-[#fffdea] border border-[var(--color-secondary-container)] rounded-xl text-xs text-[var(--color-on-secondary-container)]">
                Please <strong>Sign up / Log in</strong> first to publish a ride offer.
              </div>
            ) : null}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-[var(--color-on-surface)] block mb-1">Leaving from</label>
                <input
                  type="text"
                  required
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  placeholder="e.g. New Delhi"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--color-surface-container-low)] border border-[var(--color-border)] text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[var(--color-on-surface)] block mb-1">Going to</label>
                <input
                  type="text"
                  required
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="e.g. Gurgaon / Jaipur"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--color-surface-container-low)] border border-[var(--color-border)] text-sm"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-[var(--color-on-surface)] block mb-1">Pickup Stop / LandMark</label>
              <input
                type="text"
                value={originDetails}
                onChange={(e) => setOriginDetails(e.target.value)}
                placeholder="e.g. CP Metro Gate 2 / Kashmere Gate"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--color-surface-container-low)] border border-[var(--color-border)] text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-[var(--color-on-surface)] block mb-1">Date</label>
                <select
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--color-surface-container-low)] border border-[var(--color-border)] text-sm"
                >
                  <option value="Today">Today</option>
                  <option value="Tomorrow">Tomorrow</option>
                  <option value="This Weekend">This Weekend</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-[var(--color-on-surface)] block mb-1">Departure Time</label>
                <input
                  type="text"
                  required
                  value={departureTime}
                  onChange={(e) => setDepartureTime(e.target.value)}
                  placeholder="e.g. 08:30 AM"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--color-surface-container-low)] border border-[var(--color-border)] text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-[var(--color-on-surface)] block mb-1">Price per Seat (₹)</label>
                <input
                  type="number"
                  min="50"
                  max="5000"
                  required
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--color-surface-container-low)] border border-[var(--color-border)] text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[var(--color-on-surface)] block mb-1">Seats Available</label>
                <select
                  value={seats}
                  onChange={(e) => setSeats(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--color-surface-container-low)] border border-[var(--color-border)] text-sm"
                >
                  <option value={1}>1 seat</option>
                  <option value={2}>2 seats</option>
                  <option value={3}>3 seats</option>
                  <option value={4}>4 seats</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-bold text-[var(--color-on-surface)] block mb-1">Vehicle Type</label>
                <select
                  value={carType}
                  onChange={(e) => setCarType(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--color-surface-container-low)] border border-[var(--color-border)] text-sm font-semibold"
                >
                  <option value="Sedan">Sedan</option>
                  <option value="SUV">SUV</option>
                  <option value="EV">EV (Electric)</option>
                  <option value="Hatchback">Hatchback</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-[var(--color-on-surface)] block mb-1">Car Model</label>
                <input
                  type="text"
                  required
                  value={carModel}
                  onChange={(e) => setCarModel(e.target.value)}
                  placeholder="e.g. Honda City"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--color-surface-container-low)] border border-[var(--color-border)] text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[var(--color-on-surface)] block mb-1">License Plate</label>
                <input
                  type="text"
                  required
                  value={plateNumber}
                  onChange={(e) => setPlateNumber(e.target.value)}
                  placeholder="e.g. DL 3C XX 1234"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--color-surface-container-low)] border border-[var(--color-border)] text-sm"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-[var(--color-on-surface)] block mb-1">Ride Tags & Preferences</label>
              <div className="flex flex-wrap gap-1.5 p-3 rounded-2xl bg-[var(--color-success-bg)] border border-[var(--color-outline-variant)]">
                {AVAILABLE_RIDE_TAGS.map((tag) => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`text-xs px-2.5 py-1 rounded-lg font-bold transition-all border cursor-pointer ${
                        isSelected
                          ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)] shadow-2xs'
                          : 'bg-white text-[var(--color-on-surface-variant)] border-[var(--color-outline-variant)] hover:bg-gray-100'
                      }`}
                    >
                      {isSelected ? '✓ ' : '+ '}
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-[var(--color-on-surface)] block mb-1">Note for Passengers</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. AC car, clean seats, heading to Cyber Hub. Luggage space available."
                className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--color-surface-container-low)] border border-[var(--color-border)] text-sm h-20"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-container)] text-white font-bold py-3.5 rounded-full text-sm transition-colors mt-2 cursor-pointer"
            >
              {user ? 'Publish Ride Offer' : 'Log In & Publish'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
