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
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-[var(--color-border)] animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-[var(--color-primary)] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[var(--color-accent-mint)]" />
            <h3 className="font-bold text-lg">{isSignUp ? 'Join Tezzo Carpool' : 'Welcome Back'}</h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1 rounded-full hover:bg-white/20 transition-colors text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-5">
          {/* Tabs */}
          <div className="flex bg-[var(--color-surface-container-low)] p-1 rounded-full border border-[var(--color-border)]">
            <button
              type="button"
              onClick={() => setIsSignUp(true)}
              className={`flex-1 py-2 rounded-full text-xs font-bold transition-all ${
                isSignUp ? 'bg-white text-[var(--color-primary)] shadow-xs' : 'text-[var(--color-outline)]'
              }`}
            >
              Sign Up
            </button>
            <button
              type="button"
              onClick={() => setIsSignUp(false)}
              className={`flex-1 py-2 rounded-full text-xs font-bold transition-all ${
                !isSignUp ? 'bg-white text-[var(--color-primary)] shadow-xs' : 'text-[var(--color-outline)]'
              }`}
            >
              Log In
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            {isSignUp && (
              <div>
                <label className="text-xs font-bold text-[var(--color-on-surface)] block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Priya Sharma"
                  className="w-full px-4 py-2.5 rounded-xl bg-[var(--color-surface-container-low)] border border-[var(--color-border)] text-sm"
                />
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-[var(--color-on-surface)] block mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="priya@example.com"
                className="w-full px-4 py-2.5 rounded-xl bg-[var(--color-surface-container-low)] border border-[var(--color-border)] text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[var(--color-on-surface)] block mb-1">Mobile Phone Number</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full px-4 py-2.5 rounded-xl bg-[var(--color-surface-container-low)] border border-[var(--color-border)] text-sm"
              />
            </div>

            <div className="flex items-center gap-2 mt-1">
              <Check className="w-4 h-4 text-[var(--color-primary)]" />
              <span className="text-xs text-[var(--color-on-surface-variant)]">
                Verified member badge enabled for trusted ride sharing
              </span>
            </div>

            <button
              type="submit"
              className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-container)] text-white font-bold py-3.5 rounded-full text-sm transition-colors mt-2 cursor-pointer"
            >
              {isSignUp ? 'Create Tezzo Account' : 'Log In'}
            </button>
          </form>

          {/* Quick Demo Login Preset */}
          <div className="pt-3 border-t border-[var(--color-surface-container)]">
            <span className="text-xs font-bold text-[var(--color-outline)] block mb-2 text-center">
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
                className="p-2.5 rounded-xl bg-[var(--color-success-bg)] border border-[var(--color-outline-variant)] hover:bg-[var(--color-success-tint)] text-xs font-bold text-[var(--color-primary)] flex items-center gap-2 justify-center transition-colors"
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
                className="p-2.5 rounded-xl bg-[var(--color-surface-container-low)] border border-[var(--color-border)] hover:bg-[#e8e8e8] text-xs font-bold text-[var(--color-on-surface)] flex items-center gap-2 justify-center transition-colors"
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
