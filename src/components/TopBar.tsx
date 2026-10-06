import React from 'react';
import { Download, Play, HelpCircle, Layers } from 'lucide-react';

interface TopBarProps {
  onExportPptx: () => void;
  isExporting: boolean;
  onOpenSlideshow: () => void;
  onOpenHelp: () => void;
  slideCount: number;
}

export const TopBar: React.FC<TopBarProps> = ({
  onExportPptx,
  isExporting,
  onOpenSlideshow,
  onOpenHelp,
  slideCount,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-800/80 bg-neutral-950/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Brand wordmark */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-600/30">
              <Layers className="w-4 h-4" />
            </div>
            <a
              href="/"
              className="text-base font-bold tracking-tight text-white hover:text-neutral-200 transition-colors"
            >
              ZoomOut PPT
            </a>
          </div>
          <span className="hidden sm:inline text-xs text-neutral-400 font-normal">
            점진적 줌아웃 프레젠테이션 생성기
          </span>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-neutral-400">
          <a
            href="#canvas-section"
            className="hover:text-white transition-colors"
          >
            1. 포커스 지정
          </a>
          <a
            href="#settings-section"
            className="hover:text-white transition-colors"
          >
            2. 배율 및 슬라이드
          </a>
          <a
            href="#preview-section"
            className="hover:text-white transition-colors"
          >
            3. 슬라이드 미리보기 ({slideCount}장)
          </a>
          <button
            onClick={onOpenHelp}
            className="hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5 text-neutral-400" />
            <span>도움말</span>
          </button>
        </nav>

        {/* Zone 3: Primary Actions */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenSlideshow}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-850 hover:bg-neutral-800 text-xs font-medium text-neutral-200 hover:text-white border border-neutral-700/80 transition-all cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
            <span>슬라이드 쇼</span>
          </button>

          <button
            onClick={onExportPptx}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-md shadow-indigo-600/25 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isExporting ? '생성 중...' : 'PPT 다운로드 (.pptx)'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
