// Renderer'dagi xotira-ichi kesh - virtualized grid'da karta scroll bilan
// qayta mount bo'lganda bir xil rasm uchun IPC'ga qayta murojaat qilmaslik
// uchun (disk-darajasidagi kesh main/imageCache.ts'da, bu esa shu sessiya
// davomida IPC chaqiruvlarini kamaytiradi).
const cache = new Map<string, string | null>()
const pending = new Map<string, Promise<string | null>>()

export function getCachedImage(uniqueName: string): string | null | undefined {
  return cache.get(uniqueName)
}

export function loadImage(uniqueName: string, imageName: string | undefined): Promise<string | null> {
  if (cache.has(uniqueName)) {
    return Promise.resolve(cache.get(uniqueName) ?? null)
  }

  const inFlight = pending.get(uniqueName)
  if (inFlight) return inFlight

  const promise = window.api.getItemImage(uniqueName, imageName).then((dataUri) => {
    cache.set(uniqueName, dataUri)
    pending.delete(uniqueName)
    return dataUri
  })

  pending.set(uniqueName, promise)
  return promise
}
