import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useEventStore } from "../stores/useEventStore";
import { useTransactionStore } from "../stores/useTransactionStore";
import { useAuthStore } from "../stores/useAuthStore";
import { useToastStore } from "../stores/useToastStore";
import { calculateSubtotal, calculateFinalPrice } from "../lib/priceCalculator";

interface SelectedTickets {
  general: number;
  vip: number;
}

export function useCheckout() {
  const { id: eventId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const abortControllerRef = useRef<AbortController | null>(null);

  const { currentEvent, fetchEventById, clearCurrentEvent } = useEventStore();
  const { createTransaction, loading: transactionLoading } = useTransactionStore();
  const { user, isAuthenticated } = useAuthStore();
  const { addToast } = useToastStore();

  // State untuk ticket selection
  const [selectedTickets, setSelectedTickets] = useState<SelectedTickets>({
    general: 0,
    vip: 0,
  });

  // State untuk voucher
  const [voucherCode, setVoucherCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [isApplyingVoucher, setIsApplyingVoucher] = useState(false);

  // State untuk coupon
  const [couponCode, setCouponCode] = useState("");
  const [appliedCouponDiscount, setAppliedCouponDiscount] = useState(0);

  // State untuk points
  const [pointsToUse, setPointsToUse] = useState(0);
  const [userPoints, setUserPoints] = useState(0);

  // Loading state
  const [isLoading, setIsLoading] = useState(true);

  // Get prices from event tickets using type field
  const generalTicket = currentEvent?.tickets?.find((t) => t.type === "GENERAL");
  const vipTicket = currentEvent?.tickets?.find((t) => t.type === "VIP");
  const eventBasePrice = currentEvent?.price || 450000;
  
  const priceGeneral = generalTicket?.price ?? eventBasePrice;
  const priceVIP = vipTicket?.price ?? eventBasePrice * 2.5;
  
  const pointsDiscount = pointsToUse; // 1 poin = 1 IDR

  // Hitung totals menggunakan priceCalculator
  const ticketPrices = [
    { price: priceGeneral, quantity: selectedTickets.general },
    { price: priceVIP, quantity: selectedTickets.vip },
  ];
  const subtotal = calculateSubtotal(ticketPrices);
  const total = calculateFinalPrice(subtotal, appliedDiscount, appliedCouponDiscount, pointsDiscount);

  const handleUpdateTicket = (type: "general" | "vip", delta: number) => {
    const ticket = type === "general" ? generalTicket : vipTicket;
    const availableQuantity = ticket?.availableQuantity ?? currentEvent?.availableSeats ?? 0;
    
    setSelectedTickets((prev): SelectedTickets => {
      const currentQuantity = prev[type];
      const newQuantity = currentQuantity + delta;
      
      // Validate: tidak boleh kurang dari 0
      if (newQuantity < 0) return prev;
      
      // Validate: tidak boleh lebih dari available
      if (newQuantity > availableQuantity) {
        addToast("error", `Maksimal ${availableQuantity} tiket tersedia`);
        return prev;
      }
      
      return { ...prev, [type]: newQuantity };
    });
  };

  const handleApplyVoucher = async () => {
    if (!voucherCode.trim() || !eventId) return;
    
    // Abort previous request if exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();
    
    setIsApplyingVoucher(true);
    
    try {
      // Call voucher validation API
      const { validateVoucher } = useEventStore.getState();
      const discount = await validateVoucher(
        eventId,
        voucherCode,
        subtotal,
        selectedTickets.general + selectedTickets.vip
      );

      if (discount > 0) {
        setAppliedDiscount(discount);
        addToast("success", "Voucher applied successfully!");
      } else {
        addToast("error", "Invalid or expired voucher");
      }
    } finally {
      setIsApplyingVoucher(false);
      abortControllerRef.current = null;
    }
  };

  const handleRemoveVoucher = () => {
    setVoucherCode("");
    setAppliedDiscount(0);
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

     const totalQuantity = selectedTickets.general + selectedTickets.vip;
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
       if (pointsToUse > 50000) {
         addToast("error", "Maksimal 50.000 poin per transaksi");
         return;
       }
     }

     // Determine ticket ID based on ticket type selected
     const ticketId = currentEvent?.tickets 
       ? (selectedTickets.vip > 0 
           ? vipTicket?.id 
           : generalTicket?.id) || "default"
       : "default";

     try {
       const transaction = await createTransaction({
         eventId,
         ticketId,
         quantity: totalQuantity,
         voucherCode: appliedDiscount > 0 ? voucherCode : undefined,
         couponCode: appliedCouponDiscount > 0 ? couponCode : undefined,
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

  return {
    eventId,
    currentEvent,
    isLoading,
    selectedTickets,
    voucherCode,
    appliedDiscount,
    isApplyingVoucher,
    couponCode,
    appliedCouponDiscount,
    pointsToUse,
    userPoints,
    priceGeneral,
    priceVIP,
    pointsDiscount,
    subtotal,
    total,
    transactionLoading,
    handleUpdateTicket,
    handleApplyVoucher,
    handleRemoveVoucher,
    handleProceedToPayment,
    setPointsToUse,
    setVoucherCode,
    setCouponCode,
  };
}
