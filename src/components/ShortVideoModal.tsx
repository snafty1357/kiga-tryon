import React, { useState, useEffect, useRef } from 'react';
import { generateTryOn, fileToDataUrl } from '../services/falService';
import { Play, Pause, Download, X, Video, Loader2 } from 'lucide-react';
import type { ResultItem } from './ResultGallery';
import { generateProjectId } from './ResultGallery';
import { getDeviceId } from '../services/historyService';
import { supabase } from '../services/supabaseClient';

interface ShortVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  humanFile: File | null;
  primaryGarment: { file: File; id: string; label: string } | null;
  onGenerateSuccess: (results: ResultItem[]) => void;
  companySlug?: string;
}

const PRESET_CUTS = [
  { id: 1, title: '正面全身', prompt: 'standing perfectly still, completely front-facing full body shot, fashion catalog style, symmetrical pose' },
  { id: 2, title: '歩きのポーズ', prompt: 'walking confidently towards the camera, fashion runway style, natural stride' },
  { id: 3, title: '振り返り', prompt: 'looking over the shoulder towards the camera, dynamic fashion angle' },
  { id: 4, title: '上半身アップ', prompt: 'close-up shot on the upper half of the body, highlighting the garment texture, material and details' },
  { id: 5, title: '座りポーズ', prompt: 'sitting elegantly on a minimalistic chair, relaxed fashion look' },
  { id: 6, title: '壁もたれ', prompt: 'casual pose leaning against a minimalist white wall, stylish and authentic' },
  { id: 7, title: 'ポケットに手', prompt: 'confident stance, both hands in pockets, looking directly at the camera, sharp fashion photography' },
];

