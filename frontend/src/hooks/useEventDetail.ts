import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useEventStore } from "../stores/useEventStore";
import { useAuthStore } from "../stores/useAuthStore";
import { getEventStatus } from "../lib/eventUtils";
import { useToastStore } from "../stores/useToastStore";
import axiosInstance from "../lib/axiosInstance";

/**
 * Custom hook untuk mengelola seluruh logika di halaman Detail Event.
 * Implements direct transaction flow: navigates directly to checkout instead of using cart.
 * Handles review system with purchase verification for authenticated users.
 */
interface UseEventDetailReturn {
  event: any;
  loading: boolean;
  error: string | null;
  isReviewModalOpen: boolean;
  userReview: { rating: number; comment: string };
  isSubmittingReview: boolean;
  hasUserReviewed: boolean;
  canUserReview: boolean;
  eventStatus: string;
  averageRating: number;
  handleBuyNow: () => void;
  openReviewModal: () => void;
  closeReviewModal: () => void;
  setUserReview: (review: { rating: number; comment: string }) => void;
  submitReview: () => Promise<void>;
}

export const useEventDetail = (): UseEventDetailReturn => {
  // --- Ambil dependencies dari router dan store ---
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { fetchEventById, currentEvent, loadingEvent, submitReview } = useEventStore();
  const { user } = useAuthStore();
  const addToast = useToastStore(state => state.addToast);

  // --- Local States ---
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [userReview, setUserReview] = useState({ rating: 5, comment: "" });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [canUserReview, setCanUserReview] = useState(false);

  /**
   * Mengambil data event dan check purchase status saat halaman pertama kali dimuat
   */
  useEffect(() => {
    if (id) {
      fetchEventById(id);
    }
    // Check if user has purchased this event for review permission
    if (user && id) {
      checkUserPurchase();
    }
  }, [id, fetchEventById, user]);

  /**
   * Check if user has purchased tickets for this event
   */
  const checkUserPurchase = useCallback(async () => {
    try {
      const { data } = await axiosInstance.get(`/transactions/check-purchase/${id}`);
      setCanUserReview(data.hasPurchased);
    } catch (error) {
      console.error("Failed to check purchase status:", error);
      setCanUserReview(false);
    }
  }, [id]);

  // --- Data Transformation ---
  const transformedEvent = currentEvent ? {
    ...currentEvent,
    // Transform tickets: map available -> availableQuantity
    tickets: currentEvent.tickets?.map(ticket => ({
      ...ticket,
      availableQuantity: ticket.available,
    })) || [],
    // Transform reviews: flatten user data and remove nested user object
    reviews: currentEvent.reviews?.map(review => ({
      ...review,
      userAvatar: review.userImage,  // ✅ Use flattened field from backend
      userName: review.userName || 'Anonymous',  // ✅ Use flattened field from backend
      user: undefined,
    })) || [],
  } : null;

  // --- Perhitungan Data Tambahan Event ---
  const eventStatus = transformedEvent ? getEventStatus(transformedEvent) : "Unknown";
  // Use backend-calculated averageRating if available, fallback to manual calculation
  const averageRating = transformedEvent?.averageRating ??
    ((transformedEvent?.reviews?.length ?? 0) > 0
      ? (transformedEvent?.reviews?.reduce((sum: number, r: any) => sum + r.rating, 0) ?? 0) / (transformedEvent?.reviews?.length ?? 1)
      : 0);
  const hasUserReviewed = !!user && !!(transformedEvent?.reviews?.some((r: any) => r.userId === user.id));

  // canUserReview is set by checkUserPurchase API call

  /**
   * Handler untuk navigasi langsung ke halaman checkout dengan authentication check.
   * Redirects unauthenticated users to login with return path preserved.
   * Part of direct transaction flow - bypasses cart entirely.
   */
  const handleBuyNow = useCallback(() => {
    if (!id) return;

    if (!user) {
      // Redirect to login with return path
      const returnPath = encodeURIComponent(location.pathname);
      navigate(`/login?returnUrl=${returnPath}`);
      addToast("info", "Please login to purchase tickets");
      return;
    }

    navigate(`/checkout/${id}`);
  }, [id, navigate, user, location.pathname, addToast]);

  /**
   * Membuka modal review event
   */
  const openReviewModal = useCallback(() => {
    setIsReviewModalOpen(true);
  }, []);

  /**
   * Menutup modal review dan reset form
   */
  const closeReviewModal = useCallback(() => {
    setIsReviewModalOpen(false);
    setUserReview({ rating: 5, comment: "" });
  }, []);

  /**
   * Handler untuk mengirim review event ke backend
   */
  const submitReviewHandler = useCallback(async () => {
    if (!userReview.comment.trim()) {
      addToast("error", "Please write a review comment");
      return;
    }

    setIsSubmittingReview(true);
    try {
      await submitReview(id!, userReview.rating, userReview.comment);
      addToast("success", "Review submitted successfully!");
      closeReviewModal();
    } catch (err) {
      addToast("error", "Failed to submit review");
    } finally {
      setIsSubmittingReview(false);
    }
  }, [id, userReview, submitReview, closeReviewModal]);

  // Kembalikan semua state dan fungsi ke komponen
  return {
    event: transformedEvent,
    loading: loadingEvent,
    error: null,
    isReviewModalOpen,
    userReview,
    isSubmittingReview,
    hasUserReviewed,
    canUserReview: !!user && canUserReview, // Only allow review if user is logged in and has purchased
    eventStatus,
    averageRating,
    handleBuyNow,
    openReviewModal,
    closeReviewModal,
    setUserReview,
    submitReview: submitReviewHandler,
  };
};
