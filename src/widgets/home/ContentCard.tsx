'use client'

import { Play, Star } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

import { Badge } from '@/shared/ui/badge'

export type ContentItem = {
  id: string
  title: string
  image: string
  rating: number
  year: number
  type: 'anime' | 'movie' | 'series'
  episodeCount?: number
  latestEpisode?: number
}

type ContentCardProps = {
  item: ContentItem
}

export function ContentCard({ item }: ContentCardProps) {
  const typeLabel = {
    anime: 'Anime',
    movie: 'Movie',
    series: 'Series',
  }[item.type]

  return (
    <Link
      href={`/title/${item.id}`}
      className="group relative flex flex-col overflow-hidden rounded-lg bg-card transition-all hover:ring-2 hover:ring-primary/50"
    >
      {/* Image Container */}
      <div className="relative aspect-[2/3] overflow-hidden">
        <Image
          src={item.image}
          alt={item.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
        />
        
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
        
        {/* Play button on hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
          <div className="flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Play className="size-5 fill-current" />
          </div>
        </div>

        {/* Badges */}
        <div className="absolute left-2 top-2 flex flex-col gap-1.5">
          <Badge className="bg-primary/90 text-xs text-primary-foreground">
            {typeLabel}
          </Badge>
          {item.latestEpisode && (
            <Badge variant="secondary" className="text-xs">
              EP {item.latestEpisode}
            </Badge>
          )}
        </div>

        {/* Rating */}
        <div className="absolute right-2 top-2">
          <Badge
            variant="secondary"
            className="gap-1 bg-black/60 text-xs text-foreground backdrop-blur-sm"
          >
            <Star className="size-3 fill-current text-amber-400" />
            {item.rating.toFixed(1)}
          </Badge>
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col gap-1 p-3">
        <h3 className="line-clamp-2 text-sm font-medium leading-tight text-card-foreground group-hover:text-primary">
          {item.title}
        </h3>
        <div className="mt-auto flex items-center gap-2 text-xs text-muted-foreground">
          <span>{item.year}</span>
          {item.episodeCount && (
            <>
              <span className="size-1 rounded-full bg-muted-foreground/50" />
              <span>{item.episodeCount} eps</span>
            </>
          )}
        </div>
      </div>
    </Link>
  )
}
