'use client'

import { Calendar, Clock } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

import { Badge } from '@/shared/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs'

type ScheduleItem = {
  id: string
  title: string
  image: string
  episode: number
  time: string
  genres: string[]
}

const scheduleData: Record<string, ScheduleItem[]> = {
  today: [
    {
      id: '1',
      title: 'Jujutsu Kaisen Season 3',
      image: '/images/schedule-1.jpg',
      episode: 8,
      time: '23:55',
      genres: ['Supernatural', 'Action'],
    },
    {
      id: '2',
      title: 'Golden Kamuy: Final',
      image: '/images/schedule-2.jpg',
      episode: 8,
      time: '23:40',
      genres: ['Adventure', 'Historical'],
    },
    {
      id: '3',
      title: 'Dandadan',
      image: '/images/schedule-3.jpg',
      episode: 12,
      time: '22:00',
      genres: ['Action', 'Comedy'],
    },
  ],
  tomorrow: [
    {
      id: '4',
      title: 'Solo Leveling Season 2',
      image: '/images/schedule-4.jpg',
      episode: 5,
      time: '20:00',
      genres: ['Action', 'Fantasy'],
    },
    {
      id: '5',
      title: 'Demon Slayer Season 5',
      image: '/images/schedule-5.jpg',
      episode: 3,
      time: '21:30',
      genres: ['Action', 'Supernatural'],
    },
  ],
  week: [
    {
      id: '6',
      title: 'My Hero Academia Final',
      image: '/images/schedule-6.jpg',
      episode: 15,
      time: 'Saturday',
      genres: ['Action', 'School'],
    },
    {
      id: '7',
      title: 'One Piece',
      image: '/images/schedule-7.jpg',
      episode: 1124,
      time: 'Sunday',
      genres: ['Adventure', 'Comedy'],
    },
  ],
}

function ScheduleCard({ item }: { item: ScheduleItem }) {
  return (
    <Link
      href={`/title/${item.id}`}
      className="group flex gap-4 rounded-lg p-3 transition-colors hover:bg-secondary/50"
    >
      <div className="relative aspect-[2/3] w-16 shrink-0 overflow-hidden rounded-md">
        <Image
          src={item.image}
          alt={item.title}
          fill
          className="object-cover"
          sizes="64px"
        />
      </div>
      <div className="flex flex-1 flex-col justify-center gap-1">
        <h3 className="line-clamp-2 text-sm font-medium text-card-foreground group-hover:text-primary">
          {item.title}
        </h3>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Badge variant="secondary" className="text-xs">
            EP {item.episode}
          </Badge>
          <span className="flex items-center gap-1">
            <Clock className="size-3" />
            {item.time}
          </span>
        </div>
        <div className="mt-1 flex flex-wrap gap-1">
          {item.genres.slice(0, 2).map((genre) => (
            <span
              key={genre}
              className="text-xs text-muted-foreground"
            >
              {genre}
            </span>
          ))}
        </div>
      </div>
    </Link>
  )
}

export function ScheduleSection() {
  return (
    <section className="py-8 lg:py-12">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="rounded-xl border border-border/50 bg-card/50 p-6">
          {/* Header */}
          <div className="mb-6 flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
              <Calendar className="size-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">
                Release Schedule
              </h2>
              <p className="text-sm text-muted-foreground">
                Upcoming episodes this week
              </p>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="today" className="w-full">
            <TabsList variant="line" className="mb-4 w-full justify-start">
              <TabsTrigger value="today">Today</TabsTrigger>
              <TabsTrigger value="tomorrow">Tomorrow</TabsTrigger>
              <TabsTrigger value="week">This Week</TabsTrigger>
            </TabsList>

            <TabsContent value="today" className="mt-0">
              <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                {scheduleData.today.map((item) => (
                  <ScheduleCard key={item.id} item={item} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="tomorrow" className="mt-0">
              <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                {scheduleData.tomorrow.map((item) => (
                  <ScheduleCard key={item.id} item={item} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="week" className="mt-0">
              <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                {scheduleData.week.map((item) => (
                  <ScheduleCard key={item.id} item={item} />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </section>
  )
}
