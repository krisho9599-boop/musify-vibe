/**
 * MusifyApp music API layer.
 *
 * Wraps the JioSaavn API (github.com/sumitkolhe/jiosaavn-api) used by the
 * reference MusicHub project and normalizes every response into app types.
 * Base URL comes from VITE_API_URL — never hardcode it in components.
 */

export const API_URL: string =
  (import.meta.env["VITE_API_URL"] as string | undefined)?.replace(/\/$/, "") ??
  "https://saavn-api-eight.vercel.app/api";

export class ApiError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

/* ---------------------------------- types --------------------------------- */

export interface Song {
  id: string;
  title: string;
  artist: string;
  artistId?: string;
  album?: string;
  albumId?: string;
  artwork: string;
  audioUrl: string | null;
  duration: number;
  year?: string;
  language?: string;
  hasLyrics?: boolean;
  playCount?: number;
}

export interface AlbumSummary {
  id: string;
  title: string;
  artist: string;
  artwork: string;
  year?: string;
  songCount?: number;
  language?: string;
}

export interface Album extends AlbumSummary {
  description?: string;
  songs: Song[];
}

export interface ArtistSummary {
  id: string;
  name: string;
  image: string;
  role?: string;
}

export interface Artist extends ArtistSummary {
  bio?: string;
  followerCount?: number;
  isVerified?: boolean;
  dominantLanguage?: string;
  topSongs: Song[];
  topAlbums: AlbumSummary[];
  singles: AlbumSummary[];
  similarArtists: ArtistSummary[];
}

export interface PlaylistSummary {
  id: string;
  title: string;
  artwork: string;
  songCount?: number;
  description?: string;
  language?: string;
}

export interface Playlist extends PlaylistSummary {
  songs: Song[];
}

export interface SearchAllResult {
  songs: Song[];
  albums: AlbumSummary[];
  artists: ArtistSummary[];
  playlists: PlaylistSummary[];
  topQuery: Array<{ id: string; title: string; type: string; image: string }>;
}

/* -------------------------------- utilities ------------------------------- */

const FALLBACK_ART =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300"><rect width="300" height="300" fill="#1a1719"/><path d="M120 90v90a26 26 0 1 0 12 22V120h48V90z" fill="#6b5f63"/></svg>`,
  );

export function decodeEntities(input?: string | null): string {
  if (!input) return "";
  return input
    .replace(/&quot;/g, '"')
    .replace(/&#039;|&apos;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ");
}

type ImageEntry = { quality?: string; url?: string } | string;

export function pickImage(images: unknown, preferred = "500x500"): string {
  if (typeof images === "string" && images) return images;
  if (!Array.isArray(images) || images.length === 0) return FALLBACK_ART;
  const list = images as ImageEntry[];
  const match = list.find(
    (i) => typeof i === "object" && i !== null && i.quality === preferred,
  );
  const last = list[list.length - 1];
  const chosen = (match ?? last) as ImageEntry;
  if (typeof chosen === "string") return chosen || FALLBACK_ART;
  return chosen?.url || FALLBACK_ART;
}

export const FALLBACK_ARTWORK = FALLBACK_ART;

function pickAudio(downloadUrl: unknown): string | null {
  if (!Array.isArray(downloadUrl) || downloadUrl.length === 0) return null;
  const list = downloadUrl as ImageEntry[];
  const order = ["320kbps", "160kbps", "96kbps", "48kbps", "12kbps"];
  for (const q of order) {
    const found = list.find(
      (i) => typeof i === "object" && i !== null && i.quality === q,
    ) as { url?: string } | undefined;
    if (found?.url) return found.url;
  }
  const last = list[list.length - 1];
  if (typeof last === "string") return last;
  return last?.url ?? null;
}

async function request<T>(path: string, signal?: AbortSignal): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, { signal });
  } catch (err) {
    if ((err as Error).name === "AbortError") throw err;
    throw new ApiError("Network error — check your connection and try again.");
  }
  if (!res.ok) {
    throw new ApiError(`Request failed (${res.status})`, res.status);
  }
  let json: unknown;
  try {
    json = await res.json();
  } catch {
    throw new ApiError("Invalid response from the music API.");
  }
  const body = json as { success?: boolean; data?: T };
  if (!body || body.data === undefined) {
    throw new ApiError("Unexpected response from the music API.");
  }
  return body.data;
}

