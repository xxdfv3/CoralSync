'use client'

import { useCallback, useEffect, useState } from 'react'
import { ImagePlus, Loader2Icon, Minus, Plus, Star } from 'lucide-react'

import { Button } from '@/shared/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'
import { Textarea } from '@/shared/ui/textarea'
import { cn } from '@/shared/lib/utils'
import {
  listDubbingStudiosForTitleType,
  listGenresForTitleType,
  type GenreOption,
} from '@/server/collections/actions'
import type { Collection, CollectionItem } from './useLocalCollections'
import { USER_TITLE_TYPE_OPTIONS, type UserTitleType } from './user-title-constants'

const STATUS_OPTIONS: { value: CollectionItem['status']; label: string }[] = [
  { value: 'planned', label: 'Запланировано' },
  { value: 'watching', label: 'Смотрю' },
  { value: 'completed', label: 'Просмотрено' },
  { value: 'on_hold', label: 'Отложено' },
  { value: 'dropped', label: 'Брошено' },
]

interface AddTitleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  collections: Collection[]
  defaultCollectionId: string | null
  onAdd: (
    item: Omit<CollectionItem, 'id' | 'collectionId'> & {
      titleType?: UserTitleType
      formatLabel?: string
      description?: string
    },
    collectionId: string
  ) => void | Promise<void>
}

const currentYear = new Date().getFullYear()

function StarRating({
  value,
  onChange,
}: {
  value: number
  onChange: (n: number) => void
}) {
  return (
    <div className="flex items-center gap-1" role="group" aria-label="Оценка по 5 звёздам">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          className={cn(
            'rounded p-0.5 transition-colors',
            n <= value ? 'text-amber-500' : 'text-muted-foreground/40 hover:text-muted-foreground'
          )}
          onClick={() => onChange(n)}
          aria-label={`${n} из 5`}
          aria-pressed={n <= value}
        >
          <Star className={cn('size-7', n <= value && 'fill-current')} strokeWidth={1.5} />
        </button>
      ))}
      <span className="text-muted-foreground ml-2 text-sm">{value}/5</span>
    </div>
  )
}

function EpisodeStepper({
  label,
  value,
  onChange,
  min,
  max,
}: {
  label: string
  value: number
  onChange: (n: number) => void
  min: number
  max: number
}) {
  const clamp = (n: number) => Math.min(max, Math.max(min, n))
  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      <div className="flex items-center rounded-md border border-border w-fit">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="rounded-r-none"
            onClick={() => onChange(clamp(value - 1))}
            aria-label="Минус один"
          >
            <Minus className="size-4" />
          </Button>
          <Input
            type="number"
            className="h-9 w-16 border-0 text-center [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
            min={min}
            max={max}
            value={value}
            onChange={(e) => onChange(clamp(parseInt(e.target.value, 10) || min))}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="rounded-l-none"
            onClick={() => onChange(clamp(value + 1))}
            aria-label="Плюс один"
          >
            <Plus className="size-4" />
          </Button>
        </div>
    </div>
  )
}

