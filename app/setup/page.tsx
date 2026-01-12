"use client";

import React, { useEffect, useState } from "react";
import { Plus, Trash2, Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import { getConfig, setConfig } from "@/lib/storage";
import { STORAGE_KEYS } from "@/lib/constants";

const STORAGE_CONFIG = STORAGE_KEYS.CONFIG;

type AlphabetConfig = {
  alphabet: string;
  digits: string[];
};

const SetupPage = () => {
  const router = useRouter();

  const [config, setConfigState] = useState<AlphabetConfig[]>([]);
  const [alphabetInput, setAlphabetInput] = useState("");
  const [digitInput, setDigitInput] = useState("");
  const [editIndex, setEditIndex] = useState<number | null>(null);

  // 🔹 Load config from localStorage on mount
  useEffect(() => {
    const saved = getConfig<AlphabetConfig[]>(STORAGE_CONFIG);
    if (saved) {
      setConfigState(saved);
    }
  }, []);

  // 🔹 Persist config whenever it changes
  useEffect(() => {
    setConfig(STORAGE_CONFIG, config);
  }, [config]);

  const addOrUpdateAlphabet = () => {
    if (!alphabetInput.trim()) {
      alert("Please enter an alphabet");
      return;
    }

    const digits = digitInput
      .split(",")
      .map((d) => d.trim())
      .filter(Boolean);

    if (digits.length === 0) {
      alert("Please add at least one digit");
      return;
    }

    const newItem: AlphabetConfig = {
      alphabet: alphabetInput.toUpperCase(),
      digits,
    };

    // prevent duplicate alphabet
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
    setDigitInput("");
    setEditIndex(null);
  };

  const deleteAlphabet = (index: number) => {
    setConfigState(config.filter((_, i) => i !== index));
  };

  const editAlphabet = (index: number) => {
    const item = config[index];
    setAlphabetInput(item.alphabet);
    setDigitInput(item.digits.join(", "));
    setEditIndex(index);
  };

  const handleStart = () => {
    if (config.length === 0) {
      alert("Please add at least one alphabet configuration");
      return;
    }

    // navigate to roulette page
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

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Alphabet (e.g., A)
              </label>
              <input
                value={alphabetInput}
                onChange={(e) => setAlphabetInput(e.target.value)}
                maxLength={1}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none text-lg"
                placeholder="Enter a single letter"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Digits (comma-separated)
              </label>
              <input
                value={digitInput}
                onChange={(e) => setDigitInput(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none text-lg"
                placeholder="e.g., 1, 2, 3"
              />
            </div>

            <button
              onClick={addOrUpdateAlphabet}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold text-lg hover:bg-blue-700 flex items-center justify-center gap-2"
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

                  <div className="flex-1 flex flex-wrap gap-2">
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
                    className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg"
                  >
                    <Settings size={20} />
                  </button>

                  <button
                    onClick={() => deleteAlphabet(index)}
                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg"
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
            className="px-12 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold text-xl disabled:opacity-50"
          >
            Start Lucky Draw 🎉
          </button>
        </div>
      </div>
    </div>
  );
};

export default SetupPage;
