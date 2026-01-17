import React from "react";
import { X } from "lucide-react";

interface DrawnHistoryModalProps {
  drawn: string[];
  isOpen: boolean;
  onClose: () => void;
}

const DrawnHistoryModal: React.FC<DrawnHistoryModalProps> = ({
  drawn,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-r from-red-500 to-pink-500 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold text-white">📜 Draw History</h2>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-full p-2 transition-all"
            >
              <X size={24} />
            </button>
          </div>
          <p className="text-white/90 mt-2">Total drawn: {drawn.length}</p>
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {drawn.length > 0 ? (
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
              {drawn.map((result, index) => (
                <div
                  key={index}
                  className="aspect-square bg-gradient-to-br from-yellow-400 to-orange-400 rounded-xl flex items-center justify-center shadow-lg transform hover:scale-110 transition-all"
                >
                  <span className="text-xl font-bold text-white">{result}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">No draws yet</p>
              <p className="text-gray-500 text-sm mt-2">
                Start spinning to see results here!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DrawnHistoryModal;
