import {
  ChevronUp,
  Heart,
  ListMusic,
  Loader2,
  Pause,
  Play,
  Repeat,
  Repeat1,
  Shuffle,
  SkipBack,
  SkipForward,
  Volume1,
  Volume2,
  VolumeX,
} from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Artwork } from "@/components/music/Artwork";
import { formatDuration } from "@/lib/api/music";
import { useLibrary } from "@/lib/library";
import { usePlayer } from "@/lib/player";
import { cn } from "@/lib/utils";

export function PlayerBar() {
  const {
    current,
    isPlaying,
    isLoading,
    error,
    toggle,
    next,
    previous,
    currentTime,
    duration,
    seek,
    volume,
    muted,
    setVolume,
    toggleMute,
    shuffle,
    toggleShuffle,
    repeat,
    cycleRepeat,
    setExpanded,
    setQueueOpen,
  } = usePlayer();
  const { isLiked, toggleLike } = useLibrary();

  if (!current) return null;
  const liked = isLiked(current.id);
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const VolumeIcon = muted || volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;

  return (
    <div className="fixed inset-x-0 bottom-16 z-50 px-2 md:bottom-0 md:px-0">
      {/* Mobile mini player */}
      <div className="md:hidden">
        <div className="relative overflow-hidden rounded-2xl glass-panel shadow-card">
          <div
            className="absolute inset-x-0 bottom-0 h-0.5 bg-primary transition-[width]"
            style={{ width: `${progress}%` }}
            aria-hidden
          />
          <div className="flex items-center gap-3 p-2">
            <button
              type="button"
              onClick={() => setExpanded(true)}
              className="flex min-w-0 flex-1 items-center gap-3 text-left"
              aria-label="Open now playing"
            >
              <div className="h-11 w-11 shrink-0 overflow-hidden rounded-xl">
                <Artwork src={current.artwork} alt={current.title} rounded="rounded-xl" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{current.title}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {error ? error : current.artist}
                </p>
              </div>
            </button>
            <button
              type="button"
              aria-label={liked ? "Unlike" : "Like"}
              onClick={() => toggleLike(current)}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-muted-foreground"
            >
              <Heart className={cn("h-5 w-5", liked && "fill-primary text-primary")} />
            </button>
            <button
              type="button"
              aria-label={isPlaying ? "Pause" : "Play"}
              onClick={toggle}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full ember-surface"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : isPlaying ? (
                <Pause className="h-4 w-4 fill-current" />
              ) : (
                <Play className="ml-0.5 h-4 w-4 fill-current" />
              )}
            </button>
            <button
              type="button"
              aria-label="Next"
              onClick={next}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full"
            >
              <SkipForward className="h-5 w-5 fill-current" />
            </button>
          </div>
        </div>
      </div>

      {/* Desktop bar */}
      <div className="hidden border-t border-border bg-surface-elevated/90 backdrop-blur-xl md:block">
        <div className="grid h-20 grid-cols-[minmax(0,1fr)_minmax(0,2fr)_minmax(0,1fr)] items-center gap-4 px-4">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setExpanded(true)}
              aria-label="Open now playing"
              className="group relative h-14 w-14 shrink-0 overflow-hidden rounded-xl"
            >
              <Artwork src={current.artwork} alt={current.title} rounded="rounded-xl" />
              <span className="absolute inset-0 grid place-items-center bg-background/60 opacity-0 transition-opacity group-hover:opacity-100">
                <ChevronUp className="h-5 w-5" />
              </span>
            </button>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{current.title}</p>
              <p className="truncate text-xs text-muted-foreground">
                {error ? <span className="text-destructive">{error}</span> : current.artist}
              </p>
            </div>
            <button
              type="button"
              aria-label={liked ? "Unlike" : "Like"}
              onClick={() => toggleLike(current)}
              className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors hover:text-primary"
            >
              <Heart className={cn("h-4 w-4", liked && "fill-primary text-primary")} />
            </button>
          </div>

          <div className="flex flex-col items-center gap-1.5">
            <div className="flex items-center gap-3">
              <button
                type="button"
                aria-label="Toggle shuffle"
                onClick={toggleShuffle}
                className={cn(
                  "grid h-8 w-8 place-items-center rounded-full transition-colors",
                  shuffle ? "text-primary" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Shuffle className="h-4 w-4" />
              </button>
              <button
                type="button"
                aria-label="Previous"
                onClick={previous}
                className="grid h-9 w-9 place-items-center rounded-full hover:bg-accent"
              >
                <SkipBack className="h-4.5 w-4.5 fill-current" />
              </button>
              <button
                type="button"
                aria-label={isPlaying ? "Pause" : "Play"}
                onClick={toggle}
                className="grid h-11 w-11 place-items-center rounded-full ember-surface shadow-glow transition-transform hover:scale-105 active:scale-95"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : isPlaying ? (
                  <Pause className="h-5 w-5 fill-current" />
                ) : (
                  <Play className="ml-0.5 h-5 w-5 fill-current" />
                )}
              </button>
              <button
                type="button"
                aria-label="Next"
                onClick={next}
                className="grid h-9 w-9 place-items-center rounded-full hover:bg-accent"
              >
                <SkipForward className="h-4.5 w-4.5 fill-current" />
              </button>
              <button
                type="button"
                aria-label="Toggle repeat"
                onClick={cycleRepeat}
                className={cn(
                  "grid h-8 w-8 place-items-center rounded-full transition-colors",
                  repeat !== "off" ? "text-primary" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {repeat === "one" ? (
                  <Repeat1 className="h-4 w-4" />
                ) : (
                  <Repeat className="h-4 w-4" />
                )}
              </button>
            </div>
            <div className="flex w-full max-w-xl items-center gap-2">
              <span className="w-9 text-right text-[11px] tabular-nums text-muted-foreground">
                {formatDuration(currentTime)}
              </span>
              <Slider
                value={[Math.min(currentTime, duration || 0)]}
                max={duration || 1}
                step={1}
                onValueChange={(v) => seek(v[0] ?? 0)}
                aria-label="Seek"
                className="flex-1"
              />
              <span className="w-9 text-[11px] tabular-nums text-muted-foreground">
                {formatDuration(duration)}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              aria-label="Open queue"
              onClick={() => setQueueOpen(true)}
              className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground transition-colors hover:text-foreground"
            >
              <ListMusic className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label={muted ? "Unmute" : "Mute"}
              onClick={toggleMute}
              className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground transition-colors hover:text-foreground"
            >
              <VolumeIcon className="h-4 w-4" />
            </button>
            <Slider
              value={[muted ? 0 : volume]}
              max={1}
              step={0.01}
              onValueChange={(v) => setVolume(v[0] ?? 0)}
              aria-label="Volume"
              className="w-24"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
