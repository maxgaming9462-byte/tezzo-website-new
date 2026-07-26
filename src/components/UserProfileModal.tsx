import React, { useState } from 'react';
import {
  X,
  User,
  Star,
  MapPin,
  Plus,
  Trash2,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Building,
  Home,
  Bookmark,
  Check,
  Edit2,
  Users,
  Heart,
} from 'lucide-react';
import { UserProfile, PreferredCommute, SearchQuery, Driver } from '../types';
import { getDriverStats } from '../utils/reviewService';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
  onUpdateProfile: (updatedUser: UserProfile) => void;
  onSelectCommuteForSearch?: (query: SearchQuery) => void;
  onOpenDriverReviews?: (driver: Driver, bookingId?: string, rideRoute?: string) => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  onUpdateProfile,
  onSelectCommuteForSearch,
  onOpenDriverReviews,
}) => {
  if (!isOpen || !user) return null;

  const [activeTab, setActiveTab] = useState<'commutes' | 'favorites' | 'info'>('commutes');

  // Form states for adding new commute
  const [isAddingCommute, setIsAddingCommute] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newOrigin, setNewOrigin] = useState('New Delhi');
  const [newDestination, setNewDestination] = useState('');
  const [newPassengers, setNewPassengers] = useState(1);
  const [newIsDefault, setNewIsDefault] = useState(false);

  // Profile Edit states
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone);
  const [bio, setBio] = useState(user.bio);

  const [notification, setNotification] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const commutes = user.preferredCommutes || [];
  const favoriteDrivers = user.favoriteDrivers || [];

  const handleRemoveFavoriteDriver = (driverName: string) => {
    const updated = favoriteDrivers.filter(
      (d) => d.name.toLowerCase() !== driverName.toLowerCase()
    );
    onUpdateProfile({
      ...user,
      favoriteDrivers: updated,
    });
    showToast(`Removed ${driverName} from favorites.`);
  };

  const handleAddCommute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrigin.trim() || !newDestination.trim()) return;

    const newCommute: PreferredCommute = {
      id: `commute-${Date.now()}`,
      title: newTitle.trim() || `${newOrigin} to ${newDestination}`,
      origin: newOrigin.trim(),
      destination: newDestination.trim(),
      passengers: newPassengers,
      isDefault: newIsDefault || commutes.length === 0,
    };

    let updatedList = [...commutes];
    if (newCommute.isDefault) {
      updatedList = updatedList.map((c) => ({ ...c, isDefault: false }));
    }
    updatedList.push(newCommute);

    onUpdateProfile({
      ...user,
      preferredCommutes: updatedList,
    });

    // Reset form
    setNewTitle('');
    setNewOrigin('New Delhi');
    setNewDestination('');
    setNewPassengers(1);
    setNewIsDefault(false);
    setIsAddingCommute(false);

    showToast(`Saved "${newCommute.title}" as preferred commute!`);
  };

  const handleSetDefault = (commuteId: string) => {
    const updatedList = commutes.map((c) => ({
      ...c,
      isDefault: c.id === commuteId,
    }));
    onUpdateProfile({
      ...user,
      preferredCommutes: updatedList,
    });
    showToast('Updated default preferred commute!');
  };

  const handleDeleteCommute = (commuteId: string) => {
    const updatedList = commutes.filter((c) => c.id !== commuteId);
    // If we deleted the default, set first remaining as default if exists
    if (updatedList.length > 0 && !updatedList.some((c) => c.isDefault)) {
      updatedList[0].isDefault = true;
    }
    onUpdateProfile({
      ...user,
      preferredCommutes: updatedList,
    });
    showToast('Removed preferred commute route.');
  };

  const handleSaveProfileInfo = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      ...user,
      name,
      phone,
      bio,
    });
    setIsEditingInfo(false);
    showToast('Profile information updated successfully!');
  };

  const handleUseInSearch = (commute: PreferredCommute) => {
    if (onSelectCommuteForSearch) {
      onSelectCommuteForSearch({
        origin: commute.origin,
        destination: commute.destination,
        date: 'Today',
        passengers: commute.passengers,
      });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-[var(--color-border)] max-h-[90vh] flex flex-col my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-container)] p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            aria-label="Close user profile settings"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-4">
            <img
              src={user.avatar}
              alt={user.name}
              className="w-16 h-16 rounded-full object-cover border-2 border-white/80 shadow-md"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-xl font-black">{user.name}</h3>
                {user.verified && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-300 fill-emerald-950" />
                )}
              </div>
              <p className="text-xs text-emerald-100 font-medium">{user.email}</p>
              <div className="mt-1 flex items-center gap-1.5 text-[11px] bg-white/15 px-2.5 py-0.5 rounded-full w-fit text-emerald-50">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                <span>Verified Member</span>
              </div>
            </div>
          </div>

          {/* Toast Notification */}
          {notification && (
            <div className="mt-3 bg-white/95 text-[var(--color-primary)] px-3.5 py-2 rounded-xl text-xs font-bold shadow-md flex items-center gap-2 animate-in slide-in-from-top-2 duration-150">
              <Sparkles className="w-4 h-4 text-[var(--color-primary)]" />
              <span>{notification}</span>
            </div>
          )}
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-[var(--color-surface-container)] bg-[var(--color-background)]">
          <button
            onClick={() => setActiveTab('commutes')}
            className={`flex-1 py-3 px-3 text-xs font-bold transition-all border-b-2 flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'commutes'
                ? 'border-[var(--color-primary)] text-[var(--color-primary)] bg-white'
                : 'border-transparent text-[var(--color-outline)] hover:text-[var(--color-on-surface)]'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Commutes ({commutes.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('favorites')}
            className={`flex-1 py-3 px-3 text-xs font-bold transition-all border-b-2 flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'favorites'
                ? 'border-[var(--color-primary)] text-[var(--color-primary)] bg-white'
                : 'border-transparent text-[var(--color-outline)] hover:text-[var(--color-on-surface)]'
            }`}
          >
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>Favorites ({favoriteDrivers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('info')}
            className={`flex-1 py-3 px-3 text-xs font-bold transition-all border-b-2 flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'info'
                ? 'border-[var(--color-primary)] text-[var(--color-primary)] bg-white'
                : 'border-transparent text-[var(--color-outline)] hover:text-[var(--color-on-surface)]'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Profile Details</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {activeTab === 'commutes' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-extrabold text-sm text-[var(--color-on-surface)]">Frequent Routes</h4>
                  <p className="text-xs text-[var(--color-outline)]">
                    Auto-fill these origins & destinations in search instantly
                  </p>
                </div>
                {!isAddingCommute && (
                  <button
                    onClick={() => setIsAddingCommute(true)}
                    className="flex items-center gap-1.5 bg-[var(--color-success-bg)] hover:bg-[var(--color-success-tint)] text-[var(--color-primary)] border border-[var(--color-primary-light)] text-xs font-bold px-3 py-1.5 rounded-full transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New</span>
                  </button>
                )}
              </div>

              {/* Add New Commute Form Drawer */}
              {isAddingCommute && (
                <form
                  onSubmit={handleAddCommute}
                  className="bg-[var(--color-success-bg)] border border-[var(--color-primary-light)] rounded-2xl p-4 space-y-3 animate-in fade-in zoom-in-95 duration-150"
                >
                  <div className="flex items-center justify-between border-b border-[var(--color-primary-light)]/50 pb-2">
                    <span className="text-xs font-extrabold text-[var(--color-primary)] flex items-center gap-1.5">
                      <Bookmark className="w-4 h-4 text-[var(--color-primary)]" />
                      Add Preferred Route
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsAddingCommute(false)}
                      className="text-[var(--color-outline)] hover:text-[var(--color-on-surface)]"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[var(--color-on-surface-variant)] mb-1">
                      Route Nickname (e.g. Work Commute, Home to College)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Daily Office Run"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-[var(--color-outline-variant)] text-xs text-[var(--color-on-surface)] focus:border-[var(--color-primary)] focus:outline-none font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-[var(--color-on-surface-variant)] mb-1">
                        Origin City
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. New Delhi"
                        value={newOrigin}
                        onChange={(e) => setNewOrigin(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-[var(--color-outline-variant)] text-xs text-[var(--color-on-surface)] focus:border-[var(--color-primary)] focus:outline-none font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[var(--color-on-surface-variant)] mb-1">
                        Destination City
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Gurgaon"
                        value={newDestination}
                        onChange={(e) => setNewDestination(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-[var(--color-outline-variant)] text-xs text-[var(--color-on-surface)] focus:border-[var(--color-primary)] focus:outline-none font-medium"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-2">
                      <label className="text-[11px] font-bold text-[var(--color-on-surface-variant)]">Passengers:</label>
                      <select
                        value={newPassengers}
                        onChange={(e) => setNewPassengers(Number(e.target.value))}
                        className="px-2 py-1 bg-white border border-[var(--color-outline-variant)] rounded-lg text-xs font-bold text-[var(--color-on-surface)]"
                      >
                        <option value={1}>1 Seat</option>
                        <option value={2}>2 Seats</option>
                        <option value={3}>3 Seats</option>
                      </select>
                    </div>

                    <label className="flex items-center gap-1.5 text-xs font-semibold text-[var(--color-primary)] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newIsDefault}
                        onChange={(e) => setNewIsDefault(e.target.checked)}
                        className="accent-[var(--color-primary)] w-4 h-4 rounded cursor-pointer"
                      />
                      <span>Set as Default</span>
                    </label>
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-[var(--color-primary-light)]/50">
                    <button
                      type="button"
                      onClick={() => setIsAddingCommute(false)}
                      className="px-3 py-1.5 rounded-xl bg-white text-[var(--color-on-surface-variant)] border border-[var(--color-outline-variant)] text-xs font-bold hover:bg-gray-50 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-xl bg-[var(--color-primary)] text-white text-xs font-bold hover:bg-[var(--color-primary-container)] transition-colors cursor-pointer"
                    >
                      Save Preferred Route
                    </button>
                  </div>
                </form>
              )}

              {/* List of Preferred Commutes */}
              {commutes.length === 0 ? (
                <div className="text-center py-8 bg-[var(--color-background)] rounded-2xl border border-dashed border-[var(--color-outline-variant)] p-6 space-y-2">
                  <Bookmark className="w-8 h-8 text-[var(--color-primary)]/40 mx-auto" />
                  <p className="font-bold text-sm text-[var(--color-on-surface)]">No preferred commutes saved</p>
                  <p className="text-xs text-[var(--color-outline)]">
                    Add your daily office, weekend, or college route to auto-fill search forms in 1-click!
                  </p>
                  <button
                    onClick={() => setIsAddingCommute(true)}
                    className="mt-2 inline-flex items-center gap-1.5 bg-[var(--color-primary)] text-white text-xs font-bold px-4 py-2 rounded-full hover:bg-[var(--color-primary-container)] transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add First Route</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {commutes.map((commute) => (
                    <div
                      key={commute.id}
                      className={`p-4 rounded-2xl border transition-all flex flex-col gap-3 relative ${
                        commute.isDefault
                          ? 'bg-[var(--color-success-bg)] border-[var(--color-primary)] ring-1 ring-[var(--color-primary)]/20'
                          : 'bg-white border-[var(--color-border)] hover:border-[var(--color-outline-variant)]'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h5 className="font-extrabold text-sm text-[var(--color-on-surface)]">{commute.title}</h5>
                            {commute.isDefault && (
                              <span className="bg-[var(--color-primary)] text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
                                <Check className="w-3 h-3" />
                                DEFAULT
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 text-xs font-bold text-[var(--color-on-surface-variant)] mt-1">
                            <span className="flex items-center gap-1 text-[var(--color-on-surface)]">
                              <MapPin className="w-3.5 h-3.5 text-[var(--color-primary)]" />
                              {commute.origin}
                            </span>
                            <ArrowRight className="w-3.5 h-3.5 text-[var(--color-primary)]" />
                            <span className="flex items-center gap-1 text-[var(--color-on-surface)]">
                              <MapPin className="w-3.5 h-3.5 text-[var(--color-primary)]" />
                              {commute.destination}
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDeleteCommute(commute.id)}
                          className="p-1.5 rounded-lg text-[var(--color-outline)] hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                          title="Delete route"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-[var(--color-surface-container)]">
                        <span className="text-[11px] text-[var(--color-outline)] flex items-center gap-1 font-semibold">
                          <Users className="w-3.5 h-3.5 text-[var(--color-primary)]" />
                          {commute.passengers} Passenger{commute.passengers > 1 ? 's' : ''}
                        </span>

                        <div className="flex items-center gap-2">
                          {!commute.isDefault && (
                            <button
                              type="button"
                              onClick={() => handleSetDefault(commute.id)}
                              className="text-[11px] font-bold text-[var(--color-primary)] hover:underline cursor-pointer"
                            >
                              Make Default
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleUseInSearch(commute)}
                            className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-container)] text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <span>Auto-Fill Search</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'favorites' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-extrabold text-sm text-[var(--color-on-surface)]">
                    Favorite Drivers ({favoriteDrivers.length})
                  </h4>
                  <p className="text-xs text-[var(--color-outline)]">
                    Saved drivers for easy access & future ride bookings
                  </p>
                </div>
              </div>

              {favoriteDrivers.length === 0 ? (
                <div className="text-center py-8 bg-[var(--color-background)] rounded-2xl border border-dashed border-[var(--color-outline-variant)] p-6 space-y-2">
                  <Heart className="w-8 h-8 text-rose-300 mx-auto" />
                  <p className="text-xs font-bold text-[var(--color-on-surface)]">No Favorite Drivers Yet</p>
                  <p className="text-xs text-[var(--color-outline)] max-w-xs mx-auto">
                    When viewing a ride's details, click <span className="font-bold text-[var(--color-primary)]">"Favorite Driver"</span> to bookmark drivers you love traveling with.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {favoriteDrivers.map((driver) => {
                    const stats = getDriverStats(
                      driver.name,
                      driver.rating,
                      driver.reviewsCount
                    );
                    return (
                      <div
                        key={driver.name}
                        className="bg-[var(--color-success-bg)] p-4 rounded-2xl border border-[var(--color-outline-variant)] flex items-center justify-between gap-3 shadow-xs hover:border-[var(--color-primary)] transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={driver.avatar}
                            alt={driver.name}
                            className="w-12 h-12 rounded-full object-cover border-2 border-[var(--color-primary)] shrink-0"
                          />
                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h5 className="font-extrabold text-sm text-[var(--color-on-surface)]">
                                {driver.name}
                              </h5>
                              {driver.verified && (
                                <span className="inline-flex items-center gap-0.5 text-[10px] bg-[var(--color-success-bg-soft)] text-[var(--color-primary)] border border-[var(--color-primary-light)] px-1.5 py-0.2 rounded-full font-bold">
                                  <CheckCircle2 className="w-3 h-3 text-[var(--color-primary)]" />
                                  Verified
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-[var(--color-on-surface-variant)] mt-0.5">
                              <span className="flex items-center gap-1 font-bold text-[var(--color-warning-text)]">
                                <Star className="w-3.5 h-3.5 fill-[var(--color-secondary-container)] text-[var(--color-warning-text)]" />{' '}
                                {stats.averageRating.toFixed(1)}
                              </span>
                              <span>•</span>
                              <span>{stats.totalCount} reviews</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {onOpenDriverReviews && (
                            <button
                              type="button"
                              onClick={() => onOpenDriverReviews(driver)}
                              className="px-3 py-1.5 rounded-xl bg-white hover:bg-amber-50 text-amber-900 border border-amber-300 font-bold text-xs transition-colors flex items-center gap-1 cursor-pointer"
                              title="View driver ratings & reviews"
                            >
                              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                              <span>Reviews</span>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemoveFavoriteDriver(driver.name)}
                            className="p-2 rounded-xl hover:bg-rose-100 text-rose-600 border border-rose-200 transition-colors cursor-pointer"
                            title="Remove from Favorite Drivers"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'info' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-sm text-[var(--color-on-surface)]">Personal Details</h4>
                {!isEditingInfo && (
                  <button
                    onClick={() => setIsEditingInfo(true)}
                    className="flex items-center gap-1 text-xs font-bold text-[var(--color-primary)] hover:underline cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit Profile</span>
                  </button>
                )}
              </div>

              {isEditingInfo ? (
                <form onSubmit={handleSaveProfileInfo} className="space-y-3 bg-[var(--color-background)] p-4 rounded-2xl border border-[var(--color-outline-variant)]">
                  <div>
                    <label className="block text-xs font-bold text-[var(--color-on-surface-variant)] mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-[var(--color-outline-variant)] text-xs text-[var(--color-on-surface)] focus:border-[var(--color-primary)] focus:outline-none font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[var(--color-on-surface-variant)] mb-1">Phone Number</label>
                    <input
                      type="text"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-[var(--color-outline-variant)] text-xs text-[var(--color-on-surface)] focus:border-[var(--color-primary)] focus:outline-none font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[var(--color-on-surface-variant)] mb-1">Bio / Travel Preferences</label>
                    <textarea
                      rows={2}
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-[var(--color-outline-variant)] text-xs text-[var(--color-on-surface)] focus:border-[var(--color-primary)] focus:outline-none font-medium"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsEditingInfo(false)}
                      className="px-3 py-1.5 rounded-xl bg-white text-[var(--color-on-surface-variant)] border border-[var(--color-outline-variant)] text-xs font-bold cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-xl bg-[var(--color-primary)] text-white text-xs font-bold hover:bg-[var(--color-primary-container)] cursor-pointer"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              ) : (
                <div className="bg-[var(--color-background)] p-4 rounded-2xl border border-[var(--color-border)] space-y-3">
                  <div>
                    <span className="text-[11px] text-[var(--color-outline)] uppercase font-bold block">Full Name</span>
                    <span className="text-sm font-bold text-[var(--color-on-surface)]">{user.name}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-[var(--color-outline)] uppercase font-bold block">Phone</span>
                    <span className="text-xs font-medium text-[var(--color-on-surface)]">{user.phone}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-[var(--color-outline)] uppercase font-bold block">Bio</span>
                    <span className="text-xs text-[var(--color-on-surface-variant)] font-medium">{user.bio}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[var(--color-surface-container-low)] border-t border-[var(--color-surface-container)] flex items-center justify-between text-xs">
          <span className="text-[var(--color-outline)]">Tezzo Commuter Profile</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-full bg-[var(--color-on-surface)] text-white font-bold hover:bg-black transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
