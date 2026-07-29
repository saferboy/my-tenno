// Renderer'dagi xotira-ichi kesh - virtualized grid'da karta scroll bilan
// qayta mount bo'lganda bir xil rasm uchun IPC'ga qayta murojaat qilmaslik
// uchun (disk-darajasidagi kesh main/imageCache.ts'da, bu esa shu sessiya
// davomida IPC chaqiruvlarini kamaytiradi).
const cache = new Map<string, string | null>()
const pending = new Map<string, Promise<string | null>>()

export function getCachedImage(imageName: string): string | null | undefined {
  return cache.get(imageName)
}

export function loadImage(imageName: string): Promise<string | null> {
  if (cache.has(imageName)) {
    return Promise.resolve(cache.get(imageName) ?? null)
  }

  const inFlight = pending.get(imageName)
  if (inFlight) return inFlight

  const promise = window.api.getItemImage(imageName).then((dataUri) => {
    cache.set(imageName, dataUri)
    pending.delete(imageName)
    return dataUri
  })

  pending.set(imageName, promise)
  return promise
}
