"use client";

import React, { useState, useEffect } from "react";
import { Disc, RotateCcw } from "lucide-react";
import { redirect } from "next/navigation";
import { getConfig, setConfig, removeConfig } from "@/lib/storage";
import { STORAGE_KEYS } from "@/lib/constants";

type AlphabetConfig = {
  alphabet: string;
  digits: string[];
};

export default function Roulette() {
  const [config, setConfigState] = useState<AlphabetConfig[]>([]);
  const [drawn, setDrawnState] = useState<string[]>([]);

  const [currentAlphabet, setCurrentAlphabet] = useState<string | null>(null);
  const [currentDigit, setCurrentDigit] = useState<string | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [canSpinDigit, setCanSpinDigit] = useState(false);
  const [showResult, setShowResult] = useState(false);

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
    setCurrentAlphabet(null);
    setCurrentDigit(null);
    setShowResult(false);
    setCanSpinDigit(false);
    navigateToSetup();
  };

  const navigateToSetup = () => {
    redirect("/setup");
  };

  /* ------------------ LOGIC ------------------ */
  const getAvailableCombinations = () => {
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
  };

  const spinAlphabet = () => {
    setIsSpinning(true);
    setShowResult(false);
    setCurrentDigit(null);

    const available = getAvailableCombinations();
    if (available.length === 0) {
      alert("No more combinations available!");
      setIsSpinning(false);
      return;
    }

    let count = 0;
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * config.length);
      setCurrentAlphabet(config[randomIndex].alphabet);
      count++;

      if (count > 30) {
        clearInterval(interval);

        const alphabets = [...new Set(available.map((a) => a.alphabet))];
        const finalAlphabet =
          alphabets[Math.floor(Math.random() * alphabets.length)];

        setCurrentAlphabet(finalAlphabet);
        setIsSpinning(false);
        setCanSpinDigit(true);
      }
    }, 80);
  };

  const spinDigit = () => {
    if (!currentAlphabet) return;

    setIsSpinning(true);

    const alphabetConfig = config.find((c) => c.alphabet === currentAlphabet);

    if (!alphabetConfig) return;

    const availableDigits = alphabetConfig.digits.filter((digit) => {
      const combo = `${currentAlphabet}${digit}`;
      return !drawn.includes(combo);
    });

    if (availableDigits.length === 0) {
      alert("No available digits for this alphabet!");
      setIsSpinning(false);
      return;
    }

    let count = 0;
    const interval = setInterval(() => {
      const randomIndex = Math.floor(
        Math.random() * alphabetConfig.digits.length
      );
      setCurrentDigit(alphabetConfig.digits[randomIndex]);
      count++;

      if (count > 30) {
        clearInterval(interval);

        const finalDigit =
          availableDigits[Math.floor(Math.random() * availableDigits.length)];

        setCurrentDigit(finalDigit);

        const result = `${currentAlphabet}${finalDigit}`;
        saveDrawn([...drawn, result]);

        setIsSpinning(false);
        setCanSpinDigit(false);
        setShowResult(true);
      }
    }, 80);
  };

  const nextDraw = () => {
    setCurrentAlphabet(null);
    setCurrentDigit(null);
    setShowResult(false);
    setCanSpinDigit(false);
  };

  const available = getAvailableCombinations();
  const total = config.reduce((sum, item) => sum + item.digits.length, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-blue-600 mb-4">
            🎡 Lucky Draw
          </h1>
          <div className="flex justify-center gap-3 flex-wrap">
            <span className="px-4 py-2 bg-blue-500 text-white rounded-full text-sm font-medium">
              Total: {total}
            </span>
            <span className="px-4 py-2 bg-green-500 text-white rounded-full text-sm font-medium">
              Remaining: {available.length}
            </span>
            <span className="px-4 py-2 bg-red-500 text-white rounded-full text-sm font-medium">
              Drawn: {drawn.length}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-8 mb-6">
          <div className="space-y-12">
            {/* Alphabet Wheel */}
            <div>
              <h2 className="text-xl font-semibold text-gray-600 text-center mb-4">
                Alphabet
              </h2>
              <div className="flex flex-col items-center">
                <div
                  className={`w-48 h-48 border-8 border-blue-500 rounded-full flex items-center justify-center bg-gray-50 transition-transform duration-100 ${
                    isSpinning && !canSpinDigit ? "animate-spin" : ""
                  }`}
                >
                  <span className="text-7xl font-bold text-blue-600">
                    {currentAlphabet || "?"}
                  </span>
                </div>
                <button
                  onClick={spinAlphabet}
                  disabled={isSpinning || showResult}
                  className="mt-6 px-8 py-3 bg-blue-600 text-white rounded-xl font-semibold text-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2 transition-all transform hover:scale-105"
                >
                  <Disc size={20} />
                  Spin Alphabet
                </button>
              </div>
            </div>

            {/* Digit Wheel */}
            <div>
              <h2 className="text-xl font-semibold text-gray-600 text-center mb-4">
                Digit
              </h2>
              <div className="flex flex-col items-center">
                <div
                  className={`w-48 h-48 border-8 rounded-full flex items-center justify-center transition-all duration-100 ${
                    canSpinDigit
                      ? "border-green-500 bg-gray-50"
                      : "border-gray-300 bg-gray-100"
                  } ${isSpinning && canSpinDigit ? "animate-spin" : ""}`}
                >
                  <span
                    className={`text-7xl font-bold ${
                      canSpinDigit ? "text-green-600" : "text-gray-400"
                    }`}
                  >
                    {currentDigit || "?"}
                  </span>
                </div>
                <button
                  onClick={spinDigit}
                  disabled={!canSpinDigit || isSpinning}
                  className="mt-6 px-8 py-3 bg-green-600 text-white rounded-xl font-semibold text-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2 transition-all transform hover:scale-105"
                >
                  <Disc size={20} />
                  Spin Digit
                </button>
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
                  {currentAlphabet}
                  {currentDigit}
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
        </div>

        <div className="text-center">
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
