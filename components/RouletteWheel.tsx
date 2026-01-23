import React, { useEffect, useRef, useState } from "react";
import { describeArc } from "@/lib/functions";
import { Zap } from "lucide-react";

interface RouletteWheelProps {
  items: string[];
  isStartSpinning: boolean;
  onWheelStop: (item: string) => void;
  power: number;
  color: "blue" | "green";
  disabled?: boolean;
  className?: string;
}

const DECELERATOR = 0.99;
const SOUND_INITIAL_PLAYBACK_RATE = 1.5;
const SOUND_INITIAL_VOLUME = 0.6;

const RouletteWheel: React.FC<RouletteWheelProps> = ({
  items,
  isStartSpinning,
  onWheelStop,
  power,
  color,
  disabled = false,
  className,
}) => {
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const animationRef = useRef<number>(null);
  const velocityRef = useRef(0);
  const rotationRef = useRef(0);
  const spinAudioRef = useRef<HTMLAudioElement | null>(null);

  const colorSchemes = {
    blue: {
      primary: "#3b82f6",
      secondary: "#60a5fa",
      pointer: "#1e40af",
      text: "#ffffff",
    },
    green: {
      primary: "#10b981",
      secondary: "#34d399",
      pointer: "#047857",
      text: "#ffffff",
    },
  };

  const colors = colorSchemes[color];
  const segmentAngle = 360 / items.length;
  const isSingleItem = items.length === 1;

  useEffect(() => {
    const audio = new Audio("/sounds/wheel-spin.mp3");
    audio.loop = true;
    audio.volume = SOUND_INITIAL_VOLUME;
    spinAudioRef.current = audio;

    return () => {
      audio.pause();
      spinAudioRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (isStartSpinning && !isSpinning && !disabled) {
      startSpinning();
    }
  }, [isStartSpinning]);

  const startSpinning = () => {
    setIsSpinning(true);
    // Initial velocity based on power (power ranges affect spin duration)
    velocityRef.current = power * 2;
    rotationRef.current = rotation;

    const audio = spinAudioRef.current;
    if (audio) {
      audio.currentTime = 0;
      audio.playbackRate = SOUND_INITIAL_PLAYBACK_RATE; // full speed
      audio.volume = SOUND_INITIAL_VOLUME;
      audio.play().catch(() => {});
    }

    animate();
  };

  const animate = () => {
    // Deceleration factor
    velocityRef.current *= DECELERATOR;
    rotationRef.current += velocityRef.current;

    setRotation(rotationRef.current % 360);

    // 🔊 Sync sound with velocity
    const audio = spinAudioRef.current;
    if (audio) {
      const speed = Math.min(velocityRef.current / (power * 2), 1);

      // playbackRate: fast → slow
      audio.playbackRate = 0.5 + speed * 1.2;

      // volume: loud → soft
      audio.volume = 0.15 + speed * 0.45;
    }

    // Stop when velocity is very low
    if (velocityRef.current > 0.1) {
      animationRef.current = requestAnimationFrame(animate);
    } else {
      stopSpinning();
    }
  };

  const stopSpinning = () => {
    setIsSpinning(false);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    const audio = spinAudioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }

    // Calculate which item the pointer is pointing to
    // The pointer is at the top (270 degrees in our coordinate system)
    // We need to find which segment is currently at that position
    const currentRotation = rotationRef.current % 360;
    const normalizedRotation = (360 - currentRotation) % 360;
    const selectedIndex =
      Math.floor(normalizedRotation / segmentAngle) % items.length;

    onWheelStop(items[selectedIndex]);
  };

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <div
      className={`flex flex-col items-center justify-center p-8 pb-0 ${className}`}
    >
      <div className={`relative ${disabled ? "grayscale opacity-70" : ""}`}>
        {/* Pointer */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-10"
          style={{
            width: 0,
            height: 0,
            borderLeft: "20px solid transparent",
            borderRight: "20px solid transparent",
            borderTop: `30px solid ${colors.pointer}`,
            filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))",
          }}
        />

        {/* Wheel */}
        <div
          className={`relative rounded-full shadow-2xl z-1`}
          style={{
            width: "400px",
            height: "400px",
            transform: `rotate(${rotation}deg)`,
            transition: isSpinning ? "none" : "transform 0.5s ease-out",
            pointerEvents: disabled ? "none" : "auto",
            backgroundColor: disabled
              ? colorSchemes[color].primary
              : "transparent",
          }}
        >
          {/* Center decoration */}
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div
              className={`w-16 h-16 rounded-full  border-4 border-white shadow-2xl flex items-center justify-center bg-white`}
              // style={{ backgroundColor: colors.pointer }}
            >
              <img
                src={"/images/isoftstone_logo.png"}
                className={`${isSpinning ? "animate-pulse" : ""}`}
              />
            </div>
          </div>

          {/* Wheel segments */}
          <svg width="400" height="400" className="absolute top-0 left-0">
            <defs>
              {items.map((_, index) => (
                <clipPath id={`segment-${index}`} key={`clip-${index}`}>
                  <path
                    d={describeArc(
                      200,
                      200,
                      200,
                      index * segmentAngle,
                      (index + 1) * segmentAngle,
                    )}
                  />
                </clipPath>
              ))}
            </defs>

            {items.map((item, index) => {
              const startAngle = index * segmentAngle;
              const middleAngle = startAngle + segmentAngle / 2;
              const segmentColor =
                index % 2 === 0 ? colors.primary : colors.secondary;

              return (
                <g key={index}>
                  {/* Segment background */}
                  {isSingleItem ? (
                    <circle
                      cx="200"
                      cy="200"
                      r="200"
                      fill={segmentColor}
                      stroke="white"
                      strokeWidth="2"
                    />
                  ) : (
                    <path
                      d={describeArc(
                        200,
                        200,
                        200,
                        startAngle,
                        (index + 1) * segmentAngle,
                      )}
                      fill={segmentColor}
                      stroke="white"
                      strokeWidth="2"
                    />
                  )}

                  {/* Text */}
                  <text
                    x={
                      200 + Math.cos(((middleAngle - 90) * Math.PI) / 180) * 130
                    }
                    y={
                      200 + Math.sin(((middleAngle - 90) * Math.PI) / 180) * 130
                    }
                    fill={colors.text}
                    fontSize="24"
                    fontWeight="600"
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    {item}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Status indicator */}
      <div className="mt-8 text-center">
        <p className="text-lg font-semibold text-white h-[28px]">
          {isSpinning ? "Spinning..." : disabled ? "" : "Ready to spin"}
        </p>
      </div>
    </div>
  );
};

export default React.memo(RouletteWheel);
