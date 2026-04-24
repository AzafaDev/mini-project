import React from "react";
import { formatIDR } from "../../lib/formatters";
import { Event } from "../../types/event.types";

interface TicketSelectionProps {
  event: Event;
  onBuyNow: () => void;
  isPastEvent?: boolean;
}

/**
 * Dynamic ticket selection component that maps over backend ticket array.
 * Displays ticket information with vouchers section and handles sold-out states.
 * Provides "Buy Now" button that navigates to checkout.
 */
export const TicketSelection: React.FC<TicketSelectionProps> = ({
  event,
  onBuyNow,
  isPastEvent = false,
}) => {
  // Check if event is sold out
  const isSoldOut = event.availableSeats <= 0;

  // Get tickets from backend array or fallback to legacy pricing
  const tickets = event.tickets && event.tickets.length > 0
    ? event.tickets
    : [
        {
          id: 'general-fallback',
          name: 'General Admission',
          type: 'GENERAL' as const,
          description: 'Regular access',
          price: event.price,
          quantity: event.availableSeats,
          availableQuantity: event.availableSeats,
        },
        ...(event.vipPrice ? [{
          id: 'vip-fallback',
          name: 'VIP Ticket',
          type: 'VIP' as const,
          description: 'Priority access + exclusive perks',
          price: event.vipPrice,
          quantity: event.availableSeats,
          availableQuantity: event.availableSeats,
        }] : [])
      ];

  return (
    <div className="space-y-6 sticky top-24 self-start">
      <h2 className="text-2xl font-bold text-text-light">Select Tickets</h2>

      {/* Tickets */}
      {tickets.map((ticket) => (
        <div
          key={ticket.id}
          className={`bg-dark-elevated border-2 border-transparent hover:border-accent/40 p-6 rounded-xl transition-all group relative overflow-hidden ${
            ticket.type === 'VIP' ? 'bg-gradient-to-br from-dark-elevated to-dark-surface border-accent/30' : ''
          }`}
        >
          {/* Gradient overlay for VIP */}
          {ticket.type === 'VIP' && (
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 rounded-xl" />
          )}

          {ticket.type === 'VIP' && (
            <div className="absolute -top-3 left-6 bg-gradient-to-r from-primary to-accent px-4 py-1.5 rounded-full text-xs font-bold text-white shadow-lg">
              <span className="material-symbols-outlined text-sm mr-1">star</span>
              VIP EXCLUSIVE
            </div>
          )}

          <div className="flex items-center justify-between relative z-10">
            <div className="flex-1">
              <h3 className="font-bold text-lg text-text-light mb-2">{ticket.name}</h3>
              {ticket.description && (
                <p className="text-text-muted text-sm mb-3">{ticket.description}</p>
              )}
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                  ticket.availableQuantity > 10
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                    : ticket.availableQuantity > 0
                    ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                    : 'bg-red-500/20 text-red-400 border border-red-500/30'
                }`}>
                  <span className="material-symbols-outlined text-xs">
                    {ticket.availableQuantity > 10 ? 'check_circle' : ticket.availableQuantity > 0 ? 'warning' : 'error'}
                  </span>
                  {ticket.availableQuantity > 0 ? `${ticket.availableQuantity} left` : 'Sold out'}
                </span>
              </div>
            </div>
            <div className="text-right ml-4">
              <p className="text-2xl font-bold text-primary mb-1">{formatIDR(ticket.price)}</p>
              {ticket.type === 'VIP' && (
                <p className="text-xs text-accent font-medium">Premium Experience</p>
              )}
            </div>
          </div>
        </div>
      ))}

      {/* Vouchers Section */}
      {event.vouchers && event.vouchers.length > 0 && (
        <div className="bg-dark-surface border border-border-muted/20 p-6 rounded-xl">
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-accent">local_offer</span>
            <h3 className="font-bold text-lg text-text-light">Available Vouchers</h3>
          </div>
          <div className="space-y-3">
            {event.vouchers.filter(voucher => voucher.isActive).map((voucher) => (
              <div key={voucher.id} className="flex items-center justify-between bg-gradient-to-r from-dark-elevated to-dark-card p-4 rounded-lg border border-accent/10">
                <div>
                  <p className="font-bold text-text-light mb-1">{voucher.code}</p>
                  <p className="text-sm text-text-muted">
                    {voucher.discountType === 'PERCENTAGE'
                      ? `${voucher.discountValue}% discount`
                      : `${formatIDR(voucher.discountValue)} off`
                    }
                    {voucher.minPurchase && ` • Min. ${formatIDR(voucher.minPurchase)}`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-accent text-sm">check_circle</span>
                  <span className="text-xs text-accent font-medium">Active</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Buy Now Button */}
      <button
        onClick={onBuyNow}
        disabled={isSoldOut || isPastEvent}
        className={`w-full py-4 rounded-xl font-bold text-lg transition-all active:scale-[0.98] flex items-center justify-center gap-3 relative overflow-hidden ${
          isSoldOut || isPastEvent
            ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
            : 'bg-gradient-to-r from-primary via-primary to-accent text-white hover:shadow-[0_0_30px_rgba(192,193,255,0.4)] hover:scale-[1.02]'
        }`}
      >
        {/* Button gradient overlay */}
        {!isSoldOut && !isPastEvent && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 hover:opacity-100 transition-opacity" />
        )}

        <span className="material-symbols-outlined relative z-10">
          {isPastEvent ? 'event_busy' : isSoldOut ? 'event_busy' : 'shopping_cart_checkout'}
        </span>
        <span className="relative z-10">
          {isPastEvent ? 'Event Ended' : isSoldOut ? 'Event Sold Out' : 'Purchase Tickets'}
        </span>
      </button>
    </div>
  );
};
