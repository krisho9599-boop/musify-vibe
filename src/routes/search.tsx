import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Search as SearchIcon, X } from "lucide-react";
import { musicKeys, searchAll } from "@/lib/api/music";
import { AlbumCard, ArtistCard, PlaylistCard } from "@/components/music/MediaCard";
import { SongList } from "@/components/music/SongList";
import { EmptyState, ErrorState, Scroller, Section } from "@/components/music/Section";
import { RowSkeleton, SongListSkeleton } from "@/components/music/Skeletons";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLibrary } from "@/lib/library";

export const Route = createFileRoute("/search")({
  validateSearch: (search: Record<string, unknown>) => ({
    q: typeof search["q"] === "string" ? search["q"] : "",
  }),
  head: () => ({
    meta: [
      { title: "Search music — MusifyApp" },
      {
        name: "description",
        content: "Search songs, albums, artists and playlists and play them instantly on MusifyApp.",
      },
      { property: "og:title", content: "Search music — MusifyApp" },
      { property: "og:description", content: "Find any song, album, artist or playlist." },
    ],
  }),
  component: SearchPage,
});

function SearchPage() {
  const { q } = Route.useSearch();
  const navigate = useNavigate();
  const { recentSearches, addRecentSearch, clearRecentSearches } = useLibrary();
  const [term, setTerm] = useState(q);
  const [debounced, setDebounced] = useState(q);

  useEffect(() => setTerm(q), [q]);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(term.trim()), 400);
    return () => clearTimeout(id);
  }, [term]);

  useEffect(() => {
    if (debounced.length >= 2) {
      addRecentSearch(debounced);
      void navigate({ to: "/search", search: { q: debounced }, replace: true });
    }
  }, [debounced, addRecentSearch, navigate]);

  const query = useQuery({
    queryKey: musicKeys.searchAll(debounced),
    queryFn: ({ signal }) => searchAll(debounced, signal),
    enabled: debounced.length >= 2,
    staleTime: 1000 * 60 * 5,
  });

  const data = query.data;
  const empty =
    data &&
    data.songs.length === 0 &&
    data.albums.length === 0 &&
    data.artists.length === 0 &&
    data.playlists.length === 0;

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold sm:text-3xl">Search</h1>
        <div className="relative mt-4">
          <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-muted-foreground" />
          <input
            autoFocus
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Songs, albums, artists, playlists…"
            aria-label="Search music"
            className="h-14 w-full rounded-2xl border border-border bg-surface pl-12 pr-12 text-base outline-none transition-colors focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
          />
          {term && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => setTerm("")}
              className="absolute right-4 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full text-muted-foreground hover:bg-accent"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {debounced.length < 2 && (
        <div className="space-y-4">
          {recentSearches.length > 0 && (
            <div>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold">Recent searches</h2>
                <button
                  type="button"
                  onClick={clearRecentSearches}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Clear
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setTerm(s)}
                    className="rounded-full border border-border px-4 py-2 text-sm transition-colors hover:border-primary/60 hover:text-primary"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div>
            <h2 className="mb-3 text-sm font-semibold">Try searching for</h2>
            <div className="flex flex-wrap gap-2">
              {["Arijit Singh", "lofi chill", "party hits", "acoustic", "top 50", "romantic"].map(
                (s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setTerm(s)}
                    className="rounded-full bg-surface px-4 py-2 text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {s}
                  </button>
                ),
              )}
            </div>
          </div>
        </div>
      )}

      {debounced.length >= 2 && query.isLoading && (
        <div className="space-y-6">
          <RowSkeleton />
          <SongListSkeleton />
        </div>
      )}

      {query.isError && (
        <ErrorState
          message="Search failed. The music service may be unreachable."
          onRetry={() => void query.refetch()}
        />
      )}

      {empty && (
        <EmptyState
          title={`No results for "${debounced}"`}
          description="Try a different spelling, artist or song name."
        />
      )}

      {data && !empty && (
        <Tabs defaultValue="all">
          <TabsList className="w-full justify-start overflow-x-auto no-scrollbar">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="songs">Songs</TabsTrigger>
            <TabsTrigger value="albums">Albums</TabsTrigger>
            <TabsTrigger value="artists">Artists</TabsTrigger>
            <TabsTrigger value="playlists">Playlists</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-8 pt-6">
            {data.songs.length > 0 && (
              <Section title="Songs">
                <SongList songs={data.songs.slice(0, 6)} />
              </Section>
            )}
            {data.artists.length > 0 && (
              <Section title="Artists">
                <Scroller>
                  {data.artists.map((a) => (
                    <ArtistCard key={a.id} artist={a} />
                  ))}
                </Scroller>
              </Section>
            )}
            {data.albums.length > 0 && (
              <Section title="Albums">
                <Scroller>
                  {data.albums.map((a) => (
                    <AlbumCard key={a.id} album={a} />
                  ))}
                </Scroller>
              </Section>
            )}
            {data.playlists.length > 0 && (
              <Section title="Playlists">
                <Scroller>
                  {data.playlists.map((p) => (
                    <PlaylistCard key={p.id} playlist={p} />
                  ))}
                </Scroller>
              </Section>
            )}
          </TabsContent>

          <TabsContent value="songs" className="pt-6">
            <SongList songs={data.songs} />
          </TabsContent>
          <TabsContent value="albums" className="pt-6">
            <div className="flex flex-wrap gap-4">
              {data.albums.map((a) => (
                <AlbumCard key={a.id} album={a} />
              ))}
            </div>
          </TabsContent>
          <TabsContent value="artists" className="pt-6">
            <div className="flex flex-wrap gap-4">
              {data.artists.map((a) => (
                <ArtistCard key={a.id} artist={a} />
              ))}
            </div>
          </TabsContent>
          <TabsContent value="playlists" className="pt-6">
            <div className="flex flex-wrap gap-4">
              {data.playlists.map((p) => (
                <PlaylistCard key={p.id} playlist={p} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
