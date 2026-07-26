import React, { useState, useEffect } from 'react';
import {
  X,
  Star,
  ShieldCheck,
  CheckCircle2,
  ThumbsUp,
  MessageSquare,
  Send,
  User,
  Check,
  Award,
  Sparkles,
  Car,
} from 'lucide-react';
import { Driver, DriverReview, UserProfile } from '../types';
import {
  getDriverReviews,
  getDriverStats,
  addDriverReview,
} from '../utils/reviewService';

interface DriverReviewsModalProps {
  isOpen: boolean;
  onClose: () => void;
  driver: Driver;
  user: UserProfile | null;
  onOpenAuth?: () => void;
  bookingId?: string;
  rideRoute?: string;
  onReviewSubmitted?: (newRating: number) => void;
}

const PRESET_TAGS = [
  'Punctual & On-Time',
  'Clean & Sanitized Car',
  'Safe & Smooth Driving',
  'Polite & Friendly',
  'Great Music Playlist',
  'Excellent AC',
  'Quiet Ride',
  'Helpful with Luggage',
];

export const DriverReviewsModal: React.FC<DriverReviewsModalProps> = ({
  isOpen,
  onClose,
  driver,
  user,
  onOpenAuth,
  bookingId,
  rideRoute,
  onReviewSubmitted,
}) => {
  const [reviews, setReviews] = useState<DriverReview[]>([]);
  const [selectedRating, setSelectedRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'reviews' | 'write'>('reviews');

  useEffect(() => {
    if (isOpen && driver) {
      const driverReviews = getDriverReviews(driver.name);
      setReviews(driverReviews);
      setShowSuccessMessage(false);
    }
  }, [isOpen, driver]);

  if (!isOpen || !driver) return null;

  const stats = getDriverStats(driver.name, driver.rating, driver.reviewsCount);
  const totalReviewsCount = stats.totalCount;
  const currentAverage = stats.averageRating;

  // Calculate rating breakdown
  const ratingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach((r) => {
    if (r.rating >= 1 && r.rating <= 5) {
      ratingCounts[r.rating as keyof typeof ratingCounts] += 1;
    }
  });

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      if (onOpenAuth) onOpenAuth();
      return;
    }

    if (!comment.trim()) return;

    setIsSubmitting(true);

    setTimeout(() => {
      const newReview = addDriverReview({
        driverName: driver.name,
        reviewerName: user.name || 'Anonymous Rider',
        reviewerAvatar: user.avatar,
        rating: selectedRating,
        comment: comment.trim(),
        tags: selectedTags,
        rideRoute: rideRoute || 'Verified Carpool Trip',
        bookingId: bookingId,
      });

      const updatedList = [newReview, ...reviews];
      setReviews(updatedList);
      setIsSubmitting(false);
      setShowSuccessMessage(true);
      setComment('');
      setSelectedTags([]);

      // Notify parent of updated driver average
      const newStats = getDriverStats(driver.name, driver.rating, driver.reviewsCount);
      if (onReviewSubmitted) {
        onReviewSubmitted(newStats.averageRating);
      }

      setTimeout(() => {
        setActiveTab('reviews');
        setShowSuccessMessage(false);
      }, 1500);
    }, 400);
  };

  const getRatingLabel = (stars: number) => {
    switch (stars) {
      case 5:
        return 'Excellent! 🌟🌟🌟🌟🌟';
      case 4:
        return 'Very Good 👍';
      case 3:
        return 'Average / Satisfactory 😐';
      case 2:
        return 'Poor 👎';
      case 1:
        return 'Very Disappointed 😠';
      default:
        return '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-[var(--color-border)] max-h-[90vh] flex flex-col my-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Header Bar */}
        <div className="bg-[var(--color-primary)] text-white p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-[var(--color-accent-mint)]" />
            <h3 className="font-bold text-lg">Driver Reviews & Ratings</h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1 rounded-full hover:bg-white/20 transition-colors text-white cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Driver Summary Banner */}
        <div className="bg-[var(--color-success-bg)] p-5 border-b border-[var(--color-outline-variant)] flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <img
              src={driver.avatar}
              alt={driver.name}
              className="w-14 h-14 rounded-full object-cover border-2 border-[var(--color-primary)] shadow-xs shrink-0"
            />
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <h4 className="font-extrabold text-base text-[var(--color-on-surface)]">{driver.name}</h4>
                {driver.verified && (
                  <span className="inline-flex items-center gap-0.5 text-[10px] bg-[var(--color-success-bg-soft)] text-[var(--color-primary)] border border-[var(--color-primary-light)] px-2 py-0.5 rounded-full font-bold">
                    <CheckCircle2 className="w-3 h-3 text-[var(--color-primary)] fill-[var(--color-accent-mint)]" />
                    Verified Driver
                  </span>
                )}
              </div>
              <p className="text-xs text-[var(--color-outline)] mt-0.5">
                Member since {driver.memberSince || '2023'} • {driver.ridesCompleted || 85}+ trips completed
              </p>
            </div>
          </div>

          {/* Average Rating Metric Badge */}
          <div className="bg-white px-3.5 py-2 rounded-2xl border border-[var(--color-outline-variant)] shadow-2xs text-center shrink-0">
            <div className="flex items-center justify-center gap-1 text-amber-500 font-black text-xl">
              <Star className="w-5 h-5 fill-amber-400 text-amber-500" />
              <span>{currentAverage.toFixed(1)}</span>
            </div>
            <span className="text-[10px] text-[var(--color-outline)] font-bold block mt-0.5">
              {reviews.length} {reviews.length === 1 ? 'Review' : 'Reviews'}
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-[var(--color-surface-container)] bg-[var(--color-background)] shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('reviews')}
            className={`flex-1 py-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'reviews'
                ? 'border-[var(--color-primary)] text-[var(--color-primary)] bg-white'
                : 'border-transparent text-[var(--color-outline)] hover:text-[var(--color-on-surface)]'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>All Reviews ({reviews.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('write')}
            className={`flex-1 py-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'write'
                ? 'border-[var(--color-primary)] text-[var(--color-primary)] bg-white'
                : 'border-transparent text-[var(--color-outline)] hover:text-[var(--color-on-surface)]'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Write a Review</span>
          </button>
        </div>

        {/* Tab Content Area */}
        <div className="p-6 overflow-y-auto flex-1">
          {activeTab === 'reviews' && (
            <div className="space-y-5">
              {/* Star distribution breakdown */}
              {reviews.length > 0 && (
                <div className="bg-[var(--color-background)] p-4 rounded-2xl border border-[var(--color-surface-container)] space-y-1.5 text-xs">
                  <span className="font-extrabold text-xs text-[var(--color-on-surface)] block mb-2">
                    Rating Summary
                  </span>
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = ratingCounts[star as keyof typeof ratingCounts];
                    const percent =
                      reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                    return (
                      <div key={star} className="flex items-center gap-2 text-xs">
                        <span className="font-bold text-[var(--color-on-surface-variant)] w-12 flex items-center gap-0.5">
                          {star} <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                        </span>
                        <div className="flex-1 bg-gray-200 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-[var(--color-primary)] h-full rounded-full transition-all duration-500"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <span className="text-[var(--color-outline)] font-semibold w-8 text-right">
                          {count}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Reviews List */}
              {reviews.length === 0 ? (
                <div className="text-center py-10 bg-[var(--color-background)] rounded-2xl border border-dashed border-[var(--color-outline-variant)] p-6 space-y-3">
                  <Star className="w-10 h-10 text-amber-300 mx-auto" />
                  <p className="text-sm font-bold text-[var(--color-on-surface)]">No User Reviews Yet</p>
                  <p className="text-xs text-[var(--color-outline)] max-w-xs mx-auto">
                    Be the first rider to share your carpool experience with {driver.name}!
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab('write')}
                    className="mt-2 bg-[var(--color-primary)] text-white px-5 py-2 rounded-full text-xs font-bold hover:bg-[var(--color-primary-container)] transition-colors"
                  >
                    Write First Review
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {reviews.map((rev) => (
                    <div
                      key={rev.id}
                      className="bg-white p-4 rounded-2xl border border-[var(--color-outline-variant)] shadow-2xs space-y-2 hover:border-[var(--color-primary)] transition-all"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          {rev.reviewerAvatar ? (
                            <img
                              src={rev.reviewerAvatar}
                              alt={rev.reviewerName}
                              className="w-8 h-8 rounded-full object-cover border border-[var(--color-outline-variant)]"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-[var(--color-success-bg-soft)] text-[var(--color-primary)] flex items-center justify-center font-bold text-xs border border-[var(--color-primary-light)]">
                              <User className="w-4 h-4" />
                            </div>
                          )}
                          <div>
                            <span className="font-extrabold text-xs text-[var(--color-on-surface)] block">
                              {rev.reviewerName}
                            </span>
                            <span className="text-[10px] text-[var(--color-outline)] font-medium">
                              {rev.date}
                            </span>
                          </div>
                        </div>

                        {/* Star rating badge */}
                        <div className="flex items-center gap-0.5 bg-amber-50 border border-amber-200 text-amber-800 px-2 py-0.5 rounded-lg text-xs font-black">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                          <span>{rev.rating}.0</span>
                        </div>
                      </div>

                      <p className="text-xs text-[var(--color-on-surface-variant)] leading-relaxed font-medium pt-1">
                        "{rev.comment}"
                      </p>

                      {/* Compliment Tags */}
                      {rev.tags && rev.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {rev.tags.map((t) => (
                            <span
                              key={t}
                              className="text-[10px] bg-[var(--color-success-bg-soft)] text-[var(--color-primary)] border border-[var(--color-primary-light)]/60 font-extrabold px-2 py-0.5 rounded-md"
                            >
                              ✓ {t}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Route badge */}
                      {rev.rideRoute && (
                        <div className="text-[10px] text-[var(--color-outline)] flex items-center gap-1 pt-1 border-t border-[var(--color-surface-container)]">
                          <Car className="w-3 h-3 text-[var(--color-primary)]" />
                          <span>Trip: {rev.rideRoute}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'write' && (
            <div>
              {showSuccessMessage ? (
                <div className="py-12 text-center flex flex-col items-center justify-center gap-3 animate-in fade-in duration-300">
                  <div className="w-14 h-14 rounded-full bg-[var(--color-success-bg)] border-2 border-[var(--color-primary)] text-[var(--color-primary)] flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8 fill-[var(--color-accent-mint)]" />
                  </div>
                  <h4 className="font-extrabold text-lg text-[var(--color-on-surface)]">
                    Review Submitted!
                  </h4>
                  <p className="text-xs text-[var(--color-on-surface-variant)] max-w-xs">
                    Thank you for rating <strong>{driver.name}</strong>. Your feedback helps build trust in our carpool community.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmitReview} className="space-y-4">
                  {/* Star Selector */}
                  <div className="bg-[var(--color-success-bg)] p-4 rounded-2xl border border-[var(--color-outline-variant)] text-center space-y-2">
                    <label className="text-xs font-extrabold text-[var(--color-on-surface)] uppercase tracking-wider block">
                      Select Star Rating
                    </label>
                    <div className="flex items-center justify-center gap-2 py-1">
                      {[1, 2, 3, 4, 5].map((star) => {
                        const isFilled =
                          star <= (hoverRating || selectedRating);
                        return (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setSelectedRating(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            className="p-1 cursor-pointer transition-transform hover:scale-125 focus:outline-none"
                          >
                            <Star
                              className={`w-8 h-8 ${
                                isFilled
                                  ? 'fill-amber-400 text-amber-500'
                                  : 'text-gray-300'
                              }`}
                            />
                          </button>
                        );
                      })}
                    </div>
                    <span className="text-xs font-bold text-[var(--color-primary)] block">
                      {getRatingLabel(hoverRating || selectedRating)}
                    </span>
                  </div>

                  {/* Compliment Tags */}
                  <div>
                    <label className="text-xs font-bold text-[var(--color-on-surface)] block mb-2">
                      What went well? (Select tags)
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {PRESET_TAGS.map((tag) => {
                        const isSelected = selectedTags.includes(tag);
                        return (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => toggleTag(tag)}
                            className={`text-xs px-3 py-1.5 rounded-xl font-bold transition-all border cursor-pointer ${
                              isSelected
                                ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)] shadow-2xs'
                                : 'bg-[var(--color-surface-container-low)] text-[var(--color-on-surface-variant)] border-[var(--color-outline-variant)] hover:bg-gray-200'
                            }`}
                          >
                            {isSelected ? '✓ ' : '+ '}
                            {tag}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Comment Textarea */}
                  <div>
                    <label className="text-xs font-bold text-[var(--color-on-surface)] block mb-1">
                      Your Review / Experience
                    </label>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      required
                      rows={3}
                      placeholder={`Describe your commute with ${driver.name}. E.g. Punctual, safe driving, pleasant conversation...`}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--color-background)] border border-[var(--color-outline-variant)] text-xs font-medium focus:outline-none focus:border-[var(--color-primary)] focus:bg-white transition-all"
                    />
                  </div>

                  {!user && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center justify-between">
                      <span>Please sign in to post your review.</span>
                      <button
                        type="button"
                        onClick={onOpenAuth}
                        className="font-bold underline text-[var(--color-primary)]"
                      >
                        Sign In
                      </button>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting || !comment.trim()}
                    className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-container)] disabled:opacity-50 text-white font-extrabold text-xs py-3 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                  >
                    <Send className="w-4 h-4" />
                    <span>{isSubmitting ? 'Posting Review...' : 'Post Review'}</span>
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
