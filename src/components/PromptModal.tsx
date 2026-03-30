/**
 * Prompt Modal - アイテムアップロード時の説明入力ポップアップ
 */
import React, { useState, useEffect } from 'react';

interface PromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (description: string) => void;
  onOptimize: () => Promise<string>;
  itemLabel: string;
  itemEmoji: string;
  accentColor: string;
  previewUrl: string | null;
  initialDescription?: string;
  isOptimizing?: boolean;
}

const PromptModal: React.FC<PromptModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  onOptimize,
  itemLabel,
  itemEmoji,
  accentColor,
  previewUrl,
  initialDescription = '',
  isOptimizing = false,
}) => {
  const [description, setDescription] = useState(initialDescription);
  const [optimizing, setOptimizing] = useState(false);

  useEffect(() => {
    setDescription(initialDescription);
  }, [initialDescription, isOpen]);

  if (!isOpen) return null;

  const handleOptimize = async () => {
    setOptimizing(true);
    try {
      const optimized = await onOptimize();
      setDescription(optimized);
    } finally {
      setOptimizing(false);
    }
  };

  const handleSubmit = () => {
    onSubmit(description);
    onClose();
  };

  const handleSkip = () => {
    onSubmit('');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-[#1a1a2e] border border-[#2a2a3e] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#2a2a3e] flex items-center justify-between">
          <h3 className="text-white font-bold text-base flex items-center gap-2">
            <span className="text-xl">{itemEmoji}</span>
            {itemLabel}の説明
          </h3>
          <button
            onClick={onClose}
            className="text-[#666] hover:text-white transition-colors text-xl"
          >
            x
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Preview */}
          {previewUrl && (
            <div className="mb-4 flex justify-center">
              <div
                className="w-32 h-32 rounded-xl overflow-hidden border-2"
                style={{ borderColor: accentColor }}
              >
                <img src={previewUrl} alt={itemLabel} className="w-full h-full object-cover" />
              </div>
            </div>
          )}

          {/* Description Input */}
          <div className="mb-4">
            <label className="text-xs font-bold text-[#a0a0b0] mb-2 block">
              アイテムの説明（任意）
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="例: 白いオーバーサイズTシャツ、カジュアルフィット&#10;&#10;AIがより正確に着画を生成するための説明を入力してください"
              rows={4}
              className="w-full bg-[#0a0a0f] border border-[#2a2a3e] rounded-xl px-4 py-3 text-sm text-white placeholder-[#444] focus:outline-none focus:border-[#a78bfa] transition-colors resize-none"
            />
          </div>

          {/* Optimize Button */}
          <button
            onClick={handleOptimize}
            disabled={optimizing || isOptimizing}
            className="w-full px-4 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all border border-[#2a2a3e] bg-[#14141f] text-[#a0a0b0] hover:text-[#a78bfa] hover:border-[#a78bfa] disabled:opacity-30 disabled:cursor-not-allowed mb-4"
          >
            {optimizing || isOptimizing ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                AIが分析中...
              </>
            ) : (
              <>🤖 AIで自動生成</>
            )}
          </button>

          {/* Tips */}
          <div className="bg-[#14141f] rounded-xl p-3 mb-4">
            <p className="text-[10px] text-[#666]">
              💡 説明を追加すると、AIがより正確に着画を生成できます。<br />
              「AIで自動生成」をクリックすると、画像から説明を自動生成します。
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleSkip}
              className="flex-1 py-3 rounded-xl font-bold text-sm bg-[#14141f] text-[#666] border border-[#2a2a3e] hover:text-white hover:border-[#3a3a4e] transition-colors"
            >
              スキップ
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 py-3 rounded-xl font-bold text-sm text-white transition-all"
              style={{ backgroundColor: accentColor }}
            >
              確定
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromptModal;
