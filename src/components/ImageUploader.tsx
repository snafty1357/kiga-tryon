import React, { useCallback } from 'react';

interface ImageUploaderProps {
  label: string;
  emoji: string;
  previewUrl: string | null;
  onFileSelect: (file: File) => void;
  onClear: () => void;
  accentColor: string;
  hint?: string;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  label, emoji, previewUrl, onFileSelect, onClear, accentColor, hint
}) => {
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      onFileSelect(file);
    }
  }, [onFileSelect]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFileSelect(file);
    e.target.value = '';
  }, [onFileSelect]);

  const inputId = `upload-${label.replace(/\s/g, '-')}`;

  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-bold uppercase tracking-wider" style={{ color: accentColor }}>
        {emoji} {label}
      </label>

      {previewUrl ? (
        <div className="relative group">
          <div
            className="w-full aspect-[3/4] bg-black rounded-xl border-2 overflow-hidden"
            style={{ borderColor: `${accentColor}44` }}
          >
            <img src={previewUrl} alt={label} className="w-full h-full object-contain" />
          </div>
          <button
            onClick={onClear}
            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/70 text-white/70 hover:text-red-400 hover:bg-black flex items-center justify-center text-sm font-bold transition-all opacity-0 group-hover:opacity-100"
          >
            ×
          </button>
          <label
            htmlFor={inputId}
            className="absolute bottom-2 right-2 px-3 py-1 rounded-lg bg-black/70 text-[10px] font-bold cursor-pointer hover:bg-black transition-colors opacity-0 group-hover:opacity-100"
            style={{ color: accentColor }}
          >
            変更
          </label>
          <input id={inputId} type="file" accept="image/*" onChange={handleFileInput} className="hidden" />
        </div>
      ) : (
        <label
          htmlFor={inputId}
          className="w-full aspect-[3/4] rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all hover:scale-[1.02]"
          style={{ borderColor: `${accentColor}44`, backgroundColor: `${accentColor}08` }}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <div className="text-4xl mb-3 opacity-40">{emoji}</div>
          <p className="text-sm font-bold" style={{ color: `${accentColor}99` }}>
            ドラッグ&ドロップ
          </p>
          <p className="text-[10px] mt-1" style={{ color: `${accentColor}66` }}>
            またはクリックして選択
          </p>
          {hint && (
            <p className="text-[9px] mt-3 px-4 text-center" style={{ color: `${accentColor}44` }}>
              {hint}
            </p>
          )}
          <input id={inputId} type="file" accept="image/*" onChange={handleFileInput} className="hidden" />
        </label>
      )}
    </div>
  );
};

export default ImageUploader;
