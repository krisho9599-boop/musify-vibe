import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import { getSong, type Song } from "@/lib/api/music";
import { useLibrary } from "@/lib/library";
import { STORAGE_KEYS } from "@/lib/storage";

export type RepeatMode = "off" | "all" | "one";

interface PlayerState {
  queue: Song[];
  currentIndex: number;
  current: Song | null;
  isPlaying: boolean;
  isLoading: boolean;
  error: string | null;
  currentTime: number;
  duration: number;
  volume: number;
  muted: boolean;
  shuffle: boolean;
  repeat: RepeatMode;
  expanded: boolean;
  queueOpen: boolean;
}

interface PlayerActions {
  playSongs: (songs: Song[], startIndex?: number) => void;
  playSong: (song: Song) => void;
  toggle: () => void;
  pause: () => void;
  next: () => void;
  previous: () => void;
  seek: (seconds: number) => void;
  setVolume: (value: number) => void;
  toggleMute: () => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
  addToQueue: (song: Song) => void;
  playNext: (song: Song) => void;
  removeFromQueue: (index: number) => void;
  moveInQueue: (from: number, to: number) => void;
  clearQueue: () => void;
  setExpanded: (open: boolean) => void;
  setQueueOpen: (open: boolean) => void;
}

type PlayerContextValue = PlayerState & PlayerActions;

