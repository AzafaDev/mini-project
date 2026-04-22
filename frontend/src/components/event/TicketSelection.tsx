import React from "react";
import { formatIDR } from "../../lib/formatters";

interface TicketSelectionProps {
  event: any;
  selectedTickets: { general: number; vip: number };
  voucherCode: string;
  couponCode: string;
  voucherError: string | null;
  couponError: string | null;
  discount: number;
  totalPrice: number;
  onTicketChange: (type: 'general' | 'vip', delta: number) => void;
  onVoucherChange: (code: string) => void;
  onCouponChange: (code: string) => void;
  onApplyVoucher: () => void;
  onApplyCoupon: () => void;
  onAddToCart: () => void;
}

export const TicketSelection: React.FC<TicketSelectionProps> = ({
  event,
  selectedTickets,
  voucherCode,
  couponCode,
  voucherError,
  couponError,
  discount,
  totalPrice,
  onTicketChange,
  onVoucherChange,
  onCouponChange,
  onApplyVoucher,
  onApplyCoupon,
  onAddToCart,
}) => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-text-light">Select Tickets</h2>

      {/* General Ticket */}
      <div className={`bg-dark-elevated border-2 ${selectedTickets.general > 0 ? "border-accent/40" : "border-transparent"} hover:border-accent/40 p-6 rounded-xl transition-all group`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-lg text-text-light">General Admission</h3>
            <p className="text-text-muted text-sm mt-1">Regular access</p>
          </div>
          <div className="text-right">
            <p className="text-xl font-bold text-primary">{formatIDR(event.price)}</p>
            <p className="text-xs text-text-muted">{event.availableSeats} tickets left</p>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-dark-darker rounded-full px-4 py-2 mt-4">
          <button
            onClick={() => onTicketChange('general', -1)}
            disabled={selectedTickets.general === 0}
            className="p-1 text-text-light hover:text-primary disabled:text-text-secondary disabled:cursor-not-allowed transition-colors"
          >
            <span className="material-symbols-outlined">remove</span>
          </button>
          <span className="flex-1 text-center font-bold">{selectedTickets.general}</span>
          <button
            onClick={() => onTicketChange('general', 1)}
            className="p-1 text-text-light hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined">add</span>
          </button>
        </div>
      </div>

      {/* VIP Ticket */}
      {event.vipPrice && (
        <div className={`bg-dark-elevated border-2 ${selectedTickets.vip > 0 ? "border-primary p-6 rounded-xl relative shadow-[0_0_20px_rgba(192,193,255,0.1)]" : "border-transparent"} p-6 rounded-xl`}>
          <div className="absolute -top-3 left-6 bg-primary px-3 py-1 rounded-full text-[10px] font-bold text-primary-dark">
            VIP
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-lg text-text-light">VIP Ticket</h3>
              <p className="text-text-muted text-sm mt-1">Priority access + exclusive perks</p>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-primary">{formatIDR(event.vipPrice)}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-dark-darker rounded-full px-4 py-2 border border-primary/30 mt-4">
            <button
              onClick={() => onTicketChange('vip', -1)}
              disabled={selectedTickets.vip === 0}
              className="p-1 text-text-light hover:text-primary disabled:text-text-secondary disabled:cursor-not-allowed transition-colors"
            >
              <span className="material-symbols-outlined">remove</span>
            </button>
            <span className="flex-1 text-center font-bold">{selectedTickets.vip}</span>
            <button
              onClick={() => onTicketChange('vip', 1)}
              className="p-1 text-text-light hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined">add</span>
            </button>
          </div>
        </div>
      )}

      {/* Voucher & Coupon */}
      <div className="space-y-4">
        <div>
          <input
            type="text"
            value={voucherCode}
            onChange={(e) => onVoucherChange(e.target.value)}
            placeholder="Enter voucher code"
            className="w-full bg-dark-darker border-none text-text-light placeholder:text-zinc-600 rounded-lg px-4 py-3 flex-grow focus:ring-1 focus:ring-primary outline-none"
          />
          {voucherError && <p className="text-error-light text-sm mt-1">{voucherError}</p>}
          <button
            onClick={onApplyVoucher}
            className="bg-dark-card text-text-light px-6 py-3 rounded-lg font-bold hover:bg-dark-card-hover transition-all active:scale-95 disabled:opacity-50 mt-2"
          >
            Apply Voucher
          </button>
        </div>

        <div>
          <input
            type="text"
            value={couponCode}
            onChange={(e) => onCouponChange(e.target.value)}
            placeholder="Enter coupon code"
            className="w-full bg-dark-darker border border-border-muted/30 text-text-light rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
          />
          {couponError && <p className="text-error-light text-sm mt-1">{couponError}</p>}
          <button
            onClick={onApplyCoupon}
            className="bg-dark-card text-text-light px-6 py-3 rounded-lg font-bold hover:bg-dark-card-hover transition-all active:scale-95 disabled:opacity-50 mt-2"
          >
            Apply Coupon
          </button>
        </div>
      </div>

      {/* Price Summary */}
      <div className="space-y-4 border-b border-border-muted/15 pb-8 mb-8">
        {selectedTickets.general > 0 && (
          <div className="flex justify-between">
            <span>General x{selectedTickets.general}</span>
            <span>{formatIDR(selectedTickets.general * event.price)}</span>
          </div>
        )}
        {selectedTickets.vip > 0 && (
          <div className="flex justify-between">
            <span>VIP x{selectedTickets.vip}</span>
            <span>{formatIDR(selectedTickets.vip * event.vipPrice)}</span>
          </div>
        )}
        {discount > 0 && (
          <div className="flex justify-between text-warning">
            <span>Discount</span>
            <span>-{formatIDR(discount)}</span>
          </div>
        )}
        <div className="flex justify-between font-bold text-xl pt-4 border-t border-border-muted/15">
          <span>Total</span>
          <span className="text-primary">{formatIDR(totalPrice)}</span>
        </div>
      </div>

      {/* Add to Cart Button */}
      <button
        onClick={onAddToCart}
        className="w-full bg-gradient-to-br from-primary to-accent text-primary-dark py-4 rounded-xl font-bold text-lg hover:shadow-[0_0_25px_rgba(75,77,216,0.4)] transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span className="material-symbols-outlined">shopping_cart</span>
        Add to Cart
      </button>
    </div>
  );
};
