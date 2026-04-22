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
    selectedTickets,
    voucherCode,
    couponCode,
    voucherError,
    couponError,
    discount,
    totalPrice,
    isReviewModalOpen,
    userReview,
    isSubmittingReview,
    hasUserReviewed,
    eventStatus,
    averageRating,
    setSelectedTickets,
    setVoucherCode,
    setCouponCode,
    applyVoucher,
    applyCoupon,
    addToCart,
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

  const handleTicketChange = (type: 'general' | 'vip', delta: number) => {
    setSelectedTickets({
      ...selectedTickets,
      [type]: Math.max(0, selectedTickets[type] + delta)
    });
  };

  return (
    <div className="bg-dark text-text-light min-h-screen font-sans selection:bg-primary/30">
      {/* Breadcrumb */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center gap-2 text-text-muted text-xs mb-4">
          <Link to="/" className="hover:text-primary">Events</Link>
          <span>/</span>
          <span className="text-primary">{event.name}</span>
        </div>
      </div>

      {/* Hero Section */}
      <EventHero
        event={event}
        eventStatus={eventStatus}
        averageRating={averageRating}
      />

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Ticket Selection */}
          <div className="lg:col-span-2">
            <TicketSelection
              event={event}
              selectedTickets={selectedTickets}
              voucherCode={voucherCode}
              couponCode={couponCode}
              voucherError={voucherError}
              couponError={couponError}
              discount={discount}
              totalPrice={totalPrice}
              onTicketChange={handleTicketChange}
              onVoucherChange={setVoucherCode}
              onCouponChange={setCouponCode}
              onApplyVoucher={applyVoucher}
              onApplyCoupon={applyCoupon}
              onAddToCart={addToCart}
            />
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            <div className="bg-dark-surface rounded-xl p-6 sticky top-4">
              <h3 className="font-bold text-lg mb-4">Ticket Prices</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-text-muted">General</span>
                  <span className="font-bold">{formatIDR(event.price)}</span>
                </div>
                {event.vipPrice && (
                  <div className="flex justify-between">
                    <span className="text-text-muted">VIP</span>
                    <span className="font-bold text-primary">{formatIDR(event.vipPrice)}</span>
                  </div>
                )}
              </div>

              <div className="border-t border-border-muted/10 mt-4 pt-4">
                <p className="text-text-secondary text-sm">
                  Organized by <span className="text-text-light font-medium">{event.organizerName}</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <ReviewSection
          reviews={event.reviews || []}
          averageRating={averageRating}
          hasUserReviewed={hasUserReviewed}
          onWriteReview={openReviewModal}
        />
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