/* ------------------------------- normalizers ------------------------------ */

type RawAny = Record<string, any>;

export function normalizeSong(raw: RawAny | null | undefined): Song | null {
  if (!raw?.id) return null;
  const primary = raw.artists?.primary ?? [];
  const artistNames: string =
    primary.length > 0
      ? primary.map((a: RawAny) => decodeEntities(a?.name)).join(", ")
      : decodeEntities(raw.primaryArtists || raw.subtitle || "Unknown artist");
  return {
    id: String(raw.id),
    title: decodeEntities(raw.name || raw.title) || "Untitled",
    artist: artistNames || "Unknown artist",
    artistId: primary[0]?.id ? String(primary[0].id) : undefined,
    album: decodeEntities(raw.album?.name),
    albumId: raw.album?.id ? String(raw.album.id) : undefined,
    artwork: pickImage(raw.image),
    audioUrl: pickAudio(raw.downloadUrl),
    duration: Number(raw.duration) || 0,
    year: raw.year ? String(raw.year) : undefined,
    language: raw.language,
    hasLyrics: Boolean(raw.hasLyrics),
    playCount: typeof raw.playCount === "number" ? raw.playCount : undefined,
  };
}

export function normalizeSongs(list: unknown): Song[] {
  if (!Array.isArray(list)) return [];
  return list
    .map((s) => normalizeSong(s as RawAny))
    .filter((s): s is Song => s !== null);
}

export function normalizeAlbumSummary(raw: RawAny): AlbumSummary | null {
  if (!raw?.id) return null;
  const primary = raw.artists?.primary ?? [];
  return {
    id: String(raw.id),
    title: decodeEntities(raw.name || raw.title) || "Untitled album",
    artist:
      primary.length > 0
        ? primary.map((a: RawAny) => decodeEntities(a?.name)).join(", ")
        : decodeEntities(raw.primaryArtists || raw.artist || raw.description) ||
          "Various artists",
    artwork: pickImage(raw.image),
    year: raw.year ? String(raw.year) : undefined,
    songCount: raw.songCount ? Number(raw.songCount) : undefined,
    language: raw.language,
  };
}

function normalizeAlbums(list: unknown): AlbumSummary[] {
  if (!Array.isArray(list)) return [];
  return list
    .map((a) => normalizeAlbumSummary(a as RawAny))
    .filter((a): a is AlbumSummary => a !== null);
}

export function normalizeArtistSummary(raw: RawAny): ArtistSummary | null {
  if (!raw?.id) return null;
  return {
    id: String(raw.id),
    name: decodeEntities(raw.name || raw.title) || "Unknown artist",
    image: pickImage(raw.image),
    role: raw.role,
  };
}

function normalizeArtists(list: unknown): ArtistSummary[] {
  if (!Array.isArray(list)) return [];
  return list
    .map((a) => normalizeArtistSummary(a as RawAny))
    .filter((a): a is ArtistSummary => a !== null);
}

export function normalizePlaylistSummary(raw: RawAny): PlaylistSummary | null {
  if (!raw?.id) return null;
  return {
    id: String(raw.id),
    title: decodeEntities(raw.name || raw.title) || "Playlist",
    artwork: pickImage(raw.image),
    songCount: raw.songCount ? Number(raw.songCount) : undefined,
    description: decodeEntities(raw.description),
    language: raw.language,
  };
}

function normalizePlaylists(list: unknown): PlaylistSummary[] {
  if (!Array.isArray(list)) return [];
  return list
    .map((p) => normalizePlaylistSummary(p as RawAny))
    .filter((p): p is PlaylistSummary => p !== null);
}

/* -------------------------------- endpoints ------------------------------- */

export async function searchSongs(
  query: string,
  { limit = 20, page = 0, signal }: { limit?: number; page?: number; signal?: AbortSignal } = {},
): Promise<Song[]> {
  if (!query.trim()) return [];
  const data = await request<RawAny>(
    `/search/songs?query=${encodeURIComponent(query)}&page=${page}&limit=${limit}`,
    signal,
  );
  return normalizeSongs(data?.results);
}

