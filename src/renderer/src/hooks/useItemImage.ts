import { useEffect, useState } from 'react'
import { getCachedImage, loadImage } from '../imageCache'

export function useItemImage(uniqueName: string, imageName: string | undefined): string | null {
  const [src, setSrc] = useState<string | null>(() => getCachedImage(uniqueName) ?? null)

  useEffect(() => {
    const cached = getCachedImage(uniqueName)
    if (cached !== undefined) {
      setSrc(cached)
      return undefined
    }

    let active = true
    loadImage(uniqueName, imageName).then((result) => {
      if (active) setSrc(result)
    })
    return () => {
      active = false
    }
  }, [uniqueName, imageName])

  return src
}
