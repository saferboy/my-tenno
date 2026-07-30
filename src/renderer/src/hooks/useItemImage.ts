import { useEffect, useState } from 'react'
import { getCachedImage, loadImage } from '../imageCache'

export function useItemImage(uniqueName: string, imageName: string | undefined): string | null {
  const cached = getCachedImage(uniqueName)
  const [loaded, setLoaded] = useState<string | null>(null)

  useEffect(() => {
    if (getCachedImage(uniqueName) !== undefined) return undefined

    let active = true
    loadImage(uniqueName, imageName).then((result) => {
      if (active) setLoaded(result)
    })
    return () => {
      active = false
    }
  }, [uniqueName, imageName])

  return cached !== undefined ? cached : loaded
}
