import React from "react";
import { Link } from "react-router-dom";
import { formatIDR, formatDate } from "../lib/formatters";
import { POINTS_CONFIG } from "../lib/constants";
import { useCheckout } from "../hooks/useCheckout";

const CheckoutPage: React.FC = () => {
  const {
    eventId,
    currentEvent,
    isLoading,
    selectedTickets,
    tickets,
    promoCode,
    appliedDiscount,
    promoType,
    isApplyingPromo,
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
  } = useCheckout();

  if (isLoading) {
    return (
      <div className="bg-dark text-text-light min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-text-muted">Loading checkout...</p>
        </div>
      </div>
    );
  }

  if (!currentEvent && !isLoading) {
    return (
      <div className="bg-dark text-text-light min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center">
          <span className="material-symbols-outlined text-6xl text-error">
            event_busy
          </span>
          <h2 className="text-2xl font-bold">Event not found</h2>
          <p className="text-text-muted">The event you're looking for doesn't exist.</p>
          <Link to="/" className="text-primary hover:underline">
            Go back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-dark text-text-light min-h-screen font-sans selection:bg-primary/30">
      <main className="pt-24 pb-32 px-6 max-w-screen-2xl mx-auto">
        {/* Breadcrumb / Header */}
        <div className="mb-12">
          <div className="flex items-center gap-2 text-text-muted text-xs mb-4">
            <Link to="/" className="hover:text-primary">Events</Link>
            <span className="material-symbols-outlined text-xs">chevron_right</span>
            <Link to={`/events/${eventId}`} className="hover:text-primary">{currentEvent?.name || 'Event'}</Link>
            <span className="material-symbols-outlined text-xs">chevron_right</span>
            <span className="text-primary">Checkout</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tighter text-text-light">
            Secure Checkout
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column */}
          <div className="lg:col-span-8 space-y-12">
            {/* Event Summary Card */}
            <section className="bg-dark-surface rounded-xl overflow-hidden shadow-2xl">
              <div className="h-48 relative overflow-hidden">
                <img
                  alt={currentEvent?.name}
                  className="w-full h-full object-cover opacity-60"
                  src={currentEvent?.imageUrl || "https://lh3.googleusercontent.com/aida-public/AB6AXuDdRDS19K5BkPJR_o2gLhL_xSButi1v__xH0YgKvN3kq9-HtpAvjR_2gAdUFjid84mEd0CaTu2Sq-c2J4pwmljaPxupQub4NmuRrlvhQpBgg2VnBlUlURuheitOpwPORiqygxSyVPs8qDWcudVps9rRxX1SIXgjUUBZj_yQzZFY27qefC5xmU9u0trPGRuD6wL-eHP_1j5Bf1CBqxODn823AnAbiLnf39GZwrsUL0CGfEoVnugGWZnzXmh1eqwNnOXh4TzEcX6BmU-X"}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-dark-surface to-transparent"></div>
                <div className="absolute bottom-6 left-8">
                  <span className="bg-primary text-primary-dark px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-2 inline-block">
                    {currentEvent?.category}
                  </span>
                  <h2 className="text-3xl font-bold tracking-tight text-white">
                    {currentEvent?.name}
                  </h2>
                </div>
              </div>
              <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary">
                    calendar_today
                  </span>
                  <div>
                    <p className="text-text-light font-semibold text-sm">
                      {currentEvent?.startDate ? formatDate(currentEvent.startDate) : "TBA"}
                    </p>
                    <p className="text-text-muted text-xs">
                      {currentEvent?.endDate ? formatDate(currentEvent.endDate) : ""}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary">
                    location_on
                  </span>
                  <div>
                    <p className="text-text-light font-semibold text-sm">
                      {currentEvent?.location || "TBA"}
                    </p>
                    <p className="text-text-muted text-xs">Indonesia</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary">
                    confirmation_number
                  </span>
                  <div>
                     <p className="text-text-light font-semibold text-sm">
                       {Object.values(selectedTickets).reduce((sum, qty) => sum + qty, 0)} Tickets Reserved
                     </p>
                    <p className="text-text-muted text-xs">
                      {currentEvent?.availableSeats ? `${currentEvent.availableSeats} seats left` : 'Limited availability'}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Ticket Selection Area */}
            <section className="space-y-6">
              <h3 className="text-xl font-bold tracking-tight text-text-light">
                Select Tickets
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tickets.map((ticket) => {
                  const quantity = selectedTickets[ticket.id] || 0;
                  const isSelected = quantity > 0;
                  const isVip = ticket.type === 'VIP';

                  return (
                    <div
                      key={ticket.id}
                      className={`bg-dark-elevated border-2 ${
                        isSelected ? 'border-primary' : 'border-transparent'
                      } hover:border-accent/40 p-6 rounded-xl transition-all relative ${
                        isVip ? 'shadow-[0_0_20px_rgba(192,193,255,0.1)]' : ''
                      }`}
                    >
                      {isVip && (
                        <div className="absolute -top-3 left-6 bg-primary px-3 py-1 rounded-full text-[10px] font-bold text-primary-dark">
                          VIP
                        </div>
                      )}
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="text-lg font-bold text-text-light">
                            {ticket.type === 'GENERAL' ? 'General Admission' : 'VIP Experience'}
                          </h4>
                          <p className="text-text-muted text-sm mt-1">
                            {ticket.type === 'GENERAL'
                              ? 'Full access to event'
                              : 'Priority access + exclusive perks'}
                          </p>
                        </div>
                        <span className="bg-dark-card px-2 py-1 rounded text-xs text-text-muted">
                          {ticket.availableQuantity} left
                        </span>
                      </div>
                      <div className="flex justify-between items-end">
                        <span className="text-xl font-black text-text-light">
                          {formatIDR(ticket.price)}
                        </span>
                        <div className="flex items-center gap-4 bg-dark-darker rounded-full px-4 py-2">
                          <button
                            onClick={() => handleUpdateTicket(ticket.id, -1)}
                            disabled={quantity === 0}
                            className="material-symbols-outlined text-text-muted hover:text-primary disabled:opacity-30"
                          >
                            remove
                          </button>
                          <span className="font-bold w-4 text-center">{quantity}</span>
                          <button
                            onClick={() => handleUpdateTicket(ticket.id, 1)}
                            disabled={quantity >= ticket.availableQuantity}
                            className="material-symbols-outlined text-text-muted hover:text-primary"
                          >
                            add
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Grid wrapper for Promo + Points */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Promo Code Card */}
            <div className="bg-dark-surface p-6 rounded-xl space-y-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-warning">
                  local_offer
                </span>
                <h3 className="font-bold text-text-light">Promo Code</h3>
              </div>

              {appliedDiscount > 0 && promoType ? (
                <div className="flex items-center justify-between bg-success-dark border border-green-500/30 p-3 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-green-400">
                      check_circle
                    </span>
                    <span className="text-green-400 font-medium">
                      -{formatIDR(appliedDiscount)} applied
                      <span className="text-xs ml-2 opacity-70">
                        ({promoType === "voucher" ? "Voucher" : "Coupon"})
                      </span>
                    </span>
                  </div>
                  <button onClick={handleRemovePromo} className="text-green-400 hover:text-green-300">
                    <span className="material-symbols-outlined text-lg">close</span>
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    className="bg-dark-darker border-none text-text-light placeholder:text-zinc-600 rounded-lg px-4 py-3 flex-grow focus:ring-1 focus:ring-primary outline-none"
                    placeholder="ENTER PROMO CODE"
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                  />
                  <button
                    onClick={handleApplyPromoCode}
                    disabled={!promoCode.trim() || isApplyingPromo}
                    className="bg-dark-card text-text-light px-6 py-3 rounded-lg font-bold hover:bg-dark-card-hover transition-all active:scale-95 disabled:opacity-50"
                  >
                    {isApplyingPromo ? (
                      <span className="material-symbols-outlined animate-spin">sync</span>
                    ) : "Apply"}
                  </button>
                </div>
              )}
              <p className="text-[10px] text-text-muted uppercase tracking-widest">
                Works with event vouchers & system coupons
              </p>
            </div>

            {/* Loyalty Points Card */}
            <div className="bg-dark-surface p-6 rounded-xl space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">
                    stars
                  </span>
                  <h3 className="font-bold text-text-light">Loyalty Points</h3>
                </div>
                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-semibold">
                  {userPoints.toLocaleString()} pts
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center bg-dark-darker p-4 rounded-lg">
                  <div>
                    <p className="text-sm font-semibold text-text-light">
                      Saldo Anda
                    </p>
                    <p className="text-xs text-text-muted">
                      {userPoints.toLocaleString()} poin tersedia
                    </p>
                  </div>
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-semibold">
                    Maks redeem: {Math.min(userPoints, POINTS_CONFIG.MAX_PER_TRANSACTION).toLocaleString()}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-text-light mb-2">
                    Jumlah Poin yang Digunakan
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={Math.min(userPoints, POINTS_CONFIG.MAX_PER_TRANSACTION)}
                    value={pointsToUse}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 0;
                      setPointsToUse(Math.min(val, Math.min(userPoints, POINTS_CONFIG.MAX_PER_TRANSACTION)));
                    }}
                    className="w-full bg-dark-darker border border-border-muted/30 text-text-light rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    placeholder="Masukkan poin (0 - maks)"
                  />
                  <div className="flex justify-between mt-2">
                    <button
                      type="button"
                      onClick={() => setPointsToUse(0)}
                      className="text-xs text-text-muted hover:text-primary"
                    >
                      Bersihkan
                    </button>
                    <button
                      type="button"
                      onClick={() => setPointsToUse(Math.min(userPoints, POINTS_CONFIG.MAX_PER_TRANSACTION))}
                      className="text-xs text-primary hover:underline"
                    >
                      Gunakan Maks ({Math.min(userPoints, POINTS_CONFIG.MAX_PER_TRANSACTION).toLocaleString()})
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          </div>

           {/* Right Column: Order Summary (Sticky) */}
          <aside className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
            <div className="bg-dark-elevated rounded-xl p-8 shadow-2xl relative overflow-hidden">
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 blur-[100px] rounded-full"></div>
              <h3 className="text-xl font-bold tracking-tight text-text-light mb-8">
                Order Summary
              </h3>

              <div className="space-y-4 border-b border-border-muted/15 pb-8 mb-8">
                {Object.entries(selectedTickets).map(([ticketId, qty]) => {
                  const ticket = tickets.find(t => t.id === ticketId);
                  if (!ticket || qty === 0) return null;
                  return (
                    <div key={ticketId} className="flex justify-between text-sm">
                      <span className="text-text-muted">
                        {ticket.type === 'GENERAL' ? 'General Admission' : 'VIP Experience'} ({qty}x)
                      </span>
                      <span className="text-text-light font-medium">
                        {formatIDR(ticket.price * qty)}
                      </span>
                    </div>
                  );
                })}
                {Object.values(selectedTickets).reduce((sum, qty) => sum + qty, 0) === 0 && (
                  <p className="text-text-muted text-sm">No tickets selected</p>
                )}
              </div>

              {(appliedDiscount > 0 || pointsDiscount > 0) && (
                <div className="space-y-4 border-b border-border-muted/15 pb-8 mb-8">
                  {appliedDiscount > 0 && (
                    <div className="flex justify-between text-sm items-center">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-xs text-warning">
                          local_offer
                        </span>
                        <span className="text-text-muted">
                          {promoType === "voucher" ? "Voucher" : "Coupon"} Applied
                        </span>
                      </div>
                      <span className="text-warning font-medium">
                        - {formatIDR(appliedDiscount)}
                      </span>
                    </div>
                  )}
                  {pointsToUse > 0 && pointsDiscount > 0 && (
                    <div className="flex justify-between text-sm items-center">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-xs text-primary">
                          stars
                        </span>
                        <span className="text-text-muted">Points Applied</span>
                      </div>
                      <span className="text-primary font-medium">
                        - {formatIDR(pointsDiscount)}
                      </span>
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-between items-end mb-10">
                <div>
                  <p className="text-[10px] text-text-muted uppercase tracking-[0.2em] font-bold mb-1">
                    Total Payable
                  </p>
                  <p className="text-3xl font-black text-text-light tracking-tighter">
                    {formatIDR(total)}
                  </p>
                </div>
                <p className="text-[10px] text-text-muted">incl. VAT 11%</p>
              </div>

               <button
                 onClick={handleProceedToPayment}
                 disabled={transactionLoading || Object.values(selectedTickets).reduce((sum, qty) => sum + qty, 0) === 0}
                 className="w-full bg-gradient-to-br from-primary to-accent text-primary-dark py-4 rounded-xl font-bold text-lg hover:shadow-[0_0_25px_rgba(75,77,216,0.4)] transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
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

            <div className="flex items-center justify-center gap-2 text-text-muted text-xs">
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