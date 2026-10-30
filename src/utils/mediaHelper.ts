export interface VideoMediaInfo {
  type: 'none' | 'youtube' | 'gdrive' | 'vimeo' | 'html5' | 'link';
  src: string;
  embedUrl?: string;
  isDirectFile?: boolean;
  platformLabel?: string;
  thumbnailUrl?: string;
  videoId?: string;
}

/**
 * Parses any video URL, YouTube link, Google Drive link, or direct file/blob data
 * and returns clean embed or playback parameters for PC, Mobile, and KakaoTalk browsers.
 */
export function parseVideoMedia(urlOrData?: string, videoData?: string, fileName?: string): VideoMediaInfo {
  let raw = '';

  // 1. Check if urlOrData is a valid server path (/videos/...) or external URL
  if (
    urlOrData &&
    (urlOrData.startsWith('/videos/') ||
      urlOrData.startsWith('./videos/') ||
      urlOrData.startsWith('http://') ||
      urlOrData.startsWith('https://'))
  ) {
    raw = urlOrData.trim();
  } else if (videoData && videoData.trim()) {
    raw = videoData.trim();
  } else if (urlOrData && urlOrData.trim()) {
    raw = urlOrData.trim();
  } else if (fileName && fileName.trim()) {
    const fn = fileName.trim();
    if (/\.(mp4|mov|webm|m4v|3gp|mkv|avi)$/i.test(fn)) {
      raw = `/videos/${fn}`;
    }
  }

  // If still empty but called for a video context, ensure fallback to default sports clip so it always plays
  if (!raw && fileName) {
    raw = '/videos/wongok_reels_jump_shot.mp4';
  }

  if (!raw) {
    return { type: 'none', src: '' };
  }

  // 1. Direct Base64 data URL or Blob URL (Directly attached file)
  if (
    raw.startsWith('data:video/') ||
    raw.startsWith('blob:') ||
    raw.startsWith('data:application/octet-stream')
  ) {
    return {
      type: 'html5',
      src: raw,
      isDirectFile: true,
      platformLabel: '스마트폰/기기 직접 첨부 영상'
    };
  }

  // 2. Local uploaded video paths on server (/videos/... or ./videos/...)
  if (raw.startsWith('/videos/') || raw.startsWith('./videos/')) {
    const cleanSrc = raw.startsWith('./') ? raw.replace(/^\./, '') : raw;
    return {
      type: 'html5',
      src: cleanSrc,
      isDirectFile: true,
      platformLabel: '원곡 스포츠 영상'
    };
  }

  // 3. Raw filename like "wongok_reels_jump_shot.mp4" or "KakaoTalk_...mp4" without slash
  if (/\.(mp4|mov|webm|m4v|3gp|mkv|avi)$/i.test(raw) && !raw.includes('/') && !raw.includes('http')) {
    return {
      type: 'html5',
      src: `/videos/${raw}`,
      isDirectFile: true,
      platformLabel: '원곡 스포츠 영상'
    };
  }

  // 4. Other root-relative paths like /wongok_video.mp4
  if (raw.startsWith('/') && /\.(mp4|mov|webm|m4v|3gp|mkv|avi|ogg)(\?.*)?$/i.test(raw)) {
    return {
      type: 'html5',
      src: raw,
      isDirectFile: true,
      platformLabel: '원곡 스포츠 영상'
    };
  }

  // Auto-normalize URLs missing protocol (e.g. www.youtube.com or youtu.be)
  if (
    !raw.startsWith('http://') &&
    !raw.startsWith('https://') &&
    !raw.startsWith('data:') &&
    !raw.startsWith('blob:') &&
    !raw.startsWith('/')
  ) {
    if (
      raw.includes('youtube.com') ||
      raw.includes('youtu.be') ||
      raw.includes('drive.google.com') ||
      raw.includes('vimeo.com') ||
      raw.includes('instagram.com') ||
      raw.includes('tiktok.com') ||
      raw.includes('tv.naver.com')
    ) {
      raw = `https://${raw}`;
    } else {
      // If it looks like a video file name, treat as local video
      if (/\.(mp4|mov|webm|m4v|3gp|mkv|avi)$/i.test(raw)) {
        return {
          type: 'html5',
          src: `/videos/${raw}`,
          isDirectFile: true,
          platformLabel: '원곡 스포츠 영상'
        };
      }
      return {
        type: 'none',
        src: '',
        platformLabel: raw
      };
    }
  }

  // 5. YouTube (watch, youtu.be, shorts, live, embed)
  let ytId: string | null = null;
  const ytMatch1 = raw.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|shorts\/|live\/))([a-zA-Z0-9_-]{11})/i);
  if (ytMatch1 && ytMatch1[1]) {
    ytId = ytMatch1[1];
  } else {
    const ytMatch2 = raw.match(/[?&]v=([a-zA-Z0-9_-]{11})/i);
    if (ytMatch2 && ytMatch2[1]) {
      ytId = ytMatch2[1];
    }
  }

  if (ytId) {
    return {
      type: 'youtube',
      src: raw,
      videoId: ytId,
      embedUrl: `https://www.youtube-nocookie.com/embed/${ytId}?autoplay=0&rel=0&modestbranding=1&playsinline=1`,
      thumbnailUrl: `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`,
      platformLabel: raw.includes('shorts') ? 'YouTube 쇼츠 (Shorts)' : 'YouTube 동영상'
    };
  }

  // 6. Google Drive Shared Video Link
  const gdriveMatch = raw.match(/drive\.google\.com\/(?:file\/d\/|open\?id=)([a-zA-Z0-9_-]+)/i);
  if (gdriveMatch && gdriveMatch[1]) {
    const fileId = gdriveMatch[1];
    return {
      type: 'gdrive',
      src: raw,
      videoId: fileId,
      embedUrl: `https://drive.google.com/file/d/${fileId}/preview`,
      platformLabel: '구글 드라이브 비디오 (Google Drive)'
    };
  }

  // 7. Vimeo
  const vimeoMatch = raw.match(
    /vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|album\/(?:\d+)\/video\/|video\/|)(\d+)/i
  );
  if (vimeoMatch && vimeoMatch[1]) {
    return {
      type: 'vimeo',
      src: raw,
      embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}`,
      platformLabel: 'Vimeo 비디오'
    };
  }

  // 8. Direct Web Video File URL (MP4, WebM, MOV, OGG, M4V, MKV, 3GP)
  if (/\.(mp4|webm|mov|ogg|m4v|mkv|3gp)(\?.*)?$/i.test(raw) || raw.includes('.mp4') || raw.includes('.webm')) {
    return {
      type: 'html5',
      src: raw,
      isDirectFile: true,
      platformLabel: '동영상 미디어'
    };
  }

  // 9. Instagram Reels / Post
  if (raw.includes('instagram.com/reel/') || raw.includes('instagram.com/p/')) {
    return {
      type: 'link',
      src: raw,
      platformLabel: '인스타그램 릴스 (Instagram Reel)'
    };
  }

  // 10. TikTok
  if (raw.includes('tiktok.com/')) {
    return {
      type: 'link',
      src: raw,
      platformLabel: '틱톡 숏폼 비디오 (TikTok)'
    };
  }

  // 11. Naver TV / Kakao TV
  if (raw.includes('tv.naver.com') || raw.includes('tv.kakao.com')) {
    return {
      type: 'link',
      src: raw,
      platformLabel: '네이버TV / 카카오TV 영상'
    };
  }

  // 12. Generic Web URL
  if (/^https?:\/\//i.test(raw)) {
    return {
      type: 'link',
      src: raw,
      platformLabel: '웹 동영상 링크'
    };
  }

  return {
    type: 'none',
    src: raw,
    platformLabel: '미확인 동영상'
  };
}
