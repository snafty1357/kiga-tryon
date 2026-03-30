import React, { useState } from 'react';

export interface ResultItem {
  id: string;
  imageUrl: string;
  timestamp: Date;
  description?: string;
}

interface ResultGalleryProps {
  results: ResultItem[];
}

const ResultGallery: React.FC<ResultGalleryProps> = ({ results }) => {
  const [zoomedUrl, setZoomedUrl] = useState<string | null>(null);

  if (results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
        <div className="text-6xl mb-4 opacity-20">👗</div>
        <p className="text-[#a0a0b0] text-sm">生成結果がここに表示されます</p>
        <p className="text-[#555] text-xs mt-1">左パネルから画像をアップロードして着画を生成</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        {results.map((item) => (
          <div
            key={item.id}
            className="group relative bg-[#14141f] border border-[#2a2a3e] rounded-xl overflow-hidden cursor-zoom-in hover:border-[#a78bfa] transition-colors"
            onClick={() => setZoomedUrl(item.imageUrl)}
          >
            {/* ID Badge */}
            <div className="absolute top-2 left-2 z-10">
              <span className="text-[8px] px-1.5 py-0.5 rounded bg-black/70 text-[#a78bfa] font-mono font-bold backdrop-blur-sm">
                #{item.id.slice(-6).toUpperCase()}
              </span>
            </div>
            {/* Timestamp */}
            <div className="absolute top-2 right-2 z-10">
              <span className="text-[8px] px-1.5 py-0.5 rounded bg-black/70 text-white/60 backdrop-blur-sm">
                {item.timestamp.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <div className="aspect-[3/4]">
              <img
                src={item.imageUrl}
                alt="Generated try-on"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <p className="text-[10px] text-white/70">{item.description || '着画生成結果'}</p>
              <div className="flex gap-2 mt-1.5">
                <a
                  href={item.imageUrl}
                  download={`kiga_${item.id}.png`}
                  onClick={(e) => e.stopPropagation()}
                  className="text-[9px] px-2 py-0.5 rounded bg-white/10 text-white/80 hover:bg-white/20 transition-colors"
                >
                  💾 保存
                </a>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigator.clipboard.writeText(item.id);
                  }}
                  className="text-[9px] px-2 py-0.5 rounded bg-white/10 text-white/80 hover:bg-white/20 transition-colors"
                >
                  📋 ID
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Zoom Modal */}
      {zoomedUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center cursor-zoom-out animate-in fade-in duration-200"
          onClick={() => setZoomedUrl(null)}
        >
          <img
            src={zoomedUrl}
            alt="Zoomed result"
            className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-2xl"
          />
          <button
            className="absolute top-6 right-6 text-white/60 hover:text-white text-2xl font-bold"
            onClick={() => setZoomedUrl(null)}
          >
            ×
          </button>
        </div>
      )}
    </>
  );
};

export default ResultGallery;
