"use client";

import React, { useEffect, useRef } from "react";
import { Power } from "lucide-react";

interface SpinPowerButtonProps {
  label?: string; // optional, for accessibility
  isHolding: boolean;
  onHoldStart: () => void;
  onHoldEnd: () => void;
  disabled?: boolean;
  isWaiting?: boolean;
  color?: "blue" | "green"; // color scheme
  texts?: {
    holdText?: string;
    idleText?: string;
    waitingText?: string;
  };
}

const SpinPowerButton: React.FC<SpinPowerButtonProps> = ({
  label,
  isHolding,
  onHoldStart,
  onHoldEnd,
  disabled = false,
  isWaiting = false,
  color = "blue",
  texts = {},
}) => {
  const colorSchemes = {
    blue: {
      normalFrom: "blue-500",
      normalTo: "purple-600",
      holdingFrom: "yellow-400",
      holdingTo: "orange-500",
    },
    green: {
      normalFrom: "green-500",
      normalTo: "emerald-600",
      holdingFrom: "yellow-400",
      holdingTo: "orange-500",
    },
  };

  return (
    <button
      aria-label={label}
      onMouseDown={onHoldStart}
      onMouseUp={onHoldEnd}
      onMouseLeave={onHoldEnd}
      onTouchStart={onHoldStart}
      onTouchEnd={onHoldEnd}
      disabled={disabled}
      className={`px-12 py-6 rounded-2xl font-bold text-xl transition-all transform shadow-2xl flex items-center justify-center gap-3 mx-auto min-w-[285px] ${
        isHolding
          ? `bg-gradient-to-r from-${colorSchemes[color].holdingFrom} to-${colorSchemes[color].holdingTo} scale-110 shadow-yellow-500/50`
          : `bg-gradient-to-r from-${colorSchemes[color].normalFrom} to-${colorSchemes[color].normalTo} hover:scale-105 disabled:from-gray-600 disabled:to-gray-700 disabled:scale-100`
      } text-white disabled:cursor-not-allowed`}
    >
      <Power className={isHolding ? "animate-spin" : ""} size={24} />
      {isHolding ? texts.holdText : isWaiting ? texts.waitingText : texts.idleText}
    </button>
  );
};

export default SpinPowerButton;
