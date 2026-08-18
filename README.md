# MusifyApp Stream

I want you to build a complete production-quality music streaming web application called MusifyApp.



I have an existing GitHub repository that contains a working music application and API integration:



https://github.com/r2hu1/musichub



Use this repository as the reference for understanding the existing music API integration, data structures, endpoints, audio streaming, search, albums, tracks, artwork and player functionality.



IMPORTANT



Do NOT create fake/mock music data.



Do NOT use static songs just to make the UI look populated.



Use the real music API integration from the provided repository.



Before implementing anything, inspect the repository and understand:



- API base URL configuration

- API endpoints

- Search implementation

- Song/track response structure

- Album response structure

- Artist information

- Artwork/image URLs

- Audio/stream URLs

- Player implementation

- Existing hooks and API utilities

- Existing environment variables

- Existing error handling



The original repository is a Next.js 14 application using the App Router and Tailwind CSS, and its README explains that the music API is based on a deployed JioSaavn API.



BRAND



Rename/rebrand everything as:



MusifyApp



Create a unique visual identity. Do NOT copy Spotify's exact design.



Use a premium modern music-streaming aesthetic.



TECH STACK



Use:



- Next.js

- TypeScript

- Tailwind CSS

- App Router

- shadcn/ui where useful

- React

- TanStack Query where useful

- HTML5 Audio API

- Responsive mobile-first design



Keep the architecture clean and modular.



MAIN NAVIGATION



Desktop sidebar:



- Home

- Search

- Explore

- Your Library

- Liked Songs

- Playlists



Mobile bottom navigation:



- Home

- Search

- Library

- Profile



HOME PAGE



Create a premium music homepage containing:



- MusifyApp logo

- Search bar

- Hero section

- Trending Music

- Recently Played

- Popular Artists

- Popular Albums

- New Releases

- Recommended Songs

- Popular Playlists



All music must be loaded from the real API.



Use horizontal scrolling sections where appropriate.



Create beautiful music cards with:



- Artwork

- Song/album name

- Artist

- Play button

- More button



SEARCH



Create a dedicated search experience.



Search for:



- Songs

- Albums

- Artists

- Playlists



Use the existing API's search functionality.



Implement:



- Search suggestions

- Debounced search

- Loading skeletons

- Empty results state

- Error state

- Recent searches



When clicking a song:

→ Play it immediately.



When clicking an album:

→ Open album page.



When clicking an artist:

→ Open artist page.



MUSIC PLAYER



Create a global persistent music player.



Desktop player:



- Fixed bottom bar

- Artwork

- Song title

- Artist

- Play/pause

- Previous

- Next

- Progress bar

- Current time

- Duration

- Volume

- Shuffle

- Repeat

- Like

- Queue



Mobile:



- Compact mini-player

- Tap to expand into full-screen player



The player must use the actual audio/stream URL provided by the API.



Implement:



- Play

- Pause

- Seek

- Previous

- Next

- Shuffle

- Repeat

- Volume

- Queue

- Auto-play next song

- Loading state

- Playback error state



FULL-SCREEN NOW PLAYING



Create a beautiful full-screen Now Playing page.



Display:



- Large album artwork

- Song title

- Artist

- Progress

- Playback controls

- Shuffle

- Repeat

- Like

- Queue

- Lyrics button if lyrics are available



Add subtle animations.



ALBUM PAGE



Create dynamic album pages.



Display:



- Large album artwork

- Album title

- Artist

- Release information

- Track list

- Play Album button

- Shuffle button



Each track should be playable.



Use the API data rather than hardcoded information.



ARTIST PAGE



Create dynamic artist pages.



Display:



- Artist image

- Artist name

- Popular songs

- Albums

- Singles

- Related artists if supported by the API



Add:



- Play button

- Follow button UI



PLAYLISTS



Allow users to create local playlists.



Features:



- Create playlist

- Rename playlist

- Delete playlist

- Add song

