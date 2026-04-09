import React, { useCallback, useState } from 'react';

interface ImageUploaderProps {
  label: string;
  icon: React.ReactNode;
  previewUrl: string | null;
  onFileSelect: (file: File) => void;
  onClear: () => void;
  accentColor: string;
  hint?: string;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  label, icon, previewUrl, onFileSelect, onClear, accentColor, hint
}) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
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
      <label
        className="text-[10px] font-semibold uppercase tracking-wider flex items-center gap-1.5"
        style={{ color: `${accentColor}cc` }}
      >
        <span className="text-base flex items-center">{icon}</span>
        <span>{label}</span>
      </label>

      {previewUrl ? (
        <div className="relative group">
          <div
            className="w-full aspect-[3/4] bg-[#FAFAFA] rounded-xl overflow-hidden transition-all duration-300 group-hover:shadow-xl"
            style={{
              border: `2px solid ${accentColor}30`,
              boxShadow: `0 0 0 0 ${accentColor}00`,
            }}
          >
            <img
              src={previewUrl}
              alt={label}
              className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-[1.02]"
            />
            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>

          {/* Clear button */}
          <button
            onClick={onClear}
            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-[#FAFAFA] backdrop-blur-sm text-[#333333]/60 hover:text-red-400 hover:bg-[#FAFAFA] flex items-center justify-center text-sm font-bold transition-all duration-300 opacity-0 group-hover:opacity-100 border border-[#E0E0E0]"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Change button */}
          <label
            htmlFor={inputId}
            className="absolute bottom-2 right-2 px-3 py-1.5 rounded-lg bg-[#FAFAFA] backdrop-blur-sm text-[10px] font-semibold cursor-pointer hover:bg-[#FAFAFA] transition-all duration-300 opacity-0 group-hover:opacity-100 border border-[#E0E0E0]"
            style={{ color: accentColor }}
          >
            変更
          </label>
          <input id={inputId} type="file" accept="image/*" onChange={handleFileInput} className="hidden" />
        </div>
      ) : (
        <label
          htmlFor={inputId}
          className={`w-full aspect-[3/4] rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${
            isDragging ? 'scale-[1.02]' : 'hover:scale-[1.01]'
          }`}
          style={{
            borderColor: isDragging ? accentColor : `${accentColor}30`,
            backgroundColor: isDragging ? `${accentColor}10` : `${accentColor}05`,
            boxShadow: isDragging ? `0 0 30px ${accentColor}20` : 'none',
          }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div
            className={`flex justify-center mb-3 transition-all duration-300 ${isDragging ? 'scale-110' : 'opacity-40'}`}
          >
            {icon}
          </div>
          <p
            className="text-xs font-semibold transition-colors duration-300"
            style={{ color: isDragging ? accentColor : `${accentColor}80` }}
          >
            ドラッグ&ドロップ
          </p>
          <p
            className="text-[10px] mt-1 transition-colors duration-300"
            style={{ color: isDragging ? `${accentColor}aa` : `${accentColor}50` }}
          >
            またはクリックして選択
          </p>
          {hint && (
            <p
              className="text-[9px] mt-3 px-4 text-center transition-colors duration-300"
              style={{ color: `${accentColor}40` }}
            >
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
