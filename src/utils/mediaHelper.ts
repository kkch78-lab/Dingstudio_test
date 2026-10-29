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
 * and returns clean embed or playback parameters.
 */
export function parseVideoMedia(urlOrData?: string, videoData?: string): VideoMediaInfo {
  let raw = (videoData || urlOrData || '').trim();
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
      platformLabel: '직접 첨부된 동영상 (MP4/WebM/MOV)'
    };
  }

  // Auto-normalize URLs missing protocol (e.g. www.youtube.com or youtu.be)
  if (
    !raw.startsWith('http://') &&
    !raw.startsWith('https://') &&
    !raw.startsWith('data:') &&
    !raw.startsWith('blob:')
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
      // It's just a raw filename like "my_video.mp4" without data or full URL
      // Cannot be fetched directly as HTML5 stream without data source
      return {
        type: 'none',
        src: '',
        platformLabel: raw
      };
    }
  }

  // 2. YouTube (watch, youtu.be, shorts, live, embed)
  // Handles all mobile app sharing, desktop, shorts, and query parameter variations
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

  // 3. Google Drive Shared Video Link
  // Handles:
  // - https://drive.google.com/file/d/FILE_ID/view?usp=sharing
  // - https://drive.google.com/open?id=FILE_ID
  // - https://drive.google.com/file/d/FILE_ID/preview
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

  // 4. Vimeo
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

  // 5. Direct Web Video File URL (MP4, WebM, MOV, OGG, M4V, MKV, or /videos/...)
  if (
    raw.startsWith('/videos/') ||
    raw.startsWith('./videos/') ||
    ((raw.startsWith('http://') || raw.startsWith('https://') || raw.startsWith('/') || raw.startsWith('./')) &&
      (/\.(mp4|webm|mov|ogg|m4v|mkv)(\?.*)?$/i.test(raw) || raw.includes('.mp4') || raw.includes('.webm')))
  ) {
    return {
      type: 'html5',
      src: raw,
      isDirectFile: true,
      platformLabel: '직접 등록된 동영상 (MP4)'
    };
  }

  // 6. Instagram Reels / Post
  if (raw.includes('instagram.com/reel/') || raw.includes('instagram.com/p/')) {
    return {
      type: 'link',
      src: raw,
      platformLabel: '인스타그램 릴스 (Instagram Reel)'
    };
  }

  // 7. TikTok
  if (raw.includes('tiktok.com/')) {
    return {
      type: 'link',
      src: raw,
      platformLabel: '틱톡 숏폼 비디오 (TikTok)'
    };
  }

  // 8. Naver TV / Kakao TV
  if (raw.includes('tv.naver.com') || raw.includes('tv.kakao.com')) {
    return {
      type: 'link',
      src: raw,
      platformLabel: '네이버TV / 카카오TV 영상'
    };
  }

  // 9. Generic Web URL
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
