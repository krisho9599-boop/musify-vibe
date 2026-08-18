import { ArrowDown, ArrowUp, Trash2, X } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Artwork } from "@/components/music/Artwork";
import { usePlayer } from "@/lib/player";
import { cn } from "@/lib/utils";

export function QueuePanel() {
  const {
    queue,
    currentIndex,
    queueOpen,
    setQueueOpen,
    playSongs,
    removeFromQueue,
    moveInQueue,
    clearQueue,
  } = usePlayer();

  return (
    <Sheet open={queueOpen} onOpenChange={setQueueOpen}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
        <SheetHeader className="border-b border-border px-5 py-4">
          <SheetTitle className="flex items-center justify-between">
            <span>Queue</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearQueue}
              disabled={queue.length === 0}
              className="text-muted-foreground"
            >
              <Trash2 className="mr-1.5 h-4 w-4" /> Clear
            </Button>
          </SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-3 py-3">
          {queue.length === 0 ? (
            <p className="py-16 text-center text-sm text-muted-foreground">
              Your queue is empty. Play something to get started.
            </p>
          ) : (
            <ul className="space-y-1">
              {queue.map((song, index) => (
                <li
                  key={`${song.id}-${index}`}
                  className={cn(
                    "group flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-accent/60",
                    index === currentIndex && "bg-accent/70",
                  )}
                >
                  <button
                    type="button"
                    onClick={() => playSongs(queue, index)}
                    className="flex min-w-0 flex-1 items-center gap-3 text-left"
                  >
                    <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg">
                      <Artwork src={song.artwork} alt={song.title} rounded="rounded-lg" />
                    </div>
                    <div className="min-w-0">
                      <p
                        className={cn(
                          "truncate text-sm font-medium",
                          index === currentIndex && "text-primary",
                        )}
                      >
                        {song.title}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">{song.artist}</p>
                    </div>
                  </button>
                  <div className="flex shrink-0 items-center">
                    <button
                      type="button"
                      aria-label="Move up"
                      disabled={index === 0}
                      onClick={() => moveInQueue(index, index - 1)}
                      className="grid h-7 w-7 place-items-center rounded-full text-muted-foreground hover:text-foreground disabled:opacity-30"
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      aria-label="Move down"
                      disabled={index === queue.length - 1}
                      onClick={() => moveInQueue(index, index + 1)}
                      className="grid h-7 w-7 place-items-center rounded-full text-muted-foreground hover:text-foreground disabled:opacity-30"
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      aria-label="Remove from queue"
                      onClick={() => removeFromQueue(index)}
                      className="grid h-7 w-7 place-items-center rounded-full text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
