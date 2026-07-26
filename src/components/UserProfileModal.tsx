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
      <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-[#e2e2e2] max-h-[90vh] flex flex-col my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#006a3b] to-[#00864c] p-6 text-white relative">
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
            <div className="mt-3 bg-white/95 text-[#006a3b] px-3.5 py-2 rounded-xl text-xs font-bold shadow-md flex items-center gap-2 animate-in slide-in-from-top-2 duration-150">
              <Sparkles className="w-4 h-4 text-[#006a3b]" />
              <span>{notification}</span>
            </div>
          )}
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-[#eeeeee] bg-[#f9f9f9]">
          <button
            onClick={() => setActiveTab('commutes')}
            className={`flex-1 py-3 px-3 text-xs font-bold transition-all border-b-2 flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'commutes'
                ? 'border-[#006a3b] text-[#006a3b] bg-white'
                : 'border-transparent text-[#6e7a6f] hover:text-[#1b1b1b]'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Commutes ({commutes.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('favorites')}
            className={`flex-1 py-3 px-3 text-xs font-bold transition-all border-b-2 flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'favorites'
                ? 'border-[#006a3b] text-[#006a3b] bg-white'
                : 'border-transparent text-[#6e7a6f] hover:text-[#1b1b1b]'
            }`}
          >
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>Favorites ({favoriteDrivers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('info')}
            className={`flex-1 py-3 px-3 text-xs font-bold transition-all border-b-2 flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'info'
                ? 'border-[#006a3b] text-[#006a3b] bg-white'
                : 'border-transparent text-[#6e7a6f] hover:text-[#1b1b1b]'
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
                  <h4 className="font-extrabold text-sm text-[#1b1b1b]">Frequent Routes</h4>
                  <p className="text-xs text-[#6e7a6f]">
                    Auto-fill these origins & destinations in search instantly
                  </p>
                </div>
                {!isAddingCommute && (
                  <button
                    onClick={() => setIsAddingCommute(true)}
                    className="flex items-center gap-1.5 bg-[#f6fff4] hover:bg-[#e2f7df] text-[#006a3b] border border-[#a3e6b7] text-xs font-bold px-3 py-1.5 rounded-full transition-colors cursor-pointer"
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
                  className="bg-[#f6fff4] border border-[#a3e6b7] rounded-2xl p-4 space-y-3 animate-in fade-in zoom-in-95 duration-150"
                >
                  <div className="flex items-center justify-between border-b border-[#a3e6b7]/50 pb-2">
                    <span className="text-xs font-extrabold text-[#006a3b] flex items-center gap-1.5">
                      <Bookmark className="w-4 h-4 text-[#006a3b]" />
                      Add Preferred Route
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsAddingCommute(false)}
                      className="text-[#6e7a6f] hover:text-[#1b1b1b]"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#3e4a40] mb-1">
                      Route Nickname (e.g. Work Commute, Home to College)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Daily Office Run"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-[#bdcabd] text-xs text-[#1b1b1b] focus:border-[#006a3b] focus:outline-none font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-[#3e4a40] mb-1">
                        Origin City
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. New Delhi"
                        value={newOrigin}
                        onChange={(e) => setNewOrigin(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-[#bdcabd] text-xs text-[#1b1b1b] focus:border-[#006a3b] focus:outline-none font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#3e4a40] mb-1">
                        Destination City
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Gurgaon"
                        value={newDestination}
                        onChange={(e) => setNewDestination(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-[#bdcabd] text-xs text-[#1b1b1b] focus:border-[#006a3b] focus:outline-none font-medium"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-2">
                      <label className="text-[11px] font-bold text-[#3e4a40]">Passengers:</label>
                      <select
                        value={newPassengers}
                        onChange={(e) => setNewPassengers(Number(e.target.value))}
                        className="px-2 py-1 bg-white border border-[#bdcabd] rounded-lg text-xs font-bold text-[#1b1b1b]"
                      >
                        <option value={1}>1 Seat</option>
                        <option value={2}>2 Seats</option>
                        <option value={3}>3 Seats</option>
                      </select>
                    </div>

                    <label className="flex items-center gap-1.5 text-xs font-semibold text-[#006a3b] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newIsDefault}
                        onChange={(e) => setNewIsDefault(e.target.checked)}
                        className="accent-[#006a3b] w-4 h-4 rounded cursor-pointer"
                      />
                      <span>Set as Default</span>
                    </label>
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-[#a3e6b7]/50">
                    <button
                      type="button"
                      onClick={() => setIsAddingCommute(false)}
                      className="px-3 py-1.5 rounded-xl bg-white text-[#3e4a40] border border-[#bdcabd] text-xs font-bold hover:bg-gray-50 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-xl bg-[#006a3b] text-white text-xs font-bold hover:bg-[#00864c] transition-colors cursor-pointer"
                    >
                      Save Preferred Route
                    </button>
                  </div>
                </form>
              )}

              {/* List of Preferred Commutes */}
              {commutes.length === 0 ? (
                <div className="text-center py-8 bg-[#f9f9f9] rounded-2xl border border-dashed border-[#bdcabd] p-6 space-y-2">
                  <Bookmark className="w-8 h-8 text-[#006a3b]/40 mx-auto" />
                  <p className="font-bold text-sm text-[#1b1b1b]">No preferred commutes saved</p>
                  <p className="text-xs text-[#6e7a6f]">
                    Add your daily office, weekend, or college route to auto-fill search forms in 1-click!
                  </p>
                  <button
                    onClick={() => setIsAddingCommute(true)}
                    className="mt-2 inline-flex items-center gap-1.5 bg-[#006a3b] text-white text-xs font-bold px-4 py-2 rounded-full hover:bg-[#00864c] transition-colors cursor-pointer"
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
                          ? 'bg-[#f6fff4] border-[#006a3b] ring-1 ring-[#006a3b]/20'
                          : 'bg-white border-[#e2e2e2] hover:border-[#bdcabd]'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h5 className="font-extrabold text-sm text-[#1b1b1b]">{commute.title}</h5>
                            {commute.isDefault && (
                              <span className="bg-[#006a3b] text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
                                <Check className="w-3 h-3" />
                                DEFAULT
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 text-xs font-bold text-[#3e4a40] mt-1">
                            <span className="flex items-center gap-1 text-[#1b1b1b]">
                              <MapPin className="w-3.5 h-3.5 text-[#006a3b]" />
                              {commute.origin}
                            </span>
                            <ArrowRight className="w-3.5 h-3.5 text-[#006a3b]" />
                            <span className="flex items-center gap-1 text-[#1b1b1b]">
                              <MapPin className="w-3.5 h-3.5 text-[#006a3b]" />
                              {commute.destination}
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDeleteCommute(commute.id)}
                          className="p-1.5 rounded-lg text-[#6e7a6f] hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                          title="Delete route"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-[#eeeeee]">
                        <span className="text-[11px] text-[#6e7a6f] flex items-center gap-1 font-semibold">
                          <Users className="w-3.5 h-3.5 text-[#006a3b]" />
                          {commute.passengers} Passenger{commute.passengers > 1 ? 's' : ''}
                        </span>

                        <div className="flex items-center gap-2">
                          {!commute.isDefault && (
                            <button
                              type="button"
                              onClick={() => handleSetDefault(commute.id)}
                              className="text-[11px] font-bold text-[#006a3b] hover:underline cursor-pointer"
                            >
                              Make Default
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleUseInSearch(commute)}
                            className="bg-[#006a3b] hover:bg-[#00864c] text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
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
                  <h4 className="font-extrabold text-sm text-[#1b1b1b]">
                    Favorite Drivers ({favoriteDrivers.length})
                  </h4>
                  <p className="text-xs text-[#6e7a6f]">
                    Saved drivers for easy access & future ride bookings
                  </p>
                </div>
              </div>

              {favoriteDrivers.length === 0 ? (
                <div className="text-center py-8 bg-[#f9f9f9] rounded-2xl border border-dashed border-[#bdcabd] p-6 space-y-2">
                  <Heart className="w-8 h-8 text-rose-300 mx-auto" />
                  <p className="text-xs font-bold text-[#1b1b1b]">No Favorite Drivers Yet</p>
                  <p className="text-xs text-[#6e7a6f] max-w-xs mx-auto">
                    When viewing a ride's details, click <span className="font-bold text-[#006a3b]">"Favorite Driver"</span> to bookmark drivers you love traveling with.
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
                        className="bg-[#f6fff4] p-4 rounded-2xl border border-[#bdcabd] flex items-center justify-between gap-3 shadow-xs hover:border-[#006a3b] transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={driver.avatar}
                            alt={driver.name}
                            className="w-12 h-12 rounded-full object-cover border-2 border-[#006a3b] shrink-0"
                          />
                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h5 className="font-extrabold text-sm text-[#1b1b1b]">
                                {driver.name}
                              </h5>
                              {driver.verified && (
                                <span className="inline-flex items-center gap-0.5 text-[10px] bg-[#eefcf2] text-[#006a3b] border border-[#a3e6b7] px-1.5 py-0.2 rounded-full font-bold">
                                  <CheckCircle2 className="w-3 h-3 text-[#006a3b]" />
                                  Verified
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-[#3e4a40] mt-0.5">
                              <span className="flex items-center gap-1 font-bold text-[#7a5900]">
                                <Star className="w-3.5 h-3.5 fill-[#fdce6c] text-[#7a5900]" />{' '}
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
                <h4 className="font-extrabold text-sm text-[#1b1b1b]">Personal Details</h4>
                {!isEditingInfo && (
                  <button
                    onClick={() => setIsEditingInfo(true)}
                    className="flex items-center gap-1 text-xs font-bold text-[#006a3b] hover:underline cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit Profile</span>
                  </button>
                )}
              </div>

              {isEditingInfo ? (
                <form onSubmit={handleSaveProfileInfo} className="space-y-3 bg-[#f9f9f9] p-4 rounded-2xl border border-[#bdcabd]">
                  <div>
                    <label className="block text-xs font-bold text-[#3e4a40] mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-[#bdcabd] text-xs text-[#1b1b1b] focus:border-[#006a3b] focus:outline-none font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#3e4a40] mb-1">Phone Number</label>
                    <input
                      type="text"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-[#bdcabd] text-xs text-[#1b1b1b] focus:border-[#006a3b] focus:outline-none font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#3e4a40] mb-1">Bio / Travel Preferences</label>
                    <textarea
                      rows={2}
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-[#bdcabd] text-xs text-[#1b1b1b] focus:border-[#006a3b] focus:outline-none font-medium"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsEditingInfo(false)}
                      className="px-3 py-1.5 rounded-xl bg-white text-[#3e4a40] border border-[#bdcabd] text-xs font-bold cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-xl bg-[#006a3b] text-white text-xs font-bold hover:bg-[#00864c] cursor-pointer"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              ) : (
                <div className="bg-[#f9f9f9] p-4 rounded-2xl border border-[#e2e2e2] space-y-3">
                  <div>
                    <span className="text-[11px] text-[#6e7a6f] uppercase font-bold block">Full Name</span>
                    <span className="text-sm font-bold text-[#1b1b1b]">{user.name}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-[#6e7a6f] uppercase font-bold block">Phone</span>
                    <span className="text-xs font-medium text-[#1b1b1b]">{user.phone}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-[#6e7a6f] uppercase font-bold block">Bio</span>
                    <span className="text-xs text-[#3e4a40] font-medium">{user.bio}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#f3f3f3] border-t border-[#eeeeee] flex items-center justify-between text-xs">
          <span className="text-[#6e7a6f]">Tezzo Commuter Profile</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-full bg-[#1b1b1b] text-white font-bold hover:bg-black transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
