import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import {
  ChevronDown,
  Heart,
  ListMusic,
  Loader2,
  Mic2,
  Pause,
  Play,
  Repeat,
  Repeat1,
  Shuffle,
  SkipBack,
  SkipForward,
} from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Artwork } from "@/components/music/Artwork";
import { SongMenu } from "@/components/music/SongMenu";
import { formatDuration, getSongLyrics, musicKeys } from "@/lib/api/music";
import { useLibrary } from "@/lib/library";
import { usePlayer } from "@/lib/player";
import { cn } from "@/lib/utils";

export function NowPlaying() {
  const {
    current,
    expanded,
    setExpanded,
    isPlaying,
    isLoading,
    error,
    toggle,
    next,
    previous,
    currentTime,
    duration,
    seek,
    shuffle,
    toggleShuffle,
    repeat,
    cycleRepeat,
    setQueueOpen,
  } = usePlayer();
  const { isLiked, toggleLike } = useLibrary();
  const [showLyrics, setShowLyrics] = useState(false);

  const lyricsQuery = useQuery({
    queryKey: musicKeys.lyrics(current?.id ?? "none"),
    queryFn: () => getSongLyrics(current!.id),
    enabled: Boolean(current?.id) && showLyrics,
    staleTime: 1000 * 60 * 30,
  });

  if (!expanded || !current) return null;
  const liked = isLiked(current.id);

  return (
    <div className="fixed inset-0 z-100 flex flex-col bg-background animate-fade-up">
      <div
        className="pointer-events-none absolute inset-0 opacity-45 blur-3xl"
        style={{ backgroundImage: `url(${current.artwork})`, backgroundSize: "cover" }}
        aria-hidden
      />
      <div className="pointer-events-none absolute inset-0 bg-background/80" aria-hidden />

      <div className="relative flex items-center justify-between px-5 pt-5">
        <button
          type="button"
          aria-label="Close now playing"
          onClick={() => setExpanded(false)}
          className="grid h-10 w-10 place-items-center rounded-full glass-panel"
        >
          <ChevronDown className="h-5 w-5" />
        </button>
        <p className="text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">
          Now playing
        </p>
        <SongMenu song={current} className="h-10 w-10 glass-panel rounded-full" />
      </div>

      <div className="relative flex flex-1 flex-col items-center justify-center gap-6 overflow-y-auto px-6 py-6">
        {showLyrics ? (
          <div className="w-full max-w-xl flex-1 overflow-y-auto rounded-2xl glass-panel p-5">
            {lyricsQuery.isLoading ? (
              <div className="grid place-items-center py-10">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              </div>
            ) : lyricsQuery.data?.lyrics ? (
              <pre className="whitespace-pre-wrap font-sans text-sm leading-7 text-foreground/90">
                {lyricsQuery.data.lyrics}
              </pre>
            ) : (
              <p className="py-10 text-center text-sm text-muted-foreground">
                No lyrics available for this track.
              </p>
            )}
          </div>
        ) : (
          <div className="w-full max-w-[min(78vw,360px)] overflow-hidden rounded-3xl shadow-glow">
            <Artwork src={current.artwork} alt={current.title} rounded="rounded-3xl" eager />
          </div>
        )}

        <div className="w-full max-w-xl text-center">
          <h1 className="truncate text-2xl font-bold sm:text-3xl">{current.title}</h1>
          {current.artistId ? (
            <Link
              to="/artist/$artistId"
              params={{ artistId: current.artistId }}
              onClick={() => setExpanded(false)}
              className="mt-1 inline-block truncate text-sm text-muted-foreground hover:text-primary"
            >
              {current.artist}
            </Link>
          ) : (
            <p className="mt-1 truncate text-sm text-muted-foreground">{current.artist}</p>
          )}
          {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
        </div>

        <div className="w-full max-w-xl">
          <Slider
            value={[Math.min(currentTime, duration || 0)]}
            max={duration || 1}
            step={1}
            onValueChange={(v) => seek(v[0] ?? 0)}
            aria-label="Seek"
          />
          <div className="mt-2 flex justify-between text-[11px] tabular-nums text-muted-foreground">
            <span>{formatDuration(currentTime)}</span>
            <span>{formatDuration(duration)}</span>
          </div>
        </div>

        <div className="flex w-full max-w-xl items-center justify-between">
          <button
            type="button"
            aria-label="Toggle shuffle"
            onClick={toggleShuffle}
            className={cn(
              "grid h-10 w-10 place-items-center rounded-full transition-colors",
              shuffle ? "text-primary" : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Shuffle className="h-5 w-5" />
          </button>
          <button
            type="button"
            aria-label="Previous track"
            onClick={previous}
            className="grid h-12 w-12 place-items-center rounded-full hover:bg-accent"
          >
            <SkipBack className="h-6 w-6 fill-current" />
          </button>
          <button
            type="button"
            aria-label={isPlaying ? "Pause" : "Play"}
            onClick={toggle}
            className="grid h-16 w-16 place-items-center rounded-full ember-surface shadow-glow transition-transform active:scale-95"
          >
            {isLoading ? (
              <Loader2 className="h-7 w-7 animate-spin" />
            ) : isPlaying ? (
              <Pause className="h-7 w-7 fill-current" />
            ) : (
              <Play className="ml-0.5 h-7 w-7 fill-current" />
            )}
          </button>
          <button
            type="button"
            aria-label="Next track"
            onClick={next}
            className="grid h-12 w-12 place-items-center rounded-full hover:bg-accent"
          >
            <SkipForward className="h-6 w-6 fill-current" />
          </button>
          <button
            type="button"
            aria-label="Toggle repeat"
            onClick={cycleRepeat}
            className={cn(
              "grid h-10 w-10 place-items-center rounded-full transition-colors",
              repeat !== "off" ? "text-primary" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {repeat === "one" ? <Repeat1 className="h-5 w-5" /> : <Repeat className="h-5 w-5" />}
          </button>
        </div>

        <div className="flex items-center gap-2 pb-4">
          <button
            type="button"
            onClick={() => toggleLike(current)}
            className={cn(
              "flex items-center gap-2 rounded-full px-4 py-2 text-sm glass-panel transition-colors",
              liked && "text-primary",
            )}
          >
            <Heart className={cn("h-4 w-4", liked && "fill-primary")} />
            {liked ? "Liked" : "Like"}
          </button>
          {current.hasLyrics !== false && (
            <button
              type="button"
              onClick={() => setShowLyrics((s) => !s)}
              className={cn(
                "flex items-center gap-2 rounded-full px-4 py-2 text-sm glass-panel transition-colors",
                showLyrics && "text-primary",
              )}
            >
              <Mic2 className="h-4 w-4" /> Lyrics
            </button>
          )}
          <button
            type="button"
            onClick={() => setQueueOpen(true)}
            className="flex items-center gap-2 rounded-full px-4 py-2 text-sm glass-panel"
          >
            <ListMusic className="h-4 w-4" /> Queue
          </button>
        </div>
      </div>
    </div>
  );
}
