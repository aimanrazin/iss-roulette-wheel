"use client";

import React, { useEffect, useState } from "react";
import { Plus, Trash2, Settings, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { getConfig, setConfig } from "@/lib/storage";
import { STORAGE_KEYS, SLIDER_RANGE_DIGITS } from "@/lib/constants";

type AlphabetConfig = {
  alphabet: string;
  digits: string[];
};

const SetupPage = () => {
  const router = useRouter();

  const [config, setConfigState] = useState<AlphabetConfig[]>([]);
  const [alphabetInput, setAlphabetInput] = useState("");
  const [digitRange, setDigitRange] = useState<[number, number]>([1, 10]);
  const [customDigits, setCustomDigits] = useState<string[]>([]);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [newDigitInput, setNewDigitInput] = useState("");

  // 🔹 Load config from localStorage on mount
  useEffect(() => {
    const saved = getConfig<AlphabetConfig[]>(STORAGE_KEYS.CONFIG);
    if (saved) {
      setConfigState(saved);
      if (saved.length > 0) {
        router.push("/roulette");
      }
    }
  }, []);

  // 🔹 Persist config whenever it changes
  useEffect(() => {
    setConfig(STORAGE_KEYS.CONFIG, config);
  }, [config]);

  useEffect(() => {
    const generated: string[] = [];
    for (let i = digitRange[0]; i <= digitRange[1]; i++) {
      generated.push(i.toString());
    }
    setCustomDigits(generated);
  }, [digitRange]);

  const addCustomDigit = () => {
    const digit = newDigitInput.trim();
    if (!digit) return;
    if (customDigits.includes(digit)) {
      alert("This digit already exists");
      return;
    }
    setCustomDigits([...customDigits, digit]);
    setNewDigitInput("");
  };

  const removeDigit = (digit: string) => {
    setCustomDigits(customDigits.filter((d) => d !== digit));
  };

  const addOrUpdateAlphabet = () => {
    if (!alphabetInput.trim()) {
      alert("Please enter an alphabet");
      return;
    }

    if (customDigits.length === 0) {
      alert("Please add at least one digit");
      return;
    }

    const newItem: AlphabetConfig = {
      alphabet: alphabetInput.toUpperCase(),
      digits: [...customDigits],
    };

    if (
      editIndex === null &&
      config.some((item) => item.alphabet === newItem.alphabet)
    ) {
      alert("Alphabet already exists");
      return;
    }

    const updated =
      editIndex !== null
        ? config.map((item, i) => (i === editIndex ? newItem : item))
        : [...config, newItem];

    setConfigState(updated);
    setAlphabetInput("");
    setDigitRange([1, 10]);
    setCustomDigits([]);
    setEditIndex(null);
  };

  const deleteAlphabet = (index: number) => {
    setConfigState(config.filter((_, i) => i !== index));
  };

  const editAlphabet = (index: number) => {
    const item = config[index];
    setAlphabetInput(item.alphabet);
    setCustomDigits([...item.digits]);

    const nums = item.digits
      .map((d) => parseInt(d))
      .filter((n) => !isNaN(n))
      .sort((a, b) => a - b);

    if (nums.length) {
      setDigitRange([nums[0], nums[nums.length - 1]]);
    }

    setEditIndex(index);
  };

  const handleStart = () => {
    if (config.length === 0) {
      alert("Please add at least one alphabet configuration");
      return;
    }
    router.push("/roulette");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-5xl font-bold text-blue-600 text-center mb-8">
          🎡 Lucky Draw Setup
        </h1>

        <div className="bg-white rounded-3xl shadow-2xl p-8 mb-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Add Alphabet & Digits
          </h2>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Alphabet (e.g., A)
              </label>
              <input
                type="text"
                value={alphabetInput}
                onChange={(e) => setAlphabetInput(e.target.value)}
                maxLength={1}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none text-lg"
                placeholder="Enter a single letter"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Digit Range
              </label>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-gray-600 w-12">
                    From:
                  </span>
                  <input
                    type="range"
                    min={SLIDER_RANGE_DIGITS.MIN}
                    max={SLIDER_RANGE_DIGITS.MAX}
                    value={digitRange[0]}
                    onChange={(e) =>
                      setDigitRange([
                        parseInt(e.target.value),
                        Math.max(parseInt(e.target.value), digitRange[1]),
                      ])
                    }
                    className="flex-1"
                  />
                  <input
                    type="number"
                    value={digitRange[0]}
                    onChange={(e) =>
                      setDigitRange([
                        parseInt(e.target.value) || 0,
                        digitRange[1],
                      ])
                    }
                    className="w-20 px-3 py-2 border-2 border-gray-300 rounded-lg text-center"
                  />
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-gray-600 w-12">
                    To:
                  </span>
                  <input
                    type="range"
                    min={SLIDER_RANGE_DIGITS.MIN}
                    max={SLIDER_RANGE_DIGITS.MAX}
                    value={digitRange[1]}
                    onChange={(e) =>
                      setDigitRange([digitRange[0], parseInt(e.target.value)])
                    }
                    className="flex-1"
                  />
                  <input
                    type="number"
                    value={digitRange[1]}
                    onChange={(e) =>
                      setDigitRange([
                        digitRange[0],
                        parseInt(e.target.value) || 0,
                      ])
                    }
                    className="w-20 px-3 py-2 border-2 border-gray-300 rounded-lg text-center"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Custom Digits (optional)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newDigitInput}
                  onChange={(e) => setNewDigitInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && addCustomDigit()}
                  className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none"
                  placeholder="Add custom digit (e.g., A1, X)"
                />
                <button
                  onClick={addCustomDigit}
                  className="px-4 py-2 bg-gray-600 text-white rounded-xl hover:bg-gray-700 flex items-center gap-2"
                >
                  <Plus size={18} />
                  Add
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Selected Digits ({customDigits.length})
              </label>
              <div className="bg-gray-50 rounded-xl p-4 min-h-[80px] max-h-48 overflow-y-auto">
                {customDigits.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {customDigits.map((digit, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium flex items-center gap-2 group hover:bg-blue-200"
                      >
                        {digit}
                        <button
                          onClick={() => removeDigit(digit)}
                          className="text-blue-600 hover:text-red-600"
                        >
                          <X size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 text-center py-4">
                    Use the slider above to generate digits
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={addOrUpdateAlphabet}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold text-lg hover:bg-blue-700 flex items-center justify-center gap-2 transition-all"
            >
              <Plus size={20} />
              {editIndex !== null ? "Update" : "Add"} Alphabet
            </button>
          </div>
        </div>

        {config.length > 0 && (
          <div className="bg-white rounded-3xl shadow-2xl p-8 mb-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
              Configured Alphabets
            </h2>
            <div className="space-y-3">
              {config.map((item, index) => (
                <div
                  key={index}
                  className="bg-gray-50 rounded-xl p-4 flex items-center gap-4"
                >
                  <span className="text-3xl font-bold text-blue-600 w-12">
                    {item.alphabet}
                  </span>
                  <div className="flex-1 flex flex-wrap gap-2 max-h-24 overflow-y-auto">
                    {item.digits.map((digit, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium"
                      >
                        {digit}
                      </span>
                    ))}
                  </div>
                  <button
                    onClick={() => editAlphabet(index)}
                    className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-all"
                  >
                    <Settings size={20} />
                  </button>
                  <button
                    onClick={() => deleteAlphabet(index)}
                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-all"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="text-center">
          <button
            onClick={handleStart}
            disabled={config.length === 0}
            className="px-12 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold text-xl hover:from-blue-700 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all transform hover:scale-105 shadow-lg"
          >
            Start Lucky Draw 🎉
          </button>
        </div>
      </div>
    </div>
  );
};

export default SetupPage;
