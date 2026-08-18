import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Heart, ListEnd, ListPlus, MoreHorizontal, Plus, Disc3, User } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Song } from "@/lib/api/music";
import { useLibrary } from "@/lib/library";
import { usePlayer } from "@/lib/player";
import { cn } from "@/lib/utils";

export function SongMenu({ song, className }: { song: Song; className?: string }) {
  const { playNext, addToQueue } = usePlayer();
  const { isLiked, toggleLike, playlists, createPlaylist, addToPlaylist } = useLibrary();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newName, setNewName] = useState("");

  const liked = isLiked(song.id);

  const handleAdd = (playlistId: string, playlistName: string) => {
    const added = addToPlaylist(playlistId, song);
    toast[added ? "success" : "info"](
      added ? `Added to ${playlistName}` : `Already in ${playlistName}`,
    );
    setDialogOpen(false);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label={`More options for ${song.title}`}
            onClick={(e) => e.stopPropagation()}
            className={cn(
              "grid h-8 w-8 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
              className,
            )}
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuItem onClick={() => playNext(song)}>
            <ListEnd className="mr-2 h-4 w-4" /> Play next
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => addToQueue(song)}>
            <ListPlus className="mr-2 h-4 w-4" /> Add to queue
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add to playlist
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              const now = toggleLike(song);
              toast.success(now ? "Added to Liked Songs" : "Removed from Liked Songs");
            }}
          >
            <Heart className={cn("mr-2 h-4 w-4", liked && "fill-primary text-primary")} />
            {liked ? "Remove from liked" : "Like song"}
          </DropdownMenuItem>
          {(song.albumId || song.artistId) && <DropdownMenuSeparator />}
          {song.albumId && (
            <DropdownMenuItem asChild>
              <Link to="/album/$albumId" params={{ albumId: song.albumId }}>
                <Disc3 className="mr-2 h-4 w-4" /> Go to album
              </Link>
            </DropdownMenuItem>
          )}
          {song.artistId && (
            <DropdownMenuItem asChild>
              <Link to="/artist/$artistId" params={{ artistId: song.artistId }}>
                <User className="mr-2 h-4 w-4" /> Go to artist
              </Link>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Add to playlist</DialogTitle>
            <DialogDescription className="truncate">{song.title}</DialogDescription>
          </DialogHeader>
          <div className="flex gap-2">
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="New playlist name"
              onKeyDown={(e) => {
                if (e.key === "Enter" && newName.trim()) {
                  const pl = createPlaylist(newName);
                  addToPlaylist(pl.id, song);
                  toast.success(`Created ${pl.name}`);
                  setNewName("");
                  setDialogOpen(false);
                }
              }}
            />
            <Button
              disabled={!newName.trim()}
              onClick={() => {
                const pl = createPlaylist(newName);
                addToPlaylist(pl.id, song);
                toast.success(`Created ${pl.name}`);
                setNewName("");
                setDialogOpen(false);
              }}
            >
              Create
            </Button>
          </div>
          <div className="max-h-64 space-y-1 overflow-y-auto">
            {playlists.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No playlists yet — create your first one above.
              </p>
            ) : (
              playlists.map((pl) => (
                <button
                  key={pl.id}
                  type="button"
                  onClick={() => handleAdd(pl.id, pl.name)}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition-colors hover:bg-accent"
                >
                  <span className="truncate">{pl.name}</span>
                  <span className="text-xs text-muted-foreground">{pl.songs.length}</span>
                </button>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
