export interface GalleryImage {
  key: string
  url: string
  thumbUrl: string
  width?: number
  height?: number
  caption: string
  uploaded: string
}

interface GalleryResponse {
  images?: GalleryImage[]
}

export async function fetchGallery(signal?: AbortSignal): Promise<GalleryImage[]> {
  const response = await fetch('/api/gallery', { signal })
  if (!response.ok) {
    throw new Error(`Gallery request failed with ${response.status}`)
  }
  const body = (await response.json()) as GalleryResponse
  return body.images ?? []
}
