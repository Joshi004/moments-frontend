import { useEffect } from 'react';
import { getThumbnailUrl, getBackendBaseUrl } from '../services/api';

const CACHE_KEY_PREFIX = 'thumb_';
const EXPIRY_BUFFER_MS = 60 * 60 * 1000; // 1 hour in milliseconds

/**
 * Read a thumbnail cache entry from localStorage.
 * Returns { url, expiresAt } or null if not found / parse error.
 */
function readCacheEntry(videoId) {
  try {
    const raw = localStorage.getItem(CACHE_KEY_PREFIX + videoId);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Write a thumbnail cache entry to localStorage.
 * Silently ignores errors (e.g. storage quota exceeded).
 */
function writeCacheEntry(videoId, url, expiresAt) {
  try {
    localStorage.setItem(
      CACHE_KEY_PREFIX + videoId,
      JSON.stringify({ url, expiresAt }),
    );
  } catch {
    // Quota exceeded or private browsing — skip caching silently
  }
}

/**
 * Remove a specific thumbnail cache entry from localStorage.
 * Call this when a video is deleted.
 */
export function removeThumbnailCacheEntry(videoId) {
  try {
    localStorage.removeItem(CACHE_KEY_PREFIX + videoId);
  } catch {
    // Ignore
  }
}

/**
 * Scan all localStorage keys and remove any expired thumbnail cache entries.
 * Should be called once at app / page mount.
 */
export function cleanupExpiredThumbnailCache() {
  try {
    const now = Date.now();
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(CACHE_KEY_PREFIX)) {
        try {
          const entry = JSON.parse(localStorage.getItem(key));
          if (!entry || !entry.expiresAt || new Date(entry.expiresAt).getTime() <= now) {
            keysToRemove.push(key);
          }
        } catch {
          keysToRemove.push(key);
        }
      }
    }
    keysToRemove.forEach((key) => localStorage.removeItem(key));
  } catch {
    // Ignore any localStorage access errors
  }
}

/**
 * Returns the best available thumbnail URL for a video:
 *
 *   1. Cached GCS signed URL from localStorage (if not expired with 1h buffer)
 *   2. thumbnail_signed_url from the API response (stored to localStorage for next time)
 *   3. Fallback to the backend redirect endpoint
 *
 * This is a synchronous hook — it reads from localStorage at render time
 * and stores fresh entries as a side-effect so no extra render is needed.
 *
 * @param {object} video - Video object from the API response
 * @param {string} video.id - Video identifier
 * @param {string|null} video.thumbnail_url - API redirect path
 * @param {string|null} video.thumbnail_signed_url - Direct GCS signed URL
 * @param {string|null} video.thumbnail_url_expires_at - ISO 8601 expiry string
 * @returns {string} URL to use as <img src>
 */
function useThumbnailUrl(video) {
  const videoId = video?.id;
  const signedUrl = video?.thumbnail_signed_url;
  const expiresAt = video?.thumbnail_url_expires_at;

  // Step 1: Check localStorage cache (synchronous — safe to call in render)
  const cached = videoId ? readCacheEntry(videoId) : null;
  const now = Date.now();

  if (cached?.url && cached?.expiresAt) {
    const expiresMs = new Date(cached.expiresAt).getTime();
    if (expiresMs > now + EXPIRY_BUFFER_MS) {
      return cached.url;
    }
  }

  // Step 2: API response has a fresh signed URL — use it and cache it
  if (signedUrl && expiresAt) {
    writeCacheEntry(videoId, signedUrl, expiresAt);
    return signedUrl;
  }

  // Step 3: Fallback to the backend redirect endpoint
  if (video?.thumbnail_url) {
    return `${getBackendBaseUrl()}${video.thumbnail_url}`;
  }
  return getThumbnailUrl(videoId);
}

/**
 * Hook that also runs a one-time cleanup of expired localStorage entries on mount.
 * Wrap useThumbnailUrl with this in the top-level page component if desired,
 * or call cleanupExpiredThumbnailCache() directly in your page's useEffect.
 */
export function useThumbnailUrlWithCleanup(video) {
  useEffect(() => {
    cleanupExpiredThumbnailCache();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount

  return useThumbnailUrl(video);
}

export default useThumbnailUrl;
