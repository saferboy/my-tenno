import { useEffect, useState } from 'react'
import { getCachedImage, loadImage } from '../imageCache'

export function useItemImage(imageName: string | undefined): string | null {
  const [src, setSrc] = useState<string | null>(() =>
    imageName ? (getCachedImage(imageName) ?? null) : null
  )

  useEffect(() => {
    if (!imageName) {
      setSrc(null)
      return undefined
    }

    const cached = getCachedImage(imageName)
    if (cached !== undefined) {
      setSrc(cached)
      return undefined
    }

    let active = true
    loadImage(imageName).then((result) => {
      if (active) setSrc(result)
    })
    return () => {
      active = false
    }
  }, [imageName])

  return src
}
