import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { motion, Variants } from "framer-motion";
import RouletteWheel from "@/components/RouletteWheel";
import SpinPowerMeter from "@/components/SpinPowerMeter";
import SpinPowerButton from "@/components/SpinPowerButton";
import { a } from "framer-motion/client";

const METER_SPEED = 0.65;

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
  playAudio: (
    key: "burst" | "spinSuccess" | "merge" | "winnerIntro" | "winnerOutro",
  ) => void;
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
  playAudio,
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

  const alphabetFrameRef = useRef<number | null>(null);
  const digitFrameRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (alphabetTimerRef.current) clearInterval(alphabetTimerRef.current);
      if (digitTimerRef.current) clearInterval(digitTimerRef.current);
    };
  }, []);

  const getAvailableDigitsForAlphabet = useCallback(
    (alphabet: string) => {
      const alphabetConfig = config.find((c) => c.alphabet === alphabet);
      if (!alphabetConfig) return [];
      return alphabetConfig.digits.filter((digit) => {
        const combo = `${alphabet}${digit}`;
        return !drawn.includes(combo);
      });
    },
    [config, drawn],
  );

  const startHoldingAlphabet = useCallback(() => {
    setIsHoldingAlphabet(true);
    setAlphabetPower(0);
    let power = 0;

    const tick = () => {
      power = Math.min(power + METER_SPEED, 100);
      setAlphabetPower(power);
      if (power < 100) {
        alphabetFrameRef.current = requestAnimationFrame(tick);
      }
    };
    alphabetFrameRef.current = requestAnimationFrame(tick);
  }, []);

  const releaseAlphabet = useCallback(() => {
    if (!isHoldingAlphabet) return;
    setIsHoldingAlphabet(false);
    if (alphabetFrameRef.current) {
      cancelAnimationFrame(alphabetFrameRef.current);
    }

    if (alphabetPower > 5) {
      playAudio("burst");
      setAlphabetSpinning(true);
      setCanSpinAlphabet(false);
    } else {
      setAlphabetPower(0);
    }
  }, [alphabetPower, isHoldingAlphabet]);

  const startHoldingDigit = useCallback(() => {
    if (!canSpinDigit || digitSpinning) return;
    setIsHoldingDigit(true);
    setDigitPower(0);
    let power = 0;

    const tick = () => {
      power = Math.min(power + METER_SPEED, 100);
      setDigitPower(power);
      if (power < 100) {
        digitFrameRef.current = requestAnimationFrame(tick);
      }
    };
    digitFrameRef.current = requestAnimationFrame(tick);
  }, [canSpinDigit, digitSpinning]);

  const releaseDigit = useCallback(() => {
    if (!isHoldingDigit) return;
    setIsHoldingDigit(false);
    if (digitFrameRef.current) {
      cancelAnimationFrame(digitFrameRef.current);
    }

    if (digitPower > 5) {
      playAudio("burst");
      setDigitSpinning(true);
      setCanSpinDigit(false);
    } else {
      setDigitPower(0);
    }
  }, [digitPower, isHoldingDigit]);

  const handleWheelStop = (type: "alphabet" | "digit") => (item: string) => {
    playAudio("spinSuccess");
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
        playAudio("merge");
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
          power={alphabetPower}
          isHolding={isHoldingAlphabet}
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
          power={digitPower}
          isHolding={isHoldingDigit}
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
