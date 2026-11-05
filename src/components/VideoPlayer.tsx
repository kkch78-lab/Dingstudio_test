import React, { useState, useRef, useEffect, useCallback } from 'react';
import { parseVideoMedia } from '../utils/mediaHelper';
import { loadVideoMedia } from '../utils/mediaStorage';
import { Play, Pause, ArrowUpRight, Film, Download, RefreshCw, Maximize, Upload, Sparkles, CheckCircle2 } from 'lucide-react';

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

  // Compute the optimal initial playback source
  const getInitialSrc = useCallback((): string => {
    // 1. If in-memory blob: or data: URL is provided, it is 100% playable locally
    if (videoData && (videoData.startsWith('blob:') || videoData.startsWith('data:'))) {
      return videoData;
    }
    // 2. Explicit videoUrl
    if (videoUrl && videoUrl.trim()) {
      return videoUrl.trim();
    }
    // 3. Parsed media src (e.g. /videos/..., YouTube embed, etc.)
    if (media.src && media.type !== 'none') {
      return media.src;
    }
    // 4. videoFileName on server
    if (videoFileName && videoFileName.trim()) {
      return `/videos/${videoFileName.trim()}`;
    }
    // 5. Raw videoData
    if (videoData && videoData.trim()) {
      return videoData.trim();
    }
    return '';
  }, [media.src, media.type, videoUrl, videoData, videoFileName]);

  const [currentSrc, setCurrentSrc] = useState<string>(getInitialSrc);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [retryCount, setRetryCount] = useState<number>(0);
  const [isRecovering, setIsRecovering] = useState<boolean>(false);
  const [hasPlaybackError, setHasPlaybackError] = useState<boolean>(false);

  // Initial check: if currentSrc is empty or needs IndexedDB hydration
  useEffect(() => {
    let isSubscribed = true;
    const hydrateFromStorage = async () => {
      // If we don't have a direct blob/data URL, check IndexedDB first for high-quality local binary
      if (!currentSrc || (!currentSrc.startsWith('blob:') && !currentSrc.startsWith('data:'))) {
        if (postId) {
          const cached = await loadVideoMedia(postId);
          if (cached && isSubscribed) {
            setCurrentSrc(cached);
            setHasPlaybackError(false);
            return;
          }
        }
        if (videoFileName) {
          const cached = await loadVideoMedia(videoFileName);
          if (cached && isSubscribed) {
            setCurrentSrc(cached);
            setHasPlaybackError(false);
            return;
          }
        }
      }
    };
    hydrateFromStorage();
    return () => {
      isSubscribed = false;
    };
  }, [postId, videoFileName]);

  // Sync state whenever props change
  useEffect(() => {
    const next = getInitialSrc();
    if (next && next !== currentSrc) {
      setCurrentSrc(next);
      setRetryCount(0);
      setIsPlaying(false);
      setHasPlaybackError(false);
      if (videoRef.current) {
        videoRef.current.load();
      }
    }
  }, [getInitialSrc]);

  // Attempt natural playback on mount or when autoPlay is requested
  useEffect(() => {
    if (autoPlay && videoRef.current && (media.type === 'html5' || !media.embedUrl)) {
      const v = videoRef.current;
      v.play()
        .then(() => setIsPlaying(true))
        .catch(() => {
          // Mute and retry if browser autoplay policy blocks unmuted audio
          v.muted = true;
          v.play()
            .then(() => setIsPlaying(true))
            .catch(() => {
              // Gracefully waiting for user tap/click
            });
        });
    }
  }, [autoPlay, currentSrc, media.type, media.embedUrl]);

  // Smart cascade recovery if a video source encounters a playback or decoding error
  // STRICT RULE: ONLY recover using data belonging to THIS video (never swap in another video!)
  const handleVideoError = useCallback(async () => {
    if (isRecovering) return;
    setIsRecovering(true);

    console.log(`[VideoPlayer] Auto-recovering playback for [${videoFileName || title || 'video'}], attempt: ${retryCount}`);

    // Fallback 1: If local in-memory videoData exists and is valid, switch to it
    if (videoData && currentSrc !== videoData && (videoData.startsWith('blob:') || videoData.startsWith('data:'))) {
      setCurrentSrc(videoData);
      setIsRecovering(false);
      setRetryCount((prev) => prev + 1);
      return;
    }

    // Fallback 2: Check IndexedDB by postId for the real binary blob
    if (postId) {
      try {
        const cached = await loadVideoMedia(postId);
        if (cached && cached !== currentSrc) {
          setCurrentSrc(cached);
          setIsRecovering(false);
          setRetryCount((prev) => prev + 1);
          return;
        }
      } catch {}
    }

    // Fallback 3: Check IndexedDB by videoFileName
    if (videoFileName) {
      try {
        const cached = await loadVideoMedia(videoFileName);
        if (cached && cached !== currentSrc) {
          setCurrentSrc(cached);
          setIsRecovering(false);
          setRetryCount((prev) => prev + 1);
          return;
        }
      } catch {}
    }

    // Fallback 4: If currentSrc is a server URL, fetch as Blob to bypass range-request / MIME quirks in mobile browsers
    if (currentSrc && (currentSrc.startsWith('/videos/') || currentSrc.startsWith('http'))) {
      try {
        const res = await fetch(currentSrc);
        if (res.ok) {
          const blob = await res.blob();
          if (blob && blob.size > 1000) {
            const blobUrl = URL.createObjectURL(blob);
            setCurrentSrc(blobUrl);
            setIsRecovering(false);
            setRetryCount((prev) => prev + 1);
            return;
          }
        }
      } catch {}
    }

    // Fallback 5: Try direct server streaming path for videoFileName
    if (videoFileName && currentSrc !== `/videos/${videoFileName}`) {
      setCurrentSrc(`/videos/${videoFileName}`);
      setIsRecovering(false);
      setRetryCount((prev) => prev + 1);
      return;
    }

    // Never swap in another video! If exhausted, record error gracefully
    setIsRecovering(false);
    setHasPlaybackError(true);
  }, [currentSrc, videoData, videoFileName, title, retryCount, isRecovering, postId]);

  const handlePlayToggle = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (compact && onOpenModal) {
      onOpenModal();
      return;
    }
    if (!videoRef.current) return;

    if (videoRef.current.paused) {
      videoRef.current.muted = false;
      videoRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {
          // Retry with muted if browser blocked audio gesture
          if (videoRef.current) {
            videoRef.current.muted = true;
            videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
          }
        });
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
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
  // Always renders a fully interactive HTML5 video canvas with zero blocking errors
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
            preload="metadata"
            onPlay={() => {
              setIsPlaying(true);
              setHasPlaybackError(false);
            }}
            onPause={() => setIsPlaying(false)}
            onError={handleVideoError}
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
        {(!isPlaying || compact) && activePlaySrc && !hasPlaybackError && (
          <div
            onClick={handlePlayToggle}
            className="absolute inset-0 flex flex-col items-center justify-center bg-black/35 hover:bg-black/20 transition-all cursor-pointer pointer-events-auto"
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

        {/* Playback Recovery Overlay if browser codec needs direct stream */}
        {hasPlaybackError && !isPlaying && activePlaySrc && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-xs flex flex-col items-center justify-center p-4 text-center z-20">
            <Film className="w-10 h-10 text-amber-400 mb-2" />
            <h4 className="text-sm font-bold text-white mb-1">스마트폰/카카오톡 영상 재생</h4>
            <p className="text-xs text-slate-300 max-w-sm mb-3">
              기기 코덱에 맞춰 새 창에서 원본으로 바로 시청하시거나 재생을 다시 시도하실 수 있습니다.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setHasPlaybackError(false);
                  if (videoRef.current) {
                    videoRef.current.load();
                    videoRef.current.play().catch(() => {});
                  }
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center gap-1.5 border border-slate-700"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>재생 다시 시도</span>
              </button>
              {directLinkUrl && (
                <a
                  href={directLinkUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
                >
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  <span>새 창에서 바로 재생</span>
                </a>
              )}
            </div>
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

            {directLinkUrl && (
              <a
                href={directLinkUrl}
                target="_blank"
                rel="noreferrer"
                className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1 transition-colors"
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
                className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1 transition-colors"
                title="기기에 영상 원본 파일 다운로드"
              >
                <Download className="w-3 h-3" />
                <span>저장</span>
              </a>
            )}

            {onReuploadVideo && (
              <label
                className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1 transition-colors shadow-xs cursor-pointer"
                title="카카오톡 또는 휴대폰 영상으로 동기화/교체"
              >
                <Upload className="w-3 h-3" />
                <span>영상 교체</span>
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
