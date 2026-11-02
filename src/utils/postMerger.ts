import { Post } from '../types';

/**
 * Extract the best reliable timestamp (in milliseconds) for a post.
 * Checks lastUpdated first, then timestamp encoded in ID, then date string, or falls back to 0.
 */
export function getPostTimestamp(post?: Partial<Post> | null): number {
  if (!post) return 0;

  // 1. Explicit numeric lastUpdated
  if (typeof post.lastUpdated === 'number' && !isNaN(post.lastUpdated) && post.lastUpdated > 0) {
    return post.lastUpdated;
  }

  // 2. Timestamp embedded in ID (e.g. post_1793098734469_76jmo)
  if (post.id && typeof post.id === 'string') {
    const idMatch = post.id.match(/^post_(\d{10,13})/);
    if (idMatch && idMatch[1]) {
      const parsedIdTime = parseInt(idMatch[1], 10);
      if (!isNaN(parsedIdTime) && parsedIdTime > 0) {
        return parsedIdTime;
      }
    }
  }

  // 3. Date string (e.g. 2026-08-30)
  if (post.date && typeof post.date === 'string') {
    const parsedDate = new Date(post.date).getTime();
    if (!isNaN(parsedDate) && parsedDate > 0) {
      return parsedDate;
    }
  }

  return 0;
}

/**
 * Normalizes any incoming post object ensuring all required fields,
 * especially a valid numeric lastUpdated timestamp.
 */
export function normalizePost(raw: any): Post {
  const ts = getPostTimestamp(raw) || Date.now();
  return {
    ...raw,
    id: String(raw?.id || `post_${Date.now()}`),
    category: raw?.category || '자유',
    title: raw?.title || '',
    author: raw?.author || '원곡중 구성원',
    content: raw?.content || '',
    date: raw?.date || new Date().toISOString().split('T')[0],
    views: typeof raw?.views === 'number' ? Math.max(0, raw.views) : 0,
    lastUpdated: ts
  };
}

/**
 * Merges two versions of the same post.
 * The version with the strictly higher lastUpdated timestamp takes priority.
 * Missing media assets from the newer version are gracefully preserved from the older version.
 */
export function mergeSinglePost(postA: Post, postB: Post): Post {
  const normA = normalizePost(postA);
  const normB = normalizePost(postB);

  const tsA = normA.lastUpdated;
  const tsB = normB.lastUpdated;

  // If Post B is strictly newer, B's content & metadata win
  if (tsB > tsA) {
    return {
      ...normA,
      ...normB,
      // Retain media if B did not provide it but A had it cached
      imageUrl: normB.imageUrl || normA.imageUrl,
      imageFileName: normB.imageFileName || normA.imageFileName,
      videoUrl: normB.videoUrl || normA.videoUrl,
      videoData: normB.videoData || normA.videoData,
      videoFileName: normB.videoFileName || normA.videoFileName,
      videoSourceType: normB.videoSourceType || normA.videoSourceType,
      fileUrl: normB.fileUrl || normA.fileUrl,
      fileData: normB.fileData || normA.fileData,
      hasStoredImage: normB.hasStoredImage ?? normA.hasStoredImage,
      hasStoredVideo: normB.hasStoredVideo ?? normA.hasStoredVideo,
      views: Math.max(normA.views || 0, normB.views || 0),
      lastUpdated: tsB
    };
  }

  // Otherwise, Post A is newer or equal, so A's content & metadata win
  return {
    ...normB,
    ...normA,
    // Retain media if A did not provide it but B had it
    imageUrl: normA.imageUrl || normB.imageUrl,
    imageFileName: normA.imageFileName || normB.imageFileName,
    videoUrl: normA.videoUrl || normB.videoUrl,
    videoData: normA.videoData || normB.videoData,
    videoFileName: normA.videoFileName || normB.videoFileName,
    videoSourceType: normA.videoSourceType || normB.videoSourceType,
    fileUrl: normA.fileUrl || normB.fileUrl,
    fileData: normA.fileData || normB.fileData,
    hasStoredImage: normA.hasStoredImage ?? normB.hasStoredImage,
    hasStoredVideo: normA.hasStoredVideo ?? normB.hasStoredVideo,
    views: Math.max(normA.views || 0, normB.views || 0),
    lastUpdated: tsA
  };
}

/**
 * Merges two arrays of posts (e.g. LocalStorage vs Server/Firebase).
 * For duplicate post IDs, the one with the latest lastUpdated timestamp wins.
 * Any post marked as isDeleted or present in deletedIds is completely excluded.
 * Returns a sorted array by date desc and lastUpdated desc.
 */
export function mergePostArrays(
  basePosts: (Post | any)[] = [],
  incomingPosts: (Post | any)[] = [],
  deletedIds?: Set<string> | string[]
): Post[] {
  const delSet = deletedIds instanceof Set ? deletedIds : new Set(deletedIds || []);
  const postMap = new Map<string, Post>();

  // 1. Populate base posts (skipping deleted)
  for (const item of basePosts) {
    if (!item || !item.id) continue;
    if (item.isDeleted || delSet.has(item.id)) continue;
    const post = normalizePost(item);
    postMap.set(post.id, post);
  }

  // 2. Merge incoming posts by comparing lastUpdated
  for (const item of incomingPosts) {
    if (!item || !item.id) continue;
    if (item.isDeleted || delSet.has(item.id)) {
      postMap.delete(item.id);
      continue;
    }
    const incoming = normalizePost(item);
    const existing = postMap.get(incoming.id);

    if (existing) {
      const merged = mergeSinglePost(existing, incoming);
      if (merged.isDeleted) {
        postMap.delete(incoming.id);
      } else {
        postMap.set(incoming.id, merged);
      }
    } else {
      postMap.set(incoming.id, incoming);
    }
  }

  // Double check no deleted posts remain in postMap
  for (const delId of delSet) {
    postMap.delete(delId);
  }

  const merged = Array.from(postMap.values()).filter(
    (p) => !p.isDeleted && !delSet.has(p.id)
  );

  // 3. Sort: date desc, then lastUpdated desc, then id
  return merged.sort((a, b) => {
    const dateCmp = (b.date || '').localeCompare(a.date || '');
    if (dateCmp !== 0) return dateCmp;
    const timeCmp = (b.lastUpdated || 0) - (a.lastUpdated || 0);
    if (timeCmp !== 0) return timeCmp;
    return b.id.localeCompare(a.id);
  });
}
