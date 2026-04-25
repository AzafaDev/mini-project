import React from "react";
import { formatDate } from "../../lib/formatters";

interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  createdAt: string;
}

interface ReviewSectionProps {
  reviews: Review[];
  averageRating: number;
  hasUserReviewed: boolean;
  canUserReview?: boolean;
  onWriteReview: () => void;
}

export const ReviewSection: React.FC<ReviewSectionProps> = ({
  reviews,
  averageRating,
  hasUserReviewed,
  canUserReview = false,
  onWriteReview,
}) => {
  return (
    <section className="mt-12 sm:mt-16">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
        <h2 className="text-xl sm:text-2xl font-bold text-text-light">Reviews</h2>
        {canUserReview && !hasUserReviewed && (
          <button
            onClick={onWriteReview}
            className="bg-dark-card text-text-light px-4 py-2 rounded-lg font-medium hover:bg-dark-card-hover transition-colors min-h-[44px]"
          >
            Write a Review
          </button>
        )}
      </div>

      {reviews.length === 0 ? (
        <div className="bg-dark-surface rounded-lg p-6 sm:p-12 text-center">
          <span className="material-symbols-outlined text-6xl text-dark-card mb-4">
            rate_review
          </span>
          <p className="text-lg sm:text-xl text-text-muted mb-2">No reviews yet</p>
          <p className="text-text-secondary">Be the first to review this event</p>
        </div>
      ) : (
        <div className="space-y-4 sm:space-y-6">
          {reviews.map((review) => (
            <div key={review.id} className="bg-dark-surface rounded-xl p-4 sm:p-6">
              <div className="flex items-start gap-3 sm:gap-4">
                <img
                  src={review.userAvatar || "https://via.placeholder.com/48"}
                  alt={review.userName}
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-text-light truncate">{review.userName}</h4>
                    <span className="text-text-secondary text-xs flex-shrink-0">
                      {formatDate(review.createdAt)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        className={`material-symbols-outlined text-sm ${
                          star <= review.rating ? "text-primary" : "text-dark-card"
                        }`}
                      >
                        star
                      </span>
                    ))}
                  </div>
                  <p className="text-text-muted mt-2 text-sm sm:text-base">{review.comment}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );

};