export function AddTitleDialog({
  open,
  onOpenChange,
  collections,
  defaultCollectionId,
  onAdd,
}: AddTitleDialogProps) {
  const [title, setTitle] = useState('')
  const [collectionId, setCollectionId] = useState<string>(defaultCollectionId ?? '')
  const [status, setStatus] = useState<CollectionItem['status']>('planned')
  const [year, setYear] = useState(currentYear.toString())
  const [seasonNumber, setSeasonNumber] = useState('')
  const [titleType, setTitleType] = useState<UserTitleType>('anime')
  const [dubbingStudioName, setDubbingStudioName] = useState<string>('')
  const [studioOptions, setStudioOptions] = useState<GenreOption[]>([])
  const [studiosLoading, setStudiosLoading] = useState(false)
  const [ratingStars, setRatingStars] = useState(3)
  const [selectedGenres, setSelectedGenres] = useState<string[]>([])
  const [genreOptions, setGenreOptions] = useState<GenreOption[]>([])
  const [genresLoading, setGenresLoading] = useState(false)
  const [description, setDescription] = useState('')
  const [coverUrl, setCoverUrl] = useState<string | null>(null)
  const [posterUploading, setPosterUploading] = useState(false)
  const [progressCurrent, setProgressCurrent] = useState(0)
  const [totalEpisodes, setTotalEpisodes] = useState(12)

  const effectiveCollectionId =
    collectionId || defaultCollectionId || collections[0]?.id || ''

  const loadGenres = useCallback(async (type: string) => {
    setGenresLoading(true)
    try {
      const list = await listGenresForTitleType(type)
      setGenreOptions(list)
      setSelectedGenres((prev) => prev.filter((g) => list.some((o) => o.name === g)))
    } catch {
      setGenreOptions([])
    } finally {
      setGenresLoading(false)
    }
  }, [])

  const loadStudios = useCallback(async (type: string) => {
    setStudiosLoading(true)
    try {
      const list = await listDubbingStudiosForTitleType(type)
      setStudioOptions(list)
    } catch {
      setStudioOptions([])
    } finally {
      setStudiosLoading(false)
    }
  }, [])

  useEffect(() => {
    if (open) {
      loadGenres(titleType)
      loadStudios(titleType)
    }
  }, [open, titleType, loadGenres, loadStudios])

  // Смена типа тайтла — сброс студии, если её нет в новом списке
  useEffect(() => {
    if (
      dubbingStudioName &&
      studioOptions.length > 0 &&
      !studioOptions.some((o) => o.name === dubbingStudioName)
    ) {
      setDubbingStudioName('')
    }
  }, [studioOptions, dubbingStudioName])

  function toggleGenre(name: string) {
    setSelectedGenres((prev) =>
      prev.includes(name) ? prev.filter((g) => g !== name) : [...prev, name]
    )
  }

  async function onPosterFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setPosterUploading(true)
    try {
      const body = new FormData()
      body.set('file', file)
      const res = await fetch('/api/user-titles/poster', {
        method: 'POST',
        body,
        credentials: 'include',
      })
      const data = (await res.json()) as { ok?: boolean; imageUrl?: string }
      if (res.ok && data.imageUrl) setCoverUrl(data.imageUrl)
    } finally {
      setPosterUploading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmedTitle = title.trim()
    if (!trimmedTitle || !effectiveCollectionId) return
    const yearNum = parseInt(year, 10) || currentYear
    const seasonStr = seasonNumber.trim() || '—'
    const genres = selectedGenres.length > 0 ? selectedGenres : ['—']
    try {
      await Promise.resolve(
        onAdd(
          {
            title: trimmedTitle,
            year: yearNum,
            season: seasonStr,
            type: dubbingStudioName || '—',
            titleType,
            formatLabel: dubbingStudioName || undefined,
            rating: String(ratingStars),
            genres,
            coverUrl,
            description: description.trim() || undefined,
            progressCurrent,
            progressTotal: totalEpisodes,
            totalEpisodes,
            status,
          },
          effectiveCollectionId
        )
      )
    } catch {
      // серверная ошибка
    }
    resetForm()
    onOpenChange(false)
  }

  function resetForm() {
    setTitle('')
    setYear(currentYear.toString())
    setSeasonNumber('')
    setTitleType('anime')
    setDubbingStudioName('')
    setRatingStars(3)
    setSelectedGenres([])
    setDescription('')
    setCoverUrl(null)
    setStatus('planned')
    setProgressCurrent(0)
    setTotalEpisodes(12)
  }

  function handleOpenChange(next: boolean) {
    if (next && defaultCollectionId) setCollectionId(defaultCollectionId)
    if (!next) resetForm()
    onOpenChange(next)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="flex max-h-[90vh] flex-col sm:max-w-lg">
        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <DialogHeader>
            <DialogTitle>Добавить тайтл</DialogTitle>
            <DialogDescription>
              Коллекция и статус — сверху. Постер загружается файлом. Оценка — по 5 звёздам.
            </DialogDescription>
          </DialogHeader>

          <div className="min-h-0 flex-1 overflow-y-auto">
            <div className="grid gap-4 py-4 pr-1">
              {/* Сверху: коллекция + статус */}
              {collections.length > 0 && (
                <div className="grid gap-2">
                  <Label>Коллекция</Label>
                  <Select
                    value={effectiveCollectionId || undefined}
                    onValueChange={setCollectionId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите коллекцию" />
                    </SelectTrigger>
                    <SelectContent>
                      {collections.map((col) => (
                        <SelectItem key={col.id} value={col.id}>
                          {col.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="grid gap-2">
                <Label>Статус в коллекции</Label>
                <Select
                  value={status}
                  onValueChange={(v) => setStatus(v as CollectionItem['status'])}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="title-name">Название *</Label>
                <Input
                  id="title-name"
                  placeholder="Как в каталоге"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  aria-required
                />
              </div>

              {/* Постер — загрузка файла */}
              <div className="grid gap-2">
                <Label>Постер</Label>
                <div className="flex flex-wrap items-center gap-3">
                  {coverUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={coverUrl}
                      alt=""
                      className="h-24 w-16 rounded-md border border-border object-cover"
                    />
                  )}
                  <div className="flex flex-col gap-2">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      className="hidden"
                      id="poster-file"
                      onChange={onPosterFile}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={posterUploading}
                      onClick={() => document.getElementById('poster-file')?.click()}
                    >
                      {posterUploading ? (
                        <Loader2Icon className="size-4 animate-spin" />
                      ) : (
                        <ImagePlus className="size-4" />
                      )}
                      <span className="ml-2">
                        {posterUploading ? 'Загрузка…' : coverUrl ? 'Заменить' : 'Загрузить постер'}
                      </span>
                    </Button>
                    {coverUrl && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground"
                        onClick={() => setCoverUrl(null)}
                      >
                        Убрать
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid gap-2">
                <Label>Тип тайтла</Label>
                <Select
                  value={titleType}
                  onValueChange={(v) => setTitleType(v as UserTitleType)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {USER_TITLE_TYPE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Студия озвучки</Label>
                  {studiosLoading ? (
                    <div className="text-muted-foreground flex items-center gap-2 text-sm py-2">
                      <Loader2Icon className="size-4 animate-spin" />
                      Загрузка…
                    </div>
                  ) : (
                    <Select
                      value={dubbingStudioName || '_none'}
                      onValueChange={(v) =>
                        setDubbingStudioName(v === '_none' ? '' : v)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Не указано" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="_none">Не указано</SelectItem>
                        {studioOptions.map((s) => (
                          <SelectItem key={s.id} value={s.name}>
                            {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  {studioOptions.length === 0 && !studiosLoading && (
                    <p className="text-muted-foreground text-xs">
                      Нет студий для этого типа — добавьте в «Студии озвучки» в админке.
                    </p>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="title-year">Год</Label>
                  <Input
                    id="title-year"
                    type="number"
                    min={1900}
                    max={2100}
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="title-season">Сезон (номер)</Label>
                <Input
                  id="title-season"
                  type="number"
                  inputMode="numeric"
                  placeholder="Напр. 1, 2…"
                  min={0}
                  value={seasonNumber}
                  onChange={(e) => setSeasonNumber(e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label>Оценка</Label>
                <StarRating value={ratingStars} onChange={setRatingStars} />
              </div>

              {/* Жанры из админки по типу тайтла */}
              <div className="grid gap-2">
                <Label>Жанры (из справочника)</Label>
                {genresLoading ? (
                  <div className="text-muted-foreground flex items-center gap-2 text-sm">
                    <Loader2Icon className="size-4 animate-spin" />
                    Загрузка…
                  </div>
                ) : genreOptions.length === 0 ? (
                  <p className="text-muted-foreground text-xs">
                    Нет жанров для этого типа в админке — добавьте в «Жанры» с привязкой к типу.
                  </p>
                ) : (
                  <div className="flex max-h-32 flex-wrap gap-2 overflow-y-auto rounded-md border border-border p-2">
                    {genreOptions.map((g) => {
                      const on = selectedGenres.includes(g.name)
                      return (
                        <button
                          key={g.id}
                          type="button"
                          onClick={() => toggleGenre(g.name)}
                          className={cn(
                            'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                            on
                              ? 'border-primary bg-primary/15 text-primary'
                              : 'border-border bg-muted/30 text-muted-foreground hover:bg-muted'
                          )}
                        >
                          {g.name}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="title-desc">Описание</Label>
                <Textarea
                  id="title-desc"
                  placeholder="Необязательно"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="resize-y"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <EpisodeStepper
                  label="Просмотрено серий"
                  value={progressCurrent}
                  onChange={setProgressCurrent}
                  min={0}
                  max={9999}
                />
                <EpisodeStepper
                  label="Всего серий"
                  value={totalEpisodes}
                  onChange={setTotalEpisodes}
                  min={1}
                  max={9999}
                />
              </div>
            </div>
          </div>

          <DialogFooter className="mt-4 shrink-0 border-t border-border pt-4">
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Отмена
            </Button>
            <Button type="submit" disabled={!title.trim() || !effectiveCollectionId}>
              Добавить
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
