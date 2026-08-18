import { Heart, Loader2, Pause, Play, X } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { formatDuration, type Song } from "@/lib/api/music";
import { useLibrary } from "@/lib/library";
import { usePlayer } from "@/lib/player";
import { cn } from "@/lib/utils";
import { Artwork } from "./Artwork";
import { SongMenu } from "./SongMenu";

function Equalizer() {
  return (
    <span className="flex h-4 items-end gap-[2px]" aria-hidden>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="eq-bar w-[3px] rounded-full bg-primary"
          style={{ height: "100%", animationDelay: `${i * 140}ms` }}
        />
      ))}
    </span>
  );
}

interface SongListProps {
  songs: Song[];
  showIndex?: boolean;
  showArtwork?: boolean;
  onRemove?: (song: Song, index: number) => void;
}

export function SongList({
  songs,
  showIndex = true,
  showArtwork = true,
  onRemove,
}: SongListProps) {
  const { current, isPlaying, isLoading, playSongs, toggle } = usePlayer();
  const { isLiked, toggleLike } = useLibrary();

  return (
    <ul className="space-y-1">
      {songs.map((song, index) => {
        const isCurrent = current?.id === song.id;
        const liked = isLiked(song.id);
        return (
          <li key={`${song.id}-${index}`}>
            <div
              role="button"
              tabIndex={0}
              onClick={() => (isCurrent ? toggle() : playSongs(songs, index))}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  isCurrent ? toggle() : playSongs(songs, index);
                }
              }}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-accent/60",
                isCurrent && "bg-accent/70",
              )}
            >
              {showIndex && (
                <span className="hidden w-6 shrink-0 justify-center text-xs tabular-nums text-muted-foreground sm:flex">
                  {isCurrent && isPlaying ? <Equalizer /> : index + 1}
                </span>
              )}
              {showArtwork && (
                <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg">
                  <Artwork src={song.artwork} alt={song.title} rounded="rounded-lg" />
                  <div
                    className={cn(
                      "absolute inset-0 grid place-items-center bg-background/60 transition-opacity",
                      isCurrent ? "opacity-100" : "opacity-0 group-hover:opacity-100",
                    )}
                  >
                    {isCurrent && isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    ) : isCurrent && isPlaying ? (
                      <Pause className="h-4 w-4 fill-primary text-primary" />
                    ) : (
                      <Play className="h-4 w-4 fill-foreground text-foreground" />
                    )}
                  </div>
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className={cn("truncate text-sm font-medium", isCurrent && "text-primary")}>
                  {song.title}
                </p>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  {song.artistId ? (
                    <Link
                      to="/artist/$artistId"
                      params={{ artistId: song.artistId }}
                      onClick={(e) => e.stopPropagation()}
                      className="hover:text-foreground hover:underline"
                    >
                      {song.artist}
                    </Link>
                  ) : (
                    song.artist
                  )}
                </p>
              </div>
              <button
                type="button"
                aria-label={liked ? "Unlike song" : "Like song"}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleLike(song);
                }}
                className="hidden h-8 w-8 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors hover:text-primary sm:grid"
              >
                <Heart className={cn("h-4 w-4", liked && "fill-primary text-primary")} />
              </button>
              <span className="hidden w-10 shrink-0 text-right text-xs tabular-nums text-muted-foreground sm:block">
                {formatDuration(song.duration)}
              </span>
              {onRemove ? (
                <button
                  type="button"
                  aria-label="Remove"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove(song, index);
                  }}
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              ) : (
                <SongMenu song={song} className="shrink-0" />
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
