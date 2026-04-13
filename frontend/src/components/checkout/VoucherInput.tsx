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
    <div className="bg-[#1c1b1b] p-6 rounded-xl space-y-4">
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-[#ffb695]">
          confirmation_number
        </span>
        <h3 className="font-bold text-[#e5e2e1]">Voucher Code</h3>
      </div>
      <div className="flex gap-2">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="bg-[#0e0e0e] border-none text-[#e5e2e1] placeholder:text-zinc-600 rounded-lg px-4 py-3 flex-grow focus:ring-1 focus:ring-[#c0c1ff] outline-none"
          placeholder="ENTER CODE"
          type="text"
        />
        <button
          onClick={onApply}
          className="bg-[#353534] text-[#e5e2e1] px-6 py-3 rounded-lg font-bold hover:bg-[#393939] transition-all active:scale-95"
        >
          Apply
        </button>
      </div>
      <p className="text-[10px] text-[#c7c4d8] uppercase tracking-widest">
        Only one voucher per transaction
      </p>
    </div>
  );
};
