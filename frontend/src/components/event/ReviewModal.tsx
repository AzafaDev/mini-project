import React from "react";

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  userReview: { rating: number; comment: string };
  isSubmitting: boolean;
  onChange: (review: { rating: number; comment: string }) => void;
  onSubmit: () => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  onClose,
  userReview,
  isSubmitting,
  onChange,
  onSubmit,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-dark-surface rounded-xl p-6 max-w-md w-full">
        <h3 className="text-xl font-bold mb-6">Write a Review</h3>

        <div className="mb-4">
          <p className="text-text-muted mb-2">Rating</p>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => onChange({ ...userReview, rating: star })}
                className={`material-symbols-outlined text-3xl transition-colors ${star <= userReview.rating ? "text-primary" : "text-dark-card hover:text-primary/50"
                  }`}
              >
                star
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <p className="text-text-muted mb-2">Comment</p>
          <textarea
            value={userReview.comment}
            onChange={(e) => onChange({ ...userReview, comment: e.target.value })}
            placeholder="Share your experience..."
            className="w-full h-32 bg-dark border border-white/10 rounded-lg px-4 py-3 text-text-light placeholder-text-muted/50 focus:outline-none focus:border-primary resize-none"
          />
          <p className="text-xs text-text-secondary mt-2 text-right">
            {userReview.comment.length}/500
          </p>
        </div>

        <div className="flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-dark-card text-text-light font-bold rounded-lg hover:bg-dark-card-hover transition-all disabled:opacity-50"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            className="flex-1 py-3 bg-gradient-to-r from-primary to-accent text-primary-dark font-bold rounded-lg transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit Review"}
          </button>
        </div>
      </div>
    </div>
  );
};
