import React, { useRef, useState } from 'react';
import { UploadCloud, Image as ImageIcon, Sparkles, HelpCircle } from 'lucide-react';
import { SAMPLE_PRESETS, SampleImagePreset } from '../utils/sampleImages';

interface ImageDropzoneProps {
  onImageLoaded: (
    dataUrl: string,
    width: number,
    height: number,
    preset?: SampleImagePreset
  ) => void;
  currentImageName?: string;
}

export const ImageDropzone: React.FC<ImageDropzoneProps> = ({
  onImageLoaded,
  currentImageName,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMessage('이미지 파일(PNG, JPG, WEBP 등)만 업로드할 수 있습니다.');
      return;
    }
    setErrorMessage(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const img = new Image();
      img.onload = () => {
        onImageLoaded(dataUrl, img.naturalWidth, img.naturalHeight);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const loadSample = (preset: SampleImagePreset) => {
    setErrorMessage(null);
    const dataUrl = preset.generator();
    const img = new Image();
    img.onload = () => {
      onImageLoaded(dataUrl, img.naturalWidth, img.naturalHeight, preset);
    };
    img.src = dataUrl;
  };

  return (
    <div className="space-y-4">
      {/* Drag & Drop Upload Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`relative group rounded-2xl border-2 border-dashed p-6 sm:p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 ${
          isDragOver
            ? 'border-indigo-400 bg-indigo-950/20 scale-[1.01]'
            : 'border-neutral-800 hover:border-neutral-700 bg-neutral-900/50 hover:bg-neutral-900/80'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              processFile(e.target.files[0]);
            }
          }}
        />

        <div className="w-12 h-12 rounded-2xl bg-indigo-950/60 border border-indigo-800/60 flex items-center justify-center text-indigo-400 mb-3 group-hover:scale-110 transition-transform shadow-lg shadow-indigo-950/40">
          <UploadCloud className="w-6 h-6" />
        </div>

        <h3 className="text-sm font-semibold text-neutral-200 mb-1">
          여기에 이미지를 드래그하여 업로드하거나 클릭하세요
        </h3>
        <p className="text-xs text-neutral-400 max-w-sm">
          PNG, JPG, WEBP 등 고해상도 이미지를 권장합니다 (포커스 영역을 확대해도 선명하게 유지됩니다)
        </p>

        {currentImageName && (
          <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-neutral-800 text-[11px] text-neutral-300 font-mono">
            <ImageIcon className="w-3.5 h-3.5 text-indigo-400" />
            <span>현재: {currentImageName}</span>
          </div>
        )}
      </div>

      {errorMessage && (
        <div className="p-3 rounded-xl bg-red-950/50 border border-red-800 text-red-300 text-xs text-center">
          {errorMessage}
        </div>
      )}

      {/* Quick Test Samples */}
      <div className="bg-neutral-900/60 rounded-xl border border-neutral-800/80 p-3.5">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-1.5 text-xs font-medium text-neutral-300">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>또는 추천 샘플 이미지로 바로 테스트해보세요</span>
          </div>
          <span className="text-[11px] text-neutral-500 font-mono">1클릭 로드</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {SAMPLE_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => loadSample(preset)}
              className="flex items-center gap-3 p-2.5 rounded-lg bg-neutral-950 border border-neutral-800 hover:border-indigo-500/60 hover:bg-neutral-900 transition-all text-left group"
            >
              <div className="w-10 h-10 rounded-lg bg-neutral-800 flex items-center justify-center shrink-0 overflow-hidden border border-neutral-700/60">
                <ImageIcon className="w-5 h-5 text-indigo-400 group-hover:scale-110 transition-transform" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold text-neutral-200 group-hover:text-white truncate">
                  {preset.name}
                </div>
                <div className="text-[11px] text-neutral-400 truncate">
                  {preset.description}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
