import React from "react";

interface VoucherInputProps {
  value: string;
  onChange: (value: string) => void;
  onApply: () => void;
}

export const VoucherInput: React.FC<VoucherInputProps> = ({
  value,
  onChange,
  onApply,
}) => {
  return (
    <div className="bg-dark-surface p-6 rounded-xl space-y-4">
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-warning">
          confirmation_number
        </span>
        <h3 className="font-bold text-text-light">Voucher Code</h3>
      </div>
      <div className="flex gap-2">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="bg-dark-darker border-none text-text-light placeholder:text-zinc-600 rounded-lg px-4 py-3 flex-grow focus:ring-1 focus:ring-primary outline-none"
          placeholder="ENTER CODE"
          type="text"
        />
        <button
          onClick={onApply}
          className="bg-dark-card text-text-light px-6 py-3 rounded-lg font-bold hover:bg-dark-card-hover transition-all active:scale-95"
        >
          Apply
        </button>
      </div>
      <p className="text-[10px] text-text-muted uppercase tracking-widest">
        Only one voucher per transaction
      </p>
    </div>
  );
};