export async function searchAlbums(
  query: string,
  { limit = 20, page = 0, signal }: { limit?: number; page?: number; signal?: AbortSignal } = {},
): Promise<AlbumSummary[]> {
  if (!query.trim()) return [];
  const data = await request<RawAny>(
    `/search/albums?query=${encodeURIComponent(query)}&page=${page}&limit=${limit}`,
    signal,
  );
  return normalizeAlbums(data?.results);
}

export async function searchArtists(
  query: string,
  { limit = 20, page = 0, signal }: { limit?: number; page?: number; signal?: AbortSignal } = {},
): Promise<ArtistSummary[]> {
  if (!query.trim()) return [];
  const data = await request<RawAny>(
    `/search/artists?query=${encodeURIComponent(query)}&page=${page}&limit=${limit}`,
    signal,
  );
  return normalizeArtists(data?.results);
}

export async function searchPlaylists(
  query: string,
  { limit = 20, page = 0, signal }: { limit?: number; page?: number; signal?: AbortSignal } = {},
): Promise<PlaylistSummary[]> {
  if (!query.trim()) return [];
  const data = await request<RawAny>(
    `/search/playlists?query=${encodeURIComponent(query)}&page=${page}&limit=${limit}`,
    signal,
  );
  return normalizePlaylists(data?.results);
}

export async function searchAll(
  query: string,
  signal?: AbortSignal,
): Promise<SearchAllResult> {
  if (!query.trim()) {
    return { songs: [], albums: [], artists: [], playlists: [], topQuery: [] };
  }
  const data = await request<RawAny>(
    `/search?query=${encodeURIComponent(query)}`,
    signal,
  );
  return {
    songs: normalizeSongs(data?.songs?.results),
    albums: normalizeAlbums(data?.albums?.results),
    artists: normalizeArtists(data?.artists?.results),
    playlists: normalizePlaylists(data?.playlists?.results),
    topQuery: (data?.topQuery?.results ?? []).map((r: RawAny) => ({
      id: String(r.id),
      title: decodeEntities(r.title || r.name),
      type: String(r.type ?? "song"),
      image: pickImage(r.image),
    })),
  };
}

export async function getSong(id: string, signal?: AbortSignal): Promise<Song | null> {
  const data = await request<RawAny[]>(`/songs/${encodeURIComponent(id)}`, signal);
  return normalizeSong(Array.isArray(data) ? data[0] : (data as RawAny));
}

export async function getSongSuggestions(
  id: string,
  limit = 10,
  signal?: AbortSignal,
): Promise<Song[]> {
  try {
    const data = await request<RawAny[]>(
      `/songs/${encodeURIComponent(id)}/suggestions?limit=${limit}`,
      signal,
    );
    return normalizeSongs(data);
  } catch {
    // Suggestions are best-effort on this API — never break the UI over them.
    return [];
  }
}

export async function getSongLyrics(
  id: string,
  signal?: AbortSignal,
): Promise<{ lyrics: string; copyright?: string } | null> {
  try {
    const data = await request<RawAny>(
      `/songs/${encodeURIComponent(id)}/lyrics`,
      signal,
    );
    if (!data?.lyrics) return null;
    return {
      lyrics: String(data.lyrics).replace(/<br\s*\/?>/g, "\n"),
      copyright: data.copyright ? decodeEntities(data.copyright) : undefined,
    };
  } catch {
    return null;
  }
}

export async function getAlbum(id: string, signal?: AbortSignal): Promise<Album> {
  const data = await request<RawAny>(`/albums?id=${encodeURIComponent(id)}`, signal);
  const summary = normalizeAlbumSummary(data);
  if (!summary) throw new ApiError("Album not found", 404);
  return {
    ...summary,
    description: decodeEntities(data?.description),
    songs: normalizeSongs(data?.songs),
  };
}

