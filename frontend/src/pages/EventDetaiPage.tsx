import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useEventStore } from "../stores/useEventStore";
import { useAuthStore } from "../stores/useAuthStore";
import { useTransactionStore } from "../stores/useTransactionStore";
import { useToastStore } from "../stores/useToastStore";
import { reviewsVouchersService } from "../services/api";
import type { Review, Voucher } from "../services/api";

const EventDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    currentEvent,
    loading,
    error,
    fetchEventById,
    clearCurrentEvent,
    currentEventReviews,
    currentEventVouchers,
    fetchEventReviews,
    fetchEventVouchers,
    validateVoucher,
    createReview,
    updateReview,
  } = useEventStore();

  const { user, isAuthenticated } = useAuthStore();
  const { createTransaction } = useTransactionStore();
  const { addToast } = useToastStore();

  // Local state for ticket selection
  const [ticketQuantities, setTicketQuantities] = useState<Record<string, number>>({});

  // Local state for voucher
  const [voucherCode, setVoucherCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [voucherError, setVoucherError] = useState("");
  const [isApplyingVoucher, setIsApplyingVoucher] = useState(false);

  // Local state for coupon
  const [couponCode, setCouponCode] = useState("");
  const [appliedCouponDiscount, setAppliedCouponDiscount] = useState(0);
  const [couponError, setCouponError] = useState("");
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  // Local state for review modal
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);

  // Local state for checkout flow
  const [usePoints, setUsePoints] = useState(false);
  const [userPoints, setUserPoints] = useState(0);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Check if user can write review (event ended and user logged in)
  const isEventEnded = currentEvent
    ? new Date(currentEvent.endDate) < new Date()
    : false;
  const canWriteReview = isAuthenticated && isEventEnded && user;

  // Check if user already reviewed
  const userReview = currentEventReviews.find((r) => r.userId === user?.id);

  // Helper to get tickets from currentEvent.tickets
  const getEventTickets = () => {
    console.log("[DEBUG EventDetailPage] Event tickets:", currentEvent?.tickets);
    return currentEvent?.tickets || [];
  };

  // Helper to get General ticket
  const getGeneralTicket = () => {
    const tickets = getEventTickets();
    return tickets.find((t) => t.type === "GENERAL");
  };

  // Helper to get VIP ticket
  const getVIPTicket = () => {
    const tickets = getEventTickets();
    return tickets.find((t) => t.type === "VIP");
  };

  // Get prices from backend tickets
  const generalTicket = getGeneralTicket();
  const vipTicket = getVIPTicket();
  const eventBasePrice = currentEvent?.price || 450000;

  // Calculate total dynamically based on selected tickets
  const calculateTotal = () => {
    let total = 0;
    const tickets = getEventTickets();

    Object.entries(ticketQuantities).forEach(([ticketId, quantity]) => {
      if (quantity > 0) {
        // First check if it's a backend ticket
        const ticket = tickets.find((t) => t.id === ticketId);
        if (ticket) {
          total += ticket.price * quantity;
        } else if (ticketId === "general") {
          // Fallback for default general ticket
          total += eventBasePrice * quantity;
        } else if (ticketId === "vip") {
          // Fallback for default VIP ticket
          total += eventBasePrice * 2.5 * quantity;
        }
      }
    });

    return total;
  };

  const total = calculateTotal();

  const totalWithDiscount = Math.max(0, total - appliedDiscount - appliedCouponDiscount);
  const pointsDiscount = usePoints ? Math.min(userPoints * 10, 50000) : 0;
  const finalTotal = totalWithDiscount - pointsDiscount;

  // Helper function to determine event status
  const getEventStatus = () => {
    if (!currentEvent) return "unknown";
    const now = new Date();
    const startDate = new Date(currentEvent.startDate);
    const endDate = currentEvent.endDate ? new Date(currentEvent.endDate) : null;
    
    if (endDate && endDate < now) return "past";
    if (startDate <= now && (!endDate || endDate >= now)) return "ongoing";
    return "upcoming";
  };

  const eventStatus = getEventStatus();

  // Calculate average rating
  const averageRating =
    currentEventReviews.length > 0
      ? currentEventReviews.reduce((sum, r) => sum + r.rating, 0) /
        currentEventReviews.length
      : 0;

  const handleApplyVoucher = async () => {
    if (!voucherCode.trim() || !id) return;

    setIsApplyingVoucher(true);
    setVoucherError("");

    const totalQuantity = Object.values(ticketQuantities).reduce((sum, qty) => sum + qty, 0);
    
    // Fallback: if total is 0 but quantity > 0, use eventBasePrice
    const effectiveTotal = total > 0 ? total : (totalQuantity > 0 ? eventBasePrice * totalQuantity : 0);
    console.log("[DEBUG handleApplyVoucher] voucherCode:", voucherCode, "total:", total, "effectiveTotal:", effectiveTotal, "totalQuantity:", totalQuantity);

    const discount = await validateVoucher(
      id,
      voucherCode,
      effectiveTotal,
      totalQuantity,
    );

    setIsApplyingVoucher(false);

    if (discount > 0) {
      setAppliedDiscount(discount);
      setVoucherError("");
    } else {
      setAppliedDiscount(0);
      setVoucherError("Invalid or expired voucher");
    }
  };

  const handleRemoveVoucher = () => {
    setVoucherCode("");
    setAppliedDiscount(0);
    setVoucherError("");
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;

    setIsApplyingCoupon(true);
    setCouponError("");

    const totalQuantity = Object.values(ticketQuantities).reduce((sum, qty) => sum + qty, 0);
    
    // Fallback: if total is 0 but quantity > 0, use eventBasePrice
    const effectiveTotal = total > 0 ? total : (totalQuantity > 0 ? eventBasePrice * totalQuantity : 0);
    console.log("[DEBUG handleApplyCoupon] couponCode:", couponCode, "total:", total, "effectiveTotal:", effectiveTotal, "totalQuantity:", totalQuantity);

    const result = await reviewsVouchersService.validateCoupon(
      couponCode,
      effectiveTotal,
      totalQuantity
    );

    setIsApplyingCoupon(false);

    if (result.success && result.valid) {
      setAppliedCouponDiscount(result.discount || 0);
      setCouponError("");
    } else {
      setAppliedCouponDiscount(0);
      setCouponError(result.message || "Invalid or expired coupon");
    }
  };

  const handleRemoveCoupon = () => {
    setCouponCode("");
    setAppliedCouponDiscount(0);
    setCouponError("");
  };

  const handleSubmitReview = async () => {
    if (!id || reviewRating === 0 || !reviewComment.trim()) {
      addToast("error", "Please provide a rating and comment");
      return;
    }

    setIsSubmittingReview(true);
    
    let success: boolean;
    if (editingReview) {
      success = await updateReview(editingReview.id, id, reviewRating, reviewComment.trim());
    } else {
      success = await createReview(id, reviewRating, reviewComment.trim());
    }
    
    setIsSubmittingReview(false);

    if (success) {
      addToast("success", editingReview ? "Review updated successfully!" : "Review submitted successfully!");
      setIsReviewModalOpen(false);
      setReviewRating(0);
      setReviewComment("");
      setEditingReview(null);
    } else {
      addToast(
        "error",
        editingReview ? "Failed to update review." : "Failed to submit review. You may have already reviewed this event.",
      );
    }
  };

  const openReviewModal = () => {
    if (!isAuthenticated) {
      addToast("error", "Please login to write a review");
      return;
    }
    if (!isEventEnded) {
      addToast("error", "You can only review after the event has ended");
      return;
    }
    
    // If user already has a review, open in edit mode
    if (userReview) {
      setEditingReview(userReview);
      setReviewRating(userReview.rating);
      setReviewComment(userReview.comment);
    } else {
      setEditingReview(null);
      setReviewRating(0);
      setReviewComment("");
    }
    
    setIsReviewModalOpen(true);
  };

  const formatIDR = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    })
      .format(amount)
      .replace("Rp", "IDR ");
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const handleUpdateTicket = (ticketId: string, delta: number) => {
    setTicketQuantities((prev) => ({
      ...prev,
      [ticketId]: Math.max(0, (prev[ticketId] || 0) + delta),
    }));
  };

  useEffect(() => {
    if (id) {
      fetchEventById(id);
      fetchEventReviews(id);
      fetchEventVouchers(id);
    }
    return () => {
      clearCurrentEvent();
    };
  }, [id]);

  useEffect(() => {
    if (user?.points) {
      setUserPoints(user.points);
    }
  }, [user]);

  const handlePurchase = async () => {
    // Check if event has ended
    if (currentEvent) {
      const now = new Date();
      const startDate = new Date(currentEvent.startDate);
      const endDate = currentEvent.endDate ? new Date(currentEvent.endDate) : startDate;
      
      if (endDate < now) {
        addToast("error", "This event has ended");
        return;
      }
    }

    if (!isAuthenticated) {
      addToast("error", "Please login to continue");
      navigate("/login", { state: { from: window.location.pathname } });
      return;
    }

    const totalQuantity = Object.values(ticketQuantities).reduce((sum, qty) => sum + qty, 0);
    if (totalQuantity === 0) {
      addToast("error", "Please select at least 1 ticket");
      return;
    }

    setIsProcessingPayment(true);

    // Determine ticketId based on selection
    const ticketId = generalTicket?.id || vipTicket?.id || "default";

    const transaction = await createTransaction({
      eventId: id!,
      ticketId,
      quantity: totalQuantity,
      voucherCode: appliedDiscount > 0 ? voucherCode : undefined,
      couponCode: appliedCouponDiscount > 0 ? couponCode : undefined,
      pointsUsed: usePoints ? Math.floor(pointsDiscount / 10) : undefined,
    });

    setIsProcessingPayment(false);

    if (transaction) {
      addToast("success", "Ticket purchased successfully!");
      navigate(`/transactions/${transaction.id}`);
    } else {
      addToast("error", "Failed to create transaction");
    }
  };

  if (loading && !currentEvent) {
    return (
      <div className="bg-[#131313] text-[#e5e2e1] min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#c0c1ff] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-[#c7c4d8]">Loading event...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#131313] text-[#e5e2e1] min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center">
          <span className="material-symbols-outlined text-6xl text-[#93000a]">
            error
          </span>
          <h2 className="text-2xl font-bold">Failed to load event</h2>
          <p className="text-[#c7c4d8]">{error}</p>
        </div>
      </div>
    );
  }

  if (!currentEvent) {
    return (
      <div className="bg-[#131313] text-[#e5e2e1] min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <span className="material-symbols-outlined text-6xl text-[#c7c4d8]">
            event_busy
          </span>
          <h2 className="text-2xl font-bold">Event not found</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#131313] text-[#e5e2e1] min-h-screen font-sans selection:bg-[#c0c1ff]/30">
      <main className="pt-16 min-h-screen">
        {/* Hero Section */}
        <section className="relative w-full h-[60vh] md:h-[614px] overflow-hidden">
          <img
            alt={currentEvent.name}
            className="w-full h-full object-cover"
            src={
              currentEvent.imageUrl ||
              "https://lh3.googleusercontent.com/aida-public/AB6AXuDdRDS19K5BkPJR_o2gLhL_xSButi1v__xH0YgKvN3kq9-HtpAvjR_2gAdUFjid84mEd0CaTu2Sq-c2J4pwmljaPxupQub4NmuRrlvhQpBgg2VnBlUlURuheitOpwPORiqygxSyVPs8qDWcudVps9rRxX1SIXgjUUBZj_yQzZFY27qefC5xmU9u0trPGRuD6wL-eHP_1j5Bf1CBqxODn823AnAbiLnf39GZwrsUL0CGfEoVnugGWZnzXmh1eqwNnOXh4TzEcX6BmU-X"
            }
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#131313] via-[#131313]/40 to-transparent"></div>

          <div className="absolute bottom-0 left-0 p-8 md:p-12 max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 mb-4"
            >
              <span className="bg-[#4b4dd8]/20 text-[#c0c1ff] px-3 py-1 text-xs font-bold uppercase tracking-widest rounded-lg">
                Featured Event
              </span>
              <span className="bg-[#353534] text-[#c7c4d8] px-3 py-1 text-xs font-bold uppercase tracking-widest rounded-lg">
                {currentEvent.category}
              </span>
            </motion.div>

            <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-[#e5e2e1] mb-6 leading-none">
              {currentEvent.name}
            </h1>

            <div className="flex flex-wrap gap-8 text-[#c7c4d8]">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[#c0c1ff]">
                  calendar_today
                </span>
                <div>
                  <p className="text-xs uppercase tracking-widest font-bold">
                    Date & Time
                  </p>
                  <p className="text-[#e5e2e1] font-medium">
                    {formatDate(currentEvent.startDate)}
                    {currentEvent.endDate &&
                      ` - ${formatDate(currentEvent.endDate)}`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[#c0c1ff]">
                  location_on
                </span>
                <div>
                  <p className="text-xs uppercase tracking-widest font-bold">
                    Location
                  </p>
                  <p className="text-[#e5e2e1] font-medium">
                    {currentEvent.location}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Content Grid */}
        <div className="px-8 py-16 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Kolom Kiri */}
          <div className="lg:col-span-7 space-y-12">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-[#c0c1ff] mb-6">
                The Experience
              </h2>
              <div className="text-lg text-[#c7c4d8] leading-relaxed space-y-6">
                <p>{currentEvent.description}</p>
              </div>
            </div>

            {/* Reviews Section */}
            {currentEventReviews.length > 0 ? (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-[#c0c1ff]">
                    Reviews
                  </h2>
                  {canWriteReview && userReview && (
                    <button
                      onClick={openReviewModal}
                      className="text-sm bg-[#353534] text-[#e5e2e1] px-4 py-2 rounded-lg font-medium hover:bg-[#4a4a4a] transition-colors"
                    >
                      Edit Review
                    </button>
                  )}
                  {canWriteReview && !userReview && (
                    <button
                      onClick={openReviewModal}
                      className="text-sm bg-[#c0c1ff] text-[#07006c] px-4 py-2 rounded-lg font-medium hover:bg-[#a0a1ef] transition-colors"
                    >
                      Write Review
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-3xl font-black text-[#e5e2e1]">
                      {averageRating.toFixed(1)}
                    </span>
                    <div className="flex flex-col">
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span
                            key={star}
                            className={`material-symbols-outlined text-lg ${star <= Math.round(averageRating) ? "text-[#c0c1ff]" : "text-[#353534]"}`}
                          >
                            star
                          </span>
                        ))}
                      </div>
                      <span className="text-xs text-[#c7c4d8]">
                        {currentEventReviews.length} reviews
                      </span>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  {currentEventReviews.slice(0, 5).map((review: Review) => (
                    <div
                      key={review.id}
                      className="bg-[#1c1b1b] p-5 rounded-lg border border-white/5"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#353534] flex items-center justify-center overflow-hidden">
                            {review.user?.profilePicture ? (
                              <img
                                src={review.user.profilePicture}
                                alt={review.user.fullName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="material-symbols-outlined text-[#c7c4d8]">
                                person
                              </span>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-[#e5e2e1]">
                              {review.user?.fullName || "Anonymous"}
                            </p>
                            <div className="flex gap-0.5 mt-0.5">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <span
                                  key={star}
                                  className={`material-symbols-outlined text-sm ${star <= review.rating ? "text-[#c0c1ff]" : "text-[#353534]"}`}
                                >
                                  star
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                        <span className="text-xs text-[#c7c4d8]">
                          {new Date(review.createdAt).toLocaleDateString(
                            "id-ID",
                            { day: "numeric", month: "short", year: "numeric" },
                          )}
                        </span>
                      </div>
                      <p className="text-sm text-[#c7c4d8] leading-relaxed">
                        {review.comment}
                      </p>
                    </div>
                  ))}
                  {currentEventReviews.length > 5 && (
                    <button className="text-sm text-[#c0c1ff] hover:underline">
                      View all {currentEventReviews.length} reviews
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-[#c0c1ff]">
                    Reviews
                  </h2>
                  {canWriteReview && userReview && (
                    <button
                      onClick={openReviewModal}
                      className="text-sm bg-[#353534] text-[#e5e2e1] px-4 py-2 rounded-lg font-medium hover:bg-[#4a4a4a] transition-colors"
                    >
                      Edit Review
                    </button>
                  )}
                  {canWriteReview && !userReview && (
                    <button
                      onClick={openReviewModal}
                      className="text-sm bg-[#c0c1ff] text-[#07006c] px-4 py-2 rounded-lg font-medium hover:bg-[#a0a1ef] transition-colors"
                    >
                      Write Review
                    </button>
                  )}
                </div>
                <div className="text-center py-8 px-4 bg-[#1c1b1b] rounded-lg border border-white/5">
                  <span className="material-symbols-outlined text-4xl text-[#c7c4d8] mb-3">
                    rate_review
                  </span>
                  <p className="text-[#c7c4d8] font-medium">No reviews yet</p>
                  <p className="text-sm text-[#666] mt-1">
                    {userReview ? "Your review is being counted" : "Be the first to review this event"}
                  </p>
                </div>
              </div>
            )}

            {/* Vouchers Section */}
            {currentEventVouchers.length > 0 && (
              <div>
                <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-[#c0c1ff] mb-6">
                  Available Vouchers
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {currentEventVouchers.map((voucher: Voucher) => (
                    <div
                      key={voucher.id}
                      className="bg-[#1c1b1b] p-4 rounded-lg border border-white/5 flex items-center justify-between"
                    >
                      <div>
                        <p className="font-mono font-bold text-[#e5e2e1]">
                          {voucher.code}
                        </p>
                        <p className="text-xs text-[#c7c4d8]">
                          {voucher.discountType === "PERCENTAGE"
                            ? `${voucher.discountValue}% OFF`
                            : `IDR ${voucher.discountValue.toLocaleString("id-ID")} OFF`}
                          {voucher.maxDiscount &&
                            ` (max IDR ${voucher.maxDiscount.toLocaleString("id-ID")})`}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(voucher.code);
                        }}
                        className="text-[#c0c1ff] hover:text-[#e5e2e1] p-2"
                        title="Copy code"
                      >
                        <span className="material-symbols-outlined text-lg">
                          content_copy
                        </span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[#1c1b1b] p-6 rounded-lg border border-white/5">
                <span className="material-symbols-outlined text-[#c0c1ff] mb-4">
                  event_seat
                </span>
                <h4 className="font-bold text-[#e5e2e1]">Available Seats</h4>
                <p className="text-sm text-[#c7c4d8]">
                  {currentEvent.availableSeats} of {currentEvent.totalSeats}{" "}
                  seats remaining
                </p>
              </div>
              <div className="bg-[#1c1b1b] p-6 rounded-lg border border-white/5">
                <span className="material-symbols-outlined text-[#c0c1ff] mb-4">
                  person
                </span>
                <h4 className="font-bold text-[#e5e2e1]">Organizer</h4>
                {currentEvent.organizer?.id ? (
                  <Link
                    to={`/organizer/${currentEvent.organizer.id}`}
                    className="text-sm text-[#c7c4d8] hover:text-[#c0c1ff] transition-colors"
                  >
                    {currentEvent.organizer?.fullName || "Event Organizer"}
                  </Link>
                ) : (
                  <p className="text-sm text-[#c7c4d8]">
                    {currentEvent.organizer?.fullName || "Event Organizer"}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Kolom Kanan: Checkout */}
          <div className="lg:col-span-5">
            <div className="sticky top-24 space-y-6">
              <div className="bg-[#2a2a2a] p-8 rounded-xl shadow-2xl border border-white/5">
                <h3 className="text-2xl font-bold tracking-tight text-[#e5e2e1] mb-8">
                  Select Tickets
                </h3>

                <div className="space-y-4">
                  {/* Render tickets dynamically from currentEvent.tickets */}
                  {[
                    ...(generalTicket ? [generalTicket] : []),
                    ...(vipTicket ? [vipTicket] : []),
                  ].map((ticket) => {
                    const isVIP = ticket.type === "VIP";
                    const quantity = ticketQuantities[ticket.id] || 0;

                    return (
                      <div
                        key={ticket.id}
                        className={`p-5 bg-[#1c1b1b] rounded-lg border transition-all ${quantity > 0 ? "border-[#c0c1ff]" : "border-transparent"} ${isVIP && quantity > 0 ? "shadow-[0_0_20px_rgba(192,193,255,0.1)]" : ""}`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-[#e5e2e1]">
                                {ticket.type}
                              </h4>
                              {isVIP && (
                                <span className="material-symbols-outlined text-[#c0c1ff] text-sm">
                                  stars
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-[#c7c4d8]">
                              {ticket.description || (isVIP ? "Lounge, open bar, artist meet" : "Standard floor access")}
                            </p>
                          </div>
                          <span className="text-[#c0c1ff] font-black">
                            {formatIDR(ticket.price)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-4">
                          <span className={`text-xs px-2 py-0.5 rounded ${isVIP ? "text-[#c0c1ff] bg-[#c0c1ff]/10" : "text-[#ffdad6] bg-[#93000a]/30"}`}>
                            {isVIP ? "Most Popular" : (currentEvent.availableSeats > 10 ? "Available" : "Low Stock")}
                          </span>
                          <div className="flex items-center gap-4 bg-[#353534] px-3 py-1 rounded-full">
                            <button
                              onClick={() => handleUpdateTicket(ticket.id, -1)}
                              disabled={quantity === 0}
                              className="text-[#c7c4d8] hover:text-[#c0c1ff] disabled:opacity-30"
                            >
                              <span className="material-symbols-outlined text-lg">
                                remove
                              </span>
                            </button>
                            <span className="font-bold min-w-[1rem] text-center">
                              {quantity}
                            </span>
                            <button
                              onClick={() => handleUpdateTicket(ticket.id, 1)}
                              className="text-[#c7c4d8] hover:text-[#c0c1ff]"
                            >
                              <span className="material-symbols-outlined text-lg">
                                add
                              </span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Fallback: If no tickets from backend, render default tickets */}
                  {(getEventTickets().length === 0 || (!generalTicket && !vipTicket)) && (
                    <>
                      {/* Default General Ticket */}
                      <div
                        className={`p-5 bg-[#1c1b1b] rounded-lg border transition-all ${(ticketQuantities["general"] || 0) > 0 ? "border-[#c0c1ff]" : "border-transparent"}`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-bold text-[#e5e2e1]">
                              General Admission
                            </h4>
                            <p className="text-xs text-[#c7c4d8]">
                              Standard floor access
                            </p>
                          </div>
                          <span className="text-[#c0c1ff] font-black">
                            {formatIDR(eventBasePrice)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-4">
                          <span className="text-xs text-[#ffdad6] bg-[#93000a]/30 px-2 py-0.5 rounded">
                            {currentEvent.availableSeats > 10 ? "Available" : "Low Stock"}
                          </span>
                          <div className="flex items-center gap-4 bg-[#353534] px-3 py-1 rounded-full">
                            <button
                              onClick={() => handleUpdateTicket("general", -1)}
                              disabled={(ticketQuantities["general"] || 0) === 0}
                              className="text-[#c7c4d8] hover:text-[#c0c1ff] disabled:opacity-30"
                            >
                              <span className="material-symbols-outlined text-lg">
                                remove
                              </span>
                            </button>
                            <span className="font-bold min-w-[1rem] text-center">
                              {ticketQuantities["general"] || 0}
                            </span>
                            <button
                              onClick={() => handleUpdateTicket("general", 1)}
                              className="text-[#c7c4d8] hover:text-[#c0c1ff]"
                            >
                              <span className="material-symbols-outlined text-lg">
                                add
                              </span>
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Default VIP Ticket */}
                      <div
                        className={`p-5 bg-[#1c1b1b] rounded-lg border transition-all ${(ticketQuantities["vip"] || 0) > 0 ? "border-[#c0c1ff] shadow-[0_0_20px_rgba(192,193,255,0.1)]" : "border-transparent"}`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-[#e5e2e1]">
                                VIP Experience
                              </h4>
                              <span className="material-symbols-outlined text-[#c0c1ff] text-sm">
                                stars
                              </span>
                            </div>
                            <p className="text-xs text-[#c7c4d8]">
                              Priority entry, VIP lounge
                            </p>
                          </div>
                          <span className="text-[#c0c1ff] font-black">
                            {formatIDR(eventBasePrice * 2.5)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-4">
                          <span className="text-xs text-[#c0c1ff] bg-[#c0c1ff]/10 px-2 py-0.5 rounded">
                            Most Popular
                          </span>
                          <div className="flex items-center gap-4 bg-[#353534] px-3 py-1 rounded-full">
                            <button
                              onClick={() => handleUpdateTicket("vip", -1)}
                              disabled={(ticketQuantities["vip"] || 0) === 0}
                              className="text-[#c7c4d8] hover:text-[#c0c1ff] disabled:opacity-30"
                            >
                              <span className="material-symbols-outlined text-lg">
                                remove
                              </span>
                            </button>
                            <span className="font-bold min-w-[1rem] text-center">
                              {ticketQuantities["vip"] || 0}
                            </span>
                            <button
                              onClick={() => handleUpdateTicket("vip", 1)}
                              className="text-[#c7c4d8] hover:text-[#c0c1ff]"
                            >
                              <span className="material-symbols-outlined text-lg">
                                add
                              </span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <div className="mt-10 pt-6 border-t border-white/10">
                  {/* Voucher Input */}
                  <div className="mb-6">
                    <label className="text-xs uppercase tracking-widest font-bold text-[#c7c4d8] mb-2 block">
                      Have a voucher?
                    </label>
                    {appliedDiscount > 0 ? (
                      <div className="flex items-center justify-between bg-[#1c3a1c] border border-green-500/30 p-3 rounded-lg">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-green-400">
                            check_circle
                          </span>
                          <span className="text-green-400 font-medium">
                            -{formatIDR(appliedDiscount)} applied
                          </span>
                        </div>
                        <button
                          onClick={handleRemoveVoucher}
                          className="text-green-400 hover:text-green-300"
                        >
                          <span className="material-symbols-outlined text-lg">
                            close
                          </span>
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={voucherCode}
                          onChange={(e) =>
                            setVoucherCode(e.target.value.toUpperCase())
                          }
                          placeholder="Enter voucher code"
                          className="flex-1 bg-[#1c1b1b] border border-white/10 rounded-lg px-4 py-3 text-[#e5e2e1] placeholder-[#c7c4d8]/50 focus:outline-none focus:border-[#c0c1ff]"
                        />
                        <button
                          onClick={handleApplyVoucher}
                          disabled={!voucherCode.trim() || isApplyingVoucher}
                          className="bg-[#353534] text-[#e5e2e1] px-4 py-3 rounded-lg font-medium hover:bg-[#4a4a4a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {isApplyingVoucher ? (
                            <span className="material-symbols-outlined animate-spin">
                              sync
                            </span>
                          ) : (
                            "Apply"
                          )}
                        </button>
                      </div>
                    )}
                    {voucherError && (
                      <p className="text-xs text-[#93000a] mt-2">
                        {voucherError}
                      </p>
                    )}
                  </div>

                  {/* Coupon Input */}
                  <div className="mb-6">
                    <label className="text-xs uppercase tracking-widest font-bold text-[#c7c4d8] mb-2 block">
                      Have a coupon?
                    </label>
                    {appliedCouponDiscount > 0 ? (
                      <div className="flex items-center justify-between bg-[#1c3a1c] border border-green-500/30 p-3 rounded-lg">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-green-400">
                            check_circle
                          </span>
                          <span className="text-green-400 font-medium">
                            -{formatIDR(appliedCouponDiscount)} applied
                          </span>
                        </div>
                        <button
                          onClick={handleRemoveCoupon}
                          className="text-green-400 hover:text-green-300"
                        >
                          <span className="material-symbols-outlined text-lg">close</span>
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                          placeholder="Enter coupon code"
                          className="flex-1 bg-[#1c1b1b] border border-white/10 rounded-lg px-4 py-3 text-[#e5e2e1] placeholder-[#c7c4d8]/50 focus:outline-none focus:border-[#c0c1ff]"
                        />
                        <button
                          onClick={handleApplyCoupon}
                          disabled={!couponCode.trim() || isApplyingCoupon}
                          className="bg-[#353534] text-[#e5e2e1] px-4 py-3 rounded-lg font-medium hover:bg-[#4a4a4a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {isApplyingCoupon ? (
                            <span className="material-symbols-outlined animate-spin">sync</span>
                          ) : (
                            "Apply"
                          )}
                        </button>
                      </div>
                    )}
                    {couponError && (
                      <p className="text-xs text-[#93000a] mt-2">{couponError}</p>
                    )}
                  </div>

                  {/* Points Section */}
                  {isAuthenticated && userPoints > 0 && (
                    <div className="mb-6 bg-[#1c1b1b] p-4 rounded-lg border border-white/5">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-[#c0c1ff]">
                            stars
                          </span>
                          <span className="text-[#c7c4d8] font-medium">Use Points</span>
                          <span className="text-xs bg-[#c0c1ff]/10 text-[#c0c1ff] px-2 py-0.5 rounded-full">
                            {userPoints.toLocaleString()} pts
                          </span>
                        </div>
                        <button
                          onClick={() => setUsePoints(!usePoints)}
                          disabled={userPoints === 0}
                          className={`w-12 h-6 rounded-full relative transition-colors duration-200 ${usePoints ? "bg-[#c0c1ff]" : "bg-[#353534]"} ${userPoints === 0 ? "opacity-50" : ""}`}
                        >
                          <span
                            className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${usePoints ? "left-7" : "left-1"}`}
                          ></span>
                        </button>
                      </div>
                      {usePoints && pointsDiscount > 0 && (
                        <p className="text-xs text-[#c0c1ff] mt-2">
                          You will save {formatIDR(pointsDiscount)}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[#c7c4d8] font-medium">Subtotal</span>
                    {appliedDiscount > 0 ? (
                      <div className="text-right">
                        <span className="text-sm text-[#c7c4d8] line-through">
                          {formatIDR(total)}
                        </span>
                        <span className="text-lg font-bold text-[#e5e2e1] block">
                          {formatIDR(totalWithDiscount)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-lg font-bold text-[#e5e2e1]">
                        {formatIDR(total)}
                      </span>
                    )}
                  </div>
                  {usePoints && pointsDiscount > 0 && (
                    <div className="flex justify-between items-center mb-4 text-sm">
                      <span className="text-[#c7c4d8]">Points Discount</span>
                      <span className="text-[#c0c1ff]">-{formatIDR(pointsDiscount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center mb-6 pt-4 border-t border-white/10">
                    <span className="text-[#c7c4d8] font-medium">Total</span>
                    <span className="text-2xl md:text-3xl font-black text-[#e5e2e1] tracking-tighter">
                      {formatIDR(finalTotal)}
                    </span>
                  </div>
                  {/* Purchase Button */}
                  {(() => {
                    const hasSelectedTickets = Object.values(ticketQuantities).reduce((sum, qty) => sum + qty, 0) > 0 || 
                      (getEventTickets().length === 0 && !generalTicket && !vipTicket && ((ticketQuantities["general"] || 0) + (ticketQuantities["vip"] || 0) > 0));
                    
                    const isEventPastOrOngoing = eventStatus === "past" || eventStatus === "ongoing";
                    
                    const getButtonText = () => {
                      if (eventStatus === "past") return "Event Ended";
                      if (eventStatus === "ongoing") return "Event Started";
                      if (!hasSelectedTickets) return "Select at least 1 ticket";
                      return "Purchase Tickets";
                    };

                    if (isEventPastOrOngoing || !hasSelectedTickets) {
                      return (
                        <button
                          disabled
                          className="w-full py-4 bg-[#353534] text-[#666] font-bold rounded-lg cursor-not-allowed"
                        >
                          {getButtonText()}
                        </button>
                      );
                    }

                    return (
                      <button
                        onClick={handlePurchase}
                        disabled={isProcessingPayment}
                        className="w-full py-4 bg-gradient-to-r from-[#c0c1ff] to-[#4b4dd8] text-[#07006c] font-bold rounded-lg transition-all hover:opacity-90 active:scale-[0.98] shadow-lg shadow-primary/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {isProcessingPayment ? (
                          <>
                            <span className="material-symbols-outlined animate-spin">sync</span>
                            Processing...
                          </>
                        ) : (
                          "Purchase Tickets"
                        )}
                      </button>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Review Modal */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => {
              setIsReviewModalOpen(false);
              setEditingReview(null);
            }}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative bg-[#1c1b1b] p-6 rounded-xl border border-white/10 w-full max-w-md"
          >
            <button
              onClick={() => {
                setIsReviewModalOpen(false);
                setEditingReview(null);
              }}
              className="absolute top-4 right-4 text-[#c7c4d8] hover:text-[#e5e2e1]"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
            <h3 className="text-xl font-bold text-[#e5e2e1] mb-6">
              {editingReview ? "Edit Review" : "Write a Review"}
            </h3>

            {/* Rating */}
            <div className="mb-6">
              <label className="text-xs uppercase tracking-widest font-bold text-[#c7c4d8] mb-3 block">
                Rating
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setReviewRating(star)}
                    className="p-1 transition-transform hover:scale-110"
                  >
                    <span
                      className={`material-symbols-outlined text-3xl ${
                        star <= reviewRating
                          ? "text-[#c0c1ff]"
                          : "text-[#353534]"
                      }`}
                    >
                      star
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Comment */}
            <div className="mb-6">
              <label className="text-xs uppercase tracking-widest font-bold text-[#c7c4d8] mb-3 block">
                Your Review
              </label>
              <textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Share your experience at this event..."
                className="w-full h-32 bg-[#131313] border border-white/10 rounded-lg px-4 py-3 text-[#e5e2e1] placeholder-[#c7c4d8]/50 focus:outline-none focus:border-[#c0c1ff] resize-none"
                maxLength={500}
              />
              <p className="text-xs text-[#666] mt-2 text-right">
                {reviewComment.length}/500
              </p>
            </div>

            {/* Submit */}
            <button
              onClick={handleSubmitReview}
              disabled={
                isSubmittingReview ||
                reviewRating === 0 ||
                !reviewComment.trim()
              }
              className="w-full py-3 bg-gradient-to-r from-[#c0c1ff] to-[#4b4dd8] text-[#07006c] font-bold rounded-lg transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmittingReview ? (
                <span className="material-symbols-outlined animate-spin">
                  sync
                </span>
              ) : (
                editingReview ? "Update Review" : "Submit Review"
              )}
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default EventDetailPage;