- Remove song

- Play playlist

- Shuffle playlist



If the current API does not provide user playlist storage, use localStorage initially.



Structure the code so a real database can be added later.



LIKED SONGS



Allow users to like/unlike songs.



Create a dedicated:



Liked Songs



page.



Persist liked songs locally if authentication/database isn't available.



RECENTLY PLAYED



Automatically save recently played songs.



Display them on:



- Home

- Library



Prevent unnecessary duplicates and limit the stored history.



QUEUE



Implement a real queue system.



Users should be able to:



- Add to queue

- Remove from queue

- Play next

- Clear queue

- Reorder queue if practical



When a song finishes, automatically play the next song.



LIBRARY



Create:



Your Library



with:



- Liked Songs

- Recently Played

- Playlists

- Saved Albums

- Followed Artists



Use localStorage for local persistence where a backend isn't available.



DARK/LIGHT MODE



Support:



- Dark mode

- Light mode

- System mode



Default to dark mode because this is a music streaming application.



UI DESIGN



Make the UI look premium and modern.



Use:



- Dark backgrounds

- Large artwork

- Subtle gradients

- Glass effects where appropriate

- Rounded cards

- Smooth hover animations

- Clean typography

- Beautiful spacing

- Skeleton loaders

- Smooth page transitions



Do not make the interface look like a generic AI-generated dashboard.



It should feel like a real commercial music application.



RESPONSIVE DESIGN



Optimize specifically for:



- Android phones

- iPhone

- Tablets

- Laptop

- Desktop



Mobile experience is extremely important.



The player must work properly on small screens.



API LAYER



Create a clean API abstraction.



For example:



lib/

api/

music.ts



Create functions such as:



- searchSongs()

- getSong()

- getAlbum()

- getArtist()

- getPlaylist()

- getTrending()

- getRecommendations()



However, do NOT blindly assume these endpoint names.



Inspect the existing repository and adapt the functions to its actual API.



Normalize API responses into TypeScript types.



Example:



Song {

id

title

artist

album

artwork

audioUrl

duration

}



Adapt this model to the actual API response.



ENVIRONMENT VARIABLES



Do not hardcode API URLs.



Use environment variables such as:



NEXT_PUBLIC_API_URL



or whatever environment variable structure is already used by the repository.



Inspect the existing ".env.example" and preserve its required configuration.



Never expose private API credentials.



ERROR HANDLING



Handle:



- API failure

- Network failure

- Missing artwork

- Missing audio URL

- Invalid response

- Search failure

- Playback failure

- Empty results



Never allow the application to crash because one song fails.



LOADING STATES



Create beautiful skeleton loaders for:



- Songs

- Albums

- Artists

- Search

- Home sections

- Album pages

- Artist pages



PERFORMANCE



Implement:



- API caching

- Debounced search

- Lazy loading

- Optimized images

- Efficient state management

- Minimal unnecessary API requests



CODE QUALITY



Use reusable components.



Avoid duplicating music-player logic across pages.



Create a central player state/store that controls playback globally.



Keep API logic separate from UI components.



Use TypeScript types throughout the project.



IMPORTANT FINAL REQUIREMENT



Do not simply clone the original MusicHub UI.



Use the repository primarily to understand and reuse the existing music API integration and functionality, while creating a new and unique MusifyApp interface and brand.



Before considering the project complete:



1. Verify the API connection.

2. Verify search.

3. Verify song playback.

4. Verify album pages.

5. Verify artist pages.

6. Verify queue.

7. Verify next/previous playback.

8. Verify mobile player.

9. Verify playlists.

10. Verify liked songs.

11. Verify recently played.

12. Fix all console errors.

13. Remove all mock music data.

14. Make sure the application works with the real API.



The final result should be a polished, responsive, real music streaming application called MusifyApp, powered by the existing MusicHub music API integration.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://musify-vibe.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/05290aaa-1913-441e-8493-042b339198fa).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
