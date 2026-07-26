export interface DriverReview {
  id: string;
  driverName: string;
  reviewerName: string;
  reviewerAvatar?: string;
  rating: number; // 1 to 5
  comment: string;
  date: string;
  tags?: string[];
  rideRoute?: string;
  bookingId?: string;
}

export interface Driver {
  name: string;
  avatar: string;
  rating: number;
  reviewsCount: number;
  ridesCompleted: number;
  verified: boolean;
  phone?: string;
  memberSince?: string;
  reviews?: DriverReview[];
}

export interface Car {
  model: string;
  color: string;
  plateNumber: string;
  type?: 'Sedan' | 'SUV' | 'EV' | 'Hatchback' | string;
}

export interface Ride {
  id: string;
  origin: string;
  originDetails?: string;
  destination: string;
  destinationDetails?: string;
  date: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  price: number;
  seatsTotal: number;
  seatsAvailable: number;
  driver: Driver;
  car: Car;
  instantBooking: boolean;
  amenities: string[];
  tags?: string[];
  notes?: string;
}

export interface SearchQuery {
  origin: string;
  destination: string;
  date: string;
  passengers: number;
}

export interface Booking {
  id: string;
  ride: Ride;
  seatsBooked: number;
  totalPrice: number;
  status: 'confirmed' | 'pending' | 'cancelled';
  bookingDate: string;
  passengerName: string;
  passengerEmail: string;
  passengerPhone: string;
}

export interface PreferredCommute {
  id: string;
  title: string;
  origin: string;
  destination: string;
  passengers: number;
  isDefault?: boolean;
}

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  avatar: string;
  verified: boolean;
  bio: string;
  preferredCommutes?: PreferredCommute[];
  favoriteDrivers?: Driver[];
}
