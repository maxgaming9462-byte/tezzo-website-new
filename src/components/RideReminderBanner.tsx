import React, { useState } from 'react';
import {
  Bell,
  X,
  Phone,
  MapPin,
  Clock,
  Car,
  Check,
  Copy,
  ExternalLink,
} from 'lucide-react';
import { RideNotificationPayload } from '../utils/notificationService';

interface RideReminderBannerProps {
  payload: RideNotificationPayload | null;
  onClose: () => void;
  onOpenMyBookings?: () => void;
}

export const RideReminderBanner: React.FC<RideReminderBannerProps> = ({
  payload,
  onClose,
  onOpenMyBookings,
}) => {
  const [copiedPhone, setCopiedPhone] = useState(false);

  if (!payload) return null;

  const handleCopyPhone = () => {
    navigator.clipboard.writeText(payload.driverPhone);
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  return (
    <div className="fixed top-4 right-4 left-4 sm:left-auto sm:max-w-md z-50 animate-in slide-in-from-top-5 fade-in duration-300">
      <div className="bg-[#1b1b1b] text-white p-4 rounded-2xl shadow-2xl border border-[#006a3b] flex flex-col gap-3 relative overflow-hidden">
        {/* Top accent bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#006a3b] via-[#8af9b1] to-[#00864c]" />

        <div className="flex items-start justify-between gap-3 pt-1">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#006a3b] text-[#8af9b1] flex items-center justify-center shrink-0 shadow-xs">
              <Bell className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider bg-[#006a3b] text-[#8af9b1] px-2 py-0.5 rounded-md">
                  1-Hour Ride Alert
                </span>
                <span className="text-xs text-gray-400 font-medium">Just Now</span>
              </div>
              <h4 className="font-extrabold text-sm text-white mt-0.5">
                Upcoming Ride to {payload.destination}
              </h4>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
            title="Dismiss notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Departure Time & Route */}
        <div className="bg-[#2a2a2a] p-3 rounded-xl border border-white/10 text-xs flex flex-col gap-2">
          <div className="flex items-center justify-between font-bold text-gray-200">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#8af9b1]" />
              Departing at {payload.departureTime}
            </span>
            <span className="text-[#8af9b1] text-[11px] font-extrabold">
              {payload.date}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-gray-300 font-medium pt-1 border-t border-white/10">
            <Car className="w-3.5 h-3.5 text-[#8af9b1]" />
            <span>
              {payload.origin} → {payload.destination}
            </span>
          </div>
        </div>

        {/* Driver Contact & Meeting Point */}
        <div className="space-y-2">
          <div className="flex items-start gap-2 bg-[#252525] p-2.5 rounded-xl border border-white/5 text-xs">
            <MapPin className="w-4 h-4 text-[#8af9b1] shrink-0 mt-0.5" />
            <div>
              <span className="text-[10px] text-gray-400 font-semibold uppercase block">
                Meeting Point / Pickup Location
              </span>
              <span className="font-extrabold text-white block mt-0.5">
                {payload.meetingPoint}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between bg-[#252525] p-2.5 rounded-xl border border-white/5 text-xs">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-[#8af9b1]" />
              <div>
                <span className="text-[10px] text-gray-400 font-semibold uppercase block">
                  Driver: {payload.driverName}
                </span>
                <span className="font-bold text-white">{payload.driverPhone}</span>
              </div>
            </div>

            <button
              onClick={handleCopyPhone}
              className="px-2.5 py-1.5 rounded-lg bg-[#006a3b] hover:bg-[#00864c] text-white font-bold text-[11px] transition-colors flex items-center gap-1 cursor-pointer shrink-0"
              title="Copy Driver Phone"
            >
              {copiedPhone ? (
                <>
                  <Check className="w-3 h-3 text-[#8af9b1]" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/10 text-xs">
          <span className="text-[11px] text-gray-400 font-medium">
            Browser push notification sent
          </span>
          {onOpenMyBookings && (
            <button
              onClick={() => {
                onClose();
                onOpenMyBookings();
              }}
              className="text-[#8af9b1] hover:underline font-bold text-xs flex items-center gap-1 cursor-pointer"
            >
              <span>View Bookings</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
