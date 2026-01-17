"use client";

import React, { useState, useEffect, useMemo } from "react";
import { RotateCcw } from "lucide-react";
import { redirect } from "next/navigation";
import { getConfig, setConfig, removeConfig } from "@/lib/storage";
import { STORAGE_KEYS } from "@/lib/constants";
import DrawnHistoryModal from "@/components/DrawnHistoryModal";
import Confetti from "react-confetti";
import RouletteDisplay from "./RouletteDisplay";
import ResultDisplay from "./ResultDisplay";
import ReactConfetti from "react-confetti";
import FireflyParticles from "@/components/FireflyParticles";

type AlphabetConfig = {
  alphabet: string;
  digits: string[];
};

/* TODO: Implement logic to remove alphabets when all combinations are drawn ✅ */
/* TODO: Implement auto select digit if all combinations for that alphabet are drawn ✅ */
/* TODO: Implement drawn history ✅*/
/* TODO: Enhance the UI to show the popup of the drawn combination, make it more visually appealing ✅*/
/* TODO: Adding sound effects when spinning, releasing and when final combination is drawn */
/* TODO: Change the color theme */

export default function Roulette() {
  const [config, setConfigState] = useState<AlphabetConfig[]>([]);
  const [drawn, setDrawnState] = useState<string[]>([]);

  const [selectedAlphabet, setSelectedAlphabet] = useState<string | null>(null);
  const [selectedDigit, setSelectedDigit] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);

  const [canSpinAlphabet, setCanSpinAlphabet] = useState(true);

  const [canSpinDigit, setCanSpinDigit] = useState(false);

  const [showHistory, setShowHistory] = useState(false);
  const [showCombined, setShowCombined] = useState(false);

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

  const nextDraw = () => {
    setSelectedAlphabet(null);
    setSelectedDigit(null);
    setShowResult(false);
    setCanSpinAlphabet(true);
    setCanSpinDigit(false);
    setShowCombined(false);
    saveDrawn([...drawn, `${selectedAlphabet}${selectedDigit}`]);
  };

  const handleShowHistory = () => {
    setShowHistory(true);
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

  return (
    <>
      <div className="min-h-screen min-w-fit bg-gradient-to-br max-h-screen from-slate-900 via-purple-900 to-slate-900 p-4 flex justify-center items-center">
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
              <button
                onClick={handleShowHistory}
                className="px-4 py-2 bg-red-500/80 backdrop-blur text-white rounded-full text-sm font-medium shadow-lg hover:bg-red-600 transition-all cursor-pointer"
              >
                Drawn: {drawn.length}
              </button>
            </div>
          </div>

          {showResult ? (
            <ResultDisplay
              selectedAlphabet={selectedAlphabet}
              selectedDigit={selectedDigit}
              nextDraw={nextDraw}
              available={available.map((item) => item.alphabet + item.digit)}
            />
          ) : (
            <RouletteDisplay
              config={config}
              drawn={drawn}
              selectedAlphabet={selectedAlphabet}
              setSelectedAlphabet={setSelectedAlphabet}
              selectedDigit={selectedDigit}
              setSelectedDigit={setSelectedDigit}
              setShowResult={setShowResult}
              canSpinAlphabet={canSpinAlphabet}
              setCanSpinAlphabet={setCanSpinAlphabet}
              canSpinDigit={canSpinDigit}
              setCanSpinDigit={setCanSpinDigit}
            />
          )}

          {!showResult && (
            <div className="mt-12 text-center">
              <button
                onClick={handleReset}
                className="px-6 py-2 border-2 border-gray-400 text-gray-300 rounded-xl font-medium hover:bg-gray-700 flex items-center gap-2 mx-auto transition-all"
              >
                <RotateCcw size={18} />
                Reset & Setup
              </button>
            </div>
          )}
        </div>

        <DrawnHistoryModal
          drawn={drawn}
          isOpen={showHistory}
          onClose={() => setShowHistory(false)}
        />
      </div>
      <FireflyParticles />
    </>
  );
}
