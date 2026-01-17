"use client";

import React from "react";
import { Power } from "lucide-react";

interface SpinPowerButtonProps {
  label?: string;
  isHolding: boolean;
  onHoldStart: () => void;
  onHoldEnd: () => void;
  disabled?: boolean;
  isWaiting?: boolean;
  color?: "blue" | "green";
  texts?: {
    holdText?: string;
    idleText?: string;
    waitingText?: string;
  };
}

const GRADIENTS = {
  blue: {
    normal: "bg-gradient-to-r from-blue-500 to-purple-600",
    holding: "bg-gradient-to-r from-yellow-400 to-orange-500",
  },
  green: {
    normal: "bg-gradient-to-r from-green-500 to-emerald-600",
    holding: "bg-gradient-to-r from-yellow-400 to-orange-500",
  },
} as const;

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
  const {
    holdText = "HOLD...",
    idleText = "PRESS & HOLD",
    waitingText = "WAITING...",
  } = texts;

  return (
    <button
      aria-label={label}
      onMouseDown={onHoldStart}
      onMouseUp={onHoldEnd}
      onMouseLeave={onHoldEnd}
      onTouchStart={onHoldStart}
      onTouchEnd={onHoldEnd}
      disabled={disabled}
      className={`
        px-12 py-6 rounded-2xl font-bold text-xl
        transition-all transform shadow-2xl
        flex items-center justify-center gap-3
        mx-auto min-w-[285px] select-none
        text-white disabled:cursor-not-allowed
        ${
          isHolding
            ? `${GRADIENTS[color].holding} scale-110 shadow-yellow-500/50`
            : `${GRADIENTS[color].normal} hover:scale-105 disabled:from-gray-600 disabled:to-gray-700 disabled:scale-100`
        }
      `}
    >
      <Power className={isHolding ? "animate-spin" : ""} size={24} />
      {isHolding ? holdText : isWaiting ? waitingText : idleText}
    </button>
  );
};

export default SpinPowerButton;