const PlayerContext = createContext<PlayerContextValue | null>(null);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const { addRecent } = useLibrary();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [queue, setQueue] = useState<Song[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.8);
  const [muted, setMuted] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState<RepeatMode>("off");
  const [expanded, setExpanded] = useState(false);
  const [queueOpen, setQueueOpen] = useState(false);
  const [resolvedUrl, setResolvedUrl] = useState<string | null>(null);

  const current = currentIndex >= 0 ? (queue[currentIndex] ?? null) : null;

  /* ------------------------------ audio element ----------------------------- */

  useEffect(() => {
    const audio = new Audio();
    audio.preload = "metadata";
    audio.crossOrigin = "anonymous";
    audioRef.current = audio;
    const stored = window.localStorage.getItem(STORAGE_KEYS.volume);
    const parsed = stored ? Number(stored) : NaN;
    const initial = Number.isFinite(parsed) ? Math.min(1, Math.max(0, parsed)) : 0.8;
    audio.volume = initial;
    setVolumeState(initial);
    return () => {
      audio.pause();
      audio.src = "";
      audioRef.current = null;
    };
  }, []);

  /* ------------------------- resolve playable stream ------------------------ */

  useEffect(() => {
    let cancelled = false;
    if (!current) {
      setResolvedUrl(null);
      return;
    }
    setError(null);
    if (current.audioUrl) {
      setResolvedUrl(current.audioUrl);
      return;
    }
    setIsLoading(true);
    getSong(current.id)
      .then((full) => {
        if (cancelled) return;
        if (full?.audioUrl) {
          setResolvedUrl(full.audioUrl);
        } else {
          setResolvedUrl(null);
          setIsLoading(false);
          setError("This track has no playable stream.");
          toast.error("This track isn't available for playback.");
        }
      })
      .catch(() => {
        if (cancelled) return;
        setResolvedUrl(null);
        setIsLoading(false);
        setError("Couldn't load this track.");
      });
    return () => {
      cancelled = true;
    };
  }, [current]);

  /* --------------------------------- events -------------------------------- */

  const nextRef = useRef<() => void>(() => {});

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTime = () => setCurrentTime(audio.currentTime);
    const onMeta = () => setDuration(Number.isFinite(audio.duration) ? audio.duration : 0);
    const onPlay = () => {
      setIsPlaying(true);
      setIsLoading(false);
    };
    const onPause = () => setIsPlaying(false);
    const onWaiting = () => setIsLoading(true);
    const onPlaying = () => setIsLoading(false);
    const onEnded = () => nextRef.current();
    const onError = () => {
      setIsLoading(false);
      setIsPlaying(false);
      setError("Playback failed for this track.");
    };

    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onMeta);
    audio.addEventListener("durationchange", onMeta);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("waiting", onWaiting);
    audio.addEventListener("playing", onPlaying);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("error", onError);
    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onMeta);
      audio.removeEventListener("durationchange", onMeta);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("waiting", onWaiting);
      audio.removeEventListener("playing", onPlaying);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("error", onError);
    };
  }, []);

  /* ------------------------------ load & play ------------------------------ */

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (!resolvedUrl) {
      audio.removeAttribute("src");
      return;
    }
    audio.src = resolvedUrl;
    audio.load();
    setCurrentTime(0);
    setIsLoading(true);
    const play = audio.play();
    if (play) {
      play.catch(() => {
        setIsLoading(false);
        setIsPlaying(false);
      });
    }
  }, [resolvedUrl]);

  useEffect(() => {
    if (current) addRecent(current);
  }, [current, addRecent]);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) audio.loop = repeat === "one";
  }, [repeat]);

  /* ----------------------------- media session ----------------------------- */

  useEffect(() => {
    if (typeof navigator === "undefined" || !("mediaSession" in navigator) || !current) {
      return;
    }
    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: current.title,
        artist: current.artist,
        album: current.album ?? "",
        artwork: [{ src: current.artwork, sizes: "500x500", type: "image/jpeg" }],
      });
    } catch {
      /* unsupported */
    }
  }, [current]);

  /* --------------------------------- actions -------------------------------- */

  const playSongs = useCallback((songs: Song[], startIndex = 0) => {
    const playable = songs.filter((s) => Boolean(s?.id));
    if (playable.length === 0) {
      toast.error("Nothing to play here.");
      return;
    }
    const index = Math.min(Math.max(startIndex, 0), playable.length - 1);
    setQueue(playable);
    setCurrentIndex(index);
  }, []);

  const playSong = useCallback((song: Song) => {
    setQueue((prev) => {
      const existing = prev.findIndex((s) => s.id === song.id);
      if (existing >= 0) {
        setCurrentIndex(existing);
        return prev;
      }
      setCurrentIndex(prev.length);
      return [...prev, song];
    });
  }, []);

  const toggle = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !current) return;
    if (audio.paused) {
      const play = audio.play();
      if (play) play.catch(() => setError("Playback failed for this track."));
    } else {
      audio.pause();
    }
  }, [current]);

  const pause = useCallback(() => {
    audioRef.current?.pause();
  }, []);

  const next = useCallback(() => {
    setCurrentIndex((index) => {
      if (queue.length === 0) return index;
      if (shuffle && queue.length > 1) {
        let candidate = index;
        while (candidate === index) {
          candidate = Math.floor(Math.random() * queue.length);
        }
        return candidate;
      }
      if (index + 1 < queue.length) return index + 1;
      if (repeat === "all") return 0;
      audioRef.current?.pause();
      return index;
    });
  }, [queue.length, shuffle, repeat]);

  useEffect(() => {
    nextRef.current = () => {
      if (repeat === "one") {
        const audio = audioRef.current;
        if (audio) {
          audio.currentTime = 0;
          void audio.play();
        }
        return;
      }
      next();
    };
  }, [next, repeat]);

  const previous = useCallback(() => {
    const audio = audioRef.current;
    if (audio && audio.currentTime > 4) {
      audio.currentTime = 0;
      return;
    }
    setCurrentIndex((index) => {
      if (index <= 0) return repeat === "all" ? queue.length - 1 : 0;
      return index - 1;
    });
  }, [queue.length, repeat]);

  const seek = useCallback((seconds: number) => {
    const audio = audioRef.current;
    if (!audio || !Number.isFinite(seconds)) return;
    audio.currentTime = seconds;
    setCurrentTime(seconds);
  }, []);

  const setVolume = useCallback((value: number) => {
    const clamped = Math.min(1, Math.max(0, value));
    const audio = audioRef.current;
    if (audio) {
      audio.volume = clamped;
      audio.muted = clamped === 0;
    }
    setVolumeState(clamped);
    setMuted(clamped === 0);
    try {
      window.localStorage.setItem(STORAGE_KEYS.volume, String(clamped));
    } catch {
      /* ignore */
    }
  }, []);

  const toggleMute = useCallback(() => {
    const audio = audioRef.current;
    setMuted((prev) => {
      const nextMuted = !prev;
      if (audio) audio.muted = nextMuted;
      return nextMuted;
    });
  }, []);

  const toggleShuffle = useCallback(() => setShuffle((s) => !s), []);

  const cycleRepeat = useCallback(() => {
    setRepeat((mode) => (mode === "off" ? "all" : mode === "all" ? "one" : "off"));
  }, []);

  const addToQueue = useCallback((song: Song) => {
    setQueue((prev) => {
      if (prev.some((s) => s.id === song.id)) return prev;
      return [...prev, song];
    });
    toast.success(`Added "${song.title}" to queue`);
  }, []);

  const playNext = useCallback((song: Song) => {
    setQueue((prev) => {
      const filtered = prev.filter((s) => s.id !== song.id);
      const insertAt = Math.min(currentIndex + 1, filtered.length);
      return [...filtered.slice(0, insertAt), song, ...filtered.slice(insertAt)];
    });
    toast.success(`Playing "${song.title}" next`);
  }, [currentIndex]);

  const removeFromQueue = useCallback((index: number) => {
    setQueue((prev) => prev.filter((_, i) => i !== index));
    setCurrentIndex((prevIndex) => {
      if (index < prevIndex) return prevIndex - 1;
      return prevIndex;
    });
  }, []);

  const moveInQueue = useCallback((from: number, to: number) => {
    setQueue((prev) => {
      if (from < 0 || to < 0 || from >= prev.length || to >= prev.length) return prev;
      const copy = [...prev];
      const [item] = copy.splice(from, 1);
      if (!item) return prev;
      copy.splice(to, 0, item);
      return copy;
    });
    setCurrentIndex((index) => {
      if (index === from) return to;
      if (from < index && to >= index) return index - 1;
      if (from > index && to <= index) return index + 1;
      return index;
    });
  }, []);

  const clearQueue = useCallback(() => {
    audioRef.current?.pause();
    setQueue([]);
    setCurrentIndex(-1);
    setResolvedUrl(null);
    setCurrentTime(0);
    setDuration(0);
  }, []);

  const value = useMemo<PlayerContextValue>(
    () => ({
      queue,
      currentIndex,
      current,
      isPlaying,
      isLoading,
      error,
      currentTime,
      duration,
      volume,
      muted,
      shuffle,
      repeat,
      expanded,
      queueOpen,
      playSongs,
      playSong,
      toggle,
      pause,
      next,
      previous,
      seek,
      setVolume,
      toggleMute,
      toggleShuffle,
      cycleRepeat,
      addToQueue,
      playNext,
      removeFromQueue,
      moveInQueue,
      clearQueue,
      setExpanded,
      setQueueOpen,
    }),
    [
      queue,
      currentIndex,
      current,
      isPlaying,
      isLoading,
      error,
      currentTime,
      duration,
      volume,
      muted,
      shuffle,
      repeat,
      expanded,
      queueOpen,
      playSongs,
      playSong,
      toggle,
      pause,
      next,
      previous,
      seek,
      setVolume,
      toggleMute,
      toggleShuffle,
      cycleRepeat,
      addToQueue,
      playNext,
      removeFromQueue,
      moveInQueue,
      clearQueue,
    ],
  );

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}

export function usePlayer(): PlayerContextValue {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used within PlayerProvider");
  return ctx;
}
