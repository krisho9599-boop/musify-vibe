import { Link } from "@tanstack/react-router";
import { Play, Pause } from "lucide-react";
import type {
  AlbumSummary,
  ArtistSummary,
  PlaylistSummary,
  Song,
} from "@/lib/api/music";
import { Artwork } from "./Artwork";
import { SongMenu } from "./SongMenu";
import { usePlayer } from "@/lib/player";
import { cn } from "@/lib/utils";

const CARD = "group w-[150px] shrink-0 sm:w-[176px]";

function PlayBadge({ playing, onClick, label }: { playing: boolean; onClick: (e: React.MouseEvent) => void; label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={cn(
        "absolute bottom-2 right-2 grid h-10 w-10 place-items-center rounded-full ember-surface shadow-glow transition-all duration-300",
        playing
          ? "opacity-100 translate-y-0"
          : "translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 focus-visible:translate-y-0 focus-visible:opacity-100",
      )}
    >
      {playing ? <Pause className="h-4 w-4 fill-current" /> : <Play className="h-4 w-4 fill-current" />}
    </button>
  );
}

export function SongCard({ song, queue }: { song: Song; queue?: Song[] }) {
  const { current, isPlaying, playSongs, toggle } = usePlayer();
  const isCurrent = current?.id === song.id;

  const start = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isCurrent) {
      toggle();
      return;
    }
    const list = queue && queue.length > 0 ? queue : [song];
    playSongs(list, Math.max(0, list.findIndex((s) => s.id === song.id)));
  };

  return (
    <div className={CARD}>
      <div className="relative overflow-hidden rounded-2xl">
        <button type="button" onClick={start} className="block w-full" aria-label={`Play ${song.title}`}>
          <div className="aspect-square overflow-hidden rounded-2xl">
            <Artwork
              src={song.artwork}
              alt={song.title}
              rounded="rounded-2xl"
              className="transition-transform duration-500 group-hover:scale-105"
            />
          </div>
        </button>
        <PlayBadge playing={isCurrent && isPlaying} onClick={start} label={`Play ${song.title}`} />
      </div>
      <div className="mt-3 flex items-start justify-between gap-1">
        <div className="min-w-0">
          <p className={cn("truncate text-sm font-semibold", isCurrent && "text-primary")}>
            {song.title}
          </p>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">{song.artist}</p>
        </div>
        <SongMenu song={song} className="-mr-1 shrink-0 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100" />
      </div>
    </div>
  );
}

export function AlbumCard({ album }: { album: AlbumSummary }) {
  return (
    <Link to="/album/$albumId" params={{ albumId: album.id }} className={CARD}>
      <div className="aspect-square overflow-hidden rounded-2xl">
        <Artwork
          src={album.artwork}
          alt={album.title}
          rounded="rounded-2xl"
          className="transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <p className="mt-3 truncate text-sm font-semibold">{album.title}</p>
      <p className="mt-0.5 truncate text-xs text-muted-foreground">
        {album.year ? `${album.year} · ` : ""}
        {album.artist}
      </p>
    </Link>
  );
}

export function ArtistCard({ artist }: { artist: ArtistSummary }) {
  return (
    <Link to="/artist/$artistId" params={{ artistId: artist.id }} className={CARD}>
      <div className="aspect-square overflow-hidden rounded-full ring-1 ring-border">
        <Artwork
          src={artist.image}
          alt={artist.name}
          rounded="rounded-full"
          className="transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <p className="mt-3 truncate text-center text-sm font-semibold">{artist.name}</p>
      <p className="mt-0.5 truncate text-center text-xs text-muted-foreground">Artist</p>
    </Link>
  );
}

export function PlaylistCard({ playlist }: { playlist: PlaylistSummary }) {
  return (
    <Link to="/playlist/$playlistId" params={{ playlistId: playlist.id }} className={CARD}>
      <div className="aspect-square overflow-hidden rounded-2xl">
        <Artwork
          src={playlist.artwork}
          alt={playlist.title}
          rounded="rounded-2xl"
          className="transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <p className="mt-3 truncate text-sm font-semibold">{playlist.title}</p>
      <p className="mt-0.5 truncate text-xs text-muted-foreground">
        {playlist.songCount ? `${playlist.songCount} songs` : "Playlist"}
      </p>
    </Link>
  );
}
