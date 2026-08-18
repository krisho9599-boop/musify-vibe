/** Safe localStorage helpers (SSR-proof, never throw). */

export function readJSON<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeJSON(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* quota / private mode — ignore */
  }
}

export const STORAGE_KEYS = {
  liked: "musify:liked-songs",
  recent: "musify:recently-played",
  playlists: "musify:playlists",
  albums: "musify:saved-albums",
  artists: "musify:followed-artists",
  searches: "musify:recent-searches",
  volume: "musify:volume",
  theme: "musify:theme",
} as const;
