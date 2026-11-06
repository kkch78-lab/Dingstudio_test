import React, { useState, useRef, useEffect, useCallback } from 'react';
import { parseVideoMedia } from '../utils/mediaHelper';
import { loadVideoMedia } from '../utils/mediaStorage';
import {
  Play,
  Pause,
  ArrowUpRight,
  Film,
  Download,
  Maximize,
  Upload,
  Volume2,
  VolumeX,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

interface VideoPlayerProps {
  postId?: string;
  videoUrl?: string;
  videoData?: string;
  title?: string;
  autoPlay?: boolean;
  className?: string;
  compact?: boolean;
  videoFileName?: string;
  onOpenModal?: () => void;
  onReuploadVideo?: (file: File) => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  postId,
  videoUrl,
  videoData,
  title,
  autoPlay = false,
  className = '',
  compact = false,
  videoFileName,
  onOpenModal,
  onReuploadVideo
}) => {
  const media = parseVideoMedia(videoUrl, videoData, videoFileName);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Compute pristine playback source
  const computeSource = useCallback((): string => {
    // 1. Fresh local in-memory Blob URL for current user session upload
    if (videoData && videoData.startsWith('blob:')) {
      return videoData;
    }
    // 2. Direct server URL (/videos/...)
    if (
      videoUrl &&
      (videoUrl.startsWith('/videos/') ||
        videoUrl.startsWith('./videos/') ||
        videoUrl.startsWith('http://') ||
        videoUrl.startsWith('https://'))
    ) {
      return videoUrl.trim();
    }
    // 3. Server URL from videoFileName
    if (videoFileName && videoFileName.trim() && !videoFileName.startsWith('blob:')) {
      return `/videos/${videoFileName.trim()}`;
    }
    // 4. Parsed media src (e.g. YouTube embed, external MP4)
    if (media.src && media.type !== 'none' && !media.src.startsWith('blob:')) {
      return media.src;
    }
    // 5. Fallback URL
    if (videoUrl && videoUrl.trim()) return videoUrl.trim();
    if (videoData && videoData.trim()) return videoData.trim();
    return '';
  }, [media.src, media.type, videoUrl, videoData, videoFileName]);

  const [currentSrc, setCurrentSrc] = useState<string>(computeSource);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(true);

  // Sync currentSrc when props update
  useEffect(() => {
    const next = computeSource();
    if (next && next !== currentSrc) {
      setCurrentSrc(next);
      setIsPlaying(false);
    }
  }, [computeSource]);

  // IndexedDB Hydration for offline/local storage
  useEffect(() => {
    let isSubscribed = true;
    const checkLocalCache = async () => {
      if (!currentSrc || (!currentSrc.startsWith('blob:') && !currentSrc.startsWith('data:'))) {
        const key = postId || videoFileName;
        if (key) {
          try {
            const cached = await loadVideoMedia(key);
            if (cached && isSubscribed) {
              setCurrentSrc(cached);
            }
          } catch {}
        }
      }
    };
    checkLocalCache();
    return () => {
      isSubscribed = false;
    };
  }, [postId, videoFileName]);

  // Safe autoplay handler (starts muted to conform to iOS Safari and Android Chrome autoplay rules)
  useEffect(() => {
    if (autoPlay && videoRef.current && (media.type === 'html5' || !media.embedUrl)) {
      const v = videoRef.current;
      v.muted = true;
      setIsMuted(true);
      const playPromise = v.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsPlaying(true))
          .catch(() => {
            // Autoplay blocked by browser policy; user can tap to play
            setIsPlaying(false);
          });
      }
    }
  }, [autoPlay, currentSrc, media.type, media.embedUrl]);

  const handlePlayToggle = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (compact && onOpenModal) {
      onOpenModal();
      return;
    }
    if (!videoRef.current) return;

    if (videoRef.current.paused) {
      videoRef.current.muted = false;
      setIsMuted(false);
      videoRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {
          // Fallback to muted playback if audio gesture is missing
          if (videoRef.current) {
            videoRef.current.muted = true;
            setIsMuted(true);
            videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
          }
        });
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleMuteToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    const nextMuted = !videoRef.current.muted;
    videoRef.current.muted = nextMuted;
    setIsMuted(nextMuted);
  };

  const handleFullscreen = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    if (videoRef.current.requestFullscreen) {
      videoRef.current.requestFullscreen();
    } else if ((videoRef.current as any).webkitRequestFullscreen) {
      (videoRef.current as any).webkitRequestFullscreen();
    } else if ((videoRef.current as any).webkitEnterFullscreen) {
      (videoRef.current as any).webkitEnterFullscreen();
    }
  };

  const directLinkUrl = currentSrc.startsWith('http') || currentSrc.startsWith('/') ? currentSrc : '';
  const downloadFileName = videoFileName || 'wongok_video.mp4';

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

  // 2. Direct HTML5 Video Player (MP4 / WebM / MOV / KakaoTalk / Smartphone Videos)
  // Always renders a fully interactive HTML5 video canvas with ZERO blocking error screens
  const activePlaySrc = currentSrc || media.src || (videoFileName ? `/videos/${videoFileName}` : '');

  return (
    <div className={`overflow-hidden rounded-2xl bg-black border border-slate-800 shadow-md group relative ${className}`}>
      <div className="relative w-full bg-black flex items-center justify-center min-h-[220px]">
        {activePlaySrc ? (
          <video
            ref={videoRef}
            src={activePlaySrc}
            controls={!compact}
            playsInline
            webkit-playsinline="true"
            x5-playsinline="true"
            preload="auto"
            muted={isMuted}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            className={`w-full bg-black ${compact ? 'max-h-48 object-cover cursor-pointer' : 'max-h-[540px] object-contain'}`}
            onClick={compact ? handlePlayToggle : undefined}
          >
            이 브라우저는 동영상 재생을 지원하지 않습니다.
          </video>
        ) : (
          <div className="py-12 px-4 flex flex-col items-center justify-center text-center gap-2 text-slate-300">
            <Film className="w-10 h-10 text-rose-500 animate-pulse" />
            <span className="text-sm font-bold text-white">영상 데이터를 준비 중입니다.</span>
            <span className="text-xs text-slate-400">
              {videoFileName ? `[${videoFileName}] 준비 중...` : '잠시만 기다려주세요.'}
            </span>
          </div>
        )}

        {/* Big Center Play Button Overlay on Pause or Compact mode */}
        {(!isPlaying || compact) && activePlaySrc && (
          <div
            onClick={handlePlayToggle}
            className="absolute inset-0 flex flex-col items-center justify-center bg-black/30 hover:bg-black/15 transition-all cursor-pointer pointer-events-auto"
          >
            <div className="w-16 h-16 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center shadow-2xl transition-transform hover:scale-110 mb-2">
              <Play className="w-8 h-8 fill-white ml-1" />
            </div>
            <span className="px-3.5 py-1.5 rounded-full bg-black/80 text-white text-xs font-bold tracking-tight backdrop-blur-sm shadow-md flex items-center gap-1.5 border border-white/10">
              <Play className="w-3 h-3 fill-rose-400 text-rose-400" />
              <span>동영상 바로 시청하기</span>
            </span>
          </div>
        )}
      </div>

      {/* Control bar & direct action links below video */}
      {!compact && (
        <div className="px-4 py-3 bg-slate-950 text-slate-300 flex flex-wrap items-center justify-between gap-2.5 text-xs border-t border-slate-800">
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="flex items-center gap-1.5 font-bold text-emerald-400 shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{media.platformLabel || '원곡 스포츠 영상'}</span>
            </span>
            <span className="text-[11px] text-slate-400 font-medium truncate max-w-[160px] sm:max-w-xs">
              {videoFileName || 'MP4 고화질 스트리밍'}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handlePlayToggle}
              className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
            >
              {isPlaying ? (
                <>
                  <Pause className="w-3.5 h-3.5" />
                  <span>일시정지</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>영상 재생</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleMuteToggle}
              className={`p-1.5 rounded-xl border transition-colors ${
                isMuted
                  ? 'bg-amber-950/60 border-amber-800 text-amber-300 hover:bg-amber-900/60'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
              }`}
              title={isMuted ? '소리 켜기 (음소거 해제)' : '음소거'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            {directLinkUrl && (
              <a
                href={directLinkUrl}
                target="_blank"
                rel="noreferrer"
                className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1 transition-colors border border-slate-700"
                title="브라우저 새 창에서 원본 스트리밍"
              >
                <span>새 창 재생</span>
                <ArrowUpRight className="w-3 h-3" />
              </a>
            )}

            {activePlaySrc && (
              <a
                href={activePlaySrc}
                download={downloadFileName}
                className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1 transition-colors border border-slate-700"
                title="기기에 영상 원본 파일 다운로드"
              >
                <Download className="w-3 h-3" />
                <span>저장</span>
              </a>
            )}

            {onReuploadVideo && (
              <label
                className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                title="카카오톡 또는 스마트폰 촬영 영상 파일로 즉시 교체 및 동기화"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>카톡·폰 영상 교체</span>
                <input
                  type="file"
                  accept="video/*,.mp4,.mov,.MOV,.webm,.m4v,.3gp"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) onReuploadVideo(f);
                  }}
                />
              </label>
            )}

            <button
              type="button"
              onClick={handleFullscreen}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="전체화면"
            >
              <Maximize className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
