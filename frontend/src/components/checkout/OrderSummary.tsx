import React from "react";
import { formatIDR } from "../../lib/formatters";

interface OrderSummaryProps {
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  serviceFee: number;
  discount?: number;
  total: number;
}

export const OrderSummary: React.FC<OrderSummaryProps> = ({
  items,
  serviceFee,
  discount,
  total,
}) => {
  return (
    <div className="bg-dark-elevated rounded-xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 blur-[100px] rounded-full"></div>
      <h3 className="text-xl font-bold tracking-tight text-text-light mb-6 sm:mb-8">
        Order Summary
      </h3>

      <div className="space-y-3 sm:space-y-4 border-b border-border-muted/15 pb-6 sm:pb-8 mb-6 sm:mb-8">
        {items.map((item, idx) => (
          <div key={idx} className="flex justify-between text-sm">
            <span className="text-text-muted">
              {item.name} ({item.quantity}x)
            </span>
            <span className="text-text-light font-medium">
              {formatIDR(item.price * item.quantity)}
            </span>
          </div>
        ))}
        <div className="flex justify-between text-sm">
          <span className="text-text-muted">Service Fee</span>
          <span className="text-text-light font-medium">
            {formatIDR(serviceFee)}
          </span>
        </div>
      </div>

      {discount !== undefined && discount > 0 && (
        <div className="space-y-4 border-b border-border-muted/15 pb-8 mb-8">
          <div className="flex justify-between text-sm items-center">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-xs text-error-light">
                stars
              </span>
              <span className="text-text-muted">Points Applied</span>
            </div>
            <span className="text-error-light font-medium">
              - {formatIDR(discount)}
            </span>
          </div>
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

      <button className="w-full bg-gradient-to-br from-primary to-accent text-primary-dark py-4 rounded-xl font-bold text-lg hover:shadow-[0_0_25px_rgba(75,77,216,0.4)] transition-all active:scale-[0.98] flex items-center justify-center gap-3">
        Proceed to Payment
        <span className="material-symbols-outlined">arrow_forward</span>
      </button>

      <div className="mt-6 flex justify-center items-center gap-4 grayscale opacity-40">
        <span className="material-symbols-outlined text-2xl">credit_card</span>
        <span className="material-symbols-outlined text-2xl">account_balance_wallet</span>
        <span className="material-symbols-outlined text-2xl">qr_code_2</span>
      </div>
    </div>
  );
};
