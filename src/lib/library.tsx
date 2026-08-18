import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { AlbumSummary, ArtistSummary, Song } from "@/lib/api/music";
import { STORAGE_KEYS, readJSON, writeJSON } from "./storage";

/**
 * Local library persistence.
 *
 * Everything is stored in localStorage today; the provider API is intentionally
 * async-free and repository-shaped so it can be swapped for a database later
 * without touching any UI component.
 */

export interface LocalPlaylist {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  songs: Song[];
}

const MAX_RECENT = 40;
const MAX_SEARCHES = 8;

interface LibraryContextValue {
  liked: Song[];
  likedIds: Set<string>;
  isLiked: (id: string) => boolean;
  toggleLike: (song: Song) => boolean;
  recent: Song[];
  addRecent: (song: Song) => void;
  clearRecent: () => void;
  playlists: LocalPlaylist[];
  createPlaylist: (name: string) => LocalPlaylist;
  renamePlaylist: (id: string, name: string) => void;
  deletePlaylist: (id: string) => void;
  addToPlaylist: (id: string, song: Song) => boolean;
  removeFromPlaylist: (id: string, songId: string) => void;
  savedAlbums: AlbumSummary[];
  toggleSavedAlbum: (album: AlbumSummary) => boolean;
  isAlbumSaved: (id: string) => boolean;
  followedArtists: ArtistSummary[];
  toggleFollowArtist: (artist: ArtistSummary) => boolean;
  isArtistFollowed: (id: string) => boolean;
  recentSearches: string[];
  addRecentSearch: (term: string) => void;
  clearRecentSearches: () => void;
  hydrated: boolean;
}

const LibraryContext = createContext<LibraryContextValue | null>(null);