const ShortVideoModal: React.FC<ShortVideoModalProps> = ({ 
  isOpen, 
  onClose, 
  humanFile, 
  primaryGarment, 
  onGenerateSuccess,
  companySlug 
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState({ completed: 0, total: PRESET_CUTS.length });
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Video playback states
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const playIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!isOpen) {
      // Reset state on close
      setIsGenerating(false);
      setProgress({ completed: 0, total: PRESET_CUTS.length });
      setGeneratedImages([]);
      setError(null);
      setIsPlaying(true);
      setCurrentFrameIndex(0);
      if (playIntervalRef.current) clearInterval(playIntervalRef.current);
    }
  }, [isOpen]);

  useEffect(() => {
    if (generatedImages.length > 0 && isPlaying) {
      playIntervalRef.current = setInterval(() => {
        setCurrentFrameIndex(prev => (prev + 1) % generatedImages.length);
      }, 700); // 0.7秒ごとに切り替え
    } else if (playIntervalRef.current) {
      clearInterval(playIntervalRef.current);
    }
    return () => {
      if (playIntervalRef.current) clearInterval(playIntervalRef.current);
    };
  }, [generatedImages, isPlaying]);

  const handleGenerate = async () => {
    if (!humanFile || !primaryGarment) {
      setError('モデル画像またはアイテムが設定されていません');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setGeneratedImages([]);
    setProgress({ completed: 0, total: PRESET_CUTS.length });

    try {
      const humanDataUrl = await fileToDataUrl(humanFile);
      const garmentDataUrl = await fileToDataUrl(primaryGarment.file);
      const newResults: ResultItem[] = [];
      const imageUrls: string[] = [];

      // 直列で生成し進捗を更新
      for (let i = 0; i < PRESET_CUTS.length; i++) {
        const cut = PRESET_CUTS[i];
        try {
          const startTime = Date.now();
          const result = await generateTryOn({
            humanImageUrl: humanDataUrl,
            garmentImageUrl: garmentDataUrl,
            description: cut.prompt,
            resolution: '1K',
            format: 'jpeg', // for faster generation & lighter video
            garmentCategory: primaryGarment.id,
          });
          const generationTimeMs = Date.now() - startTime;

          imageUrls.push(result.imageUrl);
          setGeneratedImages([...imageUrls]); // update immediately to show partial video
          
          const newResult: ResultItem = {
            id: Date.now().toString() + i,
            projectId: generateProjectId(),
            imageUrl: result.imageUrl,
            timestamp: new Date(),
            description: `[Cut ${i+1}: ${cut.title}] ${cut.prompt}`,
            resolution: '1K',
            garmentType: primaryGarment.label,
            generationTimeMs,
          };
          newResults.push(newResult);

          // Save to Supabase (Background)
          supabase.from('generations').insert({
            user_id: undefined, 
            device_id: getDeviceId(),
            project_id: newResult.projectId,
            image_url: newResult.imageUrl,
            garment_types: [primaryGarment.id],
            generation_time_ms: generationTimeMs,
            description: newResult.description || '',
            resolution: '1K',
            format: 'jpeg',
            model_image_url: null,
            garment_image_urls: [],
            company_slug: companySlug || null,
          }).then(null, console.error);

        } catch (err: any) {
          console.error(`Cut ${i + 1} Error:`, err);
        }
        setProgress(prev => ({ ...prev, completed: i + 1 }));
      }

      if (imageUrls.length === 0) {
        setError('生成に失敗しました。時間をおいて再試行してください。');
      } else {
        onGenerateSuccess(newResults);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || '予期せぬエラーが発生しました');
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-[#111116] border border-white/10 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[95vh] text-white">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <Video className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-wider">7カット ショート動画生成</h2>
              <p className="text-[10px] text-gray-400 mt-0.5">多様なアングルのルックブック風動画を自動生成</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex flex-col md:flex-row gap-6">
          
          {/* Left: Video Preview Area */}
          <div className="flex-1">
            <div className="relative aspect-[9/16] bg-black rounded-lg border border-white/10 overflow-hidden flex items-center justify-center shadow-inner">
              {generatedImages.length > 0 ? (
                <>
                  <img 
                    src={generatedImages[currentFrameIndex]} 
                    alt={`Frame ${currentFrameIndex}`} 
                    className="w-full h-full object-cover transition-opacity duration-150"
                  />
                  
                  {/* Playback Controls */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
                    <button 
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="text-white hover:text-purple-400 transition-colors"
                    >
                      {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                    </button>
                    <div className="flex gap-1">
                      {generatedImages.map((_, idx) => (
                        <div 
                          key={idx} 
                          className={`w-1.5 h-1.5 rounded-full transition-all ${
                            idx === currentFrameIndex ? 'bg-white scale-125' : 'bg-white/30'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center text-gray-500 space-y-3">
                  <Video className="w-12 h-12 mx-auto stroke-[1] opacity-50" />
                  <p className="text-xs uppercase tracking-widest">No Video Generated</p>
                </div>
              )}
            </div>
          </div>

          {/* Right: Info & Actions */}
          <div className="flex-1 flex flex-col justify-center space-y-6">
            {!humanFile || !primaryGarment ? (
               <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl text-xs">
                 エラー: モデル画像、または1つ以上のアイテム（衣服）を事前に追加してください。
               </div>
            ) : (
              <div className="space-y-6">
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-gray-300 uppercase tracking-widest border-b border-white/10 pb-2">生成内容</h3>
                  <ul className="space-y-2">
                    {PRESET_CUTS.map(cut => (
                      <li key={cut.id} className="flex items-center gap-2 text-xs text-gray-400">
                        <span className="w-4 h-4 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-[8px] font-bold">
                          {cut.id}
                        </span>
                        {cut.title}
                      </li>
                    ))}
                  </ul>
                </div>

                {isGenerating && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>生成中... ({progress.completed} / {progress.total})</span>
                      <span>{Math.round((progress.completed / progress.total) * 100)}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
                        style={{ width: `${(progress.completed / progress.total) * 100}%` }}
                      />
                    </div>
                  </div>
                )}

                {error && (
                  <div className="text-red-400 text-xs bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                    {error}
                  </div>
                )}

                {generatedImages.length === PRESET_CUTS.length && (
                  <div className="text-green-400 text-xs bg-green-500/10 p-3 rounded-lg border border-green-500/20 text-center font-bold">
                    動画（画像セット）が完成しました！<br/>ギャラリーにも追加されました。
                  </div>
                )}
              </div>
            )}
            
            <div className="pt-4 border-t border-white/10 mt-auto">
              {generatedImages.length === PRESET_CUTS.length ? (
                <div className="space-y-3">
                  <button
                    onClick={() => {
                        alert("動画（mp4/gif）として保存する機能は今後のアップデートで追加されます。現在はギャラリーから各画像を保存できます。");
                    }}
                    className="w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 bg-white text-black hover:bg-gray-200 transition-colors"
                  >
                    <Download size={16} /> ショート動画としてダウンロード
                  </button>
                  <button
                    onClick={onClose}
                    className="w-full py-2 text-xs text-gray-400 hover:text-white"
                  >
                    閉じる
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating || !humanFile || !primaryGarment}
                  className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all duration-300 ${
                    isGenerating || !humanFile || !primaryGarment
                      ? 'bg-white/5 text-gray-500 cursor-not-allowed border border-white/5'
                      : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-xl shadow-purple-500/25 hover:shadow-purple-500/40'
                  }`}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> 制作中...
                    </>
                  ) : (
                    <>
                      <Video size={16} /> 7カットのショート動画を作る
                    </>
                  )}
                </button>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ShortVideoModal;
