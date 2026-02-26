/* Payload admin page: re-exports from src. */
import type { Metadata } from 'next'
import config from '@payload-config'
import { RootPage, generatePageMetadata } from '@payloadcms/next/views'
import { importMap } from '../../admin/importMap'

type Args = {
  params: Promise<{
    segments?: string[]
  }>
  searchParams: Promise<{
    [key: string]: string | string[]
  }>
}

export const generateMetadata = async ({ params, searchParams }: Args): Promise<Metadata> => {
  const resolvedParams = await params
  const resolvedSearchParams = await searchParams
  // Пустой массив даёт path='/' в Payload → currentRoute='/admin/' ≠ adminRoute='/admin' → 404.
  // Передаём undefined при пустом пути, чтобы path=null → currentRoute='/admin'.
  const segs = resolvedParams?.segments
  const paramsWithSegments = { ...resolvedParams, segments: segs?.length ? segs : undefined }
  return generatePageMetadata({
    config,
    params: paramsWithSegments as unknown as Args['params'],
    searchParams: resolvedSearchParams as unknown as Args['searchParams'],
  })
}

export default async function Page({ params, searchParams }: Args) {
  const resolvedParams = await params
  const resolvedSearchParams = await searchParams
  const segs = resolvedParams?.segments
  const paramsWithSegments = { ...resolvedParams, segments: segs?.length ? segs : undefined }
  return RootPage({
    config,
    params: paramsWithSegments as unknown as Parameters<typeof RootPage>[0]['params'],
    searchParams: resolvedSearchParams as unknown as Parameters<typeof RootPage>[0]['searchParams'],
    importMap,
  })
}
