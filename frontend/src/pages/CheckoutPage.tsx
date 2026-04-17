import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useEventStore } from "../stores/useEventStore";
import { useTransactionStore } from "../stores/useTransactionStore";
import { useAuthStore } from "../stores/useAuthStore";
import { useToastStore } from "../stores/useToastStore";

const CheckoutPage: React.FC = () => {
  const { id: eventId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const { currentEvent, fetchEventById, clearCurrentEvent } = useEventStore();
  const { createTransaction, loading: transactionLoading, error: transactionError } = useTransactionStore();
  const { user, isAuthenticated } = useAuthStore();
  const { addToast } = useToastStore();

  // State untuk ticket selection
  const [selectedTickets, setSelectedTickets] = useState<{
    general: number;
    vip: number;
  }>({
    general: 0,
    vip: 0,
  });

  // State untuk voucher
  const [voucherCode, setVoucherCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [isApplyingVoucher, setIsApplyingVoucher] = useState(false);

  // State untuk points
  const [usePoints, setUsePoints] = useState(false);
  const [userPoints, setUserPoints] = useState(0);

  // Loading state
  const [isLoading, setIsLoading] = useState(true);

  // Get prices from event tickets using type field
  const generalTicket = currentEvent?.tickets?.find((t) => t.type === "GENERAL");
  const vipTicket = currentEvent?.tickets?.find((t) => t.type === "VIP");
  const eventBasePrice = currentEvent?.price || 450000;
  
  const priceGeneral = generalTicket?.price ?? eventBasePrice;
  const priceVIP = vipTicket?.price ?? eventBasePrice * 2.5;
  
  const pointsDiscount = usePoints ? Math.min(userPoints, 50000) : 0;

  // Hitung totals
  const subtotal = selectedTickets.general * priceGeneral + selectedTickets.vip * priceVIP;
  const total = subtotal - appliedDiscount - pointsDiscount;

  const formatIDR = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    })
      .format(amount)
      .replace("Rp", "Rp ");
  };

  const handleUpdateTicket = (type: "general" | "vip", delta: number) => {
    setSelectedTickets((prev) => ({
      ...prev,
      [type]: Math.max(0, prev[type] + delta),
    }));
  };

  const handleApplyVoucher = async () => {
    if (!voucherCode.trim() || !eventId) return;
    setIsApplyingVoucher(true);
    
    // Call voucher validation API
    const { validateVoucher } = useEventStore.getState();
    const discount = await validateVoucher(
      eventId,
      voucherCode,
      subtotal,
      selectedTickets.general + selectedTickets.vip
    );

    setIsApplyingVoucher(false);

    if (discount > 0) {
      setAppliedDiscount(discount);
      addToast("success", "Voucher applied successfully!");
    } else {
      addToast("error", "Invalid or expired voucher");
    }
  };

  const handleRemoveVoucher = () => {
    setVoucherCode("");
    setAppliedDiscount(0);
  };

  const handleProceedToPayment = async () => {
    if (!isAuthenticated) {
      addToast("error", "Please login to continue");
      navigate("/login", { state: { from: window.location.pathname } });
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
        pointsUsed: usePoints ? pointsDiscount : undefined,
      });

      if (transaction) {
        addToast("success", "Transaction created! Redirecting...");
        navigate(`/transactions/${transaction.id}`);
      } else {
        addToast("error", transactionError || "Failed to create transaction");
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
    };
  }, [eventId]);

  useEffect(() => {
    if (user?.points) {
      setUserPoints(user.points);
    }
  }, [user]);

  if (isLoading) {
    return (
      <div className="bg-[#131313] text-[#e5e2e1] min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#c0c1ff] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-[#c7c4d8]">Loading checkout...</p>
        </div>
      </div>
    );
  }

  if (!currentEvent && !isLoading) {
    return (
      <div className="bg-[#131313] text-[#e5e2e1] min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center">
          <span className="material-symbols-outlined text-6xl text-[#93000a]">
            event_busy
          </span>
          <h2 className="text-2xl font-bold">Event not found</h2>
          <p className="text-[#c7c4d8]">The event you're looking for doesn't exist.</p>
          <Link to="/" className="text-[#c0c1ff] hover:underline">
            Go back to Home
          </Link>
        </div>
      </div>
    );
  }

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

  return (
    <div className="bg-[#131313] text-[#e5e2e1] min-h-screen font-sans selection:bg-[#c0c1ff]/30">
      <main className="pt-24 pb-32 px-6 max-w-screen-2xl mx-auto">
        {/* Breadcrumb / Header */}
        <div className="mb-12">
          <div className="flex items-center gap-2 text-[#c7c4d8] text-xs mb-4">
            <Link to="/" className="hover:text-[#c0c1ff]">Events</Link>
            <span className="material-symbols-outlined text-xs">chevron_right</span>
            <Link to={`/events/${eventId}`} className="hover:text-[#c0c1ff]">{currentEvent?.name || 'Event'}</Link>
            <span className="material-symbols-outlined text-xs">chevron_right</span>
            <span className="text-[#c0c1ff]">Checkout</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tighter text-[#e5e2e1]">
            Secure Checkout
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column */}
          <div className="lg:col-span-8 space-y-12">
            {/* Event Summary Card */}
            <section className="bg-[#1c1b1b] rounded-xl overflow-hidden shadow-2xl">
              <div className="h-48 relative overflow-hidden">
                <img
                  alt={currentEvent?.name}
                  className="w-full h-full object-cover opacity-60"
                  src={currentEvent?.imageUrl || "https://lh3.googleusercontent.com/aida-public/AB6AXuDdRDS19K5BkPJR_o2gLhL_xSButi1v__xH0YgKvN3kq9-HtpAvjR_2gAdUFjid84mEd0CaTu2Sq-c2J4pwmljaPxupQub4NmuRrlvhQpBgg2VnBlUlURuheitOpwPORiqygxSyVPs8qDWcudVps9rRxX1SIXgjUUBZj_yQzZFY27qefC5xmU9u0trPGRuD6wL-eHP_1j5Bf1CBqxODn823AnAbiLnf39GZwrsUL0CGfEoVnugGWZnzXmh1eqwNnOXh4TzEcX6BmU-X"}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1c1b1b] to-transparent"></div>
                <div className="absolute bottom-6 left-8">
                  <span className="bg-[#c0c1ff] text-[#07006c] px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-2 inline-block">
                    {currentEvent?.category}
                  </span>
                  <h2 className="text-3xl font-bold tracking-tight text-white">
                    {currentEvent?.name}
                  </h2>
                </div>
              </div>
              <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-[#c0c1ff]">
                    calendar_today
                  </span>
                  <div>
                    <p className="text-[#e5e2e1] font-semibold text-sm">
                      {currentEvent?.startDate ? formatDate(currentEvent.startDate) : "TBA"}
                    </p>
                    <p className="text-[#c7c4d8] text-xs">
                      {currentEvent?.endDate ? formatDate(currentEvent.endDate) : ""}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-[#c0c1ff]">
                    location_on
                  </span>
                  <div>
                    <p className="text-[#e5e2e1] font-semibold text-sm">
                      {currentEvent?.location || "TBA"}
                    </p>
                    <p className="text-[#c7c4d8] text-xs">Indonesia</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-[#c0c1ff]">
                    confirmation_number
                  </span>
                  <div>
                    <p className="text-[#e5e2e1] font-semibold text-sm">
                      {selectedTickets.general + selectedTickets.vip} Tickets Reserved
                    </p>
                    <p className="text-[#c7c4d8] text-xs">
                      {currentEvent?.availableSeats ? `${currentEvent.availableSeats} seats left` : 'Limited availability'}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Ticket Selection Area */}
            <section className="space-y-6">
              <h3 className="text-xl font-bold tracking-tight text-[#e5e2e1]">
                Select Ticket Tiers
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* General Tier */}
                <div className={`bg-[#2a2a2a] border-2 ${selectedTickets.general > 0 ? "border-[#4b4dd8]/40" : "border-transparent"} hover:border-[#4b4dd8]/40 p-6 rounded-xl transition-all group`}>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="text-lg font-bold text-[#e5e2e1]">
                        General Admission
                      </h4>
                      <p className="text-[#c7c4d8] text-sm mt-1">
                        Full access to main arena and outdoor gallery.
                      </p>
                    </div>
                    <span className="bg-[#353534] px-2 py-1 rounded text-xs text-[#c7c4d8]">
                      Available
                    </span>
                  </div>
                  <div className="flex justify-between items-end">
                    <span className="text-xl font-black text-[#e5e2e1]">
                      {formatIDR(priceGeneral)}
                    </span>
                    <div className="flex items-center gap-4 bg-[#0e0e0e] rounded-full px-4 py-2">
                      <button
                        onClick={() => handleUpdateTicket("general", -1)}
                        disabled={selectedTickets.general === 0}
                        className="material-symbols-outlined text-[#c7c4d8] hover:text-[#c0c1ff] disabled:opacity-30"
                      >
                        remove
                      </button>
                      <span className="font-bold w-4 text-center">
                        {selectedTickets.general}
                      </span>
                      <button
                        onClick={() => handleUpdateTicket("general", 1)}
                        className="material-symbols-outlined text-[#c7c4d8] hover:text-[#c0c1ff]"
                      >
                        add
                      </button>
                    </div>
                  </div>
                </div>

                {/* VIP Tier */}
                <div className={`bg-[#2a2a2a] border-2 ${selectedTickets.vip > 0 ? "border-[#c0c1ff] p-6 rounded-xl relative shadow-[0_0_20px_rgba(192,193,255,0.1)]" : "border-transparent"} p-6 rounded-xl`}>
                  {selectedTickets.vip > 0 && (
                    <div className="absolute -top-3 left-6 bg-[#c0c1ff] px-3 py-1 rounded-full text-[10px] font-bold text-[#07006c]">
                      MOST POPULAR
                    </div>
                  )}
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="text-lg font-bold text-[#e5e2e1]">
                        VIP Experience
                      </h4>
                      <p className="text-[#c7c4d8] text-sm mt-1">
                        Priority entry, VIP lounge, and kit.
                      </p>
                    </div>
                    <span className="bg-[#c0c1ff]/20 text-[#c0c1ff] px-2 py-1 rounded text-xs">
                      Active
                    </span>
                  </div>
                  <div className="flex justify-between items-end">
                    <span className="text-xl font-black text-[#e5e2e1]">
                      {formatIDR(priceVIP)}
                    </span>
                    <div className="flex items-center gap-4 bg-[#0e0e0e] rounded-full px-4 py-2 border border-[#c0c1ff]/30">
                      <button
                        onClick={() => handleUpdateTicket("vip", -1)}
                        disabled={selectedTickets.vip === 0}
                        className="material-symbols-outlined text-[#c7c4d8] hover:text-[#c0c1ff] disabled:opacity-30"
                      >
                        remove
                      </button>
                      <span className="font-bold w-4 text-center">
                        {selectedTickets.vip}
                      </span>
                      <button
                        onClick={() => handleUpdateTicket("vip", 1)}
                        className="material-symbols-outlined text-[#c7c4d8] hover:text-[#c0c1ff]"
                      >
                        add
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Vouchers and Points */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[#1c1b1b] p-6 rounded-xl space-y-4">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#ffb695]">
                    confirmation_number
                  </span>
                  <h3 className="font-bold text-[#e5e2e1]">Voucher Code</h3>
                </div>
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
                      <span className="material-symbols-outlined text-lg">close</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      className="bg-[#0e0e0e] border-none text-[#e5e2e1] placeholder:text-zinc-600 rounded-lg px-4 py-3 flex-grow focus:ring-1 focus:ring-[#c0c1ff] outline-none"
                      placeholder="ENTER CODE"
                      type="text"
                      value={voucherCode}
                      onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                    />
                    <button 
                      onClick={handleApplyVoucher}
                      disabled={!voucherCode.trim() || isApplyingVoucher}
                      className="bg-[#353534] text-[#e5e2e1] px-6 py-3 rounded-lg font-bold hover:bg-[#393939] transition-all active:scale-95 disabled:opacity-50"
                    >
                      {isApplyingVoucher ? (
                        <span className="material-symbols-outlined animate-spin">sync</span>
                      ) : "Apply"}
                    </button>
                  </div>
                )}
                <p className="text-[10px] text-[#c7c4d8] uppercase tracking-widest">
                  Only one voucher per transaction
                </p>
              </div>

              <div className="bg-[#1c1b1b] p-6 rounded-xl space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#c0c1ff]">
                      stars
                    </span>
                    <h3 className="font-bold text-[#e5e2e1]">Loyalty Points</h3>
                  </div>
                  <span className="text-xs bg-[#c0c1ff]/10 text-[#c0c1ff] px-2 py-1 rounded-full font-semibold">
                    {userPoints.toLocaleString()} pts
                  </span>
                </div>
                <div className="flex items-center justify-between bg-[#0e0e0e] p-4 rounded-lg">
                  <div>
                    <p className="text-sm font-semibold text-[#e5e2e1]">
                      Use Points for Discount
                    </p>
                    <p className="text-xs text-[#c7c4d8]">
                      Save up to {formatIDR(pointsDiscount)}
                    </p>
                  </div>
                  <button
                    onClick={() => setUsePoints(!usePoints)}
                    disabled={userPoints === 0}
                    className={`w-12 h-6 rounded-full relative transition-colors duration-200 ${usePoints ? "bg-[#c0c1ff]" : "bg-zinc-700"} ${userPoints === 0 ? "opacity-50" : ""}`}
                  >
                    <span
                      className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${usePoints ? "left-7" : "left-1"}`}
                    ></span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary (Sticky) */}
          <aside className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
            <div className="bg-[#2a2a2a] rounded-xl p-8 shadow-2xl relative overflow-hidden">
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#c0c1ff]/10 blur-[100px] rounded-full"></div>
              <h3 className="text-xl font-bold tracking-tight text-[#e5e2e1] mb-8">
                Order Summary
              </h3>

              <div className="space-y-4 border-b border-[#464555]/15 pb-8 mb-8">
                {selectedTickets.general > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-[#c7c4d8]">
                      General Admission ({selectedTickets.general}x)
                    </span>
                    <span className="text-[#e5e2e1] font-medium">
                      {formatIDR(selectedTickets.general * priceGeneral)}
                    </span>
                  </div>
                )}
                {selectedTickets.vip > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-[#c7c4d8]">
                      VIP Experience ({selectedTickets.vip}x)
                    </span>
                    <span className="text-[#e5e2e1] font-medium">
                      {formatIDR(selectedTickets.vip * priceVIP)}
                    </span>
                  </div>
                )}
                {selectedTickets.general + selectedTickets.vip === 0 && (
                  <p className="text-[#c7c4d8] text-sm">No tickets selected</p>
                )}
              </div>

              {(appliedDiscount > 0 || pointsDiscount > 0) && (
                <div className="space-y-4 border-b border-[#464555]/15 pb-8 mb-8">
                  {appliedDiscount > 0 && (
                    <div className="flex justify-between text-sm items-center">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-xs text-[#ffb4ab]">
                          confirmation_number
                        </span>
                        <span className="text-[#c7c4d8]">Voucher Applied</span>
                      </div>
                      <span className="text-[#ffb4ab] font-medium">
                        - {formatIDR(appliedDiscount)}
                      </span>
                    </div>
                  )}
                  {usePoints && pointsDiscount > 0 && (
                    <div className="flex justify-between text-sm items-center">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-xs text-[#c0c1ff]">
                          stars
                        </span>
                        <span className="text-[#c7c4d8]">Points Applied</span>
                      </div>
                      <span className="text-[#c0c1ff] font-medium">
                        - {formatIDR(pointsDiscount)}
                      </span>
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-between items-end mb-10">
                <div>
                  <p className="text-[10px] text-[#c7c4d8] uppercase tracking-[0.2em] font-bold mb-1">
                    Total Payable
                  </p>
                  <p className="text-3xl font-black text-[#e5e2e1] tracking-tighter">
                    {formatIDR(total)}
                  </p>
                </div>
                <p className="text-[10px] text-[#c7c4d8]">incl. VAT 11%</p>
              </div>

              <button 
                onClick={handleProceedToPayment}
                disabled={transactionLoading || selectedTickets.general + selectedTickets.vip === 0}
                className="w-full bg-gradient-to-br from-[#c0c1ff] to-[#4b4dd8] text-[#07006c] py-4 rounded-xl font-bold text-lg hover:shadow-[0_0_25px_rgba(75,77,216,0.4)] transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {transactionLoading ? (
                  <span className="material-symbols-outlined animate-spin">sync</span>
                ) : (
                  <>
                    Proceed to Payment
                    <span className="material-symbols-outlined">arrow_forward</span>
                  </>
                )}
              </button>

              <div className="mt-6 flex justify-center items-center gap-4 grayscale opacity-40">
                <span className="material-symbols-outlined text-2xl">
                  credit_card
                </span>
                <span className="material-symbols-outlined text-2xl">
                  account_balance_wallet
                </span>
                <span className="material-symbols-outlined text-2xl">
                  qr_code_2
                </span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 text-[#c7c4d8] text-xs">
              <span className="material-symbols-outlined text-sm">lock</span>
              Secure SSL Encrypted Transaction
            </div>
          </aside>
        </div>
      </main>

      {/* Mobile BottomNavBar */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full flex justify-around items-center px-4 pb-6 pt-2 bg-zinc-950/90 backdrop-blur-md z-50 border-t border-zinc-800/50">
        <Link to="/" className="flex flex-col items-center justify-center text-zinc-500">
          <span className="material-symbols-outlined">home</span>
          <span className="text-[10px] font-medium">Home</span>
        </Link>
        <Link to="/my-tickets" className="flex flex-col items-center justify-center bg-indigo-500/10 text-indigo-200 rounded-xl px-6 py-1">
          <span
            className="material-symbols-outlined"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            confirmation_number
          </span>
          <span className="text-[10px] font-medium">Tickets</span>
        </Link>
        <Link to="/profile" className="flex flex-col items-center justify-center text-zinc-500">
          <span className="material-symbols-outlined">person</span>
          <span className="text-[10px] font-medium">Profile</span>
        </Link>
      </nav>
    </div>
  );
};

export default CheckoutPage;