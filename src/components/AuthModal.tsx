import React, { useState } from 'react';
import { X, ShieldCheck, UserCheck, Check } from 'lucide-react';
import { UserProfile } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [isSignUp, setIsSignUp] = useState(true);
  const [name, setName] = useState('Priya Sharma');
  const [email, setEmail] = useState('priya.sharma@tezzo.com');
  const [phone, setPhone] = useState('+91 98765 12345');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const userProfile: UserProfile = {
      name: name || 'Tezzo Traveler',
      email: email || 'user@tezzo.com',
      phone: phone || '+91 99999 00000',
      avatar:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
      verified: true,
      bio: 'Daily commuter from New Delhi. Lover of weekend road trips and great music.',
    };
    onLoginSuccess(userProfile);
    onClose();
  };

  const handleQuickDemo = (demoUser: UserProfile) => {
    onLoginSuccess(demoUser);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-[#e2e2e2] animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-[#006a3b] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#8af9b1]" />
            <h3 className="font-bold text-lg">{isSignUp ? 'Join Tezzo Carpool' : 'Welcome Back'}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-white/20 transition-colors text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-5">
          {/* Tabs */}
          <div className="flex bg-[#f3f3f3] p-1 rounded-full border border-[#e2e2e2]">
            <button
              type="button"
              onClick={() => setIsSignUp(true)}
              className={`flex-1 py-2 rounded-full text-xs font-bold transition-all ${
                isSignUp ? 'bg-white text-[#006a3b] shadow-xs' : 'text-[#6e7a6f]'
              }`}
            >
              Sign Up
            </button>
            <button
              type="button"
              onClick={() => setIsSignUp(false)}
              className={`flex-1 py-2 rounded-full text-xs font-bold transition-all ${
                !isSignUp ? 'bg-white text-[#006a3b] shadow-xs' : 'text-[#6e7a6f]'
              }`}
            >
              Log In
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            {isSignUp && (
              <div>
                <label className="text-xs font-bold text-[#1b1b1b] block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Priya Sharma"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#f3f3f3] border border-[#e2e2e2] text-sm"
                />
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-[#1b1b1b] block mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="priya@example.com"
                className="w-full px-4 py-2.5 rounded-xl bg-[#f3f3f3] border border-[#e2e2e2] text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#1b1b1b] block mb-1">Mobile Phone Number</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full px-4 py-2.5 rounded-xl bg-[#f3f3f3] border border-[#e2e2e2] text-sm"
              />
            </div>

            <div className="flex items-center gap-2 mt-1">
              <Check className="w-4 h-4 text-[#006a3b]" />
              <span className="text-xs text-[#3e4a40]">
                Verified member badge enabled for trusted ride sharing
              </span>
            </div>

            <button
              type="submit"
              className="w-full bg-[#006a3b] hover:bg-[#00864c] text-white font-bold py-3.5 rounded-full text-sm transition-colors mt-2 cursor-pointer"
            >
              {isSignUp ? 'Create Tezzo Account' : 'Log In'}
            </button>
          </form>

          {/* Quick Demo Login Preset */}
          <div className="pt-3 border-t border-[#eeeeee]">
            <span className="text-xs font-bold text-[#6e7a6f] block mb-2 text-center">
              Or quick 1-click Demo Login
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() =>
                  handleQuickDemo({
                    name: 'Priya Sharma',
                    email: 'priya@tezzo.com',
                    phone: '+91 98765 43210',
                    avatar:
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
                    verified: true,
                    bio: 'Tezzo ambassador and regular commuter.',
                  })
                }
                className="p-2.5 rounded-xl bg-[#f6fff4] border border-[#bdcabd] hover:bg-[#e2f7df] text-xs font-bold text-[#006a3b] flex items-center gap-2 justify-center transition-colors"
              >
                <UserCheck className="w-4 h-4" />
                <span>Priya Sharma</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  handleQuickDemo({
                    name: 'Rahul Mehta',
                    email: 'rahul@tezzo.com',
                    phone: '+91 98111 22334',
                    avatar:
                      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
                    verified: true,
                    bio: 'Tech enthusiast carpooling daily from Delhi to Gurgaon.',
                  })
                }
                className="p-2.5 rounded-xl bg-[#f3f3f3] border border-[#e2e2e2] hover:bg-[#e8e8e8] text-xs font-bold text-[#1b1b1b] flex items-center gap-2 justify-center transition-colors"
              >
                <UserCheck className="w-4 h-4" />
                <span>Rahul Mehta</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
