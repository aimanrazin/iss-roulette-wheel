import React, { useEffect, useRef } from "react";

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
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Init audio once
  useEffect(() => {
    const audio = new Audio("/sounds/power-charge.mp3");
    audio.loop = true;
    audio.volume = 0.4; // keep it soft & classy
    audioRef.current = audio;

    return () => {
      audio.pause();
      audioRef.current = null;
    };
  }, []);

  // Play / stop sound
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isHolding && power > 1) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
      audio.currentTime = 0;
    }
  }, [isHolding, power]);

  // Adjust playback rate based on power level
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    /**
     * playbackRate range:
     * 0.9 = slow hum
     * 1.4 = exciting charge
     */
    const minRate = 0.9;
    const maxRate = 1.4;

    audio.playbackRate = minRate + (power / 100) * (maxRate - minRate);
  }, [power]);

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
            ⚡ Power: {power.toFixed(1)}%
          </p>
        )}
      </div>
    </div>
  );
};

export default React.memo(SpinPowerMeter);
