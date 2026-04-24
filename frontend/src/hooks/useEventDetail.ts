import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useEventStore } from "../stores/useEventStore";
import { useAuthStore } from "../stores/useAuthStore";
import { useCartStore } from "../stores/useCartStore";
import { getEventStatus } from "../lib/eventUtils";
import { useToastStore } from "../stores/useToastStore";

/**
 * Interface untuk pilihan jumlah tiket
 */
interface TicketSelection {
  general: number;
  vip: number;
}

/**
 * Custom hook untuk mengelola seluruh logika di halaman Detail Event.
 * Menangani pemilihan tiket, validasi voucher, add to cart,
 * dan sistem review event.
 */
interface UseEventDetailReturn {
  event: any;
  loading: boolean;
  error: string | null;
  selectedTickets: TicketSelection;
  voucherCode: string;
  couponCode: string;
  voucherError: string | null;
  couponError: string | null;
  discount: number;
  totalPrice: number;
  isReviewModalOpen: boolean;
  userReview: { rating: number; comment: string };
  isSubmittingReview: boolean;
  hasUserReviewed: boolean;
  eventStatus: string;
  averageRating: number;
  setSelectedTickets: (tickets: TicketSelection) => void;
  setVoucherCode: (code: string) => void;
  setCouponCode: (code: string) => void;
  applyVoucher: () => void;
  applyCoupon: () => void;
  addToCart: () => void;
  openReviewModal: () => void;
  closeReviewModal: () => void;
  setUserReview: (review: { rating: number; comment: string }) => void;
  submitReview: () => Promise<void>;
}

export const useEventDetail = (): UseEventDetailReturn => {
  // --- Ambil dependencies dari router dan store ---
  const { id } = useParams<{ id: string }>();
  const { fetchEventById, currentEvent, loadingEvent, submitReview } = useEventStore();
  const { user } = useAuthStore();
  const { addItem } = useCartStore();
  const addToast = useToastStore(state => state.addToast);

  // --- Local States ---
  const [selectedTickets, setSelectedTickets] = useState<TicketSelection>({ general: 0, vip: 0 });
  const [voucherCode, setVoucherCode] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [voucherError, setVoucherError] = useState<string | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [discount, setDiscount] = useState(0);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [userReview, setUserReview] = useState({ rating: 5, comment: "" });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  /**
   * Mengambil data event saat halaman pertama kali dimuat
   */
  useEffect(() => {
    if (id) {
      fetchEventById(id);
    }
  }, [id, fetchEventById]);

  // --- Perhitungan Data Tambahan Event ---
  const eventStatus = currentEvent ? getEventStatus(currentEvent) : "Unknown";
  const averageRating = (currentEvent?.reviews?.length ?? 0) > 0
    ? (currentEvent?.reviews?.reduce((sum: number, r: any) => sum + r.rating, 0) ?? 0) / (currentEvent?.reviews?.length ?? 1)
    : 0;
  const hasUserReviewed = !!user && !!(currentEvent?.reviews?.some((r: any) => r.userId === user.id));
  
  // Hitung total harga secara realtime setiap perubahan pilihan tiket
  const totalPrice = selectedTickets.general * (currentEvent?.price ?? 0) +
    selectedTickets.vip * (currentEvent?.vipPrice ?? currentEvent?.price ?? 0) - discount;

  /**
   * Handler untuk memvalidasi dan mengaplikasikan kode voucher
   */
  const applyVoucher = useCallback(() => {
    if (!voucherCode.trim()) {
      setVoucherError("Voucher code is required");
      return;
    }

    if (voucherCode.toUpperCase() === "DISKON50") {
      const discountAmount = Math.floor(totalPrice * 0.5);
      setDiscount(discountAmount);
      setVoucherError(null);
      addToast("success", "Voucher applied! 50% discount");
    } else {
      setVoucherError("Invalid voucher code");
    }
  }, [voucherCode, totalPrice]);

  /**
   * Handler untuk memvalidasi dan mengaplikasikan kode kupon
   */
  const applyCoupon = useCallback(() => {
    if (!couponCode.trim()) {
      setCouponError("Coupon code is required");
      return;
    }

    if (couponCode.toUpperCase() === "PROMO10") {
      setDiscount(10000);
      setCouponError(null);
      addToast("success", "Coupon applied! Rp 10.000 discount");
    } else {
      setCouponError("Invalid coupon code");
    }
  }, [couponCode]);

  /**
   * Handler untuk menambahkan tiket yang dipilih ke keranjang
   */
  const addToCart = useCallback(() => {
    if (selectedTickets.general === 0 && selectedTickets.vip === 0) {
      addToast("error", "Please select at least one ticket");
      return;
    }

    if (!currentEvent) return;

    // Tambahkan tiket general ke keranjang jika ada
    if (selectedTickets.general > 0) {
      addItem({
        eventId: currentEvent.id,
        eventName: currentEvent.name,
        eventImage: currentEvent.imageUrl ?? '',
        ticketType: "GENERAL",
        quantity: selectedTickets.general,
        price: currentEvent.price,
      });
    }

    // Tambahkan tiket VIP ke keranjang jika ada
    if (selectedTickets.vip > 0) {
      addItem({
        eventId: currentEvent.id,
        eventName: currentEvent.name,
        eventImage: currentEvent.imageUrl ?? '',
        ticketType: "VIP",
        quantity: selectedTickets.vip,
        price: currentEvent.vipPrice ?? currentEvent.price,
      });
    }

    addToast("success", "Tickets added to cart!");
  }, [selectedTickets, currentEvent, addItem]);

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
    event: currentEvent,
    loading: loadingEvent,
    error: null,
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
    submitReview: submitReviewHandler,
  };
};
