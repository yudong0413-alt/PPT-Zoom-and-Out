import React from 'react';
import { SlideStepData } from '../utils/cropUtils';
import { Download, Eye, ArrowRight, Layers, CheckCircle2 } from 'lucide-react';

interface SlideDeckPreviewProps {
  slideSteps: SlideStepData[];
  selectedStepIndex: number;
  onSelectStepIndex: (index: number) => void;
  onDownloadSingleSlide: (index: number) => void;
  onOpenSlideshow: () => void;
}

export const SlideDeckPreview: React.FC<SlideDeckPreviewProps> = ({
  slideSteps,
  selectedStepIndex,
  onSelectStepIndex,
  onDownloadSingleSlide,
  onOpenSlideshow,
}) => {
  return (
    <div className="bg-neutral-900/80 rounded-2xl border border-neutral-800/80 p-5 shadow-2xl backdrop-blur-sm space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-800 pb-3">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-indigo-400" />
          <h2 className="text-sm font-semibold text-white tracking-wide">
            단계별 슬라이드 미리보기 ({slideSteps.length}단계 완성)
          </h2>
        </div>
        <div className="flex items-center gap-2 text-xs text-neutral-400">
          <span>16:9 와이드스크린 비율</span>
          <span className="text-neutral-600">·</span>
          <span>1920 × 1080px 고화질 렌더링</span>
        </div>
      </div>

      {/* Grid of Slide Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {slideSteps.map((step, idx) => {
          const isSelected = selectedStepIndex === idx;

          return (
            <div
              key={`slide-card-${idx}`}
              onClick={() => onSelectStepIndex(idx)}
              className={`group relative flex flex-col rounded-xl overflow-hidden border transition-all duration-200 cursor-pointer ${
                isSelected
                  ? 'bg-neutral-800/90 border-indigo-500 ring-2 ring-indigo-500/30 shadow-lg shadow-indigo-950/40'
                  : 'bg-neutral-950/70 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900/70'
              }`}
            >
              {/* 16:9 Thumbnail Container */}
              <div className="relative aspect-video w-full bg-neutral-950 overflow-hidden">
                {step.dataUrl ? (
                  <img
                    src={step.dataUrl}
                    alt={`슬라이드 ${idx + 1}`}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-neutral-600 text-xs">
                    렌더링 중...
                  </div>
                )}

                {/* Badge: Step number & Zoom */}
                <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-neutral-950/80 backdrop-blur-md px-2 py-0.5 rounded-md text-[11px] font-mono font-medium text-white border border-neutral-700/60 shadow">
                  <span className="text-indigo-400">#{idx + 1}</span>
                  <span className="text-neutral-400">·</span>
                  <span>{step.zoomLevel}x</span>
                </div>

                {/* Selected Indicator */}
                {isSelected && (
                  <div className="absolute top-2 right-2 bg-indigo-600 text-white p-1 rounded-full shadow">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                )}

                {/* Hover overlay with quick actions */}
                <div className="absolute inset-0 bg-neutral-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectStepIndex(idx);
                      onOpenSlideshow();
                    }}
                    className="p-1.5 bg-neutral-900/90 text-white rounded-lg hover:bg-indigo-600 transition-colors shadow border border-neutral-700"
                    title="이 슬라이드부터 보기"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDownloadSingleSlide(idx);
                    }}
                    className="p-1.5 bg-neutral-900/90 text-white rounded-lg hover:bg-indigo-600 transition-colors shadow border border-neutral-700"
                    title="이 슬라이드 PNG 저장"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Card Meta details */}
              <div className="p-3 flex flex-col justify-between flex-1 gap-1.5">
                <div>
                  <h4 className="text-xs font-semibold text-neutral-200 line-clamp-1">
                    {step.title}
                  </h4>
                  <p className="text-[11px] text-neutral-400 line-clamp-1">
                    {step.subtitle}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-neutral-800/80 text-[10px] text-neutral-500 font-mono">
                  <span>
                    크롭: {step.cropRect.width} × {step.cropRect.height}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDownloadSingleSlide(idx);
                    }}
                    className="text-indigo-400 hover:text-indigo-300 font-sans hover:underline flex items-center gap-1"
                  >
                    <span>PNG</span>
                    <Download className="w-2.5 h-2.5" />
                  </button>
                </div>
              </div>

              {/* Step progression arrow connection indicator */}
              {idx < slideSteps.length - 1 && (
                <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 pointer-events-none text-neutral-600">
                  {/* Subtle directional indicator */}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
