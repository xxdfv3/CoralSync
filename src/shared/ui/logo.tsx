'use client'

import Image from 'next/image'
import Link from 'next/link'

const LOGO_PATH = '/logo.svg'

type LogoProps = {
  /** Width in pixels (height scales if only width set). */
  width?: number
  /** Height in pixels. */
  height?: number
  /** Link to this URL; omit or null to render without link. */
  href?: string | null
  /** Optional class for the wrapper. */
  className?: string
  /** Priority loading (e.g. above the fold). */
  priority?: boolean
}

/**
 * CoralSync logo. Place your SVG file at public/logo.svg.
 * Use in header, home page, auth pages.
 */
export function Logo({
  width = 120,
  height,
  href = '/',
  className,
  priority = false,
}: LogoProps) {
  const img = (
    <Image
      src={LOGO_PATH}
      alt="CoralSync"
      width={width}
      height={height ?? width}
      priority={priority}
      className={className}
    />
  )

  if (href) {
    return (
      <Link href={href} className="inline-flex shrink-0" aria-label="CoralSync — на главную">
        {img}
      </Link>
    )
  }

  return <span className="inline-flex shrink-0">{img}</span>
}
