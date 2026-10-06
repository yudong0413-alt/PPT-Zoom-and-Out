/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { SAMPLE_PRESETS, SampleImagePreset } from './utils/sampleImages';
import {
  calculateZoomSteps,
  renderSlideImage,
  SlideStepData,
  EasingType,
  ZoomDirection,
} from './utils/cropUtils';
import { exportToPptx } from './utils/pptxExport';
import { TopBar } from './components/TopBar';
import { FocusCanvas } from './components/FocusCanvas';
import { SettingsPanel } from './components/SettingsPanel';
import { SlideDeckPreview } from './components/SlideDeckPreview';
import { ImageDropzone } from './components/ImageDropzone';
import { PresentationModal } from './components/PresentationModal';
import { HelpModal } from './components/HelpModal';
import {
  Sparkles,
  Info,
  CheckCircle2,
  AlertCircle,
  FileDown,
  Layers,
  ArrowUpRight,
} from 'lucide-react';

export default function App() {
  // Image state
  const [imageSrc, setImageSrc] = useState<string>('');
  const [imageNaturalWidth, setImageNaturalWidth] = useState<number>(1920);
  const [imageNaturalHeight, setImageNaturalHeight] = useState<number>(1080);
  const [imageName, setImageName] = useState<string>('에버랜드 포시즌스 가든 (샘플)');

  // Focal point (0..1 normalized coordinates) - defaults to the fairytale Tower Tree
  const [focalPoint, setFocalPoint] = useState<{ x: number; y: number }>({
    x: 0.50,
    y: 0.28,
  });

  // Settings
  const [slideCount, setSlideCount] = useState<number>(4);
  const [initialZoom, setInitialZoom] = useState<number>(5.5);
  const [easing, setEasing] = useState<EasingType>('easeOut');
  const [direction, setDirection] = useState<ZoomDirection>('zoomOut');
  const [includeTitles, setIncludeTitles] = useState<boolean>(false);
  const [includeStepBadges, setIncludeStepBadges] = useState<boolean>(false);
  const [backgroundColor, setBackgroundColor] = useState<string>('#000000');
  const [fileName, setFileName] = useState<string>('everland_zoomout_presentation');

  // Slide Steps & Previews
  const [slideSteps, setSlideSteps] = useState<SlideStepData[]>([]);
  const [selectedStepIndex, setSelectedStepIndex] = useState<number>(0);
  const [isRenderingSlides, setIsRenderingSlides] = useState<boolean>(false);

  // Export & Modals
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportProgress, setExportProgress] = useState<{
    percent: number;
    message: string;
  }>({ percent: 0, message: '' });
  const [isSlideshowOpen, setIsSlideshowOpen] = useState<boolean>(false);
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const imageElementRef = useRef<HTMLImageElement | null>(null);

  // Initialize with the first sample preset on load
  useEffect(() => {
    const defaultPreset = SAMPLE_PRESETS[0];
    const dataUrl = defaultPreset.generator();
    const img = new Image();
    img.onload = () => {
      imageElementRef.current = img;
      setImageSrc(dataUrl);
      setImageNaturalWidth(img.naturalWidth);
      setImageNaturalHeight(img.naturalHeight);
      setImageName(defaultPreset.name);
      setFocalPoint(defaultPreset.focalPoint);
      setInitialZoom(defaultPreset.initialZoom);
    };
    img.src = dataUrl;
  }, []);

  // Recalculate zoom steps and render slide images when settings or focal point change
  useEffect(() => {
    if (!imageSrc || imageNaturalWidth <= 0 || imageNaturalHeight <= 0) return;

    // Calculate bounding boxes synchronously
    const steps = calculateZoomSteps({
      imageWidth: imageNaturalWidth,
      imageHeight: imageNaturalHeight,
      focalPoint,
      slideCount,
      initialZoom,
      easing,
      direction,
    });

    setSlideSteps(steps);

    // Asynchronously render high-res canvas previews for each slide step
    let isCancelled = false;
    setIsRenderingSlides(true);

    const renderAll = async () => {
      const img = imageElementRef.current || new Image();
      if (!imageElementRef.current) {
        img.src = imageSrc;
        await new Promise((res) => {
          img.onload = res;
        });
        imageElementRef.current = img;
      }

      const updatedSteps = await Promise.all(
        steps.map(async (step) => {
          const dataUrl = await renderSlideImage(
            img,
            step.cropRect,
            1920,
            1080
          );
          return {
            ...step,
            dataUrl,
          };
        })
      );

      if (!isCancelled) {
        setSlideSteps(updatedSteps);
        setIsRenderingSlides(false);
      }
    };

    renderAll().catch((err) => {
      console.error('Failed rendering slide previews:', err);
      setIsRenderingSlides(false);
    });

    return () => {
      isCancelled = true;
    };
  }, [
    imageSrc,
    imageNaturalWidth,
    imageNaturalHeight,
    focalPoint,
    slideCount,
    initialZoom,
    easing,
    direction,
  ]);

  // Handle image upload from user or sample preset
  const handleImageLoaded = (
    dataUrl: string,
    width: number,
    height: number,
    preset?: SampleImagePreset
  ) => {
    const img = new Image();
    img.onload = () => {
      imageElementRef.current = img;
      setImageSrc(dataUrl);
      setImageNaturalWidth(width);
      setImageNaturalHeight(height);

      if (preset) {
        setImageName(`${preset.name} (샘플)`);
        setFocalPoint(preset.focalPoint);
        setInitialZoom(preset.initialZoom);
      } else {
        setImageName('업로드된 사용자 이미지');
        // Default focal point to image center
        setFocalPoint({ x: 0.5, y: 0.5 });
      }

      showToast('새 이미지가 성공적으로 불러와졌습니다.');
    };
    img.src = dataUrl;
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3500);
  };

  // Reset settings
  const handleResetDefaults = () => {
    setSlideCount(4);
    setInitialZoom(5.0);
    setEasing('easeOut');
    setDirection('zoomOut');
    setIncludeTitles(false);
    setIncludeStepBadges(false);
    setBackgroundColor('#000000');
    showToast('설정이 기본값으로 초기화되었습니다.');
  };

  // Export to PPTX
  const handleExportPptx = async () => {
    if (slideSteps.length === 0 || isExporting) return;

    try {
      setIsExporting(true);
      await exportToPptx(slideSteps, {
        fileName: fileName.trim() || 'zoomout_presentation',
        presentationTitle: 'Zoom-out Presentation',
        includeTitles,
        includeStepBadges,
        backgroundColor,
        onProgress: (percent, message) => {
          setExportProgress({ percent, message });
        },
      });

      showToast('16:9 PPTX 파일이 성공적으로 다운로드되었습니다!');
    } catch (error) {
      console.error('PPTX export error:', error);
      showToast('PPT 생성 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsExporting(false);
    }
  };

  // Download a single slide as PNG
  const handleDownloadSingleSlide = (index: number) => {
    const step = slideSteps[index];
    if (!step?.dataUrl) return;

    const link = document.createElement('a');
    link.download = `slide_${index + 1}_zoom_${step.zoomLevel}x.jpg`;
    link.href = step.dataUrl;
    link.click();
    showToast(`슬라이드 ${index + 1} 이미지가 저장되었습니다.`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-950 text-neutral-100 font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Top Bar with 3-Zone Contract */}
      <TopBar
        onExportPptx={handleExportPptx}
        isExporting={isExporting}
        onOpenSlideshow={() => setIsSlideshowOpen(true)}
        onOpenHelp={() => setIsHelpOpen(true)}
        slideCount={slideSteps.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
        {/* Intro Hero Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-neutral-800/80 pb-6">
          <div className="space-y-1.5 max-w-2xl">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              점진적 줌아웃(Zoom-out) PPT 메이커
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
              작은 세부 단서에서 시작해 전체 화면으로 시야를 넓혀가는 몰입형 16:9
              프레젠테이션을 만드세요. 이미지를 올리고 클릭 한 번으로 기준점을 지정할 수 있습니다.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSlideshowOpen(true)}
              className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-850 text-xs font-semibold text-neutral-200 hover:text-white border border-neutral-800 transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <span>슬라이드 쇼 시뮬레이터</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-neutral-400" />
            </button>
            <button
              onClick={handleExportPptx}
              disabled={isExporting}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-md shadow-indigo-600/30 transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            >
              <FileDown className="w-4 h-4" />
              <span>{isExporting ? '생성 중...' : 'PPT (.pptx) 즉시 다운로드'}</span>
            </button>
          </div>
        </div>

        {/* Workspace: 2-Column Layout (Interactive Canvas + Control Panel) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start" id="canvas-section">
          {/* Left / Center Column: Focus Canvas Viewport */}
          <div className="lg:col-span-8 flex flex-col gap-5">
            <FocusCanvas
              imageSrc={imageSrc}
              imageNaturalWidth={imageNaturalWidth}
              imageNaturalHeight={imageNaturalHeight}
              focalPoint={focalPoint}
              onFocalPointChange={setFocalPoint}
              slideSteps={slideSteps}
              selectedStepIndex={selectedStepIndex}
              onSelectStepIndex={setSelectedStepIndex}
            />

            {/* Image Upload & Preset Switcher */}
            <ImageDropzone
              onImageLoaded={handleImageLoaded}
              currentImageName={imageName}
            />
          </div>

          {/* Right Column: Settings Panel */}
          <div className="lg:col-span-4" id="settings-section">
            <div className="sticky top-20">
              <SettingsPanel
                slideCount={slideCount}
                onSlideCountChange={setSlideCount}
                initialZoom={initialZoom}
                onInitialZoomChange={setInitialZoom}
                easing={easing}
                onEasingChange={setEasing}
                direction={direction}
                onDirectionChange={setDirection}
                includeTitles={includeTitles}
                onIncludeTitlesChange={setIncludeTitles}
                includeStepBadges={includeStepBadges}
                onIncludeStepBadgesChange={setIncludeStepBadges}
                backgroundColor={backgroundColor}
                onBackgroundColorChange={setBackgroundColor}
                fileName={fileName}
                onFileNameChange={setFileName}
                onExportPptx={handleExportPptx}
                isExporting={isExporting}
                exportProgress={exportProgress}
                onOpenSlideshow={() => setIsSlideshowOpen(true)}
                onResetDefaults={handleResetDefaults}
              />
            </div>
          </div>
        </div>

        {/* Slide Deck Preview Grid */}
        <div id="preview-section" className="pt-2">
          <SlideDeckPreview
            slideSteps={slideSteps}
            selectedStepIndex={selectedStepIndex}
            onSelectStepIndex={setSelectedStepIndex}
            onDownloadSingleSlide={handleDownloadSingleSlide}
            onOpenSlideshow={() => setIsSlideshowOpen(true)}
          />
        </div>

        {/* Feature Highlights & Guide Info */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-neutral-900 text-xs">
          <div className="p-4 rounded-xl bg-neutral-900/40 border border-neutral-800/60 space-y-1.5">
            <div className="font-semibold text-neutral-200 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>100% 16:9 와이드스크린 최적화</span>
            </div>
            <p className="text-neutral-400 text-[11px] leading-relaxed">
              모든 슬라이드가 파워포인트 표준 16:9 비율(1920×1080)에 맞추어 왜곡 없이
              완벽하게 정렬 및 크롭됩니다.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-neutral-900/40 border border-neutral-800/60 space-y-1.5">
            <div className="font-semibold text-neutral-200 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-indigo-400" />
              <span>PptxGenJS 브라우저 직접 생성</span>
            </div>
            <p className="text-neutral-400 text-[11px] leading-relaxed">
              서버 전송 없이 브라우저 내에서 안전하게 고해상도 이미지를 패키징하여
              완성된 .pptx 파일로 즉시 다운로드됩니다.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-neutral-900/40 border border-neutral-800/60 space-y-1.5">
            <div className="font-semibold text-neutral-200 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-amber-400" />
              <span>발표용 슬라이드 쇼 시뮬레이터</span>
            </div>
            <p className="text-neutral-400 text-[11px] leading-relaxed">
              다운로드 전 전체 화면 시뮬레이터로 넘김 효과 및 줌아웃 스토리텔링을
              실시간으로 검토할 수 있습니다.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-850 bg-neutral-950 mt-12 py-6 text-center text-xs text-neutral-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>ZoomOut PPT Generator · 16:9 Progressive Presentation Tool</span>
          <div className="flex items-center gap-4 text-neutral-400">
            <button
              onClick={() => setIsHelpOpen(true)}
              className="hover:text-white transition-colors cursor-pointer"
            >
              사용 가이드
            </button>
            <button
              onClick={() => setIsSlideshowOpen(true)}
              className="hover:text-white transition-colors cursor-pointer"
            >
              슬라이드 쇼
            </button>
            <button
              onClick={handleExportPptx}
              className="hover:text-white transition-colors cursor-pointer"
            >
              PPT 다운로드
            </button>
          </div>
        </div>
      </footer>

      {/* Presentation Fullscreen Modal */}
      <PresentationModal
        isOpen={isSlideshowOpen}
        onClose={() => setIsSlideshowOpen(false)}
        slideSteps={slideSteps}
        initialIndex={selectedStepIndex}
        onExportPptx={handleExportPptx}
        isExporting={isExporting}
        backgroundColor={backgroundColor}
      />

      {/* Help Modal */}
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />

      {/* Floating Notification Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-2.5 bg-neutral-900/95 border border-neutral-700 text-white text-xs font-medium rounded-xl shadow-2xl backdrop-blur-md animate-fadeIn">
          <Info className="w-4 h-4 text-indigo-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
