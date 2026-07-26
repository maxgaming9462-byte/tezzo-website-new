import React, { useState, useEffect, useRef } from 'react';
import {
  Circle,
  MapPin,
  Calendar as CalendarIcon,
  User,
  ArrowRight,
  History,
  Clock,
  X,
  ChevronLeft,
  ChevronRight,
  Check,
  Sparkles,
  Bookmark,
  Plus,
  Star,
  Zap,
} from 'lucide-react';
import { SearchQuery, UserProfile, PreferredCommute } from '../types';

interface SearchWidgetProps {
  onSearch: (query: SearchQuery) => void;
  user?: UserProfile | null;
  onOpenProfile?: () => void;
  onSavePreferredCommute?: (commute: PreferredCommute) => void;
}

export const SearchWidget: React.FC<SearchWidgetProps> = ({
  onSearch,
  user,
  onOpenProfile,
  onSavePreferredCommute,
}) => {
  const [origin, setOrigin] = useState('New Delhi');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState('Today');
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<Date>(new Date());
  const [passengers, setPassengers] = useState(1);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [viewDate, setViewDate] = useState<Date>(new Date());
  const [activeCommuteBadge, setActiveCommuteBadge] = useState<string | null>(null);

  const calendarRef = useRef<HTMLDivElement>(null);

  const preferredCommutes = user?.preferredCommutes || [];
  const defaultCommute = preferredCommutes.find((c) => c.isDefault) || preferredCommutes[0];

  // Auto-fill default preferred commute on mount if destination is empty
  useEffect(() => {
    if (defaultCommute && !destination) {
      setOrigin(defaultCommute.origin);
      setDestination(defaultCommute.destination);
      if (defaultCommute.passengers) setPassengers(defaultCommute.passengers);
      setActiveCommuteBadge(defaultCommute.title);
    }
  }, [user]);

  // Close calendar on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setIsCalendarOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const [recentSearches, setRecentSearches] = useState<SearchQuery[]>(() => {
    try {
      const saved = localStorage.getItem('eco_commute_recent_searches');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed.slice(0, 3);
      }
    } catch (e) {
      // Ignore localStorage errors
    }
    return [
      { origin: 'New Delhi', destination: 'Gurgaon', date: 'Today', passengers: 1 },
      { origin: 'New Delhi', destination: 'Jaipur', date: 'Tomorrow', passengers: 1 },
    ];
  });

  const saveRecentSearch = (query: SearchQuery) => {
    setRecentSearches((prev) => {
      const filtered = prev.filter(
        (s) =>
          !(
            s.origin.toLowerCase() === query.origin.toLowerCase() &&
            s.destination.toLowerCase() === query.destination.toLowerCase()
          )
      );
      const updated = [query, ...filtered].slice(0, 3);
      try {
        localStorage.setItem('eco_commute_recent_searches', JSON.stringify(updated));
      } catch (e) {
        // Ignore localStorage errors
      }
      return updated;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query: SearchQuery = {
      origin: origin.trim() || 'New Delhi',
      destination: destination.trim(),
      date,
      passengers,
    };
    saveRecentSearch(query);
    onSearch(query);
  };

  const handleSelectRecent = (search: SearchQuery) => {
    setOrigin(search.origin);
    setDestination(search.destination);
    setDate(search.date);
    setPassengers(search.passengers);
    saveRecentSearch(search);
    onSearch(search);
  };

  const handleRemoveRecent = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setRecentSearches((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      try {
        localStorage.setItem('eco_commute_recent_searches', JSON.stringify(updated));
      } catch (err) {
        // Ignore localStorage errors
      }
      return updated;
    });
  };

  // Calendar Helpers
  const formatDateLabel = (d: Date): string => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const checkDate = new Date(d);
    checkDate.setHours(0, 0, 0, 0);

    const diffDays = Math.round((checkDate.getTime() - today.getTime()) / (1000 * 3600 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';

    const day = d.getDate();
    const monthStr = d.toLocaleString('en-US', { month: 'short' });
    return `${day} ${monthStr}`;
  };

  const selectDateObj = (d: Date, customLabel?: string) => {
    setSelectedCalendarDate(d);
    setDate(customLabel || formatDateLabel(d));
    setIsCalendarOpen(false);
  };

  // Month navigation
  const prevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  // Generate Calendar Days Grid
  const renderCalendarDays = () => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();

    const firstDayIndex = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const days = [];

    // Empty cells before first day of month
    for (let i = 0; i < firstDayIndex; i++) {
      days.push(<div key={`empty-${i}`} className="h-9 w-9"></div>);
    }

    // Days of current month
    for (let day = 1; day <= daysInMonth; day++) {
      const current = new Date(year, month, day);
      current.setHours(0, 0, 0, 0);

      const isPast = current < today;
      const isSelected =
        selectedCalendarDate.getFullYear() === year &&
        selectedCalendarDate.getMonth() === month &&
        selectedCalendarDate.getDate() === day;
      const isToday = current.getTime() === today.getTime();

      days.push(
        <button
          key={`day-${day}`}
          type="button"
          disabled={isPast}
          onClick={() => selectDateObj(current)}
          className={`h-9 w-9 rounded-full text-xs font-semibold flex items-center justify-center transition-all cursor-pointer relative ${
            isPast
              ? 'text-[#bcbcbc] cursor-not-allowed'
              : isSelected
              ? 'bg-[#006a3b] text-white font-extrabold shadow-sm'
              : isToday
              ? 'bg-[#eefcf2] text-[#006a3b] border border-[#a3e6b7] font-bold'
              : 'hover:bg-[#f3f3f3] text-[#1b1b1b]'
          }`}
        >
          {day}
          {isToday && !isSelected && (
            <span className="w-1 h-1 bg-[#006a3b] rounded-full absolute bottom-1"></span>
          )}
        </button>
      );
    }

    return days;
  };

  return (
    <section className="px-4 sm:px-6 py-4 relative z-20 max-w-[1120px] mx-auto">
      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-[0_8px_24px_rgba(0,0,0,0.12)] flex flex-col gap-4 border border-[#eeeeee]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1b1b1b] tracking-tight">
              Where to next?
            </h2>
            {activeCommuteBadge && (
              <span className="inline-flex items-center gap-1 bg-[#eefcf2] text-[#006a3b] border border-[#a3e6b7] text-[11px] font-bold px-2.5 py-1 rounded-full animate-in fade-in zoom-in-95 duration-150 shadow-2xs">
                <Zap className="w-3.5 h-3.5 text-[#006a3b] fill-[#8af9b1]" />
                <span>Auto-filled: {activeCommuteBadge}</span>
              </span>
            )}
          </div>

          {onOpenProfile && (
            <button
              type="button"
              onClick={onOpenProfile}
              className="text-xs font-bold text-[#006a3b] hover:underline flex items-center gap-1 w-fit cursor-pointer"
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Preferred Commutes ({preferredCommutes.length})</span>
            </button>
          )}
        </div>

        {/* Preferred Commutes Quick Select Bar */}
        {preferredCommutes.length > 0 && (
          <div className="bg-[#f6fff4] border border-[#a3e6b7] p-3 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-0.5">
              <span className="text-[11px] font-extrabold text-[#006a3b] shrink-0 flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-[#006a3b]" />
                Preferred Commutes:
              </span>
              {preferredCommutes.map((commute) => {
                const isActive =
                  origin.toLowerCase() === commute.origin.toLowerCase() &&
                  destination.toLowerCase() === commute.destination.toLowerCase();
                return (
                  <button
                    key={commute.id}
                    type="button"
                    onClick={() => {
                      setOrigin(commute.origin);
                      setDestination(commute.destination);
                      if (commute.passengers) setPassengers(commute.passengers);
                      setActiveCommuteBadge(commute.title);
                    }}
                    className={`text-xs font-bold px-3 py-1.5 rounded-full transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-[#006a3b] text-white shadow-xs'
                        : 'bg-white hover:bg-[#eefcf2] text-[#006a3b] border border-[#a3e6b7]'
                    }`}
                  >
                    <span>{commute.title}</span>
                    <span className="opacity-80 text-[10px]">
                      ({commute.origin.split(' ')[0]} → {commute.destination.split(' ')[0]})
                    </span>
                    {commute.isDefault && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    )}
                  </button>
                );
              })}
            </div>

            {onOpenProfile && (
              <button
                type="button"
                onClick={onOpenProfile}
                className="text-[11px] font-bold text-[#006a3b] hover:bg-[#a3e6b7]/30 px-2.5 py-1 rounded-xl transition-colors cursor-pointer shrink-0 text-right"
              >
                + Manage Routes
              </button>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Leaving from */}
          <div className="relative group">
            <Circle className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6e7a6f] group-focus-within:text-[#006a3b] transition-colors" />
            <input
              type="text"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              placeholder="Leaving from"
              className="w-full pl-12 pr-4 py-4 rounded-full bg-[#f3f3f3] border border-transparent focus:border-[#006a3b] focus:bg-white focus:outline-none text-base text-[#1b1b1b] placeholder:text-[#6e7a6f] transition-all font-medium"
            />
          </div>

          {/* Going to */}
          <div className="relative group">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6e7a6f] group-focus-within:text-[#006a3b] transition-colors" />
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="Going to"
              className="w-full pl-12 pr-4 py-4 rounded-full bg-[#f3f3f3] border border-transparent focus:border-[#006a3b] focus:bg-white focus:outline-none text-base text-[#1b1b1b] placeholder:text-[#6e7a6f] transition-all font-medium"
            />
          </div>

          {/* When & Who Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Graphical Calendar Date Picker */}
            <div className="relative group" ref={calendarRef}>
              <button
                type="button"
                onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                className={`w-full pl-12 pr-4 py-4 rounded-full bg-[#f3f3f3] border text-left font-medium transition-all cursor-pointer flex items-center justify-between text-base ${
                  isCalendarOpen
                    ? 'border-[#006a3b] bg-white ring-2 ring-[#006a3b]/20 text-[#006a3b]'
                    : 'border-transparent hover:border-[#bdcabd] text-[#1b1b1b]'
                }`}
              >
                <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6e7a6f] group-hover:text-[#006a3b] transition-colors" />
                <span className="truncate">{date}</span>
                <span className="text-[10px] bg-[#006a3b]/10 text-[#006a3b] px-2 py-0.5 rounded-full font-bold ml-1">
                  Change
                </span>
              </button>

              {/* Graphical Calendar Popover Dropdown */}
              {isCalendarOpen && (
                <div className="absolute left-0 top-full mt-2 z-50 bg-white rounded-2xl shadow-xl border border-[#bdcabd] p-4 w-[310px] sm:w-[330px] animate-in fade-in zoom-in-95 duration-150">
                  {/* Preset Pills */}
                  <div className="flex items-center gap-1.5 pb-3 border-b border-[#eeeeee] overflow-x-auto scrollbar-none">
                    <button
                      type="button"
                      onClick={() => selectDateObj(new Date(), 'Today')}
                      className="text-[11px] bg-[#f6fff4] hover:bg-[#eefcf2] text-[#006a3b] border border-[#a3e6b7] px-2.5 py-1 rounded-full font-bold transition-colors cursor-pointer shrink-0"
                    >
                      Today
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const tmrw = new Date();
                        tmrw.setDate(tmrw.getDate() + 1);
                        selectDateObj(tmrw, 'Tomorrow');
                      }}
                      className="text-[11px] bg-[#f3f3f3] hover:bg-[#e2e2e2] text-[#3e4a40] px-2.5 py-1 rounded-full font-semibold transition-colors cursor-pointer shrink-0"
                    >
                      Tomorrow
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const wknd = new Date();
                        const day = wknd.getDay();
                        const daysToSat = (6 - day + 7) % 7 || 7;
                        wknd.setDate(wknd.getDate() + daysToSat);
                        selectDateObj(wknd, 'This Weekend');
                      }}
                      className="text-[11px] bg-[#f3f3f3] hover:bg-[#e2e2e2] text-[#3e4a40] px-2.5 py-1 rounded-full font-semibold transition-colors cursor-pointer shrink-0"
                    >
                      This Weekend
                    </button>
                  </div>

                  {/* Month & Year Header */}
                  <div className="flex items-center justify-between py-3">
                    <button
                      type="button"
                      onClick={prevMonth}
                      className="p-1 rounded-full hover:bg-[#f3f3f3] text-[#1b1b1b] transition-colors cursor-pointer"
                      title="Previous Month"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <span className="font-extrabold text-sm text-[#1b1b1b]">
                      {viewDate.toLocaleString('en-US', { month: 'long', year: 'numeric' })}
                    </span>
                    <button
                      type="button"
                      onClick={nextMonth}
                      className="p-1 rounded-full hover:bg-[#f3f3f3] text-[#1b1b1b] transition-colors cursor-pointer"
                      title="Next Month"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Weekday Labels */}
                  <div className="grid grid-cols-7 gap-1 text-center mb-1">
                    {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((wd) => (
                      <span key={wd} className="text-[10px] font-bold text-[#6e7a6f] uppercase">
                        {wd}
                      </span>
                    ))}
                  </div>

                  {/* Days Grid */}
                  <div className="grid grid-cols-7 gap-1 place-items-center">
                    {renderCalendarDays()}
                  </div>

                  {/* Selected Date Footer */}
                  <div className="mt-3 pt-2.5 border-t border-[#eeeeee] flex items-center justify-between text-xs">
                    <span className="text-[#6e7a6f] font-medium">
                      Selected: <strong className="text-[#006a3b]">{date}</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsCalendarOpen(false)}
                      className="text-[11px] bg-[#006a3b] hover:bg-[#00864c] text-white font-bold px-3 py-1 rounded-full transition-colors cursor-pointer"
                    >
                      Confirm
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Passengers */}
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6e7a6f] group-focus-within:text-[#006a3b] transition-colors" />
              <select
                value={passengers}
                onChange={(e) => setPassengers(Number(e.target.value))}
                className="w-full pl-12 pr-4 py-4 rounded-full bg-[#f3f3f3] border border-transparent focus:border-[#006a3b] focus:bg-white focus:outline-none text-base text-[#1b1b1b] transition-all appearance-none cursor-pointer font-medium"
              >
                <option value={1}>1 seat</option>
                <option value={2}>2 seats</option>
                <option value={3}>3 seats</option>
                <option value={4}>4 seats</option>
              </select>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row items-center gap-2 mt-2">
            <button
              type="submit"
              className="flex-1 w-full bg-[#006a3b] hover:bg-[#00864c] text-white rounded-full py-4 text-base font-semibold transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Find a ride</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            {origin.trim() && destination.trim() && onSavePreferredCommute && (
              <button
                type="button"
                onClick={() => {
                  const title = `${origin.trim()} to ${destination.trim()}`;
                  onSavePreferredCommute({
                    id: `commute-${Date.now()}`,
                    title,
                    origin: origin.trim(),
                    destination: destination.trim(),
                    passengers,
                    isDefault: preferredCommutes.length === 0,
                  });
                  setActiveCommuteBadge(title);
                }}
                className="w-full sm:w-auto px-5 py-4 rounded-full bg-[#f6fff4] hover:bg-[#e2f7df] text-[#006a3b] border border-[#a3e6b7] text-sm font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                title="Bookmark as a Preferred Commute route in your profile"
              >
                <Bookmark className="w-4 h-4 text-[#006a3b]" />
                <span className="hidden sm:inline">Save as Preferred</span>
                <span className="sm:hidden">Save Route</span>
              </button>
            )}
          </div>
        </form>

        {/* Recent Searches Section */}
        {recentSearches.length > 0 && (
          <div className="pt-3 border-t border-[#eeeeee] flex flex-col gap-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#6e7a6f]">
              <History className="w-3.5 h-3.5 text-[#006a3b]" />
              <span>Recent Searches</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {recentSearches.map((search, index) => (
                <div
                  key={`${search.origin}-${search.destination}-${index}`}
                  onClick={() => handleSelectRecent(search)}
                  className="group flex items-center gap-2 bg-[#f6fff4] hover:bg-[#eefcf2] border border-[#a3e6b7] text-[#006a3b] px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-all shadow-2xs hover:shadow-xs"
                >
                  <Clock className="w-3 h-3 text-[#006a3b] shrink-0" />
                  <span>
                    {search.origin} → {search.destination || 'Anywhere'}
                  </span>
                  <span className="text-[10px] text-[#3e4a40] bg-white/80 px-1.5 py-0.5 rounded-md border border-[#a3e6b7]/50">
                    {search.date}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => handleRemoveRecent(index, e)}
                    className="p-0.5 rounded-full hover:bg-[#006a3b]/10 text-[#6e7a6f] hover:text-red-600 transition-colors cursor-pointer"
                    title="Remove from recent searches"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

