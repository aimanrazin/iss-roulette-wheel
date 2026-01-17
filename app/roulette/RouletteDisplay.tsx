import React, { useMemo, useRef, useState } from "react";
import { motion, Variants } from "framer-motion";
import RouletteWheel from "@/components/RouletteWheel";
import SpinPowerMeter from "@/components/SpinPowerMeter";
import SpinPowerButton from "@/components/SpinPowerButton";

interface RouletteDisplayProps {
  config: {
    alphabet: string;
    digits: string[];
  }[];
  drawn: string[];
  selectedAlphabet: string | null;
  setSelectedAlphabet: (alphabet: string | null) => void;
  selectedDigit: string | null;
  setSelectedDigit: (digit: string | null) => void;
  setShowResult: (show: boolean) => void;
  canSpinAlphabet: boolean;
  setCanSpinAlphabet: (canSpin: boolean) => void;
  canSpinDigit: boolean;
  setCanSpinDigit: (canSpin: boolean) => void;
}

const RouletteDisplay: React.FC<RouletteDisplayProps> = ({
  config,
  drawn,
  selectedAlphabet,
  setSelectedAlphabet,
  selectedDigit,
  setSelectedDigit,
  setShowResult,
  canSpinAlphabet,
  setCanSpinAlphabet,
  canSpinDigit,
  setCanSpinDigit,
}) => {
  const [isHoldingAlphabet, setIsHoldingAlphabet] = useState(false);
  const [alphabetPower, setAlphabetPower] = useState(0);
  const [alphabetSpinning, setAlphabetSpinning] = useState(false);

  const [isHoldingDigit, setIsHoldingDigit] = useState(false);
  const [digitPower, setDigitPower] = useState(0);
  const [digitSpinning, setDigitSpinning] = useState(false);

  const [isMerging, setIsMerging] = useState(false);

  const alphabetTimerRef = useRef<NodeJS.Timeout | null>(null);
  const digitTimerRef = useRef<NodeJS.Timeout | null>(null);

  const getAvailableDigitsForAlphabet = (alphabet: string) => {
    const alphabetConfig = config.find((c) => c.alphabet === alphabet);
    if (!alphabetConfig) return [];
    return alphabetConfig.digits.filter((digit) => {
      const combo = `${alphabet}${digit}`;
      return !drawn.includes(combo);
    });
  };

  const startHoldingAlphabet = () => {
    setIsHoldingAlphabet(true);
    setAlphabetPower(0);

    alphabetTimerRef.current = setInterval(() => {
      setAlphabetPower((prev) => Math.min(prev + 1, 100));
    }, 30);
  };

  const releaseAlphabet = () => {
    if (!isHoldingAlphabet) return;
    setIsHoldingAlphabet(false);
    alphabetTimerRef.current && clearInterval(alphabetTimerRef.current);

    if (alphabetPower > 5) {
      setAlphabetSpinning(true);
      setCanSpinAlphabet(false);
    } else {
      setAlphabetPower(0);
    }
  };

  const startHoldingDigit = () => {
    if (!canSpinDigit || digitSpinning) return;
    setIsHoldingDigit(true);
    setDigitPower(0);

    digitTimerRef.current = setInterval(() => {
      setDigitPower((prev) => Math.min(prev + 1, 100));
    }, 30);
  };

  const releaseDigit = () => {
    if (!isHoldingDigit) return;
    setIsHoldingDigit(false);

    digitTimerRef.current && clearInterval(digitTimerRef.current);

    if (digitPower > 5) {
      setDigitSpinning(true);
      setCanSpinDigit(false);
    } else {
      setDigitPower(0);
    }
  };

  const handleWheelStop = (type: "alphabet" | "digit") => (item: string) => {
    if (type === "alphabet") {
      setSelectedAlphabet(item);
      setAlphabetSpinning(false);
      setAlphabetPower(0);

      const availableDigits = getAvailableDigitsForAlphabet(item);
      // check if only one digit is available, auto-select it
      if (availableDigits.length === 1) {
        setSelectedDigit(availableDigits[0]);
        setShowResult(true);
      } else {
        setCanSpinDigit(true);
      }
    } else {
      setSelectedDigit(item);
      setDigitSpinning(false);
      setDigitPower(0);
      setTimeout(() => {
        setIsMerging(true);
      }, 800);
      setTimeout(() => {
        setShowResult(true);
      }, 1400);
    }
  };

  const allAlphabets = useMemo(() => {
    return config
      .filter((item) => getAvailableDigitsForAlphabet(item.alphabet).length > 0)
      .map((item) => item.alphabet);
  }, [config, drawn]);

  const mergeVariants: Variants = {
    bounceIn: {
      y: 0,
      scale: 1,
      transition: { type: "spring", stiffness: 400, damping: 20 },
    },
    toRight: { y: 0, x: 245, scale: 0.95 },
    toLeft: { y: 0, x: -245, scale: 0.95 },
    merge: {
      // x: 0,
      scale: 1.15,
      transition: { type: "spring", stiffness: 300, damping: 20 },
    },
  };

  return (
    <div className="grid md:grid-cols-2 gap-8">
      {/* Alphabet Wheel */}
      <div className="relative">
        <SpinPowerMeter
          label="Alphabet Wheel"
          alphabetPower={alphabetPower}
          isHoldingAlphabet={isHoldingAlphabet}
        />

        <div className="relative">
          <RouletteWheel
            items={allAlphabets.length > 0 ? allAlphabets : Array(4).fill("?")}
            isStartSpinning={alphabetSpinning}
            onWheelStop={handleWheelStop("alphabet")}
            power={alphabetPower}
            color="blue"
            disabled={
              allAlphabets.length === 0 ||
              (!canSpinAlphabet && !!selectedAlphabet)
            }
            className={
              selectedAlphabet && !alphabetSpinning ? "backdrop-blur-md" : ""
            }
          />

          {/* Bounce selected alphabet */}
          {selectedAlphabet && !alphabetSpinning && (
            <motion.div
              key={selectedAlphabet}
              initial={{ y: -50, scale: 0 }}
              // animate={{ y: 0, scale: 1 }}
              // transition={{ type: "spring", stiffness: 400, damping: 20 }}
              // initial={"idle"}
              animate={isMerging ? ["toRight", "merge"] : "bounceIn"}
              variants={mergeVariants}
              transition={{ duration: 0.4 }}
              className="absolute left-1/2 z-20 -translate-x-1/2 -translate-y-1/2 text-7xl font-bold text-yellow-400 drop-shadow-xl min-w-[145px] h-[145px] text-center"
              style={{ top: "calc(50% - 10px)" }}
            >
              <div className="bg-white rounded-2xl shadow-2xl p-8 animate-bounce-in h-full flex items-center justify-center">
                <div className="text-7xl font-bold text-purple-600">
                  {selectedAlphabet}
                </div>
              </div>
            </motion.div>
          )}
        </div>

        <div className="text-center my-6">
          <SpinPowerButton
            label="Alphabet Spin Button"
            isHolding={isHoldingAlphabet}
            onHoldStart={startHoldingAlphabet}
            onHoldEnd={releaseAlphabet}
            disabled={allAlphabets.length === 0 || !canSpinAlphabet}
            color="blue"
            texts={{
              holdText: "HOLD...",
              idleText: "PRESS & HOLD",
            }}
          />
        </div>
      </div>

      {/* Digit Wheel */}
      <div className="relative">
        <SpinPowerMeter
          label="Digit Wheel"
          alphabetPower={digitPower}
          isHoldingAlphabet={isHoldingDigit}
        />

        <div className="relative">
          <RouletteWheel
            items={
              selectedAlphabet
                ? getAvailableDigitsForAlphabet(selectedAlphabet)
                : Array(4).fill("?")
            }
            isStartSpinning={digitSpinning}
            onWheelStop={handleWheelStop("digit")}
            power={digitPower}
            color="green"
            disabled={!selectedAlphabet || !!selectedDigit}
          />

          {/* Bounce selected digit */}
          {selectedDigit && !digitSpinning && (
            <motion.div
              key={selectedDigit}
              initial={{ y: -50, scale: 0 }}
              // animate={{ y: 0, scale: 1 }}
              // transition={{ type: "spring", stiffness: 400, damping: 20 }}
              // initial={"idle"}
              animate={isMerging ? ["toLeft", "merge"] : "bounceIn"}
              variants={mergeVariants}
              transition={{ duration: 0.4 }}
              className="absolute left-1/2 z-20 -translate-x-1/2 -translate-y-1/2 text-7xl font-bold text-yellow-400 drop-shadow-xl min-w-[145px] h-[145px] text-center"
              style={{ top: "calc(50% - 10px)" }}
            >
              <div className="bg-white rounded-2xl shadow-2xl p-8 animate-bounce-in h-full flex items-center justify-center">
                <div className="text-7xl font-bold text-emerald-600">
                  {selectedDigit}
                </div>
              </div>
            </motion.div>
          )}
        </div>

        <div className="text-center my-6">
          <SpinPowerButton
            label="Digit Spin Button"
            isHolding={isHoldingDigit}
            onHoldStart={startHoldingDigit}
            onHoldEnd={releaseDigit}
            disabled={!canSpinDigit}
            isWaiting={!canSpinDigit && !selectedAlphabet}
            color="green"
            texts={{
              holdText: "HOLD...",
              idleText: "PRESS & HOLD",
              waitingText: "WAITING...",
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default RouletteDisplay;
