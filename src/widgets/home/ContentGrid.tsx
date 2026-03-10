'use client'

import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/shared/ui/button'

import { ContentCard, type ContentItem } from './ContentCard'

type ContentGridProps = {
  title: string
  viewAllHref?: string
  items: ContentItem[]
}

export function ContentGrid({ title, viewAllHref, items }: ContentGridProps) {
  return (
    <section className="py-8 lg:py-12">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground lg:text-2xl">
            {title}
          </h2>
          {viewAllHref && (
            <Button
              variant="ghost"
              size="sm"
              className="gap-1 text-muted-foreground"
              asChild
            >
              <Link href={viewAllHref}>
                View All
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          )}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {items.map((item) => (
            <ContentCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </section>
  )
}
