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
  // Handles:
  // - https://www.youtube.com/watch?v=VIDEO_ID
  // - https://youtu.be/VIDEO_ID?si=...
  // - https://www.youtube.com/shorts/VIDEO_ID
  // - https://www.youtube.com/live/VIDEO_ID
  // - https://youtube.com/embed/VIDEO_ID
  const ytMatch = raw.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?.*v=|shorts\/|live\/))([\w-]{11})/i
  );
  if (ytMatch && ytMatch[1]) {
    const videoId = ytMatch[1];
    return {
      type: 'youtube',
      src: raw,
      videoId,
      embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=0&rel=0&modestbranding=1&playsinline=1`,
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      platformLabel: 'YouTube 동영상 / 쇼츠'
    };
  }

  // 3. Google Drive Shared Video Link
  // Handles:
  // - https://drive.google.com/file/d/FILE_ID/view?usp=sharing
  // - https://drive.google.com/open?id=FILE_ID
  const gdriveMatch = raw.match(/drive\.google\.com\/(?:file\/d\/|open\?id=)([a-zA-Z0-9_-]+)/i);
  if (gdriveMatch && gdriveMatch[1]) {
    const fileId = gdriveMatch[1];
    return {
      type: 'gdrive',
      src: raw,
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

  // 5. Direct Web Video File URL (MP4, WebM, MOV, OGG, M4V, MKV)
  if (
    (raw.startsWith('http://') || raw.startsWith('https://')) &&
    /\.(mp4|webm|mov|ogg|m4v|mkv)(\?.*)?$/i.test(raw)
  ) {
    return {
      type: 'html5',
      src: raw,
      isDirectFile: true,
      platformLabel: '웹 비디오 스트림 (MP4/WebM/MOV)'
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
