import React from "react";

interface SpinPowerMeterProps {
  label: string;
  power: number;
  isHolding: boolean;
}

const SpinPowerMeter: React.FC<SpinPowerMeterProps> = ({
  label,
  power,
  isHolding,
}) => {
  return (
    <div className="text-center">
      <h2 className="text-3xl font-bold text-white mb-2">{label}</h2>
      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 origin-left transition-transform duration-100"
          style={{ transform: `scaleX(${power / 100})` }}
        />
      </div>

      <div className="h-[20px] mt-2">
        {isHolding && power > 10 && (
          <p className="text-yellow-400 text-sm font-semibold animate-pulse">
            ⚡ Power: {power}%
          </p>
        )}
      </div>
    </div>
  );
};

export default React.memo(SpinPowerMeter);
