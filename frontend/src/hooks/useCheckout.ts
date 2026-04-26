import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useEventStore } from "../stores/useEventStore";
import { useTransactionStore } from "../stores/useTransactionStore";
import { useAuthStore } from "../stores/useAuthStore";
import { useToastStore } from "../stores/useToastStore";
import { calculateSubtotal, calculateFinalPrice, calculateVoucherDiscount } from "../lib/priceCalculator";
import { POINTS_CONFIG } from "../lib/constants";
import { reviewsVouchersService } from "../services/api";



export function useCheckout() {
  const { id: eventId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const abortControllerRef = useRef<AbortController | null>(null);

  const { currentEvent, fetchEventById, clearCurrentEvent } = useEventStore();
  const { createTransaction, loading: transactionLoading } = useTransactionStore();
  const { user, isAuthenticated } = useAuthStore();
  const { addToast } = useToastStore();

  // State untuk ticket selection
  const [selectedTickets, setSelectedTickets] = useState<Record<string, number>>({});

  // State untuk unified promo code (voucher + coupon)
  const [promoCode, setPromoCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [promoType, setPromoType] = useState<"voucher" | "coupon" | null>(null);
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);

  // State untuk menyimpan promo aktif
  const [activePromo, setActivePromo] = useState<{
    code: string;
    type: "voucher" | "coupon";
    discountType: "PERCENTAGE" | "FIXED";
    discountValue: number;
  } | null>(null);

  // Separate states for backend payload (internal)
  const [voucherCode, setVoucherCode] = useState("");
  const [couponCode, setCouponCode] = useState("");

  // State untuk points
  const [pointsToUse, setPointsToUse] = useState(0);
  const [userPoints, setUserPoints] = useState(0);

  // Loading state
  const [isLoading, setIsLoading] = useState(true);

  // Get tickets from current event
  const tickets = currentEvent?.tickets ?? [];

  const pointsDiscount = pointsToUse * POINTS_CONFIG.POINT_VALUE; // 1 poin = Rp1

  // Hitung subtotal dinamis berdasarkan tiket yang dipilih
  const subtotal = Object.entries(selectedTickets).reduce((sum, [ticketId, qty]) => {
    const ticket = tickets.find(t => t.id === ticketId);
    return sum + (ticket?.price ?? 0) * qty;
  }, 0);
  const total = calculateFinalPrice(subtotal, appliedDiscount, 0, pointsDiscount);

  const handleUpdateTicket = (ticketId: string, delta: number) => {
    const ticket = tickets.find(t => t.id === ticketId);
    if (!ticket) return;

    setSelectedTickets(prev => {
      const currentQty = prev[ticketId] || 0;
      const newQty = currentQty + delta;

      // Validate: tidak boleh kurang dari 0
      if (newQty < 0) return prev;

      // Validate: tidak boleh lebih dari available
      if (newQty > ticket.availableQuantity) {
        addToast("error", `Maksimal ${ticket.availableQuantity} tiket tersedia`);
        return prev;
      }

      // Enforce single ticket type: jika quantity > 0, reset tiket lain
      if (newQty > 0) {
        return { [ticketId]: newQty };
      } else {
        const { [ticketId]: _, ...rest } = prev;
        return rest;
      }
    });
  };

  const handleApplyPromoCode = async () => {
    if (!promoCode.trim() || !eventId) return;

    const totalQuantity = Object.values(selectedTickets).reduce((sum, qty) => sum + qty, 0);
    if (totalQuantity === 0) {
      addToast("error", "Please select at least one ticket first");
      return;
    }

    // Unit price dari tiket yang dipilih (ambil tiket pertama yang dipilih)
    const selectedTicketId = Object.keys(selectedTickets).find(id => selectedTickets[id] > 0);
    const selectedTicket = tickets.find(t => t.id === selectedTicketId);
    const unitPrice = selectedTicket?.price ?? 0;

    setIsApplyingPromo(true);
    try {
      // 1. Coba Voucher (event-specific)
      try {
        const { validateVoucher } = useEventStore.getState();
        const result = await validateVoucher(eventId, promoCode, unitPrice, totalQuantity);
        if (result.discount > 0) {
          setActivePromo({
            code: promoCode,
            type: "voucher",
            discountType: result.discountType!,
            discountValue: result.discountValue!,
          });
          setPromoType("voucher");
          setVoucherCode(promoCode); // untuk payload backend
          addToast("success", "Voucher applied successfully!");
          return;
        }
      } catch (err) {
        // ignore, lanjut ke coupon
      }

      // 2. Fallback ke Coupon (system-wide)
      try {
        const response = await reviewsVouchersService.validateCoupon(promoCode, unitPrice, totalQuantity);
        if (response.success && response.valid && response.discount! > 0) {
          setActivePromo({
            code: promoCode,
            type: "coupon",
            discountType: response.discountType!,
            discountValue: response.discountValue!,
          });
          setPromoType("coupon");
          setCouponCode(promoCode); // untuk payload backend
          addToast("success", "Coupon applied successfully!");
          return;
        }
      } catch (err) {
        // both failed
      }

      addToast("error", "Invalid promo code");
      setAppliedDiscount(0);
      setPromoType(null);
    } finally {
      setIsApplyingPromo(false);
    }
  };

  const handleRemovePromo = () => {
    setPromoCode("");
    setActivePromo(null);
    setPromoType(null);
    setVoucherCode("");
    setCouponCode("");
    // appliedDiscount akan di-reset oleh useEffect
  };

  const handleProceedToPayment = async () => {
    if (!isAuthenticated) {
      addToast("error", "Please login to continue");
      const fromPath = window.location.pathname;
      const navOptions = { state: { from: fromPath } };
      navigate("/login", navOptions);
      return;
    }

    if (!eventId) {
      addToast("error", "Event not found");
      return;
    }

    const totalQuantity = Object.values(selectedTickets).reduce((sum, qty) => sum + qty, 0);
    if (totalQuantity === 0) {
      addToast("error", "Please select at least 1 ticket");
      return;
    }

    // Validate points before proceeding
    if (pointsToUse > 0) {
      if (pointsToUse > userPoints) {
        addToast("error", "Saldo poin tidak cukup");
        return;
      }
      if (pointsToUse > POINTS_CONFIG.MAX_PER_TRANSACTION) {
        addToast("error", `Maksimal ${POINTS_CONFIG.MAX_PER_TRANSACTION.toLocaleString()} poin per transaksi`);
        return;
      }
    }

     // Determine ticket ID from selected tickets (single tier enforced)
     const selectedTicketId = Object.keys(selectedTickets).find(id => selectedTickets[id] > 0);
     if (!selectedTicketId) {
       addToast("error", "Please select a ticket type");
       return;
     }
     const ticketId = selectedTicketId;

    try {
       const transaction = await createTransaction({
         eventId,
         ticketId: ticketId,
         quantity: totalQuantity,
         voucherCode: activePromo?.type === "voucher" ? activePromo.code : undefined,
         couponCode: activePromo?.type === "coupon" ? activePromo.code : undefined,
         pointsUsed: pointsToUse > 0 ? pointsToUse : undefined,
       });

      if (transaction) {
        addToast("success", "Transaction created! Redirecting...");
        navigate(`/transactions/${transaction.id}`);
      } else {
        addToast("error", "Failed to create transaction");
      }
    } catch (err) {
      addToast("error", "Failed to create transaction");
    }
  };

  useEffect(() => {
    if (eventId) {
      setIsLoading(true);
      fetchEventById(eventId).finally(() => setIsLoading(false));
    }
    return () => {
      clearCurrentEvent();
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [eventId]);

  useEffect(() => {
    if (user?.points) {
      setUserPoints(user.points);
    }
  }, [user]);

  // Recalculate discount whenever ticket selection changes AND promo is active
  useEffect(() => {
    if (!activePromo) {
      setAppliedDiscount(0);
      return;
    }

    const totalQuantity = Object.values(selectedTickets).reduce((sum, qty) => sum + qty, 0);
    if (totalQuantity === 0) {
      setAppliedDiscount(0);
      return;
    }

    // Get the selected ticket's price (assuming only one ticket type allowed)
    const selectedTicketId = Object.keys(selectedTickets).find(id => selectedTickets[id] > 0);
    const selectedTicket = tickets.find(t => t.id === selectedTicketId);
    if (!selectedTicket) {
      setAppliedDiscount(0);
      return;
    }

    const subtotal = selectedTicket.price * totalQuantity;
    const newDiscount = calculateVoucherDiscount(
      subtotal,
      activePromo.discountValue,
      activePromo.discountType
    );
    setAppliedDiscount(newDiscount);
  }, [selectedTickets, tickets, activePromo]);

  return {
    eventId,
    currentEvent,
    isLoading,
    selectedTickets,
    tickets,
    promoCode,
    appliedDiscount,
    promoType,
    isApplyingPromo,
    activePromo,
    pointsToUse,
    userPoints,
    pointsDiscount,
    subtotal,
    total,
    transactionLoading,
    handleUpdateTicket,
    handleApplyPromoCode,
    handleRemovePromo,
    handleProceedToPayment,
    setPointsToUse,
    setPromoCode,
  };
}
