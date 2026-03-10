'use client'

import { Flame, Ghost, Heart, Sword, Laugh, Sparkles, Rocket, Users } from 'lucide-react'
import Link from 'next/link'

const genres = [
  { name: 'Action', icon: Sword, count: 342 },
  { name: 'Romance', icon: Heart, count: 256 },
  { name: 'Comedy', icon: Laugh, count: 289 },
  { name: 'Supernatural', icon: Ghost, count: 178 },
  { name: 'Fantasy', icon: Sparkles, count: 234 },
  { name: 'Sci-Fi', icon: Rocket, count: 145 },
  { name: 'Slice of Life', icon: Users, count: 198 },
  { name: 'Thriller', icon: Flame, count: 89 },
]

export function GenreSection() {
  return (
    <section className="py-8 lg:py-12">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-foreground lg:text-2xl">
            Browse by Genre
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Find content that matches your mood
          </p>
        </div>

        {/* Genre Grid */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
          {genres.map((genre) => {
            const Icon = genre.icon
            return (
              <Link
                key={genre.name}
                href={`/genres/${genre.name.toLowerCase().replace(' ', '-')}`}
                className="group flex flex-col items-center gap-3 rounded-xl border border-border/50 bg-card/50 p-4 transition-all hover:border-primary/50 hover:bg-primary/5"
              >
                <div className="flex size-12 items-center justify-center rounded-full bg-secondary transition-colors group-hover:bg-primary/10">
                  <Icon className="size-5 text-muted-foreground transition-colors group-hover:text-primary" />
                </div>
                <div className="text-center">
                  <h3 className="text-sm font-medium text-card-foreground">
                    {genre.name}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {genre.count} titles
                  </p>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
