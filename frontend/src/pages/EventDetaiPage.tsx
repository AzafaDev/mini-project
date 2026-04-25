import React from "react";
import { Link } from "react-router-dom";
import { useEventDetail } from "../hooks/useEventDetail";
import { EventHero } from "../components/event/EventHero";
import { TicketSelection } from "../components/event/TicketSelection";
import { ReviewSection } from "../components/event/ReviewSection";
import { ReviewModal } from "../components/event/ReviewModal";
import { formatIDR } from "../lib/formatters";

const EventDetaiPage: React.FC = () => {
  const {
    event,
    loading,
    isReviewModalOpen,
    userReview,
    isSubmittingReview,
    hasUserReviewed,
    canUserReview,
    eventStatus,
    averageRating,
    handleBuyNow,
    openReviewModal,
    closeReviewModal,
    setUserReview,
    submitReview,
  } = useEventDetail();

  if (loading) {
    return (
      <div className="bg-dark text-text-light min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="bg-dark text-text-light min-h-screen flex items-center justify-center">
        <div className="text-center">
          <span className="material-symbols-outlined text-6xl text-error">
            error_outline
          </span>
          <p className="text-text-muted mt-4">The event you're looking for doesn't exist.</p>
          <Link to="/" className="text-primary hover:underline mt-4 inline-block">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-dark text-text-light min-h-screen font-sans selection:bg-primary/30">
      {/* Hero Section */}
      <EventHero
        event={event}
        eventStatus={eventStatus}
        averageRating={averageRating}
      />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
            {/* Left Column - Event Details */}
            <div className="lg:col-span-7 space-y-6 sm:space-y-8">
            {/* Event Description */}
            <div className="bg-dark-surface border border-white/5 rounded-xl p-8">
              <h2 className="text-2xl font-bold text-text-light mb-6">About This Event</h2>
              <div className="prose prose-invert max-w-none">
                <p className="text-text-muted leading-relaxed whitespace-pre-line">{event.description}</p>
              </div>
            </div>

             {/* Event Details Bento Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {/* Capacity */}
              <div className="bg-dark-surface border border-white/5 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary">group</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-text-light">Capacity</h3>
                    <p className="text-sm text-text-muted">Available seats</p>
                  </div>
                </div>
                <div className="text-2xl font-bold text-primary mb-2">
                  {event.availableSeats}/{event.totalSeats}
                </div>
                <div className="w-full bg-dark-elevated rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-primary to-accent h-2 rounded-full transition-all duration-500"
                    style={{ width: `${((event.totalSeats - event.availableSeats) / event.totalSeats) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-text-muted mt-2">
                  {event.availableSeats > 0 ? `${event.availableSeats} seats remaining` : 'Event full'}
                </p>
              </div>

              {/* Category */}
              <div className="bg-dark-surface border border-white/5 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center">
                    <span className="material-symbols-outlined text-accent">category</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-text-light">Category</h3>
                    <p className="text-sm text-text-muted">Event type</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-accent/20 text-accent rounded-full text-sm font-medium">
                    {event.category}
                  </span>
                </div>
              </div>

{/* Organizer Info - Entire card clickable */}
               <Link
                 to={`/organizer/${event.organizer?.id || event.organizerId}`}
                 className="bg-dark-surface border border-white/5 rounded-xl p-6 md:col-span-2 hover:border-primary/30 transition-all group block relative overflow-hidden"
               >
                 {/* Hover overlay effect */}
                 <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                 
                 {/* Content - z-10 to stay above overlay */}
                 <div className="relative z-10">
                   <div className="flex items-center gap-3 mb-4">
                     <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                       <span className="material-symbols-outlined text-white">person</span>
                     </div>
                     <div>
                       <h3 className="font-bold text-text-light">Organizer</h3>
                       <p className="text-sm text-text-muted">Event host</p>
                     </div>
                   </div>
                   <div className="flex items-center justify-between">
                     <span className="text-primary font-medium">
                       {event.organizer?.fullName || event.organizerName}
                     </span>
                     <div className="flex items-center gap-1">
                       {event.organizer?.rating && (
                         <>
                           <span className="material-symbols-outlined text-yellow-500 text-sm">star</span>
                           <span className="text-text-light text-sm font-medium">
                             {event.organizer.rating.toFixed(1)}
                           </span>
                           {event.organizer.reviewCount && (
                             <span className="text-text-muted text-xs">
                               ({event.organizer.reviewCount})
                             </span>
                           )}
                         </>
                       )}
                       <span className="material-symbols-outlined text-text-muted group-hover:text-primary group-hover:translate-x-1 transition-all">
                         chevron_right
                       </span>
                     </div>
                   </div>
                 </div>
               </Link>
            </div>

            {/* Reviews Section - Desktop */}
            <div className="hidden lg:block">
              <ReviewSection
                reviews={event.reviews || []}
                averageRating={averageRating}
                hasUserReviewed={hasUserReviewed}
                canUserReview={canUserReview}
                onWriteReview={openReviewModal}
              />
            </div>
          </div>

          {/* Right Column - Ticket Selection (Sticky Sidebar) */}
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-24">
               <TicketSelection
                 event={event}
                 onBuyNow={handleBuyNow}
                 isPastEvent={eventStatus === 'Completed'}
               />
            </div>
          </div>
        </div>

        {/* Reviews Section - Mobile */}
        <div className="lg:hidden mt-8">
          <ReviewSection
            reviews={event.reviews || []}
            averageRating={averageRating}
            hasUserReviewed={hasUserReviewed}
            canUserReview={canUserReview}
            onWriteReview={openReviewModal}
          />
        </div>
      </div>

      {/* Review Modal */}
      <ReviewModal
        isOpen={isReviewModalOpen}
        onClose={closeReviewModal}
        userReview={userReview}
        isSubmitting={isSubmittingReview}
        onChange={setUserReview}
        onSubmit={submitReview}
      />
    </div>
  );
};

export default EventDetaiPage;