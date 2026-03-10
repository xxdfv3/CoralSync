import { CollectionsContent } from '@/widgets/collections/CollectionsContent'
import { Footer } from '@/widgets/navigation/Footer'
import { Header } from '@/widgets/navigation/Header'

/**
 * Collections page composition (FSD views layer).
 * Страница пользовательских коллекций: списки аниме/фильмов/сериалов.
 */
export function CollectionsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background font-sans">
      <Header />

      <main className="flex flex-1 flex-col px-4 py-8 lg:px-8">
        <CollectionsContent />
      </main>

      <Footer />
    </div>
  )
}