export async function getArtist(id: string, signal?: AbortSignal): Promise<Artist> {
  const data = await request<RawAny>(`/artists?id=${encodeURIComponent(id)}`, signal);
  const summary = normalizeArtistSummary(data);
  if (!summary) throw new ApiError("Artist not found", 404);
  return {
    ...summary,
    bio: Array.isArray(data?.bio)
      ? decodeEntities(data.bio[0]?.text)
      : decodeEntities(data?.bio),
    followerCount: data?.followerCount ? Number(data.followerCount) : undefined,
    isVerified: Boolean(data?.isVerified),
    dominantLanguage: data?.dominantLanguage,
    topSongs: normalizeSongs(data?.topSongs),
    topAlbums: normalizeAlbums(data?.topAlbums),
    singles: normalizeAlbums(data?.singles),
    similarArtists: normalizeArtists(data?.similarArtists),
  };
}

export async function getArtistSongs(
  id: string,
  page = 0,
  signal?: AbortSignal,
): Promise<Song[]> {
  try {
    const data = await request<RawAny>(
      `/artists/${encodeURIComponent(id)}/songs?page=${page}`,
      signal,
    );
    return normalizeSongs(data?.songs);
  } catch {
    return [];
  }
}

export async function getPlaylist(
  id: string,
  limit = 50,
  signal?: AbortSignal,
): Promise<Playlist> {
  const data = await request<RawAny>(
    `/playlists?id=${encodeURIComponent(id)}&limit=${limit}`,
    signal,
  );
  const summary = normalizePlaylistSummary(data);
  if (!summary) throw new ApiError("Playlist not found", 404);
  return { ...summary, songs: normalizeSongs(data?.songs) };
}

/* ------------------------ curated feeds (real API data) ------------------- */

/** Editorial queries used to build home rows — data itself is 100% live API. */
export const FEEDS = {
  trending: "trending now",
  newReleases: "new release 2026",
  recommended: "top hits",
  chill: "lofi chill",
  romance: "romantic hits",
  workout: "workout party",
} as const;

export async function getTrending(limit = 20, signal?: AbortSignal): Promise<Song[]> {
  return searchSongs(FEEDS.trending, { limit, signal });
}

export async function getNewReleases(
  limit = 20,
  signal?: AbortSignal,
): Promise<AlbumSummary[]> {
  return searchAlbums(FEEDS.newReleases, { limit, signal });
}

export async function getRecommendations(
  seedSongId?: string,
  limit = 20,
  signal?: AbortSignal,
): Promise<Song[]> {
  if (seedSongId) {
    const suggestions = await getSongSuggestions(seedSongId, limit, signal);
    if (suggestions.length > 0) return suggestions;
  }
  return searchSongs(FEEDS.recommended, { limit, signal });
}

export async function getPopularArtists(
  limit = 15,
  signal?: AbortSignal,
): Promise<ArtistSummary[]> {
  return searchArtists("top artists", { limit, signal });
}

export async function getPopularAlbums(
  limit = 20,
  signal?: AbortSignal,
): Promise<AlbumSummary[]> {
  return searchAlbums("best of 2026", { limit, signal });
}

export async function getPopularPlaylists(
  limit = 20,
  signal?: AbortSignal,
): Promise<PlaylistSummary[]> {
  return searchPlaylists("top 50", { limit, signal });
}

/* ------------------------------ query helpers ----------------------------- */

export const musicKeys = {
  searchAll: (q: string) => ["search", "all", q] as const,
  searchSongs: (q: string) => ["search", "songs", q] as const,
  searchAlbums: (q: string) => ["search", "albums", q] as const,
  searchArtists: (q: string) => ["search", "artists", q] as const,
  searchPlaylists: (q: string) => ["search", "playlists", q] as const,
  song: (id: string) => ["song", id] as const,
  lyrics: (id: string) => ["lyrics", id] as const,
  album: (id: string) => ["album", id] as const,
  artist: (id: string) => ["artist", id] as const,
  playlist: (id: string) => ["playlist", id] as const,
  feed: (name: string) => ["feed", name] as const,
};

export function formatDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function formatCount(value?: number): string | undefined {
  if (!value || value <= 0) return undefined;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return String(value);
}
