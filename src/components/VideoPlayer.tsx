import React, { useState, useRef, useEffect } from 'react';
import { parseVideoMedia } from '../utils/mediaHelper';
import { Play, Pause, ArrowUpRight, Film, CircleAlert, Download, RefreshCw, Maximize, Volume2, VolumeX } from 'lucide-react';

interface VideoPlayerProps {
  videoUrl?: string;
  videoData?: string;
  title?: string;
  autoPlay?: boolean;
  className?: string;
  compact?: boolean;
  videoFileName?: string;
  onOpenModal?: () => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoUrl,
  videoData,
  title,
  autoPlay = false,
  className = '',
  compact = false,
  videoFileName,
  onOpenModal
}) => {
  const media = parseVideoMedia(videoUrl, videoData);
  const [hasError, setHasError] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Reset error when source changes
  useEffect(() => {
    setHasError(false);
    setIsPlaying(false);
  }, [media.src]);

  if (media.type === 'none' || !media.src) {
    return null;
  }

  const isDataOrBlob = media.src.startsWith('data:') || media.src.startsWith('blob:');
  const directLinkUrl = media.src.startsWith('http') || media.src.startsWith('/') ? media.src : '';
  const downloadFileName = videoFileName || (videoUrl && !videoUrl.startsWith('http') ? videoUrl.split('/').pop() : 'wongok_video.mp4');

  const togglePlay = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (compact && onOpenModal) {
      onOpenModal();
      return;
    }
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {
        // Autoplay policy or codec error
      });
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  };

  const toggleFullscreen = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    if (videoRef.current.requestFullscreen) {
      videoRef.current.requestFullscreen();
    } else if ((videoRef.current as any).webkitRequestFullscreen) {
      (videoRef.current as any).webkitRequestFullscreen();
    }
  };

  // Fallback UI when browser video playback fails (e.g. unsupported HEVC/H.265 in specific desktop browsers)
  if (hasError) {
    return (
      <div className={`rounded-2xl p-4 bg-slate-900 text-slate-200 border border-slate-800 flex flex-col gap-3 shadow-md ${className}`}>
        <div className="flex items-start gap-2.5">
          <CircleAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-bold text-white block text-sm">스마트폰 / 카카오톡 영상 재생 알림</span>
            <span className="text-[11.5px] text-slate-300 mt-1 block leading-relaxed">
              아이폰 고화질 MOV/HEVC 등 일부 코덱은 브라우저에 따라 새 창 또는 기기 기본 플레이어에서 가장 선명하게 재생됩니다.
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-800">
          <button
            type="button"
            onClick={() => setHasError(false)}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>재시도</span>
          </button>

          {directLinkUrl && (
            <a
              href={directLinkUrl}
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>새 창에서 원본 재생 (스마트폰/PC)</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          )}

          <a
            href={media.src}
            download={downloadFileName}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>영상 다운로드</span>
          </a>
        </div>
      </div>
    );
  }

  // 1. YouTube & Vimeo & Google Drive Iframe Embed
  if (media.type === 'youtube' || media.type === 'vimeo' || media.type === 'gdrive') {
    return (
      <div className={`overflow-hidden rounded-2xl bg-black border border-slate-800 shadow-md ${className}`}>
        <div className="relative w-full aspect-video bg-slate-950">
          <iframe
            src={media.embedUrl}
            title={title || '동영상 플레이어'}
            className="w-full h-full absolute inset-0 border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
        {!compact && (
          <div className="px-3.5 py-2.5 bg-slate-950 text-slate-300 flex items-center justify-between text-[11px] border-t border-slate-800">
            <span className="flex items-center gap-1.5 font-bold text-rose-400">
              <Film className="w-3.5 h-3.5" /> {media.platformLabel || '온라인 스트리밍 영상'}
            </span>
            {media.src.startsWith('http') && (
              <a
                href={media.src}
                target="_blank"
                rel="noreferrer"
                className="text-slate-400 hover:text-white flex items-center gap-1 hover:underline font-medium"
              >
                <span>새 창에서 원본 열기</span>
                <ArrowUpRight className="w-3 h-3" />
              </a>
            )}
          </div>
        )}
      </div>
    );
  }

  // 2. Direct HTML5 Video (MP4 / WebM / MOV / KakaoTalk files / Phone Camera)
  if (media.type === 'html5') {
    return (
      <div className={`overflow-hidden rounded-2xl bg-black border border-slate-800 shadow-md group relative ${className}`}>
        <div className="relative w-full bg-black flex items-center justify-center">
          <video
            ref={videoRef}
            src={media.src}
            controls={!compact}
            playsInline
            webkit-playsinline="true"
            preload="metadata"
            autoPlay={autoPlay}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onError={() => setHasError(true)}
            className={`w-full bg-black ${compact ? 'max-h-48 object-cover cursor-pointer' : 'max-h-[520px] object-contain'}`}
            onClick={compact ? togglePlay : undefined}
          />

          {/* Quick Play Overlay for Touch & Instant Preview */}
          {(!isPlaying || compact) && (
            <div
              onClick={togglePlay}
              className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/20 transition-all cursor-pointer pointer-events-auto"
            >
              <div className="w-14 h-14 rounded-full bg-rose-500/90 hover:bg-rose-500 text-white flex items-center justify-center shadow-2xl transition-transform hover:scale-110">
                <Play className="w-7 h-7 fill-white ml-1" />
              </div>
            </div>
          )}
        </div>

        {!compact && (
          <div className="px-4 py-2.5 bg-slate-950 text-slate-300 flex flex-wrap items-center justify-between gap-2 text-xs border-t border-slate-800">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 font-bold text-emerald-400">
                <Film className="w-3.5 h-3.5" />
                <span>{media.platformLabel || '원곡 스포츠 영상'}</span>
              </span>
              <span className="text-[10px] text-slate-400 font-medium hidden sm:inline">
                (PC·스마트폰·카톡 링크 즉시 재생)
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              {directLinkUrl && (
                <a
                  href={directLinkUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold flex items-center gap-1 transition-colors"
                  title="브라우저 새 창에서 원본 스트리밍"
                >
                  <span>새 창 재생</span>
                  <ArrowUpRight className="w-3 h-3" />
                </a>
              )}

              <a
                href={media.src}
                download={downloadFileName}
                className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold flex items-center gap-1 transition-colors"
                title="기기에 영상 원본 파일 다운로드"
              >
                <Download className="w-3 h-3" />
                <span>다운로드</span>
              </a>

              <button
                type="button"
                onClick={toggleFullscreen}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="전체화면"
              >
                <Maximize className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // 3. Other Web Video Link (Instagram, TikTok, Naver, External Stream)
  return (
    <div className={`p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-950 text-white border border-slate-800 flex items-center justify-between gap-4 shadow-sm ${className}`}>
      <div className="flex items-center gap-3 overflow-hidden">
        <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-400 flex items-center justify-center shrink-0">
          <Play className="w-5 h-5 fill-rose-400" />
        </div>
        <div className="overflow-hidden">
          <div className="text-xs font-black text-white flex items-center gap-1.5">
            <span>{media.platformLabel || '웹 동영상 미디어'}</span>
          </div>
          <div className="text-[11px] text-slate-400 truncate max-w-xs sm:max-w-md mt-0.5 font-mono">
            {media.src}
          </div>
        </div>
      </div>
      <a
        href={media.src}
        target="_blank"
        rel="noreferrer"
        className="px-3.5 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 shadow-sm"
      >
        <span>동영상 재생</span>
        <ArrowUpRight className="w-3.5 h-3.5" />
      </a>
    </div>
  );
};
