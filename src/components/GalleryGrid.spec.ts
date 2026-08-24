import "@vitest/browser/matchers"
import { expect, test } from 'vitest'
import { render } from 'vitest-browser-vue'
import GalleryGrid from './GalleryGrid.vue'
import type { GalleryImage } from '../gallery'

function image(overrides: Partial<GalleryImage> = {}): GalleryImage {
  return {
    key: 'photos/stockholm.webp',
    url: 'https://img.example.com/photos/stockholm.webp',
    thumbUrl: 'https://img.example.com/thumbs/stockholm.webp',
    width: 1600,
    height: 1067,
    caption: 'Stockholm, 2025',
    uploaded: '2026-01-02T00:00:00.000Z',
    ...overrides,
  }
}

test('should render a tile per image', async () => {
  const images = [
    image(),
    image({ key: 'photos/goteborg.webp', caption: 'Goteborg, 2024' }),
  ]

  const { getByAltText } = render(GalleryGrid, { props: { images } })

  await expect.element(getByAltText('Stockholm, 2025')).toBeInTheDocument()
  await expect.element(getByAltText('Goteborg, 2024')).toBeInTheDocument()
})

test('should fall back to generic alt text when a photo has no caption', async () => {
  const images = [image({ caption: '' })]

  const { getByAltText } = render(GalleryGrid, { props: { images } })

  await expect.element(getByAltText('Gallery photo')).toBeInTheDocument()
})
