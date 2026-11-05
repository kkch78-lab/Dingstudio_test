// IndexedDB Media Storage for High-Capacity Video & File Persistence
// Safely handles videos up to 100MB+ without localStorage quota crashes

const DB_NAME = 'wongok_media_db';
const DB_VERSION = 1;
const STORE_NAME = 'media_files';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported in this environment'));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export interface StoredMediaRecord {
  id: string;
  data: string | Blob;
  fileName?: string;
  mimeType?: string;
  size?: number;
  updatedAt: number;
}

/**
 * Persist a video or media blob/data URL into browser IndexedDB
 */
export async function storeVideoMedia(
  id: string,
  data: string | Blob,
  fileName?: string,
  mimeType?: string,
  size?: number
): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const record: StoredMediaRecord = {
        id,
        data,
        fileName: fileName || '',
        mimeType: mimeType || '',
        size: size || (typeof data === 'string' ? data.length : data.size),
        updatedAt: Date.now()
      };
      const req = store.put(record);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Failed to store media in IndexedDB:', err);
  }
}

/**
 * Retrieve video or media data URL / Object URL from IndexedDB by post ID or fileName
 */
export async function loadVideoMedia(idOrFileName: string): Promise<string | null> {
  if (!idOrFileName) return null;
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(idOrFileName);
      req.onsuccess = () => {
        if (req.result && req.result.data) {
          const rawData = req.result.data;
          if (rawData instanceof Blob) {
            try {
              resolve(URL.createObjectURL(rawData));
              return;
            } catch {
              resolve(null);
              return;
            }
          } else if (typeof rawData === 'string') {
            // Expired blob: URLs from previous sessions must not be returned
            if (rawData.startsWith('blob:')) {
              resolve(null);
              return;
            }
            resolve(rawData);
            return;
          }
        }

        // Secondary fallback: scan store for record with matching fileName
        try {
          const cursorReq = store.openCursor();
          cursorReq.onsuccess = (e: any) => {
            const cursor = e.target.result;
            if (cursor) {
              const val = cursor.value;
              if (
                val &&
                (val.fileName === idOrFileName ||
                  val.id === idOrFileName ||
                  (idOrFileName.includes('/') && val.fileName && idOrFileName.endsWith(val.fileName)))
              ) {
                if (val.data instanceof Blob) {
                  try {
                    resolve(URL.createObjectURL(val.data));
                    return;
                  } catch {}
                } else if (typeof val.data === 'string' && !val.data.startsWith('blob:')) {
                  resolve(val.data);
                  return;
                }
              }
              cursor.continue();
            } else {
              resolve(null);
            }
          };
          cursorReq.onerror = () => resolve(null);
        } catch {
          resolve(null);
        }
      };
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

/**
 * Retrieve the actual binary Blob from IndexedDB
 */
export async function loadVideoBlob(idOrFileName: string): Promise<Blob | null> {
  if (!idOrFileName) return null;
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(idOrFileName);
      req.onsuccess = () => {
        if (req.result && req.result.data instanceof Blob) {
          resolve(req.result.data);
        } else {
          resolve(null);
        }
      };
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

/**
 * Delete a media item from IndexedDB
 */
export async function deleteVideoMedia(id: string): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => resolve();
    });
  } catch {
    // Ignore error
  }
}
