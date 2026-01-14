import React from "react";

interface SpinPowerMeterProps {
  label: string;
  alphabetPower: number;
  isHoldingAlphabet: boolean;
}

const SpinPowerMeter: React.FC<SpinPowerMeterProps> = ({
  label,
  alphabetPower,
  isHoldingAlphabet,
}) => {
  return (
    <div className="text-center mb-2">
      <h2 className="text-3xl font-bold text-white mb-2">{label}</h2>
      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-100"
          style={{ width: `${alphabetPower}%` }}
        />
      </div>
      <div className="h-[20px] mt-2">
        {isHoldingAlphabet && (
          <p className="text-yellow-400 text-sm font-semibold animate-pulse">
            ⚡ Power: {alphabetPower}%
          </p>
        )}
      </div>
    </div>
  );
};

export default SpinPowerMeter;
