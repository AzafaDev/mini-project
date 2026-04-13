import React from "react";

interface PasswordStrengthIndicatorProps {
  requirements: {
    lowercase: boolean;
    uppercase: boolean;
    number: boolean;
    special: boolean;
  };
}

export const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({
  requirements,
}) => {
  const items = [
    { label: "Lowercase", key: "lowercase" },
    { label: "Uppercase", key: "uppercase" },
    { label: "Number", key: "number" },
    { label: "Special Char", key: "special" },
  ];

  return (
    <div className="grid grid-cols-2 gap-2 mt-2">
      {items.map((item, idx) => {
        const isActive = requirements[item.key as keyof typeof requirements];
        return (
          <div
            key={idx}
            className="flex items-center gap-2 px-2 py-1.5 bg-[#353534] rounded-lg border border-transparent"
          >
            <span
              className={`material-symbols-outlined text-sm ${isActive ? "text-[#ffb4ab]" : "text-[#c7c4d8]"}`}
              style={{
                fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0",
              }}
            >
              {isActive ? "error" : "circle"}
            </span>
            <span className="text-[10px] uppercase tracking-tighter text-[#c7c4d8]">
              {item.label}
            </span>
          </div>
        );
      })}
    </div>
  );
};
