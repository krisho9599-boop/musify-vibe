import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart, ListMusic } from "lucide-react";
import { AlbumCard, ArtistCard } from "@/components/music/MediaCard";
import { SongList } from "@/components/music/SongList";
import { EmptyState, Scroller, Section } from "@/components/music/Section";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLibrary } from "@/lib/library";

export const Route = createFileRoute("/library")({
  head: () => ({
    meta: [
      { title: "Your Library — MusifyApp" },
      {
        name: "description",
        content: "Your liked songs, playlists, saved albums, followed artists and listening history.",
      },
      { property: "og:title", content: "Your Library — MusifyApp" },
      { property: "og:description", content: "Liked songs, playlists, albums and artists." },
    ],
  }),
  component: LibraryPage,
});

function LibraryPage() {
  const { liked, playlists, savedAlbums, followedArtists, recent, clearRecent } = useLibrary();

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <h1 className="text-2xl font-extrabold sm:text-3xl">Your Library</h1>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          to="/liked"
          className="flex items-center gap-4 rounded-2xl glass-panel p-4 transition-transform hover:scale-[1.01]"
        >
          <span className="grid h-14 w-14 place-items-center rounded-xl ember-surface">
            <Heart className="h-6 w-6 fill-current" />
          </span>
          <span>
            <span className="block font-semibold">Liked Songs</span>
            <span className="block text-xs text-muted-foreground">{liked.length} songs</span>
          </span>
        </Link>
        <Link
          to="/playlists"
          className="flex items-center gap-4 rounded-2xl glass-panel p-4 transition-transform hover:scale-[1.01]"
        >
          <span className="grid h-14 w-14 place-items-center rounded-xl bg-surface-elevated">
            <ListMusic className="h-6 w-6 text-primary" />
          </span>
          <span>
            <span className="block font-semibold">Your Playlists</span>
            <span className="block text-xs text-muted-foreground">
              {playlists.length} playlists
            </span>
          </span>
        </Link>
      </div>

      <Tabs defaultValue="recent">
        <TabsList className="w-full justify-start overflow-x-auto no-scrollbar">
          <TabsTrigger value="recent">Recently played</TabsTrigger>
          <TabsTrigger value="albums">Albums</TabsTrigger>
          <TabsTrigger value="artists">Artists</TabsTrigger>
        </TabsList>

        <TabsContent value="recent" className="pt-6">
          {recent.length === 0 ? (
            <EmptyState
              title="Nothing played yet"
              description="Songs you play will show up here."
            />
          ) : (
            <Section
              title="History"
              action={
                <button
                  type="button"
                  onClick={clearRecent}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Clear
                </button>
              }
            >
              <SongList songs={recent} />
            </Section>
          )}
        </TabsContent>

        <TabsContent value="albums" className="pt-6">
          {savedAlbums.length === 0 ? (
            <EmptyState title="No saved albums" description="Save albums to find them here." />
          ) : (
            <Scroller>
              {savedAlbums.map((a) => (
                <AlbumCard key={a.id} album={a} />
              ))}
            </Scroller>
          )}
        </TabsContent>

        <TabsContent value="artists" className="pt-6">
          {followedArtists.length === 0 ? (
            <EmptyState title="No followed artists" description="Follow artists to see them here." />
          ) : (
            <Scroller>
              {followedArtists.map((a) => (
                <ArtistCard key={a.id} artist={a} />
              ))}
            </Scroller>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
