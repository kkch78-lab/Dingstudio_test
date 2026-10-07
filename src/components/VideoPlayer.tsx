import React, { useState } from 'react';
import { parseVideoMedia } from '../utils/mediaHelper';
import { Play, ArrowUpRight, Film, CircleAlert, Download, RefreshCw } from 'lucide-react';

interface VideoPlayerProps {
  videoUrl?: string;
  videoData?: string;
  title?: string;
  autoPlay?: boolean;
  className?: string;
  compact?: boolean;
  videoFileName?: string;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoUrl,
  videoData,
  title,
  className = '',
  compact = false,
  videoFileName
}) => {
  const media = parseVideoMedia(videoUrl, videoData);
  const [hasError, setHasError] = useState(false);

  if (media.type === 'none' || !media.src) {
    return null;
  }

  const isDataOrBlob = media.src.startsWith('data:') || media.src.startsWith('blob:');
  const downloadFileName = videoFileName || (videoUrl && !videoUrl.startsWith('http') ? videoUrl : 'wongok_video.mp4');

  // Fallback UI when browser video playback fails (e.g., iPhone HEVC/MOV codec unsupported in desktop browser)
  if (hasError) {
    return (
      <div className={`rounded-2xl p-4 bg-slate-900 text-slate-200 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md ${className}`}>
        <div className="flex items-center gap-2.5">
          <CircleAlert className="w-5 h-5 text-amber-400 shrink-0" />
          <div className="text-xs">
            <span className="font-bold text-white block">동영상 브라우저 내장 재생 불가</span>
            <span className="text-[11px] text-slate-400">
              iPhone 고화질 MOV/HEVC 등 특정 코덱 영상입니다. 다운로드하거나 외부 플레이어로 원활히 감상하세요.
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={() => setHasError(false)}
            className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1"
          >
            <RefreshCw className="w-3 h-3" />
            <span>다시 시도</span>
          </button>

          {isDataOrBlob ? (
            <a
              href={media.src}
              download={downloadFileName}
              className="px-3.5 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold shrink-0 flex items-center gap-1.5 shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>동영상 다운로드</span>
            </a>
          ) : media.src.startsWith('http') ? (
            <a
              href={media.src}
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold shrink-0 flex items-center gap-1.5 shadow-sm"
            >
              <span>새 창에서 보기</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          ) : null}
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
          <div className="px-3.5 py-2 bg-slate-950 text-slate-300 flex items-center justify-between text-[11px] border-t border-slate-800">
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

  // 2. Direct HTML5 Video (MP4 / WebM / MOV / Uploaded Base64 / Blob)
  if (media.type === 'html5') {
    return (
      <div className={`overflow-hidden rounded-2xl bg-black border border-slate-800 shadow-md ${className}`}>
        <video
          key={media.src.substring(0, 40)}
          src={media.src}
          controls
          playsInline
          preload="metadata"
          onError={() => setHasError(true)}
          className={`w-full bg-black ${compact ? 'max-h-48 object-cover' : 'max-h-[480px] object-contain'}`}
        >
          해당 브라우저에서 동영상 재생을 지원하지 않습니다.
        </video>
        {!compact && (
          <div className="px-3.5 py-2 bg-slate-950 text-slate-300 flex items-center justify-between text-[11px] border-t border-slate-800">
            <span className="flex items-center gap-1.5 font-bold text-emerald-400">
              <Film className="w-3.5 h-3.5" /> {media.platformLabel || '직접 첨부된 동영상 (MP4/WebM/MOV)'}
            </span>
            <div className="flex items-center gap-2.5">
              {isDataOrBlob && (
                <a
                  href={media.src}
                  download={downloadFileName}
                  className="text-slate-400 hover:text-white flex items-center gap-1 hover:underline font-medium"
                  title="영상 파일 기기에 다운로드"
                >
                  <Download className="w-3 h-3" />
                  <span>다운로드</span>
                </a>
              )}
              <span className="text-[10px] text-slate-500 font-medium">원곡중 고화질 플레이어</span>
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
