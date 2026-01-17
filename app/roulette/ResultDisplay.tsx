import React from "react";
import ReactConfetti from "react-confetti";

interface ResultDisplayProps {
  selectedAlphabet: string | null;
  selectedDigit: string | null;
  nextDraw: () => void;
  available: string[];
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({
  selectedAlphabet,
  selectedDigit,
  nextDraw,
  available,
}) => {
  return (
    <>
      <div className="mt-12 text-center animate-fadeIn">
        <h2 className="text-2xl font-semibold text-gray-200 mb-4">
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
            {available.length - 1 <= 0 ? "All Done!" : "Next Draw"}
          </button>
        </div>
      </div>
      <ReactConfetti width={window.innerWidth} height={window.innerHeight} />
    </>
  );
};

export default ResultDisplay;
