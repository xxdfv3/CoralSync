'use client'

import { Play, Star } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'

const featuredItem = {
  id: '1',
  title: 'Jujutsu Kaisen Season 3',
  description:
    'The intense battles continue as Yuji Itadori and his allies face new threats. The Culling Game arc brings unprecedented danger and revelations about the jujutsu world.',
  image: '/images/featured-hero.jpg',
  rating: 9.2,
  year: 2026,
  type: 'TV Series',
  episodes: 24,
  genres: ['Action', 'Supernatural', 'School'],
}

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src={featuredItem.image}
          alt=""
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/50" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/30" />
      </div>

      {/* Content */}
      <div className="relative mx-auto max-w-7xl px-4 py-16 lg:px-8 lg:py-24">
        <div className="max-w-2xl">
          {/* Badges */}
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <Badge className="bg-primary/90 text-primary-foreground">
              Featured
            </Badge>
            <Badge variant="secondary" className="gap-1">
              <Star className="size-3 fill-current" />
              {featuredItem.rating}
            </Badge>
            <Badge variant="outline">{featuredItem.type}</Badge>
          </div>

          {/* Title */}
          <h1 className="mb-4 text-balance text-4xl font-bold tracking-tight text-foreground lg:text-5xl xl:text-6xl">
            {featuredItem.title}
          </h1>

          {/* Metadata */}
          <div className="mb-4 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span>{featuredItem.year}</span>
            <span className="size-1 rounded-full bg-muted-foreground" />
            <span>{featuredItem.episodes} Episodes</span>
            <span className="size-1 rounded-full bg-muted-foreground" />
            {featuredItem.genres.map((genre, i) => (
              <span key={genre}>
                {genre}
                {i < featuredItem.genres.length - 1 && ', '}
              </span>
            ))}
          </div>

          {/* Description */}
          <p className="mb-8 max-w-xl text-pretty text-muted-foreground lg:text-lg">
            {featuredItem.description}
          </p>

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            <Button size="lg" className="gap-2" asChild>
              <Link href={`/title/${featuredItem.id}`}>
                <Play className="size-4 fill-current" />
                Watch Now
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href={`/title/${featuredItem.id}`}>More Info</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