export function LibraryProvider({ children }: { children: ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [liked, setLiked] = useState<Song[]>([]);
  const [recent, setRecent] = useState<Song[]>([]);
  const [playlists, setPlaylists] = useState<LocalPlaylist[]>([]);
  const [savedAlbums, setSavedAlbums] = useState<AlbumSummary[]>([]);
  const [followedArtists, setFollowedArtists] = useState<ArtistSummary[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => {
    setLiked(readJSON<Song[]>(STORAGE_KEYS.liked, []));
    setRecent(readJSON<Song[]>(STORAGE_KEYS.recent, []));
    setPlaylists(readJSON<LocalPlaylist[]>(STORAGE_KEYS.playlists, []));
    setSavedAlbums(readJSON<AlbumSummary[]>(STORAGE_KEYS.albums, []));
    setFollowedArtists(readJSON<ArtistSummary[]>(STORAGE_KEYS.artists, []));
    setRecentSearches(readJSON<string[]>(STORAGE_KEYS.searches, []));
    setHydrated(true);
  }, []);

  const persist = useCallback(
    (key: string, value: unknown, ready: boolean) => {
      if (ready) writeJSON(key, value);
    },
    [],
  );

  useEffect(() => persist(STORAGE_KEYS.liked, liked, hydrated), [liked, hydrated, persist]);
  useEffect(() => persist(STORAGE_KEYS.recent, recent, hydrated), [recent, hydrated, persist]);
  useEffect(
    () => persist(STORAGE_KEYS.playlists, playlists, hydrated),
    [playlists, hydrated, persist],
  );
  useEffect(
    () => persist(STORAGE_KEYS.albums, savedAlbums, hydrated),
    [savedAlbums, hydrated, persist],
  );
  useEffect(
    () => persist(STORAGE_KEYS.artists, followedArtists, hydrated),
    [followedArtists, hydrated, persist],
  );
  useEffect(
    () => persist(STORAGE_KEYS.searches, recentSearches, hydrated),
    [recentSearches, hydrated, persist],
  );

  const likedIds = useMemo(() => new Set(liked.map((s) => s.id)), [liked]);

  const isLiked = useCallback((id: string) => likedIds.has(id), [likedIds]);

  const toggleLike = useCallback((song: Song) => {
    let nowLiked = false;
    setLiked((prev) => {
      const exists = prev.some((s) => s.id === song.id);
      nowLiked = !exists;
      return exists ? prev.filter((s) => s.id !== song.id) : [song, ...prev];
    });
    return nowLiked;
  }, []);

  const addRecent = useCallback((song: Song) => {
    setRecent((prev) => {
      if (prev[0]?.id === song.id) return prev;
      return [song, ...prev.filter((s) => s.id !== song.id)].slice(0, MAX_RECENT);
    });
  }, []);

  const clearRecent = useCallback(() => setRecent([]), []);

  const createPlaylist = useCallback((name: string) => {
    const playlist: LocalPlaylist = {
      id: `pl_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`,
      name: name.trim() || "New playlist",
      createdAt: Date.now(),
      updatedAt: Date.now(),
      songs: [],
    };
    setPlaylists((prev) => [playlist, ...prev]);
    return playlist;
  }, []);

  const renamePlaylist = useCallback((id: string, name: string) => {
    setPlaylists((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, name: name.trim() || p.name, updatedAt: Date.now() } : p,
      ),
    );
  }, []);

  const deletePlaylist = useCallback((id: string) => {
    setPlaylists((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const addToPlaylist = useCallback((id: string, song: Song) => {
    let added = false;
    setPlaylists((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        if (p.songs.some((s) => s.id === song.id)) return p;
        added = true;
        return { ...p, songs: [...p.songs, song], updatedAt: Date.now() };
      }),
    );
    return added;
  }, []);

  const removeFromPlaylist = useCallback((id: string, songId: string) => {
    setPlaylists((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, songs: p.songs.filter((s) => s.id !== songId), updatedAt: Date.now() }
          : p,
      ),
    );
  }, []);

  const toggleSavedAlbum = useCallback((album: AlbumSummary) => {
    let saved = false;
    setSavedAlbums((prev) => {
      const exists = prev.some((a) => a.id === album.id);
      saved = !exists;
      return exists ? prev.filter((a) => a.id !== album.id) : [album, ...prev];
    });
    return saved;
  }, []);

  const isAlbumSaved = useCallback(
    (id: string) => savedAlbums.some((a) => a.id === id),
    [savedAlbums],
  );

  const toggleFollowArtist = useCallback((artist: ArtistSummary) => {
    let followed = false;
    setFollowedArtists((prev) => {
      const exists = prev.some((a) => a.id === artist.id);
      followed = !exists;
      return exists ? prev.filter((a) => a.id !== artist.id) : [artist, ...prev];
    });
    return followed;
  }, []);

  const isArtistFollowed = useCallback(
    (id: string) => followedArtists.some((a) => a.id === id),
    [followedArtists],
  );

  const addRecentSearch = useCallback((term: string) => {
    const clean = term.trim();
    if (clean.length < 2) return;
    setRecentSearches((prev) =>
      [clean, ...prev.filter((t) => t.toLowerCase() !== clean.toLowerCase())].slice(
        0,
        MAX_SEARCHES,
      ),
    );
  }, []);

  const clearRecentSearches = useCallback(() => setRecentSearches([]), []);

  const value: LibraryContextValue = {
    liked,
    likedIds,
    isLiked,
    toggleLike,
    recent,
    addRecent,
    clearRecent,
    playlists,
    createPlaylist,
    renamePlaylist,
    deletePlaylist,
    addToPlaylist,
    removeFromPlaylist,
    savedAlbums,
    toggleSavedAlbum,
    isAlbumSaved,
    followedArtists,
    toggleFollowArtist,
    isArtistFollowed,
    recentSearches,
    addRecentSearch,
    clearRecentSearches,
    hydrated,
  };

  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>;
}

export function useLibrary(): LibraryContextValue {
  const ctx = useContext(LibraryContext);
  if (!ctx) throw new Error("useLibrary must be used within LibraryProvider");
  return ctx;
}
