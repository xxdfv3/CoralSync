import { ContentGrid } from '@/widgets/home/ContentGrid'
import { GenreSection } from '@/widgets/home/GenreSection'
import { HeroSection } from '@/widgets/home/HeroSection'
import { ScheduleSection } from '@/widgets/home/ScheduleSection'
import { Footer } from '@/widgets/navigation/Footer'
import { Header } from '@/widgets/navigation/Header'

// Sample data for new episodes
const newEpisodes = [
  {
    id: '1',
    title: 'Jujutsu Kaisen Season 3',
    image: '/images/anime-1.jpg',
    rating: 9.2,
    year: 2026,
    type: 'anime' as const,
    episodeCount: 24,
    latestEpisode: 8,
  },
  {
    id: '2',
    title: 'Solo Leveling Season 2',
    image: '/images/anime-2.jpg',
    rating: 8.9,
    year: 2026,
    type: 'anime' as const,
    episodeCount: 12,
    latestEpisode: 5,
  },
  {
    id: '3',
    title: 'Demon Slayer: Infinity Castle',
    image: '/images/anime-3.jpg',
    rating: 9.5,
    year: 2026,
    type: 'anime' as const,
    episodeCount: 13,
    latestEpisode: 3,
  },
  {
    id: '4',
    title: 'Dandadan',
    image: '/images/anime-4.jpg',
    rating: 8.7,
    year: 2026,
    type: 'anime' as const,
    episodeCount: 24,
    latestEpisode: 12,
  },
  {
    id: '5',
    title: 'Golden Kamuy: Final',
    image: '/images/anime-5.jpg',
    rating: 8.8,
    year: 2026,
    type: 'anime' as const,
    episodeCount: 12,
    latestEpisode: 8,
  },
  {
    id: '6',
    title: 'Blue Lock Season 2',
    image: '/images/anime-6.jpg',
    rating: 8.6,
    year: 2026,
    type: 'anime' as const,
    episodeCount: 24,
    latestEpisode: 15,
  },
]

// Sample data for popular titles
const popularTitles = [
  {
    id: '10',
    title: 'Attack on Titan',
    image: '/images/popular-1.jpg',
    rating: 9.8,
    year: 2023,
    type: 'anime' as const,
    episodeCount: 87,
  },
  {
    id: '11',
    title: 'Breaking Bad',
    image: '/images/popular-2.jpg',
    rating: 9.7,
    year: 2013,
    type: 'series' as const,
    episodeCount: 62,
  },
  {
    id: '12',
    title: 'Spirited Away',
    image: '/images/popular-3.jpg',
    rating: 9.3,
    year: 2001,
    type: 'movie' as const,
  },
  {
    id: '13',
    title: 'Steins;Gate',
    image: '/images/popular-4.jpg',
    rating: 9.4,
    year: 2011,
    type: 'anime' as const,
    episodeCount: 24,
  },
  {
    id: '14',
    title: 'Your Name',
    image: '/images/popular-5.jpg',
    rating: 9.2,
    year: 2016,
    type: 'movie' as const,
  },
  {
    id: '15',
    title: 'Fullmetal Alchemist: Brotherhood',
    image: '/images/popular-6.jpg',
    rating: 9.6,
    year: 2009,
    type: 'anime' as const,
    episodeCount: 64,
  },
]

// Sample data for movies
const latestMovies = [
  {
    id: '20',
    title: 'Suzume no Tojimari',
    image: '/images/movie-1.jpg',
    rating: 8.9,
    year: 2022,
    type: 'movie' as const,
  },
  {
    id: '21',
    title: 'The First Slam Dunk',
    image: '/images/movie-2.jpg',
    rating: 9.1,
    year: 2022,
    type: 'movie' as const,
  },
  {
    id: '22',
    title: 'Jujutsu Kaisen 0',
    image: '/images/movie-3.jpg',
    rating: 8.8,
    year: 2021,
    type: 'movie' as const,
  },
  {
    id: '23',
    title: 'One Piece Film: Red',
    image: '/images/movie-4.jpg',
    rating: 8.5,
    year: 2022,
    type: 'movie' as const,
  },
  {
    id: '24',
    title: 'Dragon Ball Super: Super Hero',
    image: '/images/movie-5.jpg',
    rating: 8.3,
    year: 2022,
    type: 'movie' as const,
  },
  {
    id: '25',
    title: 'Belle',
    image: '/images/movie-6.jpg',
    rating: 8.6,
    year: 2021,
    type: 'movie' as const,
  },
]

/**
 * Home page composition (FSD views layer).
 * Renders the main landing content.
 */
export function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-background font-sans">
      <Header />
      
      <main className="flex-1">
        <HeroSection />
        
        <ContentGrid
          title="New Episodes"
          viewAllHref="/catalog?sort=latest"
          items={newEpisodes}
        />

        <ScheduleSection />
        
        <ContentGrid
          title="Popular This Season"
          viewAllHref="/catalog?sort=popular"
          items={popularTitles}
        />

        <GenreSection />
        
        <ContentGrid
          title="Latest Movies"
          viewAllHref="/movies"
          items={latestMovies}
        />
      </main>

      <Footer />
    </div>
  )
}
