"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { RotateCcw } from "lucide-react";
import { redirect } from "next/navigation";
import { getConfig, setConfig, removeConfig } from "@/lib/storage";
import { STORAGE_KEYS } from "@/lib/constants";
import SpinPowerMeter from "@/components/SpinPowerMeter";
import RouletteWheel from "@/components/RouletteWheel";
import SpinPowerButton from "@/components/SpinPowerButton";

type AlphabetConfig = {
  alphabet: string;
  digits: string[];
};

/* TODO: Implement logic to remove alphabets when all combinations are drawn */
/* TODO: Enhance the UI to show the popup of the drawn combination, make it more visually appealing */
/* TODO: Adding sound effects when spinning, releasing and when final combination is drawn */

export default function Roulette() {
  const [config, setConfigState] = useState<AlphabetConfig[]>([]);
  const [drawn, setDrawnState] = useState<string[]>([]);

  const [selectedAlphabet, setSelectedAlphabet] = useState<string | null>(null);
  const [selectedDigit, setSelectedDigit] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);

  const [isHoldingAlphabet, setIsHoldingAlphabet] = useState(false);
  const [alphabetPower, setAlphabetPower] = useState(0);
  const [alphabetSpinning, setAlphabetSpinning] = useState(false);
  const [canSpinAlphabet, setCanSpinAlphabet] = useState(true);
  const alphabetTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [isHoldingDigit, setIsHoldingDigit] = useState(false);
  const [digitPower, setDigitPower] = useState(0);
  const [digitSpinning, setDigitSpinning] = useState(false);
  const [canSpinDigit, setCanSpinDigit] = useState(false);
  const digitTimerRef = useRef<NodeJS.Timeout | null>(null);

  const allAlphabets = useMemo(
    () => config.map((item) => item.alphabet),
    [config]
  );

  useEffect(() => {
    const savedConfig = getConfig<AlphabetConfig[]>(STORAGE_KEYS.CONFIG);
    const savedDrawn = getConfig<string[]>(STORAGE_KEYS.DRAWN);

    if (savedConfig && savedConfig.length > 0) {
      setConfigState(savedConfig);
    }

    if (savedDrawn) {
      setDrawnState(savedDrawn);
    }
  }, []);

  const saveDrawn = (newDrawn: string[]) => {
    setDrawnState(newDrawn);
    setConfig(STORAGE_KEYS.DRAWN, newDrawn);
  };

  const handleReset = () => {
    removeConfig(STORAGE_KEYS.CONFIG);
    removeConfig(STORAGE_KEYS.DRAWN);

    setConfigState([]);
    setDrawnState([]);
    setSelectedAlphabet(null);
    setSelectedDigit(null);
    setShowResult(false);
    setCanSpinAlphabet(true);
    setCanSpinDigit(false);
    navigateToSetup();
  };

  const navigateToSetup = () => {
    redirect("/setup");
  };

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
    setCanSpinAlphabet(false);
    alphabetTimerRef.current && clearInterval(alphabetTimerRef.current);

    if (alphabetPower > 5) {
      setAlphabetSpinning(true);
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
    setCanSpinDigit(false);

    digitTimerRef.current && clearInterval(digitTimerRef.current);

    if (digitPower > 5) {
      setDigitSpinning(true);
    } else {
      setDigitPower(0);
    }
  };

  const handleWheelStop = (type: "alphabet" | "digit") => (item: string) => {
    if (type === "alphabet") {
      setSelectedAlphabet(item);
      setAlphabetSpinning(false);
      setAlphabetPower(0);
      setCanSpinDigit(true);
    } else {
      setSelectedDigit(item);
      setDigitSpinning(false);
      setDigitPower(0);
      setShowResult(true);
    }
  };

  const nextDraw = () => {
    setSelectedAlphabet(null);
    setSelectedDigit(null);
    setShowResult(false);
    setCanSpinAlphabet(true);
    setCanSpinDigit(false);
    saveDrawn([...drawn, `${selectedAlphabet}${selectedDigit}`]);
  };

  const available = useMemo(() => {
    const all: { alphabet: string; digit: string }[] = [];
    config.forEach((item) => {
      item.digits.forEach((digit) => {
        const combo = `${item.alphabet}${digit}`;
        if (!drawn.includes(combo)) {
          all.push({ alphabet: item.alphabet, digit });
        }
      });
    });
    return all;
  }, [config, drawn]);

  const total = config.reduce((sum, item) => sum + item.digits.length, 0);

  console.log("aiman canSpinAlphabet", canSpinAlphabet);
  console.log("aiman selectedAlphabet", selectedAlphabet);

  return (
    <div className="min-h-screen min-w-fit bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-pink-500 mb-4 drop-shadow-lg">
            🎡 Lucky Draw
          </h1>
          <div className="flex justify-center gap-3 flex-wrap">
            <span className="px-4 py-2 bg-blue-500/80 backdrop-blur text-white rounded-full text-sm font-medium shadow-lg">
              Total: {total}
            </span>
            <span className="px-4 py-2 bg-green-500/80 backdrop-blur text-white rounded-full text-sm font-medium shadow-lg">
              Remaining: {available.length}
            </span>
            <span className="px-4 py-2 bg-red-500/80 backdrop-blur text-white rounded-full text-sm font-medium shadow-lg">
              Drawn: {drawn.length}
            </span>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Alphabet Wheel */}
          <div className="relative">
            <SpinPowerMeter
              label="Alphabet Wheel"
              alphabetPower={alphabetPower}
              isHoldingAlphabet={isHoldingAlphabet}
            />

            <RouletteWheel
              items={
                allAlphabets.length > 0 ? allAlphabets : Array(4).fill("?")
              }
              isStartSpinning={alphabetSpinning}
              onWheelStop={handleWheelStop("alphabet")}
              power={alphabetPower}
              color="blue"
              disabled={!canSpinAlphabet && !!selectedAlphabet}
            />

            <div className="text-center my-6">
              <SpinPowerButton
                label="Alphabet Spin Button"
                isHolding={isHoldingAlphabet}
                onHoldStart={startHoldingAlphabet}
                onHoldEnd={releaseAlphabet}
                disabled={!canSpinAlphabet}
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

        {/* Result Display */}
        {showResult && (
          <div className="mt-12 text-center animate-fadeIn">
            <h2 className="text-2xl font-semibold text-gray-600 mb-4">
              🎉 Lucky Draw Result
            </h2>
            <div className="inline-block p-8 rounded-3xl bg-gradient-to-r from-yellow-400 to-orange-400 border-4 border-orange-500 shadow-xl transform scale-110">
              <span className="text-8xl font-bold text-white drop-shadow-lg">
                {selectedAlphabet}
                {selectedDigit}
              </span>
            </div>
            <div className="mt-8">
              <button
                onClick={nextDraw}
                disabled={available.length === 0}
                className="px-8 py-3 bg-purple-600 text-white rounded-xl font-semibold text-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all"
              >
                {available.length === 0 ? "All Done!" : "Next Draw"}
              </button>
            </div>
          </div>
        )}

        <div className="mt-12 text-center">
          <button
            onClick={handleReset}
            className="px-6 py-2 border-2 border-gray-400 text-gray-700 rounded-xl font-medium hover:bg-gray-100 flex items-center gap-2 mx-auto transition-all"
          >
            <RotateCcw size={18} />
            Reset & Setup
          </button>
        </div>
      </div>
    </div>
  );
}
